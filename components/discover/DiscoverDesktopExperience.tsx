"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Eye, Heart, Star, Target } from "lucide-react";

import { ProfileImage } from "@/components/ui/ProfileImage";
import { createClient } from "@/lib/supabase/client";
import { genderDiscoverPhoto, resolveProfilePhoto } from "@/lib/profile-photo";
import { ProfileCard } from "./ProfileCard";
import { ReferralBanner } from "@/components/referrals/ReferralBanner";
import { referralAfterProfile } from "@/lib/referrals";
import {
  RecentVisitorProfileModal,
  type RecentVisitorPopupProfile,
} from "./RecentVisitorProfileModal";
import type { DiscoverProfile } from "./types";

type DesktopFilter = "all" | "nearby" | "new" | "verified";

type RecentVisitorRow = {
  id: string;
  display_name: string | null;
  profession: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  avatar_url: string | null;
  photos: string[] | null;
  gender: string | null;
  last_seen_at: string | null;
  viewed_at: string;
};

type RelationshipRow = {
  liker_id: string;
  liked_id: string;
  status: string;
};

type InsightPerson = {
  id: string;
  name: string;
  image: string;
};

type Props = {
  onInvite: () => void;
  profiles: DiscoverProfile[];
  allProfiles: DiscoverProfile[];
  shortlisted: string[];
  relationshipStates: Record<string, DiscoverProfile["relationship"]>;
  onShortlist: (id: string) => void;
  onRelationshipAction: (profile: DiscoverProfile) => void;
};

const NEW_PROFILE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const PROFILE_BATCH_SIZE = 20;

