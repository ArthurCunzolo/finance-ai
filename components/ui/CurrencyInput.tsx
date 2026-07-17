"use client";

import { useState, type ChangeEvent } from "react";
import { cn } from "@/lib/utils/cn";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  "aria-invalid"?: boolean;
}

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Máscara estilo "digitação de caixa": digita da direita para a esquerda em centavos. */
export function CurrencyInput({
  value,
  onChange,
  placeholder,
  className,
  id,
  ...rest
}: CurrencyInputProps) {
  const [cents, setCents] = useState(() => Math.round(value * 100));

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    const nextCents = digitsOnly ? parseInt(digitsOnly, 10) : 0;
    setCents(nextCents);
    onChange(nextCents / 100);
  }

  return (
    <input
      id={id}
      inputMode="numeric"
      value={cents ? formatBRL(cents) : ""}
      onChange={handleChange}
      placeholder={placeholder ?? "R$ 0,00"}
      className={cn(
        "w-full rounded-xl border border-line bg-white/[0.02] px-4 py-3 font-mono text-sm text-text placeholder:text-text-faint focus:border-mint/60 focus:outline-none focus:ring-1 focus:ring-mint/40",
        className,
      )}
      {...rest}
    />
  );
}
