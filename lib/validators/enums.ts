import type { PaymentMethod, Priority, Recurrence } from "@/lib/engine/types";

export const MARITAL_STATUS = [
  "SOLTEIRO",
  "CASADO",
  "UNIAO_ESTAVEL",
  "DIVORCIADO",
  "VIUVO",
] as const;
export type MaritalStatus = (typeof MARITAL_STATUS)[number];

export const MARITAL_STATUS_LABELS: Record<MaritalStatus, string> = {
  SOLTEIRO: "Solteiro(a)",
  CASADO: "Casado(a)",
  UNIAO_ESTAVEL: "União estável",
  DIVORCIADO: "Divorciado(a)",
  VIUVO: "Viúvo(a)",
};

export const FINANCIAL_GOAL = [
  "QUITAR_DIVIDAS",
  "JUNTAR_RESERVA",
  "COMPRAR_IMOVEL",
  "COMPRAR_VEICULO",
  "APOSENTADORIA",
  "ORGANIZAR_FINANCAS",
  "OUTRO",
] as const;
export type FinancialGoal = (typeof FINANCIAL_GOAL)[number];

export const FINANCIAL_GOAL_LABELS: Record<FinancialGoal, string> = {
  QUITAR_DIVIDAS: "Quitar dívidas",
  JUNTAR_RESERVA: "Juntar reserva de emergência",
  COMPRAR_IMOVEL: "Comprar imóvel",
  COMPRAR_VEICULO: "Comprar veículo",
  APOSENTADORIA: "Planejar aposentadoria",
  ORGANIZAR_FINANCAS: "Organizar as finanças no dia a dia",
  OUTRO: "Outro objetivo",
};

export const RECURRENCE_OPTIONS: readonly Recurrence[] = [
  "MENSAL",
  "QUINZENAL",
  "SEMANAL",
  "ANUAL",
  "PERSONALIZADO",
  "UNICA",
];

export const RECURRENCE_LABELS: Record<Recurrence, string> = {
  MENSAL: "Mensal",
  QUINZENAL: "Quinzenal",
  SEMANAL: "Semanal",
  ANUAL: "Anual",
  PERSONALIZADO: "Personalizado",
  UNICA: "Única (só este mês)",
};

export const INCOME_CATEGORY = [
  "SALARIO",
  "SALARIO_COMPANHEIRO",
  "VALE_ALIMENTACAO",
  "VALE_REFEICAO",
  "COMISSAO",
  "FREELANCER",
  "PIX_RECEBIDO",
  "RENDA_EXTRA",
  "ALUGUEL_RECEBIDO",
  "DIVIDENDOS",
  "ANTECIPACAO_SALARIAL",
  "BENEFICIOS",
  "DECIMO_TERCEIRO",
  "PLR",
  "OUTROS",
] as const;
export type IncomeCategory = (typeof INCOME_CATEGORY)[number];

export const INCOME_CATEGORY_LABELS: Record<IncomeCategory, string> = {
  SALARIO: "Salário",
  SALARIO_COMPANHEIRO: "Salário do(a) companheiro(a)",
  VALE_ALIMENTACAO: "Vale alimentação",
  VALE_REFEICAO: "Vale refeição",
  COMISSAO: "Comissão",
  FREELANCER: "Freelancer",
  PIX_RECEBIDO: "PIX recebido",
  RENDA_EXTRA: "Renda extra",
  ALUGUEL_RECEBIDO: "Aluguel recebido",
  DIVIDENDOS: "Dividendos",
  ANTECIPACAO_SALARIAL: "Antecipação salarial",
  BENEFICIOS: "Benefícios",
  DECIMO_TERCEIRO: "13º salário",
  PLR: "PLR",
  OUTROS: "Outros",
};

export const EXPENSE_CATEGORY = [
  "MORADIA",
  "ALUGUEL",
  "FINANCIAMENTO",
  "AGUA",
  "LUZ",
  "INTERNET",
  "TELEFONE",
  "MERCADO",
  "COMBUSTIVEL",
  "TRANSPORTE",
  "EDUCACAO",
  "SAUDE",
  "STREAMING",
  "INVESTIMENTOS",
  "LAZER",
  "PETS",
  "FILHOS",
  "CARTAO_CREDITO",
  "OUTROS",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORY)[number];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  MORADIA: "Moradia",
  ALUGUEL: "Aluguel",
  FINANCIAMENTO: "Financiamento",
  AGUA: "Água",
  LUZ: "Luz",
  INTERNET: "Internet",
  TELEFONE: "Telefone",
  MERCADO: "Mercado",
  COMBUSTIVEL: "Combustível",
  TRANSPORTE: "Transporte",
  EDUCACAO: "Educação",
  SAUDE: "Saúde",
  STREAMING: "Streaming",
  INVESTIMENTOS: "Investimentos",
  LAZER: "Lazer",
  PETS: "Pets",
  FILHOS: "Filhos",
  CARTAO_CREDITO: "Cartão de crédito",
  OUTROS: "Outros",
};

export const PRIORITY_OPTIONS: readonly Priority[] = [
  "URGENTE",
  "MUITO_ALTA",
  "ESSENCIAL",
  "ALTA",
  "MEDIA",
  "BAIXA",
  "OPCIONAL",
  "MUITO_BAIXA",
];

export const PRIORITY_LABELS: Record<Priority, string> = {
  URGENTE: "Urgente",
  MUITO_ALTA: "Muito alta",
  ESSENCIAL: "Essencial",
  ALTA: "Alta",
  MEDIA: "Média",
  BAIXA: "Baixa",
  OPCIONAL: "Opcional",
  MUITO_BAIXA: "Muito baixa",
};

/** Prioridades que o motor nunca deixa descobertas sem gerar alerta. */
export const CRITICAL_PRIORITIES: ReadonlySet<Priority> = new Set([
  "URGENTE",
  "MUITO_ALTA",
  "ESSENCIAL",
]);

export const PAYMENT_METHOD_OPTIONS: readonly PaymentMethod[] = [
  "PIX",
  "DEBITO",
  "CARTAO",
  "BOLETO",
  "DINHEIRO",
];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  PIX: "PIX",
  DEBITO: "Débito",
  CARTAO: "Cartão de crédito",
  BOLETO: "Boleto",
  DINHEIRO: "Dinheiro",
};
