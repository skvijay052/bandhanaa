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
    try { await action(); } finally { setLoading(false); setConfirmation(null); }
  };
  const title = confirmation === "cancel" ? "Cancel follow request?" : `Remove ${profileName} from Following?`;
  const description = confirmation === "cancel" ? `Your request to ${profileName} will be cancelled.` : `You will stop following ${profileName}.`;
  const actionLabel = confirmation === "cancel" ? "Cancel Request" : "Remove Following";
  const pinkButtonClass = "h-11 w-full rounded-lg !border !border-[#f7b4d5] !bg-[#fff3f9] px-6 text-[14px] font-semibold !text-[#e33d92] transition hover:!bg-[#ffe8f3] disabled:opacity-60";

  return (
    <div className={`relative ${className}`}>
      {status === "none" ? (
        <button type="button" disabled={loading} onClick={() => void act(onFollow)} className={pinkButtonClass}>
          {loading ? "Please wait…" : "Send Request"}
        </button>
      ) : status === "outgoing_pending" ? (
        <button type="button" disabled={loading} onClick={() => setConfirmation("cancel")} className={pinkButtonClass}>
          Requested
        </button>
      ) : status === "incoming_pending" ? (
        <div className="flex w-full gap-2">
          <button type="button" disabled={loading} onClick={() => void act(onConfirmRequest)} className="h-11 flex-1 rounded-lg !border !border-[#f7b4d5] !bg-[#fff3f9] px-5 text-[14px] font-semibold !text-[#e33d92] transition hover:!bg-[#ffe8f3] disabled:opacity-60">
            {loading ? "Please wait…" : "Accept Request"}
          </button>
          <button type="button" disabled={loading} onClick={() => void act(onDeleteRequest)} className="h-11 flex-1 rounded-lg border border-[#cfd9de] bg-white px-5 text-[14px] font-semibold text-[#0f1419] disabled:opacity-60">Delete</button>
        </div>
      ) : (
        <button type="button" disabled={loading} onClick={() => setConfirmation("unfollow")} className={pinkButtonClass}>
          Following
        </button>
      )}

      {confirmation ? (
        <>
          <div className="fixed inset-0 z-[190] bg-black/35 backdrop-blur-[1px] md:hidden" onClick={() => !loading && setConfirmation(null)} aria-hidden="true" />
          <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-x-0 bottom-0 z-[200] rounded-t-[28px] bg-white px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-18px_55px_rgba(15,20,25,.18)] md:absolute md:left-0 md:top-[52px] md:bottom-auto md:w-[310px] md:rounded-xl md:border md:border-[var(--border)] md:p-4 md:shadow-[0_10px_35px_rgba(15,20,25,.16)]">
            <span className="mx-auto mb-4 block h-1.5 w-11 rounded-full bg-[#d9dde4] md:hidden" />
            <strong className="block text-[17px] font-semibold text-[#0f1419] md:text-[15px]">{title}</strong>
            <p className="mt-1.5 text-[13px] leading-5 text-[var(--text-secondary)] md:text-[12px]">{description}</p>
            <div className="mt-5 grid gap-2.5 md:flex md:justify-end md:gap-2">
              <button type="button" disabled={loading} onClick={() => void act(confirmation === "cancel" ? onCancelRequest : onUnfollow)} className="h-12 rounded-xl !border !border-[#f7b4d5] !bg-[#fff3f9] px-4 text-[14px] font-semibold !text-[#e33d92] transition hover:!bg-[#ffe8f3] disabled:opacity-60 md:h-9 md:rounded-lg md:text-[13px]">{loading ? "Please wait…" : actionLabel}</button>
              <button type="button" disabled={loading} onClick={() => setConfirmation(null)} className="h-12 rounded-xl bg-[#f4f5f6] px-4 text-[14px] font-semibold text-[#0f1419] disabled:opacity-60 md:h-9 md:rounded-lg md:text-[13px]">Keep {confirmation === "cancel" ? "Request" : "Following"}</button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
