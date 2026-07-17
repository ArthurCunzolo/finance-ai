import { prisma } from "@/lib/prisma";
import { computeEmergencyFundStatus } from "@/lib/engine/emergencyFund";
import type { EmergencyFundStatus, InsightOutput, Priority, TimelineEvent } from "@/lib/engine/types";

export interface DashboardPlan {
  id: string;
  title: string;
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

interface RawTimelineEvent extends Omit<TimelineEvent, "date"> {
  date: string;
}

/**
 * Busca um plano só pelo id — funciona como um link direto/compartilhável,
 * sem exigir sessão autenticada. Decisão deliberada: o produto é de captação
 * livre, não uma área de conta protegida (ver `submitPlan`).
 */
export async function getPlanById(planId: string): Promise<DashboardPlan | null> {
  const plan = await prisma.financialPlan.findUnique({
    where: { id: planId },
    include: {
      distribution: true,
      insights: true,
      incomes: true,
      expenses: true,
      user: true,
    },
  });

  if (!plan || !plan.distribution) return null;

  const rawTimeline = plan.distribution.timeline as unknown as RawTimelineEvent[];
  const timeline = rawTimeline.map((event) => ({
    ...event,
    date: new Date(event.date),
    priority: event.priority as Priority | undefined,
  }));

  const emergencyFund = await prisma.emergencyFund.findUnique({
    where: { userId: plan.userId },
    include: { contributions: true },
  });
  const currentAmount =
    emergencyFund?.contributions.reduce((sum: number, c: { amount: unknown }) => sum + Number(c.amount), 0) ?? 0;
  const emergencyFundStatus = computeEmergencyFundStatus(timeline, {
    targetMonths: emergencyFund?.targetMonths ?? 6,
    currentAmount,
  });

  return {
    id: plan.id,
    title: plan.title,
    ownerName: plan.user.name,
    referenceMonth: plan.referenceMonth.toISOString(),
    totalIncome: Number(plan.distribution.totalIncome),
    totalExpense: Number(plan.distribution.totalExpense),
    balance: Number(plan.distribution.balance),
    committedPct: Number(plan.distribution.committedPct),
    healthScore: plan.distribution.healthScore,
    timeline,
    insights: plan.insights.map((i) => ({
      type: i.type,
      message: i.message,
      severity: i.severity,
    })),
    incomesCount: plan.incomes.length,
    expensesCount: plan.expenses.length,
    emergencyFundStatus,
  };
}
