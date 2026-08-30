import { ProfileImage } from "@/components/ui/ProfileImage";
import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { Brand } from "@/components/auth/Brand";

export function MobileHeader({ avatarUrl, name = "Your" }: { avatarUrl?: string; name?: string }) {
  return (
    <header className="flex h-[64px] items-center px-4 md:hidden">
      <Link href="/discover" aria-label="Bandhanaa home">
        <Brand compact />
      </Link>
      <div className="ml-auto flex items-center gap-5">
        <button aria-label="Search">
          <Search size={21} strokeWidth={1.7} />
        </button>
        <button aria-label="Notifications" className="relative">
          <Bell size={21} strokeWidth={1.7} />
          <span className="absolute -right-0.5 top-0 size-[6px] rounded-full bg-[#ff1682] ring-2 ring-white" />
        </button>
        <span className="relative size-8 overflow-hidden rounded-full">
          <ProfileImage
            src={avatarUrl ?? ""}
            alt={`${name}'s avatar`}
            fill
            sizes="32px"
            className="object-cover"
          />
        </span>
      </div>
    </header>
  );
}
