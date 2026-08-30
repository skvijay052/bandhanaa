import { ProfileImage } from "@/components/ui/ProfileImage";
import Link from "next/link";
import { BadgeCheck, MapPin } from "lucide-react";

import type { InterestProfile } from "@/data/interests";

export function ReceivedInterestCard({
  profile,
  onRespond,
}: {
  profile: InterestProfile;
  onRespond: () => void;
}) {
  return (
    <article className="border-[#eeeef2] bg-white md:overflow-hidden md:rounded-xl md:border md:shadow-[0_2px_8px_rgba(15,15,30,.025)]">
      <div className="hidden md:block">
        <div className="relative h-[145px] overflow-hidden">
          <ProfileImage
            src={profile.image}
            alt={profile.name}
            fill
            sizes="200px"
            className="object-cover"
          />
          {profile.status === "new" ? (
            <span className="absolute right-2 top-2 rounded-full bg-[#ff4fa1] px-2.5 py-1 text-[10px] font-semibold text-white">
              New
            </span>
          ) : null}
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
          <p className="mt-2 text-[10px] text-[#777b8d]">{profile.time}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              href={`/profile/${profile.profileId}`}
              className="flex h-8 items-center justify-center rounded-lg bg-[#0a0b18] text-[11px] font-semibold text-white"
            >
              View Profile
            </Link>
            <button
              onClick={onRespond}
              disabled={profile.status === "accepted"}
              className={`h-8 rounded-lg border text-[11px] font-semibold ${profile.status === "accepted" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-[#ff8abb] text-[#ff1682]"}`}
            >
              {profile.status === "accepted" ? "Accepted" : "Respond"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid min-h-[76px] grid-cols-[64px_minmax(0,1fr)_74px] items-center gap-3 py-1.5 md:hidden">
        <div className="relative size-16 overflow-hidden rounded-lg">
          <ProfileImage
            src={profile.image}
            alt={profile.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <Name profile={profile} />
          <p className="mt-1 truncate text-[10px] text-[#585c70]">
            {profile.occupation}
          </p>
          <p className="mt-1 truncate text-[9px] text-[#65697d]">
            {profile.location}
          </p>
          <p className="mt-1 text-[9px] text-[#777b8d]">{profile.time}</p>
        </div>
        <div className="space-y-1.5">
          <Link
            href={`/profile/${profile.profileId}`}
            className="flex h-[27px] w-full items-center justify-center rounded-lg bg-[#0a0b18] text-[9px] font-semibold text-white"
          >
            View
          </Link>
          <button
            onClick={onRespond}
            disabled={profile.status === "accepted"}
            className={`h-[27px] w-full rounded-lg border text-[9px] font-semibold ${profile.status === "accepted" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-[#ff71b2] text-[#ff1682]"}`}
          >
            {profile.status === "accepted" ? "Accepted" : "Respond"}
          </button>
        </div>
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
