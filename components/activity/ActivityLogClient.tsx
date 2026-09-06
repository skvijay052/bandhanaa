"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowRight,
  Bookmark,
  Check,
  ChevronDown,
  Clock3,
  HeartHandshake,
  History,
  MessageCircle,
  Shield,
  UserRound,
  UserRoundCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobilePageHeader } from "@/components/layout/MobilePageHeader";
import { ProfileImage } from "@/components/ui/ProfileImage";
import { SettingsNavigation } from "@/components/settings/SettingsNavigation";
import {
  activityFilters,
  type ActivityFilter,
  type ActivityItem,
  type ActivityPage,
  type ActivityPeriod,
} from "@/data/activity";

const filterLabels: Record<ActivityFilter, string> = {
  all: "All Activity",
  profiles: "Profiles",
  requests: "Requests",
  messages: "Messages",
  account: "Account",
};
const periodLabels: Record<ActivityPeriod, string> = {
  "7": "Last 7 days",
  "30": "Last 30 days",
  "90": "Last 90 days",
  all: "All time",
};
const iconByType: Record<string, LucideIcon> = {
  profile_viewed: UserRound,
  profile_updated: UserRoundCheck,
  profile_photo_updated: UserRoundCheck,
  partner_preferences_updated: UserRoundCheck,
  profile_shortlisted: Bookmark,
  profile_removed_from_shortlist: Bookmark,
  request_sent: HeartHandshake,
  request_received: HeartHandshake,
  request_accepted: Check,
  request_declined: X,
  request_cancelled: X,
  following_started: UserRoundCheck,
  unfollowed: UserRound,
  message_sent: MessageCircle,
  conversation_started: MessageCircle,
  profile_reported: Shield,
  profile_blocked: Shield,
  profile_unblocked: Shield,
  account_created: UserRoundCheck,
  email_updated: UserRoundCheck,
  password_updated: Shield,
};

