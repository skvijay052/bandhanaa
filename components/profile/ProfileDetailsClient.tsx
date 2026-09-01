"use client";

import { ProfileImage } from "@/components/ui/ProfileImage";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  ChevronDown,
  Dumbbell,
  GraduationCap,
  Heart,
  HeartHandshake,
  Languages,
  MapPin,
  Menu,
  MessageSquare,
  MoreVertical,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
  Weight,
} from "lucide-react";

import { Brand } from "@/components/auth/Brand";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DesktopTopBar } from "@/components/layout/DesktopTopBar";
import type {
  CompactProfile,
  ProfileDetail,
  RelationshipUIState,
} from "@/data/profile";
import { createClient } from "@/lib/supabase/client";
import { FollowButton } from "./FollowButton";

export function ProfileDetailsClient({
  profile,
  moreProfiles,
  initialRelation,
  currentUserId,
  viewerName,
  avatarUrl,
}: {
  profile: ProfileDetail;
  moreProfiles: CompactProfile[];
  initialRelation: RelationshipUIState;
  currentUserId: string;
  viewerName: string;
  avatarUrl: string;
}) {
  const [relation, setRelation] = useState(initialRelation);
  const [notice, setNotice] = useState("");
  const [aboutExpanded, setAboutExpanded] = useState(false);

  const relationFilter = `and(liker_id.eq.${currentUserId},liked_id.eq.${profile.id}),and(liker_id.eq.${profile.id},liked_id.eq.${currentUserId})`;

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  async function follow() {
    setNotice("");
    const supabase = createClient();
    const { data: existing, error: lookupError } = await supabase
      .from("profile_likes")
      .select("liker_id,liked_id,status")
      .or(relationFilter)
      .limit(2);
    if (lookupError) {
      setNotice("Something went wrong. Please try again.");
      return;
    }
    const current =
      existing?.find((row) => row.status === "accepted") ??
      existing?.find((row) => row.status === "pending");
    if (current?.status === "accepted") {
      setRelation("following");
      return;
    }
    if (current?.status === "pending") {
      setRelation(
        current.liker_id === currentUserId
          ? "outgoing_pending"
          : "incoming_pending",
      );
      return;
    }
    if (existing?.length) {
      const { error: removeError } = await supabase
        .from("profile_likes")
        .delete()
        .or(relationFilter);
      if (removeError) {
        setNotice("Something went wrong. Please try again.");
        return;
      }
    }
    const { error } = await supabase
      .from("profile_likes")
      .insert({ liker_id: currentUserId, liked_id: profile.id });
    if (error) setNotice("Something went wrong. Please try again.");
    else {
      setRelation("outgoing_pending");
      setNotice("Follow request sent.");
    }
  }

  async function confirmRequest() {
    setNotice("");
    const { data, error } = await createClient()
      .from("profile_likes")
      .update({ status: "accepted", responded_at: new Date().toISOString() })
      .eq("liker_id", profile.id)
      .eq("liked_id", currentUserId)
      .eq("status", "pending")
      .select("liker_id")
      .maybeSingle();
    if (error || !data) setNotice("Something went wrong. Please try again.");
    else {
      setRelation("following");
      setNotice("Follow request accepted.");
    }
  }

  async function deleteIncomingRequest() {
    setNotice("");
    const { error } = await createClient()
      .from("profile_likes")
      .delete()
      .eq("liker_id", profile.id)
      .eq("liked_id", currentUserId)
      .eq("status", "pending");
    if (error) setNotice("Something went wrong. Please try again.");
    else {
      setRelation("none");
      setNotice("Follow request deleted.");
    }
  }

  async function removeRelationship(message: string) {
    setNotice("");
    const { error } = await createClient()
      .from("profile_likes")
      .delete()
      .or(relationFilter);
    if (error) setNotice("Something went wrong. Please try again.");
    else {
      setRelation("none");
      setNotice(message);
    }
  }
  return (
    <div className="h-dvh bg-[var(--app-bg)]">
      <div className="app-shell">
        <AppSidebar active="Profile" />
        <div className="app-workspace min-w-0 flex-1 overflow-y-auto pb-[72px] md:pb-0">
          <DesktopTopBar avatarUrl={avatarUrl} name={viewerName} />
          <MobileHeader avatarUrl={avatarUrl} />
          <main className="mx-auto max-w-[1060px] px-5 pb-8 max-md:px-0">
            <section className="grid grid-cols-[190px_minmax(0,1fr)] gap-8 px-4 py-8 max-md:block max-md:px-4 max-md:py-5">
              <ProfilePhoto profile={profile} />
              <div className="min-w-0">
                <div>
                  <h1 className="flex items-center gap-2 text-[24px] font-bold tracking-[-.02em] max-md:mt-4 max-md:text-[20px]">
                    {profile.name}
                    <BadgeCheck
                      size={20}
                      className="fill-[#1d9bf0] text-[#1d9bf0] [&>path:last-child]:text-white"
                    />
                  </h1>
                  <p className="mt-1 text-[16px] text-[var(--text-primary)]">
                    {profile.occupation}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-7 text-[15px]">
                    <span>
                      <strong>{profile.photos.length}</strong> photos
                    </span>
                    <span>
                      <strong>{profile.compatibility}%</strong> match
                    </span>
                  </div>
                  <p className="mt-5 max-w-[620px] text-[15px] leading-5 text-[var(--text-primary)]">
                    {profile.about}
                  </p>
                  <p className="mt-2 flex flex-wrap items-center gap-2 text-[14px] text-[var(--text-secondary)]">
                    <MapPin size={14} />
                    {profile.location}
                    <span>·</span>
                    <CalendarDays size={14} />
                    {profile.age} years
                  </p>
                </div>
                <ProfileActions
                  relation={relation}
                  profileName={profile.name}
                  onFollow={follow}
                  onCancelRequest={() =>
                    removeRelationship("Follow request cancelled.")
                  }
                  onConfirmRequest={confirmRequest}
                  onDeleteRequest={deleteIncomingRequest}
                  onUnfollow={() =>
                    removeRelationship(
                      "You are no longer following this profile.",
                    )
                  }
                  onBlockedMessage={() =>
                    setNotice(
                      "Messaging becomes available after the interest is accepted.",
                    )
                  }
                />
                {notice ? (
                  <p
                    role="status"
                    className={`fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-lg px-5 py-3 text-[14px] font-medium text-white shadow-lg ${notice.startsWith("Something") ? "bg-[#f4212e]" : "bg-[#0f1419]"}`}
                  >
                    {notice}
                  </p>
                ) : null}
              </div>
            </section>
            <DesktopContent profile={profile} />
            <MobileContent
              profile={profile}
              expanded={aboutExpanded}
              onExpand={() => setAboutExpanded((value) => !value)}
              moreProfiles={moreProfiles}
            />
            <InterestCta
              profile={profile}
              status={relation}
              onFollow={follow}
              onCancelRequest={() =>
                removeRelationship("Follow request cancelled.")
              }
              onConfirmRequest={confirmRequest}
              onDeleteRequest={deleteIncomingRequest}
              onUnfollow={() =>
                removeRelationship("You are no longer following this profile.")
              }
            />
          </main>
        </div>
      </div>
    </div>
  );
}

