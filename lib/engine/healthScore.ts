import type { Deficit, EmergencyFundStatus } from "./types";

/**
 * Health Score (0-100): número único que resume a saúde financeira do mês.
 * Composição (pesos somam 100):
 *  - 40 pts: % da renda não comprometida (quanto mais sobra, melhor)
 *  - 30 pts: cobertura da reserva de emergência (100% = 6 meses = nota máxima)
 *  - 20 pts: ausência de déficits (cada déficit essencial reduz a nota)
 *  - 10 pts: ausência de despesas adiadas
 */
export function computeHealthScore(params: {
  committedPct: number; // 0-1
  emergencyFundStatus: EmergencyFundStatus;
  deficits: Deficit[];
  adiadasCount: number;
}): number {
  const { committedPct, emergencyFundStatus, deficits, adiadasCount } = params;

  const freeIncomePct = Math.max(0, 1 - committedPct);
  const scoreFreeIncome = Math.min(40, freeIncomePct * 40 * 1.5); // sobra de ~27%+ já pontua máximo

  const reserveCoverage = Math.min(1, emergencyFundStatus.progressPct / 100);
  const scoreReserve = reserveCoverage * 30;

  const scoreDeficits = Math.max(0, 20 - deficits.length * 8);

  const scoreAdiadas = Math.max(0, 10 - adiadasCount * 3);

  const total = scoreFreeIncome + scoreReserve + scoreDeficits + scoreAdiadas;
  return Math.round(Math.max(0, Math.min(100, total)));
}
