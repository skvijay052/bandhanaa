import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "global" });

  const loginUrl = new URL("/login", request.url);

  if (error) {
    loginUrl.searchParams.set("error", "logout_failed");
  }

  return NextResponse.redirect(loginUrl, 303);
}
