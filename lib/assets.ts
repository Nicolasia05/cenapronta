import "server-only";
import { supabaseServer } from "@/lib/supabase/server";
import type { Asset } from "@/lib/prompts/types";

/** Modelos e produtos do usuário logado, com links temporários (1h) das fotos. */
export async function getMyAssets(): Promise<Asset[]> {
  const supabase = await supabaseServer();
  const { data: rows } = await supabase
    .from("assets")
    .select("id, kind, name, paths")
    .order("created_at", { ascending: false })
    .limit(200);
  if (!rows?.length) return [];
  const all = rows.flatMap((r) => r.paths as string[]);
  const { data: signed } = all.length
    ? await supabase.storage.from("assets").createSignedUrls(all, 3600)
    : { data: [] as { path: string | null; signedUrl: string }[] };
  const map = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));
  return rows.map((r) => ({
    id: r.id as string,
    kind: r.kind as Asset["kind"],
    name: r.name as string,
    urls: (r.paths as string[]).map((p) => map.get(p)).filter(Boolean) as string[],
  }));
}
