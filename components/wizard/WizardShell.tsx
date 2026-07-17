"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useWizard } from "@/lib/wizard/WizardContext";

const STEPS = [
  { path: "/wizard/passo-1-dados", label: "Dados pessoais" },
  { path: "/wizard/passo-2-entradas", label: "Entradas" },
  { path: "/wizard/passo-3-saidas", label: "Saídas" },
  { path: "/wizard/passo-4-revisao", label: "Revisão" },
];

export function WizardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { autosaveStatus } = useWizard();
  const currentIndex = Math.max(
    0,
    STEPS.findIndex((step) => pathname?.startsWith(step.path)),
  );
  const progressPct = ((currentIndex + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-ink px-6 pb-24 pt-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="font-display text-sm font-semibold tracking-tight text-text-dim hover:text-text">
            ← Finance AI
          </Link>
          <AutosaveIndicator status={autosaveStatus} />
        </div>

        <div className="mb-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full bg-mint"
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <div className="mb-10 flex justify-between text-[11px] text-text-faint">
          {STEPS.map((step, i) => (
            <span
              key={step.path}
              className={i <= currentIndex ? "text-mint-soft" : undefined}
            >
              {String(i + 1).padStart(2, "0")}. {step.label}
            </span>
          ))}
        </div>

        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

function AutosaveIndicator({ status }: { status: "idle" | "saving" | "saved" }) {
  if (status === "idle") return <span className="text-[11px] text-text-faint">&nbsp;</span>;
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-text-faint">
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "saving" ? "animate-pulse bg-steel" : "bg-mint"
        }`}
      />
      {status === "saving" ? "Salvando…" : "Salvo automaticamente"}
    </span>
  );
}
