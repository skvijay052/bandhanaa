import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PrivacyClient } from "@/components/settings/PrivacyClient";
import type { PrivacySettings } from "@/data/privacy";
import { createClient } from "@/lib/supabase/server";
export const metadata: Metadata = { title: "Settings & Privacy" };
export default async function PrivacyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/settings/privacy");
  const { data: row } = await supabase
    .from("user_privacy_settings")
    .select(
      "profile_visibility,last_seen_visibility,read_receipts,show_online_status,hide_age,two_step_verification",
    )
    .eq("user_id", user.id)
    .maybeSingle();
  const value = (row ?? {}) as Record<string, unknown>;
  const initial: PrivacySettings = {
    userId: user.id,
    profileVisibility:
      value.profile_visibility === "matches" ||
      value.profile_visibility === "private"
        ? value.profile_visibility
        : "everyone",
    lastSeenVisibility:
      value.last_seen_visibility === "everyone" ||
      value.last_seen_visibility === "nobody"
        ? value.last_seen_visibility
        : "matches",
    readReceipts: value.read_receipts !== false,
    showOnlineStatus: value.show_online_status !== false,
    hideAge: value.hide_age === true,
    twoStepVerification: value.two_step_verification === true,
  };
  return <PrivacyClient initial={initial} />;
}
