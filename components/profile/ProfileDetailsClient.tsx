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
  Send,
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
  const [shortlisted, setShortlisted] = useState(false);

  const relationFilter = `and(liker_id.eq.${currentUserId},liked_id.eq.${profile.id}),and(liker_id.eq.${profile.id},liked_id.eq.${currentUserId})`;

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    const supabase = createClient();
    void supabase
      .from("profile_shortlists")
      .select("profile_id")
      .eq("user_id", currentUserId)
      .eq("profile_id", profile.id)
      .maybeSingle()
      .then(({ data }) => setShortlisted(Boolean(data)));
  }, [currentUserId, profile.id]);

  async function toggleShortlist() {
    const next = !shortlisted;
    setShortlisted(next);
    const supabase = createClient();
    const { error } = next
      ? await supabase
          .from("profile_shortlists")
          .insert({ user_id: currentUserId, profile_id: profile.id })
      : await supabase
          .from("profile_shortlists")
          .delete()
          .eq("user_id", currentUserId)
          .eq("profile_id", profile.id);
    if (error) setShortlisted(!next);
  }

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
        <AppSidebar active="Profile" hideMobileNavigation />
        <div className="app-workspace min-w-0 flex-1 overflow-y-auto pb-[72px] md:pb-0">
          <DesktopTopBar avatarUrl={avatarUrl} name={viewerName} />
          <MobileHeader avatarUrl={avatarUrl} />
          <main className="mx-auto max-w-[1060px] px-5 pb-8 max-md:px-0">
            <MobileProfileExperience
              profile={profile}
              relation={relation}
              shortlisted={shortlisted}
              expanded={aboutExpanded}
              onExpand={() => setAboutExpanded((value) => !value)}
              onShortlist={() => void toggleShortlist()}
              onFollow={() => void follow()}
              onCancel={() =>
                void removeRelationship("Follow request cancelled.")
              }
              onConfirm={() => void confirmRequest()}
              onDelete={() => void deleteIncomingRequest()}
              onUnfollow={() =>
                void removeRelationship(
                  "You are no longer following this profile.",
                )
              }
            />
            <section className="grid grid-cols-[190px_minmax(0,1fr)] gap-8 px-4 py-8 max-md:hidden">
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
            <div className="hidden">
              <MobileContent
                profile={profile}
                expanded={aboutExpanded}
                onExpand={() => setAboutExpanded((value) => !value)}
                moreProfiles={moreProfiles}
              />
            </div>
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