function MobileHeader({ avatarUrl }: { avatarUrl: string }) {
  return (
    <header className="flex h-[62px] items-center justify-between border-b border-[#eeeef2] px-3 md:hidden">
      <button aria-label="Open menu">
        <Menu size={21} />
      </button>
      <Link href="/discover" className="w-[126px]">
        <Brand compact />
      </Link>
      <div className="flex items-center gap-3">
        <Search size={20} />
        <span className="relative">
          <Bell size={20} />
          <span className="absolute -right-1 -top-1 size-2 rounded-full bg-[#1d9bf0]" />
        </span>
        <span className="relative size-8 overflow-hidden rounded-full">
          <ProfileImage
            src={avatarUrl}
            alt="Your profile"
            fill
            sizes="32px"
            className="object-cover"
          />
        </span>
      </div>
    </header>
  );
}

function ProfilePhoto({ profile }: { profile: ProfileDetail }) {
  return (
    <div className="relative mx-auto size-[180px] overflow-hidden rounded-full bg-slate-100 max-md:size-[132px]">
      <ProfileImage
        src={profile.image}
        alt={`${profile.name}'s profile`}
        fill
        priority
        sizes="(max-width:767px) 132px,180px"
        className="object-cover"
      />
      <span className="hidden">✓ Verified</span>
      <span className="hidden">Online</span>
      <span className="hidden">
        <Camera size={12} />6 Photos
      </span>
    </div>
  );
}
function QuoteCard({ quote }: { quote: string }) {
  return (
    <div className="mt-6 flex min-h-[84px] items-center justify-between rounded-xl bg-[linear-gradient(135deg,#e8f5fe,#f5fbff)] px-5 max-md:mt-4 max-md:min-h-[70px] max-md:px-3">
      <p className="max-w-[390px] text-[13px] leading-6 max-md:text-[12px] max-md:leading-5">
        “{quote}”
      </p>
      <Heart className="shrink-0 text-[#1d9bf0]" size={29} />
    </div>
  );
}
function ProfileActions({
  relation,
  profileName,
  onFollow,
  onCancelRequest,
  onConfirmRequest,
  onDeleteRequest,
  onUnfollow,
  onBlockedMessage,
}: {
  relation: RelationshipUIState;
  profileName: string;
  onFollow: () => Promise<void>;
  onCancelRequest: () => Promise<void>;
  onConfirmRequest: () => Promise<void>;
  onDeleteRequest: () => Promise<void>;
  onUnfollow: () => Promise<void>;
  onBlockedMessage: () => void;
}) {
  const matched = relation === "following";
  return (
    <div className="profile-action-row mt-6 max-md:mt-5">
      <FollowButton
        status={relation}
        profileName={profileName}
        onFollow={onFollow}
        onCancelRequest={onCancelRequest}
        onConfirmRequest={onConfirmRequest}
        onDeleteRequest={onDeleteRequest}
        onUnfollow={onUnfollow}
      />
      {matched ? (
        <Link href="/messages" className="profile-action-secondary">
          <MessageSquare size={16} />
          Message
        </Link>
      ) : (
        <button onClick={onBlockedMessage} className="profile-action-secondary">
          <MessageSquare size={16} />
          Message
        </button>
      )}
    </div>
  );
}

