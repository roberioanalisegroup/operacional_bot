"""Rotas que servem os arquivos estáticos (HTMLs das automações) e a SPA.

A proteção de quem pode ver o quê é feita 100% no frontend (auth-guard.js),
já que o navegador precisa acessar os HTMLs antes do JS rodar. A segurança
real está nas APIs /api/* que exigem JWT válido para qualquer dado.
"""
from __future__ import annotations

from pathlib import Path

from flask import Blueprint, abort, current_app, redirect, send_from_directory

bp = Blueprint("static_site", __name__)


def _static_dir() -> Path:
    # app.static_folder é configurado em create_app.
    return Path(current_app.static_folder)


@bp.get("/")
def index():
    return redirect("/index.html")


@bp.get("/<path:filename>")
def serve_any(filename: str):
    """Serve qualquer arquivo da pasta static/ (inclui HTMLs das automações)."""
    base = _static_dir()
    # Resolve evitando path traversal.
    candidate = (base / filename).resolve()
    try:
        candidate.relative_to(base.resolve())
    except ValueError:
        abort(404)
    if candidate.is_dir():
        # Se é uma pasta, tenta servir index.html interno (ex: Setor Fiscal/).
        inner = candidate / "index.html"
        if inner.exists():
            return send_from_directory(base, f"{filename.rstrip('/')}/index.html")
        abort(404)
    if not candidate.exists():
        abort(404)
    return send_from_directory(base, filename)
