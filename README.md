# Finance AI

Plataforma inteligente de planejamento financeiro pessoal/familiar. Coleta entradas e saídas, distribui automaticamente as contas por prioridade e data, calcula reserva de emergência, gera insights e um relatório em PDF premium.

## Status

🚧 Fase 1 + 2 do roadmap: **Fundação** e **Motor Financeiro** (`lib/engine`) implementados. UI (landing, wizard, dashboard) ainda não iniciada — ver `PLANO.md`.

## Stack

- Next.js 16 (App Router) + TypeScript estrito
- TailwindCSS + Framer Motion + GSAP + Three.js / React Three Fiber
- Prisma + Supabase (Postgres, Auth, Storage)
- React Hook Form + Zod
- Recharts
- `@react-pdf/renderer`
- Vitest (testes do motor financeiro)

## Motor Financeiro (`lib/engine`)

Núcleo puro e determinístico, sem dependência de React/Next/DB — recebe entradas/saídas normalizadas e devolve a distribuição completa do mês.

```
lib/engine/
├── types.ts          # tipos e enums do domínio
├── normalize.ts       # expande recorrências (mensal/quinzenal/semanal/...) em ocorrências no mês
├── sweep.ts            # varredura sequencial: decide PAGO / ADIADA / DEFICIT por saldo e prioridade
├── emergencyFund.ts    # cálculo de cobertura da reserva de emergência
├── healthScore.ts      # score financeiro 0-100
├── insights.ts         # geração determinística de insights (regras, não LLM)
├── runEngine.ts         # orquestrador público: runEngine(plan) -> DistributionResult
└── __tests__/           # testes unitários (vitest)
```

Rodar os testes:

```bash
npm run test
```

## Setup local

```bash
npm install
cp .env.example .env       # preencher com credenciais do Supabase
npm run db:generate
npm run db:push            # aplica o schema no banco (dev)
npm run dev
```

## Banco de dados

Schema completo em `prisma/schema.prisma`, cobrindo: usuários/household, planejamentos mensais, templates de recorrência, cartão de crédito (fatura/fechamento), reserva de emergência (histórico de aportes), dívidas, insights e notificações.

## Documentação de planejamento

Ver `PLANO.md` para a análise crítica do PRD original, arquitetura completa, algoritmo de distribuição financeira detalhado e roadmap de fases.
