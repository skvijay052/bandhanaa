import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedPath = url.searchParams.get("next") ?? "/discover";
  const nextPath =
    requestedPath.startsWith("/") && !requestedPath.startsWith("//")
      ? requestedPath
      : "/discover";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(nextPath, url.origin));
    }
  }

  const errorPath =
    nextPath === "/reset-password"
      ? "/forgot-password?error=invalid_recovery_link"
      : "/login?error=oauth";

  return NextResponse.redirect(new URL(errorPath, url.origin));
}
