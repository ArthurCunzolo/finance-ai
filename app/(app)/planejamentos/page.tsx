import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

/**
 * Nesta fase o produto é de captação livre (sem login) — cada plano vive no
 * seu próprio link (/dashboard/[planId]). Um histórico de "todos os meus
 * planejamentos" exige uma conta de verdade, que ainda não é obrigatória.
 * Esta página comunica isso e direciona para o fluxo que já funciona.
 */
export default function PlansListPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6 py-16">
      <GlassCard className="max-w-md p-10 text-center">
        <h1 className="font-display text-xl font-semibold tracking-tight">
          Histórico de planejamentos
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-dim">
          Por enquanto, cada plano vive no próprio link enviado para o seu e-mail ao final do
          wizard. Guardar o histórico de vários meses em uma conta é o próximo passo.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button href="/wizard/passo-1-dados">Criar um novo plano</Button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm text-text-dim hover:text-text"
          >
            Voltar ao início
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
