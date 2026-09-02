import Link from "next/link";
import {
  Bell,
  Heart,
  HeartHandshake,
  MessageSquare,
  Settings,
  UserRound,
  UserRoundSearch,
  UsersRound,
} from "lucide-react";

import { ProfileImage } from "@/components/ui/ProfileImage";

const navigation = [
  [UserRoundSearch, "Discover", "/discover"],
  [Heart, "Matches", "/matches"],
  [HeartHandshake, "Requests", "/requests"],
  [MessageSquare, "Messages", "/messages"],
  [Bell, "Notifications", "/notifications"],
] as const;

export function MessageNavigationRail({
  avatarUrl,
  name,
}: {
  avatarUrl: string;
  name: string;
}) {
  return (
    <aside className="hidden w-[76px] shrink-0 flex-col items-center border-r border-[#e9edef] bg-[#f7f6f8] py-4 lg:flex">
      <Link
        href="/discover"
        aria-label="Bandhanaa home"
        className="grid size-11 place-items-center rounded-xl bg-[linear-gradient(135deg,#ff4d8d,#8b5cf6)] text-lg font-bold text-white"
      >
        B
      </Link>
      <nav
        aria-label="Messaging navigation"
        className="mt-6 flex flex-col gap-2"
      >
        {navigation.map(([Icon, label, href]) => {
          const active = label === "Messages";
          return (
            <Link
              key={label}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={`relative grid size-11 place-items-center rounded-xl transition ${active ? "bg-[#f0e9f7] text-[#9d4edd]" : "text-[#667781] hover:bg-[#eceff1]"}`}
            >
              <Icon size={21} strokeWidth={1.7} />
              {active ? (
                <span className="absolute -left-4 h-7 w-[3px] rounded-r bg-[linear-gradient(#ff4d8d,#8b5cf6)]" />
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col items-center gap-2">
        <Link
          href="/settings"
          aria-label="Settings"
          className="app-icon-button"
        >
          <Settings size={20} />
        </Link>
        <Link
          href="/my-profile"
          aria-label="My profile"
          className="relative mt-1 size-10 overflow-hidden rounded-full ring-2 ring-white"
        >
          <ProfileImage
            src={avatarUrl}
            alt={`${name}'s profile`}
            fill
            sizes="40px"
            className="object-cover"
          />
        </Link>
      </div>
    </aside>
  );
}
