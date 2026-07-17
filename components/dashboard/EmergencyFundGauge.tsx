interface EmergencyFundGaugeProps {
  progressPct: number;
  coverageDays: number;
  targetAmount: number;
  currentAmount: number;
}

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function EmergencyFundGauge({
  progressPct,
  coverageDays,
  targetAmount,
  currentAmount,
}: EmergencyFundGaugeProps) {
  const clamped = Math.min(100, Math.max(0, progressPct));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const isComplete = clamped >= 100;

  return (
    <div className="flex items-center gap-6">
      <svg width="128" height="128" viewBox="0 0 128 128" className="shrink-0 -rotate-90">
        <circle cx="64" cy="64" r={radius} stroke="rgba(237,238,235,0.08)" strokeWidth="10" fill="none" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke={isComplete ? "#c9a227" : "#2fbf83"}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
        />
      </svg>
      <div>
        <p className={`font-mono text-2xl font-medium ${isComplete ? "text-gold" : "text-mint-soft"}`}>
          {clamped.toFixed(0)}%
        </p>
        <p className="mt-1 text-[13px] text-text-dim">
          {formatBRL(currentAmount)} de {formatBRL(targetAmount)}
        </p>
        <p className="mt-0.5 text-[11px] text-text-faint">Cobre {coverageDays} dias de gastos essenciais</p>
      </div>
    </div>
  );
}
