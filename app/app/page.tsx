import { SCENES, SETTINGS } from "@/lib/prompts/data";
import { requireMember, supabaseServer } from "@/lib/supabase/server";
import { Gallery } from "./Gallery";

export const metadata = { title: "Cenas · Cena Pronta" };

// Os prompts e os vídeos só saem do servidor depois do login (nada fica público).
export default async function CenasPage() {
  const { member } = await requireMember();
  if (!member) return null;
  const supabase = await supabaseServer();
  const { data: rows } = await supabase.from("scene_previews").select("scene_id, path");
  const previews: Record<string, string> = {};
  if (rows?.length) {
    const { data: signed } = await supabase.storage.from("previews").createSignedUrls(rows.map((r) => r.path), 60 * 60 * 6);
    signed?.forEach((s, i) => {
      if (s.signedUrl) previews[rows[i].scene_id] = s.signedUrl;
    });
  }
  return <Gallery scenes={SCENES} settings={SETTINGS} previews={previews} isAdmin={member.role === "admin"} />;
}
