"""Application factory do backend Flask.

Responsável por instanciar o app, registrar blueprints, inicializar o pool
de conexões com o Supabase Postgres e garantir que o administrador padrão
exista na primeira execução.
"""
from __future__ import annotations

import logging
import os
from pathlib import Path

from flask import Flask, jsonify

from .config import Config
from .db import init_pool, close_pool, run_migrations, bootstrap_admin
from .routes_auth import bp as auth_bp
from .routes_admin import bp as admin_bp
from .static_routes import bp as static_bp


def create_app(config_class: type[Config] = Config) -> Flask:
    static_folder = Path(__file__).resolve().parent.parent / "static"
    app = Flask(
        __name__,
        static_folder=str(static_folder),
        static_url_path="/static",
    )
    app.config.from_object(config_class)

    _configure_logging(app)
    _register_error_handlers(app)

    # Conexão com Supabase Postgres
    init_pool(app.config["DATABASE_URL"])

    # Cria tabelas se não existirem (idempotente) e garante admin inicial.
    if app.config.get("AUTO_MIGRATE", True):
        try:
            run_migrations()
            bootstrap_admin(
                username=app.config["ADMIN_BOOTSTRAP_USERNAME"],
                password=app.config["ADMIN_BOOTSTRAP_PASSWORD"],
                display_name=app.config["ADMIN_BOOTSTRAP_DISPLAY_NAME"],
            )
        except Exception:
            app.logger.exception("Falha ao inicializar banco de dados.")
            raise

    # Rotas
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(static_bp)  # sem prefixo: serve "/" e arquivos

    @app.teardown_appcontext
    def _shutdown(_exc):
        # O pool é global; fechamento real acontece no atexit.
        return None

    @app.get("/healthz")
    def healthz():
        return jsonify({"status": "ok"})

    import atexit
    atexit.register(close_pool)

    return app


def _configure_logging(app: Flask) -> None:
    level = logging.DEBUG if app.config.get("DEBUG") else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )
    app.logger.setLevel(level)


def _register_error_handlers(app: Flask) -> None:
    @app.errorhandler(400)
    def _bad(err):
        return jsonify({"error": str(err.description) if hasattr(err, "description") else "Requisição inválida"}), 400

    @app.errorhandler(401)
    def _unauth(err):
        return jsonify({"error": "Não autenticado"}), 401

    @app.errorhandler(403)
    def _forbidden(err):
        return jsonify({"error": "Acesso negado"}), 403

    @app.errorhandler(404)
    def _nf(err):
        return jsonify({"error": "Recurso não encontrado"}), 404

    @app.errorhandler(500)
    def _oops(err):
        app.logger.exception("Erro interno", exc_info=err)
        return jsonify({"error": "Erro interno do servidor"}), 500
