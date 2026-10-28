"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SceneCard, Setting, BuildOptions, Asset } from "@/lib/prompts/types";
import { buildPrompt, buildMergePrompt, buildMotionFromFrame, buildCaptions } from "@/lib/prompts/build";
import { SCENE_ANIM } from "@/lib/prompts/anim";
import { CopyButton } from "@/components/CopyButton";
import { PreviewMedia } from "@/components/PreviewMedia";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { savePreviewAction, removePreviewAction } from "./actions";

const FLOW_URL = "https://labs.google/fx/pt/tools/flow";
const GLYPH: Record<string, string> = {
  Espelho: "🪞",
  "Look em movimento": "🚶‍♀️",
  "Detalhes do produto": "🔍",
  "Acessórios & beleza": "💍",
  "Falando com a câmera": "🎙️",
  "Dancinha & trend": "💃",
};

const animOf = (s: SceneCard) => SCENE_ANIM[s.id] ?? { type: "spin" as const };

export function Gallery({
  scenes, settings, previews, assets, isAdmin,
}: { scenes: SceneCard[]; settings: Setting[]; previews: Record<string, string>; assets: Asset[]; isAdmin: boolean }) {
  const groups = useMemo(() => ["Todas", ...Array.from(new Set(scenes.map((s) => s.group)))], [scenes]);
  const [group, setGroup] = useState("Todas");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<SceneCard | null>(null);

  const list = scenes.filter(
    (s) => (group === "Todas" || s.group === group) && (!q || `${s.name} ${s.desc}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-7 rise">
        <p className="eyebrow">Cenas prontas · Google Flow</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl tracking-tight">
          Escolha a cena. <span className="italic text-volt">Copie o prompt.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-soft">
          Cada cena gera um prompt de vídeo pronto pro Flow. Anexe as fotos base da sua modelo e do produto (frente e costas) e cole o prompt.
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="scroll-x -mx-1 flex flex-1 gap-2 px-1 pb-1">
          {groups.map((g) => (
            <button key={g} className="chip" data-on={g === group} onClick={() => setGroup(g)}>
              {GLYPH[g] ? `${GLYPH[g]} ` : ""}{g}
            </button>
          ))}
        </div>
        <input className="field sm:max-w-60" placeholder="Buscar cena…" value={q} onChange={(e) => setQ(e.target.value)} maxLength={40} />
      </div>

      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-mute">Nenhuma cena encontrada.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <button key={s.id} className="tile group flex items-start gap-4 p-3.5" onClick={() => setOpen(s)}>
              <PreviewMedia
                src={previews[s.id]}
                anim={animOf(s).type}
                mirror={animOf(s).mirror}
                wearProduct={s.kind === "wear"}
                className="h-[128px] w-[72px] shrink-0 rounded-[11px] border border-line-2"
              />
              <span className="min-w-0">
                <span className="mt-1 block font-medium leading-snug">{s.name}</span>
                <span className="mt-1 block text-xs leading-relaxed text-mute line-clamp-3">{s.desc}</span>
                <span className="mt-2 flex flex-wrap gap-1.5">
                  {s.back && <span className="rounded-full bg-volt/10 px-2 py-0.5 text-[0.65rem] text-volt">frente + costas</span>}
                  {s.talk && <span className="rounded-full bg-ghost/10 px-2 py-0.5 text-[0.65rem] text-ghost">com fala</span>}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {open && <PromptSheet scene={open} settings={settings} preview={previews[open.id]} assets={assets} isAdmin={isAdmin} onClose={() => setOpen(null)} />}
    </div>
  );
}

function PromptSheet({
  scene, settings, preview, assets, isAdmin, onClose,
}: { scene: SceneCard; settings: Setting[]; preview?: string; assets: Asset[]; isAdmin: boolean; onClose: () => void }) {
  const [o, setO] = useState<BuildOptions>({
    product: "",
    settingId: "ref",
    speech: scene.talk ? "natural" : "none",
    line: "",
    seconds: 10,
    framing: "scene",
    pov: "mostrar",
  });
  const [mode, setMode] = useState<"direto" | "2passos">("direto");
  const [modelId, setModelId] = useState("");
  const [productId, setProductId] = useState("");
  const models = assets.filter((a) => a.kind === "model");
  const products = assets.filter((a) => a.kind === "product");
  const model = models.find((a) => a.id === modelId);
  const productAsset = products.find((a) => a.id === productId);
  const prompt = useMemo(() => buildPrompt(scene, settings, o), [scene, settings, o]);
  const merge = useMemo(() => buildMergePrompt(scene, settings, o), [scene, settings, o]);
  const motion = useMemo(() => buildMotionFromFrame(scene, o), [scene, o]);
  const cap = useMemo(() => buildCaptions(scene, o.product), [scene, o.product]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="card rise relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-b-none sm:rounded-b-[1.1rem]">
        <div className="flex items-start justify-between gap-4 border-b border-line p-5">
          <PreviewMedia
            src={preview}
            anim={animOf(scene).type}
            mirror={animOf(scene).mirror}
            wearProduct={scene.kind === "wear"}
            className="h-[160px] w-[90px] shrink-0 rounded-xl border border-line-2"
          />
          <div className="min-w-0 flex-1">
            <p className="eyebrow">{scene.group}</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">{scene.name}</h2>
            <p className="mt-1 text-sm text-mute">{scene.desc}</p>
            {isAdmin && <PreviewUpload sceneId={scene.id} hasPreview={!!preview} />}
          </div>
          <button onClick={onClose} className="btn-ghost shrink-0 px-3 py-1.5 text-sm" aria-label="Fechar">✕</button>
        </div>

        <div className="overflow-y-auto p-5 space-y-5">
          {(models.length > 0 || products.length > 0) && (
            <div className="grid gap-4 sm:grid-cols-2">
              <AssetPick label="Modelo" items={models} value={modelId} onChange={setModelId} />
              <AssetPick label="Produto salvo" items={products} value={productId}
                onChange={(id) => { setProductId(id); const a = products.find((x) => x.id === id); if (a) setO({ ...o, product: a.name }); }} />
            </div>
          )}
          {(model || productAsset) && (
            <div className="rounded-xl border border-line bg-ink-2 p-3">
              <p className="eyebrow mb-2">Baixe e anexe no Flow</p>
              <div className="flex flex-wrap gap-2">
                {[...(model?.urls ?? []), ...(productAsset?.urls ?? [])].map((u, i) => (
                  <a key={u} href={`${u}&download=foto-${i + 1}`} className="group relative block" title="Baixar">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt="" className="h-20 w-[60px] rounded-lg object-cover" />
                    <span className="absolute inset-x-0 bottom-0 rounded-b-lg bg-black/70 py-0.5 text-center text-[0.6rem] text-volt opacity-0 transition group-hover:opacity-100">baixar ↓</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="eyebrow">Produto (opcional)</span>
              <input className="field mt-2" maxLength={100} value={o.product} onChange={(e) => setO({ ...o, product: e.target.value })} placeholder="Ex.: vestido midi floral verde" />
            </label>
            <label className="block">
              <span className="eyebrow">Cenário</span>
              <select className="field mt-2" value={o.settingId} onChange={(e) => setO({ ...o, settingId: e.target.value })}>
                <option value="ref">O da foto da modelo</option>
                <option value="scene">Padrão da cena</option>
                {settings.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
          </div>

          <div>
            <p className="eyebrow mb-2">Enquadramento</p>
            <div className="flex flex-wrap gap-2">
              {([["scene", "Padrão da cena"], ["full", "Corpo inteiro"], ["neck", "Pescoço pra baixo (só o look)"], ["pov", "POV (produto na mão)"]] as const).map(([v, l]) => (
                <button key={v} className="chip" data-on={o.framing === v} onClick={() => setO({ ...o, framing: v })}>{l}</button>
              ))}
            </div>
            {o.framing === "pov" && (
              <div className="mt-3 flex flex-wrap gap-2">
                {([["mostrar", "Mostrando"], ["abrir", "Abrindo"], ["apontar", "Apontando"], ["esticar", "Esticando"]] as const).map(([v, l]) => (
                  <button key={v} className="chip" data-on={o.pov === v} onClick={() => setO({ ...o, pov: v })}>{l}</button>
                ))}
              </div>
            )}
            {(o.framing === "neck" || o.framing === "pov") && (
              <p className="mt-2 text-xs text-mute">O rosto não aparece: basta uma foto do corpo da modelo. Se tiver fala, vira narração.</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div>
              <p className="eyebrow mb-2">Duração</p>
              <div className="flex gap-2">
                {([10, 8] as const).map((n) => (
                  <button key={n} className="chip" data-on={o.seconds === n} onClick={() => setO({ ...o, seconds: n })}>{n}s</button>
                ))}
              </div>
            </div>
            <div>
              <p className="eyebrow mb-2">Fala</p>
              <div className="flex flex-wrap gap-2">
                {([["none", "Sem fala"], ["natural", "Natural"], ["animada", "Animada"], ["sussurro", "Sussurro"]] as const).map(([v, l]) => (
                  <button key={v} className="chip" data-on={o.speech === v} onClick={() => setO({ ...o, speech: v })}>{l}</button>
                ))}
              </div>
            </div>
          </div>
          {o.speech !== "none" && (
            <label className="block">
              <span className="eyebrow">O que ela fala (português)</span>
              <input className="field mt-2" maxLength={160} value={o.line} onChange={(e) => setO({ ...o, line: e.target.value })} placeholder="Gente, olha que perfeito isso aqui!" />
            </label>
          )}

          <div>
            <p className="eyebrow mb-2">Modo</p>
            <div className="flex flex-wrap gap-2">
              <button className="chip" data-on={mode === "direto"} onClick={() => setMode("direto")}>Direto (1 prompt)</button>
              <button className="chip" data-on={mode === "2passos"} onClick={() => setMode("2passos")}>2 passos (imagem → vídeo)</button>
            </div>
            <p className="mt-2 text-xs text-mute">
              {mode === "direto"
                ? "Mais rápido: anexa as fotos e gera o vídeo direto (Ingredients to Video)."
                : "Mais fiel ao rosto e ao produto: primeiro gera a imagem inicial, depois anima ela (Frames to Video)."}
            </p>
          </div>

          {mode === "direto" ? (
            <PromptBox title="Prompt pro Flow" hint="Ingredients to Video · anexe as fotos da modelo + produto" text={prompt} />
          ) : (
            <>
              <PromptBox title="Prompt do movimento" hint="Frames to Video · use a imagem inicial (gerada com o prompt abaixo) como primeiro frame" text={motion} />
              <PromptBox title="Imagem inicial (mesclagem)" hint={o.framing === "neck" || o.framing === "pov" ? "Anexe até 3 fotos do produto + 1 foto do corpo da modelo (sem rosto)" : "Anexe até 3 fotos do produto + 1 foto da modelo (rosto e/ou corpo)"} text={merge} />
            </>
          )}

          <div className="rounded-xl border border-line p-4">
            <p className="eyebrow mb-2">Legendas</p>
            <ul className="space-y-2">
              {cap.captions.map((c) => (
                <li key={c} className="flex items-center justify-between gap-3 text-sm">
                  <span>{c}</span>
                  <CopyButton text={`${c}\n\n${cap.hashtags}`} label="Copiar + tags" />
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="font-mono text-xs text-ghost break-words">{cap.hashtags}</p>
              <CopyButton text={cap.hashtags} />
            </div>
          </div>

          <div className="rounded-xl border border-line bg-ink-2 p-4 text-sm text-soft">
            <p className="eyebrow mb-2">Fotos pra anexar</p>
            <ul className="space-y-1.5">
              <li>{o.framing === "neck" || o.framing === "pov" ? "① 1 foto do corpo da modelo (o rosto não aparece)." : "① 1 ou 2 fotos da modelo (rosto bem visível, corpo inteiro ajuda)."}</li>
              <li>② Foto do produto de <b className="text-bone">frente</b>{scene.back && <> e de <b className="text-bone">costas</b></>}.</li>
              <li className="text-mute">Se o Flow limitar a quantidade de imagens, junte frente e costas do produto numa imagem só, lado a lado.</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3 border-t border-line p-4">
          <CopyButton text={mode === "direto" ? prompt : motion} label={mode === "direto" ? "Copiar prompt" : "Copiar movimento"} className="flex-1 !py-3 !text-sm" />
          <a href={FLOW_URL} target="_blank" rel="noopener noreferrer" className="btn-volt flex flex-1 items-center justify-center py-3 text-sm">Abrir o Flow ↗</a>
        </div>
      </div>
    </div>
  );
}

const MAX_MB = 25;

function PreviewUpload({ sceneId, hasPreview }: { sceneId: string; hasPreview: boolean }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onFile(file: File) {
    setMsg(null);
    const ext = file.type === "video/webm" ? "webm" : file.type === "video/quicktime" ? "mov" : file.type === "video/mp4" ? "mp4" : null;
    if (!ext) return setMsg("Envie um vídeo MP4, WEBM ou MOV.");
    if (file.size > MAX_MB * 1024 * 1024) return setMsg(`Máximo ${MAX_MB} MB. Corte um trecho de 3–5s.`);
    setBusy(true);
    const path = `${sceneId}/${Date.now()}.${ext}`;
    const { error } = await supabaseBrowser().storage.from("previews").upload(path, file, { contentType: file.type, upsert: false });
    if (error) {
      setBusy(false);
      return setMsg("Falha no envio. Tente de novo.");
    }
    const r = await savePreviewAction({ sceneId, path });
    setBusy(false);
    if (!r.ok) return setMsg(r.error);
    setMsg("Prévia atualizada ✓");
    router.refresh();
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <input ref={input} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) onFile(f); }} />
      <button className="btn-ghost px-3 py-1.5 text-xs" disabled={busy} onClick={() => input.current?.click()}>
        {busy ? "Enviando…" : hasPreview ? "Trocar vídeo de prévia" : "Enviar vídeo de prévia"}
      </button>
      {hasPreview && !busy && (
        <button className="px-2 py-1.5 text-xs text-mute hover:text-danger"
          onClick={async () => { await removePreviewAction(sceneId); router.refresh(); }}>
          Remover
        </button>
      )}
      {msg && <span className="text-xs text-soft">{msg}</span>}
    </div>
  );
}

function PromptBox({ title, hint, text }: { title: string; hint: string; text: string }) {
  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{title}</p>
          <p className="mt-1 text-xs text-mute">{hint}</p>
        </div>
        <CopyButton text={text} label="Copiar" />
      </div>
      <pre className="prompt-box">{text}</pre>
    </div>
  );
}

function AssetPick({ label, items, value, onChange }: { label: string; items: Asset[]; value: string; onChange: (id: string) => void }) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <select className="field mt-2" value={value} onChange={(e) => onChange(e.target.value)} disabled={!items.length}>
        <option value="">{items.length ? "Escolher…" : "Nenhuma salva"}</option>
        {items.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>
    </label>
  );
}
