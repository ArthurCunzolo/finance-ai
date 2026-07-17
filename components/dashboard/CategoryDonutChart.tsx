"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { TimelineEvent } from "@/lib/engine/types";
import { EXPENSE_CATEGORY_LABELS, type ExpenseCategory } from "@/lib/validators/enums";

const PALETTE = ["#2fbf83", "#8cf2c0", "#6e8ca0", "#c9a227", "#4a5560", "#3a4048", "#5b6167"];

export function CategoryDonutChart({ timeline }: { timeline: TimelineEvent[] }) {
  const byCategory = new Map<string, number>();
  for (const event of timeline) {
    if (event.type !== "expense" || event.status === "ADIADA") continue;
    byCategory.set(event.category, (byCategory.get(event.category) ?? 0) + event.amount);
  }

  const data = [...byCategory.entries()]
    .map(([category, value]) => ({
      name: EXPENSE_CATEGORY_LABELS[category as ExpenseCategory] ?? category,
      value: Number(value.toFixed(2)),
    }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return <p className="text-sm text-text-faint">Sem despesas pagas para exibir.</p>;
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="h-56 w-56 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={90}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) =>
                typeof value === "number"
                  ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                  : String(value)
              }
              contentStyle={{
                background: "#101318",
                border: "1px solid rgba(237,238,235,0.16)",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid w-full grid-cols-1 gap-1.5 text-sm sm:grid-cols-2">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
            />
            <span className="truncate text-text-dim">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
