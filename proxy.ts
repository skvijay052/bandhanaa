import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { RegistrationProfileState } from "@/lib/registration-state";
import { registrationDestination } from "@/lib/registration-state";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(items) {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        items.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const protectedPath = [
    "/dashboard",
    "/discover",
    "/matches",
    "/interests",
    "/messages",
    "/requests",
    "/connections",
    "/notifications",
    "/my-profile",
    "/settings",
    "/profile",
  ].some((route) => path.startsWith(route));

  if (!user && protectedPath) {
    const target = request.nextUrl.clone();
    target.pathname = "/login";
    target.searchParams.set("next", path);
    return NextResponse.redirect(target);
  }
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("registration_status,onboarding_completed,is_verified")
      .eq("id", user.id)
      .maybeSingle();
    const destination = registrationDestination(
      user,
      profile as RegistrationProfileState | null,
    );
    const authEntry = path === "/login" || path === "/register";
    const verificationPage = path === "/verify-email";
    const onboardingPage = path.startsWith("/settings/edit-profile");

    if (!user.email_confirmed_at && !verificationPage) {
      const target = request.nextUrl.clone();
      target.pathname = "/verify-email";
      target.search = "";
      return NextResponse.redirect(target);
    }
    if (user.email_confirmed_at && verificationPage) {
      const target = request.nextUrl.clone();
      target.pathname = destination;
      target.search = "";
      return NextResponse.redirect(target);
    }
    if (destination === "/settings/edit-profile" && !onboardingPage) {
      const target = request.nextUrl.clone();
      target.pathname = destination;
      target.search = "";
      return NextResponse.redirect(target);
    }
    if (authEntry && destination === "/discover") {
      const target = request.nextUrl.clone();
      target.pathname = destination;
      target.search = "";
      return NextResponse.redirect(target);
    }
  }
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/discover/:path*",
    "/matches/:path*",
    "/interests/:path*",
    "/messages/:path*",
    "/requests/:path*",
    "/connections/:path*",
    "/notifications/:path*",
    "/my-profile/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/verify-email",
    "/login",
    "/register",
  ],
};
