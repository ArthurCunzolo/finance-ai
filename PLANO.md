# FINANCE AI — Plano de Execução Completo

> Documento de planejamento técnico e de produto. Nenhum código de implementação da aplicação final está incluído aqui — este é o blueprint que guiará a construção.

---

## 1. Visão Geral do Produto

**Finance AI** é uma plataforma de planejamento financeiro pessoal/familiar que:
1. Coleta entradas e saídas financeiras detalhadas via wizard
2. Roda um motor de distribuição inteligente que aloca receitas contra despesas por prioridade/data
3. Gera dashboard com indicadores, gráficos e calendário financeiro
4. Produz insights automáticos e um PDF premium estilo relatório de consultoria

Padrão de qualidade visual: Apple / Stripe / Linear / Vercel / Arc / Raycast / Revolut / Ramp — dark mode, glassmorphism, muito espaço negativo, verde como única cor de "sucesso", dourado quase imperceptível como acento de prestígio.

---

## 1.1 Análise Crítica — Problemas e Inconsistências no PRD Original

1. **Recorrência sem template separado da instância mensal.** O PRD trata `FinancialPlan` como um snapshot de um mês, mas despesas/receitas recorrentes (aluguel, internet, salário) não devem ser recadastradas todo mês. **Correção**: separar `RecurringTemplate` (a regra: "Aluguel, R$1200, todo dia 10, ESSENCIAL") de `Income`/`Expense` (a instância gerada automaticamente para um mês específico). O motor gera as instâncias do mês a partir dos templates ativos + permite exceções pontuais.
2. **Cartão de crédito tratado como despesa simples.** `dueDay` genérico não representa a realidade de cartão: existe **data de fechamento da fatura** e **data de vencimento**, e a fatura agrega N compras parceladas de N cartões diferentes. **Correção**: modelo `CreditCard` próprio com `closingDay`/`dueDay`, e `Purchase[]` que se agregam em uma `Invoice` mensal — pré-requisito real para "Controle de cartão de crédito" já previsto no PRD.
3. **Reserva de emergência presa ao plano mensal.** `currentAmount` não pode resetar/duplicar a cada novo planejamento — é um saldo acumulado ao longo do tempo. **Correção**: mover para `EmergencyFund` em nível de `User`/`Household`, com tabela `EmergencyFundContribution` (histórico de aportes/saques); o `FinancialPlan` apenas referencia o estado atual no momento do cálculo.
4. **"IA" mencionada no PRD vs. motor determinístico proposto.** Cálculo de dinheiro real precisa ser auditável — um LLM não deve decidir *quanto* ou *o quê* pagar. **Decisão proposta**: núcleo 100% determinístico (seção 6); a "camada de IA" fica só na **redação em linguagem natural** dos insights (opcional, via LLM, sempre a partir de números já calculados — nunca gerando os números em si).
5. **Notificações/lembretes exigem um agendador**, ausente no stack original. Sem isso, "lembretes" e "recorrência automática de planos" não funcionam. **Correção**: adicionar job scheduler (seção 2.1 atualizada).
6. **Envio de PDF por e-mail** exige provedor de e-mail transacional — não estava no stack.
7. **Exportar Excel** exige lib própria, não coberta pelo React PDF.
8. **Multi-usuário no "modo casal/família"** implica edição concorrente no mesmo `FinancialPlan`. **Correção**: `updatedAt` + `updatedBy` por registro, aviso de "atualizado por [nome] há Xmin"; sync em tempo real (websocket) fica como melhoria futura, não MVP.
9. **Dados financeiros sensíveis**: PRD não menciona segurança/LGPD, obrigatório dado o domínio. **Correção**: RLS (Row Level Security) nativo do Supabase por `userId`/`householdId`, nunca trafegar número completo de cartão (só apelido/últimos 4 dígitos), criptografia em repouso.
10. **"Objetivo financeiro" como texto livre** não é acionável pelo motor nem pelos insights. **Correção**: campo estruturado (enum `QUITAR_DIVIDAS` / `JUNTAR_RESERVA` / `COMPRAR_IMOVEL` / `APOSENTADORIA` / `OUTRO` + texto livre complementar), conectando insights e simulações diretamente à meta declarada.

