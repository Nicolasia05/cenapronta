import { redirect } from "next/navigation";
import { requireMember } from "@/lib/supabase/server";
import { Logo, Mark } from "@/components/Logo";
import { NavLinks } from "./NavLinks";
import { signOutAction } from "./actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { member, reason } = await requireMember();
  if (reason === "anon") redirect("/login");

  if (!member)
    return (
      <main className="min-h-dvh grid place-items-center p-6">
        <div className="card max-w-md p-8 text-center rise">
          <span className="inline-block text-mute"><Mark className="h-12 w-12" /></span>
          <h1 className="mt-4 font-display text-3xl">Acesso inativo</h1>
          <p className="mt-2 text-sm text-soft">Seu acesso expirou ou foi pausado. Fale com quem te convidou para renovar.</p>
          <form action={signOutAction} className="mt-6">
            <button className="btn-ghost px-4 py-2 text-sm">Sair</button>
          </form>
        </div>
      </main>
    );

  const isAdmin = member.role === "admin";
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="hidden lg:flex sticky top-0 h-dvh flex-col border-r border-line p-5">
        <Logo />
        <NavLinks isAdmin={isAdmin} variant="side" />
        <div className="mt-auto">
          <div className="card p-3.5">
            <p className="eyebrow">Conta</p>
            <p className="mt-1.5 truncate text-sm">{member.email}</p>
            <p className="mt-0.5 text-xs text-mute">
              {member.accessUntil ? `Acesso até ${new Date(member.accessUntil).toLocaleDateString("pt-BR")}` : isAdmin ? "Administrador" : "Acesso vitalício"}
            </p>
            <form action={signOutAction} className="mt-3">
              <button className="text-xs text-mute hover:text-bone">Sair →</button>
            </form>
          </div>
        </div>
      </aside>

      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-line bg-ink/85 px-4 py-3 backdrop-blur">
        <Logo />
        <form action={signOutAction}><button className="text-xs text-mute">Sair</button></form>
      </header>

      <main className="min-w-0 px-4 pb-28 pt-6 sm:px-8 lg:pb-12 lg:pt-10">{children}</main>

      <nav className="lg:hidden fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ink/90 backdrop-blur">
        <NavLinks isAdmin={isAdmin} variant="bottom" />
      </nav>
    </div>
  );
}
