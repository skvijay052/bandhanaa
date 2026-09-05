import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import {
  registrationDestination,
  type RegistrationProfileState,
} from "@/lib/registration-state";

const GOOGLE_AUTH_ERROR_PATH = "/login?error=google_auth_failed";

function redirectTo(requestUrl: URL, path: string) {
  return NextResponse.redirect(new URL(path, requestUrl.origin));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedPath = url.searchParams.get("next") ?? "/discover";
  const nextPath =
    requestedPath.startsWith("/") && !requestedPath.startsWith("//")
      ? requestedPath
      : "/discover";

  if (!code) {
    return redirectTo(
      url,
      nextPath === "/reset-password"
        ? "/forgot-password?error=invalid_recovery_link"
        : GOOGLE_AUTH_ERROR_PATH,
    );
  }

  const supabase = await createClient();
  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) return redirectTo(url, GOOGLE_AUTH_ERROR_PATH);

  // Recovery links must retain their explicit destination.
  if (nextPath === "/reset-password") return redirectTo(url, nextPath);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return redirectTo(url, GOOGLE_AUTH_ERROR_PATH);

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "id,email,display_name,avatar_url,registration_status,onboarding_completed,is_verified",
    )
    .eq("id", user.id)
    .maybeSingle();

  // public.handle_new_user creates this row. Do not insert a second profile here.
  if (profileError || !profile) return redirectTo(url, GOOGLE_AUTH_ERROR_PATH);

  const metadata = user.user_metadata ?? {};
  const displayName =
    metadata.full_name ?? metadata.name ?? user.email?.split("@")[0] ?? null;
  const avatarUrl = metadata.avatar_url ?? metadata.picture ?? null;
  const updates: {
    email?: string;
    display_name?: string;
    avatar_url?: string;
  } = {};

  if (user.email && profile.email !== user.email) updates.email = user.email;
  const emailName = user.email?.split("@")[0];
  if (
    displayName &&
    (!profile.display_name || profile.display_name === emailName)
  ) {
    updates.display_name = displayName;
  }
  if (!profile.avatar_url && avatarUrl) updates.avatar_url = avatarUrl;

  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);
    if (updateError) return redirectTo(url, GOOGLE_AUTH_ERROR_PATH);
  }

  return redirectTo(
    url,
    registrationDestination(user, profile as RegistrationProfileState),
  );
}