## 1.2 Funcionalidades Adicionais Recomendadas (aumento de valor percebido)

| Funcionalidade | Valor agregado |
|---|---|
| **Open Finance (Pluggy/Belvo)** | Importação automática de extrato bancário — elimina a maior fricção de qualquer app financeiro: digitação manual |
| **Health Score financeiro (0–100)** | Número único e memorável no topo do dashboard — forte gancho de produto e compartilhamento |
| **Estratégia de quitação de dívidas (Snowball vs. Avalanche)** | Transforma "Controle de dívidas" (já previsto) em algo acionável, não só uma lista |
| **Bot no WhatsApp para lançar gasto rápido** | Alinhado ao seu padrão de CTAs via WhatsApp nos outros projetos; reduz fricção de uso diário |
| **Sub-contas para filhos/mesada (modo família)** | Extensão natural do "Modo família" já previsto no PRD |
| **Preparação simplificada de IRPF para MEI/autônomos** | Diferencial forte para o público CLT/MEI/liberal já mapeado |
| **Multi-moeda** | Relevante para freelancers com clientes internacionais |
| **Gamificação leve (streak de mês fechado no azul)** | Aumenta retenção sem parecer infantil, se bem dosado no visual premium |

---

## 2. Arquitetura do Projeto

### 2.1 Stack confirmada
- **Framework**: Next.js 14+ (App Router, Server Components, Server Actions)
- **Linguagem**: TypeScript estrito
- **Estilo**: TailwindCSS + tokens de design customizados (não usar defaults do Tailwind "cru")
- **UI base**: ShadCN UI (usado apenas como esqueleto acessível — toda a pele visual é customizada, nunca "parece ShadCN")
- **Animação**: Framer Motion (UI/scroll/microinterações) + GSAP (timelines complexas, scroll-trigger pesado) + Three.js / React Three Fiber (hero 3D, avatar do fundador)
- **Formulários**: React Hook Form + Zod (schemas compartilhados client/server)
- **Gráficos**: Recharts (dashboards) — Chart.js como fallback se precisar de tipo de gráfico específico (heatmap financeiro)
- **PDF**: React PDF (`@react-pdf/renderer`) para o relatório premium — PDF-lib apenas se precisar de pós-processamento/merge
- **Backend/DB**: Supabase (Auth + Postgres + Storage) + Prisma como ORM sobre o Postgres do Supabase
- **Autenticação**: Supabase Auth (Google OAuth + email/senha)
- **Ícones**: Lucide
- **Job scheduler**: Trigger.dev (ou Vercel Cron para casos simples) — necessário para lembretes, geração automática de instâncias mensais a partir de templates recorrentes, e notificações
- **E-mail transacional**: Resend — necessário para "enviar PDF por e-mail"
- **Exportação Excel**: `exceljs` — necessário para "exportar Excel"
- **Open Finance (fase futura)**: Pluggy ou Belvo — importação automática de extrato bancário

### 2.2 Estrutura de pastas (alto nível)

```
finance-ai/
├── app/
│   ├── (marketing)/              # landing page pública
│   │   ├── page.tsx
│   │   ├── missao/
│   │   └── components/
│   ├── (auth)/
│   │   ├── login/
│   │   └── cadastro/
│   ├── (app)/                    # área logada
│   │   ├── wizard/
│   │   │   ├── passo-1-dados/
│   │   │   ├── passo-2-entradas/
│   │   │   ├── passo-3-saidas/
│   │   │   └── passo-4-revisao/
│   │   ├── dashboard/
│   │   ├── planejamentos/        # múltiplos planejamentos salvos
│   │   ├── calendario/
│   │   ├── cartoes/               # cartões de crédito e faturas
│   │   ├── reserva/                # reserva de emergência (aportes/saques, histórico)
│   │   ├── recorrentes/            # gestão de templates recorrentes
│   │   ├── simulacoes/           # carro, financiamento, aposentadoria
│   │   └── configuracoes/
│   └── api/
│       ├── engine/                # endpoint do motor de distribuição
│       ├── pdf/
│       ├── email/                 # envio de PDF/relatório por e-mail
│       └── webhooks/
├── components/
│   ├── ui/                       # primitives (button, card, input glass...)
│   ├── charts/
│   ├── three/                    # cenas 3D (hero, avatar fundador)
│   ├── wizard/
│   └── dashboard/
├── lib/
│   ├── engine/                   # algoritmo de distribuição financeira (puro, testável)
│   ├── validators/                # schemas Zod
│   ├── pdf/                      # templates React PDF
│   ├── email/                    # templates e client Resend
│   ├── jobs/                     # rotinas do scheduler (gerar instâncias mensais, lembretes)
│   ├── integrations/
│   │   └── open-finance/         # client Pluggy/Belvo (fase futura)
│   └── supabase/
├── prisma/
│   └── schema.prisma
└── types/
```

