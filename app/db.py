"""Acesso ao banco de dados (Supabase Postgres via psycopg3).

Implementação sem pool: cada requisição abre e fecha sua própria conexão.
Trocamos o ``ConnectionPool`` por ``psycopg.connect`` direto porque o
Supabase Transaction Pooler (porta 6543) apresenta comportamentos que
quebram o pool no lado do cliente:

* corta conexões ociosas silenciosamente, deixando o pool com conexões
  mortas e causando ``PoolTimeout`` depois de alguns minutos;
* não tolera prepared statements entre transações;
* o ``check_connection`` do ``psycopg_pool`` às vezes não detecta o
  estado inválido dessas conexões.

Para o tráfego deste portal (uso interno) abrir uma conexão por request
é perfeitamente aceitável: o custo extra é de alguns centenas de ms
apenas na primeira query de cada request — trivial para um sistema
administrativo, e compensado de sobra pela estabilidade.
"""
from __future__ import annotations

import logging
import socket
import time
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

import psycopg
from psycopg import Connection
from psycopg.rows import dict_row

from .security import hash_password

logger = logging.getLogger(__name__)

_dsn: str | None = None
MIGRATIONS_DIR = Path(__file__).resolve().parent.parent / "migrations"

CONNECT_TIMEOUT = 10       # segundos para estabelecer conexão TCP+TLS
STATEMENT_TIMEOUT_MS = 15_000  # teto de 15s por query (corta queries travadas)
MAX_ATTEMPTS = 3           # tentativas totais ao abrir conexão

_supabase_ipv4_notice_logged = False


def _effective_dsn(dsn: str) -> str:
    """Para ``db.*.supabase.co`` adiciona ``hostaddr`` com IPv4.

    Hospedagens como o Render frequentemente não têm rota IPv6 de saída; o DNS
    do Supabase pode devolver só AAAA e o connect falha com "Network is
    unreachable". O libpq usa ``hostaddr`` para o TCP e mantém ``host`` na URI
    para verificação TLS (certificado em ``*.supabase.co``).
    """
    global _supabase_ipv4_notice_logged
    try:
        parsed = urlparse(dsn)
    except Exception:
        return dsn
    host = (parsed.hostname or "").lower()
    if not host.startswith("db.") or not host.endswith(".supabase.co"):
        return dsn
    q = parse_qs(parsed.query, keep_blank_values=True)
    if any(k.lower() == "hostaddr" for k in q):
        return dsn
    port = parsed.port or 5432
    try:
        infos = socket.getaddrinfo(host, port, socket.AF_INET, socket.SOCK_STREAM)
    except OSError as err:
        logger.warning(
            "Não foi possível resolver %s em IPv4 (%s); usando DSN sem hostaddr.",
            host,
            err,
        )
        return dsn
    if not infos:
        return dsn
    ipv4 = infos[0][4][0]
    q["hostaddr"] = [ipv4]
    new_query = urlencode(q, doseq=True)
    out = urlunparse(
        (parsed.scheme, parsed.netloc, parsed.path, parsed.params, new_query, parsed.fragment)
    )
    if not _supabase_ipv4_notice_logged:
        logger.info(
            "Supabase conexão direta: usando hostaddr=%s para host=%s (IPv4; evita IPv6 sem rota).",
            ipv4,
            host,
        )
        _supabase_ipv4_notice_logged = True
    return out


def init_pool(dsn: str, *, min_size: int = 0, max_size: int = 0) -> None:
    """Mantém o nome ``init_pool`` por compatibilidade com ``app/__init__.py``.

    Apenas valida o DSN e testa a conexão com o banco uma vez no boot,
    para falhar cedo se as credenciais estiverem erradas. Os parâmetros
    ``min_size`` e ``max_size`` foram mantidos na assinatura mas não são
    mais usados (sem pool).
    """
    global _dsn
    if _dsn is not None:
        return
    if not dsn:
        raise RuntimeError("DATABASE_URL não definida.")
    logger.info("Testando conexão com o Postgres (sem pool).")
    effective = _effective_dsn(dsn)
    with psycopg.connect(effective, connect_timeout=CONNECT_TIMEOUT) as probe:
        with probe.cursor() as cur:
            cur.execute("SELECT 1")
    _dsn = dsn
    logger.info("Conexão com Postgres validada.")


def close_pool() -> None:
    """Mantido por compatibilidade; não há pool para fechar."""
    global _dsn
    _dsn = None


def _open_connection() -> Connection:
    """Abre uma conexão nova com retry exponencial em falhas transientes."""
    assert _dsn is not None
    last_err: Exception | None = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            conn = psycopg.connect(
                _effective_dsn(_dsn),
                row_factory=dict_row,
                autocommit=False,
                connect_timeout=CONNECT_TIMEOUT,
                prepare_threshold=None,
                options=f"-c statement_timeout={STATEMENT_TIMEOUT_MS}",
            )
            return conn
        except (psycopg.OperationalError, psycopg.DatabaseError) as err:
            last_err = err
            if attempt >= MAX_ATTEMPTS:
                break
            delay = 0.4 * (2 ** (attempt - 1))
            logger.warning(
                "Falha ao conectar no Postgres (tentativa %d/%d): %s. Retry em %.1fs.",
                attempt, MAX_ATTEMPTS, err, delay,
            )
            time.sleep(delay)
    logger.error("Não foi possível conectar ao Postgres após %d tentativas.", MAX_ATTEMPTS)
    raise last_err  # type: ignore[misc]


@contextmanager
def get_conn() -> Iterator[Connection]:
    """Contexto que entrega uma conexão dedicada por request.

    Faz commit automático se o bloco finalizar sem erro e rollback caso
    contrário. A conexão é sempre fechada ao final.
    """
    if _dsn is None:
        raise RuntimeError("Banco não inicializado. Chame init_pool() primeiro.")
    conn = _open_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        try:
            conn.rollback()
        except Exception:
            logger.exception("Erro ao fazer rollback.")
        raise
    finally:
        try:
            conn.close()
        except Exception:
            logger.exception("Erro ao fechar conexão.")


def run_migrations() -> None:
    """Executa todos os arquivos .sql da pasta migrations/ em ordem alfabética.

    Idempotente: cada arquivo DEVE usar CREATE TABLE IF NOT EXISTS etc.
    """
    files = sorted(MIGRATIONS_DIR.glob("*.sql"))
    if not files:
        logger.warning("Nenhuma migração encontrada em %s", MIGRATIONS_DIR)
        return
    logger.info("Aplicando %d migração(ões).", len(files))
    with get_conn() as conn, conn.cursor() as cur:
        for f in files:
            logger.info(" → %s", f.name)
            cur.execute(f.read_text(encoding="utf-8"))


def bootstrap_admin(*, username: str, password: str, display_name: str) -> None:
    """Cria um admin inicial apenas se não houver nenhum admin ativo no banco."""
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("SELECT COUNT(*) AS c FROM users WHERE role = 'admin' AND active = true")
        row = cur.fetchone()
        if row and row["c"] > 0:
            return
        logger.warning("Nenhum admin ativo encontrado. Criando '%s' com senha bootstrap.", username)
        password_hash = hash_password(password)
        cur.execute(
            """
            INSERT INTO users (username, display_name, password_hash, role, active, must_change_password)
            VALUES (%s, %s, %s, 'admin', true, true)
            ON CONFLICT (username) DO UPDATE
                SET password_hash = EXCLUDED.password_hash,
                    active = true,
                    role = 'admin',
                    must_change_password = true,
                    updated_at = now()
            """,
            (username.lower(), display_name, password_hash),
        )
