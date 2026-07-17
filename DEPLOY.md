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

Abra **Environment Variables** e adicione as chaves de `.env.example` **antes do primeiro deploy** — a partir desta fase, o wizard já salva de verdade no banco (via Prisma) e gera o PDF sob demanda, então `DATABASE_URL` é obrigatório para o fluxo principal funcionar.

| Nome | Onde conseguir | Obrigatório agora? |
|---|---|---|
| `DATABASE_URL` | Supabase → Project Settings → Database → Connection string (modo "Transaction") | **Sim** |
| `DIRECT_URL` | Supabase → Project Settings → Database → Connection string (modo "Session") | **Sim** (usado pelo `prisma migrate`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | Sim (login/cadastro opcional já está no código, mesmo não sendo exigido no fluxo principal) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API | Sim |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (chave secreta — nunca exponha no client) | Recomendado |
| `NEXT_PUBLIC_APP_URL` | a própria URL que a Vercel vai gerar (ex: `https://finance-ai.vercel.app`) | Recomendado |

Marque cada variável para os três ambientes (**Production**, **Preview**, **Development**), a menos que tenha motivo para separar.

**Antes do primeiro deploy**, rode a migração do schema contra o banco do Supabase (uma vez, do seu computador):
```bash
npm run db:push
```

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

## 7. Como o produto funciona agora (decisão de produto)

A pedido explícito: **este não é um produto de venda com paywall — é uma ferramenta de captação livre.** Qualquer pessoa preenche o wizard, sem criar conta, e recebe:

- O **plano calculado na hora** (dashboard em `/dashboard/[planId]`, um link direto — sem exigir login para visualizar)
- O **PDF baixado automaticamente** no navegador, assim que confirma o último passo do wizard — sem e-mail, sem espera

O único dado coletado é o **e-mail do passo 1**, que identifica o "lead" no banco (tabela `User`) — é assim que sabemos quem preencheu o quê, sem fricção de senha/cadastro. Esse e-mail hoje **não é usado para enviar nada** — é só o identificador do registro (pode virar login de verdade no futuro, se fizer sentido).

**Trade-off importante e deliberado**: como o link do dashboard não exige login, ele funciona como um "link mágico" — qualquer pessoa com a URL consegue ver aquele plano específico. Os IDs são gerados de forma não sequencial (cuid), então não são adivinháveis, mas não há uma segunda camada de autenticação sobre o link. Isso é aceitável para a fase atual (captação/validação), mas deve ser revisto antes de tratar dados financeiros mais sensíveis em escala — nesse momento, login + Supabase Auth (já implementado nas páginas `/login` e `/cadastro`, hoje não usadas no fluxo principal) pode virar obrigatório para visualizar o dashboard.

Login e cadastro (`/login`, `/cadastro`) **já existem no código** mas não são exigidos em nenhum ponto do fluxo principal — ficam prontos para quando fizer sentido oferecer "criar conta para salvar histórico de vários meses" como upgrade opcional.

## 8. O que ainda não existe

- Envio de PDF por e-mail (removido a pedido — o fluxo é 100% download direto, sem depender de um provedor externo de e-mail)
- Histórico de múltiplos planejamentos por pessoa (cada envio do wizard sobrescreve o plano do mês corrente daquele e-mail)
- Login obrigatório / conta de verdade vinculada ao lead

## Troubleshooting rápido

- **Build falha por causa de fontes do Google**: não deve acontecer na Vercel (ela tem acesso à internet); isso só ocorre em ambientes sandbox sem rede.
- **Build falha por erro do Prisma** (`prisma generate` exigindo `DATABASE_URL`): neste estágio o `next build` **não** chama Prisma em nenhuma rota, então isso não deve ocorrer. Se você adicionar `postinstall: prisma generate` no `package.json` no futuro, garanta que `DATABASE_URL` esteja setado nas env vars da Vercel antes.
- **Página em branco / erro 500**: veja **Project → Deployments → (deploy mais recente) → Runtime Logs** na Vercel para o stack trace exato.
