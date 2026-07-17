# Deploy do Finance AI na Vercel

Guia direto para colocar `github.com/ArthurCunzolo/finance-ai` rodando na Vercel.

## 1. Importar o repositório

1. Acesse **vercel.com** → login (pode usar sua conta GitHub).
2. **Add New… → Project**.
3. Em "Import Git Repository", selecione **ArthurCunzolo/finance-ai**.
   - Se não aparecer na lista, clique em "Adjust GitHub App Permissions" e libere acesso ao repositório.

## 2. Configuração do projeto

Na tela de importação, a Vercel detecta Next.js automaticamente. Confirme:

- **Framework Preset**: Next.js
- **Root Directory**: `.` (raiz do repo)
- **Build Command**: `next build` (padrão, não mexer)
- **Output Directory**: padrão (`.next`)
- **Install Command**: `npm install` (padrão)

## 3. Variáveis de ambiente

Antes de clicar em Deploy, abra **Environment Variables** e adicione as chaves de `.env.example`. Neste estágio do projeto (Fase 1–4: fundação, motor, landing, wizard), a aplicação **roda sem nenhuma variável configurada** — Prisma/Supabase ainda não estão conectados a nenhuma rota. Você pode:

- **Fazer o primeiro deploy sem nenhuma env var** (mais rápido, útil só para validar landing + wizard).
- **Ou já configurar agora**, para não precisar redeployar quando a Fase 5+ (persistência real) chegar:

| Nome | Onde conseguir |
|---|---|
| `DATABASE_URL` | Supabase → Project Settings → Database → Connection string (modo "Transaction") |
| `DIRECT_URL` | Supabase → Project Settings → Database → Connection string (modo "Session") |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (chave secreta — nunca exponha no client) |
| `RESEND_API_KEY` | resend.com → API Keys (só necessário a partir da Fase 6) |
| `NEXT_PUBLIC_APP_URL` | a própria URL que a Vercel vai gerar (ex: `https://finance-ai.vercel.app`) — pode editar depois do 1º deploy |

Marque cada variável para os três ambientes (**Production**, **Preview**, **Development**), a menos que tenha motivo para separar.

## 4. Deploy

Clique em **Deploy**. A Vercel vai:
1. Clonar o repositório
2. Rodar `npm install`
3. Rodar `next build`
4. Publicar em uma URL do tipo `https://finance-ai-<hash>.vercel.app`

Build leva ~1-2 min. Ao final, clique em **Visit** para ver a landing page e o wizard funcionando.

## 5. Domínio próprio (opcional)

Em **Project → Settings → Domains**, adicione seu domínio (ex: `financeai.app`) e siga as instruções de DNS (CNAME apontando para `cname.vercel-dns.com`, ou os registros A que a Vercel mostrar).

## 6. Deploy contínuo

A partir daqui, **todo `git push` para `main`** gera automaticamente um novo deploy de produção. Pushes em outras branches (ou Pull Requests) geram **Preview Deployments** — URLs únicas por branch/PR, úteis para revisar antes de subir pra produção.

Fluxo recomendado a partir de agora:
```bash
git checkout -b feature/nome-da-feature
# ... trabalha ...
git push origin feature/nome-da-feature
# abre PR no GitHub -> Vercel comenta automaticamente com o link de preview
# depois de revisar, faz merge na main -> deploy de produção automático
```

## 7. O que já funciona no deploy atual

- **Landing page** (`/`): hero 3D, funcionalidades, como funciona, seção do fundador, CTA final
- **Wizard** (`/wizard/passo-1-dados` em diante): 4 passos completos, com autosave em `localStorage` do navegador (não depende de banco de dados ainda)
- **Motor financeiro**: roda 100% no navegador na revisão do wizard, mostrando resultado completo (timeline, insights, health score, reserva de emergência)

## 8. O que ainda não persiste (chega nas próximas fases)

- Login/autenticação (Supabase Auth)
- Salvar o plano no banco (hoje fica só no `localStorage` do navegador que gerou)
- Geração de PDF e envio por e-mail
- Dashboard com histórico de múltiplos meses

Ou seja: o deploy já é **navegável e funcional de ponta a ponta para um usuário testar o cálculo**, mas ainda não guarda dados entre dispositivos/sessões diferentes até a Fase 5 (Dashboard + persistência) ser implementada.

## Troubleshooting rápido

- **Build falha por causa de fontes do Google**: não deve acontecer na Vercel (ela tem acesso à internet); isso só ocorre em ambientes sandbox sem rede.
- **Build falha por erro do Prisma** (`prisma generate` exigindo `DATABASE_URL`): neste estágio o `next build` **não** chama Prisma em nenhuma rota, então isso não deve ocorrer. Se você adicionar `postinstall: prisma generate` no `package.json` no futuro, garanta que `DATABASE_URL` esteja setado nas env vars da Vercel antes.
- **Página em branco / erro 500**: veja **Project → Deployments → (deploy mais recente) → Runtime Logs** na Vercel para o stack trace exato.
