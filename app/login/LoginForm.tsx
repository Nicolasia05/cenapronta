"use client";
import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    const id = email.trim().toLowerCase();
    // usuário sem "@" vira o e-mail interno (ex.: teste12 → teste12@cena-pronta.local)
    const login = id.includes("@") ? id : `${id}@cena-pronta.local`;
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email: login, password });
    if (error) {
      setLoading(false);
      // mensagem genérica: não revela se o e-mail existe
      setError(
        /confirm/i.test(error.message)
          ? "Confirme seu e-mail antes de entrar (veja sua caixa de entrada)."
          : /rate|many/i.test(error.message)
            ? "Muitas tentativas. Aguarde alguns minutos."
            : "E-mail ou senha incorretos.",
      );
      return;
    }
    window.location.assign("/app");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <label className="block">
        <span className="eyebrow">E-mail ou usuário</span>
        <input className="field mt-2" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} required maxLength={254}
          value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
      </label>
      <label className="block">
        <span className="eyebrow">Senha</span>
        <input className="field mt-2" type="password" autoComplete="current-password" required maxLength={128}
          value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </label>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <button className="btn-volt w-full py-3.5" disabled={loading || !email || !password}>
        {loading ? "Entrando…" : "Entrar"}
      </button>
      <p className="text-center text-sm text-mute pt-2">
        Recebeu um convite?{" "}
        <Link href="/cadastro" className="text-bone underline decoration-volt underline-offset-4">Criar conta</Link>
      </p>
    </form>
  );
}
