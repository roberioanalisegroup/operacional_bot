"""Carrega configuração a partir de variáveis de ambiente."""
from __future__ import annotations

import os
import secrets
from pathlib import Path

try:
    # Carrega .env somente em desenvolvimento; em produção o provedor injeta env vars.
    from dotenv import load_dotenv
    _env_path = Path(__file__).resolve().parent.parent / ".env"
    if _env_path.exists():
        load_dotenv(_env_path)
except Exception:  # pragma: no cover - dotenv é opcional
    pass


def _required(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(
            f"Variável de ambiente obrigatória '{name}' não está definida. "
            "Configure no .env local ou nas variáveis de ambiente do provedor (Render, Vercel, etc.)."
        )
    return value


class Config:
    # App
    DEBUG = os.getenv("FLASK_DEBUG", "0") in ("1", "true", "True")
    SECRET_KEY = os.getenv("SECRET_KEY") or secrets.token_urlsafe(32)

    # Banco (Supabase Postgres) - pegue em Project Settings > Database > Connection string (URI)
    # Obs.: para hospedagem use o "Connection pooling" (porta 6543) do Supabase.
    DATABASE_URL = (os.getenv("DATABASE_URL") or "").strip()

    # JWT
    JWT_SECRET = os.getenv("JWT_SECRET") or SECRET_KEY
    JWT_ALGORITHM = "HS256"
    JWT_EXPIRES_HOURS = int(os.getenv("JWT_EXPIRES_HOURS", "8"))

    # Admin padrão (criado só se não existir nenhum admin no banco)
    ADMIN_BOOTSTRAP_USERNAME = os.getenv("ADMIN_BOOTSTRAP_USERNAME", "admin")
    ADMIN_BOOTSTRAP_PASSWORD = os.getenv("ADMIN_BOOTSTRAP_PASSWORD", "admin@2026")
    ADMIN_BOOTSTRAP_DISPLAY_NAME = os.getenv("ADMIN_BOOTSTRAP_DISPLAY_NAME", "Administrador")

    # Migrações automáticas na inicialização
    AUTO_MIGRATE = os.getenv("AUTO_MIGRATE", "1") not in ("0", "false", "False")

    # CORS - permitir apenas a origem da própria aplicação
    ALLOWED_ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]

    def __init__(self) -> None:
        if not Config.DATABASE_URL:
            _required("DATABASE_URL")
