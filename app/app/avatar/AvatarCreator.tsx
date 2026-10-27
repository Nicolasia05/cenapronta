"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { PromptBlock, CopyButton } from "@/components/CopyButton";
import { avatarAction } from "../actions";

const OPTS = {
  gender: [["mulher", "Mulher"], ["homem", "Homem"]],
  skin: [["clara", "Clara"], ["clara-sardas", "Clara c/ sardas"], ["morena-clara", "Morena clara"], ["morena", "Morena"], ["parda", "Parda"], ["negra", "Negra"], ["negra-retinta", "Negra retinta"], ["asiatica", "Asiática"]],
  hairType: [["liso", "Liso"], ["ondulado", "Ondulado"], ["cacheado", "Cacheado"], ["crespo", "Crespo"], ["trancas", "Tranças"], ["curto", "Curto"], ["raspado", "Raspado"]],
  hairColor: [["preto", "Preto"], ["castanho-escuro", "Castanho escuro"], ["castanho-claro", "Castanho claro"], ["loiro", "Loiro"], ["ruivo", "Ruivo"], ["luzes", "Com luzes"], ["colorido", "Colorido"]],
  eyes: [["castanhos", "Castanhos"], ["pretos", "Pretos"], ["mel", "Mel"], ["verdes", "Verdes"], ["azuis", "Azuis"]],
  body: [["magra", "Magro(a)"], ["atletica", "Atlético(a)"], ["media", "Médio"], ["curvilinea", "Curvilínea"], ["plus-size", "Plus size"]],
  style: [["clean", "Clean"], ["streetwear", "Streetwear"], ["elegante", "Elegante"], ["fitness", "Fitness"], ["praiana", "Praiana"], ["romantica", "Romântica"], ["alternativa", "Alternativa"]],
} as const;

const LABEL: Record<keyof typeof OPTS, string> = {
  gender: "Gênero", skin: "Tom de pele", hairType: "Cabelo", hairColor: "Cor do cabelo", eyes: "Olhos", body: "Corpo", style: "Estilo",
};

type Prompts = { description: string; portrait: string; sheet: string; lifestyle: string };

export function AvatarCreator() {
  const [v, setV] = useState<Record<string, string>>({
    gender: "mulher", skin: "morena", hairType: "cacheado", hairColor: "castanho-escuro", eyes: "castanhos", body: "media", style: "clean",
  });
  const [age, setAge] = useState(25);
  const [extra, setExtra] = useState("");
  const [out, setOut] = useState<Prompts | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 rise">
        <p className="eyebrow">Ferramentas · Criar avatar</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl tracking-tight">Crie uma <span className="italic text-volt">modelo</span> do zero</h1>
        <p className="mt-2 text-sm text-mute">Gera o retrato, a ficha de referência (4 ângulos) e uma foto lifestyle — sempre com o mesmo rosto.</p>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="card space-y-5 p-5 sm:p-6">
          {(Object.keys(OPTS) as (keyof typeof OPTS)[]).map((k) => (
            <div key={k}>
              <p className="eyebrow mb-2">{LABEL[k]}</p>
              <div className="flex flex-wrap gap-2">
                {OPTS[k].map(([val, l]) => (
                  <button key={val} type="button" className="chip" data-on={v[k] === val} onClick={() => setV({ ...v, [k]: val })}>{l}</button>
                ))}
              </div>
            </div>
          ))}
          <label className="block">
            <span className="eyebrow">Idade: <b className="text-bone">{age}</b> anos</span>
            <input type="range" min={21} max={55} value={age} onChange={(e) => setAge(+e.target.value)} className="mt-3 w-full accent-[#d4ff3a]" />
          </label>
          <label className="block">
            <span className="eyebrow">Detalhes extras (opcional)</span>
            <input className="field mt-2" maxLength={160} value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Ex.: piercing no nariz, óculos, covinhas" />
          </label>
          <button className="btn-volt w-full py-3.5" disabled={pending}
            onClick={() => { setErr(null); start(async () => {
              const r = await avatarAction({ ...v, age, extra });
              if (!r.ok) return setErr(r.error);
              setOut(r.prompts);
            }); }}>
            {pending ? "Gerando…" : "Gerar avatar ✦"}
          </button>
          {err && <p className="text-center text-sm text-danger">{err}</p>}
        </div>

        <div className="card p-5 sm:p-6">
          {!out ? (
            <div className="grid h-full min-h-64 place-items-center text-center text-sm text-mute">
              Escolha as características e clique em gerar.
            </div>
          ) : (
            <div className="space-y-6 rise" key={out.portrait}>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="eyebrow">Descrição da modelo</p>
                  <CopyButton text={out.description} />
                </div>
                <p className="rounded-xl border border-line bg-ink-2 p-3 text-sm text-soft">{out.description}</p>
              </div>
              <PromptBlock title="① Retrato base" hint="Gere várias e escolha o rosto definitivo" text={out.portrait} />
              <PromptBlock title="② Ficha de referência" hint="Anexe o retrato escolhido como referência" text={out.sheet} />
              <PromptBlock title="③ Foto lifestyle" hint="Primeira foto do perfil / teste de consistência" text={out.lifestyle} />
              <Link href="/app" className="btn-ghost block py-2.5 text-center text-sm">Ir para as cenas →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
