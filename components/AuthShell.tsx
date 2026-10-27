import { Logo, Mark } from "./Logo";

export function AuthShell({ title, subtitle, children }: { title: React.ReactNode; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="min-h-dvh grid lg:grid-cols-[1.1fr_1fr]">
      <section className="hidden lg:flex relative flex-col justify-between p-12 overflow-hidden border-r border-line">
        <Logo />
        <div className="relative">
          <p className="eyebrow mb-5">Prompts de vídeo · Google Flow</p>
          <h2 className="font-display text-[4.2rem] leading-[0.95] tracking-tight">
            Escolha a cena.<br />
            <span className="italic text-volt">O prompt sai pronto.</span>
          </h2>
          <p className="mt-6 max-w-md text-soft leading-relaxed">
            Biblioteca de cenas pra vídeos de produto com a sua modelo de IA — frente, costas e movimento
            natural, prontos pra colar no Flow.
          </p>
        </div>
        <p className="text-xs text-mute font-mono">Acesso só por convite</p>
        <div className="pointer-events-none absolute -right-20 top-1/4 text-volt/[0.06] floaty">
          <Mark className="h-[30rem] w-[30rem]" />
        </div>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm rise">
          <div className="lg:hidden mb-10"><Logo /></div>
          <h1 className="font-display text-4xl tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-mute">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
