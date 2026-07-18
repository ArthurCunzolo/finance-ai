# Finance AI

Versão de teste/demonstração: o usuário preenche entradas e saídas, vê o plano calculado na
hora (dashboard com gráficos, insights e reserva de emergência) e baixa um PDF do plano —
tudo sem login, sem conta e **sem banco de dados**.

## Status

Landing page, wizard completo (4 passos) e geração de PDF funcionando de ponta a ponta.
Ver `PLANO.md` para o roadmap completo original (algumas fases, como persistência e login,
foram deliberadamente removidas desta versão — ver `DEPLOY.md`, seção "Como o produto
funciona").

## Stack

- Next.js 16 (App Router) + TypeScript estrito
- TailwindCSS + Framer Motion + Three.js (cenas 3D em vanilla, sem R3F)
- React Hook Form + Zod
- Recharts
- `@react-pdf/renderer`
- Vitest (testes do motor financeiro)

Sem Prisma, sem Supabase, sem nenhum serviço externo — zero variáveis de ambiente
necessárias para rodar (ver `DEPLOY.md`).

## Motor Financeiro (`lib/engine`)

Núcleo puro e determinístico, sem dependência de React/Next — recebe entradas/saídas
normalizadas e devolve a distribuição completa do mês. Roda tanto no navegador (preview em
tempo real no passo 4 do wizard) quanto no servidor (rota `/api/pdf`, que recalcula tudo
antes de gerar o documento oficial).

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
npm run dev
```

Não precisa de `.env` — não há nada para configurar.

## Documentação de planejamento

Ver `PLANO.md` para a análise crítica do PRD original e a arquitetura completa pensada para
uma versão de produto real (com banco de dados, login e as demais fases do roadmap). O
código atual implementa deliberadamente só o subconjunto necessário para o teste sem
fricção: wizard + cálculo + PDF.
