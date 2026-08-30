"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileBottomNavigation } from "@/components/layout/MobileBottomNavigation";
import type { NotificationItem } from "@/data/notifications";
import { createClient } from "@/lib/supabase/client";
import { LoadMoreButton } from "./LoadMoreButton";
import {
  MobileNotificationFilters,
  NotificationFilters,
} from "./NotificationFilters";
import { NotificationList } from "./NotificationList";
import { NotificationOverviewCard } from "./NotificationOverviewCard";
import { PremiumCard } from "./PremiumCard";

export function NotificationsClient({ userId, initialItems }: { userId: string; initialItems: NotificationItem[] }) {
  const router = useRouter();
  const [active, setActive] = useState("All");
  const [items, setItems] = useState<NotificationItem[]>(initialItems);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => setItems(initialItems), [initialItems]);
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`notifications-page-${userId}`).on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, () => router.refresh()).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [router, userId]);
  const visible = useMemo(
    () =>
      active === "Unread"
        ? items.filter((item) => item.unread)
        : active === "Today"
          ? items.filter((item) => item.section === "today")
          : items,
    [active, items],
  );
  const today = visible.filter((item) => item.section === "today");
  const yesterday = visible.filter((item) => item.section === "yesterday");
  const earlier = visible.filter((item) => item.section === "earlier");
  const completeProfile = () => router.push("/my-profile");
  async function markAllRead() {
    const unreadIds = items.filter((item) => item.unread).map((item) => Number(item.id));
    if (!unreadIds.length) return;
    const { error } = await createClient().from("notifications").update({ read_at: new Date().toISOString() }).in("id", unreadIds).eq("user_id", userId);
    if (!error) setItems((current) => current.map((item) => ({ ...item, unread: false })));
  }
  return (
    <main className="h-dvh overflow-hidden bg-[var(--app-bg)]">
      <div className="app-shell">
        <AppSidebar active="Notifications">
          <NotificationOverviewCard />
          <PremiumCard />
        </AppSidebar>
        <div className="min-w-0 flex-1 pb-[72px] md:pb-0">
          <div className="hidden md:block">
            <NotificationFilters
              active={active}
              onChange={setActive}
              onMarkAllRead={() => void markAllRead()}
            />
            <div className="w-full px-7 pb-8 pt-7 md:px-8">
              {today.length ? (
                <section>
                  <h2 className="mb-3 text-[17px] font-semibold text-[#0f1419]">Today</h2>
                  <NotificationList
                    items={today}
                    onComplete={completeProfile}
                  />
                </section>
              ) : null}
              {yesterday.length ? (
                <section className="mt-4">
                  <h2 className="mb-3 text-[17px] font-semibold text-[#0f1419]">Yesterday</h2>
                  <NotificationList
                    items={yesterday}
                    onComplete={completeProfile}
                  />
                </section>
              ) : null}
              {earlier.length ? (
                <section className="mt-4">
                  <h2 className="mb-3 text-[17px] font-semibold text-[#0f1419]">Earlier</h2>
                  <NotificationList items={earlier} onComplete={completeProfile} />
                </section>
              ) : null}
              {!visible.length ? <p className="py-16 text-center text-[14px] text-[var(--text-secondary)]">No notifications yet.</p> : null}
              {visible.length ? <div className="mt-5">
                <LoadMoreButton onClick={() => setExpanded(true)} />
                {expanded ? (
                  <p className="mt-2 text-center text-[11px] text-[#777c91]">
                    You’re all caught up.
                  </p>
                ) : null}
              </div> : null}
            </div>
          </div>
          <div className="md:hidden">
            <MobileNotificationFilters active={active} onChange={setActive} />
            <div className="px-4 pb-5">
              {today.length ? (
                <section className="pt-4">
                  <h2 className="text-[13px] font-bold">Today</h2>
                  <NotificationList
                    items={today}
                    mobile
                    onComplete={completeProfile}
                  />
                </section>
              ) : null}
              {yesterday.length ? (
                <section className="pt-5">
                  <h2 className="text-[13px] font-bold">Yesterday</h2>
                  <NotificationList
                    items={yesterday}
                    mobile
                    onComplete={completeProfile}
                  />
                </section>
              ) : null}
              {earlier.length ? (
                <section className="pt-5">
                  <h2 className="text-[13px] font-bold">Earlier</h2>
                  <NotificationList items={earlier} mobile onComplete={completeProfile} />
                </section>
              ) : null}
              {!visible.length ? <p className="py-16 text-center text-[13px] text-[var(--text-secondary)]">No notifications yet.</p> : null}
            </div>
          </div>
        </div>
        <MobileBottomNavigation active={null} />
      </div>
    </main>
  );
}
