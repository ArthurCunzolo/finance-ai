"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Field, TextInput } from "@/components/ui/Field";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/wizard/passo-1-dados";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError("E-mail ou senha incorretos.");
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  async function handleGoogleLogin() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
      },
    });
  }

  return (
    <GlassCard className="p-7">
      <h1 className="font-display text-xl font-semibold tracking-tight">Entrar</h1>
      <p className="mt-1 text-sm text-text-dim">Acesse seus planejamentos salvos.</p>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-line-strong bg-white/[0.03] py-3 text-sm text-text transition-colors hover:bg-white/[0.06]"
      >
        Continuar com Google
      </button>

      <div className="my-5 flex items-center gap-3 text-[11px] text-text-faint">
        <span className="h-px flex-1 bg-line" />
        ou
        <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <Field label="E-mail" htmlFor="email">
          <TextInput
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Senha" htmlFor="password">
          <TextInput
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {error && <p className="text-[13px] text-danger">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-text-dim">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="text-mint-soft hover:underline">
          Criar conta
        </Link>
      </p>
    </GlassCard>
  );
}
