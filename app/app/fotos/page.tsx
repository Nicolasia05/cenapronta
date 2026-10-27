import { requireMember } from "@/lib/supabase/server";
import { getMyAssets } from "@/lib/assets";
import { AssetManager } from "./AssetManager";

export const metadata = { title: "Minhas fotos · Cena Pronta" };

export default async function FotosPage() {
  const { member } = await requireMember();
  if (!member) return null;
  const assets = await getMyAssets();
  return <AssetManager userId={member.id} assets={assets} />;
}
