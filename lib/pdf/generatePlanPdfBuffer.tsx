import { renderToBuffer } from "@react-pdf/renderer";
import type { DashboardPlan } from "@/lib/data/plan";
import { PlanReport } from "./PlanReport";

export async function generatePlanPdfBuffer(plan: DashboardPlan): Promise<Buffer> {
  return renderToBuffer(<PlanReport plan={plan} />);
}

export function planPdfFilename(plan: DashboardPlan): string {
  const monthSlug = new Date(plan.referenceMonth)
    .toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    .replace(/\s+/g, "-");
  return `finance-ai-plano-${monthSlug}.pdf`;
}
