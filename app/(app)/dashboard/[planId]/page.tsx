import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlanById } from "@/lib/data/plan";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { SummaryCardsRow } from "@/components/dashboard/SummaryCardsRow";
import { CategoryDonutChart } from "@/components/dashboard/CategoryDonutChart";
import { CashFlowLineChart } from "@/components/dashboard/CashFlowLineChart";
import { EmergencyFundGauge } from "@/components/dashboard/EmergencyFundGauge";
import { InsightList } from "@/components/dashboard/InsightList";
import { TimelineList } from "@/components/dashboard/TimelineList";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;

  // Acesso direto por link — sem login. Ver lib/data/plan.ts para o porquê.
  const plan = await getPlanById(planId);
  if (!plan) notFound();

  const monthLabel = new Date(plan.referenceMonth).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-ink px-6 pb-24 pt-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/" className="text-sm text-text-dim hover:text-text">
              ← Finance AI
            </Link>
            <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">
              {plan.ownerName}, seu plano de{" "}
              <span className="capitalize">{monthLabel}</span>
            </h1>
          </div>
          <div className="flex gap-3">
            <a href={`/api/pdf?planId=${plan.id}`} download>
              <Button variant="secondary">Baixar PDF</Button>
            </a>
            <Button href="/wizard/passo-1-dados">Editar plano</Button>
          </div>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-7">
            <SummaryCardsRow
              totalIncome={plan.totalIncome}
              totalExpense={plan.totalExpense}
              balance={plan.balance}
              healthScore={plan.healthScore}
            />
          </GlassCard>

          <div className="grid gap-6 md:grid-cols-2">
            <GlassCard className="p-7">
              <h2 className="mb-4 font-display text-lg font-medium tracking-tight">
                Gastos por categoria
              </h2>
              <CategoryDonutChart timeline={plan.timeline} />
            </GlassCard>

            <GlassCard className="p-7">
              <h2 className="mb-4 font-display text-lg font-medium tracking-tight">
                Saldo ao longo do mês
              </h2>
              <CashFlowLineChart timeline={plan.timeline} />
            </GlassCard>
          </div>

          <GlassCard className="p-7">
            <h2 className="mb-5 font-display text-lg font-medium tracking-tight">
              Reserva de emergência
            </h2>
            <EmergencyFundGauge
              progressPct={plan.emergencyFundStatus.progressPct}
              coverageDays={plan.emergencyFundStatus.coverageDays}
              targetAmount={plan.emergencyFundStatus.targetAmount}
              currentAmount={plan.emergencyFundStatus.currentAmount}
            />
          </GlassCard>

          {plan.insights.length > 0 && (
            <GlassCard className="p-7">
              <h2 className="mb-4 font-display text-lg font-medium tracking-tight">Insights</h2>
              <InsightList insights={plan.insights} />
            </GlassCard>
          )}

          <GlassCard className="p-7">
            <h2 className="mb-4 font-display text-lg font-medium tracking-tight">
              Linha do tempo do mês
            </h2>
            <TimelineList timeline={plan.timeline} />
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
