/*
  auth.js - Cliente de autenticação que conversa com o backend Flask.
  Mantém a API global AnaliseAuth.* compatível com a versão anterior (frontend-only),
  mas agora tudo é validado no servidor via JWT.
*/
(function (global) {
  "use strict";

  const TOKEN_KEY = "analise_token_v2";
  const USER_KEY = "analise_user_v2";
  const API_BASE = "/api";

  // --------------------------------------------------------------------
  // HTTP helper
  // --------------------------------------------------------------------

  async function api(path, { method = "GET", body, auth = true } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (auth) {
      const token = readToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    let resp;
    try {
      resp = await fetch(API_BASE + path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: "same-origin",
      });
    } catch (err) {
      throw new Error("Falha de conexão com o servidor. Verifique sua rede.");
    }
    let data = null;
    try { data = await resp.json(); } catch (_) {}
    if (!resp.ok) {
      const msg = (data && data.error) || `Erro ${resp.status}`;
      const error = new Error(msg);
      error.status = resp.status;
      throw error;
    }
    return data;
  }

  // --------------------------------------------------------------------
  // Sessão local (localStorage)
  // --------------------------------------------------------------------

  function readToken() {
    try { return localStorage.getItem(TOKEN_KEY); } catch (_) { return null; }
  }
  function writeToken(token) {
    try { localStorage.setItem(TOKEN_KEY, token); } catch (_) {}
  }
  function clearToken() {
    try { localStorage.removeItem(TOKEN_KEY); } catch (_) {}
    try { localStorage.removeItem(USER_KEY); } catch (_) {}
  }
  function readUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }
  function writeUser(user) {
    try { localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch (_) {}
  }

  // Decodifica payload do JWT apenas para leitura rápida de exp/role/name.
  function decodeJwt(token) {
    if (!token || typeof token !== "string" || !token.includes(".")) return null;
    try {
      const parts = token.split(".");
      const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const pad = payload.length % 4 ? "=".repeat(4 - (payload.length % 4)) : "";
      const json = decodeURIComponent(escape(atob(payload + pad)));
      return JSON.parse(json);
    } catch (_) { return null; }
  }

  // --------------------------------------------------------------------
  // API pública
  // --------------------------------------------------------------------

  async function login(username, password) {
    try {
      const res = await api("/auth/login", {
        method: "POST",
        body: { username, password },
        auth: false,
      });
      writeToken(res.token);
      writeUser(res.user);
      return { ok: true, user: res.user };
    } catch (err) {
      return { ok: false, error: err.message || "Erro ao autenticar." };
    }
  }

  async function logout() {
    try { await api("/auth/logout", { method: "POST" }); } catch (_) {}
    clearToken();
  }

  async function getCurrentSession() {
    const token = readToken();
    if (!token) return null;
    const payload = decodeJwt(token);
    if (!payload || !payload.exp) { clearToken(); return null; }
    if (Date.now() / 1000 > payload.exp) { clearToken(); return null; }
    // Retorna o payload compatível com o formato antigo.
    return {
      token,
      payload: {
        u: payload.u,
        r: payload.r,
        n: payload.n,
        exp: payload.exp * 1000,
      },
    };
  }

  async function requireAuth(options = {}) {
    const session = await getCurrentSession();
    if (!session) {
      redirectToLogin(options.loginPath);
      return null;
    }
    // Valida com o servidor em segundo plano - se falhar, desloga.
    try {
      const me = await api("/auth/me");
      writeUser(me);
    } catch (err) {
      if (err.status === 401) {
        clearToken();
        redirectToLogin(options.loginPath);
        return null;
      }
      // erros 5xx não deslogam (problema temporário).
    }
    return session.payload;
  }

  async function requireAdmin(options = {}) {
    const payload = await requireAuth(options);
    if (!payload) return null;
    if (payload.r !== "admin") {
      alert("Acesso restrito ao administrador.");
      window.location.href = options.fallbackPath || rootPath() + "index.html";
      return null;
    }
    return payload;
  }

  function redirectToLogin(customPath) {
    const path = customPath || rootPath() + "login.html";
    window.location.href = path;
  }

  function rootPath() {
    const meta = document.querySelector('meta[name="auth-root"]');
    return meta && meta.content ? meta.content : "";
  }

  async function changeOwnPassword(currentPassword, newPassword) {
    return api("/auth/change-password", {
      method: "POST",
      body: { currentPassword, newPassword },
    });
  }

  // --------------------------------------------------------------------
  // Gestão de usuários (admin)
  // --------------------------------------------------------------------

  async function listUsers() {
    const res = await api("/admin/users");
    return res.users || [];
  }

  async function createUser({ username, displayName, password, role }) {
    return api("/admin/users", {
      method: "POST",
      body: { username, displayName, password, role },
    });
  }

  async function updateUser(id, patch) {
    return api(`/admin/users/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: patch,
    });
  }

  async function deleteUser(id) {
    return api(`/admin/users/${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  async function setActive(id, active) {
    return updateUser(id, { active: !!active });
  }

  async function resetPassword(id, newPassword) {
    return api(`/admin/users/${encodeURIComponent(id)}/reset-password`, {
      method: "POST",
      body: { newPassword },
    });
  }

  async function listLogs(limit = 200) {
    const res = await api(`/admin/logs?limit=${encodeURIComponent(limit)}`);
    return res.logs || [];
  }

  async function clearLogs() {
    return api("/admin/logs", { method: "DELETE" });
  }

  // --------------------------------------------------------------------
  // Compatibilidade com versão anterior
  // --------------------------------------------------------------------

  async function ensureInitialized() { /* noop - agora o bootstrap é no servidor */ }

  function propagateTokenToLinks() {
    // Não é mais necessário (JWT vai no header Authorization), mas mantemos
    // a função vazia para manter compatibilidade com o auth-guard.
  }

  // --------------------------------------------------------------------
  // Exposição
  // --------------------------------------------------------------------

  global.AnaliseAuth = {
    login,
    logout,
    getCurrentSession,
    requireAuth,
    requireAdmin,
    redirectToLogin,
    propagateTokenToLinks,
    changeOwnPassword,
    listUsers,
    createUser,
    updateUser,
    deleteUser,
    setActive,
    resetPassword,
    listLogs,
    clearLogs,
    ensureInitialized,
  };
})(window);
