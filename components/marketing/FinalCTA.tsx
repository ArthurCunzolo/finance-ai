import { Button } from "@/components/ui/Button";
import { Reveal } from "./Reveal";

export function FinalCTA() {
  return (
    <section className="relative px-6 py-28">
      <Reveal className="mx-auto max-w-3xl rounded-3xl border border-line-strong bg-gradient-to-b from-white/[0.04] to-transparent p-12 text-center">
        <h2 className="text-balance font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Seu dinheiro já entra com destino. Comece a ver isso.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-balance text-text-dim">
          Leva menos de dez minutos para cadastrar seu primeiro mês.
        </p>
        <div className="mt-8 flex justify-center">
          <Button>Começar meu planejamento</Button>
        </div>
      </Reveal>
    </section>
  );
}
