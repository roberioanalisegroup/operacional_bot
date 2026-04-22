-- Schema inicial do sistema de autenticação.
-- Execução idempotente: pode ser rodado quantas vezes forem necessárias.

-- ---------------------------------------------------------------------------
-- Usuários
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    username             TEXT        NOT NULL UNIQUE,
    display_name         TEXT        NOT NULL,
    password_hash        TEXT        NOT NULL,
    role                 TEXT        NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    active               BOOLEAN     NOT NULL DEFAULT TRUE,
    must_change_password BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_role_active ON users (role, active);

-- ---------------------------------------------------------------------------
-- Logs de acesso
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS access_logs (
    id         BIGSERIAL   PRIMARY KEY,
    user_id    UUID        REFERENCES users(id) ON DELETE SET NULL,
    username   TEXT        NOT NULL,
    action     TEXT        NOT NULL,
    ip         TEXT,
    user_agent TEXT,
    at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_logs_at ON access_logs (at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_user ON access_logs (user_id);

-- Limpa logs antigos automaticamente via job externo (opcional).
-- Este arquivo é apenas DDL idempotente.
