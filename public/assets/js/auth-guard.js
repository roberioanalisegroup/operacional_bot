/*
  auth-guard.js - Script que protege uma página do projeto.

  Uso:
  - Em qualquer <head> de uma página protegida:
      <meta name="auth-root" content="/">  (caminho até a raiz onde está /login.html)
      <script src="/assets/js/auth.js"></script>
      <script src="/assets/js/auth-guard.js"></script>

  Fluxo:
   1. Verifica se existe um JWT válido no localStorage e se o backend reconhece (GET /api/auth/me).
   2. Se não for válido, redireciona imediatamente para login.html.
   3. Adiciona uma barra superior com nome do usuário, link para admin (se admin) e botão Sair.
*/
(function () {
  "use strict";

  if (!window.AnaliseAuth) {
    console.error("auth-guard.js: auth.js precisa ser carregado antes.");
    return;
  }

  function rootPath() {
    const meta = document.querySelector('meta[name="auth-root"]');
    return meta && meta.content ? meta.content : "";
  }

  async function run() {
    const payload = await window.AnaliseAuth.requireAuth({
      loginPath: rootPath() + "login.html",
    });
    if (!payload) return;
    mountTopBar(payload);
  }

  function mountTopBar(payload) {
    if (document.getElementById("analise-auth-bar")) return;
    const isAdmin = payload.r === "admin";
    const root = rootPath();

    const bar = document.createElement("div");
    bar.id = "analise-auth-bar";
    bar.innerHTML = `
      <style>
        #analise-auth-bar {
          position: sticky;
          top: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 18px;
          background: linear-gradient(90deg, #050505, #141414 60%, rgba(233,175,41,0.18));
          border-bottom: 1px solid rgba(233, 175, 41, 0.32);
          color: #f5f1e8;
          font-family: "Segoe UI", Arial, sans-serif;
          font-size: 0.88rem;
          box-shadow: 0 6px 18px rgba(0,0,0,0.35);
        }
        #analise-auth-bar .aab-left { display:flex; align-items:center; gap:10px; min-width:0; }
        #analise-auth-bar .aab-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #4ade80; box-shadow: 0 0 8px rgba(74,222,128,0.6);
        }
        #analise-auth-bar .aab-user { font-weight: 700; color: #fff7df; }
        #analise-auth-bar .aab-role {
          margin-left: 6px; padding: 2px 8px; border-radius: 999px;
          background: rgba(233,175,41,0.18); color: #f3cb70;
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
        }
        #analise-auth-bar .aab-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        #analise-auth-bar a.aab-btn, #analise-auth-bar button.aab-btn {
          display: inline-flex; align-items:center; gap:6px;
          padding: 6px 12px; border-radius: 999px;
          background: #1b1b1b; color: #fff7df;
          border: 1px solid rgba(233,175,41,0.32);
          text-decoration: none; font-weight: 600; font-size: 0.82rem;
          cursor: pointer; transition: all 0.15s ease;
        }
        #analise-auth-bar a.aab-btn:hover, #analise-auth-bar button.aab-btn:hover {
          border-color: #e9af29; background: #222;
        }
        #analise-auth-bar button.aab-logout {
          background: rgba(239, 68, 68, 0.14);
          border-color: rgba(239, 68, 68, 0.45);
          color: #fecaca;
        }
        #analise-auth-bar button.aab-logout:hover {
          background: rgba(239, 68, 68, 0.25); border-color: #ef4444;
        }
      </style>
      <div class="aab-left">
        <span class="aab-dot" title="Sessão ativa"></span>
        <span>Logado como <span class="aab-user"></span><span class="aab-role"></span></span>
      </div>
      <div class="aab-right">
        ${isAdmin ? `<a class="aab-btn" href="${root}admin.html">Painel do administrador</a>` : ""}
        <a class="aab-btn" href="${root}index.html">Central de setores</a>
        <button class="aab-btn aab-logout" type="button">Sair</button>
      </div>
    `;
    document.body.insertBefore(bar, document.body.firstChild);
    bar.querySelector(".aab-user").textContent = payload.n || payload.u;
    bar.querySelector(".aab-role").textContent = payload.r === "admin" ? "Admin" : "Usuário";
    bar.querySelector(".aab-logout").addEventListener("click", async () => {
      await window.AnaliseAuth.logout();
      window.location.href = root + "login.html";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
