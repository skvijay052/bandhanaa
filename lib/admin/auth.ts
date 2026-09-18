import "server-only";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canAccess, type AdminSection } from "./permissions";
import type { AdminIdentity } from "./types";

// Never cache across requests or trust client role claims. RPC independently checks membership.
export async function getAdmin() {
  const client = await createClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user || !user.email_confirmed_at) return null;
  const { data, error: roleError } = await client.rpc("admin_identity");
  if (roleError?.code === "42501") return null;
  if (roleError)
    throw new Error(
      "Admin access could not be checked. Please contact the platform owner.",
    );
  return data as AdminIdentity | null;
}
export async function requireAdmin(section?: AdminSection) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/sign-in");
  if (section && !canAccess(admin.role, section)) notFound();
  return admin;
}
