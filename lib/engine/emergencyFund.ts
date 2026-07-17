import { ESSENTIAL_PRIORITIES } from "./types";
import type { EmergencyFundInput, EmergencyFundStatus, TimelineEvent } from "./types";

export function computeEmergencyFundStatus(
  timeline: TimelineEvent[],
  input: EmergencyFundInput,
): EmergencyFundStatus {
  const essentialMonthlyCost = timeline
    .filter((e) => e.type === "expense" && e.priority && ESSENTIAL_PRIORITIES.has(e.priority))
    .reduce((sum, e) => sum + e.amount, 0);

  const targetAmount = essentialMonthlyCost * input.targetMonths;
  const currentAmount = input.currentAmount;

  const dailyEssentialCost = essentialMonthlyCost > 0 ? essentialMonthlyCost / 30 : 0;
  const coverageDays = dailyEssentialCost > 0 ? Math.floor(currentAmount / dailyEssentialCost) : 0;

  const progressPct =
    targetAmount > 0 ? Number(((currentAmount / targetAmount) * 100).toFixed(1)) : 0;

  return {
    essentialMonthlyCost: Number(essentialMonthlyCost.toFixed(2)),
    targetAmount: Number(targetAmount.toFixed(2)),
    currentAmount: Number(currentAmount.toFixed(2)),
    progressPct,
    coverageDays,
  };
}
