"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { Reveal } from "./Reveal";

const FounderPresence = dynamic(
  () => import("@/components/three/FounderPresence").then((m) => m.FounderPresence),
  { ssr: false },
);

export function FounderSection() {
  return (
    <section id="missao" className="relative px-6 py-28">
      <div className="mx-auto grid max-w-6xl gap-14 md:grid-cols-2 md:items-center">
        <Reveal>
          <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-3xl border border-line bg-surface">
            <FounderPresence />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-faint">
            Por que existimos
          </p>
          <h2 className="mt-3 text-balance font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Dinheiro não é sobre planilha. É sobre saber o que vem depois.
          </h2>
          <p className="mt-6 max-w-md text-balance leading-relaxed text-text-dim">
            O Finance AI nasceu de um problema comum: saber quanto entra e quanto sai, mas não
            saber, na prática, se vai sobrar até o fim do mês. Construímos um motor que responde
            essa pergunta com números, não com sensação.
          </p>
          <div className="mt-8">
            <Button variant="secondary">Como nasceu este projeto</Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
