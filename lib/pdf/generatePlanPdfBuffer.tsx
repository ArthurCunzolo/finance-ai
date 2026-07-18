import { renderToBuffer } from "@react-pdf/renderer";
import type { ComputedPlan } from "@/lib/types/plan";
import { PlanReport } from "./PlanReport";

export async function generatePlanPdfBuffer(plan: ComputedPlan): Promise<Buffer> {
  return renderToBuffer(<PlanReport plan={plan} />);
}

export function planPdfFilename(plan: ComputedPlan): string {
  const monthSlug = new Date(plan.referenceMonth)
    .toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    .replace(/\s+/g, "-");
  return `finance-ai-plano-${monthSlug}.pdf`;
}
