# Central de Setores — Análise Group

Plataforma interna que reúne as automações operacionais da empresa (Fiscal,
Pessoal e Contábil) atrás de um login seguro.

- **Frontend:** HTML + JavaScript puro (sem frameworks) com as automações
  existentes executando no navegador do usuário.
- **Backend:** Flask servindo os estáticos e a API de autenticação.
- **Banco:** PostgreSQL gerenciado no Supabase.
- **Deploy:** Render (plano gratuito).

---

## Sumário

1. [Estrutura do projeto](#estrutura-do-projeto)
2. [Como rodar localmente](#como-rodar-localmente)
3. [Deploy em produção](#deploy-em-produção)
   - [3.1. Preparar o Supabase](#31-preparar-o-supabase)
   - [3.2. Publicar no GitHub (repo privado)](#32-publicar-no-github-repo-privado)
   - [3.3. Deploy no Render](#33-deploy-no-render)
4. [Primeiro acesso e credenciais](#primeiro-acesso-e-credenciais)
5. [Como proteger uma nova página](#como-proteger-uma-nova-página)
6. [API interna (para referência)](#api-interna)
7. [Segurança e limites](#segurança-e-limites)

---

## Estrutura do projeto

```
automacoes_operacional/
├── app/                   # Backend Flask (factory, rotas, segurança)
├── static/                # HTMLs da central de setores e as automações
│   ├── index.html
│   ├── login.html
│   ├── admin.html
│   ├── assets/js/
│   ├── Setor Fiscal/
│   ├── Setor Pessoal/
│   └── Setor Contábil/
├── migrations/            # Scripts SQL aplicados no Supabase
├── requirements.txt
├── wsgi.py                # Entrada do Gunicorn
├── render.yaml            # Blueprint de deploy do Render
├── Procfile
├── runtime.txt            # Versão do Python
├── .env.example           # Modelo de variáveis de ambiente
└── docs/                  # Documentação auxiliar
```

---

## Como rodar localmente

### Pré-requisitos

- Python 3.12
- Conta e projeto no Supabase (ver seção [3.1](#31-preparar-o-supabase))

### Passo a passo

```powershell
# 1. Criar e ativar ambiente virtual
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 2. Instalar dependências
pip install -r requirements.txt

# 3. Copiar modelo de variáveis e preencher com seus valores
Copy-Item .env.example .env
# edite .env e preencha DATABASE_URL, JWT_SECRET etc.

# 4. Rodar a aplicação
python wsgi.py
```

A aplicação sobe em `http://localhost:5000`. Navegue até lá — você será
redirecionado para a tela de login.

> Na primeira execução, o backend cria automaticamente as tabelas no Supabase
> e, se ainda não existir nenhum administrador, cria um usuário `admin` com a
> senha definida em `ADMIN_BOOTSTRAP_PASSWORD`.

---

## Deploy em produção

### 3.1. Preparar o Supabase

1. Acesse <https://app.supabase.com> e abra (ou crie) seu projeto.
2. No menu lateral vá em **Project Settings → Database → Connection string**.
3. Copie a URL do modo **Transaction pooler** (porta **6543**). Ela tem a forma:

   ```
   postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
   ```

4. Guarde essa string — será a `DATABASE_URL`. Substitua `[YOUR-PASSWORD]`
   pela senha do banco (definida na criação do projeto).
5. (Opcional) As tabelas são criadas automaticamente na primeira execução do
   Flask. Se preferir criar manualmente, abra **SQL Editor** e execute o
   conteúdo de [`migrations/001_schema.sql`](./migrations/001_schema.sql).

### 3.2. Publicar no GitHub (repo privado)

```powershell
# Na raiz do projeto
git init
git add .
git commit -m "Sistema com login, backend Flask e integração Supabase"

# Cria o repositório privado no GitHub e já empurra (requer gh CLI)
gh repo create analise-central --private --source=. --remote=origin --push
```

Se não usar `gh CLI`:

1. Crie manualmente um repositório privado em <https://github.com/new>.
2. Conecte e envie:

   ```powershell
   git remote add origin https://github.com/SEU-USUARIO/analise-central.git
   git branch -M main
   git push -u origin main
   ```

### 3.3. Deploy no Render

1. Acesse <https://dashboard.render.com/> e clique em **New → Blueprint**.
2. Conecte sua conta do GitHub e escolha o repositório recém-criado.
3. O Render lê automaticamente o [`render.yaml`](./render.yaml) e propõe o
   serviço. Confirme.
4. No passo de variáveis de ambiente, informe:
   - `DATABASE_URL` → cole a string do Supabase (porta 6543).
   - `ADMIN_BOOTSTRAP_PASSWORD` → escolha uma senha forte para o admin inicial.
   - `JWT_SECRET` e `SECRET_KEY` já são gerados automaticamente pelo Render.
5. Clique em **Apply** / **Create Service** e aguarde o build.
6. Em poucos minutos a URL ficará disponível, no formato:

   ```
   https://analise-central.onrender.com
   ```

> **Observação (plano free):** o serviço “dorme” após ~15 min sem tráfego e
> demora 20 a 60 segundos para acordar na primeira requisição após isso. Para
> evitar, basta migrar para o plano Starter (US$ 7/mês).

---

## Primeiro acesso e credenciais

- Ao abrir a aplicação pela primeira vez, o backend cria um usuário
  administrador conforme as variáveis `ADMIN_BOOTSTRAP_*`.
- Usuário padrão: **admin**
- Senha padrão: valor definido em `ADMIN_BOOTSTRAP_PASSWORD` (ou `admin@2026`
  se não configurado).
- **No primeiro login o sistema obriga a troca da senha.**

Depois de logar, acesse **Painel do administrador** na barra superior para
criar novos usuários.

### Se perder a senha do admin

1. No Supabase, vá em **Table Editor → users**.
2. Apague o registro do admin (ou rode `UPDATE users SET active = false WHERE role='admin'`).
3. Reinicie o serviço no Render (ou espere um redeploy). O backend recriará
   o admin com a senha definida em `ADMIN_BOOTSTRAP_PASSWORD`.

---

## Como proteger uma nova página

Dentro de qualquer HTML novo em `static/`, coloque no `<head>`:

```html
<meta name="auth-root" content="/">
<script src="/assets/js/auth.js"></script>
<script src="/assets/js/auth-guard.js"></script>
```

O guard:
- Redireciona para `/login.html` se não houver sessão válida.
- Mostra uma barra superior com nome do usuário, link para o admin
  (quando for administrador) e botão de sair.

---

## API interna

Todas as rotas abaixo aceitam/retornam JSON e exigem `Authorization: Bearer <JWT>`
(exceto `POST /api/auth/login`).

### Autenticação

| Método | Rota                             | Descrição                                         |
| ------ | -------------------------------- | ------------------------------------------------- |
| POST   | `/api/auth/login`                | Faz login e retorna JWT.                          |
| POST   | `/api/auth/logout`               | Registra logout no log.                           |
| GET    | `/api/auth/me`                   | Retorna dados atualizados do usuário logado.      |
| POST   | `/api/auth/change-password`      | Troca a senha do próprio usuário.                 |

### Administração (exige `role=admin`)

| Método | Rota                                           | Descrição                            |
| ------ | ---------------------------------------------- | ------------------------------------ |
| GET    | `/api/admin/users`                             | Lista todos os usuários.             |
| POST   | `/api/admin/users`                             | Cria um novo usuário.                |
| PATCH  | `/api/admin/users/<id>`                        | Atualiza usuário (nome, perfil, senha, status). |
| DELETE | `/api/admin/users/<id>`                        | Remove usuário.                      |
| POST   | `/api/admin/users/<id>/reset-password`         | Reseta senha (força troca no próximo login). |
| GET    | `/api/admin/logs?limit=200`                    | Lista últimas ações.                 |
| DELETE | `/api/admin/logs`                              | Limpa todos os logs.                 |

### Saúde

| Método | Rota        | Descrição                                 |
| ------ | ----------- | ----------------------------------------- |
| GET    | `/healthz`  | Health check (usado pelo Render).         |

---

## Segurança e limites

- Senhas são armazenadas como hash **bcrypt** com custo 12, salt único por
  senha. Nunca trafegam nem ficam armazenadas em texto puro.
- Sessões são **JWT HS256** assinadas com `JWT_SECRET`, com expiração
  configurável (padrão: 8 horas).
- Tokens são armazenados em `localStorage` e enviados no header
  `Authorization: Bearer ...`.
- O `access_logs` registra login, logout, tentativas falhas, criação,
  edição, remoção e reset de senha.
- Qualquer requisição a `/api/auth/me` verifica se o usuário ainda existe e
  está ativo — se o admin desativar alguém, a sessão é invalidada na próxima
  chamada.

### Pontos de atenção

- O plano free do Render pausa após inatividade. Se a latência inicial for um
  problema, migre para Starter ou use um cron externo de "warmup".
- O plano free do Supabase pausa o projeto após 7 dias sem atividade. Basta
  reativar no painel.
- As automações (JS puro) continuam processando arquivos 100% no navegador do
  usuário — nada é enviado para o servidor. Apenas o login e a API passam
  pelo backend.
