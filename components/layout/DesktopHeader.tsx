import { ProfileImage } from "@/components/ui/ProfileImage";
import { Bell, Search } from "lucide-react";

export function DesktopHeader({ avatarUrl, name = "Your" }: { avatarUrl?: string; name?: string }) {
  return (
    <header className="hidden h-[64px] items-center justify-end border-b border-[#f0f0f3] px-7 md:flex">
      <div className="flex items-center gap-7">
        <button
          aria-label="Search"
          className="rounded-full outline-none transition hover:text-[#ff1682] focus-visible:ring-2 focus-visible:ring-pink-300"
        >
          <Search size={22} strokeWidth={1.7} />
        </button>
        <button
          aria-label="Notifications"
          className="relative rounded-full outline-none transition hover:text-[#ff1682] focus-visible:ring-2 focus-visible:ring-pink-300"
        >
          <Bell size={22} strokeWidth={1.7} />
          <span className="absolute right-0 top-0 size-[6px] rounded-full bg-[#ff1682] ring-2 ring-white" />
        </button>
        <span className="relative size-10 overflow-hidden rounded-full bg-slate-100">
          <ProfileImage
            src={avatarUrl ?? ""}
            alt={`${name}'s avatar`}
            fill
            sizes="40px"
            className="object-cover"
          />
        </span>
      </div>
    </header>
  );
}
