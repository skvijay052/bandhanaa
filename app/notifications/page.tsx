import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NotificationsClient } from "@/components/notifications/NotificationsClient";
import { createClient } from "@/lib/supabase/server";
import { resolveProfilePhoto } from "@/lib/profile-photo";
import type { NotificationItem, NotificationType } from "@/data/notifications";
export const metadata: Metadata = { title: "Notifications" };

type NotificationRow = { id: number; actor_id: string | null; type: NotificationType; title: string; subtitle: string | null; read_at: string | null; created_at: string };
type ActorProfile = { id: string; display_name: string | null; age: number | null; avatar_url: string | null; photos: string[] | null; gender: string | null };

function notificationDate(value: string) {
  const date = new Date(value);
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const days = Math.round((startToday.getTime() - startDate.getTime()) / 86_400_000);
  return {
    section: days <= 0 ? "today" as const : days === 1 ? "yesterday" as const : "earlier" as const,
    time: days <= 0 ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : days === 1 ? "Yesterday" : date.toLocaleDateString([], { day: "numeric", month: "short" }),
  };
}

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/notifications");
  const [profileResult, notificationsResult] = await Promise.all([
    supabase.from("profiles").select("display_name, avatar_url, photos, gender").eq("id", user.id).maybeSingle(),
    supabase.from("notifications").select("id, actor_id, type, title, subtitle, read_at, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100),
  ]);
  const profile = profileResult.data;
  const rows = (notificationsResult.data ?? []) as NotificationRow[];
  const actorIds = [...new Set(rows.flatMap((row) => row.actor_id ? [row.actor_id] : []))];
  const actorsResult = actorIds.length
    ? await supabase.from("profiles").select("id, display_name, age, avatar_url, photos, gender").in("id", actorIds)
    : { data: [] as ActorProfile[] };
  const actors = new Map(((actorsResult.data ?? []) as ActorProfile[]).map((actor) => [actor.id, actor]));
  const initialItems: NotificationItem[] = rows.map((row) => {
    const actor = row.actor_id ? actors.get(row.actor_id) : undefined;
    const date = notificationDate(row.created_at);
    return {
      id: String(row.id),
      type: row.type,
      name: actor?.display_name ?? undefined,
      age: actor?.age ?? undefined,
      title: row.title,
      subtitle: row.subtitle ?? undefined,
      avatar: actor ? resolveProfilePhoto(actor) : resolveProfilePhoto(profile),
      unread: !row.read_at,
      section: date.section,
      time: date.time,
    };
  });
  return <NotificationsClient userId={user.id} initialItems={initialItems} />;
}
