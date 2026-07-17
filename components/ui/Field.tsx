import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
  hint?: string;
}

export function Field({ label, htmlFor, error, children, hint }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-text-dim">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-text-faint">{hint}</p>}
      {error && <p className="mt-1 text-[11px] text-danger">{error}</p>}
    </div>
  );
}

export function TextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-line bg-white/[0.02] px-4 py-3 text-sm text-text placeholder:text-text-faint focus:border-mint/60 focus:outline-none focus:ring-1 focus:ring-mint/40",
        className,
      )}
      {...props}
    />
  );
}
