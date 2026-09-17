import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function Page() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect("/login");
  const { data } = await client
    .from("profiles")
    .select("account_status")
    .eq("id", user.id)
    .maybeSingle();
  if (data?.account_status === "active") redirect("/discover");
  return (
    <main className="grid min-h-dvh place-items-center bg-[#f7f7f8] p-6">
      <section className="max-w-md rounded-2xl border border-[#e5e7eb] bg-white p-8 text-center">
        <h1 className="text-2xl font-semibold text-[#111]">
          Your account is unavailable
        </h1>
        <p className="mt-4 text-sm text-[#6b7280]">
          Please contact Bandhanaa Support for help with your account.
        </p>
        <Link className="mt-6 inline-block underline" href="/settings/contact">
          Contact support
        </Link>
        <form action="/api/auth/signout" method="post">
          <button className="mt-5 text-sm underline">Sign out</button>
        </form>
      </section>
    </main>
  );
}
