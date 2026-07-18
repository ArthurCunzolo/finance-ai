import { NextResponse } from "next/server";
import { runEngine, type ExpenseInput, type IncomeInput } from "@/lib/engine";
import { wizardDataSchema } from "@/lib/validators/wizard";
import { generatePlanPdfBuffer, planPdfFilename } from "@/lib/pdf/generatePlanPdfBuffer";
import type { ComputedPlan } from "@/lib/types/plan";

/**
 * Endpoint 100% stateless: recebe os dados do wizard no corpo da requisição,
 * roda o motor de distribuição no servidor (nunca confia em números vindos
 * do client para o documento oficial) e devolve o PDF pronto.
 * Não grava nada em banco de dados — não existe banco de dados neste projeto.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = wizardDataSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados do planejamento inválidos.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const now = new Date();
  const referenceMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const engineResult = runEngine({
    referenceMonth,
    incomes: data.incomes as IncomeInput[],
    expenses: data.expenses as ExpenseInput[],
    emergencyFund: data.emergencyFund,
  });

  const plan: ComputedPlan = {
    ownerName: data.personal.name,
    referenceMonth: referenceMonth.toISOString(),
    totalIncome: engineResult.totalIncome,
    totalExpense: engineResult.totalExpense,
    balance: engineResult.balance,
    committedPct: engineResult.committedPct,
    healthScore: engineResult.healthScore,
    timeline: engineResult.timeline,
    insights: engineResult.insights,
    incomesCount: data.incomes.length,
    expensesCount: data.expenses.length,
    emergencyFundStatus: engineResult.emergencyFundStatus,
  };

  const buffer = await generatePlanPdfBuffer(plan);

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${planPdfFilename(plan)}"`,
    },
  });
}
