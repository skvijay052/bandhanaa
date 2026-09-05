import Link from "next/link";
import {
  BadgeCheck,
  Heart,
  Languages,
  Landmark,
  MapPin,
  Ruler,
} from "lucide-react";

import { ProfileImage } from "@/components/ui/ProfileImage";
import type { MatchProfile } from "@/data/matches";

export function MatchCard({
  profile,
  shortlisted,
  onShortlist,
  priority = false,
}: {
  profile: MatchProfile;
  shortlisted: boolean;
  onShortlist: () => void;
  priority?: boolean;
}) {
  return (
    <article className="group relative aspect-[3/4] min-w-0 overflow-hidden rounded-[18px] bg-[#dfe5e9] shadow-[0_5px_18px_rgba(15,20,25,.10)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(15,20,25,.18)]">
      <ProfileImage
        src={profile.image}
        alt=""
        fill
        priority={priority}
        sizes="(max-width:1023px) 50vw, (max-width:1535px) 25vw, 22vw"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 via-transparent via-45% to-black/90"
        aria-hidden="true"
      />

      <Link
        href={`/profile/${profile.id}`}
        aria-label={`View ${profile.name}'s match profile`}
        className="absolute inset-0"
      />

      <span className="absolute left-3 top-3 inline-flex h-7 items-center rounded-full bg-[#1d9bf0]/95 px-3 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md">
        {profile.verified ? "Verified" : "New"}
      </span>

      <button
        type="button"
        onClick={onShortlist}
        aria-label={`${shortlisted ? "Remove from" : "Add to"} shortlist`}
        aria-pressed={shortlisted}
        className={`absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full border shadow-sm backdrop-blur-md transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${shortlisted ? "border-white bg-white text-[#ff2f92] hover:bg-white" : "border-white/25 bg-black/25 text-white hover:bg-black/40"}`}
      >
        <Heart
          size={22}
          fill={shortlisted ? "currentColor" : "none"}
          strokeWidth={2.2}
        />
      </button>

      <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4 pt-24 text-white">
        <div className="flex items-center gap-1.5">
          <Link
            href={`/profile/${profile.id}`}
            className="min-w-0 truncate text-[18px] font-bold tracking-[-.02em] drop-shadow-sm"
          >
            {profile.name}
          </Link>
          {profile.verified ? (
            <BadgeCheck
              size={17}
              aria-label="Verified profile"
              className="shrink-0 fill-[#1d9bf0] text-[#1d9bf0] [&>path:last-child]:text-white"
            />
          ) : null}
        </div>

        <p className="mt-1 truncate text-[13px] text-white/90">
          {profile.age}
          <span className="mx-2 text-white/60">•</span>
          {profile.occupation}
        </p>
        <p className="mt-1.5 flex items-center gap-1.5 truncate text-[12px] text-white/85">
          <MapPin size={13} className="shrink-0" aria-hidden="true" />
          <span className="truncate">
            {profile.city}, {profile.state}
          </span>
        </p>

        <div className="mt-2.5 flex min-w-0 items-center gap-2.5 overflow-hidden text-[11px] text-white/85">
          <Fact icon={<Ruler />} value={profile.height} />
          <Fact icon={<Landmark />} value={profile.religion} />
          <Fact icon={<Languages />} value={profile.language} />
        </div>
      </div>
    </article>
  );
}

function Fact({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="flex min-w-0 items-center gap-1">
      <span className="shrink-0 [&_svg]:size-[13px]" aria-hidden="true">
        {icon}
      </span>
      <span className="truncate">{value}</span>
    </span>
  );
}
