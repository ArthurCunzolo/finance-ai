import type { EmergencyFundStatus, InsightOutput, TimelineEvent } from "@/lib/engine/types";

/**
 * Formato final do plano calculado, pronto para exibir (dashboard) ou
 * imprimir (PDF). Não depende de nenhum banco de dados — é gerado 100% na
 * hora, a partir do resultado do motor (`runEngine`) mais os dados pessoais
 * do passo 1 do wizard.
 */
export interface ComputedPlan {
  ownerName: string;
  referenceMonth: string; // ISO
  totalIncome: number;
  totalExpense: number;
  balance: number;
  committedPct: number;
  healthScore: number;
  timeline: TimelineEvent[];
  insights: InsightOutput[];
  incomesCount: number;
  expensesCount: number;
  emergencyFundStatus: EmergencyFundStatus;
}
