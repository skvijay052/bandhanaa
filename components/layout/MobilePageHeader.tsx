import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { Brand } from "@/components/auth/Brand";

export function MobilePageHeader({
  title,
  description,
  backHref,
  compact = false,
}: {
  title?: string;
  description?: string;
  backHref?: string;
  compact?: boolean;
}) {
  return (
    <header
      className={`mobile-page-header sticky top-0 z-[90] overflow-hidden bg-white px-4 md:hidden ${compact ? "py-3" : "pb-5 pt-5"}`}
    >
      <div className="relative grid grid-cols-[44px_1fr_44px] items-center">
        {backHref ? (
          <Link
            href={backHref}
            aria-label="Back"
            className="grid size-10 place-items-center rounded-[13px] bg-white text-[#111] shadow-[0_7px_22px_rgba(15,20,25,.07)]"
          >
            <ArrowLeft size={20} strokeWidth={1.9} />
          </Link>
        ) : (
          <Link href="/discover" aria-label="Bandhanaa">
            <Brand compact />
          </Link>
        )}

        {backHref ? (
          <div className="flex justify-center" aria-label="Bandhanaa">
            <Brand compact />
          </div>
        ) : (
          <span aria-hidden="true" />
        )}

        <div className="justify-self-end">
          <Link
            href="/matches?tab=shortlisted"
            aria-label="Shortlist"
            className="grid size-10 place-items-center rounded-[13px] bg-white text-[#111] shadow-[0_7px_22px_rgba(15,20,25,.07)]"
          >
            <Heart size={18} strokeWidth={1.8} />
          </Link>
        </div>
      </div>

      {title ? (
        <div className={`relative ${compact ? "mt-3" : "mt-5"}`}>
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
