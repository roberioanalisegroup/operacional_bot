"""Rotas que servem os arquivos estáticos (HTMLs das automações) e a SPA.

A proteção de quem pode ver o quê é feita 100% no frontend (auth-guard.js),
já que o navegador precisa acessar os HTMLs antes do JS rodar. A segurança
real está nas APIs /api/* que exigem JWT válido para qualquer dado.
"""
from __future__ import annotations

import unicodedata
from pathlib import Path

from flask import Blueprint, abort, current_app, redirect, send_from_directory

bp = Blueprint("static_site", __name__)


def _static_dir() -> Path:
    # app.static_folder é configurado em create_app.
    return Path(current_app.static_folder)


def _unicode_path_variants(filename: str) -> list[str]:
    """Gera variantes NFC/NFD do path (Linux vs macOS/Windows em nomes com acentos)."""
    seen: set[str] = set()
    out: list[str] = []
    for raw in (
        filename,
        unicodedata.normalize("NFC", filename),
        unicodedata.normalize("NFD", filename),
    ):
        if raw not in seen:
            seen.add(raw)
            out.append(raw)
    return out


def _resolve_static_file(base: Path, filename: str) -> str | None:
    """Devolve o caminho relativo (posix) dentro de ``base`` ou None se não existir."""
    base_r = base.resolve()
    for variant in _unicode_path_variants(filename):
        try:
            candidate = (base_r / variant).resolve()
        except OSError:
            continue
        try:
            candidate.relative_to(base_r)
        except ValueError:
            continue
        if candidate.is_file():
            return candidate.relative_to(base_r).as_posix()
        if candidate.is_dir():
            inner = (candidate / "index.html").resolve()
            try:
                inner.relative_to(base_r)
            except ValueError:
                continue
            if inner.is_file():
                return inner.relative_to(base_r).as_posix()
    return None


@bp.get("/")
def index():
    return redirect("/index.html")


@bp.get("/<path:filename>")
def serve_any(filename: str):
    """Serve qualquer arquivo da pasta static/ (inclui HTMLs das automações).

    IMPORTANTE: paths começando com "api/" ou "healthz" são reservados para
    as rotas da API e do healthcheck — o catch-all NÃO deve interceptá-los,
    senão métodos não-GET (POST/DELETE/PATCH) retornam 405 em vez de serem
    roteados corretamente.
    """
    if filename.startswith(("api/", "healthz")):
        abort(404)

    base = _static_dir()
    rel = _resolve_static_file(base, filename)
    if rel is None:
        abort(404)
    return send_from_directory(base, rel)
