import { ProfileImage } from "@/components/ui/ProfileImage";
import Link from "next/link";
import { Bell, Menu, Search } from "lucide-react";
import { Brand } from "@/components/auth/Brand";
export function MyProfileHeader({ avatar }: { avatar: string }) {
  return (
    <>
      <header className="hidden h-[64px] items-center justify-end border-b border-[#ececf1] px-7 md:flex">
        <div className="flex items-center gap-7">
          <Search size={21} />
          <span className="relative">
            <Bell size={21} />
            <span className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-[#ef1683] text-[7px] text-white">
              12
            </span>
          </span>
          <span className="relative size-9 overflow-hidden rounded-full">
            <ProfileImage
              src={avatar}
              alt="Your avatar"
              fill
              sizes="36px"
              className="object-cover"
            />
          </span>
        </div>
      </header>
      <header className="flex h-[62px] items-center border-b border-[#ececf1] px-4 md:hidden">
        <button aria-label="Open menu">
          <Menu size={20} />
        </button>
        <Link href="/discover" className="ml-7">
          <Brand compact />
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <span className="relative">
            <Bell size={20} />
            <span className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-[#ef1683] text-[7px] text-white">
              12
            </span>
          </span>
          <span className="relative size-8 overflow-hidden rounded-full">
            <ProfileImage
              src={avatar}
              alt="Your avatar"
              fill
              sizes="32px"
              className="object-cover"
            />
          </span>
        </div>
      </header>
    </>
  );
}