function activityCopy(item: ActivityItem) {
  const name = item.target?.name ?? "a member";
  const copy: Record<string, [string, string, string?]> = {
    profile_viewed: [`You viewed ${name}'s profile`, memberDetail(item)],
    profile_updated: [
      "You updated your profile",
      "Your profile information was updated.",
    ],
    profile_photo_updated: [
      "You updated your profile photos",
      "Your profile gallery was changed.",
    ],
    partner_preferences_updated: [
      "You updated partner preferences",
      "Your preferred match criteria were changed.",
    ],
    profile_shortlisted: [
      `You shortlisted ${name}`,
      memberLocation(item),
      "Shortlisted",
    ],
    profile_removed_from_shortlist: [
      `You removed ${name} from your shortlist`,
      memberLocation(item),
    ],
    request_sent: [
      `You sent a request to ${name}`,
      "Waiting for their response.",
      "Pending",
    ],
    request_received: [
      `You received a request from ${name}`,
      memberDetail(item),
      "Received",
    ],
    request_accepted: [
      `You accepted ${name}'s request`,
      "You can now start a conversation.",
      "Accepted",
    ],
    request_declined: [
      `You declined ${name}'s request`,
      "The request was declined.",
    ],
    request_cancelled: [
      `You cancelled your request to ${name}`,
      "The pending request was removed.",
    ],
    following_started: [
      `You connected with ${name}`,
      "You can now message each other.",
      "Connected",
    ],
    unfollowed: [
      `You disconnected from ${name}`,
      "The connection was removed.",
    ],
    conversation_started: [
      `You started a conversation with ${name}`,
      "A new conversation was started.",
    ],
    message_sent: [`You sent a message to ${name}`, "Message sent."],
    profile_reported: [
      `You reported ${name}`,
      "Your private report was submitted for review.",
    ],
    profile_blocked: [
      `You blocked ${name}`,
      "This member can no longer interact with you.",
    ],
    profile_unblocked: [
      `You unblocked ${name}`,
      "This member can interact with you again.",
    ],
    account_created: [
      "You created your Bandhanaa account",
      "Welcome to the Bandhanaa community.",
    ],
    email_updated: [
      "You updated your email",
      "Your sign-in email was changed.",
    ],
    password_updated: [
      "You updated your password",
      "Your account password was changed securely.",
    ],
  };
  return (
    copy[item.type] ?? [
      "Account activity",
      "An action was completed on your account.",
    ]
  );
}
function memberLocation(item: ActivityItem) {
  return (
    [item.target?.city, item.target?.state].filter(Boolean).join(", ") ||
    "Bandhanaa member"
  );
}
function memberDetail(item: ActivityItem) {
  return [item.target?.age, item.target?.profession, memberLocation(item)]
    .filter(Boolean)
    .join(" · ");
}
function friendlyTime(value: string) {
  const date = new Date(value);
  const now = new Date();
  const seconds = Math.max(
    0,
    Math.floor((now.getTime() - date.getTime()) / 1000),
  );
  if (seconds < 45) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 7200) return "1 hour ago";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  if (date.toDateString() === yesterday.toDateString())
    return `Yesterday · ${time}`;
  return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${time}`;
}

export function ActivityLogClient({
  initial,
  initialError,
}: {
  initial: ActivityPage;
  initialError: string;
}) {
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [period, setPeriod] = useState<ActivityPeriod>("30");
  const [items, setItems] = useState(initial.items);
  const [hasMore, setHasMore] = useState(initial.hasMore);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(initialError);

  async function load(
    nextFilter: ActivityFilter,
    nextPeriod: ActivityPeriod,
    offset = 0,
  ) {
    const response = await fetch(
      `/api/activity?filter=${nextFilter}&period=${nextPeriod}&offset=${offset}`,
      { cache: "no-store" },
    );
    const result = (await response.json()) as ActivityPage & {
      message?: string;
    };
    if (!response.ok)
      throw new Error(result.message || "We couldn't load your activity.");
    return result;
  }
  async function changeFilters(
    nextFilter: ActivityFilter,
    nextPeriod: ActivityPeriod,
  ) {
    setFilter(nextFilter);
    setPeriod(nextPeriod);
    setLoading(true);
    setError("");
    try {
      const result = await load(nextFilter, nextPeriod);
      setItems(result.items);
      setHasMore(result.hasMore);
    } catch (failure) {
      setItems([]);
      setHasMore(false);
      setError(
        failure instanceof Error
          ? failure.message
          : "We couldn't load your activity.",
      );
    } finally {
      setLoading(false);
    }
  }
  async function loadMore() {
    setLoadingMore(true);
    setError("");
    try {
      const result = await load(filter, period, items.length);
      setItems((current) => [...current, ...result.items]);
      setHasMore(result.hasMore);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "We couldn't load more activity.",
      );
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <main className="fixed inset-0 overflow-hidden bg-[var(--app-bg)]">
      <div className="app-shell edit-profile-shell !h-full">
        <AppSidebar active="Settings" />
        <div className="grid h-full min-h-0 min-w-0 flex-1 md:grid-cols-[340px_minmax(0,1fr)]">
          <SettingsNavigation active="Activity Log" />
          <div className="h-full min-h-0 overflow-y-auto px-5 pb-24 md:px-8 md:pb-10">
            <MobilePageHeader
              title="Activity Log"
              description="See your recent activity"
            />
            <div className="mx-auto w-full max-w-[1080px] py-5 md:py-7">
              <header className="hidden md:block">
                <h1 className="text-[22px] font-bold tracking-[-.02em] text-[#0f1419]">
                  Activity Log
                </h1>
                <p className="mt-1 text-[12px] text-[#536471]">
                  See your recent activity
                </p>
              </header>
              <div className="mt-2 flex items-center gap-3 border-b border-[#eff3f4] md:mt-4">
                <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {activityFilters.map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={filter === value}
                      onClick={() => void changeFilters(value, period)}
                      className={`relative h-11 shrink-0 px-3 text-[13px] transition-colors ${filter === value ? "font-semibold text-[#0f1419] after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-[#1d9bf0]" : "text-[#536471] hover:text-[#0f1419]"}`}
                    >
                      {filterLabels[value]}
                    </button>
                  ))}
                </div>
                <PeriodDropdown
                  value={period}
                  onChange={(value) => void changeFilters(filter, value)}
                />
              </div>
              <section className="mt-3 overflow-hidden rounded-xl border border-[#eff3f4] bg-white">
                {loading ? (
                  <ActivitySkeleton />
                ) : items.length ? (
                  items.map((item) => <ActivityRow key={item.id} item={item} />)
                ) : (
                  <EmptyState />
                )}
              </section>
              {error ? (
                <p
                  role="alert"
                  className="mt-4 text-center text-[12px] text-red-600"
                >
                  {error}
                </p>
              ) : null}
              {hasMore && !loading ? (
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() => void loadMore()}
                  className="mx-auto mt-5 flex h-10 min-w-32 items-center justify-center rounded-full border border-[#cfd9de] bg-white px-5 text-[13px] font-semibold text-[#0f1419] hover:bg-[#f7f9f9] disabled:opacity-60 max-md:w-full"
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function PeriodDropdown({
  value,
  onChange,
}: {
  value: ActivityPeriod;
  onChange: (value: ActivityPeriod) => void;
}) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-label="Activity date range"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
        className="flex h-9 min-w-[126px] items-center justify-between gap-3 rounded-full border border-[#eff3f4] bg-white px-4 text-[12px] font-medium text-[#0f1419] outline-none transition-colors hover:bg-[#f7f9f9] focus-visible:ring-2 focus-visible:ring-[#1d9bf0]/25"
      >
        {periodLabels[value]}
        <ChevronDown
          size={15}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div
          id={menuId}
          role="listbox"
          aria-label="Activity date range"
          className="absolute right-0 top-[calc(100%+8px)] z-30 w-40 overflow-hidden rounded-xl border border-[#eff3f4] bg-white p-1.5 shadow-[0_12px_32px_rgba(15,20,25,.14)]"
        >
          {(Object.keys(periodLabels) as ActivityPeriod[]).map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={option === value}
              onClick={() => {
                setOpen(false);
                if (option !== value) onChange(option);
              }}
              className={`flex h-9 w-full items-center justify-between rounded-lg px-3 text-left text-[12px] transition-colors ${option === value ? "bg-[#f2f3f5] font-semibold text-[#0f1419]" : "text-[#536471] hover:bg-[#f7f9f9] hover:text-[#0f1419]"}`}
            >
              {periodLabels[option]}
              {option === value ? <Check size={14} /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
function activityTone(type: string) {
  if (type.includes("reported") || type.includes("blocked"))
    return "bg-[#fff0f3] text-[#f4215b]";
  if (type.includes("accepted") || type.includes("following"))
    return "bg-[#eaf9ee] text-[#24a148]";
  if (type.includes("message") || type.includes("conversation"))
    return "bg-[#f0edff] text-[#7656d6]";
  if (type.includes("shortlist")) return "bg-[#eaf5ff] text-[#1d9bf0]";
  return "bg-[#f2f3f5] text-[#536471]";
}
function badgeTone(badge: string) {
  if (badge === "Connected" || badge === "Accepted")
    return "bg-[#eaf9ee] text-[#238b45]";
  if (badge === "Pending" || badge === "Received")
    return "bg-[#fff4dc] text-[#b66b00]";
  return "bg-[#eaf5ff] text-[#1689df]";
}
function ActivityRow({ item }: { item: ActivityItem }) {
  const Icon = iconByType[item.type] ?? History;
  const [title, description, badge] = activityCopy(item);
  const identity = item.target ? (
    <>
      <span className="relative block size-[42px] overflow-hidden rounded-full bg-[#f2f3f5]">
        <ProfileImage
          src={item.target.avatar}
          alt={`${item.target.name}'s profile`}
          fill
          sizes="42px"
          className="object-cover"
        />
      </span>
      <span
        className={`absolute -bottom-0.5 -right-1 grid size-[19px] place-items-center rounded-full border-2 border-white ${activityTone(item.type)}`}
      >
        <Icon size={10} strokeWidth={2.2} />
      </span>
    </>
  ) : (
    <span
      className={`grid size-[42px] place-items-center rounded-full ${activityTone(item.type)}`}
    >
      <Icon size={18} strokeWidth={2} />
    </span>
  );
  return (
    <article className="flex min-h-[74px] items-center gap-3 border-b border-[#eff3f4] px-3.5 py-2.5 last:border-b-0 transition-colors hover:bg-[#fafbfb] md:px-4">
      <div className="relative size-[42px] shrink-0">
        {item.target?.accessible && item.targetUserId ? (
          <Link
            href={`/profile/${item.targetUserId}`}
            aria-label={`View ${item.target.name}'s profile`}
          >
            {identity}
          </Link>
        ) : (
          identity
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold leading-5 text-[#0f1419]">
          {title}
        </p>
        <p className="mt-0.5 truncate text-[13px] leading-5 text-[#536471]">
          {description}
        </p>
        <time
          dateTime={item.createdAt}
          className="mt-1 block text-[11px] text-[#7b8791] md:hidden"
        >
          {friendlyTime(item.createdAt)}
        </time>
      </div>
      <div className="hidden shrink-0 items-center gap-3 md:flex">
        <time
          dateTime={item.createdAt}
          className="whitespace-nowrap text-[11px] text-[#7b8791]"
        >
          {friendlyTime(item.createdAt)}
        </time>
        {badge ? (
          <span
            className={`min-w-[68px] rounded-full px-2.5 py-1 text-center text-[10px] font-semibold ${badgeTone(badge)}`}
          >
            {badge}
          </span>
        ) : (
          <span className="w-[68px]" />
        )}
      </div>
      {badge ? (
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold md:hidden ${badgeTone(badge)}`}
        >
          {badge}
        </span>
      ) : null}
    </article>
  );
}
function ActivitySkeleton() {
  return (
    <div aria-label="Loading activity" aria-busy="true">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="flex min-h-[74px] animate-pulse items-center gap-3 border-b border-[#eff3f4] px-3.5 py-2.5 last:border-b-0 md:px-5"
        >
          <span className="size-[42px] rounded-full bg-[#eff3f4]" />
          <span className="flex-1">
            <span className="block h-3 w-2/5 rounded bg-[#eff3f4]" />
            <span className="mt-3 block h-2.5 w-3/5 rounded bg-[#f3f5f6]" />
            <span className="mt-3 block h-2 w-20 rounded bg-[#f3f5f6]" />
          </span>
        </div>
      ))}
    </div>
  );
}
function EmptyState() {
  return (
    <div className="px-5 py-14 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#f2f3f5] text-[#536471]">
        <Clock3 size={22} />
      </span>
      <h2 className="mt-4 text-[16px] font-semibold text-[#0f1419]">
        No recent activity
      </h2>
      <p className="mx-auto mt-1 max-w-sm text-[12px] leading-5 text-[#536471]">
        Your profile views, requests, messages and account activity will appear
        here.
      </p>
      <Link
        href="/discover"
        className="mx-auto mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-black px-5 text-[12px] font-semibold text-white hover:bg-[#222]"
      >
        Discover Profiles <ArrowRight size={14} />
      </Link>
    </div>
  );
}
