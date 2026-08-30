"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, MapPin, MessageSquare } from "lucide-react";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DesktopTopBar } from "@/components/layout/DesktopTopBar";
import { MobileBottomNavigation } from "@/components/layout/MobileBottomNavigation";
import { ProfileImage } from "@/components/ui/ProfileImage";
import type { InterestProfile } from "@/data/interests";
import { createClient } from "@/lib/supabase/client";

export type RequestTab = "received" | "sent" | "following";
const tabs: Array<{ id: RequestTab; label: string }> = [{ id: "received", label: "Received" }, { id: "sent", label: "Sent" }, { id: "following", label: "Following" }];

export function RequestsClient({ currentUserId, initialReceived, initialSent, initialFollowing, initialTab, viewerName, avatarUrl }: {
  currentUserId: string; initialReceived: InterestProfile[]; initialSent: InterestProfile[]; initialFollowing: InterestProfile[]; initialTab: RequestTab; viewerName: string; avatarUrl: string;
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [received, setReceived] = useState(initialReceived);
  const [sent, setSent] = useState(initialSent);
  const [following, setFollowing] = useState(initialFollowing);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const profiles = activeTab === "received" ? received : activeTab === "sent" ? sent : following;

  async function accept(profile: InterestProfile) {
    setBusyId(profile.id);
    const { error } = await createClient().from("profile_likes").update({ status: "accepted", responded_at: new Date().toISOString() }).eq("liker_id", profile.profileId).eq("liked_id", currentUserId).eq("status", "pending");
    if (error) setNotice("We couldn't accept this request. Please try again.");
    else { setReceived((items) => items.filter((item) => item.id !== profile.id)); setFollowing((items) => [profile, ...items]); setNotice(`${profile.name} is now following with you.`); }
    setBusyId(null);
  }
  async function remove(profile: InterestProfile, kind: "received" | "sent" | "following") {
    if (kind === "sent" && !window.confirm(`Cancel follow request to ${profile.name}?`)) return;
    if (kind === "following" && !window.confirm(`Unfollow ${profile.name}?\n\nYou'll stop following this profile.`)) return;
    setBusyId(profile.id);
    const { error } = await createClient().from("profile_likes").delete().or(`and(liker_id.eq.${currentUserId},liked_id.eq.${profile.profileId}),and(liker_id.eq.${profile.profileId},liked_id.eq.${currentUserId})`);
    if (error) setNotice("We couldn't update this request. Please try again.");
    else {
      if (kind === "received") setReceived((items) => items.filter((item) => item.id !== profile.id));
      if (kind === "sent") setSent((items) => items.filter((item) => item.id !== profile.id));
      if (kind === "following") setFollowing((items) => items.filter((item) => item.id !== profile.id));
      setNotice(kind === "received" ? "Request deleted." : kind === "sent" ? "Follow request cancelled." : `You unfollowed ${profile.name}.`);
    }
    setBusyId(null);
  }

  return <div className="min-h-dvh bg-white"><div className="app-shell">
    <AppSidebar active="Requests" />
    <div className="app-workspace min-w-0 flex-1 pb-[72px] md:pb-0"><DesktopTopBar avatarUrl={avatarUrl} name={viewerName} /><div className="md:hidden"><AppHeader avatarUrl={avatarUrl} name={viewerName} /></div>
      <main className="w-full"><header className="border-b border-[#eff3f4] px-5 py-5 md:px-8"><h1 className="text-[24px] font-bold tracking-[-.02em] text-[#0f1419]">Requests</h1><p className="mt-1 text-[14px] text-[#536471]">Manage your follow requests and connections</p></header>
        <div className="border-b border-[#eff3f4] px-5 md:px-8"><div className="flex gap-9" role="tablist">{tabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} onClick={() => { setActiveTab(tab.id); setNotice(""); }} className={`relative h-14 text-[14px] font-semibold ${activeTab === tab.id ? "text-[#0f1419] after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:rounded-full after:bg-[#1d9bf0]" : "text-[#536471]"}`}>{tab.label}{tab.id === "received" && received.length ? <span className="ml-2 rounded-full bg-[#1d9bf0] px-2 py-0.5 text-[11px] text-white">{received.length}</span> : null}</button>)}</div></div>
        {notice ? <p role="status" className="mx-5 mt-4 rounded-lg bg-[#e8f5fe] px-4 py-3 text-[13px] text-[#0f5f99] md:mx-8">{notice}</p> : null}
        <section aria-label={`${activeTab} requests`} className="px-5 md:px-8">{profiles.length ? profiles.map((profile) => <RequestRow key={profile.id} profile={profile} kind={activeTab} busy={busyId === profile.id} onAccept={() => void accept(profile)} onRemove={() => void remove(profile, activeTab)} />) : <div className="py-20 text-center"><p className="text-[16px] font-semibold text-[#0f1419]">No {activeTab} profiles</p><p className="mt-1 text-[14px] text-[#536471]">New activity will appear here.</p></div>}</section>
      </main>
    </div><MobileBottomNavigation active="Requests" />
  </div></div>;
}

function RequestRow({ profile, kind, busy, onAccept, onRemove }: { profile: InterestProfile; kind: RequestTab; busy: boolean; onAccept: () => void; onRemove: () => void }) {
  return <article className="flex items-center gap-4 border-b border-[#eff3f4] py-5 max-sm:items-start"><Link href={`/profile/${profile.profileId}`} className="relative size-20 shrink-0 overflow-hidden rounded-full"><ProfileImage src={profile.image} alt={profile.name} fill sizes="80px" className="object-cover" /></Link>
    <div className="min-w-0 flex-1"><Link href={`/profile/${profile.profileId}`} className="inline-flex items-center gap-1 text-[16px] font-bold text-[#0f1419]">{profile.name}, {profile.age}{profile.verified ? <BadgeCheck size={17} className="fill-[#1d9bf0] text-[#1d9bf0] [&>path:last-child]:text-white" /> : null}</Link><p className="mt-1 text-[14px] text-[#536471]">{profile.occupation}</p><p className="mt-1 flex items-center gap-1 text-[13px] text-[#536471]"><MapPin size={14} />{profile.location} <span aria-hidden>·</span> <span className="font-semibold text-[#1d9bf0]">{profile.compatibility ?? 85}% Match</span></p>{kind === "received" ? <p className="mt-2 text-[13px] text-[#536471]">{profile.name} wants to connect with you.</p> : null}</div>
    <div className="flex shrink-0 items-center gap-2 self-center max-sm:flex-col">{kind === "received" ? <><button disabled={busy} onClick={onAccept} className="h-10 rounded-full bg-[#1d9bf0] px-5 text-[14px] font-semibold text-white disabled:opacity-50">Accept Request</button><button disabled={busy} onClick={onRemove} className="h-10 rounded-full border border-[#cfd9de] bg-white px-5 text-[14px] font-semibold text-[#0f1419] disabled:opacity-50">Delete</button></> : kind === "sent" ? <button disabled={busy} onClick={onRemove} className="h-10 rounded-full border border-[#cfd9de] bg-white px-5 text-[14px] font-semibold text-[#0f1419] disabled:opacity-50">Requested</button> : <><button disabled={busy} onClick={onRemove} className="h-10 rounded-full border border-[#cfd9de] bg-white px-5 text-[14px] font-semibold text-[#0f1419] disabled:opacity-50">Following</button><Link href="/messages" className="flex h-10 items-center gap-2 rounded-full bg-[#1d9bf0] px-5 text-[14px] font-semibold text-white"><MessageSquare size={16} />Message</Link></>}</div>
  </article>;
}
