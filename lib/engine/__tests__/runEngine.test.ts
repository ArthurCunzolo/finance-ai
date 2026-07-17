import { describe, expect, it } from "vitest";
import { runEngine } from "../runEngine";
import type { ExpenseInput, IncomeInput, PlanInput } from "../types";

const REFERENCE_MONTH = new Date(2026, 6, 1); // julho/2026

function income(overrides: Partial<IncomeInput> & Pick<IncomeInput, "id" | "name" | "amount" | "receiveDay">): IncomeInput {
  return {
    recurrence: "MENSAL",
    category: "SALARIO",
    ...overrides,
  };
}

function expense(
  overrides: Partial<ExpenseInput> & Pick<ExpenseInput, "id" | "name" | "amount" | "dueDay" | "priority">,
): ExpenseInput {
  return {
    recurrence: "MENSAL",
    category: "OUTROS",
    paymentMethod: "PIX",
    ...overrides,
  };
}

describe("runEngine", () => {
  it("é determinístico: mesma entrada produz mesma saída", () => {
    const plan: PlanInput = {
      referenceMonth: REFERENCE_MONTH,
      incomes: [income({ id: "inc1", name: "Salário", amount: 5000, receiveDay: 5 })],
      expenses: [
        expense({ id: "exp1", name: "Aluguel", amount: 1500, dueDay: 10, priority: "ESSENCIAL" }),
      ],
      emergencyFund: { targetMonths: 6, currentAmount: 0 },
    };

    const r1 = runEngine(plan);
    const r2 = runEngine(plan);

    expect(r1.balance).toBe(r2.balance);
    expect(r1.healthScore).toBe(r2.healthScore);
    expect(r1.timeline.length).toBe(r2.timeline.length);
  });

  it("paga despesas essenciais quando há saldo suficiente", () => {
    const plan: PlanInput = {
      referenceMonth: REFERENCE_MONTH,
      incomes: [income({ id: "inc1", name: "Salário", amount: 5000, receiveDay: 5 })],
      expenses: [
        expense({ id: "exp1", name: "Aluguel", amount: 1500, dueDay: 10, priority: "ESSENCIAL" }),
        expense({ id: "exp2", name: "Água", amount: 100, dueDay: 12, priority: "URGENTE" }),
      ],
      emergencyFund: { targetMonths: 6, currentAmount: 0 },
    };

    const result = runEngine(plan);
    const aluguel = result.timeline.find((e) => e.sourceId === "exp1");
    const agua = result.timeline.find((e) => e.sourceId === "exp2");

    expect(aluguel?.status).toBe("PAGO");
    expect(agua?.status).toBe("PAGO");
    expect(result.balance).toBe(3400);
    expect(result.deficits).toHaveLength(0);
  });

  it("gera déficit quando despesa essencial não cabe no saldo e não há remanejamento possível", () => {
    const plan: PlanInput = {
      referenceMonth: REFERENCE_MONTH,
      incomes: [income({ id: "inc1", name: "Salário", amount: 1000, receiveDay: 1 })],
      expenses: [
        expense({ id: "exp1", name: "Aluguel", amount: 1500, dueDay: 5, priority: "ESSENCIAL" }),
      ],
      emergencyFund: { targetMonths: 6, currentAmount: 0 },
    };

    const result = runEngine(plan);
    expect(result.deficits).toHaveLength(1);
    expect(result.deficits[0].shortfall).toBe(500);
    expect(result.insights.some((i) => i.type === "ALERTA_DEFICIT")).toBe(true);
  });

  it("adia despesas não essenciais quando o saldo é insuficiente", () => {
    const plan: PlanInput = {
      referenceMonth: REFERENCE_MONTH,
      incomes: [income({ id: "inc1", name: "Salário", amount: 100, receiveDay: 1 })],
      expenses: [
        expense({ id: "exp1", name: "Streaming", amount: 200, dueDay: 5, priority: "OPCIONAL" }),
      ],
      emergencyFund: { targetMonths: 6, currentAmount: 0 },
    };

    const result = runEngine(plan);
    const streaming = result.timeline.find((e) => e.sourceId === "exp1");
    expect(streaming?.status).toBe("ADIADA");
    expect(result.deficits).toHaveLength(0);
  });

  it("sugere cortes entre despesas não essenciais já pagas quando um essencial entra em déficit", () => {
    const plan: PlanInput = {
      referenceMonth: REFERENCE_MONTH,
      incomes: [income({ id: "inc1", name: "Salário", amount: 1000, receiveDay: 1 })],
      expenses: [
        expense({ id: "exp1", name: "Lazer", amount: 400, dueDay: 2, priority: "OPCIONAL" }),
        expense({ id: "exp2", name: "Aluguel", amount: 900, dueDay: 5, priority: "ESSENCIAL" }),
      ],
      emergencyFund: { targetMonths: 6, currentAmount: 0 },
    };

    const result = runEngine(plan);
    expect(result.deficits).toHaveLength(1);
    expect(result.deficits[0].suggestedCuts.length).toBeGreaterThan(0);
    expect(result.deficits[0].suggestedCuts[0].name).toBe("Lazer");
  });

  it("expande recorrência quinzenal em duas ocorrências no mês", () => {
    const plan: PlanInput = {
      referenceMonth: REFERENCE_MONTH,
      incomes: [
        income({ id: "inc1", name: "Freela", amount: 1000, receiveDay: 5, recurrence: "QUINZENAL" }),
      ],
      expenses: [],
      emergencyFund: { targetMonths: 6, currentAmount: 0 },
    };

    const result = runEngine(plan);
    const occurrences = result.timeline.filter((e) => e.sourceId === "inc1");
    expect(occurrences).toHaveLength(2);
    expect(occurrences[0].amount + occurrences[1].amount).toBe(1000);
  });

  it("calcula corretamente a cobertura da reserva de emergência", () => {
    const plan: PlanInput = {
      referenceMonth: REFERENCE_MONTH,
      incomes: [income({ id: "inc1", name: "Salário", amount: 5000, receiveDay: 5 })],
      expenses: [
        expense({ id: "exp1", name: "Aluguel", amount: 1500, dueDay: 10, priority: "ESSENCIAL" }),
      ],
      emergencyFund: { targetMonths: 6, currentAmount: 9000 },
    };

    const result = runEngine(plan);
    expect(result.emergencyFundStatus.essentialMonthlyCost).toBe(1500);
    expect(result.emergencyFundStatus.targetAmount).toBe(9000);
    expect(result.emergencyFundStatus.progressPct).toBe(100);
  });

  it("healthScore fica entre 0 e 100 sempre", () => {
    const plan: PlanInput = {
      referenceMonth: REFERENCE_MONTH,
      incomes: [income({ id: "inc1", name: "Salário", amount: 100, receiveDay: 1 })],
      expenses: [
        expense({ id: "exp1", name: "Aluguel", amount: 5000, dueDay: 2, priority: "URGENTE" }),
      ],
      emergencyFund: { targetMonths: 6, currentAmount: 0 },
    };

    const result = runEngine(plan);
    expect(result.healthScore).toBeGreaterThanOrEqual(0);
    expect(result.healthScore).toBeLessThanOrEqual(100);
  });
});
