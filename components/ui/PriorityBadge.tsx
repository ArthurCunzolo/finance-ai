import { PRIORITY_LABELS, CRITICAL_PRIORITIES } from "@/lib/validators/enums";
import type { Priority } from "@/lib/engine/types";
import { cn } from "@/lib/utils/cn";

const NON_CRITICAL_STYLE = "border-line-strong bg-white/[0.03] text-text-dim";
const CRITICAL_STYLE = "border-danger/40 bg-danger/10 text-danger";

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const isCritical = CRITICAL_PRIORITIES.has(priority);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px]",
        isCritical ? CRITICAL_STYLE : NON_CRITICAL_STYLE,
        className,
      )}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
