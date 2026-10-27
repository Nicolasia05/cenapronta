"use client";
import { useState, useTransition } from "react";
import { CopyButton } from "@/components/CopyButton";
import { createInviteAction, revokeInviteAction, setAccessAction } from "../actions";

type Invite = { code: string; label: string | null; max_uses: number; uses: number; expires_at: string | null; access_days: number | null; grants_admin: boolean };
type User = { id: string; email: string | null; role: string; approved: boolean; access_until: string | null; created_at: string };

const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("pt-BR") : "—");
const PRESETS = [
  { l: "Mensal", access: 30 },
  { l: "Semestral", access: 180 },
  { l: "Anual", access: 365 },
  { l: "Vitalício", access: 0 },
];

export function Admin({ invites, users, selfId }: { invites: Invite[]; users: User[]; selfId: string }) {
  const [label, setLabel] = useState("");
  const [maxUses, setMaxUses] = useState(1);
  const [validDays, setValidDays] = useState(30);
  const [accessDays, setAccessDays] = useState(0);
  const [newCode, setNewCode] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const now = Date.now();
  const active = users.filter((u) => u.approved && (!u.access_until || new Date(u.access_until).getTime() > now)).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="rise">
        <p className="eyebrow">Ferramentas · Convites</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl tracking-tight">Acessos & <span className="italic text-volt">convites</span></h1>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {([["Membros", users.length], ["Ativos", active], ["Códigos", invites.length]] as const).map(([l, n]) => (
          <div key={l} className="card p-5">
            <p className="eyebrow">{l}</p>
            <p className="mt-2 font-display text-4xl">{n}</p>
          </div>
        ))}
      </div>

      <section className="card p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Gerar convite</h2>
        <p className="mt-1 text-xs text-mute">Mande o código pro seu amigo. Ele cria a conta em /cadastro.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p.l} className="chip" data-on={accessDays === p.access} onClick={() => setAccessDays(p.access)}>{p.l}</button>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <label className="block sm:col-span-2"><span className="eyebrow">Identificação</span>
            <input className="field mt-2" maxLength={80} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex.: João (amigo)" /></label>
          <label className="block"><span className="eyebrow">Usos</span>
            <input className="field mt-2" type="number" min={1} max={1000} value={maxUses} onChange={(e) => setMaxUses(+e.target.value)} /></label>
          <label className="block"><span className="eyebrow">Código vale (dias)</span>
            <input className="field mt-2" type="number" min={0} max={365} value={validDays} onChange={(e) => setValidDays(+e.target.value)} /></label>
        </div>
        <p className="mt-3 text-xs text-mute">Acesso após ativar: <b className="text-soft">{accessDays ? `${accessDays} dias` : "vitalício"}</b></p>
        <button className="btn-volt mt-5 px-6 py-3 text-sm" disabled={pending}
          onClick={() => start(async () => {
            setErr(null);
            const r = await createInviteAction({ label, maxUses, validDays, accessDays });
            if (!r.ok) return setErr(r.error);
            setNewCode(r.code);
            setLabel("");
          })}>
          {pending ? "Gerando…" : "Gerar convite"}
        </button>
        {err && <p className="mt-3 text-sm text-danger">{err}</p>}
        {newCode && (
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-volt/40 bg-volt/[0.06] p-4 rise">
            <code className="font-mono text-lg tracking-wider text-volt">{newCode}</code>
            <CopyButton text={newCode} />
          </div>
        )}
      </section>

      <section className="card overflow-hidden">
        <h2 className="p-5 text-lg font-semibold">Membros</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-mute">
              <tr className="border-y border-line"><th className="px-5 py-2.5 font-normal">E-mail</th><th className="px-3 font-normal">Status</th><th className="px-3 font-normal">Acesso até</th><th className="px-5 font-normal text-right">Ações</th></tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const ok = u.approved && (!u.access_until || new Date(u.access_until).getTime() > now);
                const self = u.id === selfId || u.role === "admin";
                return (
                  <tr key={u.id} className="border-b border-line/60">
                    <td className="px-5 py-3 max-w-56 truncate">{u.email}{u.role === "admin" && <span className="ml-2 text-xs text-ghost">admin</span>}</td>
                    <td className="px-3"><span className={`rounded-full px-2 py-0.5 text-xs ${ok ? "bg-volt/10 text-volt" : "bg-danger/10 text-danger"}`}>{ok ? "ativo" : "inativo"}</span></td>
                    <td className="px-3 text-soft">{u.access_until ? fmt(u.access_until) : "vitalício"}</td>
                    <td className="px-5 py-2 text-right whitespace-nowrap">
                      {!self && (
                        <span className="inline-flex gap-2">
                          <button className="btn-ghost px-2.5 py-1 text-xs" disabled={pending} onClick={() => start(() => setAccessAction({ userId: u.id, approved: true, extendDays: 30 }))}>+30d</button>
                          <button className="btn-ghost px-2.5 py-1 text-xs" disabled={pending}
                            onClick={() => start(() => setAccessAction({ userId: u.id, approved: !u.approved, extendDays: 0 }))}>
                            {u.approved ? "Bloquear" : "Liberar"}
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card overflow-hidden">
        <h2 className="p-5 text-lg font-semibold">Códigos</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-mute">
              <tr className="border-y border-line"><th className="px-5 py-2.5 font-normal">Código</th><th className="px-3 font-normal">Identificação</th><th className="px-3 font-normal">Usos</th><th className="px-3 font-normal">Acesso</th><th className="px-3 font-normal">Válido até</th><th className="px-5" /></tr>
            </thead>
            <tbody>
              {invites.map((i) => {
                const expired = (i.expires_at && new Date(i.expires_at).getTime() <= now) || i.uses >= i.max_uses;
                return (
                  <tr key={i.code} className={`border-b border-line/60 ${expired ? "opacity-45" : ""}`}>
                    <td className="px-5 py-3 font-mono text-xs">{i.grants_admin ? "••••••••" : i.code}</td>
                    <td className="px-3 max-w-48 truncate text-soft">{i.label ?? "—"}</td>
                    <td className="px-3">{i.uses}/{i.max_uses}</td>
                    <td className="px-3 text-soft">{i.access_days ? `${i.access_days}d` : "vitalício"}</td>
                    <td className="px-3 text-soft">{fmt(i.expires_at)}</td>
                    <td className="px-5 text-right whitespace-nowrap">
                      {!expired && !i.grants_admin && (
                        <span className="inline-flex gap-2">
                          <CopyButton text={i.code} />
                          <button className="btn-ghost px-2.5 py-1 text-xs" disabled={pending} onClick={() => start(() => revokeInviteAction(i.code))}>Revogar</button>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
