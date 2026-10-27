"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer, requireMember } from "@/lib/supabase/server";
import { AvatarInput, avatarPrompts } from "@/lib/avatar";

type Fail = { ok: false; error: string };

async function guard(): Promise<Fail | null> {
  const { member } = await requireMember();
  if (!member) return { ok: false, error: "Sessão expirada ou acesso inativo. Entre novamente." };
  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc("consume_quota");
  if (error || typeof data !== "number" || data < 0)
    return { ok: false, error: "Limite diário de gerações atingido. Tente amanhã." };
  return null;
}

export async function avatarAction(raw: unknown) {
  const parsed = AvatarInput.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Dados inválidos." };
  const blocked = await guard();
  if (blocked) return blocked;
  return { ok: true as const, prompts: avatarPrompts(parsed.data) };
}

export async function signOutAction() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/login");
}

/* Admin (o banco revalida is_admin em cada RPC) */
const InviteInput = z.object({
  label: z.string().trim().max(80).default(""),
  maxUses: z.coerce.number().int().min(1).max(1000),
  validDays: z.coerce.number().int().min(0).max(365),
  accessDays: z.coerce.number().int().min(0).max(3650),
});

export async function createInviteAction(raw: unknown) {
  const p = InviteInput.safeParse(raw);
  if (!p.success) return { ok: false as const, error: "Dados inválidos." };
  const { member } = await requireMember();
  if (member?.role !== "admin") return { ok: false as const, error: "Sem permissão." };
  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc("create_invite", {
    p_label: p.data.label || null,
    p_max_uses: p.data.maxUses,
    p_valid_days: p.data.validDays,
    p_access_days: p.data.accessDays,
  });
  if (error) return { ok: false as const, error: "Falha ao criar código." };
  revalidatePath("/app/admin");
  return { ok: true as const, code: data as string };
}

export async function revokeInviteAction(code: string) {
  if (!/^[A-Z0-9-]{8,64}$/.test(code)) return;
  const { member } = await requireMember();
  if (member?.role !== "admin") return;
  const supabase = await supabaseServer();
  await supabase.rpc("revoke_invite", { p_code: code });
  revalidatePath("/app/admin");
}

const AccessInput = z.object({
  userId: z.string().uuid(),
  approved: z.boolean(),
  extendDays: z.number().int().min(0).max(3650),
});

export async function setAccessAction(raw: unknown) {
  const p = AccessInput.safeParse(raw);
  if (!p.success) return;
  const { member } = await requireMember();
  if (member?.role !== "admin") return;
  const supabase = await supabaseServer();
  await supabase.rpc("set_user_access", {
    p_user: p.data.userId,
    p_approved: p.data.approved,
    p_extend_days: p.data.extendDays,
  });
  revalidatePath("/app/admin");
}

/* Prévias de vídeo das cenas (só admin; RLS no banco/storage também exige admin) */
const PreviewInput = z.object({
  sceneId: z.string().regex(/^[a-z0-9-]{2,60}$/),
  path: z.string().max(200),
});

export async function savePreviewAction(raw: unknown) {
  const p = PreviewInput.safeParse(raw);
  if (!p.success) return { ok: false as const, error: "Dados inválidos." };
  const { sceneId, path } = p.data;
  if (!new RegExp(`^${sceneId}/\\d{10,16}\\.(mp4|webm|mov)$`).test(path)) return { ok: false as const, error: "Arquivo inválido." };
  const { member } = await requireMember();
  if (member?.role !== "admin") return { ok: false as const, error: "Sem permissão." };
  const supabase = await supabaseServer();
  const { data: old } = await supabase.from("scene_previews").select("path").eq("scene_id", sceneId).maybeSingle();
  const { error } = await supabase
    .from("scene_previews")
    .upsert({ scene_id: sceneId, path, updated_by: member.id, updated_at: new Date().toISOString() });
  if (error) return { ok: false as const, error: "Falha ao salvar a prévia." };
  if (old?.path && old.path !== path) await supabase.storage.from("previews").remove([old.path]);
  revalidatePath("/app");
  return { ok: true as const };
}

export async function removePreviewAction(sceneId: string) {
  if (!/^[a-z0-9-]{2,60}$/.test(sceneId)) return;
  const { member } = await requireMember();
  if (member?.role !== "admin") return;
  const supabase = await supabaseServer();
  const { data: old } = await supabase.from("scene_previews").select("path").eq("scene_id", sceneId).maybeSingle();
  await supabase.from("scene_previews").delete().eq("scene_id", sceneId);
  if (old?.path) await supabase.storage.from("previews").remove([old.path]);
  revalidatePath("/app");
}
