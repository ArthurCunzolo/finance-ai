"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { runEngine, type ExpenseInput, type IncomeInput, type TimelineEvent } from "@/lib/engine";
import { wizardDataSchema, type WizardData } from "@/lib/validators/wizard";
import { getPlanById } from "@/lib/data/plan";
import { sendPlanEmail } from "@/lib/email/sendPlanEmail";

export interface SavePlanResult {
  planId?: string;
  error?: string;
  emailSent?: boolean;
  emailSkippedReason?: string;
}

/** Serializa a timeline (com objetos Date) para um formato aceito pelo campo Json do Prisma. */
function serializeTimeline(timeline: TimelineEvent[]) {
  return timeline.map((event) => ({
    ...event,
    date: event.date.toISOString(),
  })) as unknown as Prisma.InputJsonValue;
}

function firstDayOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Gera o plano e o salva SEM exigir login/senha — o produto é, propositalmente,
 * aberto para captação: qualquer pessoa preenche o wizard e recebe o PDF na hora.
 * O e-mail informado no passo 1 é o único identificador do lead. Se, no futuro,
 * essa pessoa criar uma conta de verdade (Supabase Auth), o registro é
 * reaproveitado via `authUserId` — não perdemos o histórico.
 */
export async function submitPlan(rawData: WizardData): Promise<SavePlanResult> {
  const parsed = wizardDataSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: "Dados do planejamento inválidos. Volte e revise os passos anteriores." };
  }
  const data = parsed.data;

  // 1. Upsert do lead pelo e-mail — é o identificador, não uma sessão autenticada.
  const user = await prisma.user.upsert({
    where: { email: data.personal.email },
    update: {
      name: data.personal.name,
      maritalStatus: data.personal.maritalStatus,
      financialGoal: data.personal.financialGoal,
      financialGoalNote: data.personal.financialGoalNote,
    },
    create: {
      email: data.personal.email,
      name: data.personal.name,
      maritalStatus: data.personal.maritalStatus,
      financialGoal: data.personal.financialGoal,
      financialGoalNote: data.personal.financialGoalNote,
    },
  });

  // 2. Reserva de emergência: acumulada no tempo, não reseta a cada plano.
  const emergencyFund = await prisma.emergencyFund.upsert({
    where: { userId: user.id },
    update: { targetMonths: data.emergencyFund.targetMonths },
    create: { userId: user.id, targetMonths: data.emergencyFund.targetMonths },
    include: { contributions: true },
  });

  const existingTotal = emergencyFund.contributions.reduce(
    (sum: number, c: { amount: unknown }) => sum + Number(c.amount),
    0,
  );

  if (existingTotal === 0 && data.emergencyFund.currentAmount > 0) {
    await prisma.emergencyFundContribution.create({
      data: {
        emergencyFundId: emergencyFund.id,
        amount: data.emergencyFund.currentAmount,
        note: "Aporte inicial informado no wizard",
      },
    });
  }

  const currentEmergencyAmount =
    existingTotal > 0 ? existingTotal : data.emergencyFund.currentAmount;

  // 3. Roda o motor no servidor (fonte da verdade — o preview do client é só UX).
  const referenceMonth = firstDayOfCurrentMonth();
  const engineResult = runEngine({
    referenceMonth,
    incomes: data.incomes as IncomeInput[],
    expenses: data.expenses as ExpenseInput[],
    emergencyFund: {
      targetMonths: data.emergencyFund.targetMonths,
      currentAmount: currentEmergencyAmount,
    },
  });

  // 4. Upsert do plano do mês + substituição completa de incomes/expenses/insights/distribution.
  const planId = await prisma.$transaction(async (tx) => {
    const plan = await tx.financialPlan.upsert({
      where: { userId_referenceMonth: { userId: user.id, referenceMonth } },
      update: { updatedBy: user.id },
      create: {
        userId: user.id,
        title: `Planejamento de ${referenceMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`,
        referenceMonth,
        updatedBy: user.id,
      },
    });

    await tx.income.deleteMany({ where: { planId: plan.id } });
    await tx.expense.deleteMany({ where: { planId: plan.id } });
    await tx.insight.deleteMany({ where: { planId: plan.id } });
    await tx.distributionResult.deleteMany({ where: { planId: plan.id } });

    await tx.income.createMany({
      data: data.incomes.map((income) => ({
        planId: plan.id,
        name: income.name,
        amount: income.amount,
        receiveDay: income.receiveDay,
        recurrence: income.recurrence,
        category: income.category,
      })),
    });

    await tx.expense.createMany({
      data: data.expenses.map((expense) => ({
        planId: plan.id,
        name: expense.name,
        amount: expense.amount,
        dueDay: expense.dueDay,
        recurrence: expense.recurrence,
        category: expense.category,
        priority: expense.priority,
        paymentMethod: expense.paymentMethod,
      })),
    });

    if (engineResult.insights.length > 0) {
      await tx.insight.createMany({
        data: engineResult.insights.map((insight) => ({
          planId: plan.id,
          type: insight.type,
          message: insight.message,
          severity: insight.severity,
        })),
      });
    }

    await tx.distributionResult.create({
      data: {
        planId: plan.id,
        timeline: serializeTimeline(engineResult.timeline),
        totalIncome: engineResult.totalIncome,
        totalExpense: engineResult.totalExpense,
        balance: engineResult.balance,
        committedPct: engineResult.committedPct,
        healthScore: engineResult.healthScore,
      },
    });

    return plan.id;
  });

  revalidatePath("/dashboard");

  // 5. Envia o PDF por e-mail automaticamente — não bloqueia nem falha o
  // fluxo principal se o e-mail não puder ser enviado (ver sendPlanEmail).
  const fullPlan = await getPlanById(planId);
  let emailSent = false;
  let emailSkippedReason: string | undefined;

  if (fullPlan) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const emailResult = await sendPlanEmail({
      toEmail: data.personal.email,
      plan: fullPlan,
      appUrl,
    });
    emailSent = emailResult.sent;
    emailSkippedReason = emailResult.skippedReason ?? emailResult.error;
  }

  return { planId, emailSent, emailSkippedReason };
}
