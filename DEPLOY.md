# Deploy do Finance AI na Vercel

Guia direto para colocar `github.com/ArthurCunzolo/finance-ai` rodando na Vercel.

## Como o produto funciona (decisão de produto)

Esta é uma versão de teste/demonstração, sem login, sem conta e **sem banco de dados**.
Tudo acontece em duas etapas:

1. **Wizard** (`/wizard/passo-1-dados` em diante): o usuário preenche dados pessoais, entradas
   e saídas. O motor de distribuição financeira roda **inteiramente no navegador**
   (`lib/engine`), e o resultado — cards, gráficos, reserva de emergência, insights,
   linha do tempo — aparece na hora, no próprio passo 4.
2. **PDF**: ao clicar em "Gerar meu plano em PDF", o navegador envia os dados para uma rota
   stateless (`app/api/pdf`), que roda o motor de novo no servidor (nunca confia em números
   calculados no client para o documento oficial), monta o PDF com `@react-pdf/renderer` e
   devolve o arquivo. **Nada é salvo em lugar nenhum** — nem banco, nem sessão, nem arquivo
   em disco. Cada geração é independente.

Não existe Prisma, Supabase, login ou qualquer serviço externo no caminho crítico.

## 1. Importar o repositório

1. Acesse **vercel.com** → login (pode usar sua conta GitHub).
2. **Add New… → Project**.
3. Em "Import Git Repository", selecione **ArthurCunzolo/finance-ai**.
   - Se não aparecer na lista, clique em "Adjust GitHub App Permissions" e libere acesso ao repositório.

## 2. Configuração do projeto

A Vercel detecta Next.js automaticamente. Não precisa mexer em nada:

- **Framework Preset**: Next.js
- **Root Directory**: `.`
- **Build Command**: padrão (`next build`)
- **Install Command**: padrão (`npm install`)

## 3. Variáveis de ambiente

**Nenhuma.** Pode pular direto para o deploy — não há `.env` a configurar nesta fase.

## 4. Deploy

Clique em **Deploy**. Build leva ~1 min. Ao final, clique em **Visit** para ver a landing
page e o wizard funcionando.

## 5. Deploy contínuo

A partir daqui, todo `git push` para `main` gera automaticamente um novo deploy de produção.

## 6. Se um deploy falhar

Como não há dependências externas, uma falha de build quase certamente é um erro de código
— abra **Deployments → (deploy com erro) → Build Logs** na Vercel e me manda o print que eu
sigo o rastro.

## 7. Evolução futura (fora do escopo desta versão de teste)

Quando fizer sentido evoluir para um produto real, os próximos passos naturais são:
- Login/conta (para o usuário salvar histórico de vários meses)
- Persistência em banco de dados (Prisma + Postgres/Supabase)
- Envio por e-mail, Open Finance, simulações, etc. — já mapeados no `PLANO.md`

Nenhuma dessas peças existe no código agora, de propósito, para manter o teste simples e o
deploy sem nenhuma fricção.