### 2.3 Princípios de arquitetura
- **Motor financeiro é uma lib pura** (`lib/engine`), sem dependência de React/Next — 100% testável isoladamente com unit tests.
- **Server Components por padrão**; Client Components só onde há interatividade real (formulários, gráficos, cenas 3D, animações).
- **Server Actions** para mutações (salvar entradas/saídas, gerar planejamento) em vez de API routes tradicionais, exceto para geração de PDF (que pode exigir streaming/response binário) e webhooks.
- **Multi-tenant lógico**: todo registro pertence a um `userId` e opcionalmente a um `householdId` (para "modo casal"/"modo família").

---

## 3. Modelagem de Dados (Prisma)

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String
  avatarUrl     String?
  maritalStatus MaritalStatus?
  householdId   String?
  household     Household? @relation(fields: [householdId], references: [id])
  createdAt     DateTime @default(now())
  plans         FinancialPlan[]
  emergencyFund EmergencyFund?
}

model Household {
  id       String @id @default(cuid())
  name     String
  members  User[]
  peopleCount Int  @default(1)
}

enum MaritalStatus {
  SOLTEIRO
  CASADO
  UNIAO_ESTAVEL
  DIVORCIADO
  VIUVO
}

// Um "planejamento" é um snapshot mensal/recorrente que o usuário pode
// salvar, comparar mês a mês e reabrir.
model FinancialPlan {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  title         String
  goal          String?  // objetivo financeiro declarado no passo 1
  referenceMonth DateTime
  incomes       Income[]
  expenses      Expense[]
  insights      Insight[]
  distribution  DistributionResult?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Income {
  id            String   @id @default(cuid())
  planId        String
  plan          FinancialPlan @relation(fields: [planId], references: [id])
  name          String
  amount        Decimal
  receiveDay    Int          // dia do mês (1-31)
  recurrence    Recurrence
  category      IncomeCategory
  notes         String?
}

model Expense {
  id            String   @id @default(cuid())
  planId        String
  plan          FinancialPlan @relation(fields: [planId], references: [id])
  name          String
  amount        Decimal
  dueDay        Int
  recurrence    Recurrence
  category      ExpenseCategory
  priority      Priority
  paymentMethod PaymentMethod
  isInstallment Boolean  @default(false)
  installmentsTotal Int?
  installmentsPaid  Int?
  isVariable    Boolean  @default(false)
}

enum Recurrence {
  MENSAL
  QUINZENAL
  SEMANAL
  ANUAL
  PERSONALIZADO
}

enum IncomeCategory {
  SALARIO
  SALARIO_COMPANHEIRO
  VALE_ALIMENTACAO
  VALE_REFEICAO
  COMISSAO
  FREELANCER
  PIX_RECEBIDO
  RENDA_EXTRA
  ALUGUEL_RECEBIDO
  DIVIDENDOS
  ANTECIPACAO_SALARIAL
  BENEFICIOS
  DECIMO_TERCEIRO
  PLR
  OUTROS
}

enum ExpenseCategory {
  MORADIA
  ALUGUEL
  FINANCIAMENTO
  AGUA
  LUZ
  INTERNET
  TELEFONE
  MERCADO
  COMBUSTIVEL
  TRANSPORTE
  EDUCACAO
  SAUDE
  STREAMING
  INVESTIMENTOS
  LAZER
  PETS
  FILHOS
  OUTROS
}

enum Priority {
  MUITO_ALTA
  ALTA
  MEDIA
  BAIXA
  MUITO_BAIXA
  URGENTE
  ESSENCIAL
  OPCIONAL
}

enum PaymentMethod {
  CARTAO
  PIX
  DEBITO
  BOLETO
  DINHEIRO
}

// --- CORREÇÃO 1.1 (item 3): reserva de emergência é acumulada no tempo,
// vive no User/Household, não em cada plano.
model EmergencyFund {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  targetMonths  Int      @default(6)
  contributions EmergencyFundContribution[]
}

model EmergencyFundContribution {
  id              String   @id @default(cuid())
  emergencyFundId String
  emergencyFund   EmergencyFund @relation(fields: [emergencyFundId], references: [id])
  amount          Decimal  // positivo = aporte, negativo = saque
  date            DateTime @default(now())
}

// --- CORREÇÃO 1.1 (item 1): regra recorrente separada da instância mensal.
// O motor gera Income/Expense de um mês a partir dos templates ativos.
model RecurringIncomeTemplate {
  id         String   @id @default(cuid())
  userId     String
  name       String
  amount     Decimal
  receiveDay Int
  recurrence Recurrence
  category   IncomeCategory
  active     Boolean  @default(true)
}

model RecurringExpenseTemplate {
  id            String   @id @default(cuid())
  userId        String
  name          String
  amount        Decimal
  dueDay        Int
  recurrence    Recurrence
  category      ExpenseCategory
  priority      Priority
  paymentMethod PaymentMethod
  active        Boolean  @default(true)
}

// --- CORREÇÃO 1.1 (item 2): cartão de crédito com ciclo de fatura próprio.
model CreditCard {
  id          String   @id @default(cuid())
  userId      String
  nickname    String   // nunca armazenar número completo
  lastDigits  String
  closingDay  Int
  dueDay      Int
  limit       Decimal?
  purchases   CardPurchase[]
  invoices    CardInvoice[]
}

model CardPurchase {
  id                String   @id @default(cuid())
  creditCardId      String
  creditCard        CreditCard @relation(fields: [creditCardId], references: [id])
  description       String
  amount            Decimal
  purchaseDate      DateTime
  installmentsTotal Int      @default(1)
  category          ExpenseCategory
}

model CardInvoice {
  id           String   @id @default(cuid())
  creditCardId String
  creditCard   CreditCard @relation(fields: [creditCardId], references: [id])
  referenceMonth DateTime
  totalAmount  Decimal
  status       InvoiceStatus @default(ABERTA)
}

enum InvoiceStatus {
  ABERTA
  FECHADA
  PAGA
}

// Resultado calculado e persistido do motor de distribuição
model DistributionResult {
  id            String   @id @default(cuid())
  planId        String   @unique
  plan          FinancialPlan @relation(fields: [planId], references: [id])
  timeline      Json     // array ordenado de eventos (ver seção 6)
  totalIncome   Decimal
  totalExpense  Decimal
  balance       Decimal
  committedPct  Decimal  // % da renda comprometida
  shortfall     Decimal? // se negativo em algum ponto, valor da falta
  generatedAt   DateTime @default(now())
}

model Insight {
  id        String   @id @default(cuid())
  planId    String
  plan      FinancialPlan @relation(fields: [planId], references: [id])
  type      InsightType
  message   String
  severity  InsightSeverity @default(INFO)
  createdAt DateTime @default(now())
}

enum InsightType {
  GASTO_CATEGORIA_ALTO
  RESERVA_BAIXA
  SUGESTAO_ECONOMIA
  SOBRA_PROJETADA
  ALERTA_DEFICIT
  OUTRO
}

enum InsightSeverity {
  INFO
  ATENCAO
  CRITICO
}
```

Notas de modelagem:
- `Decimal` em todos os valores monetários — nunca `Float` (evita erro de arredondamento).
- `DistributionResult.timeline` fica em JSON porque é a saída serializada do motor (ver seção 6), evitando explodir em N tabelas para algo que é essencialmente um relatório imutável por geração.
- Estrutura já suporta "modo casal/família" via `Household`, sem precisar de refactor futuro.

---

## 4. Componentes Reutilizáveis (biblioteca de UI)

### 4.1 Primitivos visuais (`components/ui`)
- `GlassCard` — card com blur, borda sutil, glow condicional (hover)
- `GradientButton` (primary/secondary/ghost) — com micro-animação de press
- `StatCard` — número grande + label + delta (verde/vermelho) + ícone
- `ProgressRing` / `ProgressBar` — usado em reserva de emergência e wizard
- `PriorityBadge` — badge colorido por prioridade (urgente = vermelho, essencial = âmbar, opcional = cinza)
- `CurrencyInput` — input com máscara BRL, incremento/decremento
- `EmptyState` — ilustração + CTA, nunca tela em branco
- `SkeletonBlock` — loading states consistentes

### 4.2 Componentes de wizard (`components/wizard`)
- `WizardShell` — layout com progress bar superior + navegação passo a passo + autosave indicator
- `DynamicListField` — lista "infinita" de itens (usado em Entradas e Saídas) com add/remove/reorder animado
- `RecurrencePicker`
- `CategoryPicker` (com ícone por categoria)
- `PrioritySelector`

### 4.3 Componentes de dashboard (`components/dashboard` + `components/charts`)
- `SummaryCardsRow` (Entradas/Saídas/Saldo/Reserva/% comprometido/Patrimônio futuro)
- `CategoryDonutChart`
- `CashFlowLineChart`
- `MonthlyBarChart`
- `FinancialHeatmap` (calendário de intensidade de gasto por dia)
- `FinancialCalendar` (visão mês com eventos de entrada/saída)
- `TimelineDistribution` — visualização do "fluxo em cascata" (salário → conta → conta → sobra)
- `InsightCard` (com severidade visual)
- `EmergencyFundGauge`

### 4.4 Componentes 3D (`components/three`)
- `HeroMoneyScene` — dinheiro/moedas flutuando, parallax por mouse/scroll
- `FounderAvatarScene` — avatar 3D com idle animation (piscar, respirar, leve head-tracking do cursor)
- `DashboardMockup3D` — laptop/mockup do produto no hero com leve rotação por scroll

### 4.5 PDF (`lib/pdf`)
- `PDFCoverPage`
- `PDFExecutiveSummary`
- `PDFChartsSection`
- `PDFTimelineSection`
- `PDFInsightsSection`
- `PDFFooter` (numeração + identidade visual)

---

## 5. Fluxos do Usuário

### 5.1 Fluxo público (marketing)
Hero → Funcionalidades → Como funciona (stepper) → Dashboard exemplo → Seção do fundador (3D) → Prova social/CTA final → Footer.
CTA principal: **"Começar meu planejamento"** → login/cadastro (se não autenticado) → wizard.

### 5.2 Wizard (autenticado)
```
Passo 1: Dados pessoais
  → nome, estado civil, nº pessoas na casa, objetivo financeiro
Passo 2: Entradas
  → DynamicListField de incomes (nome, valor, dia recebimento, recorrência)
Passo 3: Saídas
  → DynamicListField de expenses (nome, categoria, valor, vencimento, recorrência, prioridade, forma pagamento, parcelamento)
Passo 4: Revisão
  → resumo dos dados antes de rodar o motor
  → botão "Gerar meu planejamento"
      → chama o motor de distribuição (server action)
      → salva FinancialPlan + Income[] + Expense[] + DistributionResult + Insight[]
      → redireciona para /dashboard/[planId]
```
Autosave a cada mudança de campo (debounced) para nunca perder progresso.

### 5.3 Dashboard
Usuário chega no dashboard já com tudo calculado → pode:
- Ver cards de resumo, gráficos, calendário
- Ler insights
- Gerar PDF (streaming de download)
- Editar plano (volta ao wizard em modo edição)
- Salvar como novo planejamento / comparar com mês anterior
- Ir para simulações (carro, financiamento, aposentadoria)

### 5.4 Fluxo de múltiplos planejamentos
`/planejamentos` lista todos os planos salvos por usuário (ou household) → comparação mês a mês lado a lado (deltas de entradas/saídas/sobra).

---

## 6. Algoritmo de Distribuição Financeira (Motor Inteligente)

Vive em `lib/engine`, puro TypeScript, sem I/O — recebe `incomes[]` + `expenses[]` + config de reserva, devolve um `DistributionResult` determinístico.

### 6.1 Ideia central
Simular o "fluxo de caixa" ao longo do mês like um calendário: cada entrada de dinheiro (por dia de recebimento) cria um "saldo disponível" que vai sendo consumido pelas saídas que vencem depois, respeitando prioridade. O resultado é uma timeline ordenada por data mostrando exatamente que dinheiro paga o quê.

### 6.2 Passos do algoritmo

1. **Normalização**: converter todas as recorrências (quinzenal, semanal, anual, personalizado) para eventos dentro do mês de referência (ex: renda anual vira 1 evento pontual no mês em que cai; semanal vira 4-5 eventos).
2. **Construção da timeline de eventos**: mesclar `incomes` e `expenses` normalizados em uma lista única de eventos, cada um com `{ date, type: 'income'|'expense', amount, priority?, category }`, ordenada por dia do mês.
3. **Ordenação secundária por prioridade** dentro do mesmo dia: `URGENTE > MUITO_ALTA > ESSENCIAL > ALTA > MEDIA > BAIXA > OPCIONAL > MUITO_BAIXA`.
4. **Varredura sequencial (sweep) com saldo acumulado**:
   - `saldo = 0`
   - Para cada evento na ordem:
     - Se `income`: `saldo += amount`, registra no timeline como "entrada"
     - Se `expense`:
       - Se `saldo >= amount`: paga normalmente, `saldo -= amount`, marca status `PAGO`
       - Se `saldo < amount`:
         - Tenta **remanejamento**: verifica se há entrada futura antes do próximo vencimento essencial que cobriria a diferença → se sim, marca como `PAGO_COM_ANTECIPACAO_NECESSARIA` e sinaliza no insight
         - Se não há cobertura possível e a despesa é `URGENTE`/`ESSENCIAL`: gera **alerta de déficit**, calcula exatamente `shortfall = amount - saldo`, e sugere quais despesas de prioridade menor no mesmo ciclo poderiam ser adiadas/cortadas para cobrir a diferença (ordenando as `OPCIONAL`/`MUITO_BAIXA` já pagas ou futuras por valor, sugerindo a combinação mínima que cobre o shortfall)
         - Se a despesa não é essencial: marca como `ADIADA` e recalcula para o próximo ciclo de entrada
5. **Cálculo de reserva de emergência**: `custoMensalEssencial = soma(expenses com priority in [URGENTE, ESSENCIAL, MUITO_ALTA])`; metas em 3/6/12 meses = `custoMensalEssencial * N`; `currentAmount = soma(EmergencyFundContribution do usuário)` (saldo acumulado, não pertence ao plano); progresso = `currentAmount / meta`.
6. **Métricas finais**:
   - `totalIncome`, `totalExpense`, `balance = totalIncome - totalExpense`
   - `committedPct = totalExpense / totalIncome`
   - `sobraProjetada = balance` (se positivo)
7. **Geração de insights** (regras determinísticas, não é "IA generativa" no MVP — pode evoluir para LLM depois):
   - Se `% de uma categoria / totalIncome > 30%` → insight `GASTO_CATEGORIA_ALTO`
   - Se `reserva atual / custoMensalEssencial < 1` (cobre menos de 1 mês) → `RESERVA_BAIXA` com dias exatos de cobertura
   - Se houver `OPCIONAL` cortável identificável → `SUGESTAO_ECONOMIA` com valor exato
   - Sempre gerar `SOBRA_PROJETADA` com o valor final do mês
   - Se houve `shortfall` → `ALERTA_DEFICIT` com valor exato e sugestão

### 6.3 Por que essa abordagem
- É **determinística e auditável** (importante para dinheiro — nada de "caixa preta"): dá pra mostrar ao usuário exatamente por que uma conta foi paga antes da outra.
- É **testável unitariamente**: dado um conjunto fixo de incomes/expenses, o resultado é sempre o mesmo — permite escrever testes de regressão robustos antes de qualquer refinamento com IA generativa.
- **Evolutivo**: a camada de insights pode ser trocada/complementada por uma chamada a um modelo de linguagem no futuro (ex.: reescrever os insights determinísticos em linguagem mais natural), sem tocar no núcleo de cálculo.

### 6.4 Pseudocódigo simplificado
```ts
function runEngine(plan: PlanInput): DistributionResult {
  const events = normalizeToMonthlyEvents(plan.incomes, plan.expenses);
  const sorted = sortByDateThenPriority(events);

  let saldo = 0;
  const timeline: TimelineEvent[] = [];
  const deficits: Deficit[] = [];

  for (const event of sorted) {
    if (event.type === 'income') {
      saldo += event.amount;
      timeline.push({ ...event, status: 'RECEBIDO', saldoApos: saldo });
      continue;
    }
    if (saldo >= event.amount) {
      saldo -= event.amount;
      timeline.push({ ...event, status: 'PAGO', saldoApos: saldo });
    } else {
      const shortfall = event.amount - saldo;
      if (isEssential(event.priority)) {
        deficits.push({ event, shortfall });
        timeline.push({ ...event, status: 'DEFICIT', shortfall });
      } else {
        timeline.push({ ...event, status: 'ADIADA' });
      }
    }
  }

  const totals = computeTotals(plan.incomes, plan.expenses);
  const insights = generateInsights(timeline, totals, deficits, plan.emergencyFund);

  return { timeline, ...totals, deficits, insights };
}
```

---

## 7. Modelo 3D do Fundador — abordagem técnica

- React Three Fiber + `useFrame` para idle loop (respiração = leve escala no torso; piscar = shader/morph target em intervalo randômico 2-6s)
- Head tracking parcial: interpolar rotação da cabeça (`lerp`) em direção à posição do mouse projetada no espaço 3D, com limite de ângulo (evita quebra de imersão)
- Carregar modelo `.glb` otimizado (Draco compression) via `useGLTF`
- Lazy load da cena (só monta quando a seção entra em viewport — `IntersectionObserver`) para não pesar o LCP do hero

---

## 8. Roadmap de Execução Sugerido

| Fase | Entregável |
|---|---|
| **1. Fundação** | Setup Next.js + Tailwind + design tokens + Prisma/Supabase + RLS + auth |
| **2. Motor Financeiro** | `lib/engine` completo com templates recorrentes → instâncias mensais, reserva de emergência por usuário, testes unitários (sem UI) |
| **3. Landing Page** | Hero 3D, seções de marketing, seção do fundador |
| **4. Wizard** | 4 passos + autosave + validação Zod + objetivo financeiro estruturado |
| **5. Dashboard** | Cards, gráficos, calendário, insights, timeline, health score |
| **6. PDF & E-mail** | Templates React PDF + geração/download + envio por e-mail (Resend) |
| **7. Cartão de Crédito** | Modelo de fatura/fechamento, compras parceladas, integração ao motor |
| **8. Extras** | Multi-planejamento, comparação mensal, simulações (carro/financiamento/aposentadoria), exportação Excel, modo casal/família |
| **9. Diferenciais** | Open Finance (Pluggy/Belvo), estratégia de quitação de dívidas, lembretes/notificações via scheduler |
| **10. Polimento** | Performance (Lighthouse 98+), acessibilidade AA, dark/light mode |

Fases 1–6 formam o **MVP funcional completo** (coleta → cálculo → dashboard → PDF). Fases 7–10 são incrementais e podem ser priorizadas ou adiadas conforme feedback de uso real.

---

## 9. Próximos Passos

Este plano está pronto para aprovação. Após seu aceite, inicio a implementação seguindo as fases acima — por padrão, começando pela **Fase 1 (Fundação) + Fase 2 (Motor Financeiro)**, já que é a base que tudo depende e a única parte que precisa estar matematicamente correta antes de qualquer UI ser construída.

Se preferir outra ordem (ex: validar direção visual primeiro com a Fase 3), me diga o número da fase.
