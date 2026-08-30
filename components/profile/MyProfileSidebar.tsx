import Link from "next/link";
import {
  Bell,
  Crown,
  Heart,
  HeartHandshake,
  MessageSquare,
  UserRoundSearch,
  UsersRound,
} from "lucide-react";
import { Brand } from "@/components/auth/Brand";
const items = [
  { label: "Discover", href: "/discover", Icon: UserRoundSearch },
  { label: "Matches", href: "/matches", Icon: Heart },
  { label: "Requests", href: "/requests", Icon: HeartHandshake },
  { label: "Messages", href: "/messages", Icon: MessageSquare },
  { label: "Notifications", href: "/notifications", Icon: Bell },
];
export function MyProfileSidebar() {
  return (
    <aside className="app-sidebar hidden w-[360px] shrink-0 flex-col border-r px-5 py-5 md:flex xl:w-[390px]">
      <Link href="/discover">
        <Brand compact />
      </Link>
      <nav aria-label="Primary" className="mt-6 space-y-0.5">
        {items.map(({ label, href, Icon }) => (
          <Link
            key={label}
            href={href}
            className="flex h-[46px] items-center gap-4 rounded-lg px-3 text-[13px] font-semibold hover:bg-slate-50"
          >
            <Icon size={19} strokeWidth={1.7} />
            <span>{label}</span>
            {label === "Notifications" ? (
              <span className="ml-auto grid size-5 place-items-center rounded-full bg-[#ef1683] text-[9px] text-white">
                12
              </span>
            ) : null}
          </Link>
        ))}
      </nav>
      <div className="mt-auto rounded-xl border border-[#eeeef2] p-4 text-center">
        <Crown size={28} className="mx-auto text-[#ffb000]" />
        <h2 className="mt-3 text-[12px] font-bold">Upgrade to Premium</h2>
        <p className="mt-3 text-[10px] leading-5 text-[#596077]">
          Unlock advanced filters,
          <br />
          see who viewed you,
          <br />
          and more.
        </p>
        <button className="mt-4 h-9 w-full rounded-lg bg-[#1d9bf0] text-[10px] font-semibold text-white hover:bg-[#1689df]">
          Upgrade Now
        </button>
      </div>
      <p className="mt-8 px-2 text-[9px] leading-5 text-[#596077]">
        © 2024 Bandhanaa
        <br />
        All rights reserved.
      </p>
    </aside>
  );
}
