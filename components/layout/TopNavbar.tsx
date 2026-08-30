import { ProfileImage } from "@/components/ui/ProfileImage";
import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { Brand } from "@/components/auth/Brand";

export function TopNavbar() {
  return (
    <header className="flex h-[64px] items-center border-b border-[#f0f0f2] bg-white px-5 md:px-7">
      <Link href="/discover" aria-label="Bandhanaa home">
        <Brand compact />
      </Link>
      <div className="ml-auto flex items-center gap-6">
        <button aria-label="Search">
          <Search size={22} strokeWidth={1.7} />
        </button>
        <button aria-label="Notifications" className="relative">
          <Bell size={22} strokeWidth={1.7} />
          <span className="absolute right-0 top-0 size-1.5 rounded-full bg-[#ff2d8d] ring-2 ring-white" />
        </button>
        <span className="relative size-9 overflow-hidden rounded-full">
          <ProfileImage
            src="/profiles/rohan.png"
            alt="Vijay's avatar"
            fill
            sizes="36px"
            className="object-cover"
          />
        </span>
      </div>
    </header>
  );
}
