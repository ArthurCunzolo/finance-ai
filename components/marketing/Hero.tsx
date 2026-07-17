"use client";

import { motion, type Variants } from "framer-motion";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";

const FlowConstellation = dynamic(
  () => import("@/components/three/FlowConstellation").then((m) => m.FlowConstellation),
  { ssr: false },
);

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: EASE_OUT_EXPO },
  }),
};

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden px-6 pt-28 pb-16">
      <div className="absolute inset-0">
        <noscript>
          <div className="h-full w-full bg-[radial-gradient(circle_at_50%_40%,rgba(47,191,131,0.12),transparent_60%)]" />
        </noscript>
        <FlowConstellation />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/10 via-transparent to-ink" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl gap-16 md:grid-cols-[1.15fr_0.85fr] md:items-center">
        <div>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-line-strong px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-mint-soft"
          >
            Motor de distribuição determinístico
          </motion.p>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.08}
            className="text-balance font-display text-[clamp(2.6rem,6vw,4.6rem)] font-semibold leading-[1.03] tracking-tight"
          >
            Cada real da sua renda,
            <br />
            com <span className="text-mint">destino definido</span> antes de cair na conta.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.16}
            className="mt-6 max-w-lg text-balance text-lg leading-relaxed text-text-dim"
          >
            Você cadastra o que entra e o que sai. O motor cruza datas, prioridades e saldo
            disponível e mostra exatamente o que é pago, o que espera e o que precisa de
            atenção — antes que vire problema.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.24}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Button>Começar meu planejamento</Button>
            <Button variant="secondary">Ver como funciona</Button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.32}
            className="mt-10 flex items-center gap-6 text-xs text-text-faint"
          >
            <span>Sem cartão de crédito</span>
            <span className="h-1 w-1 rounded-full bg-text-faint" />
            <span>Dados nunca compartilhados</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <GlassCard className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-text-dim">Julho</span>
              <span className="rounded-full bg-mint-dim px-2.5 py-1 font-mono text-[11px] text-mint-soft">
                Health Score 82
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Entradas", value: "R$ 8.750" },
                { label: "Saídas", value: "R$ 6.350" },
                { label: "Sobra", value: "R$ 2.400", accent: true },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-line bg-white/[0.02] p-3">
                  <p className="text-[11px] text-text-faint">{item.label}</p>
                  <p
                    className={`mt-1 font-mono text-[15px] font-tabular ${
                      item.accent ? "text-mint-soft" : "text-text"
                    }`}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {[
                { name: "Aluguel", date: "10/07", status: "Pago", priority: "ESSENCIAL" },
                { name: "Conta de luz", date: "12/07", status: "Pago", priority: "URGENTE" },
                { name: "Reserva de emergência", date: "20/07", status: "Alocado", priority: "ALTA" },
              ].map((row) => (
                <div
                  key={row.name}
                  className="flex items-center justify-between rounded-lg border border-line bg-white/[0.015] px-3 py-2"
                >
                  <div>
                    <p className="text-[13px] text-text">{row.name}</p>
                    <p className="text-[11px] text-text-faint">{row.date}</p>
                  </div>
                  <span className="font-mono text-[11px] text-mint-soft">{row.status}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
