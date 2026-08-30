import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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
    "/profile",
  ].some((route) => path.startsWith(route));

  if (!user && protectedPath) {
    const target = request.nextUrl.clone();
    target.pathname = "/login";
    target.searchParams.set("next", path);
    return NextResponse.redirect(target);
  }
  if (user && (path === "/login" || path === "/register")) {
    const target = request.nextUrl.clone();
    target.pathname = "/discover";
    target.search = "";
    return NextResponse.redirect(target);
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
    "/profile/:path*",
    "/login",
    "/register",
  ],
};
