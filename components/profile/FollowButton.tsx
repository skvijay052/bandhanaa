"use client";

import { useState } from "react";
import type { RelationshipUIState } from "@/data/profile";

export function FollowButton({ status, profileName, onFollow, onCancelRequest, onConfirmRequest, onDeleteRequest, onUnfollow, className = "" }: {
  status: RelationshipUIState;
  profileName: string;
  onFollow: () => Promise<void>;
  onCancelRequest: () => Promise<void>;
  onConfirmRequest: () => Promise<void>;
  onDeleteRequest: () => Promise<void>;
  onUnfollow: () => Promise<void>;
  className?: string;
}) {
  const [confirmation, setConfirmation] = useState<"cancel" | "unfollow" | null>(null);
  const [loading, setLoading] = useState(false);
  const act = async (action: () => Promise<void>) => {
    setLoading(true);
    await action();
    setLoading(false);
    setConfirmation(null);
  };
  return (
    <div className={`relative ${className}`}>
      {status === "none" ? (
        <button type="button" disabled={loading} onClick={() => void act(onFollow)} className="h-11 w-full rounded-lg bg-[#1d9bf0] px-6 text-[14px] font-semibold text-white hover:bg-[#1689df] disabled:opacity-60">
          {loading ? "Please wait…" : "Follow"}
        </button>
      ) : status === "outgoing_pending" ? (
        <button type="button" disabled={loading} onClick={() => setConfirmation("cancel")} className="group h-11 w-full rounded-lg border border-[#cfd9de] bg-white px-6 text-[14px] font-semibold text-[#0f1419] hover:bg-[#f7f9f9] disabled:opacity-60">
          <span className="group-hover:hidden">Requested</span><span className="hidden group-hover:inline">Cancel request</span>
        </button>
      ) : status === "incoming_pending" ? (
        <div className="flex w-full gap-2">
          <button type="button" disabled={loading} onClick={() => void act(onConfirmRequest)} className="h-11 flex-1 rounded-lg bg-[#1d9bf0] px-5 text-[14px] font-semibold text-white hover:bg-[#1689df] disabled:opacity-60">
            {loading ? "Please waitâ€¦" : "Accept Request"}
          </button>
          <button type="button" disabled={loading} onClick={() => void act(onDeleteRequest)} className="h-11 flex-1 rounded-lg border border-[#cfd9de] bg-white px-5 text-[14px] font-semibold text-[#0f1419] hover:bg-[#f7f9f9] disabled:opacity-60">
            Delete
          </button>
        </div>
      ) : (
        <button type="button" disabled={loading} onClick={() => setConfirmation("unfollow")} className="group h-11 w-full rounded-lg border border-[#cfd9de] bg-white px-6 text-[14px] font-semibold text-[#0f1419] hover:border-[#f5c2c7] hover:bg-[#fff5f5] hover:text-[#c62828] disabled:opacity-60">
          <span className="group-hover:hidden">Following</span><span className="hidden group-hover:inline">Unfollow</span>
        </button>
      )}
      {confirmation ? (
        <div className="absolute left-0 top-[52px] z-50 w-[290px] rounded-xl border border-[var(--border)] bg-white p-4 text-left shadow-[0_10px_35px_rgba(15,20,25,.16)]">
          <strong className="block text-[15px] font-semibold">{confirmation === "cancel" ? "Cancel follow request?" : `Unfollow ${profileName}?`}</strong>
          {confirmation === "unfollow" ? <p className="mt-1 text-[12px] font-normal text-[var(--text-secondary)]">You&apos;ll stop following this profile.</p> : null}
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setConfirmation(null)} className="h-9 rounded-lg bg-[#eff3f4] px-4 text-[13px] font-semibold text-[#0f1419]">{confirmation === "cancel" ? "Keep request" : "Cancel"}</button>
            <button type="button" disabled={loading} onClick={() => void act(confirmation === "cancel" ? onCancelRequest : onUnfollow)} className="h-9 rounded-lg bg-[#0f1419] px-4 text-[13px] font-semibold text-white disabled:opacity-60">{confirmation === "cancel" ? "Cancel request" : "Unfollow"}</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
