"""Acesso ao banco de dados (Supabase Postgres via psycopg3 + pool)."""
from __future__ import annotations

import logging
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from psycopg import Connection
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

from .security import hash_password

logger = logging.getLogger(__name__)

_pool: ConnectionPool | None = None
MIGRATIONS_DIR = Path(__file__).resolve().parent.parent / "migrations"


def init_pool(dsn: str, *, min_size: int = 1, max_size: int = 5) -> None:
    """Cria o pool de conexões global. Chame uma vez na inicialização do app."""
    global _pool
    if _pool is not None:
        return
    if not dsn:
        raise RuntimeError("DATABASE_URL não definida.")
    logger.info("Inicializando pool de conexões com o Postgres.")
    _pool = ConnectionPool(
        conninfo=dsn,
        min_size=min_size,
        max_size=max_size,
        kwargs={"row_factory": dict_row, "autocommit": False},
        open=True,
    )
    # Aguarda pool ficar pronto para capturar erros de conexão cedo.
    _pool.wait(timeout=10)


def close_pool() -> None:
    global _pool
    if _pool is not None:
        logger.info("Fechando pool de conexões.")
        _pool.close()
        _pool = None


@contextmanager
def get_conn() -> Iterator[Connection]:
    if _pool is None:
        raise RuntimeError("Pool não inicializado. Chame init_pool() primeiro.")
    with _pool.connection() as conn:
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise


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
