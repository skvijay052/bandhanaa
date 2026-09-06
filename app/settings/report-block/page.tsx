import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ReportBlockClient } from "@/components/settings/ReportBlockClient";
import { SupportPageShell } from "@/components/settings/SupportPageShell";
import type { ReportTarget } from "@/data/privacy";
import { resolveProfilePhoto } from "@/lib/profile-photo";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Report & Block" };

export default async function ReportBlockPage({
  searchParams,
}: {
  searchParams: Promise<{ profileId?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/settings/report-block");

  const { profileId } = await searchParams;
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("gender")
    .eq("id", user.id)
    .maybeSingle();
  const currentGender = String(currentProfile?.gender ?? "")
    .trim()
    .toLowerCase();
  if (currentGender !== "male" && currentGender !== "female") {
    redirect("/settings/edit-profile");
  }
  const targetGender = currentGender === "male" ? "female" : "male";

  const [{ data: profiles }, { data: blockedRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id,display_name,avatar_url,photos,gender,age,city,state,profession,company,is_verified",
      )
      .neq("id", user.id)
      .eq("registration_status", "active")
      .ilike("gender", targetGender)
      .order("display_name")
      .limit(100),
    supabase
      .from("blocked_users")
      .select("blocked_id")
      .eq("blocker_id", user.id),
  ]);

  const targets: ReportTarget[] = (profiles ?? []).map((profile) => ({
    id: profile.id,
    name: profile.display_name ?? "Bandhanaa Member",
    age: profile.age ?? 0,
    city: [profile.city, profile.state].filter(Boolean).join(", ") || "India",
    profession: profile.profession ?? "Member",
    company: profile.company ?? "",
    avatar: resolveProfilePhoto(profile),
    verified: Boolean(profile.is_verified),
  }));
  if (!targets.length) redirect("/discover");

  const initialTargetId = targets.some((target) => target.id === profileId)
    ? profileId!
    : targets[0].id;

  return (
    <SupportPageShell
      title="Report & Block"
      description="Help us maintain a safe and respectful community."
    >
      <ReportBlockClient
        targets={targets}
        currentUserId={user.id}
        initialTargetId={initialTargetId}
        initiallyBlockedIds={(blockedRows ?? []).map((row) => row.blocked_id)}
      />
    </SupportPageShell>
  );
}
