import { NextResponse } from "next/server";
import { getPlanById } from "@/lib/data/plan";
import { generatePlanPdfBuffer, planPdfFilename } from "@/lib/pdf/generatePlanPdfBuffer";

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

  const buffer = await generatePlanPdfBuffer(plan);

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${planPdfFilename(plan)}"`,
    },
  });
}
