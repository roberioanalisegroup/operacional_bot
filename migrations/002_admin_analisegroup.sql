-- Garante um utilizador admin (cria ou atualiza hash, role e estado).
-- Login: admin@analisegroup.cnt.br — para outro utilizador, edite username/display_name.

INSERT INTO users (username, display_name, password_hash, role, active, must_change_password)
VALUES (
    'admin@analisegroup.cnt.br',
    'Administrador',
    '$2b$12$FCK05ws6K2Bn4rk7w.xV6OjzViBmziWfJVR7o/bS87HAAP3W/JFba',
    'admin',
    true,
    false
)
ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    display_name = EXCLUDED.display_name,
    role = 'admin',
    active = true,
    must_change_password = EXCLUDED.must_change_password,
    updated_at = now();
