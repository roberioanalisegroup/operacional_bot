"""Rotas restritas ao administrador."""
from __future__ import annotations

import logging

from flask import Blueprint, g, jsonify, request

from .db import get_conn
from .security import admin_required, hash_password

logger = logging.getLogger(__name__)
bp = Blueprint("admin", __name__)


def _user_row_to_dict(row: dict) -> dict:
    return {
        "id": str(row["id"]),
        "username": row["username"],
        "displayName": row["display_name"],
        "role": row["role"],
        "active": row["active"],
        "mustChangePassword": row["must_change_password"],
        "createdAt": row["created_at"].isoformat() if row["created_at"] else None,
        "updatedAt": row["updated_at"].isoformat() if row["updated_at"] else None,
    }


def _log(cur, *, user_id, username, action):
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


# ---------------------------------------------------------------------------
# Usuários
# ---------------------------------------------------------------------------

@bp.get("/users")
@admin_required
def list_users():
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            "SELECT id, username, display_name, role, active, must_change_password, "
            "created_at, updated_at FROM users ORDER BY created_at DESC"
        )
        users = [_user_row_to_dict(r) for r in cur.fetchall()]
    return jsonify({"users": users})


@bp.post("/users")
@admin_required
def create_user():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username", "")).strip().lower()
    display_name = str(data.get("displayName", "")).strip() or username
    password = str(data.get("password", ""))
    role = "admin" if str(data.get("role", "user")) == "admin" else "user"

    if not username:
        return jsonify({"error": "Informe um nome de usuário."}), 400
    if len(password) < 6:
        return jsonify({"error": "A senha precisa ter ao menos 6 caracteres."}), 400

    password_hash = hash_password(password)

    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("SELECT 1 FROM users WHERE username = %s", (username,))
        if cur.fetchone():
            return jsonify({"error": "Já existe um usuário com esse nome."}), 409
        cur.execute(
            """
            INSERT INTO users (username, display_name, password_hash, role, active, must_change_password)
            VALUES (%s, %s, %s, %s, true, false)
            RETURNING id, username, display_name, role, active, must_change_password, created_at, updated_at
            """,
            (username, display_name, password_hash, role),
        )
        new_user = cur.fetchone()
        _log(cur, user_id=g.current_user["sub"], username=g.current_user["u"], action=f"created:{username}")
    return jsonify(_user_row_to_dict(new_user)), 201


@bp.patch("/users/<user_id>")
@admin_required
def update_user(user_id: str):
    data = request.get_json(silent=True) or {}
    fields = []
    values: list = []

    if "displayName" in data:
        fields.append("display_name = %s")
        values.append(str(data["displayName"]).strip())
    if "role" in data:
        role = "admin" if data["role"] == "admin" else "user"
        fields.append("role = %s")
        values.append(role)
    if "active" in data:
        fields.append("active = %s")
        values.append(bool(data["active"]))
    if "password" in data and data["password"]:
        password = str(data["password"])
        if len(password) < 6:
            return jsonify({"error": "A senha precisa ter ao menos 6 caracteres."}), 400
        fields.append("password_hash = %s")
        values.append(hash_password(password))
        # quando senha é trocada via admin, opcionalmente força nova troca
        fields.append("must_change_password = %s")
        values.append(bool(data.get("mustChangePassword", True)))

    if not fields:
        return jsonify({"error": "Nenhum campo enviado para atualização."}), 400

    fields.append("updated_at = now()")
    values.append(user_id)

    with get_conn() as conn, conn.cursor() as cur:
        # Impede rebaixar o último admin ativo.
        if any(f.startswith("role") or f.startswith("active") for f in fields):
            cur.execute(
                "SELECT role, active FROM users WHERE id = %s",
                (user_id,),
            )
            existing = cur.fetchone()
            if not existing:
                return jsonify({"error": "Usuário não encontrado."}), 404

        cur.execute(
            f"UPDATE users SET {', '.join(fields)} WHERE id = %s "
            f"RETURNING id, username, display_name, role, active, must_change_password, "
            f"created_at, updated_at",
            values,
        )
        updated = cur.fetchone()
        if not updated:
            return jsonify({"error": "Usuário não encontrado."}), 404

        cur.execute(
            "SELECT COUNT(*) AS c FROM users WHERE role = 'admin' AND active = true"
        )
        remaining = cur.fetchone()["c"]
        if remaining == 0:
            conn.rollback()
            return jsonify({"error": "Operação bloqueada: precisa existir ao menos 1 admin ativo."}), 409

        _log(cur, user_id=g.current_user["sub"], username=g.current_user["u"],
             action=f"updated:{updated['username']}")
    return jsonify(_user_row_to_dict(updated))


@bp.delete("/users/<user_id>")
@admin_required
def delete_user(user_id: str):
    if user_id == g.current_user["sub"]:
        return jsonify({"error": "Você não pode remover a si mesmo."}), 409

    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("SELECT username, role FROM users WHERE id = %s", (user_id,))
        target = cur.fetchone()
        if not target:
            return jsonify({"error": "Usuário não encontrado."}), 404
        if target["role"] == "admin":
            cur.execute(
                "SELECT COUNT(*) AS c FROM users WHERE role = 'admin' AND active = true AND id <> %s",
                (user_id,),
            )
            if cur.fetchone()["c"] == 0:
                return jsonify({"error": "Não é possível remover o último administrador ativo."}), 409
        cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
        _log(cur, user_id=g.current_user["sub"], username=g.current_user["u"],
             action=f"deleted:{target['username']}")
    return jsonify({"ok": True})


@bp.post("/users/<user_id>/reset-password")
@admin_required
def reset_password(user_id: str):
    data = request.get_json(silent=True) or {}
    new_pwd = str(data.get("newPassword", ""))
    if len(new_pwd) < 6:
        return jsonify({"error": "A senha precisa ter ao menos 6 caracteres."}), 400

    new_hash = hash_password(new_pwd)
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            "UPDATE users SET password_hash = %s, must_change_password = true, updated_at = now() "
            "WHERE id = %s RETURNING username",
            (new_hash, user_id),
        )
        row = cur.fetchone()
        if not row:
            return jsonify({"error": "Usuário não encontrado."}), 404
        _log(cur, user_id=g.current_user["sub"], username=g.current_user["u"],
             action=f"reset-password:{row['username']}")
    return jsonify({"ok": True})


# ---------------------------------------------------------------------------
# Logs
# ---------------------------------------------------------------------------

@bp.get("/logs")
@admin_required
def list_logs():
    limit = min(int(request.args.get("limit", "200")), 1000)
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            "SELECT id, user_id, username, action, ip, user_agent, at "
            "FROM access_logs ORDER BY at DESC LIMIT %s",
            (limit,),
        )
        rows = cur.fetchall()
    logs = [
        {
            "id": r["id"],
            "user": r["username"],
            "action": r["action"],
            "ip": r["ip"],
            "userAgent": r["user_agent"],
            "at": r["at"].isoformat() if r["at"] else None,
        }
        for r in rows
    ]
    return jsonify({"logs": logs})


@bp.delete("/logs")
@admin_required
def clear_logs():
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("DELETE FROM access_logs")
        _log(cur, user_id=g.current_user["sub"], username=g.current_user["u"], action="logs-cleared")
    return jsonify({"ok": True})