function MobileProfileExperience({
  profile,
  relation,
  shortlisted,
  expanded,
  onExpand,
  onShortlist,
  onFollow,
  onCancel,
  onConfirm,
  onDelete,
  onUnfollow,
}: {
  profile: ProfileDetail;
  relation: RelationshipUIState;
  shortlisted: boolean;
  expanded: boolean;
  onExpand: () => void;
  onShortlist: () => void;
  onFollow: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  onDelete: () => void;
  onUnfollow: () => void;
}) {
  const [mainPhotoOpen, setMainPhotoOpen] = useState(false);
  useEffect(() => {
    if (!mainPhotoOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMainPhotoOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mainPhotoOpen]);
  const firstName = profile.name.split(" ")[0];
  const relationLabel =
    relation === "none"
      ? "Send Request"
      : relation === "outgoing_pending"
        ? "Requested"
        : relation === "incoming_pending"
          ? "Accept Request"
          : "Following";
  const relationAction =
    relation === "none"
      ? onFollow
      : relation === "outgoing_pending"
        ? onCancel
        : relation === "incoming_pending"
          ? onConfirm
          : onUnfollow;
  const basics = [
    [UserRound, "Age", String(profile.age)],
    [CalendarDays, "Date of Birth", profile.birthDate || "Not added"],
    [UserRound, "Gender", profile.gender || "Not added"],
    [MapPin, "Current Location", profile.location],
    [Sparkles, "Religion", profile.religion],
    [GraduationCap, "Education", profile.education],
    [Weight, "Height", profile.height],
    [Weight, "Weight", profile.weight || "Not added"],
    [Languages, "Mother Tongue", profile.motherTongue],
    [BriefcaseBusiness, "Profession", profile.occupation],
    [Heart, "Marital Status", profile.maritalStatus],
    [BriefcaseBusiness, "Company", profile.company || "Not added"],
    [CalendarDays, "Member Since", profile.memberSince],
  ] as const;
  const galleryPhotos = profile.photos.length
    ? profile.photos
    : [profile.image];
  return (
    <div className="relative pb-24 md:hidden">
      <section className="relative h-[455px] overflow-hidden bg-[#eee]">
        <button
          type="button"
          onClick={() => setMainPhotoOpen(true)}
          aria-label={`Open ${profile.name} photo`}
          className="absolute inset-0"
        >
          <ProfileImage
            src={profile.image}
            alt={profile.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </button>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/35 to-transparent" />
        <Link
          href="/discover"
          aria-label="Back"
          className="absolute left-5 top-5 grid size-11 place-items-center rounded-full bg-white/95 text-[#0f1419] shadow-lg"
        >
          <ChevronLeft size={24} />
        </Link>
        <span
          className={`absolute left-5 top-[100px] rounded-full px-3 py-1.5 text-[12px] ${profile.online ? "bg-black/60 text-white" : "bg-black/55 text-white"}`}
        >
          ● {profile.online ? "Online" : "Offline"}
        </span>
        <button
          type="button"
          onClick={onShortlist}
          className="absolute right-5 top-[100px] flex h-11 items-center gap-2 rounded-full bg-white/95 px-4 text-[13px] font-semibold text-[#0f1419] shadow-lg"
        >
          <Heart
            size={20}
            fill={shortlisted ? "#ff3040" : "none"}
            className="text-[#ff4d9b]"
          />
          {shortlisted ? "Shortlisted" : "Shortlist"}
        </button>
        <span className="absolute right-5 top-[158px] rounded-full bg-black/60 px-3 py-1.5 text-[12px] text-white">
          <Camera size={14} className="mr-1 inline" />
          1/{Math.max(profile.photos.length, 1)}
        </span>
      </section>
      <section className="relative z-10 -mt-8 mx-4 rounded-[24px] bg-white p-5 shadow-[0_14px_40px_rgba(63,38,110,.14)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-[25px] font-bold leading-tight tracking-[-.04em]">
              {profile.name}, {profile.age}
              <BadgeCheck size={20} className="fill-[#8c45ff] text-white" />
            </h1>
            <p className="mt-3 flex items-center gap-2 text-[14px] text-[var(--text-secondary)]">
              <BriefcaseBusiness size={16} />
              {profile.occupation}
            </p>
            <p className="mt-2 flex items-center gap-2 text-[14px] text-[var(--text-secondary)]">
              <MapPin size={16} />
              {profile.location}
            </p>
            <p className="mt-2 flex items-center gap-2 text-[14px] text-[var(--text-secondary)]">
              <Sparkles size={16} />
              {profile.religion} · {profile.motherTongue}
            </p>
          </div>
          <div className="grid size-[76px] shrink-0 place-items-center rounded-full border-[5px] border-[#8c45ff] border-l-[#f0eaff] text-center text-[#8c45ff]">
            <span>
              <strong className="block text-[18px] leading-none">
                {profile.compatibility}%
              </strong>
              <small className="text-[10px]">Match</small>
            </span>
          </div>
        </div>
        <p className="mt-2 text-right text-[11px] font-semibold text-[#8c45ff]">
          Highly compatible
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={relationAction}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#873df1] to-[#f547a2] px-3 text-[13px] font-semibold text-white"
          >
            <MessageSquare size={17} />
            {relationLabel}
          </button>
          <Link
            href="/messages"
            className="flex h-12 items-center justify-center gap-2 rounded-full border border-[#cfd9de] text-[13px] font-semibold"
          >
            <Send size={17} />
            Message
          </Link>
        </div>
        {relation === "incoming_pending" ? (
          <button
            type="button"
            onClick={onDelete}
            className="mx-auto mt-3 block text-[12px] text-[#f4212e]"
          >
            Delete request
          </button>
        ) : null}
      </section>
      <nav className="sticky top-0 z-[70] mx-4 mt-4 flex overflow-x-auto rounded-[20px] bg-white/95 px-2 py-3 shadow-[0_10px_30px_rgba(63,38,110,.08)] backdrop-blur-xl [scrollbar-color:#c8a6ff_transparent] [scrollbar-width:thin]">
        {[
          [UserRound, "About"],
          [Camera, "Photos"],
          [Dumbbell, "Lifestyle"],
          [UsersRound, "Family"],
          [Sparkles, "Horoscope"],
          [Heart, "Preferences"],
        ].map(([Icon, label], index) => {
          const I = Icon as typeof Heart;
          return (
            <a
              key={String(label)}
              href={`#mobile-${String(label).toLowerCase()}`}
              className={`flex min-w-[76px] shrink-0 flex-col items-center gap-1 text-[12px] ${index === 0 ? "text-[#8c45ff]" : "text-[var(--text-secondary)]"}`}
            >
              <I size={18} />
              <span>{String(label)}</span>
            </a>
          );
        })}
      </nav>
      <section
        id="mobile-about"
        className="mx-4 mt-4 rounded-[22px] bg-white p-5 shadow-[0_10px_30px_rgba(63,38,110,.07)]"
      >
        <h2 className="text-[18px] font-bold">About {firstName}</h2>
        <p
          className={`mt-4 text-[14px] leading-6 text-[var(--text-secondary)] ${expanded ? "" : "line-clamp-3"}`}
        >
          {profile.about}
        </p>
        <button
          type="button"
          onClick={onExpand}
          className="mt-3 inline-flex items-center justify-center gap-1 text-[13px] font-semibold text-[#8c45ff]"
        >
          {expanded ? "Read Less" : "Read More"}
          <ChevronDown
            size={17}
            className={`shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
        <div className="mt-4 rounded-[18px] bg-[#faf8ff] p-4 text-[13px]">
          <p className="flex items-center gap-2 text-[#0ab86b]">
            <Sparkles size={16} />
            {profile.online ? "Active today" : "Recently active"}
          </p>
          <p className="mt-3 flex items-center gap-2 text-[var(--text-secondary)]">
            <CalendarDays size={16} />
            Joined {profile.memberSince}
          </p>
        </div>
      </section>
      <section className="mx-4 mt-4 rounded-[22px] bg-white p-5 shadow-[0_10px_30px_rgba(63,38,110,.07)]">
        <h2 className="text-[18px] font-bold">
          Why you match{" "}
          <span className="ml-2 rounded-full bg-[#f3eaff] px-2 py-1 text-[11px] text-[#8c45ff]">
            ♥ {profile.compatibility}%
          </span>
        </h2>
        <div className="mt-6 grid grid-cols-5 gap-2 text-center text-[12px] text-[var(--text-secondary)]">
          {[
            [MapPin, "Location"],
            [GraduationCap, "Education"],
            [Dumbbell, "Lifestyle"],
            [UsersRound, "Family Values"],
            [Heart, "Partner Preferences"],
          ].map(([Icon, label]) => {
            const I = Icon as typeof Heart;
            return (
              <div key={String(label)}>
                <span className="mx-auto grid size-10 place-items-center rounded-full bg-[#f7f1ff] text-[#8c45ff]">
                  <I size={18} />
                </span>
                <span className="mt-2 block">{String(label)}</span>
              </div>
            );
          })}
        </div>
        <button className="mt-6 text-[12px] font-semibold text-[#8c45ff]">
          See compatibility details ›
        </button>
      </section>
      <section className="mx-4 mt-4 rounded-[22px] bg-white p-5 shadow-[0_10px_30px_rgba(63,38,110,.07)]">
        <h2 className="text-[18px] font-bold">Basic Details</h2>
        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5">
          {basics.map(([Icon, label, value]) => (
            <div key={label} className="flex min-w-0 gap-2">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f7f1ff] text-[#8c45ff]">
                <Icon size={16} />
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] text-[var(--text-secondary)]">
                  {label}
                </span>
                <strong className="mt-1 block truncate text-[12px]">
                  {value}
                </strong>
              </span>
            </div>
          ))}
        </div>
      </section>
      <section
        id="mobile-photos"
        className="mx-4 mt-4 scroll-mt-4 rounded-[22px] bg-white p-5 shadow-[0_10px_30px_rgba(63,38,110,.07)]"
      >
        <h2 className="text-[18px] font-bold">Photos</h2>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {galleryPhotos.map((photo, index) => (
            <div
              key={`${photo}-${index}`}
              className="relative aspect-square overflow-hidden rounded-[14px] bg-[#eee]"
            >
              <ProfileImage
                src={photo}
                alt={`${profile.name} photo ${index + 1}`}
                fill
                sizes="30vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>
      <MobileProfileFieldSection
        id="mobile-lifestyle"
        title="Lifestyle"
        items={profile.lifestyle}
        emptyText="Lifestyle details have not been added."
      />
      <MobileProfileFieldSection
        id="mobile-family"
        title="Family"
        items={profile.family}
        emptyText="Family details have not been added."
      />
      <MobileProfileFieldSection
        id="mobile-horoscope"
        title="Horoscope"
        items={profile.horoscope}
        emptyText="Horoscope details have not been added."
      />
      <MobileProfileFieldSection
        id="mobile-preferences"
        title="Partner Preferences"
        items={profile.preferences}
        emptyText="Partner preferences have not been added."
      />
      <div className="fixed inset-x-3 bottom-[calc(0px+env(safe-area-inset-bottom))] z-[110] grid grid-cols-2 gap-3 rounded-[0px] bg-white/95 p-3 shadow-[0_14px_45px_rgba(63,38,110,.2)] backdrop-blur-xl md:hidden">
        <button
          type="button"
          onClick={onShortlist}
          className="flex h-12 items-center justify-center gap-2 rounded-full border border-[#cfd9de] text-[13px] font-semibold text-[#ff4d9b]"
        >
          <Heart
            size={20}
            fill={shortlisted ? "#ff3040" : "none"}
            className="shrink-0"
          />
          {shortlisted ? "Shortlisted" : "Shortlist"}
        </button>
        <button
          type="button"
          onClick={relationAction}
          className="h-12 rounded-full bg-gradient-to-r from-[#873df1] to-[#f547a2] text-[13px] font-semibold text-white"
        >
          {relationLabel}
        </button>
      </div>
      {mainPhotoOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${profile.name} photo viewer`}
          onMouseDown={(event) =>
            event.target === event.currentTarget && setMainPhotoOpen(false)
          }
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={() => setMainPhotoOpen(false)}
            aria-label="Close photo viewer"
            className="absolute right-5 top-5 z-10 grid size-11 place-items-center rounded-full bg-white/15 text-white"
          >
            <X size={24} />
          </button>
          <div className="relative h-[82dvh] w-full max-w-xl overflow-hidden rounded-[24px]">
            <ProfileImage
              src={profile.image}
              alt={profile.name}
              fill
              priority
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MobileProfileFieldSection({
  id,
  title,
  items,
  emptyText,
}: {
  id: string;
  title: string;
  items: Array<{ label: string; value: string }>;
  emptyText: string;
}) {
  return (
    <section
      id={id}
      className="mx-4 mt-4 scroll-mt-4 rounded-[22px] bg-white p-5 shadow-[0_10px_30px_rgba(63,38,110,.07)]"
    >
      <h2 className="text-[18px] font-bold">{title}</h2>
      {items.length ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {items.map((item) => (
            <div
              key={`${title}-${item.label}`}
              className="rounded-[15px] bg-[#faf8ff] p-3"
            >
              <span className="block text-[12px] text-[var(--text-secondary)]">
                {item.label}
              </span>
              <strong className="mt-1 block text-[12px] text-[var(--text-primary)]">
                {item.value || "Not added"}
              </strong>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-[12px] text-[var(--text-secondary)]">
          {emptyText}
        </p>
      )}
    </section>
  );
}

function MobileHeader({ avatarUrl }: { avatarUrl: string }) {
  return (
    <header className="hidden">
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
