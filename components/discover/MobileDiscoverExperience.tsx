"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { Brand } from "@/components/auth/Brand";
import { ProfileImage } from "@/components/ui/ProfileImage";
import { createClient } from "@/lib/supabase/client";
import { genderDiscoverPhoto, resolveProfilePhoto } from "@/lib/profile-photo";
import type { DiscoverProfile } from "./types";
import { DiscoverBannerSlider } from "./DiscoverBannerSlider";
import { ProfileCard } from "./ProfileCard";
import { ReferralBanner } from "@/components/referrals/ReferralBanner";
import { referralAfterProfile } from "@/lib/referrals";

type Props = {
  onRelationshipAction: (profile: DiscoverProfile) => void;
  onInvite: () => void;
  profiles: DiscoverProfile[];
  query: string;
  onQuery: (value: string) => void;
  filtersOpen: boolean;
  onFilters: () => void;
  mode: "all" | "online";
  onMode: (mode: "all" | "online") => void;
  completion: number;
  shortlisted: string[];
  onShortlist: (id: string) => void;
};

type MobileFilterMode = "for-you" | "nearby" | "new" | "active";

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

type RecentVisitor = {
  id: string;
  name: string;
  profession: string;
  location: string;
  image: string;
  online: boolean;
  viewedAt: string;
};

