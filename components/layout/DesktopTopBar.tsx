import { ProfileImage } from "@/components/ui/ProfileImage";
import { Bell, ChevronDown, LogOut, Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function DesktopTopBar({
  avatarUrl,
  name,
}: {
  avatarUrl: string;
  name: string;
}) {
  return (
    <header className="hidden" aria-hidden="true">
      <div className="flex items-center gap-7">
        <button
          aria-label="Search"
          className="app-icon-button"
        >
          <Search size={23} strokeWidth={1.7} />
        </button>
        <button
          aria-label="Notifications, 12 unread"
          className="app-icon-button relative"
        >
          <Bell size={23} strokeWidth={1.7} />
          <span className="absolute -right-2 -top-2 grid size-[20px] place-items-center rounded-full bg-[#f00079] text-[9px] font-bold text-white">
            12
          </span>
        </button>
        <ThemeToggle />
        <details className="group relative">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-pink-300 [&::-webkit-details-marker]:hidden">
            <span className="relative block size-10 overflow-hidden rounded-full bg-slate-100">
              <ProfileImage
                src={avatarUrl}
                alt={`${name}'s avatar`}
                fill
                sizes="40px"
                className="object-cover"
              />
            </span>
            <ChevronDown
              size={16}
              className="transition group-open:rotate-180"
            />
          </summary>
          <div className="absolute right-0 top-[52px] z-50 w-[220px] rounded-xl border border-[#ececf0] bg-white p-2 shadow-[0_12px_35px_rgba(15,15,30,.14)]">
            <div className="border-b border-[#eeeef2] px-3 py-2.5">
              <p className="truncate text-[13px] font-bold">{name}</p>
              <p className="mt-0.5 text-[11px] text-[#777788]">
                Bandhanaa member
              </p>
            </div>
            <form action="/api/auth/signout" method="post" className="mt-1">
              <button className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-[13px] font-semibold text-red-600 transition hover:bg-red-50">
                <LogOut size={17} strokeWidth={1.8} /> Logout
              </button>
            </form>
          </div>
        </details>
      </div>
    </header>
  );
}
