import Link from "next/link";
import { Bell, Heart, MessageSquare, UsersRound } from "lucide-react";
import {
  PremiumCard,
  ProfileStrengthCard,
} from "@/components/discover/SupportCards";

const items = [
  { label: "Discover", href: "/discover", icon: Heart },
  { label: "Matches", href: "/matches", icon: Heart },
  { label: "Requests", href: "/requests", icon: Heart },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Notifications", href: "/notifications", icon: Bell },
];
export function Sidebar() {
  return (
    <aside className="w-[235px] shrink-0 border-r border-[#eeeeF2] px-[18px] py-6 max-lg:hidden">
      <nav className="space-y-1">
        {items.map(({ label, href, icon: Icon }, i) => (
          <Link
            key={label}
            href={href}
            className={`flex h-11 w-full items-center gap-4 rounded-[9px] px-4 text-left text-[13px] font-semibold transition ${i === 0 ? "bg-[linear-gradient(90deg,rgba(255,233,244,.9),rgba(255,241,247,.7))]" : "hover:bg-slate-50"}`}
          >
            <Icon
              size={19}
              strokeWidth={1.8}
              className={i === 0 ? "text-[#f32988]" : ""}
              fill={i === 0 ? "currentColor" : "none"}
            />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-8 space-y-4">
        <ProfileStrengthCard />
        <PremiumCard />
      </div>
    </aside>
  );
}
