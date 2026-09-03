"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Bookmark,
  Check,
  Clock3,
  Heart,
  MapPin,
  MessageSquare,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { DesktopTopBar } from "@/components/layout/DesktopTopBar";
import { ProfileImage } from "@/components/ui/ProfileImage";
import type { InterestProfile } from "@/data/interests";
import { createClient } from "@/lib/supabase/client";
import { Brand } from "@/components/auth/Brand";

export type RequestTab = "received" | "sent" | "following";
const tabs: Array<{ id: RequestTab; label: string }> = [
  { id: "received", label: "Received" },
  { id: "sent", label: "Sent" },
  { id: "following", label: "Following" },
];

export function RequestsClient({
  currentUserId,
  initialReceived,
  initialSent,
  initialFollowing,
  initialTab,
  viewerName,
  avatarUrl,
}: {
  currentUserId: string;
  initialReceived: InterestProfile[];
  initialSent: InterestProfile[];
  initialFollowing: InterestProfile[];
  initialTab: RequestTab;
  viewerName: string;
  avatarUrl: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [received, setReceived] = useState(initialReceived);
  const [sent, setSent] = useState(initialSent);
  const [following, setFollowing] = useState(initialFollowing);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [pendingRemoval, setPendingRemoval] = useState<{
    profile: InterestProfile;
    kind: "sent" | "following";
  } | null>(null);

  useEffect(() => setReceived(initialReceived), [initialReceived]);
  useEffect(() => setSent(initialSent), [initialSent]);
  useEffect(() => setFollowing(initialFollowing), [initialFollowing]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`profile-requests:${currentUserId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profile_likes" },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUserId, router]);

  const profiles =
    activeTab === "received"
      ? received
      : activeTab === "sent"
        ? sent
        : following;

  async function accept(profile: InterestProfile) {
    setBusyId(profile.id);
    const { error } = await createClient()
      .from("profile_likes")
      .update({ status: "accepted", responded_at: new Date().toISOString() })
      .eq("liker_id", profile.profileId)
      .eq("liked_id", currentUserId)
      .eq("status", "pending");
    if (error) setNotice("We couldn't accept this request. Please try again.");
    else {
      setReceived((items) => items.filter((item) => item.id !== profile.id));
      setFollowing((items) => [profile, ...items]);
      setNotice(`${profile.name} is now following with you.`);
    }
    setBusyId(null);
  }
  async function remove(
    profile: InterestProfile,
    kind: "received" | "sent" | "following",
  ) {
    if ((kind === "sent" || kind === "following") && !pendingRemoval) {
      setPendingRemoval({ profile, kind });
      return;
    }
    setBusyId(profile.id);
    const { error } = await createClient()
      .from("profile_likes")
      .delete()
      .or(
        `and(liker_id.eq.${currentUserId},liked_id.eq.${profile.profileId}),and(liker_id.eq.${profile.profileId},liked_id.eq.${currentUserId})`,
      );
    if (error) setNotice("We couldn't update this request. Please try again.");
    else {
      if (kind === "received")
        setReceived((items) => items.filter((item) => item.id !== profile.id));
      if (kind === "sent")
        setSent((items) => items.filter((item) => item.id !== profile.id));
      if (kind === "following")
        setFollowing((items) => items.filter((item) => item.id !== profile.id));
      setNotice(
        kind === "received"
          ? "Request deleted."
          : kind === "sent"
            ? "Follow request cancelled."
            : `You unfollowed ${profile.name}.`,
      );
    }
    setBusyId(null);
    setPendingRemoval(null);
  }

  return (
    <div className="min-h-dvh bg-white">
      <div className="app-shell">
        <AppSidebar active="Requests" />
        <div className="app-workspace min-w-0 flex-1 pb-[72px] md:pb-0">
          <DesktopTopBar avatarUrl={avatarUrl} name={viewerName} />
          <MobileRequestsPage
            activeTab={activeTab}
            onTab={(tab) => {
              setActiveTab(tab);
              setNotice("");
            }}
            received={received}
            sent={sent}
            following={following}
            profiles={profiles}
            busyId={busyId}
            notice={notice}
            onAccept={(profile) => void accept(profile)}
            onRemove={(profile) => void remove(profile, activeTab)}
          />
          {pendingRemoval ? (
            <ConfirmRemovalModal
              profile={pendingRemoval.profile}
              kind={pendingRemoval.kind}
              busy={busyId === pendingRemoval.profile.id}
              onClose={() => setPendingRemoval(null)}
              onConfirm={() =>
                void remove(pendingRemoval.profile, pendingRemoval.kind)
              }
            />
          ) : null}
          <main className="hidden w-full md:block">
            <header className="border-b border-[#eff3f4] px-5 py-5 md:px-8">
              <h1 className="text-[24px] font-bold tracking-[-.02em] text-[#0f1419]">
                Requests
              </h1>
              <p className="mt-1 text-[14px] text-[#536471]">
                Manage your follow requests and connections
              </p>
            </header>
            <div className="border-b border-[#eff3f4] px-5 md:px-8">
              <div className="flex gap-9" role="tablist">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setNotice("");
                    }}
                    className={`relative h-14 text-[14px] font-semibold ${activeTab === tab.id ? "text-[#0f1419] after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:rounded-full after:bg-[#1d9bf0]" : "text-[#536471]"}`}
                  >
                    {tab.label}
                    {tab.id === "received" && received.length ? (
                      <span className="ml-2 rounded-full bg-[#1d9bf0] px-2 py-0.5 text-[11px] text-white">
                        {received.length}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
            {notice ? (
              <p
                role="status"
                className="mx-5 mt-4 rounded-lg bg-[#e8f5fe] px-4 py-3 text-[13px] text-[#0f5f99] md:mx-8"
              >
                {notice}
              </p>
            ) : null}
            <section
              aria-label={`${activeTab} requests`}
              className="px-5 md:px-8"
            >
              {profiles.length ? (
                profiles.map((profile) => (
                  <RequestRow
                    key={profile.id}
                    profile={profile}
                    kind={activeTab}
                    busy={busyId === profile.id}
                    onAccept={() => void accept(profile)}
                    onRemove={() => void remove(profile, activeTab)}
                  />
                ))
              ) : (
                <div className="py-20 text-center">
                  <p className="text-[16px] font-semibold text-[#0f1419]">
                    No {activeTab} profiles
                  </p>
                  <p className="mt-1 text-[14px] text-[#536471]">
                    New activity will appear here.
                  </p>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

function MobileRequestsPage({
  activeTab,
  onTab,
  received,
  sent,
  following,
  profiles,
  busyId,
  notice,
  onAccept,
  onRemove,
}: {
  activeTab: RequestTab;
  onTab: (tab: RequestTab) => void;
  received: InterestProfile[];
  sent: InterestProfile[];
  following: InterestProfile[];
  profiles: InterestProfile[];
  busyId: string | null;
  notice: string;
  onAccept: (profile: InterestProfile) => void;
  onRemove: (profile: InterestProfile) => void;
}) {
  const counts = {
    received: received.length,
    sent: sent.length,
    following: following.length,
  };
  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-[var(--app-bg)] px-4 pb-32 md:hidden">
      <div className="pointer-events-none absolute -left-28 -top-28 size-[430px] rounded-full bg-[#dff9f3]/80 blur-2xl" />
      <div className="pointer-events-none absolute -right-36 top-10 size-[420px] rounded-full bg-[#eee7ff]/80 blur-2xl" />
      <header className="relative grid grid-cols-[40px_1fr_40px] items-center pb-4 pt-5">
        
        <Link
          href="/discover"
          className=""
          aria-label="Bandhanaa"
        >
          <Brand compact />
        </Link>
        <span aria-hidden="true" />
        <div className="justify-self-end">
          <Link
            href="/matches?tab=shortlisted"
            aria-label="Shortlisted profiles"
            className="grid size-9 place-items-center rounded-[13px] bg-white/90 p-1 shadow-[0_7px_22px_rgba(15,20,25,.07)]"
          >
            <Heart size={17} strokeWidth={1.8} />
          </Link>
        </div>
      </header>
      <div
        role="tablist"
        className="relative mt-6 grid h-[62px] grid-cols-3 rounded-[19px] border border-[#eee9f2] bg-white/90 shadow-[0_8px_28px_rgba(63,38,110,.06)]"
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onTab(tab.id)}
              className={`relative flex items-center justify-center gap-2 text-[14px] font-semibold ${active ? "text-[#8b3de8]" : "text-[var(--text-secondary)]"}`}
            >
              {tab.label}
              {counts[tab.id] ? (
                <span
                  className={`grid size-6 place-items-center rounded-full text-[10px] ${active ? "bg-gradient-to-r from-[#8b3de8] to-[#f547a2] text-white" : "bg-[#d8b8ff] text-white"}`}
                >
                  {counts[tab.id]}
                </span>
              ) : null}
              {active ? (
                <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-[#8b3de8]" />
              ) : null}
            </button>
          );
        })}
      </div>
      {notice ? (
        <p
          role="status"
          className="relative mt-4 rounded-2xl bg-white/90 px-4 py-3 text-[12px] text-[#536471] shadow-sm"
        >
          {notice}
        </p>
      ) : null}
      {activeTab === "received" && received.length ? (
        <div className="relative mt-5 flex min-h-[104px] items-center rounded-[22px] bg-gradient-to-r from-[#faf8ff] to-[#f8eefd] px-4 shadow-[0_8px_25px_rgba(72,45,112,.09)]">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/80 text-[#8b3de8]">
            <ShieldCheck size={29} />
          </span>
          <span className="ml-4 min-w-0 flex-1">
            <strong className="block text-[17px] text-[#8b3de8]">
              You have {received.length} new requests
            </strong>
            <span className="mt-1 block text-[14px] leading-5 text-[var(--text-secondary)]">
              Review and connect with people who are interested in you.
            </span>
          </span>
          <span className="ml-2 shrink-0 text-[13px] font-semibold text-[#8b3de8]">
            View All ›
          </span>
        </div>
      ) : null}
      <section
        aria-label={`${activeTab} requests`}
        className="relative mt-7 space-y-4"
      >
        {profiles.length ? (
          <h2 className="text-[21px] font-bold text-[var(--text-primary)]">
            {activeTab === "received"
              ? "New Requests"
              : activeTab === "sent"
                ? "Sent Requests"
                : "Following"}
          </h2>
        ) : null}
        {profiles.map((profile) => (
          <MobileRequestCard
            key={profile.id}
            profile={profile}
            kind={activeTab}
            busy={busyId === profile.id}
            onAccept={() => onAccept(profile)}
            onRemove={() => onRemove(profile)}
          />
        ))}
        <MobileRequestEmpty
          kind={activeTab}
          hasProfiles={profiles.length > 0}
        />
        {profiles.length > 2 ? (
          <div className="pt-4">
            <h2 className="text-[20px] font-bold text-[var(--text-primary)]">
              More Requests
            </h2>
            <div className="-mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {profiles.slice(0, 5).map((profile) => (
                <Link
                  key={`more-${profile.id}`}
                  href={`/profile/${profile.profileId}`}
                  className="relative h-[135px] w-[122px] shrink-0 overflow-hidden rounded-[18px] bg-[#eee]"
                >
                  <ProfileImage
                    src={profile.image}
                    alt={profile.name}
                    fill
                    sizes="122px"
                    className="object-cover"
                  />
                  <span
                    className={`absolute left-2 top-2 size-2.5 rounded-full ${profile.online ? "bg-[#25d86d]" : "bg-[#aab2bc]"}`}
                  />
                  <span className="absolute right-2 top-2 grid size-8 place-items-center rounded-xl bg-white text-[#0f1419]">
                    <Bookmark size={16} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function MobileRequestCard({
  profile,
  kind,
  busy,
  onAccept,
  onRemove,
}: {
  profile: InterestProfile;
  kind: RequestTab;
  busy: boolean;
  onAccept: () => void;
  onRemove: () => void;
}) {
  return (
    <article className="grid min-h-[230px] grid-cols-[31%_minmax(0,1fr)] gap-4 rounded-[24px] border border-white/90 bg-white/95 p-3 shadow-[0_12px_32px_rgba(63,38,110,.08)]">
      <Link
        href={`/profile/${profile.profileId}`}
        className="relative min-h-[205px] overflow-hidden rounded-[18px] bg-[#eff3f4]"
      >
        <ProfileImage
          src={profile.image}
          alt={profile.name}
          fill
          sizes="31vw"
          className="object-cover"
        />
        <span
          className={`absolute bottom-3 left-3 size-3 rounded-full ring-2 ring-white ${profile.online ? "bg-[#25d86d]" : "bg-[#9aa5af]"}`}
        />
      </Link>
      <div className="flex min-w-0 flex-col py-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/profile/${profile.profileId}`}
              className="flex items-center gap-1.5 truncate text-[19px] font-bold tracking-[-.03em] text-[var(--text-primary)]"
            >
              {profile.name}, {profile.age}
              {profile.verified ? (
                <BadgeCheck
                  size={16}
                  className="shrink-0 fill-[#1d9bf0] text-[#1d9bf0] [&>path:last-child]:text-white"
                />
              ) : null}
            </Link>
            <p className="mt-2 flex items-center gap-2 truncate text-[12px] text-[var(--text-secondary)]">
              <BriefcaseBusiness size={14} />
              {profile.occupation}
            </p>
            <p className="mt-2 flex items-center gap-2 truncate text-[12px] text-[var(--text-secondary)]">
              <MapPin size={14} />
              {profile.location}
            </p>
          </div>
          <span className="shrink-0 text-[11px] text-[var(--text-secondary)]">
            {profile.time}
          </span>
        </div>
        <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-[#f3eaff] px-3 py-1.5 text-[11px] font-semibold text-[#8b3de8]">
          <Sparkles size={14} />
          {profile.compatibility ?? 85}% Match
        </span>
        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
          {kind === "received" ? (
            <>
              <button
                disabled={busy}
                onClick={onRemove}
                className="h-11 rounded-full border border-[#cfd9de] bg-white px-2 text-[12px] font-semibold text-[#0f1419] disabled:opacity-50"
              >
                Decline
              </button>
              <button
                disabled={busy}
                onClick={onAccept}
                className="h-11 rounded-full bg-gradient-to-r from-[#873df1] to-[#f547a2] px-2 text-[12px] font-semibold text-white disabled:opacity-50"
              >
                Accept
              </button>
            </>
          ) : kind === "sent" ? (
            <>
              <span className="flex h-10 items-center justify-center gap-1 rounded-full bg-[#fff6df] text-[10px] font-semibold text-[#df9000]">
                <Clock3 size={12} />
                Requested
              </span>
              <button
                disabled={busy}
                onClick={onRemove}
                className="h-10 rounded-full border border-[#8b3de8] px-1 text-[10px] font-semibold text-[#8b3de8] disabled:opacity-50"
              >
                Cancel Request
              </button>
            </>
          ) : (
            <>
              <button
                disabled={busy}
                onClick={onRemove}
                className="h-10 rounded-full border border-[#cfd9de] px-3 text-[11px] font-semibold"
              >
                Following
              </button>
              <Link
                href="/messages"
                className="grid h-10 place-items-center rounded-full bg-gradient-to-r from-[#873df1] to-[#f547a2] text-white"
              >
                <MessageSquare size={15} />
              </Link>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function MobileRequestCardLegacy({
  profile,
  kind,
  busy,
  onAccept,
  onRemove,
}: {
  profile: InterestProfile;
  kind: RequestTab;
  busy: boolean;
  onAccept: () => void;
  onRemove: () => void;
}) {
  return (
    <article className="relative flex h-[172px] gap-3 rounded-[22px] border border-white/90 bg-white/95 p-2.5 shadow-[0_12px_32px_rgba(63,38,110,.08)]">
      <Link
        href={`/profile/${profile.profileId}`}
        className="relative w-[35%] shrink-0 overflow-hidden rounded-[16px] bg-[#eff3f4]"
      >
        <ProfileImage
          src={profile.image}
          alt={profile.name}
          fill
          sizes="36vw"
          className="object-cover"
        />
        {kind === "received" ? (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-[#8b3de8]">
            New
          </span>
        ) : null}
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-[#0f1419]/80 px-2 py-1 text-[10px] text-white">
          <span
            className={`size-2 rounded-full ${profile.online ? "bg-[#31c95b]" : "bg-[#9aa5af]"}`}
          />
          {profile.online ? "Online" : "Offline"}
        </span>
      </Link>
      <div
        className={`flex min-w-0 flex-1 flex-col py-1 ${kind === "following" ? "" : "pr-[88px]"}`}
      >
        <Link
          href={`/profile/${profile.profileId}`}
          className="flex items-center gap-1 truncate text-[15px] font-bold tracking-[-.02em] text-[#0f1419]"
        >
          {profile.name}, {profile.age}
          {profile.verified ? (
            <BadgeCheck
              size={15}
              className="fill-[#1d9bf0] text-[#1d9bf0] [&>path:last-child]:text-white"
            />
          ) : null}
        </Link>
        <p className="mt-1 truncate text-[10px] text-[#536471]">
          {profile.occupation}
        </p>
        <p className="mt-1.5 flex items-start gap-1 text-[10px] leading-4 text-[#536471]">
          <MapPin size={11} className="mt-0.5 shrink-0" />
          <span className="line-clamp-2">{profile.location}</span>
        </p>
        <p className="mt-1 truncate text-[10px] text-[#536471]">
          {profile.height} <span className="mx-1">·</span> {profile.religion}{" "}
          <span className="mx-1">·</span> {profile.motherTongue}
        </p>
        <div className="mt-2 flex items-end justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#f3eaff] px-2 py-1 text-[10px] font-semibold text-[#8b3de8]">
            <Sparkles size={12} />
            {profile.compatibility ?? 85}% Match
          </span>
        </div>
        <div
          className={`flex gap-1.5 ${kind === "following" ? "mt-auto justify-end pt-2" : "absolute right-3 top-6 w-[82px] flex-col"}`}
        >
          {kind === "received" ? (
            <>
              <button
                disabled={busy}
                onClick={onAccept}
                className="flex h-10 items-center justify-center gap-1 rounded-xl bg-[#f3eaff] px-1 text-[10px] font-semibold text-[#8b3de8] disabled:opacity-50"
              >
                <Check size={15} />
                Accept
              </button>
              <button
                disabled={busy}
                onClick={onRemove}
                className="flex h-10 items-center justify-center gap-1 rounded-xl bg-[#fff0f5] px-1 text-[10px] font-semibold text-[#f12f72] disabled:opacity-50"
              >
                <X size={15} />
                Decline
              </button>
            </>
          ) : kind === "sent" ? (
            <>
              <span className="flex h-8 items-center justify-center gap-1 rounded-full bg-[#fff6df] text-[10px] font-semibold text-[#df9000]">
                <Clock3 size={12} />
                Requested
              </span>
              <span className="py-0.5 text-center text-[9px] text-[#687684]">
                {profile.time}
              </span>
              <button
                disabled={busy}
                onClick={onRemove}
                className="h-8 rounded-full border border-[#1d9bf0] px-1 text-[9px] font-semibold text-[#1d9bf0] disabled:opacity-50"
              >
                Cancel Request
              </button>
            </>
          ) : (
            <>
              <button
                disabled={busy}
                onClick={onRemove}
                className="h-9 rounded-full border border-[#cfd9de] px-3 text-[11px] font-semibold"
              >
                Following
              </button>
              <Link
                href="/messages"
                className="grid size-9 place-items-center rounded-full bg-[#1d9bf0] text-white"
              >
                <MessageSquare size={15} />
              </Link>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function MobileRequestEmpty({
  kind,
  hasProfiles,
}: {
  kind: RequestTab;
  hasProfiles: boolean;
}) {
  if (hasProfiles) return null;
  return (
    <div className="mt-8 rounded-[24px] bg-white/80 px-6 py-14 text-center shadow-[0_10px_30px_rgba(63,38,110,.06)]">
      <div className="mx-auto grid size-20 place-items-center rounded-full bg-[#f3eaff] text-[#8b3de8]">
        {kind === "received" ? <Heart size={36} /> : <Send size={36} />}
      </div>
      <h2 className="mt-4 text-[18px] font-bold text-[#0f1419]">
        {kind === "received"
          ? "All caught up!"
          : kind === "sent"
            ? "Requests on the way!"
            : "Your connections"}
      </h2>
      <p className="mx-auto mt-2 max-w-[280px] text-[13px] leading-5 text-[#687684]">
        {kind === "received"
          ? "You have no more new requests. Check back later for new connections."
          : kind === "sent"
            ? "We’ll notify you when someone responds."
            : "Accepted connections will appear here."}
      </p>
    </div>
  );
}

function ConfirmRemovalModal({
  profile,
  kind,
  busy,
  onClose,
  onConfirm,
}: {
  profile: InterestProfile;
  kind: "sent" | "following";
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const cancelling = kind === "sent";
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-confirm-title"
      className="fixed inset-0 z-[200] grid place-items-end bg-black/45 p-4 backdrop-blur-[2px] md:place-items-center"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-[26px] bg-white p-6 shadow-2xl">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#fff0f5] text-[#e72c6c]">
          <X size={22} />
        </div>
        <h2
          id="request-confirm-title"
          className="mt-4 text-center text-[20px] font-bold"
        >
          {cancelling ? "Cancel request?" : `Unfollow ${profile.name}?`}
        </h2>
        <p className="mt-2 text-center text-[14px] leading-5 text-[var(--text-secondary)]">
          {cancelling
            ? "Are you sure you want to cancel this request?"
            : "You’ll stop following this profile."}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="h-12 rounded-full border border-[#d8d4dc] font-semibold"
          >
            {cancelling ? "Keep Request" : "Keep Following"}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="h-12 rounded-full bg-[#e72c6c] font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Updating…" : cancelling ? "Cancel Request" : "Unfollow"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RequestRow({
  profile,
  kind,
  busy,
  onAccept,
  onRemove,
}: {
  profile: InterestProfile;
  kind: RequestTab;
  busy: boolean;
  onAccept: () => void;
  onRemove: () => void;
}) {
  return (
    <article className="flex items-center gap-4 border-b border-[#eff3f4] py-5 max-sm:items-start">
      <Link
        href={`/profile/${profile.profileId}`}
        className="relative size-20 shrink-0 overflow-hidden rounded-full"
      >
        <ProfileImage
          src={profile.image}
          alt={profile.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={`/profile/${profile.profileId}`}
          className="inline-flex items-center gap-1 text-[16px] font-bold text-[#0f1419]"
        >
          {profile.name}, {profile.age}
          {profile.verified ? (
            <BadgeCheck
              size={17}
              className="fill-[#1d9bf0] text-[#1d9bf0] [&>path:last-child]:text-white"
            />
          ) : null}
        </Link>
        <p className="mt-1 text-[14px] text-[#536471]">{profile.occupation}</p>
        <p className="mt-1 flex items-center gap-1 text-[13px] text-[#536471]">
          <MapPin size={14} />
          {profile.location} <span aria-hidden>·</span>{" "}
          <span className="font-semibold text-[#1d9bf0]">
            {profile.compatibility ?? 85}% Match
          </span>
        </p>
        {kind === "received" ? (
          <p className="mt-2 text-[13px] text-[#536471]">
            {profile.name} wants to connect with you.
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2 self-center max-sm:flex-col">
        {kind === "received" ? (
          <>
            <button
              disabled={busy}
              onClick={onAccept}
              className="h-10 rounded-full bg-[#1d9bf0] px-5 text-[14px] font-semibold text-white disabled:opacity-50"
            >
              Accept Request
            </button>
            <button
              disabled={busy}
              onClick={onRemove}
              className="h-10 rounded-full border border-[#cfd9de] bg-white px-5 text-[14px] font-semibold text-[#0f1419] disabled:opacity-50"
            >
              Delete
            </button>
          </>
        ) : kind === "sent" ? (
          <button
            disabled={busy}
            onClick={onRemove}
            className="h-10 rounded-full border border-[#cfd9de] bg-white px-5 text-[14px] font-semibold text-[#0f1419] disabled:opacity-50"
          >
            Requested
          </button>
        ) : (
          <>
            <button
              disabled={busy}
              onClick={onRemove}
              className="h-10 rounded-full border border-[#cfd9de] bg-white px-5 text-[14px] font-semibold text-[#0f1419] disabled:opacity-50"
            >
              Following
            </button>
            <Link
              href="/messages"
              className="flex h-10 items-center gap-2 rounded-full bg-[#1d9bf0] px-5 text-[14px] font-semibold text-white"
            >
              <MessageSquare size={16} />
              Message
            </Link>
          </>
        )}
      </div>
    </article>
  );
}
