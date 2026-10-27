"use client";
import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/browser";

function strength(p: string) {
  let s = 0;
  if (p.length >= 10) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const s = strength(password);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    if (password.length < 10 || s < 3) return setError("Use pelo menos 10 caracteres, com letras maiúsculas, minúsculas e números.");
    if (password !== confirm) return setError("As senhas não coincidem.");
    if (!/^[A-Z0-9-]{8,40}$/i.test(code.trim())) return setError("Código de convite inválido.");
    setLoading(true);
    const { data, error } = await supabaseBrowser().auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
        data: { invite_code: code.trim().toUpperCase() },
      },
    });
    setLoading(false);
    if (error) {
      setError(
        /database|invite/i.test(error.message)
          ? "Código de convite inválido, expirado ou já utilizado."
          : /rate|many/i.test(error.message)
            ? "Muitas tentativas. Aguarde alguns minutos."
            : /weak|password/i.test(error.message)
              ? "Senha fraca. Escolha outra."
              : "Não foi possível criar a conta. Verifique os dados.",
      );
      return;
    }
    if (data.session) return window.location.assign("/app");
    setDone(true);
  }

  if (done)
    return (
      <div className="card p-6 rise">
        <p className="text-2xl">📬</p>
        <h2 className="mt-3 font-semibold">Confirme seu e-mail</h2>
        <p className="mt-2 text-sm text-soft">Enviamos um link de confirmação para <b className="text-bone">{email}</b>. Abra no mesmo navegador e você entra direto.</p>
        <Link href="/login" className="btn-ghost mt-5 inline-block px-4 py-2 text-sm">Voltar ao login</Link>
      </div>
    );

  const bars = ["bg-danger", "bg-danger", "bg-ghost", "bg-volt", "bg-volt"];
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <label className="block">
        <span className="eyebrow">Código de convite</span>
        <input className="field mt-2 font-mono uppercase tracking-wider" autoComplete="off" required maxLength={40}
          value={code} onChange={(e) => setCode(e.target.value)} placeholder="CP-XXXX-XXXX-XXXX" />
      </label>
      <label className="block">
        <span className="eyebrow">E-mail</span>
        <input className="field mt-2" type="email" autoComplete="email" required maxLength={254}
          value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
      </label>
      <label className="block">
        <span className="eyebrow">Senha</span>
        <input className="field mt-2" type="password" autoComplete="new-password" required maxLength={128}
          value={password} onChange={(e) => setPassword(e.target.value)} placeholder="mín. 10 caracteres" />
        <div className="mt-2 flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`h-1 flex-1 rounded-full ${i < s ? bars[s] : "bg-line"}`} />
          ))}
        </div>
      </label>
      <label className="block">
        <span className="eyebrow">Confirmar senha</span>
        <input className="field mt-2" type="password" autoComplete="new-password" required maxLength={128}
          value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </label>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <button className="btn-volt w-full py-3.5" disabled={loading}>
        {loading ? "Criando…" : "Criar conta"}
      </button>
      <p className="text-center text-sm text-mute pt-2">
        Já tem conta? <Link href="/login" className="text-bone underline decoration-volt underline-offset-4">Entrar</Link>
      </p>
    </form>
  );
}
