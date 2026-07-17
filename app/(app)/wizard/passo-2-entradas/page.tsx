"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Field, TextInput } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import {
  INCOME_CATEGORY,
  INCOME_CATEGORY_LABELS,
  RECURRENCE_LABELS,
  RECURRENCE_OPTIONS,
} from "@/lib/validators/enums";
import { incomesStepSchema, type IncomesStepData } from "@/lib/validators/wizard";
import { useWizard } from "@/lib/wizard/WizardContext";

function newIncome() {
  return {
    id: crypto.randomUUID(),
    name: "",
    amount: 0,
    receiveDay: 5,
    recurrence: "MENSAL" as const,
    category: "SALARIO" as const,
  };
}

export default function IncomesStepPage() {
  const router = useRouter();
  const { state, setIncomes } = useWizard();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IncomesStepData>({
    resolver: zodResolver(incomesStepSchema),
    defaultValues: {
      incomes: state.incomes.length > 0 ? state.incomes : [newIncome()],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "incomes" });

  function onSubmit(data: IncomesStepData) {
    setIncomes(data.incomes);
    router.push("/wizard/passo-3-saidas");
  }

  const totalIncome = fields.length; // apenas para exibir contagem em tempo real na UI está fora do escopo síncrono do RHF; total real aparece na revisão

  return (
    <GlassCard className="p-7">
      <h1 className="font-display text-2xl font-semibold tracking-tight">De onde vem seu dinheiro</h1>
      <p className="mt-1.5 text-sm text-text-dim">
        Adicione quantas fontes de renda precisar — salário, freelas, aluguel recebido, o que for.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
        {errors.incomes?.root?.message && (
          <p className="mb-4 text-[13px] text-danger">{errors.incomes.root.message}</p>
        )}
        {errors.incomes?.message && (
          <p className="mb-4 text-[13px] text-danger">{errors.incomes.message}</p>
        )}

        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {fields.map((field, index) => (
              <motion.div
                key={field.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden rounded-2xl border border-line bg-white/[0.015] p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-text-faint">
                    Entrada {String(index + 1).padStart(2, "0")}
                  </span>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-text-faint transition-colors hover:text-danger"
                      aria-label="Remover entrada"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Nome"
                    htmlFor={`incomes.${index}.name`}
                    error={errors.incomes?.[index]?.name?.message}
                  >
                    <TextInput
                      id={`incomes.${index}.name`}
                      placeholder="Ex: Salário CLT"
                      {...register(`incomes.${index}.name` as const)}
                    />
                  </Field>

                  <Field
                    label="Categoria"
                    htmlFor={`incomes.${index}.category`}
                  >
                    <Select id={`incomes.${index}.category`} {...register(`incomes.${index}.category` as const)}>
                      {INCOME_CATEGORY.map((cat) => (
                        <option key={cat} value={cat}>
                          {INCOME_CATEGORY_LABELS[cat]}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field
                    label="Valor"
                    htmlFor={`incomes.${index}.amount`}
                    error={errors.incomes?.[index]?.amount?.message}
                  >
                    <Controller
                      control={control}
                      name={`incomes.${index}.amount` as const}
                      render={({ field: f }) => (
                        <CurrencyInput
                          id={`incomes.${index}.amount`}
                          value={f.value}
                          onChange={f.onChange}
                        />
                      )}
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field
                      label="Dia do recebimento"
                      htmlFor={`incomes.${index}.receiveDay`}
                      error={errors.incomes?.[index]?.receiveDay?.message}
                    >
                      <TextInput
                        id={`incomes.${index}.receiveDay`}
                        type="number"
                        min={1}
                        max={31}
                        {...register(`incomes.${index}.receiveDay` as const, { valueAsNumber: true })}
                      />
                    </Field>

                    <Field label="Recorrência" htmlFor={`incomes.${index}.recurrence`}>
                      <Select
                        id={`incomes.${index}.recurrence`}
                        {...register(`incomes.${index}.recurrence` as const)}
                      >
                        {RECURRENCE_OPTIONS.map((r) => (
                          <option key={r} value={r}>
                            {RECURRENCE_LABELS[r]}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={() => append(newIncome())}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong py-4 text-sm text-text-dim transition-colors hover:border-mint/50 hover:text-mint-soft"
        >
          <Plus size={16} />
          Adicionar outra entrada
        </button>

        <div className="mt-8 flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={() => router.push("/wizard/passo-1-dados")}>
            Voltar
          </Button>
          <Button type="submit">Continuar ({totalIncome} {totalIncome === 1 ? "entrada" : "entradas"})</Button>
        </div>
      </form>
    </GlassCard>
  );
}
