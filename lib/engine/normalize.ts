import type { ExpenseInput, IncomeInput, TimelineEvent } from "./types";

/**
 * Retorna o último dia válido do mês de referência, para lidar com
 * dueDay/receiveDay 29-31 em meses menores (ex: fevereiro).
 */
function clampDayToMonth(year: number, monthIndex: number, day: number): number {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  return Math.min(day, lastDay);
}

function buildDate(referenceMonth: Date, day: number): Date {
  const year = referenceMonth.getFullYear();
  const monthIndex = referenceMonth.getMonth();
  const safeDay = clampDayToMonth(year, monthIndex, day);
  return new Date(year, monthIndex, safeDay);
}

/**
 * Converte a recorrência declarada em uma ou mais ocorrências dentro do
 * mês de referência.
 *
 * - MENSAL / ANUAL / PERSONALIZADO / UNICA: 1 ocorrência no dia informado.
 *   (ANUAL é tratado como "cai neste mês" — a UI decide em qual mês do ano
 *   o evento anual pertence antes de chamar o motor.)
 * - QUINZENAL: 2 ocorrências (dia informado e dia informado + 15, com clamp).
 * - SEMANAL: ocorrências a cada 7 dias a partir do dia informado até o fim do mês.
 */
function expandOccurrences(referenceMonth: Date, baseDay: number, recurrence: string): Date[] {
  const year = referenceMonth.getFullYear();
  const monthIndex = referenceMonth.getMonth();
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();

  switch (recurrence) {
    case "QUINZENAL": {
      const first = clampDayToMonth(year, monthIndex, baseDay);
      const second = clampDayToMonth(year, monthIndex, baseDay + 15);
      const days = new Set([first, second]);
      return [...days].sort((a, b) => a - b).map((d) => new Date(year, monthIndex, d));
    }
    case "SEMANAL": {
      const days: number[] = [];
      for (let d = baseDay; d <= lastDay; d += 7) days.push(d);
      if (days.length === 0) days.push(clampDayToMonth(year, monthIndex, baseDay));
      return days.map((d) => new Date(year, monthIndex, d));
    }
    case "MENSAL":
    case "ANUAL":
    case "PERSONALIZADO":
    case "UNICA":
    default:
      return [buildDate(referenceMonth, baseDay)];
  }
}

export function normalizeIncomes(
  referenceMonth: Date,
  incomes: IncomeInput[],
): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  for (const income of incomes) {
    const occurrences = expandOccurrences(referenceMonth, income.receiveDay, income.recurrence);
    const perOccurrenceAmount =
      occurrences.length > 1 ? income.amount / occurrences.length : income.amount;

    occurrences.forEach((date, idx) => {
      events.push({
        id: `${income.id}-${idx}`,
        sourceId: income.id,
        type: "income",
        name: income.name,
        category: income.category,
        date,
        amount: perOccurrenceAmount,
        status: "RECEBIDO",
        balanceAfter: 0, // preenchido pelo sweep
      });
    });
  }
  return events;
}

export function normalizeExpenses(
  referenceMonth: Date,
  expenses: ExpenseInput[],
): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  for (const expense of expenses) {
    const occurrences = expandOccurrences(referenceMonth, expense.dueDay, expense.recurrence);
    const perOccurrenceAmount =
      occurrences.length > 1 ? expense.amount / occurrences.length : expense.amount;

    occurrences.forEach((date, idx) => {
      events.push({
        id: `${expense.id}-${idx}`,
        sourceId: expense.id,
        type: "expense",
        name: expense.name,
        category: expense.category,
        date,
        amount: perOccurrenceAmount,
        priority: expense.priority,
        status: "PAGO", // valor provisório, sweep decide o status real
        balanceAfter: 0,
      });
    });
  }
  return events;
}
