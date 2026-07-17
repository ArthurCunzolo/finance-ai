import type { Deficit, EmergencyFundStatus, InsightOutput, TimelineEvent } from "./types";

const CATEGORY_CONCENTRATION_THRESHOLD = 0.3; // 30% da renda em uma única categoria

interface InsightsContext {
  timeline: TimelineEvent[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
  deficits: Deficit[];
  emergencyFundStatus: EmergencyFundStatus;
}

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function generateInsights(ctx: InsightsContext): InsightOutput[] {
  const insights: InsightOutput[] = [];

  // 1. Concentração de gasto por categoria
  if (ctx.totalIncome > 0) {
    const byCategory = new Map<string, number>();
    for (const e of ctx.timeline) {
      if (e.type !== "expense" || e.status === "ADIADA") continue;
      byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount);
    }
    for (const [category, amount] of byCategory) {
      const pct = amount / ctx.totalIncome;
      if (pct >= CATEGORY_CONCENTRATION_THRESHOLD) {
        insights.push({
          type: "GASTO_CATEGORIA_ALTO",
          message: `Você está gastando ${(pct * 100).toFixed(0)}% da sua renda com ${category.toLowerCase()}.`,
          severity: pct >= 0.45 ? "CRITICO" : "ATENCAO",
        });
      }
    }
  }

  // 2. Reserva de emergência baixa (cobre menos de 1 mês)
  if (ctx.emergencyFundStatus.coverageDays < 30) {
    insights.push({
      type: "RESERVA_BAIXA",
      message: `Sua reserva de emergência cobre apenas ${ctx.emergencyFundStatus.coverageDays} dias de despesas essenciais. O ideal é ter ao menos 90 dias.`,
      severity: ctx.emergencyFundStatus.coverageDays < 15 ? "CRITICO" : "ATENCAO",
    });
  }

  // 3. Sugestão de economia (maior despesa opcional/muito baixa paga)
  const cuttable = ctx.timeline
    .filter((e) => e.type === "expense" && (e.priority === "OPCIONAL" || e.priority === "MUITO_BAIXA") && e.status === "PAGO")
    .sort((a, b) => b.amount - a.amount)[0];
  if (cuttable) {
    insights.push({
      type: "SUGESTAO_ECONOMIA",
      message: `Você poderia economizar ${formatBRL(cuttable.amount)} reduzindo o gasto com "${cuttable.name}", categorizado como prioridade baixa.`,
      severity: "INFO",
    });
  }

  // 4. Sobra projetada (sempre gerado)
  insights.push({
    type: "SOBRA_PROJETADA",
    message:
      ctx.balance >= 0
        ? `Com esta distribuição, você termina o mês com ${formatBRL(ctx.balance)} livres.`
        : `Com esta distribuição, você fecha o mês no negativo em ${formatBRL(Math.abs(ctx.balance))}.`,
    severity: ctx.balance >= 0 ? "INFO" : "CRITICO",
  });

  // 5. Alertas de déficit (um por evento em déficit)
  for (const deficit of ctx.deficits) {
    const cutsText =
      deficit.suggestedCuts.length > 0
        ? ` Considere adiar ou cortar: ${deficit.suggestedCuts.map((c) => c.name).join(", ")}.`
        : "";
    insights.push({
      type: "ALERTA_DEFICIT",
      message: `Faltam ${formatBRL(deficit.shortfall)} para pagar "${deficit.event.name}" no dia ${deficit.event.date.getDate()}.${cutsText}`,
      severity: "CRITICO",
    });
  }

  return insights;
}
