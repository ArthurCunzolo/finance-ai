"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Field, TextInput } from "@/components/ui/Field";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    setDone(true);
  }

  async function handleGoogleSignup() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  if (done) {
    return (
      <GlassCard className="p-7 text-center">
        <h1 className="font-display text-xl font-semibold tracking-tight">Quase lá</h1>
        <p className="mt-2 text-sm text-text-dim">
          Enviamos um link de confirmação para <strong className="text-text">{email}</strong>.
          Confirme para começar a usar sua conta.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-7">
      <h1 className="font-display text-xl font-semibold tracking-tight">Criar conta</h1>
      <p className="mt-1 text-sm text-text-dim">Leva menos de um minuto.</p>

      <button
        type="button"
        onClick={handleGoogleSignup}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-line-strong bg-white/[0.03] py-3 text-sm text-text transition-colors hover:bg-white/[0.06]"
      >
        Continuar com Google
      </button>

      <div className="my-5 flex items-center gap-3 text-[11px] text-text-faint">
        <span className="h-px flex-1 bg-line" />
        ou
        <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <Field label="Nome" htmlFor="name">
          <TextInput id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="E-mail" htmlFor="email">
          <TextInput
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Senha" htmlFor="password" hint="Mínimo de 6 caracteres.">
          <TextInput
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {error && <p className="text-[13px] text-danger">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Criando conta…" : "Criar conta"}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-text-dim">
        Já tem conta?{" "}
        <Link href="/login" className="text-mint-soft hover:underline">
          Entrar
        </Link>
      </p>
    </GlassCard>
  );
}
