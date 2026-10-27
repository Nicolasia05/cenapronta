import { notFound } from "next/navigation";
import { supabaseServer, requireMember } from "@/lib/supabase/server";
import { Admin } from "./Admin";

export const metadata = { title: "Admin · Cena Pronta" };

export default async function AdminPage() {
  const { member } = await requireMember();
  if (member?.role !== "admin") notFound();
  const supabase = await supabaseServer();
  const [{ data: invites }, { data: users }] = await Promise.all([
    supabase.from("invite_codes").select("code, label, max_uses, uses, expires_at, access_days, grants_admin, created_at").order("created_at", { ascending: false }).limit(200),
    supabase.from("profiles").select("id, email, role, approved, access_until, created_at").order("created_at", { ascending: false }).limit(500),
  ]);
  return <Admin invites={invites ?? []} users={users ?? []} selfId={member.id} />;
}
