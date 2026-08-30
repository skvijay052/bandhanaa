import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ReportBlockClient } from "@/components/settings/ReportBlockClient";
import type { ReportTarget } from "@/data/privacy";
import { createClient } from "@/lib/supabase/server";
import { resolveProfilePhoto } from "@/lib/profile-photo";
export const metadata: Metadata = { title: "Report / Block" };
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
  let query = supabase
    .from("profiles")
    .select("id,display_name,avatar_url,photos,gender,age,city,profession,company")
    .neq("id", user.id);
  query = profileId ? query.eq("id", profileId) : query.limit(1);
  const { data } = await query.limit(1).maybeSingle();
  if (!data) redirect("/discover");
  const target: ReportTarget = {
    id: data.id,
    name: data.display_name ?? "Bandhanaa Member",
    age: data.age ?? 25,
    city: data.city ?? "India",
    profession: data.profession ?? "Professional",
    company: data.company ?? "",
    avatar: resolveProfilePhoto(data),
    verified: true,
  };
  return <ReportBlockClient target={target} currentUserId={user.id} />;
}
