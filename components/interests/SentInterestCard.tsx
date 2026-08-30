import { ProfileImage } from "@/components/ui/ProfileImage";
import Link from "next/link";
import { BadgeCheck, MapPin, MoreVertical } from "lucide-react";

import type { InterestProfile, InterestStatus } from "@/data/interests";

const statusStyle: Record<InterestStatus, string> = {
  new: "bg-pink-50 text-[#ff1682]",
  accepted: "bg-[#e4f7ea] text-[#247a4b]",
  pending: "bg-[#fff6dc] text-[#e49100]",
  declined: "bg-[#fff0f3] text-[#e93662]",
};

export function SentInterestCard({ profile }: { profile: InterestProfile }) {
  return (
    <article className="border-[#eeeef2] bg-white md:overflow-hidden md:rounded-xl md:border md:shadow-[0_2px_8px_rgba(15,15,30,.025)]">
      <div className="hidden md:block">
        <div className="relative h-[112px] overflow-hidden">
          <ProfileImage
            src={profile.image}
            alt={profile.name}
            fill
            sizes="200px"
            className="object-cover"
          />
          <span
            className={`absolute right-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${statusStyle[profile.status]}`}
          >
            {profile.status}
          </span>
          <button
            aria-label={`More options for ${profile.name}`}
            className="absolute bottom-2 right-1 text-[#141522]"
          >
            <MoreVertical size={18} />
          </button>
        </div>
        <div className="p-3">
          <Name profile={profile} />
          <p className="mt-2 text-[11px] text-[#585c70]">
            {profile.occupation}
          </p>
          <p className="mt-2 flex items-center gap-1 text-[10px] text-[#65697d]">
            <MapPin size={11} />
            {profile.location}
          </p>
          <p
            className={`mt-2 text-[10px] ${profile.status === "declined" ? "text-[#e93662]" : profile.status === "accepted" ? "text-[#247a4b]" : "text-[#ff1682]"}`}
          >
            {profile.dateText}
          </p>
          <Link
            href={`/profile/${profile.profileId}`}
            className="mt-3 flex h-8 w-fit items-center rounded-lg bg-[#0a0b18] px-4 text-[11px] font-semibold text-white"
          >
            View Profile
          </Link>
        </div>
      </div>

      <div className="grid min-h-[68px] grid-cols-[54px_minmax(0,1fr)_68px] items-center gap-3 py-1.5 md:hidden">
        <div className="relative size-[54px] overflow-hidden rounded-lg">
          <ProfileImage
            src={profile.image}
            alt={profile.name}
            fill
            sizes="54px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <Name profile={profile} />
          <p className="mt-1 truncate text-[9px] text-[#585c70]">
            {profile.occupation}
          </p>
          <p
            className={`mt-1 truncate text-[9px] ${profile.status === "declined" ? "text-[#e93662]" : "text-[#777b8d]"}`}
          >
            {profile.dateText}
          </p>
        </div>
        <span
          className={`rounded-full px-2 py-1 text-center text-[9px] font-semibold capitalize ${statusStyle[profile.status]}`}
        >
          {profile.status}
        </span>
      </div>
    </article>
  );
}

function Name({ profile }: { profile: InterestProfile }) {
  return (
    <div className="flex items-center gap-1">
      <h3 className="truncate text-[14px] font-bold max-md:text-xs">
        {profile.name}, {profile.age}
      </h3>
      {profile.verified ? (
        <BadgeCheck
          size={14}
          className="shrink-0 fill-[#8b45df] text-[#8b45df]"
        />
      ) : null}
    </div>
  );
}
