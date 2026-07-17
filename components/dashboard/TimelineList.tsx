import { PriorityBadge } from "@/components/ui/PriorityBadge";
import type { TimelineEvent } from "@/lib/engine/types";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function statusLabel(status: string): string {
  switch (status) {
    case "PAGO":
      return "Pago";
    case "RECEBIDO":
      return "Recebido";
    case "ADIADA":
      return "Adiada";
    case "DEFICIT":
      return "Em déficit";
    default:
      return status;
  }
}

function statusColor(status: string): string {
  switch (status) {
    case "PAGO":
    case "RECEBIDO":
      return "text-mint-soft";
    case "DEFICIT":
      return "text-danger";
    default:
      return "text-text-faint";
  }
}

export function TimelineList({ timeline }: { timeline: TimelineEvent[] }) {
  const sorted = [...timeline].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="space-y-1.5">
      {sorted.map((event) => (
        <div
          key={event.id}
          className="flex items-center justify-between rounded-lg border border-line bg-white/[0.01] px-4 py-2.5"
        >
          <div className="flex items-center gap-3">
            <span className="w-9 font-mono text-[11px] text-text-faint">
              {String(event.date.getDate()).padStart(2, "0")}/
              {String(event.date.getMonth() + 1).padStart(2, "0")}
            </span>
            <span className="text-[13px] text-text">{event.name}</span>
            {event.priority && <PriorityBadge priority={event.priority} />}
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[13px] text-text-dim">{formatBRL(event.amount)}</span>
            <span className={`font-mono text-[11px] ${statusColor(event.status)}`}>
              {statusLabel(event.status)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
