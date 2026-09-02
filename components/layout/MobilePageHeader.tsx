import Link from "next/link";
import { Bell, Heart } from "lucide-react";
import { Brand } from "@/components/auth/Brand";

export function MobilePageHeader({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <header className="mobile-page-header relative overflow-hidden px-4 pb-5 pt-5 md:hidden">
      <span className="pointer-events-none absolute -left-24 -top-28 size-72 rounded-full bg-[#dff9f3]/80 blur-2xl" />
      <span className="pointer-events-none absolute -right-28 -top-16 size-72 rounded-full bg-[#eee7ff]/80 blur-2xl" />
      <div className="relative flex items-center justify-between">
        <Brand compact />
        <div className="flex gap-2.5">
          <Link
            href="/matches?tab=shortlisted"
            aria-label="Shortlist"
            className="grid size-11 place-items-center rounded-[15px] bg-white/90 shadow-[0_7px_22px_rgba(15,20,25,.07)]"
          >
            <Heart size={18} strokeWidth={1.8} />
          </Link>
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="relative grid size-11 place-items-center rounded-[15px] bg-white/90 shadow-[0_7px_22px_rgba(15,20,25,.07)]"
          >
            <Bell size={18} strokeWidth={1.8} />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-[#8b3de8] ring-2 ring-white" />
          </Link>
        </div>
      </div>
      {title ? (
        <div className="relative mt-5">
          <h1 className="text-[27px] font-bold tracking-[-.035em] text-[#0f1419]">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-[13px] text-[#687684]">{description}</p>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
