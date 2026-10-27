"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type L = { href: string; label: string; icon: string };
const MAIN: L[] = [
  { href: "/app", label: "Cenas", icon: "▶" },
  { href: "/app/fotos", label: "Minhas fotos", icon: "▦" },
];
const TOOLS: L[] = [{ href: "/app/avatar", label: "Criar avatar", icon: "◐" }];
const ADMIN: L = { href: "/app/admin", label: "Convites", icon: "⚿" };

export function NavLinks({ isAdmin, variant }: { isAdmin: boolean; variant: "side" | "bottom" }) {
  const path = usePathname();
  const active = (h: string) => (h === "/app" ? path === "/app" : path.startsWith(h));
  const tools = isAdmin ? [...TOOLS, ADMIN] : TOOLS;

  if (variant === "bottom")
    return (
      <ul className="flex justify-around px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
        {[...MAIN, ...tools].map((l) => (
          <li key={l.href}>
            <Link href={l.href} className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[0.7rem] ${active(l.href) ? "text-volt" : "text-mute"}`}>
              <span className="text-base leading-none">{l.icon}</span>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    );

  const item = (l: L) => (
    <li key={l.href}>
      <Link
        href={l.href}
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
          active(l.href) ? "bg-panel-2 text-bone" : "text-mute hover:text-bone hover:bg-panel"
        }`}
      >
        <span className={`w-4 text-center ${active(l.href) ? "text-volt" : ""}`}>{l.icon}</span>
        {l.label}
        {active(l.href) && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-volt" />}
      </Link>
    </li>
  );

  return (
    <div className="mt-10 space-y-6">
      <ul className="space-y-1">{MAIN.map(item)}</ul>
      <div>
        <p className="eyebrow px-3 mb-2">Ferramentas</p>
        <ul className="space-y-1">{tools.map(item)}</ul>
      </div>
    </div>
  );
}
