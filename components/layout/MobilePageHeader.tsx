import Link from "next/link";
import { Heart } from "lucide-react";
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
      <div className="relative grid grid-cols-[44px_1fr_44px] items-center">
       
        <Link
          href="/discover"
          aria-label="Bandhanaa" 
        >
          <Brand compact />
        </Link>
         <span aria-hidden="true" />
        <div className="justify-self-end">
          <Link
            href="/matches?tab=shortlisted"
            aria-label="Shortlist"
            className="grid size-11 place-items-center rounded-[15px] bg-white/90 shadow-[0_7px_22px_rgba(15,20,25,.07)]"
          >
            <Heart size={18} strokeWidth={1.8} />
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
