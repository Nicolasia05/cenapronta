"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Asset } from "@/lib/prompts/types";
import { supabaseBrowser } from "@/lib/supabase/browser";

const MAX_MB = 10;
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export function AssetManager({ userId, assets }: { userId: string; assets: Asset[] }) {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 rise">
        <p className="eyebrow">Minhas fotos</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl tracking-tight">
          Suas modelos e <span className="italic text-volt">produtos</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-soft">
          Salve aqui as fotos base uma vez só. Na hora de montar a cena, é só escolher e baixar pra anexar no Flow. Só você vê as suas fotos.
        </p>
      </header>
      <Section kind="model" title="Modelos" hint="1 a 4 fotos: rosto de frente, corpo inteiro, lado" userId={userId} items={assets.filter((a) => a.kind === "model")} />
      <Section kind="product" title="Produtos" hint="1 a 4 fotos: frente, costas, detalhe" userId={userId} items={assets.filter((a) => a.kind === "product")} />
    </div>
  );
}

function Section({ kind, title, hint, userId, items }: { kind: Asset["kind"]; title: string; hint: string; userId: string; items: Asset[] }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function pick(list: FileList | null) {
    setMsg(null);
    const arr = Array.from(list ?? []).slice(0, 4);
    for (const f of arr) {
      if (!TYPES[f.type]) return setMsg("Use fotos JPG, PNG ou WEBP.");
      if (f.size > MAX_MB * 1024 * 1024) return setMsg(`Cada foto pode ter até ${MAX_MB} MB.`);
    }
    setFiles(arr);
  }

  async function save() {
    if (!name.trim() || !files.length) return setMsg("Dê um nome e escolha pelo menos 1 foto.");
    setBusy(true);
    setMsg(null);
    const sb = supabaseBrowser();
    const paths: string[] = [];
    for (const f of files) {
      const path = `${userId}/${crypto.randomUUID()}.${TYPES[f.type]}`;
      const { error } = await sb.storage.from("assets").upload(path, f, { contentType: f.type, upsert: false });
      if (error) {
        if (paths.length) await sb.storage.from("assets").remove(paths);
        setBusy(false);
        return setMsg("Falha no envio. Tente de novo.");
      }
      paths.push(path);
    }
    const { error } = await sb.from("assets").insert({ kind, name: name.trim().slice(0, 80), paths });
    setBusy(false);
    if (error) {
      await sb.storage.from("assets").remove(paths);
      return setMsg("Não foi possível salvar.");
    }
    setName("");
    setFiles([]);
    router.refresh();
  }

  async function remove(a: Asset) {
    if (!confirmDelete(a.name)) return;
    const sb = supabaseBrowser();
    const { data } = await sb.from("assets").select("paths").eq("id", a.id).single();
    await sb.from("assets").delete().eq("id", a.id);
    if (data?.paths?.length) await sb.storage.from("assets").remove(data.paths as string[]);
    router.refresh();
  }

  return (
    <section className="card mb-6 p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-xs text-mute">{hint}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input className="field" maxLength={80} value={name} onChange={(e) => setName(e.target.value)}
          placeholder={kind === "model" ? "Nome da modelo (ex.: Ismara)" : "Nome do produto (ex.: vestido midi floral)"} />
        <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => pick(e.target.files)} />
        <button className="btn-ghost px-4 py-2.5 text-sm" onClick={() => input.current?.click()}>
          {files.length ? `${files.length} foto(s)` : "Escolher fotos"}
        </button>
        <button className="btn-volt px-5 py-2.5 text-sm" disabled={busy} onClick={save}>{busy ? "Salvando…" : "Salvar"}</button>
      </div>
      {msg && <p className="mt-2 text-sm text-danger">{msg}</p>}

      {items.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed border-line p-6 text-center text-sm text-mute">Nada salvo ainda.</p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((a) => (
            <div key={a.id} className="rounded-xl border border-line bg-ink-2 p-2.5">
              <div className="grid grid-cols-2 gap-1.5">
                {a.urls.map((u, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={u} alt="" className="aspect-[3/4] w-full rounded-lg object-cover" />
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="truncate text-sm">{a.name}</span>
                <button className="text-xs text-mute hover:text-danger" onClick={() => remove(a)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function confirmDelete(name: string) {
  return typeof window !== "undefined" && window.confirm(`Excluir "${name}" e as fotos?`);
}
