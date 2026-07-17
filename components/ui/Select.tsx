import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full appearance-none rounded-xl border border-line bg-white/[0.02] px-4 py-3 text-sm text-text focus:border-mint/60 focus:outline-none focus:ring-1 focus:ring-mint/40",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
