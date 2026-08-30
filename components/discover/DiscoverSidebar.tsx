import Link from "next/link";
import {
  Bell,
  CircleHelp,
  Gem,
  Heart,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  UserRound,
  UserRoundSearch,
} from "lucide-react";
import { Brand } from "@/components/auth/Brand";
const items = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Discover", href: "/discover", icon: UserRoundSearch },
  { label: "Requests", href: "/requests", icon: Heart },
  { label: "Messages", href: "/messages", icon: MessageSquare, badge: 3 },
  { label: "Shortlisted", href: "/matches?tab=shortlisted", icon: Heart },
  { label: "Notifications", href: "/notifications", icon: Bell, badge: 6 },
  { label: "Profile", href: "/profile", icon: UserRound },
  { label: "Settings", href: "/settings", icon: Settings },
];
export function DiscoverSidebar() {
  return (
    <aside className="hidden w-[220px] shrink-0 flex-col border-r border-[#ece9ef] bg-white px-4 py-5 lg:flex">
      <Link href="/discover" className="px-3">
        <Brand compact />
      </Link>
      <nav className="mt-6 space-y-1">
        {items.map(({ label, href, icon: Icon, badge }) => {
          const active = label === "Discover";
          return (
            <Link
              key={label}
              href={href}
              className={`relative flex h-11 items-center gap-3 rounded-xl px-4 text-[12px] font-medium ${active ? "bg-[#fff0f8] text-[#ef278d] before:absolute before:-left-4 before:h-8 before:w-[3px] before:rounded-r before:bg-[#ff278c]" : "text-[#343646] hover:bg-slate-50"}`}
            >
              <Icon size={17} />
              {label}
              {badge ? (
                <span className="ml-auto grid size-5 place-items-center rounded-full bg-[#ed2a8b] text-[9px] text-white">
                  {badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto space-y-1">
        <Link
          href="/help"
          className="flex h-10 items-center gap-3 px-4 text-[11px]"
        >
          <CircleHelp size={16} />
          Help &amp; Support
        </Link>
        <form action="/api/auth/signout" method="post">
          <button className="flex h-10 w-full items-center gap-3 px-4 text-[11px]">
            <LogOut size={16} />
            Logout
          </button>
        </form>
        <section className="mt-5 rounded-[18px] bg-[linear-gradient(145deg,#ef48a7,#7748df)] p-5 text-center text-white">
          <Gem size={34} className="mx-auto" />
          <h2 className="mt-3 text-[15px] font-semibold">Go Premium</h2>
          <p className="mt-2 text-[10px] leading-4 text-white/85">
            Unlock exclusive features and connect with more matches.
          </p>
          <button className="mt-4 h-9 w-full rounded-lg bg-white text-[10px] font-semibold text-[#723ed4]">
            Upgrade Now
          </button>
        </section>
      </div>
    </aside>
  );
}
