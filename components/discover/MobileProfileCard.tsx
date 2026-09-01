import { ProfileImage } from "@/components/ui/ProfileImage";
import Link from "next/link";
import { BadgeCheck, Heart, MapPin, Send, X } from "lucide-react";
import type { DiscoverProfile } from "./types";

export function MobileProfileCard({
  profile,
  liked,
  onLike,
  onRelationshipAction,
  onClose,
}: {
  profile: DiscoverProfile;
  liked: boolean;
  onLike: () => void;
  onRelationshipAction: () => void;
  onClose: () => void;
}) {
  return (
    <article className="relative flex h-[214px] overflow-hidden rounded-[22px] border border-white/80 bg-white p-2 shadow-[0_12px_32px_rgba(15,20,25,.08)]">
      <Link
        href={`/profile/${profile.id}`}
        aria-label={`View ${profile.name}'s profile`}
        className="relative h-full w-[42%] shrink-0 overflow-hidden rounded-[16px] bg-[#eff3f4]"
      >
        <ProfileImage
          src={profile.image}
          alt={`${profile.name}'s profile`}
          fill
          sizes="42vw"
          className="object-cover"
        />
        <span className="absolute left-2.5 top-2 inline-flex rounded-full bg-[#f1dfff] px-2.5 py-1 text-[10px] font-semibold text-[#8b3de8] shadow-sm">
          New
        </span>
        <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-full bg-[#0f1419]/80 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          <span
            className={`size-2 rounded-full ${profile.online ? "bg-[#31c95b]" : "bg-[#8b98a5]"}`}
          />
          {profile.online ? "Online" : "Offline"}
        </span>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col py-1.5 pl-3 pr-1">
        <div className="flex items-start gap-1">
          <Link
            href={`/profile/${profile.id}`}
            className="min-w-0 flex-1 truncate text-[18px] font-bold tracking-[-.025em] text-[#0f1419]"
          >
            {profile.name}, {profile.age}
          </Link>
          <BadgeCheck
            size={17}
            className="mt-1 shrink-0 fill-[#1d9bf0] text-[#1d9bf0] [&>path:last-child]:text-white"
          />
          <button
            type="button"
            onClick={onLike}
            aria-label={`${liked ? "Remove from shortlist" : "Add to shortlist"} ${profile.name}`}
            className={`-mr-1 -mt-2 grid size-11 shrink-0 place-items-center rounded-full border border-white bg-white shadow-[0_8px_24px_rgba(15,20,25,.18),0_2px_8px_rgba(29,155,240,.10)] transition-shadow hover:shadow-[0_10px_28px_rgba(15,20,25,.22)] ${liked ? "text-[#ff3040]" : "text-[#536471]"}`}
          >
            <Heart
              size={22}
              fill={liked ? "currentColor" : "none"}
              strokeWidth={2}
            />
          </button>
        </div>

        <Link href={`/profile/${profile.id}`} className="min-w-0 flex-1">
          <p className="mt-0.5 truncate text-[12px] text-[#536471]">
            {profile.job}
          </p>
          <p className="mt-1.5 flex items-start gap-1 text-[11px] leading-4 text-[#536471]">
            <MapPin size={12} className="mt-0.5 shrink-0" />
            <span className="line-clamp-2">{profile.city}</span>
          </p>
          <p className="mt-1.5 truncate text-[11px] text-[#536471]">
            {profile.height} <span className="mx-1">·</span> {profile.religion}{" "}
            <span className="mx-1">·</span> {profile.motherTongue}
          </p>
          <span className="mt-2 inline-flex rounded-full bg-[#f3eaff] px-3 py-1.5 text-[11px] font-semibold text-[#8b3de8]">
            <span className="mr-1" aria-hidden="true">
              ✦
            </span>
            {profile.match}% preferences
          </span>
        </Link>

        <div className="mt-2 flex h-10 items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            aria-label={`Hide ${profile.name}`}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-[#eff3f4] bg-white text-[#ff3040] shadow-[0_5px_14px_rgba(15,20,25,.10)]"
          >
            <X size={21} strokeWidth={2.2} />
          </button>
          {profile.relationship === "incoming_pending" ? (
            <>
              <button
                type="button"
                onClick={onRelationshipAction}
                className="flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#1d9bf0] px-3 text-[11px] font-semibold text-white"
              >
                <Send size={14} />
                Accept Request
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onRelationshipAction}
              disabled={profile.relationship !== "none"}
              className={`flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-3 text-[12px] font-semibold ${profile.relationship === "none" ? "bg-[#1d9bf0] text-white" : "bg-[#f3eaff] text-[#8b3de8]"}`}
            >
              <Send size={15} />
              {profile.relationship === "none"
                ? "Follow"
                : profile.relationship === "outgoing_pending"
                  ? "Requested"
                  : "Following"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
