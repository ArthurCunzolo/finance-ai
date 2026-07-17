"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Field, TextInput } from "@/components/ui/Field";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { runEngine, type DistributionResult, type ExpenseInput, type IncomeInput } from "@/lib/engine";
import { emergencyFundStepSchema, type EmergencyFundStepData } from "@/lib/validators/wizard";
import { useWizard } from "@/lib/wizard/WizardContext";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function statusLabel(status: string): string {
  switch (status) {
    case "PAGO":
      return "Pago";
    case "RECEBIDO":
      return "Recebido";
    case "ADIADA":
      return "Adiada";
    case "DEFICIT":
      return "Em déficit";
    default:
      return status;
  }
}

function statusColor(status: string): string {
  switch (status) {
    case "PAGO":
    case "RECEBIDO":
      return "text-mint-soft";
    case "DEFICIT":
      return "text-danger";
    default:
      return "text-text-faint";
  }
}

export default function ReviewStepPage() {
  const router = useRouter();
  const { state, setEmergencyFund } = useWizard();
  const [confirmed, setConfirmed] = useState(false);

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

  function onSubmitEmergencyFund(data: EmergencyFundStepData) {
    setEmergencyFund(data);
    setConfirmed(true);
  }

  if (!result) return null;

  const sortedTimeline = [...result.timeline].sort((a, b) => a.date.getTime() - b.date.getTime());

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

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryStat label="Entradas" value={formatBRL(result.totalIncome)} />
          <SummaryStat label="Saídas" value={formatBRL(result.totalExpense)} />
          <SummaryStat
            label="Sobra"
            value={formatBRL(result.balance)}
            accent={result.balance >= 0 ? "mint" : "danger"}
          />
          <SummaryStat label="Health Score" value={String(result.healthScore)} accent="gold" />
        </div>
      </GlassCard>

      <GlassCard className="p-7">
        <h2 className="font-display text-lg font-medium tracking-tight">Reserva de emergência</h2>
        <form onSubmit={handleSubmit(onSubmitEmergencyFund)} className="mt-4 grid gap-4 sm:grid-cols-2">
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

        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-5">
          <SummaryStat
            label="Custo essencial/mês"
            value={formatBRL(result.emergencyFundStatus.essentialMonthlyCost)}
          />
          <SummaryStat label="Meta" value={formatBRL(result.emergencyFundStatus.targetAmount)} />
          <SummaryStat
            label="Cobertura atual"
            value={`${result.emergencyFundStatus.coverageDays} dias`}
            accent={result.emergencyFundStatus.coverageDays < 30 ? "danger" : "mint"}
          />
        </div>
      </GlassCard>

      {result.insights.length > 0 && (
        <GlassCard className="p-7">
          <h2 className="font-display text-lg font-medium tracking-tight">Insights</h2>
          <div className="mt-4 space-y-2.5">
            {result.insights.map((insight, i) => (
              <div
                key={i}
                className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${
                  insight.severity === "CRITICO"
                    ? "border-danger/30 bg-danger/[0.06] text-text"
                    : insight.severity === "ATENCAO"
                      ? "border-gold/25 bg-gold/[0.05] text-text"
                      : "border-line bg-white/[0.015] text-text-dim"
                }`}
              >
                {insight.message}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <GlassCard className="p-7">
        <h2 className="font-display text-lg font-medium tracking-tight">Linha do tempo do mês</h2>
        <div className="mt-4 space-y-1.5">
          {sortedTimeline.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between rounded-lg border border-line bg-white/[0.01] px-4 py-2.5"
            >
              <div className="flex items-center gap-3">
                <span className="w-9 font-mono text-[11px] text-text-faint">
                  {String(event.date.getDate()).padStart(2, "0")}/
                  {String(event.date.getMonth() + 1).padStart(2, "0")}
                </span>
                <span className="text-[13px] text-text">{event.name}</span>
                {event.priority && <PriorityBadge priority={event.priority} />}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[13px] text-text-dim">{formatBRL(event.amount)}</span>
                <span className={`font-mono text-[11px] ${statusColor(event.status)}`}>
                  {statusLabel(event.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/wizard/passo-3-saidas")}>
          Voltar
        </Button>
        {confirmed ? (
          <p className="max-w-xs text-right text-[12px] text-mint-soft">
            Plano calculado. A geração de PDF e o salvamento na sua conta chegam na próxima fase, com login conectado.
          </p>
        ) : (
          <Button onClick={handleSubmit(onSubmitEmergencyFund)}>Confirmar plano do mês</Button>
        )}
      </div>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "mint" | "danger" | "gold";
}) {
  const accentClass =
    accent === "mint"
      ? "text-mint-soft"
      : accent === "danger"
        ? "text-danger"
        : accent === "gold"
          ? "text-gold"
          : "text-text";
  return (
    <div className="rounded-xl border border-line bg-white/[0.02] p-3">
      <p className="text-[11px] text-text-faint">{label}</p>
      <p className={`mt-1 font-mono text-[15px] font-tabular ${accentClass}`}>{value}</p>
    </div>
  );
}
