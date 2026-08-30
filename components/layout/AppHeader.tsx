import { ProfileImage } from "@/components/ui/ProfileImage";
import { Bell, ChevronDown, LogOut, Search } from "lucide-react";
import { Brand } from "@/components/auth/Brand";

export function AppHeader({
  avatarUrl,
  name,
}: {
  avatarUrl: string;
  name: string;
}) {
  return (
    <header className="flex h-[68px] items-center justify-between border-b border-[#eeeeF2] px-7 max-md:h-[62px] max-md:px-4">
      <Brand compact />
      <div className="flex items-center gap-6 max-md:gap-4">
        <button
          aria-label="Search"
          className="rounded-full outline-none transition hover:text-[#f32988] focus-visible:ring-2 focus-visible:ring-pink-300"
        >
          <Search size={23} strokeWidth={1.8} />
        </button>
        <button
          aria-label="Notifications"
          className="relative rounded-full outline-none transition hover:text-[#f32988] focus-visible:ring-2 focus-visible:ring-pink-300"
        >
          <Bell size={23} strokeWidth={1.8} />
          <span className="absolute right-0 top-0 size-2 rounded-full bg-[#f32988] ring-2 ring-white" />
        </button>
        <details className="group relative">
          <summary
            aria-label="Open profile menu"
            className="flex cursor-pointer list-none items-center gap-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-pink-300 [&::-webkit-details-marker]:hidden"
          >
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
              size={15}
              strokeWidth={1.8}
              className="text-[#727283] transition group-open:rotate-180 max-md:hidden"
            />
          </summary>
          <div className="absolute right-0 top-[52px] z-50 w-[220px] overflow-hidden rounded-xl border border-[#ececf0] bg-white p-2 shadow-[0_12px_35px_rgba(15,15,30,.14)]">
            <div className="border-b border-[#eeeeF2] px-3 py-2.5">
              <p className="truncate text-[13px] font-bold text-[#0c0c18]">
                {name}
              </p>
              <p className="mt-0.5 text-[11px] text-[#777788]">
                Bandhanaa member
              </p>
            </div>
            <form action="/api/auth/signout" method="post" className="mt-1">
              <button
                type="submit"
                className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-[13px] font-semibold text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
              >
                <LogOut size={17} strokeWidth={1.8} />
                Logout
              </button>
            </form>
          </div>
        </details>
      </div>
    </header>
  );
}
