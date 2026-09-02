"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Heart,
  Menu,
  MessageCircle,
  MessageSquare,
  UserRound,
  UserRoundSearch,
  UsersRound,
} from "lucide-react";

const defaultItems = [
  { label: "Discover", href: "/discover", icon: Compass },
  { label: "Matches", href: "/matches", icon: Heart },
  { label: "Messages", href: "/messages", icon: MessageCircle, raised: true },
  { label: "Requests", href: "/requests", icon: UsersRound },
  { label: "Profile", href: "/my-profile", icon: UserRound },
] as const;

const settingsItems = [
  { label: "Discover", href: "/discover", icon: UserRoundSearch },
  { label: "Matches", href: "/matches", icon: Heart },
  { label: "Requests", href: "/requests", icon: MessageCircle, raised: true },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "More", href: "/settings", icon: Menu },
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
        className="settings-bottom-nav fixed inset-x-4 bottom-[calc(10px+env(safe-area-inset-bottom))] z-[100] grid h-[82px] grid-cols-5 rounded-[28px] border border-white/90 bg-white/95 px-2 shadow-[0_12px_36px_rgba(63,38,110,.15)] backdrop-blur-xl md:hidden"
      >
        {settingsItems.map(({ label, href, icon: Icon, ...item }, index) => {
          const active =
            pathname === href ||
            pathname.startsWith(`${href}/`) ||
            (label === "More" && pathname.startsWith("/settings"));
          const raised = "raised" in item && item.raised;
          const badge = label === "Requests" ? requestCount : 0;
          return (
            <Link
              key={`${href}-${index}`}
              href={href}
              aria-label={label || "Requests"}
              aria-current={active ? "page" : undefined}
              className={`relative flex flex-col items-center justify-end gap-1 pb-3 text-[10px] font-medium ${active || raised ? "text-[#8b3de8]" : "text-[#536471]"}`}
            >
              {raised ? (
                <span className="absolute -top-5 grid size-[58px] place-items-center rounded-full border-[3px] border-white bg-[#8b3de8] text-white shadow-[0_7px_20px_rgba(139,61,232,.38)]">
                  <Icon size={25} strokeWidth={1.8} />
                </span>
              ) : (
                <span className="relative grid place-items-center">
                  <Icon
                    size={22}
                    strokeWidth={1.8}
                    fill={active ? "currentColor" : "none"}
                  />
                  {badge ? (
                    <span className="absolute -right-3 -top-3 grid size-5 place-items-center rounded-full bg-[#f53586] text-[10px] font-bold text-white">
                      {badge}
                    </span>
                  ) : null}
                </span>
              )}
              {label ? <span>{label}</span> : null}
              {active ? (
                <span className="absolute bottom-1.5 h-[3px] w-8 rounded-full bg-[#8b3de8]" />
              ) : null}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-4 bottom-[calc(10px+env(safe-area-inset-bottom))] z-[100] grid h-[80px] grid-cols-5 rounded-[28px] border border-white/10 bg-[#050608] px-2 shadow-[0_12px_36px_rgba(0,0,0,.34)] md:hidden"
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
            className={`relative flex flex-col items-center justify-end gap-1 pb-3 text-[10px] font-medium ${active || raised ? "text-[#b96cff]" : "text-[#737885]"}`}
          >
            {raised ? (
              <span className="absolute -top-5 grid size-[58px] place-items-center rounded-full border-[3px] border-[#f3eaff] bg-[linear-gradient(145deg,#b62cff,#7a2cf0)] text-white shadow-[0_7px_22px_rgba(160,45,255,.52)]">
                <Icon size={28} strokeWidth={1.8} />
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
            {active ? (
              <span className="absolute bottom-1.5 h-[3px] w-8 rounded-full bg-[#c46cff] shadow-[0_0_8px_rgba(196,108,255,.7)]" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
