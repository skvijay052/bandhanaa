import { ProfileImage } from "@/components/ui/ProfileImage";
import Link from "next/link";
import { BadgeCheck, Heart, MapPin, X } from "lucide-react";
import type { DiscoverProfile } from "./types";
export function MobileProfileCard({
  profile,
  liked,
  onLike,
  onReject,
}: {
  profile: DiscoverProfile;
  liked: boolean;
  onLike: () => void;
  onReject: () => void;
}) {
  return (
    <>
      <article className="relative aspect-[1.05/1] overflow-hidden rounded-[20px] bg-slate-100">
        <Link href={`/profile/${profile.id}`}>
          <ProfileImage
            src={profile.image}
            alt={`${profile.name}'s profile`}
            fill
            priority
            sizes="calc(100vw - 32px)"
            className="object-cover"
          />
          <span className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,.72),transparent_58%)]" />
        </Link>
        <span className="absolute left-4 top-4 rounded-full bg-[#1d9bf0] px-3 py-1 text-[10px] font-semibold text-white">
          New
        </span>
        <button
          onClick={onLike}
          aria-label={liked ? "Remove from shortlist" : "Add to shortlist"}
          className={`absolute right-4 top-4 ${liked ? "text-[#ff3040]" : "text-white"}`}
        >
          <Heart size={23} fill={liked ? "currentColor" : "none"} strokeWidth={2} />
        </button>
        <div className="absolute bottom-5 left-5 text-white">
          <Link
            href={`/profile/${profile.id}`}
            className="flex items-center gap-1.5 text-[20px] font-semibold"
          >
            {profile.name}, {profile.age}
            <BadgeCheck size={18} className="fill-[#1d9bf0] text-[#1d9bf0]" />
          </Link>
          <p className="mt-2 text-[13px] font-normal">{profile.job}</p>
          <p className="mt-2 flex items-center gap-1.5 text-[13px] font-normal">
            <MapPin size={14} />
            {profile.city.split(",")[0]}
          </p>
          <p className="mt-3 text-[13px] font-medium text-[#70c4fa]">
            {profile.match}% preferences
          </p>
        </div>
      </article>
      <div className="mt-5 flex items-center justify-center gap-9">
        <button
          onClick={onReject}
          aria-label="Skip profile"
          className="grid size-14 place-items-center rounded-full border border-[#ece9ef] bg-white shadow-sm"
        >
          <X size={25} />
        </button>
        <button
          onClick={onLike}
          aria-label={liked ? "Remove from shortlist" : "Add to shortlist"}
          className={`grid size-[68px] place-items-center rounded-full border shadow-sm ${liked ? "border-[#ff3040] bg-white text-[#ff3040]" : "border-[#1d9bf0] bg-[#1d9bf0] text-white"}`}
        >
          <Heart size={29} fill={liked ? "currentColor" : "none"} strokeWidth={2} />
        </button>
      </div>
    </>
  );
}