export function DiscoverDesktopExperience({
  onInvite,
  profiles,
  allProfiles,
  shortlisted,
  relationshipStates,
  onShortlist,
  onRelationshipAction,
}: Props) {
  const [filter, setFilter] = useState<DesktopFilter>("all");
  const [viewerCity, setViewerCity] = useState("");
  const [recentVisitors, setRecentVisitors] = useState<
    RecentVisitorPopupProfile[]
  >([]);
  const [selectedRecentIndex, setSelectedRecentIndex] = useState<number | null>(
    null,
  );
  const [selectedPreferenceIndex, setSelectedPreferenceIndex] = useState<
    number | null
  >(null);
  const [visibleProfileCount, setVisibleProfileCount] = useState(PROFILE_BATCH_SIZE);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadInsights() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const [viewerResult, visitorResult, relationshipResult] = await Promise.all([
        supabase.from("profiles").select("city").eq("id", user.id).maybeSingle(),
        supabase.rpc("get_recent_profile_visitors", { result_limit: 12 }),
        supabase
          .from("profile_likes")
          .select("liker_id,liked_id,status")
          .or(`liker_id.eq.${user.id},liked_id.eq.${user.id}`),
      ]);

      if (!cancelled) {
        setViewerCity(String(viewerResult.data?.city ?? "").trim());
      }

      if (cancelled || visitorResult.error || !visitorResult.data) return;

      const relationshipByProfile = new Map<
        string,
        DiscoverProfile["relationship"]
      >();

      for (const relationship of (relationshipResult.data ?? []) as RelationshipRow[]) {
        const otherId =
          relationship.liker_id === user.id
            ? relationship.liked_id
            : relationship.liker_id;
        const state: DiscoverProfile["relationship"] =
          relationship.status === "accepted"
            ? "following"
            : relationship.liker_id === user.id
              ? "outgoing_pending"
              : "incoming_pending";
        relationshipByProfile.set(otherId, state);
      }

      const knownProfiles = new Map(
        allProfiles.map((profile) => [profile.id, profile]),
      );

      setRecentVisitors(
        (visitorResult.data as RecentVisitorRow[]).map((visitor) => {
          const known = knownProfiles.get(visitor.id);
          const image = resolveProfilePhoto(
            {
              avatar_url: visitor.avatar_url,
              photos: visitor.photos,
              gender: visitor.gender,
            },
            genderDiscoverPhoto(visitor.gender),
          );
          const gallery = Array.from(
            new Set(
              [visitor.avatar_url, ...(visitor.photos ?? [])].filter(
                (photo): photo is string => Boolean(photo),
              ),
            ),
          );

          return {
            id: visitor.id,
            name: visitor.display_name?.trim() || known?.name || "Member",
            image,
            photos: gallery,
            profession: known?.job || visitor.profession?.trim() || "Professional",
            location:
              known?.city ||
              [visitor.city, visitor.state, visitor.country]
                .filter(Boolean)
                .join(", ") ||
              "India",
            age: known?.age ? known.age : undefined,
            height:
              known?.height && known.height !== "Not added"
                ? known.height
                : undefined,
            religion:
              known?.religion && known.religion !== "Not added"
                ? known.religion
                : undefined,
            motherTongue:
              known?.motherTongue && known.motherTongue !== "Not added"
                ? known.motherTongue
                : undefined,
            education:
              known?.education && known.education !== "Not added"
                ? known.education
                : undefined,
            maritalStatus:
              known?.maritalStatus && known.maritalStatus !== "Not added"
                ? known.maritalStatus
                : undefined,
            bio: known?.bio || undefined,
            match: known?.match,
            relationship:
              relationshipByProfile.get(visitor.id) ??
              known?.relationship ??
              "none",
          };
        }),
      );
    }

    void loadInsights();
    return () => {
      cancelled = true;
    };
  }, [allProfiles]);

  const shortlistedProfiles = useMemo(
    () => allProfiles.filter((profile) => shortlisted.includes(profile.id)),
    [allProfiles, shortlisted],
  );

  const preferenceMatches = useMemo(
    () => [...allProfiles].sort((a, b) => b.match - a.match),
    [allProfiles],
  );

  const preferencePopupProfiles = useMemo<RecentVisitorPopupProfile[]>(
    () =>
      preferenceMatches.map((profile) => ({
        id: profile.id,
        name: profile.name,
        image: profile.image,
        photos: [profile.image],
        profession: profile.job,
        location: profile.city,
        age: profile.age || undefined,
        height: profile.height !== "Not added" ? profile.height : undefined,
        religion:
          profile.religion !== "Not added" ? profile.religion : undefined,
        motherTongue:
          profile.motherTongue !== "Not added"
            ? profile.motherTongue
            : undefined,
        education:
          profile.education !== "Not added" ? profile.education : undefined,
        maritalStatus:
          profile.maritalStatus !== "Not added"
            ? profile.maritalStatus
            : undefined,
        bio: profile.bio || undefined,
        match: profile.match,
        relationship:
          relationshipStates[profile.id] ?? profile.relationship,
      })),
    [preferenceMatches, relationshipStates],
  );

  const newMatches = useMemo(() => {
    const cutoff = Date.now() - NEW_PROFILE_WINDOW_MS;
    const recent = allProfiles
      .filter((profile) => {
        if (!profile.createdAt) return false;
        const createdAt = new Date(profile.createdAt).getTime();
        return Number.isFinite(createdAt) && createdAt >= cutoff;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime(),
      );

    return recent.length
      ? recent
      : [...allProfiles].sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime(),
        );
  }, [allProfiles]);

  const visibleProfiles = useMemo(() => {
    let items = [...profiles];

    if (filter === "nearby") {
      const city = normalizeCity(viewerCity);
      items = city
        ? items.filter((profile) => normalizeCity(profile.city) === city)
        : [];
    }

    if (filter === "new") {
      const cutoff = Date.now() - NEW_PROFILE_WINDOW_MS;
      items = items.filter((profile) => {
        if (!profile.createdAt) return false;
        const createdAt = new Date(profile.createdAt).getTime();
        return Number.isFinite(createdAt) && createdAt >= cutoff;
      });
    }

    return items.sort((a, b) => b.match - a.match);
  }, [filter, profiles, viewerCity]);

  const renderedProfiles = useMemo(
    () => visibleProfiles.slice(0, visibleProfileCount),
    [visibleProfileCount, visibleProfiles],
  );

  useEffect(() => {
    setVisibleProfileCount(Math.min(PROFILE_BATCH_SIZE, visibleProfiles.length));
  }, [filter, profiles, viewerCity, visibleProfiles.length]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || visibleProfileCount >= visibleProfiles.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setVisibleProfileCount((current) =>
          Math.min(current + PROFILE_BATCH_SIZE, visibleProfiles.length),
        );
      },
      { rootMargin: "500px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [visibleProfileCount, visibleProfiles.length]);

  const toPeople = (items: DiscoverProfile[]): InsightPerson[] =>
    items.map((profile) => ({
      id: profile.id,
      name: profile.name,
      image: profile.image,
    }));

  function openRecentVisitors() {
    if (recentVisitors.length) setSelectedRecentIndex(0);
  }

  function openPreferenceMatches() {
    if (preferencePopupProfiles.length) setSelectedPreferenceIndex(0);
  }

  function handleRecentInterest(profile: RecentVisitorPopupProfile) {
    const relationship = relationshipStates[profile.id] ?? profile.relationship;
    onRelationshipAction({
      id: profile.id,
      name: profile.name,
      age: profile.age ?? 0,
      job: profile.profession,
      city: profile.location,
      maritalStatus: profile.maritalStatus ?? "Not added",
      height: profile.height ?? "Not added",
      religion: profile.religion ?? "Not added",
      motherTongue: profile.motherTongue ?? "Not added",
      education: profile.education ?? "Not added",
      bio: profile.bio ?? "",
      image: profile.image,
      photoCount: Math.max(profile.photos.length, 1),
      match: profile.match ?? 0,
      online: false,
      createdAt: null,
      relationship,
    });
  }

  return (
    <div className="hidden md:block">
      <section
        aria-label="Discover insights"
        className="grid grid-cols-2 gap-4 xl:grid-cols-4"
      >
        <InsightCard
          icon={<Eye size={22} />}
          title="Recent profile visitors"
          description="See who recently viewed your profile."
          people={recentVisitors}
          count={recentVisitors.length}
          href={recentVisitors.length ? undefined : "/settings/activity"}
          onOpen={recentVisitors.length ? openRecentVisitors : undefined}
        />
        <InsightCard
          icon={<Heart size={22} />}
          title="Your shortlist"
          description="Profiles you saved to revisit later."
          people={toPeople(shortlistedProfiles)}
          count={shortlisted.length}
          href="/matches?tab=shortlisted"
        />
        <InsightCard
          icon={<Target size={22} />}
          title="Partner preference matches"
          description="People aligned with your preferences."
          people={toPeople(preferenceMatches)}
          count={preferenceMatches.length}
          onOpen={
            preferencePopupProfiles.length ? openPreferenceMatches : undefined
          }
        />
        <InsightCard
          icon={<Star size={22} />}
          title="New matches"
          description="Fresh profiles that may interest you."
          people={toPeople(newMatches)}
          count={newMatches.length}
          onOpen={() => setFilter("new")}
        />
      </section>

      <section className="mt-7" aria-label="Discover profiles">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-[30px] font-bold tracking-[-.035em] text-[#111111]">
              Discover
            </h1>
            <p className="mt-1 text-[14px] text-[#737780]">
              People who match your preferences
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-full bg-[#fafafa] p-1">
            <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
              All
            </FilterPill>
            <FilterPill
              active={filter === "nearby"}
              onClick={() => setFilter("nearby")}
            >
              Near you
            </FilterPill>
            <FilterPill active={filter === "new"} onClick={() => setFilter("new")}>
              New members
            </FilterPill>
            <FilterPill
              active={filter === "verified"}
              onClick={() => setFilter("verified")}
            >
              Verified
            </FilterPill>
          </div>
        </div>

        {visibleProfiles.length ? (
          <>
            <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {renderedProfiles.map((profile, index) => {
                const currentProfile = {
                  ...profile,
                  relationship:
                    relationshipStates[profile.id] ?? profile.relationship,
                };

                return (
                  <Fragment key={profile.id}>
                    <ProfileCard
                      profile={currentProfile}
                      liked={shortlisted.includes(profile.id)}
                      onLike={() => onShortlist(profile.id)}
                      onRelationshipAction={() => onRelationshipAction(currentProfile)}
                    />
                    {referralAfterProfile(index + 1) ? (
                      <ReferralBanner onOpen={onInvite} />
                    ) : null}
                  </Fragment>
                );
              })}
            </div>
            {visibleProfileCount < visibleProfiles.length ? (
              <div
                ref={loadMoreRef}
                className="flex h-16 items-center justify-center"
                aria-label="More profiles load as you scroll"
              >
                <span className="inline-flex items-center gap-2 text-[12px] font-medium text-[#8a8a8a]">
                  <span className="size-1.5 animate-pulse rounded-full bg-[#f34ca4]" />
                  Loading more profiles…
                </span>
              </div>
            ) : null}
          </>
        ) : (
          <div className="mt-8 rounded-[20px] border border-[#ededed] bg-white px-6 py-16 text-center">
            <p className="text-[15px] font-semibold text-[#222]">
              No profiles match this view.
            </p>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="mt-3 text-[13px] font-semibold text-[#e83e78]"
            >
              Show all profiles
            </button>
          </div>
        )}
      </section>

      {selectedRecentIndex !== null && recentVisitors.length ? (
        <RecentVisitorProfileModal
          profiles={recentVisitors}
          index={Math.min(selectedRecentIndex, recentVisitors.length - 1)}
          onIndex={setSelectedRecentIndex}
          onClose={() => setSelectedRecentIndex(null)}
          shortlisted={shortlisted}
          relationshipStates={relationshipStates}
          onShortlist={onShortlist}
          onInterest={handleRecentInterest}
        />
      ) : null}

      {selectedPreferenceIndex !== null && preferencePopupProfiles.length ? (
        <RecentVisitorProfileModal
          profiles={preferencePopupProfiles}
          index={Math.min(
            selectedPreferenceIndex,
            preferencePopupProfiles.length - 1,
          )}
          onIndex={setSelectedPreferenceIndex}
          onClose={() => setSelectedPreferenceIndex(null)}
          shortlisted={shortlisted}
          relationshipStates={relationshipStates}
          onShortlist={onShortlist}
          onInterest={handleRecentInterest}
        />
      ) : null}
    </div>
  );
}

function InsightCard({
  icon,
  title,
  description,
  people,
  count,
  href,
  onOpen,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  people: InsightPerson[];
  count: number;
  href?: string;
  onOpen?: () => void;
}) {
  const actionClass =
    "grid size-10 shrink-0 place-items-center rounded-full border border-[#ededed] bg-white text-[#222] shadow-[0_5px_14px_rgba(17,17,17,.06)] transition hover:-translate-y-0.5 hover:border-[#f6c6dc] hover:text-[#e83e78]";

  return (
    <article
      className={`min-h-[190px] rounded-[18px] border border-[#f1e7ec] bg-white p-5 shadow-[0_8px_24px_rgba(30,22,26,.035)] transition ${onOpen ? "cursor-pointer hover:-translate-y-0.5 hover:border-[#f6c6dc] hover:shadow-[0_14px_32px_rgba(30,22,26,.07)]" : ""}`}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (onOpen && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onOpen();
        }
      }}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      aria-label={onOpen ? `Open ${title}` : undefined}
    >
      <span className="grid size-11 place-items-center rounded-full border border-[#f8cfe2] bg-[#fff3f9] text-[#e83e78]">
        {icon}
      </span>
      <h2 className="mt-4 max-w-[190px] text-[17px] font-bold leading-[1.15] tracking-[-.02em] text-[#171717]">
        {title}
      </h2>
      <div className="mt-3 flex items-end gap-3">
        <div className="min-w-0 flex-1">
          <AvatarStack people={people} count={count} />
          <p className="mt-3 text-[11px] leading-[1.45] text-[#8a8a8a]">
            {description}
          </p>
        </div>
        {href ? (
          <Link href={href} aria-label={`Open ${title}`} className={actionClass}>
            <ArrowRight size={17} />
          </Link>
        ) : (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onOpen?.();
            }}
            aria-label={`Open ${title}`}
            className={actionClass}
          >
            <ArrowRight size={17} />
          </button>
        )}
      </div>
    </article>
  );
}

