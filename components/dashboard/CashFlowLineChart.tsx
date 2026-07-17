"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TimelineEvent } from "@/lib/engine/types";

export function CashFlowLineChart({ timeline }: { timeline: TimelineEvent[] }) {
  const sorted = [...timeline].sort((a, b) => a.date.getTime() - b.date.getTime());

  const data = sorted.map((event) => ({
    day: event.date.getDate(),
    saldo: Number(event.balanceAfter.toFixed(2)),
  }));

  if (data.length === 0) {
    return <p className="text-sm text-text-faint">Sem eventos para exibir.</p>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="saldoGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2fbf83" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#2fbf83" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(237,238,235,0.06)" vertical={false} />
          <XAxis
            dataKey="day"
            tickFormatter={(d) => `${d}`}
            stroke="rgba(237,238,235,0.3)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="rgba(237,238,235,0.3)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
          />
          <Tooltip
            formatter={(value) =>
              typeof value === "number"
                ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                : String(value)
            }
            labelFormatter={(d) => `Dia ${d}`}
            contentStyle={{
              background: "#101318",
              border: "1px solid rgba(237,238,235,0.16)",
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="saldo"
            stroke="#2fbf83"
            strokeWidth={2}
            fill="url(#saldoGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
