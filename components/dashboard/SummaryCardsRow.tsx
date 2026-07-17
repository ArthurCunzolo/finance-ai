function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface SummaryCardsRowProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  healthScore: number;
}

export function SummaryCardsRow({
  totalIncome,
  totalExpense,
  balance,
  healthScore,
}: SummaryCardsRowProps) {
  const cards = [
    { label: "Entradas", value: formatBRL(totalIncome) },
    { label: "Saídas", value: formatBRL(totalExpense) },
    {
      label: "Sobra",
      value: formatBRL(balance),
      accent: balance >= 0 ? "text-mint-soft" : "text-danger",
    },
    { label: "Health Score", value: String(healthScore), accent: "text-gold" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-line bg-white/[0.02] p-4">
          <p className="text-[11px] text-text-faint">{card.label}</p>
          <p className={`mt-1.5 font-mono text-xl font-tabular ${card.accent ?? "text-text"}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
