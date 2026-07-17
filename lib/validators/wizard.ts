import { z } from "zod";
import {
  EXPENSE_CATEGORY,
  FINANCIAL_GOAL,
  INCOME_CATEGORY,
  MARITAL_STATUS,
  PAYMENT_METHOD_OPTIONS,
  PRIORITY_OPTIONS,
  RECURRENCE_OPTIONS,
} from "./enums";

export const personalSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome."),
  maritalStatus: z.enum(MARITAL_STATUS),
  peopleCount: z.number().int().min(1, "Mínimo 1 pessoa.").max(20),
  financialGoal: z.enum(FINANCIAL_GOAL),
  financialGoalNote: z.string().trim().max(280).optional(),
});
export type PersonalFormData = z.infer<typeof personalSchema>;

export const incomeItemSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(2, "Dê um nome para esta entrada."),
  amount: z.number().positive("Informe um valor maior que zero."),
  receiveDay: z.number().int().min(1, "Dia entre 1 e 31.").max(31),
  recurrence: z.enum(RECURRENCE_OPTIONS),
  category: z.enum(INCOME_CATEGORY),
});
export type IncomeFormData = z.infer<typeof incomeItemSchema>;

export const incomesStepSchema = z.object({
  incomes: z.array(incomeItemSchema).min(1, "Adicione ao menos uma entrada financeira."),
});
export type IncomesStepData = z.infer<typeof incomesStepSchema>;

export const expenseItemSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(2, "Dê um nome para esta saída."),
  amount: z.number().positive("Informe um valor maior que zero."),
  dueDay: z.number().int().min(1, "Dia entre 1 e 31.").max(31),
  recurrence: z.enum(RECURRENCE_OPTIONS),
  category: z.enum(EXPENSE_CATEGORY),
  priority: z.enum(PRIORITY_OPTIONS),
  paymentMethod: z.enum(PAYMENT_METHOD_OPTIONS),
});
export type ExpenseFormData = z.infer<typeof expenseItemSchema>;

export const expensesStepSchema = z.object({
  expenses: z.array(expenseItemSchema).min(1, "Adicione ao menos uma despesa."),
});
export type ExpensesStepData = z.infer<typeof expensesStepSchema>;

export const emergencyFundStepSchema = z.object({
  targetMonths: z.number().int().min(1).max(24),
  currentAmount: z.number().min(0),
});
export type EmergencyFundStepData = z.infer<typeof emergencyFundStepSchema>;

export const wizardDataSchema = z.object({
  personal: personalSchema,
  incomes: incomeItemSchema.array(),
  expenses: expenseItemSchema.array(),
  emergencyFund: emergencyFundStepSchema,
});
export type WizardData = z.infer<typeof wizardDataSchema>;
