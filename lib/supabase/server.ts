import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_KEY } from "./env";

export async function supabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          /* chamado de Server Component: o proxy renova a sessão */
        }
      },
    },
  });
}

export type Member = {
  id: string;
  email: string;
  role: "user" | "admin";
  accessUntil: string | null;
};

/** Valida sessão no servidor (getUser bate no Auth, não confia só no cookie) + checa acesso ativo. */
export async function requireMember(): Promise<{ member: Member | null; reason?: "anon" | "blocked" }> {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { member: null, reason: "anon" };
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, role, approved, access_until")
    .eq("id", user.id)
    .maybeSingle();
  const active =
    !!profile?.approved && (!profile.access_until || new Date(profile.access_until) > new Date());
  if (!profile || !active) return { member: null, reason: "blocked" };
  return {
    member: {
      id: profile.id,
      email: profile.email ?? user.email ?? "",
      role: profile.role === "admin" ? "admin" : "user",
      accessUntil: profile.access_until,
    },
  };
}
