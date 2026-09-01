"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  Bell,
  Heart,
  HeartHandshake,
  LogOut,
  Menu,
  MessageSquare,
  UserRound,
  UserRoundSearch,
} from "lucide-react";

import { Brand } from "@/components/auth/Brand";
import { ProfileImage } from "@/components/ui/ProfileImage";
import { resolveProfilePhoto } from "@/lib/profile-photo";
import { SidebarNavItem } from "@/components/navigation/SidebarNavItem";
import { createClient } from "@/lib/supabase/client";
import { MobileBottomNavigation } from "@/components/layout/MobileBottomNavigation";

const items = [
  { label: "Discover", href: "/discover", icon: UserRoundSearch },
  { label: "Matches", href: "/matches", icon: Heart },
  { label: "Requests", href: "/requests", icon: HeartHandshake },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Shortlist", href: "/matches?tab=shortlisted", icon: Heart },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "More", href: "/settings", icon: Menu },
] as const;

type ActiveItem =
  | "Discover"
  | "Matches"
  | "Requests"
  | "Messages"
  | "Profile"
  | "Notifications"
  | "Settings";

type BadgeCounts = Record<
  "Matches" | "Requests" | "Messages" | "Notifications",
  number
>;

const emptyBadgeCounts: BadgeCounts = {
  Matches: 0,
  Requests: 0,
  Messages: 0,
  Notifications: 0,
};

export function AppSidebar({
  active = "Matches",
  hideMobileNavigation = false,
  children: _children,
}: {
  active?: ActiveItem;
  hideMobileNavigation?: boolean;
  children?: ReactNode;
}) {
  const [profile, setProfile] = useState({
    name: "My Profile",
    avatar: "/profiles/rohan.png",
    subtitle: "Bandhanaa member",
  });
  const [badgeCounts, setBadgeCounts] = useState<BadgeCounts>(emptyBadgeCounts);

  useEffect(() => {
    let activeRequest = true;
    async function loadSidebar() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !activeRequest) return;
      const userId = user.id;

      const { data: privacy } = await supabase
        .from("user_privacy_settings")
        .select("show_online_status")
        .eq("user_id", userId)
        .maybeSingle();
      const shareOnlineStatus = privacy?.show_online_status !== false;
      const markActive = () => {
        if (shareOnlineStatus && document.visibilityState === "visible") {
          void supabase
            .from("profiles")
            .update({ last_seen_at: new Date().toISOString() })
            .eq("id", userId);
        }
      };
      markActive();
      const activityTimer = window.setInterval(markActive, 60_000);
      document.addEventListener("visibilitychange", markActive);

      async function loadCounts() {
        const relationFilter = `liker_id.eq.${userId},liked_id.eq.${userId}`;
        const [matches, interests, messages, notifications] = await Promise.all(
          [
            supabase
              .from("profile_likes")
              .select("liker_id", { count: "exact", head: true })
              .eq("status", "accepted")
              .or(relationFilter),
            supabase
              .from("profile_likes")
              .select("liker_id", { count: "exact", head: true })
              .eq("liked_id", userId)
              .eq("status", "pending"),
            supabase
              .from("messages")
              .select("id", { count: "exact", head: true })
              .neq("sender_id", userId)
              .is("read_at", null),
            supabase
              .from("notifications")
              .select("id", { count: "exact", head: true })
              .eq("user_id", userId)
              .is("read_at", null),
          ],
        );
        if (!activeRequest) return;
        const matchCount = matches.count ?? 0;
        const interestCount = interests.count ?? 0;
        const messageCount = messages.count ?? 0;
        setBadgeCounts({
          Matches: matchCount,
          Requests: interestCount,
          Messages: messageCount,
          Notifications: notifications.count ?? 0,
        });
      }

      const [{ data }, _counts] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name,avatar_url,photos,gender,profession")
          .eq("id", userId)
          .maybeSingle(),
        loadCounts(),
      ]);
      if (!activeRequest) return;
      setProfile({
        name:
          data?.display_name ??
          user.user_metadata?.display_name ??
          user.user_metadata?.full_name ??
          "My Profile",
        avatar: resolveProfilePhoto(
          data,
          String(user.user_metadata?.avatar_url ?? ""),
        ),
        subtitle: data?.profession ?? "Bandhanaa member",
      });

      const channel = supabase
        .channel(`sidebar-counts-${userId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "profile_likes" },
          () => void loadCounts(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "messages" },
          () => void loadCounts(),
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          () => void loadCounts(),
        )
        .subscribe();
      if (!activeRequest) void supabase.removeChannel(channel);
      return () => {
        window.clearInterval(activityTimer);
        document.removeEventListener("visibilitychange", markActive);
        void supabase.removeChannel(channel);
      };
    }
    let removeRealtime: (() => void) | undefined;
    void loadSidebar().then((cleanup) => {
      removeRealtime = cleanup;
    });
    return () => {
      activeRequest = false;
      removeRealtime?.();
    };
  }, []);

  return (
    <>
      <aside className="hidden h-dvh w-[88px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] px-3 py-4 md:flex xl:w-[245px] xl:px-4">
        <Link
          href="/discover"
          className="block h-14 overflow-hidden px-2 max-xl:w-12"
          aria-label="Bandhanaa home"
        >
          <Brand compact />
        </Link>
        <nav aria-label="Primary" className="my-auto space-y-0.5">
          {items.map(({ label, href, icon }) => {
            const isActive =
              label === active || (label === "More" && active === "Settings");
            const badge =
              label in badgeCounts
                ? badgeCounts[label as keyof BadgeCounts]
                : 0;
            return (
              <SidebarNavItem
                key={label}
                icon={icon}
                label={label}
                href={href}
                badge={badge}
                active={isActive}
              />
            );
          })}
        </nav>
        <details className="group relative">
          <summary
            className={`flex cursor-pointer list-none items-center gap-2 rounded-full p-2 transition-colors hover:bg-[var(--surface-hover)] [&::-webkit-details-marker]:hidden ${active === "Profile" ? "bg-[#f2f2f2] dark:bg-[var(--surface-hover)]" : ""}`}
          >
            <span className="relative size-10 shrink-0 overflow-hidden rounded-full">
              <ProfileImage
                src={profile.avatar}
                alt={profile.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            </span>
            <span className="min-w-0 flex-1 max-xl:hidden">
              <strong className="block truncate text-[14px]">
                {profile.name}
              </strong>
              <span className="block truncate text-[13px] font-normal text-[var(--text-secondary)]">
                {profile.subtitle}
              </span>
            </span>
          </summary>
          <div className="absolute bottom-[58px] left-0 z-50 w-[220px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[0_8px_28px_rgba(15,20,25,.14)] max-xl:w-[200px]">
            <Link
              href="/my-profile"
              className="flex h-12 items-center gap-3 rounded-lg px-3 text-[14px] font-normal hover:bg-[var(--surface-hover)]"
            >
              <UserRound size={20} strokeWidth={1.8} />
              My Profile
            </Link>
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="flex h-12 w-full items-center gap-3 rounded-lg px-3 text-left text-[14px] font-normal text-[#f4212e] hover:bg-[var(--surface-hover)]"
              >
                <LogOut size={20} strokeWidth={1.8} />
                Log out
              </button>
            </form>
          </div>
        </details>
      </aside>
      {hideMobileNavigation ? null : <MobileBottomNavigation />}
    </>
  );
}