const NEW_PROFILE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export function MobileDiscoverExperience({ profiles, query, onQuery, filtersOpen, onFilters, completion, shortlisted, onShortlist, onInvite, onRelationshipAction }: Props) {
  const [filterMode, setFilterMode] = useState<MobileFilterMode>("for-you");
  const [viewerCity, setViewerCity] = useState("");
  const [recentVisitors, setRecentVisitors] = useState<RecentVisitor[]>([]);
  const [visibleCount, setVisibleCount] = useState(20);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadViewerCity() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const { data } = await supabase.from("profiles").select("city").eq("id", user.id).maybeSingle();
      if (!cancelled) setViewerCity(String(data?.city ?? "").trim());
    }
    void loadViewerCity();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadRecentVisitors() {
      const { data, error } = await createClient().rpc("get_recent_profile_visitors", {
        result_limit: 8,
      });
      if (cancelled || error || !data) return;
      const visitors = (data as RecentVisitorRow[]).map((visitor) => ({
        id: visitor.id,
        name: visitor.display_name?.trim() || "Member",
        profession: visitor.profession?.trim() || "Professional",
        location: [visitor.city, visitor.state, visitor.country].filter(Boolean).join(", ") || "India",
        image: resolveProfilePhoto(
          {
            avatar_url: visitor.avatar_url,
            photos: visitor.photos,
            gender: visitor.gender,
          },
          genderDiscoverPhoto(visitor.gender),
        ),
        online: Boolean(
          visitor.last_seen_at &&
          Date.now() - new Date(visitor.last_seen_at).getTime() < 120_000,
        ),
        viewedAt: visitor.viewed_at,
      }));
      setRecentVisitors(visitors);
    }
    void loadRecentVisitors();
    return () => { cancelled = true; };
  }, []);

  const filteredProfiles = useMemo(() => {
    const byMatch = (items: DiscoverProfile[]) => [...items].sort((a, b) => b.match - a.match);
    if (filterMode === "nearby") {
      const currentCity = normalizeCity(viewerCity);
      if (!currentCity) return [];
      return byMatch(profiles.filter((profile) => normalizeCity(profile.city) === currentCity));
    }
    if (filterMode === "new") {
      const cutoff = Date.now() - NEW_PROFILE_WINDOW_MS;
      return profiles.filter((profile) => {
        if (!profile.createdAt) return false;
        const createdAt = new Date(profile.createdAt).getTime();
        return Number.isFinite(createdAt) && createdAt >= cutoff;
      }).sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
    }
    if (filterMode === "active") return byMatch(profiles.filter((profile) => profile.online));
    return byMatch(profiles);
  }, [filterMode, profiles, viewerCity]);

  useEffect(() => { setVisibleCount(20); }, [filteredProfiles]);
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || visibleCount >= filteredProfiles.length) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) setVisibleCount((count) => Math.min(count + 20, filteredProfiles.length));
    }, { rootMargin: "500px 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [visibleCount, filteredProfiles.length]);

  const latestProfiles = useMemo(() => [...profiles]
    .filter((profile) => profile.createdAt && Number.isFinite(new Date(profile.createdAt).getTime()))
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .slice(0, 5), [profiles]);

  const newMatchProfiles = useMemo(() => {
    const source = latestProfiles.length ? latestProfiles : [...profiles].sort((a, b) => b.match - a.match);
    return source.filter((profile) => profile.relationship !== "following").slice(0, 5);
  }, [latestProfiles, profiles]);

  const safeCompletion = Math.max(0, Math.min(100, completion));

  return (
    <div className="relative z-10 px-4 pb-32 pt-0 md:hidden">
      <div className="mobile-discover-type mobile-half-type contents">
      <header className="sticky top-0 z-[90] -mx-4 grid grid-cols-[40px_1fr_40px] items-center bg-white px-4 py-3">
        <Link href="/discover" aria-label="Bandhanaa"><Brand compact /></Link>
        <span aria-hidden="true" />
        <div className="justify-self-end">
          <Link href="/notifications" aria-label="Notifications" className="relative grid size-9 place-items-center rounded-[13px] bg-white p-1 text-[#0f1419] shadow-[0_8px_24px_rgba(44,33,80,.1)]"><Bell size={17} /><span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[#f34ca4] ring-2 ring-white" /></Link>
        </div>
      </header>

      <label className="mobile-discover-search mt-5 flex h-11 items-center rounded-full border border-[#e6e2ea] bg-white px-3 text-[#87909e] shadow-[0_7px_22px_rgba(44,33,80,.08)]">
        <Search size={17} />
        <input id="mobile-discover-search" type="search" value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Search by name, profession or city" className="min-w-0 flex-1 bg-transparent px-3 text-[15px] text-[var(--text-primary)] outline-none placeholder:text-[#8b93a1]" />
        <button type="button" onClick={onFilters} aria-expanded={filtersOpen} aria-label="Advanced filters" className="grid h-8 w-10 place-items-center border-l border-[#ebe8ef]"><SlidersHorizontal size={16} /></button>
      </label>

      <div className="-mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <FilterPill active={filterMode === "for-you"} onClick={() => setFilterMode("for-you")} icon={<Star size={17} />} label="For You" />
        <FilterPill active={filterMode === "nearby"} onClick={() => setFilterMode("nearby")} icon={<MapPin size={17} className="text-[#ff4da0]" />} label="Nearby" />
        <FilterPill active={filterMode === "new"} onClick={() => setFilterMode("new")} icon={<span className="mobile-new-badge rounded bg-[#ff4da0] font-bold text-white">NEW</span>} label="New" />
        <FilterPill active={filterMode === "active"} onClick={() => setFilterMode("active")} icon={<span className="size-3 rounded-full bg-[#2dd477]" />} label="Active" />
      </div>

      <DiscoverBannerSlider mobile />

      {latestProfiles.length ? (
        <section className="mt-5" aria-label="Latest profiles">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-bold tracking-[-.02em] text-[var(--text-primary)]">Latest Profiles</h2>
            <Link href="/matches" className="text-[14px] font-semibold text-[#8c45ff]">View All</Link>
          </div>
          <div className="-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {latestProfiles.map((profile) => (
              <Link key={profile.id} href={`/profile/${profile.id}`} className="flex w-[76px] shrink-0 flex-col items-center text-center">
                <span className="relative grid size-[72px] place-items-center rounded-full bg-gradient-to-br from-[#8c45ff] via-[#d24ad7] to-[#ff4d9b] p-[2px]">
                  <span className="relative block size-full overflow-hidden rounded-full border-2 border-white bg-[#eee]"><ProfileImage src={profile.image} alt={profile.name} fill sizes="72px" className="object-cover" /></span>
                  {profile.online ? <span className="absolute bottom-0 right-0 size-4 rounded-full border-2 border-white bg-[#2dd477]" aria-label="Online" /> : null}
                </span>
                <strong className="mt-1.5 block w-full truncate text-[11px] font-semibold text-[#20242d]">{profile.name}{profile.age ? `, ${profile.age}` : ""}</strong>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <Link href="/settings/edit-profile" className="mt-5 flex h-[68px] items-center gap-3 rounded-[20px] border border-[#eadcff] bg-gradient-to-r from-[#f4efff] via-[#fbf4ff] to-[#fff0fa] px-3 shadow-[0_8px_24px_rgba(113,74,214,.08)]">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#7c3cff] to-[#e94db6] text-white shadow-[0_5px_14px_rgba(139,69,255,.22)]"><Star size={18} fill="currentColor" /></span>
        <span className="min-w-0 flex-1">
          <strong className="block truncate text-[14px] font-bold leading-tight text-[#20242d]">Complete your profile</strong>
          <span className="mt-1 block truncate text-[11px] leading-tight text-[#6e6e73]">Add a few details to get better matches</span>
        </span>
        <span className="flex w-[76px] shrink-0 items-center gap-2">
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e9e3ef]">
            <span className="block h-full rounded-full bg-gradient-to-r from-[#8c45ff] to-[#f34ca4]" style={{ width: `${safeCompletion}%` }} />
          </span>
          <strong className="text-[11px] font-bold text-[#8c45ff]">{safeCompletion}%</strong>
        </span>
        <span className="grid h-9 shrink-0 place-items-center rounded-full bg-gradient-to-r from-[#8c45ff] to-[#f34ca4] px-3 text-[11px] font-bold text-white">Complete ›</span>
      </Link>

      {newMatchProfiles.length ? (
        <section className="mt-6" aria-label="New matches">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[20px] font-bold tracking-[-.02em] text-[#20242d]">New Matches</h2>
              <p className="mt-0.5 text-[11px] text-[#7a8190]">Swipe to explore your latest matches</p>
            </div>
            <Link href="/matches" className="shrink-0 text-[13px] font-semibold text-[#8c45ff]">View All</Link>
          </div>
          <div className="-mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-4 pb-3 scroll-px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {newMatchProfiles.map((profile) => (
              <div
                key={profile.id}
                className="w-[calc((100vw-44px)/2)] min-w-[150px] max-w-[180px] shrink-0 snap-start"
              >
                <ProfileCard
                  profile={profile}
                  liked={shortlisted.includes(profile.id)}
                  onLike={() => onShortlist(profile.id)}
                  onRelationshipAction={() => onRelationshipAction(profile)}
                />
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="py-16 text-center text-[15px] text-[var(--text-secondary)]">No profiles available yet.</div>
      )}

      {recentVisitors.length ? (
        <section className="mt-6" aria-label="Recent visitors">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-[20px] font-bold tracking-[-.02em] text-[#20242d]">Recent Visitors</h2>
              <p className="mt-0.5 text-[11px] text-[#7a8190]">People who recently viewed your profile</p>
            </div>
          </div>
          <div className="-mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {recentVisitors.map((visitor) => (
              <Link
                key={visitor.id}
                href={`/profile/${visitor.id}`}
                className="w-[158px] shrink-0 snap-start overflow-hidden rounded-[20px] bg-white shadow-[0_10px_28px_rgba(44,33,80,.09)]"
              >
                <span className="relative block h-[170px] w-full overflow-hidden bg-[#eee]">
                  <ProfileImage src={visitor.image} alt={visitor.name} fill sizes="158px" className="object-cover" />
                  <span className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />
                  <span className={`absolute left-3 top-3 size-2.5 rounded-full ring-2 ring-white ${visitor.online ? "bg-[#2dd477]" : "bg-[#a8afb9]"}`} />
                  <span className="absolute bottom-2.5 left-3 right-3 truncate text-[12px] font-semibold text-white">{visitor.name}</span>
                </span>
                <span className="block px-3 py-2.5">
                  <span className="block truncate text-[11px] font-medium text-[#2b3039]">{visitor.profession}</span>
                  <span className="mt-1 block truncate text-[10px] text-[#8a91a1]">{visitor.location}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      </div>
      <section className="mt-6" aria-label="Discover profiles">
        <h2 className="text-[20px] font-bold tracking-[-.02em] text-[#20242d]">Discover profiles</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {filteredProfiles.slice(0, visibleCount).map((profile, index) => <Fragment key={profile.id}>
            <ProfileCard profile={profile} liked={shortlisted.includes(profile.id)} onLike={() => onShortlist(profile.id)} onRelationshipAction={() => onRelationshipAction(profile)} />
            {referralAfterProfile(index + 1) ? <ReferralBanner onOpen={onInvite} /> : null}
          </Fragment>)}
        </div>
        {!filteredProfiles.length ? <p className="py-8 text-center text-sm text-[#747076]">No profiles match this view.</p> : null}
        {visibleCount < filteredProfiles.length ? <div ref={loadMoreRef} className="flex h-16 items-center justify-center text-xs text-[#747076]" aria-label="More profiles load as you scroll">Loading more profiles…</div> : null}
      </section>
    </div>
  );
}

function FilterPill({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold shadow-[0_5px_16px_rgba(44,33,80,.07)] ${active ? "bg-gradient-to-r from-[#7c3cff] to-[#ee49b5] text-white" : "border border-[#efebf2] bg-white text-[#0f1419]"}`}>{icon}{label}</button>;
}

function normalizeCity(value: string) { return value.split(",")[0]?.trim().toLowerCase() ?? ""; }
