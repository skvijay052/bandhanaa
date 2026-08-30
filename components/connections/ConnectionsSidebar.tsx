import Link from "next/link";
import {
  Bell,
  Heart,
  HeartHandshake,
  MessageSquare,
  UserRoundSearch,
  UsersRound,
} from "lucide-react";
import { ConnectionOverviewCard } from "./ConnectionOverviewCard";
import { PremiumCard } from "./PremiumCard";
const items = [
  { label: "Discover", href: "/discover", Icon: UserRoundSearch },
  { label: "Matches", href: "/matches", Icon: Heart },
  { label: "Interests", href: "/interests", Icon: HeartHandshake },
  { label: "Messages", href: "/messages", Icon: MessageSquare },
  { label: "Connections", href: "/connections", Icon: UsersRound },
  { label: "Notifications", href: "/notifications", Icon: Bell },
];
export function ConnectionsSidebar({
  total,
  active,
  pending,
  blocked,
}: {
  total: number;
  active: number;
  pending: number;
  blocked: number;
}) {
  return (
    <aside className="app-sidebar hidden w-[360px] shrink-0 border-r px-5 py-4 md:block xl:w-[390px]">
      <nav aria-label="Primary" className="space-y-0.5">
        {items.map(({ label, href, Icon }) => {
          const active = label === "Connections";
          return (
            <Link
              key={label}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex h-[42px] items-center gap-4 rounded-[10px] px-4 text-[13px] font-semibold ${active ? "bg-[#fff0f6] text-[#151621]" : "text-[#151621] hover:bg-slate-50"}`}
            >
              <Icon
                size={19}
                strokeWidth={1.7}
                className={active ? "text-[#ff1682]" : undefined}
              />
              <span>{label}</span>
              {label === "Notifications" ? (
                <span className="ml-auto size-1.5 rounded-full bg-[#ff1682]" />
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="mt-6">
        <ConnectionOverviewCard
          total={total}
          active={active}
          pending={pending}
          blocked={blocked}
        />
        <PremiumCard />
      </div>
    </aside>
  );
}
