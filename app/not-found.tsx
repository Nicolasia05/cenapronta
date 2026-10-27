import Link from "next/link";
import { Mark } from "@/components/Logo";
export default function NotFound() {
  return (
    <main className="min-h-dvh grid place-items-center p-6 text-center">
      <div>
        <span className="inline-block text-volt floaty"><Mark className="h-16 w-16" /></span>
        <h1 className="mt-4 font-display text-4xl">Cena não encontrada</h1>
        <Link href="/app" className="btn-ghost mt-6 inline-block px-4 py-2 text-sm">Voltar</Link>
      </div>
    </main>
  );
}
