"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  Heart,
  HeartHandshake,
  LogOut,
  Menu,
  MessageCircleMore,
  Settings,
  UserRound,
  UsersRound,
} from "lucide-react";

const items = [
  {
    label: "Discover",
    href: "/discover",
    icon: UsersRound,
    raised: false,
  },
  { label: "Matches", href: "/matches", icon: Heart, raised: false },
  { label: "Requests", href: "/requests", icon: HeartHandshake, raised: true },
  {
    label: "Messages",
    href: "/messages",
    icon: MessageCircleMore,
    raised: false,
  },
] as const;

export function MobileBottomNavigation() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  return (
    <>
      {moreOpen ? (
        <button
          type="button"
          aria-label="Close more menu"
          onClick={() => setMoreOpen(false)}
          className="fixed inset-0 z-[80] bg-[#0f1419]/25 md:hidden"
        />
      ) : null}
      {moreOpen ? (
        <section
          className="fixed inset-x-4 bottom-[calc(104px+env(safe-area-inset-bottom))] z-[90] rounded-[24px] border border-[#eff3f4] bg-white p-3 shadow-[0_16px_48px_rgba(15,20,25,.18)] md:hidden"
          aria-label="More navigation"
        >
          <MoreLink
            href="/matches?tab=shortlisted"
            icon={Heart}
            label="Shortlist"
          />
          <MoreLink href="/notifications" icon={Bell} label="Notifications" />
          <MoreLink href="/my-profile" icon={UserRound} label="Profile" />
          <MoreLink href="/settings" icon={Settings} label="Settings" />
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-[14px] font-semibold text-[#f4212e] hover:bg-[#fff1f2]"
            >
              <LogOut size={20} />
              Log out
            </button>
          </form>
        </section>
      ) : null}
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-4 bottom-[calc(10px+env(safe-area-inset-bottom))] z-[100] grid h-[80px] grid-cols-5 rounded-[28px] border border-white/10 bg-[#050608] px-2 shadow-[0_12px_36px_rgba(0,0,0,.34)] md:hidden"
      >
        {items.map(({ label, href, icon: Icon, raised }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={label}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`relative flex flex-col items-center justify-end gap-1 pb-3 text-[10px] font-medium ${active || raised ? "text-[#b96cff]" : "text-[#737885]"}`}
            >
              {raised ? (
                <span className="absolute -top-5 grid size-[58px] place-items-center rounded-full border-[3px] border-[#f3eaff] bg-[linear-gradient(145deg,#b62cff,#7a2cf0)] text-white shadow-[0_7px_22px_rgba(160,45,255,.52)]">
                  <Icon size={25} strokeWidth={1.8} />
                </span>
              ) : (
                <Icon
                  size={22}
                  strokeWidth={1.8}
                  fill={active ? "currentColor" : "none"}
                />
              )}
              <span>{label}</span>
              {active ? (
                <span className="absolute bottom-1.5 h-[3px] w-8 rounded-full bg-[#c46cff] shadow-[0_0_8px_rgba(196,108,255,.7)]" />
              ) : null}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen((open) => !open)}
          aria-expanded={moreOpen}
          className={`flex flex-col items-center justify-end gap-1 pb-3 text-[10px] font-medium ${moreOpen || isMoreRoute(pathname) ? "text-[#b96cff]" : "text-[#737885]"}`}
        >
          <Menu size={22} strokeWidth={1.8} />
          More
        </button>
      </nav>
    </>
  );
}

function MoreLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Heart;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex h-12 items-center gap-3 rounded-xl px-3 text-[14px] font-semibold hover:bg-[#f7f9f9]"
    >
      <Icon size={20} />
      {label}
    </Link>
  );
}

function isMoreRoute(pathname: string) {
  return [
    "/notifications",
    "/my-profile",
    "/profile",
    "/settings",
    "/connections",
    "/interests",
  ].some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
