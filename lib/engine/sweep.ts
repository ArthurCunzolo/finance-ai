import { ESSENTIAL_PRIORITIES, PRIORITY_ORDER } from "./types";
import type { Deficit, TimelineEvent } from "./types";

/**
 * Ordena eventos por data e, dentro do mesmo dia, por prioridade
 * (despesas mais críticas processadas antes; receitas sempre antes de
 * despesas no mesmo dia, para maximizar saldo disponível).
 */
export function sortEvents(events: TimelineEvent[]): TimelineEvent[] {
  return [...events].sort((a, b) => {
    const dateDiff = a.date.getTime() - b.date.getTime();
    if (dateDiff !== 0) return dateDiff;

    if (a.type !== b.type) return a.type === "income" ? -1 : 1;

    if (a.type === "expense" && b.type === "expense") {
      const pa = a.priority ? PRIORITY_ORDER[a.priority] : 99;
      const pb = b.priority ? PRIORITY_ORDER[b.priority] : 99;
      return pa - pb;
    }
    return 0;
  });
}

export interface SweepResult {
  timeline: TimelineEvent[];
  deficits: Deficit[];
  finalBalance: number;
}

/**
 * Varredura sequencial com saldo acumulado.
 *
 * Para cada receita: soma ao saldo.
 * Para cada despesa:
 *   - saldo suficiente -> PAGO, decrementa saldo
 *   - saldo insuficiente:
 *       - se prioridade essencial -> DEFICIT, registra shortfall e sugere
 *         cortes entre despesas de prioridade mais baixa já processadas
 *         no mesmo mês (as que consumiram saldo que poderia ter coberto o essencial)
 *       - se não essencial -> ADIADA (não consome saldo, fica para o próximo ciclo)
 */
export function sweep(sortedEvents: TimelineEvent[]): SweepResult {
  let balance = 0;
  const timeline: TimelineEvent[] = [];
  const deficits: Deficit[] = [];

  // Mantém referência às despesas não-essenciais já pagas, para poder
  // sugeri-las como corte caso um evento essencial posterior fique em déficit.
  const nonEssentialPaid: TimelineEvent[] = [];

  for (const event of sortedEvents) {
    if (event.type === "income") {
      balance += event.amount;
      timeline.push({ ...event, status: "RECEBIDO", balanceAfter: balance });
      continue;
    }

    // expense
    if (balance >= event.amount) {
      balance -= event.amount;
      const paidEvent: TimelineEvent = { ...event, status: "PAGO", balanceAfter: balance };
      timeline.push(paidEvent);
      if (!event.priority || !ESSENTIAL_PRIORITIES.has(event.priority)) {
        nonEssentialPaid.push(paidEvent);
      }
      continue;
    }

    const shortfall = Number((event.amount - balance).toFixed(2));
    const isEssential = event.priority ? ESSENTIAL_PRIORITIES.has(event.priority) : false;

    if (!isEssential) {
      timeline.push({ ...event, status: "ADIADA", balanceAfter: balance });
      continue;
    }

    // Essencial em déficit: sugerir cortes entre não-essenciais já pagos,
    // ordenados do maior valor para o menor, até cobrir o shortfall.
    const sorted = [...nonEssentialPaid].sort((a, b) => b.amount - a.amount);
    const suggestedCuts: Deficit["suggestedCuts"] = [];
    let covered = 0;
    for (const candidate of sorted) {
      if (covered >= shortfall) break;
      suggestedCuts.push({
        sourceId: candidate.sourceId,
        name: candidate.name,
        amount: candidate.amount,
      });
      covered += candidate.amount;
    }

    const deficitEvent: TimelineEvent = {
      ...event,
      status: "DEFICIT",
      balanceAfter: balance,
      shortfall,
    };
    timeline.push(deficitEvent);
    deficits.push({ event: deficitEvent, shortfall, suggestedCuts });
  }

  return { timeline, deficits, finalBalance: balance };
}