function AvatarStack({
  people,
  count,
}: {
  people: InsightPerson[];
  count: number;
}) {
  const visible = people.slice(0, 3);
  const extra = Math.max(count - visible.length, 0);

  if (!visible.length) {
    return (
      <span className="inline-flex h-8 items-center rounded-full bg-[#faf5f7] px-3 text-[10px] font-semibold text-[#9a7183]">
        {count ? `${count} profiles` : "No activity yet"}
      </span>
    );
  }

  return (
    <div className="flex items-center">
      {visible.map((person, index) => (
        <span
          key={person.id}
          className={`relative size-8 overflow-hidden rounded-full border-2 border-white bg-[#eee] ${index ? "-ml-2" : ""}`}
          title={person.name}
        >
          <ProfileImage
            src={person.image}
            alt={person.name}
            fill
            sizes="32px"
            className="object-cover"
          />
        </span>
      ))}
      {extra > 0 ? (
        <span className="-ml-1 grid h-8 min-w-8 place-items-center rounded-full bg-[#f6f1f3] px-2 text-[9px] font-bold text-[#7e7176] ring-2 ring-white">
          +{extra}
        </span>
      ) : null}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-9 rounded-full px-4 text-[11px] font-semibold transition ${active ? "bg-[#111] text-white shadow-sm" : "text-[#747474] hover:bg-white hover:text-[#222]"}`}
    >
      {children}
    </button>
  );
}

function normalizeCity(value: string) {
  return value.split(",")[0]?.trim().toLowerCase() ?? "";
}
