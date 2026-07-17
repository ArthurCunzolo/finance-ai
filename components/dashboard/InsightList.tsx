import type { InsightOutput } from "@/lib/engine/types";

export function InsightList({ insights }: { insights: InsightOutput[] }) {
  if (insights.length === 0) return <p className="text-sm text-text-faint">Sem insights para este mês.</p>;

  return (
    <div className="space-y-2.5">
      {insights.map((insight, i) => (
        <div
          key={i}
          className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${
            insight.severity === "CRITICO"
              ? "border-danger/30 bg-danger/[0.06] text-text"
              : insight.severity === "ATENCAO"
                ? "border-gold/25 bg-gold/[0.05] text-text"
                : "border-line bg-white/[0.015] text-text-dim"
          }`}
        >
          {insight.message}
        </div>
      ))}
    </div>
  );
}
