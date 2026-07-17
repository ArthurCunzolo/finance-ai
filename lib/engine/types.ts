/**
 * Tipos do motor de distribuição financeira.
 * O motor é puro: não depende de Prisma, Next.js ou React.
 * Os enums abaixo espelham o schema Prisma, mas são declarados de forma
 * independente para manter `lib/engine` desacoplado do ORM.
 */

export type Recurrence =
  | "MENSAL"
  | "QUINZENAL"
  | "SEMANAL"
  | "ANUAL"
  | "PERSONALIZADO"
  | "UNICA";

export type Priority =
  | "URGENTE"
  | "MUITO_ALTA"
  | "ESSENCIAL"
  | "ALTA"
  | "MEDIA"
  | "BAIXA"
  | "OPCIONAL"
  | "MUITO_BAIXA";

export type PaymentMethod = "CARTAO" | "PIX" | "DEBITO" | "BOLETO" | "DINHEIRO";

/** Ordem de prioridade do mais crítico para o mais dispensável. */
export const PRIORITY_ORDER: Record<Priority, number> = {
  URGENTE: 0,
  MUITO_ALTA: 1,
  ESSENCIAL: 2,
  ALTA: 3,
  MEDIA: 4,
  BAIXA: 5,
  OPCIONAL: 6,
  MUITO_BAIXA: 7,
};

/** Prioridades que nunca podem ficar descobertas sem gerar alerta de déficit. */
export const ESSENTIAL_PRIORITIES: ReadonlySet<Priority> = new Set([
  "URGENTE",
  "MUITO_ALTA",
  "ESSENCIAL",
]);

export interface IncomeInput {
  id: string;
  name: string;
  amount: number;
  receiveDay: number; // 1-31
  recurrence: Recurrence;
  category: string;
}

export interface ExpenseInput {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // 1-31
  recurrence: Recurrence;
  category: string;
  priority: Priority;
  paymentMethod: PaymentMethod;
}

export interface EmergencyFundInput {
  targetMonths: number;
  currentAmount: number;
}

export interface PlanInput {
  referenceMonth: Date;
  incomes: IncomeInput[];
  expenses: ExpenseInput[];
  emergencyFund: EmergencyFundInput;
}

export type EventStatus =
  | "RECEBIDO"
  | "PAGO"
  | "PAGO_COM_ANTECIPACAO_NECESSARIA"
  | "ADIADA"
  | "DEFICIT";

export interface TimelineEvent {
  id: string;
  sourceId: string; // id do Income/Expense de origem
  type: "income" | "expense";
  name: string;
  category: string;
  date: Date;
  amount: number;
  priority?: Priority;
  status: EventStatus;
  balanceAfter: number;
  shortfall?: number;
}

export interface Deficit {
  event: TimelineEvent;
  shortfall: number;
  /** Sugestão de despesas de menor prioridade que, se cortadas/adiadas, cobririam o shortfall */
  suggestedCuts: { sourceId: string; name: string; amount: number }[];
}

export interface EmergencyFundStatus {
  essentialMonthlyCost: number;
  targetAmount: number;
  currentAmount: number;
  progressPct: number;
  coverageDays: number;
}

export interface InsightOutput {
  type:
    | "GASTO_CATEGORIA_ALTO"
    | "RESERVA_BAIXA"
    | "SUGESTAO_ECONOMIA"
    | "SOBRA_PROJETADA"
    | "ALERTA_DEFICIT"
    | "OUTRO";
  message: string;
  severity: "INFO" | "ATENCAO" | "CRITICO";
}

export interface DistributionResult {
  timeline: TimelineEvent[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
  committedPct: number;
  deficits: Deficit[];
  emergencyFundStatus: EmergencyFundStatus;
  healthScore: number;
  insights: InsightOutput[];
}
