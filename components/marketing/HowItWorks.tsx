import { Reveal } from "./Reveal";

const STEPS = [
  { n: "01", title: "Dados pessoais", description: "Estado civil, pessoas na casa e o objetivo por trás do plano." },
  { n: "02", title: "Entradas", description: "Toda fonte de renda, com valor, dia de recebimento e recorrência." },
  { n: "03", title: "Saídas", description: "Cada conta com categoria, vencimento e prioridade real." },
  { n: "04", title: "Distribuição", description: "O motor cruza tudo e monta a linha do tempo do seu mês." },
  { n: "05", title: "Plano em PDF", description: "Resumo, gráficos e reserva de emergência, prontos para guardar." },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="relative px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-faint">
            Do cadastro ao plano
          </p>
          <h2 className="mt-3 max-w-xl text-balance font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Cinco passos. Nenhum reprocessamento manual.
          </h2>
        </Reveal>

        <div className="relative mt-16 grid gap-x-6 gap-y-10 md:grid-cols-5">
          <div className="pointer-events-none absolute top-[22px] left-0 hidden h-px w-full bg-line-strong md:block" />
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={0.08 * i} className="relative">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-ink font-mono text-[13px] text-mint-soft">
                {step.n}
              </div>
              <h3 className="font-display text-base font-medium tracking-tight">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-text-dim">{step.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
