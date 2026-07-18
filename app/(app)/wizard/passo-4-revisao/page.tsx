"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Field, TextInput } from "@/components/ui/Field";
import { SummaryCardsRow } from "@/components/dashboard/SummaryCardsRow";
import { CategoryDonutChart } from "@/components/dashboard/CategoryDonutChart";
import { CashFlowLineChart } from "@/components/dashboard/CashFlowLineChart";
import { EmergencyFundGauge } from "@/components/dashboard/EmergencyFundGauge";
import { InsightList } from "@/components/dashboard/InsightList";
import { TimelineList } from "@/components/dashboard/TimelineList";
import { runEngine, type DistributionResult, type ExpenseInput, type IncomeInput } from "@/lib/engine";
import { emergencyFundStepSchema, type EmergencyFundStepData } from "@/lib/validators/wizard";
import { useWizard } from "@/lib/wizard/WizardContext";
import type { WizardData } from "@/lib/validators/wizard";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ReviewStepPage() {
  const router = useRouter();
  const { state, setEmergencyFund } = useWizard();
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfReady, setPdfReady] = useState(false);

  useEffect(() => {
    if (!state.personal) router.replace("/wizard/passo-1-dados");
    else if (state.incomes.length === 0) router.replace("/wizard/passo-2-entradas");
    else if (state.expenses.length === 0) router.replace("/wizard/passo-3-saidas");
  }, [state.personal, state.incomes.length, state.expenses.length, router]);

  const { control, handleSubmit, watch } = useForm<EmergencyFundStepData>({
    resolver: zodResolver(emergencyFundStepSchema),
    defaultValues: state.emergencyFund,
  });
  const liveEmergencyFund = watch();

  // Tudo é calculado no navegador, na hora — não existe requisição, banco de
  // dados ou login envolvido para chegar até aqui.
  const result: DistributionResult | null = useMemo(() => {
    if (!state.personal || state.incomes.length === 0 || state.expenses.length === 0) return null;
    const referenceMonth = new Date();
    referenceMonth.setDate(1);

    return runEngine({
      referenceMonth,
      incomes: state.incomes as IncomeInput[],
      expenses: state.expenses as ExpenseInput[],
      emergencyFund: liveEmergencyFund,
    });
  }, [state.personal, state.incomes, state.expenses, liveEmergencyFund]);

  function onUpdateEmergencyFund(data: EmergencyFundStepData) {
    setEmergencyFund(data);
  }

  async function handleGeneratePdf(data: EmergencyFundStepData) {
    setEmergencyFund(data);
    setPdfError(null);

    if (!state.personal) return;

    setIsGenerating(true);
    try {
      const payload: WizardData = {
        personal: state.personal,
        incomes: state.incomes,
        expenses: state.expenses,
        emergencyFund: data,
      };

      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Não foi possível gerar o PDF. Tente novamente.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "finance-ai-plano.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setPdfReady(true);
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : "Erro ao gerar o PDF.");
    } finally {
      setIsGenerating(false);
    }
  }

  if (!result) return null;

  return (
    <div className="space-y-6">
      <GlassCard className="p-7">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {state.personal?.name ? `${state.personal.name}, aqui está seu plano` : "Seu plano do mês"}
        </h1>
        <p className="mt-1.5 text-sm text-text-dim">
          Calculado a partir de {state.incomes.length}{" "}
          {state.incomes.length === 1 ? "entrada" : "entradas"} e {state.expenses.length}{" "}
          {state.expenses.length === 1 ? "saída" : "saídas"}.
        </p>

        <div className="mt-6">
          <SummaryCardsRow
            totalIncome={result.totalIncome}
            totalExpense={result.totalExpense}
            balance={result.balance}
            healthScore={result.healthScore}
          />
        </div>
      </GlassCard>

      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard className="p-7">
          <h2 className="mb-4 font-display text-lg font-medium tracking-tight">
            Gastos por categoria
          </h2>
          <CategoryDonutChart timeline={result.timeline} />
        </GlassCard>

        <GlassCard className="p-7">
          <h2 className="mb-4 font-display text-lg font-medium tracking-tight">
            Saldo ao longo do mês
          </h2>
          <CashFlowLineChart timeline={result.timeline} />
        </GlassCard>
      </div>

      <GlassCard className="p-7">
        <h2 className="font-display text-lg font-medium tracking-tight">Reserva de emergência</h2>
        <form onSubmit={handleSubmit(onUpdateEmergencyFund)} className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Meses de cobertura desejados" htmlFor="targetMonths">
            <Controller
              control={control}
              name="targetMonths"
              render={({ field: f }) => (
                <TextInput
                  id="targetMonths"
                  type="number"
                  min={1}
                  max={24}
                  value={f.value}
                  onChange={(e) => f.onChange(Number(e.target.value))}
                />
              )}
            />
          </Field>
          <Field label="Quanto você já tem guardado" htmlFor="currentAmount">
            <Controller
              control={control}
              name="currentAmount"
              render={({ field: f }) => (
                <CurrencyInput id="currentAmount" value={f.value} onChange={f.onChange} />
              )}
            />
          </Field>
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" variant="secondary">
              Atualizar reserva
            </Button>
          </div>
        </form>

        <div className="mt-5 border-t border-line pt-5">
          <EmergencyFundGauge
            progressPct={result.emergencyFundStatus.progressPct}
            coverageDays={result.emergencyFundStatus.coverageDays}
            targetAmount={result.emergencyFundStatus.targetAmount}
            currentAmount={result.emergencyFundStatus.currentAmount}
          />
        </div>
      </GlassCard>

      {result.insights.length > 0 && (
        <GlassCard className="p-7">
          <h2 className="mb-4 font-display text-lg font-medium tracking-tight">Insights</h2>
          <InsightList insights={result.insights} />
        </GlassCard>
      )}

      <GlassCard className="p-7">
        <h2 className="mb-4 font-display text-lg font-medium tracking-tight">
          Linha do tempo do mês
        </h2>
        <TimelineList timeline={result.timeline} />
      </GlassCard>

      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={() => router.push("/wizard/passo-3-saidas")}>
          Voltar
        </Button>
        <div className="text-right">
          {pdfError && <p className="mb-2 text-[12px] text-danger">{pdfError}</p>}
          {pdfReady && (
            <p className="mb-2 text-[12px] text-mint-soft">
              PDF baixado. Pode gerar de novo quantas vezes quiser.
            </p>
          )}
          <Button onClick={handleSubmit(handleGeneratePdf)} disabled={isGenerating}>
            {isGenerating ? "Gerando PDF…" : pdfReady ? "Baixar PDF de novo" : "Gerar meu plano em PDF"}
          </Button>
          <p className="mt-2 text-[11px] text-text-faint">
            {formatBRL(result.balance)} livres neste mês
          </p>
        </div>
      </div>
    </div>
  );
}