const detailItems = (p: ProfileDetail) =>
  [
    [CalendarDays, "Age", p.age ? `${p.age} years` : "Not added"],
    [CalendarDays, "Birth Date", p.birthDate],
    [Sparkles, "Height", p.height],
    [GraduationCap, "Education", p.education],
    [BriefcaseBusiness, "Profession", p.occupation],
    [BriefcaseBusiness, "Company", p.company || "Not added"],
    [UserRound, "Gender", p.gender],
    [Weight, "Weight", p.weight],
    [ShieldCheck, "Religion", p.religion],
    [Languages, "Mother Tongue", p.motherTongue],
    [MapPin, "Location", p.location.split(",")[0]],
    [UsersRound, "Marital Status", p.maritalStatus],
    [CalendarDays, "Member Since", p.memberSince],
  ] as const;
function DesktopContent({ profile }: { profile: ProfileDetail }) {
  return (
    <div className="hidden md:block">
      <ProfileTabs />
      <section id="profile-about" className="mt-6 scroll-mt-5">
        <div className="rounded-2xl bg-white px-4 py-2">
          <h2 className="text-[18px] font-bold">
            About {profile.name.split(" ")[0]}
          </h2>
          <p className="mt-3 max-w-[680px] text-[14px] leading-6 text-[#555b70]">
            {profile.about}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-x-14 gap-y-6">
            {detailItems(profile).map(([Icon, label, value]) => (
              <div key={label} className="flex items-start gap-3">
                <Icon size={17} className="mt-0.5 text-[#596579]" />
                <div>
                  <p className="text-[13px] text-[#71768a]">{label}</p>
                  <p className="mt-1 text-[14px] font-semibold">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <PhotoGallery profile={profile} />
      <div className="mt-5 space-y-4">
        <InfoCard
          sectionId="profile-lifestyle"
          title="Lifestyle"
          rows={profile.lifestyle}
        />
        <InfoCard
          sectionId="profile-family"
          title="Family"
          rows={profile.family}
        />
        {profile.interests.length ? (
          <InfoCard title="Interests" rows={profile.interests} />
        ) : null}
        <InfoCard
          sectionId="profile-partner-preferences"
          title="What I'm Looking For"
          rows={profile.preferences}
        />
        {profile.horoscope.length ? (
          <InfoCard
            sectionId="profile-horoscope"
            title="Horoscope"
            rows={profile.horoscope}
          />
        ) : null}
      </div>
    </div>
  );
}
function ProfileTabs() {
  const [active, setActive] = useState("About");
  const goToSection = (label: string) => {
    setActive(label);
    const id = `profile-${label.toLowerCase().replaceAll(" ", "-")}`;
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <nav
      aria-label="Profile sections"
      className="sticky top-0 z-40 flex h-[54px] items-center justify-between border-b border-[#e6edf2] bg-white/95 px-3 text-[14px] font-semibold backdrop-blur-md"
    >
      {[
        "About",
        "Photos",
        "Lifestyle",
        "Family",
        "Partner Preferences",
        "Horoscope",
      ].map((item) => (
        <button
          key={item}
          onClick={() => goToSection(item)}
          className={`relative h-full px-4 transition-colors ${active === item ? "text-[#1d9bf0] after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-[#1d9bf0]" : "text-[#363b52] hover:text-[#1d9bf0]"}`}
        >
          {item}
        </button>
      ))}
    </nav>
  );
}
function MiniCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="min-h-[118px] rounded-xl bg-[linear-gradient(135deg,#e8f5fe,#f5fbff)] p-4 text-[#1d9bf0]">
      <span className="[&>svg]:size-6">{icon}</span>
      <p className="mt-4 text-xs font-bold text-[#151621]">{title}</p>
      <p className="mt-1 text-[10px] leading-4 text-[#555a70]">{text}</p>
    </div>
  );
}
function DetailsCard({ profile }: { profile: ProfileDetail }) {
  return (
    <aside className="rounded-xl border border-[#ececf1] p-4">
      <h3 className="text-sm font-bold">Details</h3>
      <div className="mt-4 space-y-4 text-[10px]">
        <p>
          {profile.height} &nbsp;•&nbsp; {profile.religion} &nbsp;•&nbsp;{" "}
          {profile.motherTongue}
        </p>
        <p className="flex gap-2">
          <MapPin size={13} />
          {profile.location}
        </p>
        <p className="flex gap-2">
          <BriefcaseBusiness size={13} />
          {profile.occupation}
          {profile.company ? ` at ${profile.company}` : ""}
        </p>
        <p className="flex gap-2">
          <CalendarDays size={13} />
          Member since {profile.memberSince}
        </p>
      </div>
    </aside>
  );
}
function PhotoGallery({ profile }: { profile: ProfileDetail }) {
  const [activePhoto, setActivePhoto] = useState<number | null>(null);
  const photoCount = profile.photos.length;
  const previousPhoto = () =>
    setActivePhoto((current) =>
      current === null ? null : (current - 1 + photoCount) % photoCount,
    );
  const nextPhoto = () =>
    setActivePhoto((current) =>
      current === null ? null : (current + 1) % photoCount,
    );

  useEffect(() => {
    if (activePhoto === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActivePhoto(null);
      if (event.key === "ArrowLeft") previousPhoto();
      if (event.key === "ArrowRight") nextPhoto();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePhoto, photoCount]);

  if (!photoCount) return null;

  return (
    <>
      <section
        id="profile-photos"
        className="mt-6 scroll-mt-5 rounded-2xl border border-[#e6edf2] bg-white p-5 shadow-[0_8px_24px_rgba(15,20,25,.035)]"
      >
        <div>
          <div>
            <h2 className="text-[18px] font-bold">
              Photos ({profile.photos.length})
            </h2>
            <p className="mt-1 text-[14px] text-[#596077]">
              A glimpse into {profile.name.split(" ")[0]}&apos;s life.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-6 gap-2">
          {profile.photos.map((photo, index) => (
            <button
              type="button"
              key={index}
              onClick={() => setActivePhoto(index)}
              aria-label={`Open ${profile.name} photo ${index + 1}`}
              className="relative aspect-[.82/1] overflow-hidden rounded-xl outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#1d9bf0] focus-visible:ring-offset-2"
            >
              <ProfileImage
                src={photo}
                alt={`${profile.name} photo ${index + 1}`}
                fill
                sizes="100px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </section>
      {activePhoto !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${profile.name} photo viewer`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActivePhoto(null);
          }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={() => setActivePhoto(null)}
            aria-label="Close photo viewer"
            className="absolute right-5 top-5 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X size={24} />
          </button>
          {photoCount > 1 ? (
            <button
              type="button"
              onClick={previousPhoto}
              aria-label="Previous photo"
              className="absolute left-4 z-10 grid size-12 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:left-8"
            >
              <ChevronLeft size={30} />
            </button>
          ) : null}
          <div className="relative h-[82vh] w-[min(86vw,920px)]">
            <ProfileImage
              src={profile.photos[activePhoto]}
              alt={`${profile.name} photo ${activePhoto + 1}`}
              fill
              priority
              sizes="86vw"
              className="object-contain"
            />
          </div>
          {photoCount > 1 ? (
            <button
              type="button"
              onClick={nextPhoto}
              aria-label="Next photo"
              className="absolute right-4 z-10 grid size-12 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:right-8"
            >
              <ChevronRight size={30} />
            </button>
          ) : null}
          <div className="absolute bottom-5 rounded-full bg-black/50 px-4 py-2 text-[13px] font-medium text-white">
            {activePhoto + 1} / {photoCount}
          </div>
        </div>
      ) : null}
    </>
  );
}
type MatchRow = string | { label: string; value?: string; matched?: boolean };

function InfoCard({
  title,
  rows,
  sectionId,
}: {
  title: string;
  rows: MatchRow[];
  sectionId?: string;
}) {
  return (
    <section
      id={sectionId}
      className="scroll-mt-5 rounded-2xl border border-[#e6edf2] bg-white p-5 shadow-[0_8px_24px_rgba(15,20,25,.035)]"
    >
      <h3 className="text-[18px] font-bold">{title}</h3>
      <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5 text-[14px] sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => {
          const item =
            typeof row === "string"
              ? { label: row, matched: true }
              : { ...row, matched: row.matched ?? true };
          return (
            <li key={item.label} className="flex items-center gap-2">
              <span
                aria-label={item.matched ? "Matching" : "Not matching"}
                title={item.matched ? "Matching" : "Not matching"}
                className={`grid size-7 shrink-0 place-items-center rounded-full ${item.matched ? "bg-[#e5f8ed] text-[#168a52]" : "bg-[#fdebec] text-[#d92d3a]"}`}
              >
                {item.matched ? (
                  <Check size={14} strokeWidth={2.5} />
                ) : (
                  <X size={14} strokeWidth={2.5} />
                )}
              </span>
              <span className={item.matched ? "" : "text-[#b4232f]"}>
                {item.value ? (
                  <>
                    <span className="block text-[12px] text-[#71768a]">
                      {item.label}
                    </span>
                    <strong className="mt-1 block font-semibold text-[var(--text-primary)]">
                      {item.value}
                    </strong>
                  </>
                ) : (
                  item.label
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function MobileContent({
  profile,
  expanded,
  onExpand,
  moreProfiles,
}: {
  profile: ProfileDetail;
  expanded: boolean;
  onExpand: () => void;
  moreProfiles: CompactProfile[];
}) {
  return (
    <div className="md:hidden">
      <nav className="mt-4 grid grid-cols-5 border-y border-[#eeeef2] px-2 py-3">
        {[
          [Heart, "About"],
          [Camera, "Photos"],
          [UsersRound, "Family"],
          [Dumbbell, "Lifestyle"],
          [Sparkles, "Horoscope"],
        ].map(([Icon, label], i) => {
          const I = Icon as typeof Heart;
          return (
            <button
              key={String(label)}
              className={`flex flex-col items-center gap-1 text-[12px] ${i === 0 ? "text-[#1d9bf0]" : "text-[#33374e]"}`}
            >
              <span className="grid size-9 place-items-center rounded-full bg-[#faf8fa]">
                <I size={16} />
              </span>
              {String(label)}
            </button>
          );
        })}
      </nav>
      <section className="px-4 py-6">
        <h2 className="text-sm font-bold">
          About {profile.name.split(" ")[0]}
        </h2>
        <p
          className={`mt-3 text-[14px] leading-6 text-[#50556b] ${expanded ? "" : "line-clamp-4"}`}
        >
          {profile.about}
        </p>
        <button
          onClick={onExpand}
          className="mt-2 text-[13px] font-semibold text-[#1d9bf0]"
        >
          {expanded ? "Read Less" : "Read More"}
        </button>
        <div className="mt-5 space-y-4">
          {detailItems(profile)
            .filter(([, label]) => label !== "Mother Tongue")
            .map(([Icon, label, value]) => (
              <div
                key={label}
                className="grid grid-cols-[20px_1fr_1fr] items-center text-[13px]"
              >
                <Icon size={15} />
                <span className="text-[#696e82]">{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
        </div>
      </section>
      <div className="mx-3 space-y-4">
        {profile.lifestyle.length ? (
          <InfoCard title="Lifestyle" rows={profile.lifestyle} />
        ) : null}
        {profile.family.length ? (
          <InfoCard title="Family" rows={profile.family} />
        ) : null}
        {profile.preferences.length ? (
          <InfoCard title="What I'm Looking For" rows={profile.preferences} />
        ) : null}
        {profile.horoscope.length ? (
          <InfoCard title="Horoscope" rows={profile.horoscope} />
        ) : null}
      </div>
      <MatchScore profile={profile} />
      <MoreProfiles profiles={moreProfiles} />
    </div>
  );
}
function MatchScore({ profile }: { profile: ProfileDetail }) {
  return (
    <section className="mx-3 mt-2 rounded-xl border border-[#ececf1] p-4">
      <h2 className="text-sm font-bold">Match Score</h2>
      <div className="mt-4 grid grid-cols-2 items-center">
        <div className="relative mx-auto grid size-24 place-items-center rounded-full bg-[conic-gradient(#1689df_0deg,#1d9bf0_331deg,#e8f5fe_331deg)]">
          <div className="grid size-[78px] place-items-center rounded-full bg-white text-center">
            <div>
              <strong className="text-xl">{profile.compatibility}%</strong>
              <p className="text-[10px] text-[#777b8d]">Compatibility</p>
            </div>
          </div>
        </div>
        <ul className="space-y-3 text-[12px]">
          {["Similar values", "Common interests", "Life goals match"].map(
            (item) => (
              <li key={item} className="flex gap-2">
                <span className="grid size-4 place-items-center rounded-full bg-[#dcf8e9] text-[#24794b]">
                  ✓
                </span>
                {item}
              </li>
            ),
          )}
        </ul>
      </div>
    </section>
  );
}
function MoreProfiles({ profiles }: { profiles: CompactProfile[] }) {
  if (!profiles.length) return null;
  return (
    <section className="mx-3 mt-4 rounded-xl border border-[#ececf1] p-3">
      <div className="flex justify-between">
        <h2 className="text-sm font-bold">More Profiles</h2>
        <Link
          href="/discover"
          className="text-[12px] font-semibold text-[#1d9bf0]"
        >
          View All →
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {profiles.map((p) => (
          <article key={p.id} className="min-w-0">
            <div className="relative aspect-square overflow-hidden rounded-lg">
              <ProfileImage
                src={p.image}
                alt={p.name}
                fill
                sizes="30vw"
                className="object-cover"
              />
            </div>
            <h3 className="mt-2 truncate text-[12px] font-bold">
              {p.name}, {p.age}
            </h3>
            <p className="mt-1 truncate text-[10px] text-[#707489]">
              {p.location}
            </p>
            <Link
              href={`/profile/${p.id}`}
              className="mt-2 flex h-8 items-center justify-center rounded-md border border-[#1d9bf0] text-[11px] font-semibold text-[#1d9bf0]"
            >
              View Profile
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
function InterestCta({
  profile,
  status,
  onFollow,
  onCancelRequest,
  onConfirmRequest,
  onDeleteRequest,
  onUnfollow,
}: {
  profile: ProfileDetail;
  status: RelationshipUIState;
  onFollow: () => Promise<void>;
  onCancelRequest: () => Promise<void>;
  onConfirmRequest: () => Promise<void>;
  onDeleteRequest: () => Promise<void>;
  onUnfollow: () => Promise<void>;
}) {
  return (
    <section
      id="profile-verification"
      className="mt-8 scroll-mt-5 flex items-center rounded-xl bg-[linear-gradient(90deg,#e8f5fe,#f5fbff)] px-6 py-5 max-md:hidden"
    >
      <HeartHandshake size={44} className="text-[#1d9bf0]" />
      <div className="ml-5">
        <h2 className="text-[17px] font-bold">
          Interested in {profile.name.split(" ")[0]}?
        </h2>
        <p className="mt-1 text-[12px]">
          Send interest and start a meaningful conversation.
        </p>
      </div>
      <FollowButton
        status={status}
        profileName={profile.name}
        onFollow={onFollow}
        onCancelRequest={onCancelRequest}
        onConfirmRequest={onConfirmRequest}
        onDeleteRequest={onDeleteRequest}
        onUnfollow={onUnfollow}
        className="ml-auto w-[220px]"
      />
    </section>
  );
}
