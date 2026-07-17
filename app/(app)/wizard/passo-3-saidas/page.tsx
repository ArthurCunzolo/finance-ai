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
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import {
  EXPENSE_CATEGORY,
  EXPENSE_CATEGORY_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_OPTIONS,
  PRIORITY_OPTIONS,
  RECURRENCE_LABELS,
  RECURRENCE_OPTIONS,
} from "@/lib/validators/enums";
import { expensesStepSchema, type ExpensesStepData } from "@/lib/validators/wizard";
import { useWizard } from "@/lib/wizard/WizardContext";

function newExpense() {
  return {
    id: crypto.randomUUID(),
    name: "",
    amount: 0,
    dueDay: 10,
    recurrence: "MENSAL" as const,
    category: "MORADIA" as const,
    priority: "ESSENCIAL" as const,
    paymentMethod: "PIX" as const,
  };
}

export default function ExpensesStepPage() {
  const router = useRouter();
  const { state, setExpenses } = useWizard();

  const {
    control,
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpensesStepData>({
    resolver: zodResolver(expensesStepSchema),
    defaultValues: {
      expenses: state.expenses.length > 0 ? state.expenses : [newExpense()],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "expenses" });
  const watchedExpenses = watch("expenses");

  function onSubmit(data: ExpensesStepData) {
    setExpenses(data.expenses);
    router.push("/wizard/passo-4-revisao");
  }

  return (
    <GlassCard className="p-7">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Para onde seu dinheiro vai</h1>
      <p className="mt-1.5 text-sm text-text-dim">
        A prioridade é o que o motor usa para decidir o que paga primeiro quando o saldo aperta.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
        {errors.expenses?.message && (
          <p className="mb-4 text-[13px] text-danger">{errors.expenses.message}</p>
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
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-text-faint">
                      Saída {String(index + 1).padStart(2, "0")}
                    </span>
                    {watchedExpenses?.[index]?.priority && (
                      <PriorityBadge priority={watchedExpenses[index].priority} />
                    )}
                  </div>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-text-faint transition-colors hover:text-danger"
                      aria-label="Remover saída"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Nome"
                    htmlFor={`expenses.${index}.name`}
                    error={errors.expenses?.[index]?.name?.message}
                  >
                    <TextInput
                      id={`expenses.${index}.name`}
                      placeholder="Ex: Aluguel"
                      {...register(`expenses.${index}.name` as const)}
                    />
                  </Field>

                  <Field label="Categoria" htmlFor={`expenses.${index}.category`}>
                    <Select id={`expenses.${index}.category`} {...register(`expenses.${index}.category` as const)}>
                      {EXPENSE_CATEGORY.map((cat) => (
                        <option key={cat} value={cat}>
                          {EXPENSE_CATEGORY_LABELS[cat]}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field
                    label="Valor"
                    htmlFor={`expenses.${index}.amount`}
                    error={errors.expenses?.[index]?.amount?.message}
                  >
                    <Controller
                      control={control}
                      name={`expenses.${index}.amount` as const}
                      render={({ field: f }) => (
                        <CurrencyInput id={`expenses.${index}.amount`} value={f.value} onChange={f.onChange} />
                      )}
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field
                      label="Vencimento"
                      htmlFor={`expenses.${index}.dueDay`}
                      error={errors.expenses?.[index]?.dueDay?.message}
                    >
                      <TextInput
                        id={`expenses.${index}.dueDay`}
                        type="number"
                        min={1}
                        max={31}
                        {...register(`expenses.${index}.dueDay` as const, { valueAsNumber: true })}
                      />
                    </Field>

                    <Field label="Recorrência" htmlFor={`expenses.${index}.recurrence`}>
                      <Select
                        id={`expenses.${index}.recurrence`}
                        {...register(`expenses.${index}.recurrence` as const)}
                      >
                        {RECURRENCE_OPTIONS.map((r) => (
                          <option key={r} value={r}>
                            {RECURRENCE_LABELS[r]}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>

                  <Field label="Prioridade" htmlFor={`expenses.${index}.priority`}>
                    <Select id={`expenses.${index}.priority`} {...register(`expenses.${index}.priority` as const)}>
                      {PRIORITY_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Forma de pagamento" htmlFor={`expenses.${index}.paymentMethod`}>
                    <Select
                      id={`expenses.${index}.paymentMethod`}
                      {...register(`expenses.${index}.paymentMethod` as const)}
                    >
                      {PAYMENT_METHOD_OPTIONS.map((pm) => (
                        <option key={pm} value={pm}>
                          {PAYMENT_METHOD_LABELS[pm]}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={() => append(newExpense())}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong py-4 text-sm text-text-dim transition-colors hover:border-mint/50 hover:text-mint-soft"
        >
          <Plus size={16} />
          Adicionar outra saída
        </button>

        <div className="mt-8 flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={() => router.push("/wizard/passo-2-entradas")}>
            Voltar
          </Button>
          <Button type="submit">Continuar</Button>
        </div>
      </form>
    </GlassCard>
  );
}
