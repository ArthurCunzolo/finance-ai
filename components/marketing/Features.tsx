import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "./Reveal";

const FEATURES = [
  {
    title: "Entradas ilimitadas",
    description:
      "Salário, freelas, comissão, aluguel recebido, 13º — cada fonte de renda com valor, data e recorrência próprios.",
  },
  {
    title: "Prioridade real de pagamento",
    description:
      "De urgente a opcional. O motor nunca deixa uma conta essencial descoberta enquanto houver saldo para cobri-la.",
  },
  {
    title: "Distribuição por data",
    description:
      "Cada entrada financia as saídas que vencem depois dela — não uma soma genérica de fim de mês.",
  },
  {
    title: "Reserva de emergência calculada",
    description:
      "Com base no seu custo essencial real, não em uma regra genérica de 6 meses de salário.",
  },
  {
    title: "Alertas antes do aperto",
    description:
      "Se uma conta essencial vai faltar dinheiro, você vê exatamente quanto falta e o que pode ser adiado para cobrir.",
  },
  {
    title: "Relatório em PDF",
    description:
      "Seu plano do mês, com gráficos e indicadores, pronto para guardar, imprimir ou compartilhar com quem divide as contas com você.",
  },
];

export function Features() {
  return (
    <section id="funcionalidades" className="relative px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-faint">
            O que o motor faz
          </p>
          <h2 className="mt-3 max-w-xl text-balance font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Não é uma planilha. É uma decisão automática por conta.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={0.05 * (i % 3)}>
              <GlassCard className="h-full p-6 transition-colors hover:border-line-strong">
                <div className="mb-4 h-8 w-8 rounded-lg bg-mint-dim" />
                <h3 className="font-display text-lg font-medium tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-dim">
                  {feature.description}
                </p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
