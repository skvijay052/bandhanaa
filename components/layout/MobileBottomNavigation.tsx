"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Heart,
  MessageCircle,
  UserRound,
  UsersRound,
} from "lucide-react";

const defaultItems = [
  { label: "Discover", href: "/discover", icon: Compass },
  { label: "Matches", href: "/matches", icon: Heart },
  { label: "Messages", href: "/messages", icon: MessageCircle, },
  { label: "Requests", href: "/requests", icon: UsersRound },
  { label: "Profile", href: "/my-profile", icon: UserRound },
] as const;

const settingsItems = [
  { label: "Discover", href: "/discover", icon: Compass },
  { label: "Matches", href: "/matches", icon: Heart },
  { label: "Messages", href: "/messages", icon: MessageCircle, },
  { label: "Requests", href: "/requests", icon: UsersRound },
  { label: "Profile", href: "/my-profile", icon: UserRound },
] as const;

export function MobileBottomNavigation({
  requestCount = 0,
}: {
  requestCount?: number;
}) {
  const pathname = usePathname();
  const settingsStyle = pathname.startsWith("/settings");

  if (settingsStyle) {
    return (
      <nav
        aria-label="Mobile navigation"
        className="settings-bottom-nav fixed inset-x-4 bottom-[calc(0px+env(safe-area-inset-bottom))] z-[100] grid h-[75px] grid-cols-5 rounded-[0px] border border-white/10 bg-[#050608] px-2 shadow-[0_12px_36px_rgba(0,0,0,.34)] md:hidden"
      >
        {settingsItems.map(({ label, href, icon: Icon, ...item }, index) => {
          const active =
            pathname === href ||
            pathname.startsWith(`${href}/`) ||
            (label === "Profile" && pathname.startsWith("/settings"));
          const raised = "raised" in item && item.raised;
          return (
            <Link
              key={`${href}-${index}`}
              href={href}
              aria-label={label || "Requests"}
              aria-current={active ? "page" : undefined}
              className={`relative flex flex-col items-center justify-end gap-1 pb-3 text-[10px] font-medium ${active || raised ? "text-[#ffffff]" : "text-[#737885]"}`}
            >
              {raised ? (
                  <span className="relative grid place-items-center">
                    <Icon size={23} strokeWidth={1.8} fill={active && label === "Matches" ? "currentColor" : "none"}/>
                  </span>
              ) : (
                <Icon
                  size={22}
                  strokeWidth={1.8}
                  fill={active && label === "Matches" ? "currentColor" : "none"}
                />
              )}
              <span>{label}</span> 
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-4 bottom-[calc(0px+env(safe-area-inset-bottom))] z-[100] grid h-[75px] grid-cols-5 rounded-[0px] border border-white/10 bg-[#050608] px-2 shadow-[0_12px_36px_rgba(0,0,0,.34)] md:hidden"
    >
      {defaultItems.map(({ label, href, icon: Icon, ...item }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        const raised = "raised" in item && item.raised;
        const badge = label === "Requests" ? requestCount : 0;
        return (
          <Link
            key={label}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`relative flex flex-col items-center justify-end gap-1 pb-3 text-[10px] font-medium ${active || raised ? "text-[#ffffff]" : "text-[#737885]"}`}
          >
            {raised ? (
              <span className="relative grid place-items-center">
                <Icon size={23} strokeWidth={1.8} fill={active && label === "Matches" ? "currentColor" : "none"}/>
              </span>
            ) : (
              <span className="relative grid place-items-center">
                <Icon
                  size={23}
                  strokeWidth={1.8}
                  fill={active && label === "Matches" ? "currentColor" : "none"}
                />
                {badge ? (
                  <span className="absolute -right-3 -top-3 grid size-5 place-items-center rounded-full bg-[#f53586] text-[10px] font-bold text-white">
                    {badge}
                  </span>
                ) : null}
              </span>
            )}
            <span>{label}</span> 
          </Link>
        );
      })}
    </nav>
  );
}
