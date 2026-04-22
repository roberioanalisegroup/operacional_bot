"""Rotas de autenticação do usuário final."""
from __future__ import annotations

import logging

from flask import Blueprint, g, jsonify, request

from .db import get_conn
from .security import (
    admin_required,
    hash_password,
    issue_token,
    login_required,
    verify_password,
)

logger = logging.getLogger(__name__)
bp = Blueprint("auth", __name__)


def _insert_log(cur, *, user_id, username, action):
    cur.execute(
        """
        INSERT INTO access_logs (user_id, username, action, ip, user_agent)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (
            user_id,
            username,
            action,
            request.headers.get("X-Forwarded-For", request.remote_addr or ""),
            (request.headers.get("User-Agent") or "")[:500],
        ),
    )


@bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username", "")).strip().lower()
    password = str(data.get("password", ""))
    if not username or not password:
        return jsonify({"error": "Informe usuário e senha."}), 400

    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            "SELECT id, username, display_name, password_hash, role, active, must_change_password "
            "FROM users WHERE username = %s",
            (username,),
        )
        user = cur.fetchone()
        # Valida credenciais sem vazar qual parte falhou.
        generic_err = ({"error": "Usuário ou senha inválidos."}, 401)
        if not user:
            return jsonify(generic_err[0]), generic_err[1]
        if not verify_password(password, user["password_hash"]):
            _insert_log(cur, user_id=user["id"], username=user["username"], action="login-failed")
            return jsonify(generic_err[0]), generic_err[1]
        if not user["active"]:
            return jsonify({"error": "Usuário desativado. Procure o administrador."}), 403

        token, exp = issue_token(
            user_id=str(user["id"]),
            username=user["username"],
            role=user["role"],
            display_name=user["display_name"],
        )
        _insert_log(cur, user_id=user["id"], username=user["username"], action="login")

        return jsonify(
            {
                "token": token,
                "expiresAt": exp.isoformat(),
                "user": {
                    "id": str(user["id"]),
                    "username": user["username"],
                    "displayName": user["display_name"],
                    "role": user["role"],
                    "mustChangePassword": user["must_change_password"],
                },
            }
        )


@bp.post("/logout")
@login_required
def logout():
    payload = g.current_user
    with get_conn() as conn, conn.cursor() as cur:
        _insert_log(cur, user_id=payload["sub"], username=payload["u"], action="logout")
    return jsonify({"ok": True})


@bp.get("/me")
@login_required
def me():
    """Retorna dados atualizados do usuário da sessão (ou 401 se desativado)."""
    payload = g.current_user
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            "SELECT id, username, display_name, role, active, must_change_password "
            "FROM users WHERE id = %s",
            (payload["sub"],),
        )
        user = cur.fetchone()
        if not user or not user["active"]:
            return jsonify({"error": "Sessão inválida."}), 401
        return jsonify(
            {
                "id": str(user["id"]),
                "username": user["username"],
                "displayName": user["display_name"],
                "role": user["role"],
                "mustChangePassword": user["must_change_password"],
            }
        )


@bp.post("/change-password")
@login_required
def change_password():
    data = request.get_json(silent=True) or {}
    current = str(data.get("currentPassword", ""))
    new = str(data.get("newPassword", ""))
    if len(new) < 6:
        return jsonify({"error": "A nova senha precisa ter ao menos 6 caracteres."}), 400

    payload = g.current_user
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            "SELECT id, username, password_hash FROM users WHERE id = %s",
            (payload["sub"],),
        )
        user = cur.fetchone()
        if not user or not verify_password(current, user["password_hash"]):
            return jsonify({"error": "Senha atual incorreta."}), 400
        new_hash = hash_password(new)
        cur.execute(
            "UPDATE users SET password_hash = %s, must_change_password = false, updated_at = now() "
            "WHERE id = %s",
            (new_hash, user["id"]),
        )
        _insert_log(cur, user_id=user["id"], username=user["username"], action="password-changed")
    return jsonify({"ok": True})
