"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { Gift, X } from "lucide-react";

export function ReferralRewardToast({ onClose }: { onClose: () => void }) {
  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 top-5 z-[500] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-[18px] border border-[#f2c9dc] bg-[#fff7fb] px-4 py-3 text-[#171717] shadow-lg"
    >
      <Gift size={22} className="shrink-0 text-[#e83e78]" aria-hidden="true" />
      <Link href="/messages" className="text-[13px] font-semibold">
        You earned 10 message credits
      </Link>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss reward notification"
        className="ml-auto grid size-8 shrink-0 place-items-center rounded-full hover:bg-white"
      >
        <X size={16} />
      </button>
    </div>,
    document.body,
  );
}
