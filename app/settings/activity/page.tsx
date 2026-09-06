import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ActivityLogClient } from "@/components/activity/ActivityLogClient";
import type { ActivityPage } from "@/data/activity";
import { getActivityPage } from "@/lib/activity";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Activity Log" };
export default async function ActivityPage() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect("/login?next=/settings/activity");
  let initial: ActivityPage = { items: [], hasMore: false };
  let initialError = "";
  try {
    initial = await getActivityPage(client, user.id, "all", "30", 0);
  } catch {
    initialError =
      "Activity Log needs the user_activity database migration before it can load.";
  }
  return <ActivityLogClient initial={initial} initialError={initialError} />;
}
