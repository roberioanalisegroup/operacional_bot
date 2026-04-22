"""Utilitários de segurança: bcrypt, JWT e decorators de autorização."""
from __future__ import annotations

import datetime as dt
import functools
from typing import Callable, Optional

import bcrypt
import jwt
from flask import current_app, g, jsonify, request


# ---------------------------------------------------------------------------
# Senhas (bcrypt)
# ---------------------------------------------------------------------------

def hash_password(plain: str) -> str:
    if not plain or len(plain) < 6:
        raise ValueError("A senha precisa ter ao menos 6 caracteres.")
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except (ValueError, TypeError):
        return False


# ---------------------------------------------------------------------------
# JWT
# ---------------------------------------------------------------------------

def issue_token(*, user_id: str, username: str, role: str, display_name: str) -> tuple[str, dt.datetime]:
    cfg = current_app.config
    now = dt.datetime.now(tz=dt.timezone.utc)
    exp = now + dt.timedelta(hours=cfg["JWT_EXPIRES_HOURS"])
    payload = {
        "sub": user_id,
        "u": username,
        "r": role,
        "n": display_name,
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    token = jwt.encode(payload, cfg["JWT_SECRET"], algorithm=cfg["JWT_ALGORITHM"])
    return token, exp


def decode_token(token: str) -> Optional[dict]:
    cfg = current_app.config
    try:
        return jwt.decode(token, cfg["JWT_SECRET"], algorithms=[cfg["JWT_ALGORITHM"]])
    except jwt.PyJWTError:
        return None


def _extract_bearer() -> Optional[str]:
    header = request.headers.get("Authorization", "")
    if header.lower().startswith("bearer "):
        return header.split(None, 1)[1].strip() or None
    return None


# ---------------------------------------------------------------------------
# Decorators
# ---------------------------------------------------------------------------

def login_required(fn: Callable):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        token = _extract_bearer()
        if not token:
            return jsonify({"error": "Token ausente."}), 401
        payload = decode_token(token)
        if not payload:
            return jsonify({"error": "Token inválido ou expirado."}), 401
        g.current_user = payload
        return fn(*args, **kwargs)
    return wrapper


def admin_required(fn: Callable):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        token = _extract_bearer()
        if not token:
            return jsonify({"error": "Token ausente."}), 401
        payload = decode_token(token)
        if not payload:
            return jsonify({"error": "Token inválido ou expirado."}), 401
        if payload.get("r") != "admin":
            return jsonify({"error": "Acesso restrito ao administrador."}), 403
        g.current_user = payload
        return fn(*args, **kwargs)
    return wrapper
