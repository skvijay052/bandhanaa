"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  BadgeCheck,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Heart,
  Landmark,
  Languages,
  MapPin,
  MoreHorizontal,
  Ruler,
  ShieldCheck,
  X,
} from "lucide-react";

import { ProfileImage } from "@/components/ui/ProfileImage";
import type { DiscoverProfile } from "./types";

export type RecentVisitorPopupProfile = {
  id: string;
  name: string;
  image: string;
  photos: string[];
  profession: string;
  location: string;
  age?: number;
  height?: string;
  religion?: string;
  motherTongue?: string;
  education?: string;
  maritalStatus?: string;
  bio?: string;
  match?: number;
  relationship: DiscoverProfile["relationship"];
};

type Props = {
  profiles: RecentVisitorPopupProfile[];
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
  shortlisted: string[];
  relationshipStates: Record<string, DiscoverProfile["relationship"]>;
  onShortlist: (id: string) => void;
  onInterest: (profile: RecentVisitorPopupProfile) => void;
};

export function RecentVisitorProfileModal({
  profiles,
  index,
  onIndex,
  onClose,
  shortlisted,
  relationshipStates,
  onShortlist,
  onInterest,
}: Props) {
  const profile = profiles[index];
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    setPhotoIndex(0);
  }, [index]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && profiles.length > 1) {
        onIndex((index - 1 + profiles.length) % profiles.length);
      }
      if (event.key === "ArrowRight" && profiles.length > 1) {
        onIndex((index + 1) % profiles.length);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [index, onClose, onIndex, profiles.length]);

  const photos = useMemo(() => {
    if (!profile) return [];
    return Array.from(
      new Set([profile.image, ...profile.photos].filter(Boolean)),
    ).slice(0, 8);
  }, [profile]);

  if (!profile || typeof document === "undefined") return null;

  const relationship = relationshipStates[profile.id] ?? profile.relationship;
  const liked = shortlisted.includes(profile.id);
  const highlights = [
    profile.education,
    profile.religion,
    profile.motherTongue,
    profile.maritalStatus,
  ]
    .filter((value): value is string => Boolean(value && value !== "Not added"))
    .slice(0, 4);
  const facts = [
    profile.height && profile.height !== "Not added"
      ? { icon: Ruler, value: profile.height }
      : null,
    profile.religion && profile.religion !== "Not added"
      ? { icon: Landmark, value: profile.religion }
      : null,
    profile.motherTongue && profile.motherTongue !== "Not added"
      ? { icon: Languages, value: profile.motherTongue }
      : null,
  ].filter(Boolean) as Array<{ icon: typeof Ruler; value: string }>;

  const interestLabel =
    relationship === "following"
      ? "Following"
      : relationship === "outgoing_pending"
        ? "Requested"
        : relationship === "incoming_pending"
          ? "Accept Interest"
          : "Send Interest";
  const interestDisabled =
    relationship === "following" || relationship === "outgoing_pending";

  function moveVisitor(direction: -1 | 1) {
    onIndex((index + direction + profiles.length) % profiles.length);
  }

  function movePhoto(direction: -1 | 1) {
    if (photos.length < 2) return;
    setPhotoIndex((current) =>
      (current + direction + photos.length) % photos.length,
    );
  }

  const dialog = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${profile.name} profile preview`}
      className="fixed inset-0 z-[9999] grid place-items-center bg-black/55 p-5 backdrop-blur-[3px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-[1020px]">
        {profiles.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => moveVisitor(-1)}
              aria-label="Show previous recent visitor"
              className="absolute left-[-62px] top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white text-[#151515] shadow-[0_12px_32px_rgba(0,0,0,.22)] transition hover:scale-105 max-xl:left-3"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() => moveVisitor(1)}
              aria-label="Show next recent visitor"
              className="absolute right-[-62px] top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white text-[#151515] shadow-[0_12px_32px_rgba(0,0,0,.22)] transition hover:scale-105 max-xl:right-3"
            >
              <ChevronRight size={22} />
            </button>
          </>
        ) : null}

        <div className="grid max-h-[min(720px,90dvh)] grid-cols-[1.03fr_.97fr] overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-[0_28px_90px_rgba(0,0,0,.28)]">
          <section className="relative min-h-[580px] overflow-hidden bg-[#ece8e5]">
            <ProfileImage
              src={photos[photoIndex] ?? profile.image}
              alt={profile.name}
              fill
              priority
              sizes="520px"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/28 via-transparent to-black/8" />

            <span className="absolute left-5 top-5 rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md">
              {photoIndex + 1} / {Math.max(photos.length, 1)}
            </span>

            {photos.length > 1 ? (
              <button
                type="button"
                onClick={() => movePhoto(1)}
                aria-label="Show next profile photo"
                className="absolute right-5 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white text-[#111] shadow-[0_8px_24px_rgba(0,0,0,.18)] transition hover:scale-105"
              >
                <ChevronRight size={22} />
              </button>
            ) : null}

            {photos.length > 1 ? (
              <div className="absolute inset-x-5 bottom-5 flex gap-2 overflow-x-auto rounded-[16px] bg-black/10 p-2 backdrop-blur-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {photos.map((photo, photoPosition) => (
                  <button
                    key={`${photo}-${photoPosition}`}
                    type="button"
                    onClick={() => setPhotoIndex(photoPosition)}
                    aria-label={`Show photo ${photoPosition + 1}`}
                    aria-pressed={photoIndex === photoPosition}
                    className={`relative size-[64px] shrink-0 overflow-hidden rounded-[10px] border-2 bg-[#eee] transition ${photoIndex === photoPosition ? "border-[#f34ca4] ring-1 ring-white" : "border-white/90"}`}
                  >
                    <ProfileImage
                      src={photo}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </section>

          <section className="flex min-h-0 flex-col bg-white px-8 pb-6 pt-5">
            <div className="flex items-center justify-end gap-2">
              <Link
                href={`/profile/${profile.id}`}
                aria-label="Open full profile"
                className="grid size-10 place-items-center rounded-full text-[#252525] transition hover:bg-[#f7f7f7]"
              >
                <MoreHorizontal size={21} />
              </Link>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close profile preview"
                className="grid size-11 place-items-center rounded-full bg-[#f5f5f5] text-[#222] transition hover:bg-[#ececec]"
              >
                <X size={22} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:thin]">
              <div className="mt-1 flex items-center gap-2">
                <h2 className="text-[28px] font-bold tracking-[-.035em] text-[#111]">
                  {profile.name}
                  {profile.age ? `, ${profile.age}` : ""}
                </h2>
                <BadgeCheck
                  size={20}
                  aria-label="Verified profile"
                  className="shrink-0 fill-[#f34ca4] text-[#f34ca4] [&>path:last-child]:text-white"
                />
              </div>

              <p className="mt-2 text-[14px] font-medium text-[#62666d]">
                {profile.profession}
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-[#686d74]">
                <MapPin size={15} />
                {profile.location}
              </p>

              {facts.length ? (
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-[#5f646b]">
                  {facts.map(({ icon: Icon, value }) => (
                    <span key={value} className="inline-flex items-center gap-1.5">
                      <Icon size={15} />
                      {value}
                    </span>
                  ))}
                </div>
              ) : null}

              {typeof profile.match === "number" && profile.match > 0 ? (
                <span className="mt-5 inline-flex rounded-full border border-[#f7b4d5] bg-[#fff3f9] px-3 py-1.5 text-[12px] font-bold text-[#e33d92]">
                  {profile.match}% Match
                </span>
              ) : null}

              <div className="mt-6 border-t border-[#efefef] pt-5">
                <h3 className="text-[16px] font-bold text-[#171717]">About</h3>
                <p className="mt-2 text-[13px] leading-6 text-[#62666d]">
                  {profile.bio?.trim() ||
                    "Open the full profile to learn more about this member."}
                </p>
              </div>

              {highlights.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="rounded-full bg-[#f6f6f7] px-3 py-1.5 text-[11px] font-medium text-[#40444a]"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-5 border-t border-[#efefef] pt-5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={interestDisabled}
                  onClick={() => onInterest(profile)}
                  className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-[#111] px-6 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(17,17,17,.16)] transition hover:bg-[#262626] disabled:cursor-default disabled:bg-[#5a5a5a]"
                >
                  <Heart size={20} fill={relationship === "following" ? "currentColor" : "none"} />
                  {interestLabel}
                </button>
                <button
                  type="button"
                  onClick={() => onShortlist(profile.id)}
                  aria-label={liked ? "Remove from shortlist" : "Add to shortlist"}
                  aria-pressed={liked}
                  className={`grid size-14 shrink-0 place-items-center rounded-full border transition ${liked ? "border-[#f5bad5] bg-[#fff3f9] text-[#e83e78]" : "border-[#dcdcdc] bg-white text-[#222] hover:border-[#f5bad5] hover:bg-[#fff7fb] hover:text-[#e83e78]"}`}
                >
                  <Bookmark size={21} fill={liked ? "currentColor" : "none"} />
                </button>
              </div>
              <p className="mt-4 flex items-center gap-2 text-[11px] text-[#666b72]">
                <ShieldCheck size={15} />
                Your interest will be shared privately and respectfully.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
