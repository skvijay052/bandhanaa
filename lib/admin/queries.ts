import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "./auth";
import { filterSchema } from "./validation";
import type { AdminSection } from "./permissions";
import type { AdminResult, SearchParams } from "./types";
export async function queryAdmin(
  section: AdminSection,
  params: SearchParams = {},
  detailId?: string,
) {
  await requireAdmin(section);
  const input = Object.fromEntries(
    Object.entries(params).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  );
  const filters = filterSchema.parse(input);
  if (detailId) Object.assign(filters, { detail_id: detailId });
  const { data, error } = await (
    await createClient()
  ).rpc("admin_query", { p_section: section, p_filters: filters });
  if (error)
    throw new Error(
      error.code === "42501"
        ? "You no longer have permission to view this information."
        : "This information could not be loaded. Please try again.",
    );
  return data as AdminResult;
}
