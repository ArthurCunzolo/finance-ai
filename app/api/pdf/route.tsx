import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getPlanById } from "@/lib/data/plan";
import { PlanReport } from "@/lib/pdf/PlanReport";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const planId = searchParams.get("planId");

  if (!planId) {
    return NextResponse.json({ error: "planId é obrigatório" }, { status: 400 });
  }

  const plan = await getPlanById(planId);
  if (!plan) {
    return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
  }

  const buffer = await renderToBuffer(<PlanReport plan={plan} />);
  const monthSlug = new Date(plan.referenceMonth)
    .toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    .replace(/\s+/g, "-");

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="finance-ai-plano-${monthSlug}.pdf"`,
    },
  });
}
