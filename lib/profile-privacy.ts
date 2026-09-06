import type { SupabaseClient } from "@supabase/supabase-js";

export type ProfilePrivacy = { showAge: boolean; showLastSeen: boolean };

export async function getProfilePrivacy(
  supabase: SupabaseClient,
  profileIds: string[],
) {
  const ids = [...new Set(profileIds)].filter(Boolean);
  const result = new Map<string, ProfilePrivacy>();
  if (!ids.length) return result;
  const { data, error } = await supabase.rpc("get_profile_privacy", {
    profile_ids: ids,
  });
  if (error) {
    console.error("Unable to load profile privacy:", error.message);
    return result;
  }
  for (const row of (data ?? []) as Array<{
    user_id: string;
    show_age: boolean;
    show_last_seen: boolean;
  }>) {
    result.set(row.user_id, {
      showAge: row.show_age,
      showLastSeen: row.show_last_seen,
    });
  }
  return result;
}
