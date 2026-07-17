import { computeEmergencyFundStatus } from "./emergencyFund";
import { computeHealthScore } from "./healthScore";
import { generateInsights } from "./insights";
import { normalizeExpenses, normalizeIncomes } from "./normalize";
import { sortEvents, sweep } from "./sweep";
import type { DistributionResult, PlanInput } from "./types";

function round2(value: number): number {
  return Number(value.toFixed(2));
}

/**
 * Ponto de entrada único do motor financeiro.
 * Função pura e determinística: mesma entrada sempre produz a mesma saída.
 */
export function runEngine(plan: PlanInput): DistributionResult {
  const incomeEvents = normalizeIncomes(plan.referenceMonth, plan.incomes);
  const expenseEvents = normalizeExpenses(plan.referenceMonth, plan.expenses);

  const sorted = sortEvents([...incomeEvents, ...expenseEvents]);
  const { timeline, deficits, finalBalance } = sweep(sorted);

  const totalIncome = round2(incomeEvents.reduce((sum, e) => sum + e.amount, 0));
  const totalExpensePlanned = round2(expenseEvents.reduce((sum, e) => sum + e.amount, 0));
  const totalExpensePaid = round2(
    timeline
      .filter((e) => e.type === "expense" && (e.status === "PAGO" || e.status === "DEFICIT"))
      .reduce((sum, e) => sum + e.amount, 0),
  );

  const balance = round2(finalBalance);
  const committedPct = totalIncome > 0 ? round2(totalExpensePaid / totalIncome) : 0;

  const emergencyFundStatus = computeEmergencyFundStatus(timeline, plan.emergencyFund);

  const adiadasCount = timeline.filter((e) => e.status === "ADIADA").length;

  const healthScore = computeHealthScore({
    committedPct,
    emergencyFundStatus,
    deficits,
    adiadasCount,
  });

  const insights = generateInsights({
    timeline,
    totalIncome,
    totalExpense: totalExpensePlanned,
    balance,
    deficits,
    emergencyFundStatus,
  });

  return {
    timeline,
    totalIncome,
    totalExpense: totalExpensePlanned,
    balance,
    committedPct,
    deficits,
    emergencyFundStatus,
    healthScore,
    insights,
  };
}
