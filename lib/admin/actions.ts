"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAdmin, requireAdmin } from "./auth";
import { adminHome, canAct } from "./permissions";
import { actionSchema } from "./validation";
import { publicActionError } from "./audit";
import type { ActionState } from "./types";

export async function mutateAdmin(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const respond = (ok: boolean, message: string): ActionState => ({
    ok,
    message,
    operationId: String(form.get("operation_id") || ""),
  });
  const parsed = actionSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return respond(
      false,
      parsed.error.issues[0]?.message ?? "Please check the form.",
    );
  if (!canAct(admin.role, parsed.data.action))
    return respond(false, "You do not have permission to perform this action.");
  const { action, ...payload } = parsed.data;
  const { error } = await (
    await createClient()
  ).rpc("admin_mutate", { p_action: action, p_payload: payload });
  if (error) return respond(false, publicActionError(error.code));
  revalidatePath("/admin", "layout");
  return respond(true, "Saved. The change has been recorded in the audit log.");
}
export async function signInAdmin(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  const parsed = z
    .object({ email: z.email().max(254), password: z.string().min(1).max(512) })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return { ok: false, message: "Enter your email and password." };
  const client = await createClient();
  const { error } = await client.auth.signInWithPassword(parsed.data);
  if (error)
    return {
      ok: false,
      message: "Unable to sign in. Check your credentials and try again.",
    };
  let admin;
  try {
    admin = await getAdmin();
  } catch {
    return {
      ok: false,
      message: "Admin access is unavailable. Contact the platform owner.",
    };
  }
  if (!admin)
    return {
      ok: false,
      message: "This account does not have active administrator access.",
    };
  redirect(adminHome(admin.role));
}
export async function signOutAdmin() {
  const { error } = await (
    await createClient()
  ).auth.signOut({ scope: "local" });
  if (error) throw new Error("Sign out failed. Please try again.");
  redirect("/admin/sign-in");
}
