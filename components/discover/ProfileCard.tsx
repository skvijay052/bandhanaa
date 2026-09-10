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
import type { DiscoverProfile } from "./types";

export function ProfileCard({
  profile,
  liked,
  onLike,
  listView = false,
}: {
  profile: DiscoverProfile;
  liked: boolean;
  onLike: () => void;
  onRelationshipAction: () => void;
  listView?: boolean;
}) {
  if (listView) {
    return (
      <article className="group grid min-h-[190px] grid-cols-[180px_minmax(0,1fr)] overflow-hidden rounded-[18px] border border-[#eeeeee] bg-white shadow-[0_8px_24px_rgba(17,17,17,.045)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(17,17,17,.08)]">
        <div className="relative min-h-[190px] overflow-hidden bg-[#f0f0f0]">
          <ProfileImage
            src={profile.image}
            alt={profile.name}
            fill
            sizes="180px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <VerifiedPill />
          <ShortlistButton liked={liked} onLike={onLike} name={profile.name} />
        </div>
        <div className="flex min-w-0 flex-col p-5">
          <NameLine profile={profile} />
          <p className="mt-1.5 truncate text-[13px] text-[#6f747b]">{profile.job}</p>
          <p className="mt-2 flex items-center gap-1.5 truncate text-[12px] text-[#81858b]">
            <MapPin size={13} className="shrink-0" />
            <span className="truncate">{profile.city}</span>
          </p>
          <Facts profile={profile} />
          <MatchPill match={profile.match} />
        </div>
      </article>
    );
  }

  return (
    <article className="group min-w-0 overflow-hidden rounded-[18px] border border-[#eeeeee] bg-white shadow-[0_8px_24px_rgba(17,17,17,.045)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(17,17,17,.085)]">
      <div className="relative aspect-[1.07/1] overflow-hidden bg-[#efefef]">
        <ProfileImage
          src={profile.image}
          alt={profile.name}
          fill
          sizes="(max-width:1023px) 50vw, (max-width:1279px) 33vw, 23vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
        />
        <Link
          href={`/profile/${profile.id}`}
          aria-label={`View ${profile.name}'s profile`}
          className="absolute inset-0"
        />
        <VerifiedPill />
        <ShortlistButton liked={liked} onLike={onLike} name={profile.name} />
      </div>

      <div className="p-4">
        <NameLine profile={profile} />
        <p className="mt-1.5 truncate text-[12px] text-[#6f747b]">{profile.job}</p>
        <p className="mt-1.5 flex items-center gap-1.5 truncate text-[11px] text-[#85898f]">
          <MapPin size={12} className="shrink-0" aria-hidden="true" />
          <span className="truncate">{profile.city}</span>
        </p>
        <Facts profile={profile} />
        <MatchPill match={profile.match} />
      </div>
    </article>
  );
}

function VerifiedPill() {
  return (
    <span className="absolute left-3 top-3 z-10 inline-flex h-7 items-center rounded-full bg-[#f43f93] px-3 text-[10px] font-bold text-white shadow-sm">
      Verified
    </span>
  );
}

function ShortlistButton({
  liked,
  onLike,
  name,
}: {
  liked: boolean;
  onLike: () => void;
  name: string;
}) {
  return (
    <button
      type="button"
      onClick={onLike}
      aria-label={`${liked ? "Remove from shortlist" : "Add to shortlist"} ${name}`}
      aria-pressed={liked}
      className={`absolute right-3 top-3 z-20 grid size-9 place-items-center rounded-full border border-white bg-white shadow-[0_5px_14px_rgba(17,17,17,.12)] transition hover:scale-105 ${liked ? "text-[#f43f93]" : "text-[#72777c] hover:text-[#f43f93]"}`}
    >
      <Heart size={19} fill={liked ? "currentColor" : "none"} strokeWidth={2} />
    </button>
  );
}

function NameLine({ profile }: { profile: DiscoverProfile }) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <Link
        href={`/profile/${profile.id}`}
        className="min-w-0 truncate text-[15px] font-bold tracking-[-.02em] text-[#202020] hover:text-[#e83e78]"
      >
        {profile.name}{profile.age ? `, ${profile.age}` : ""}
      </Link>
      <BadgeCheck
        size={15}
        aria-label="Verified profile"
        className="shrink-0 fill-[#f43f93] text-[#f43f93] [&>path:last-child]:text-white"
      />
    </div>
  );
}

function Facts({ profile }: { profile: DiscoverProfile }) {
  return (
    <div className="mt-3 flex min-w-0 items-center gap-3 overflow-hidden border-t border-[#f2f2f2] pt-3 text-[10px] text-[#777c82]">
      <Fact icon={<Ruler />} value={profile.height} />
      <Fact icon={<Landmark />} value={profile.religion} />
      <Fact icon={<Languages />} value={profile.motherTongue} />
    </div>
  );
}

function MatchPill({ match }: { match: number }) {
  return (
    <span className="mt-3 inline-flex h-7 items-center rounded-full border border-[#f7b4d5] bg-[#fff3f9] px-3 text-[11px] font-bold text-[#e33d92]">
      {match}% Match
    </span>
  );
}

function Fact({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="flex min-w-0 items-center gap-1">
      <span className="shrink-0 text-[#777c82] [&_svg]:size-[12px]" aria-hidden="true">
        {icon}
      </span>
      <span className="truncate">{value}</span>
    </span>
  );
}
