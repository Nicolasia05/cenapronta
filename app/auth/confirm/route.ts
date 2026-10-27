import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

const OTP_TYPES = new Set(["signup", "email", "recovery", "invite", "magiclink", "email_change"]);

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const supabase = await supabaseServer();

  let ok = false;
  if (code && code.length < 200) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  } else if (tokenHash && type && OTP_TYPES.has(type) && tokenHash.length < 200) {
    ok = !(await supabase.auth.verifyOtp({ type: type as EmailOtpType, token_hash: tokenHash })).error;
  }
  // redireciona sempre para caminho interno fixo (sem open redirect)
  return NextResponse.redirect(new URL(ok ? "/app" : "/login?erro=link", url.origin));
}
