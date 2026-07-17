"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Field, TextInput } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import {
  FINANCIAL_GOAL,
  FINANCIAL_GOAL_LABELS,
  MARITAL_STATUS,
  MARITAL_STATUS_LABELS,
} from "@/lib/validators/enums";
import { personalSchema, type PersonalFormData } from "@/lib/validators/wizard";
import { useWizard } from "@/lib/wizard/WizardContext";

export default function PersonalStepPage() {
  const router = useRouter();
  const { state, setPersonal } = useWizard();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalFormData>({
    resolver: zodResolver(personalSchema),
    defaultValues: state.personal ?? {
      name: "",
      email: "",
      maritalStatus: "SOLTEIRO",
      peopleCount: 1,
      financialGoal: "ORGANIZAR_FINANCAS",
      financialGoalNote: "",
    },
  });

  function onSubmit(data: PersonalFormData) {
    setPersonal(data);
    router.push("/wizard/passo-2-entradas");
  }

  return (
    <GlassCard className="p-7">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Vamos começar por você</h1>
      <p className="mt-1.5 text-sm text-text-dim">
        Esses dados ajustam como o motor calcula sua reserva e seus insights.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <Field label="Como podemos te chamar?" htmlFor="name" error={errors.name?.message}>
          <TextInput id="name" placeholder="Seu nome" {...register("name")} />
        </Field>

        <Field label="Seu e-mail" htmlFor="email" error={errors.email?.message} hint="É para onde enviamos o link do seu plano em PDF.">
          <TextInput id="email" type="email" placeholder="voce@email.com" {...register("email")} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Estado civil" htmlFor="maritalStatus">
            <Select id="maritalStatus" {...register("maritalStatus")}>
              {MARITAL_STATUS.map((status) => (
                <option key={status} value={status}>
                  {MARITAL_STATUS_LABELS[status]}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Pessoas na casa"
            htmlFor="peopleCount"
            error={errors.peopleCount?.message}
          >
            <TextInput
              id="peopleCount"
              type="number"
              min={1}
              max={20}
              {...register("peopleCount", { valueAsNumber: true })}
            />
          </Field>
        </div>

        <Field label="Qual seu principal objetivo agora?" htmlFor="financialGoal">
          <Select id="financialGoal" {...register("financialGoal")}>
            {FINANCIAL_GOAL.map((goal) => (
              <option key={goal} value={goal}>
                {FINANCIAL_GOAL_LABELS[goal]}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Quer detalhar esse objetivo? (opcional)"
          htmlFor="financialGoalNote"
          error={errors.financialGoalNote?.message}
        >
          <TextInput
            id="financialGoalNote"
            placeholder="Ex: quitar o financiamento do carro até dezembro"
            {...register("financialGoalNote")}
          />
        </Field>

        <div className="flex justify-end pt-2">
          <Button type="submit">Continuar</Button>
        </div>
      </form>
    </GlassCard>
  );
}
