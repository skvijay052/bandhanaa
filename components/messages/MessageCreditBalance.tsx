"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ReferralShareModal } from "@/components/referrals/ReferralShareModal";

export function MessageCreditBalance({ userId }: { userId: string }) {
  const [summary, setSummary] = useState<{
    available_credits: number;
    requires_credit: boolean;
  } | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const refresh = useCallback(async () => {
    const { data, error } = await createClient().rpc(
      "get_message_credit_summary",
    );
    if (!error && data?.[0]) setSummary(data[0]);
  }, []);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    const refreshActive = () => {
      if (active) void refresh();
    };
    const channel = supabase
      .channel(`message-credits:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_credit_wallets",
          filter: `user_id=eq.${userId}`,
        },
        refreshActive,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_credit_access",
          filter: `user_id=eq.${userId}`,
        },
        refreshActive,
      )
      .subscribe(refreshActive);
    refreshActive();
    window.addEventListener("bandhanaa-message-sent", refreshActive);
    window.addEventListener("focus", refreshActive);
    return () => {
      active = false;
      window.removeEventListener("bandhanaa-message-sent", refreshActive);
      window.removeEventListener("focus", refreshActive);
      void supabase.removeChannel(channel);
    };
  }, [userId, refresh]);

  if (!summary) return null;
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-[#f3dce6] bg-[#fff7fb] px-4 py-2 text-[11px] text-[#171717]">
        <span className="inline-flex items-center gap-1.5">
          <MessageCircle
            size={14}
            className="text-[#e83e78]"
            aria-hidden="true"
          />
          <span aria-live="polite">
            <strong>{summary.available_credits}</strong> message credits
          </span>
        </span>
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          aria-haspopup="dialog"
          className="rounded py-1 font-semibold text-[#b82e63] focus-visible:outline-[#e83e78]"
        >
          Invite &amp; earn 10
        </button>
        <span className="basis-full text-[10px] text-[#747076]">
          {summary.requires_credit
            ? "1 credit per outgoing message. Incoming messages are free."
            : "Your current free messaging access continues. Credits are saved for messages that require them."}
        </span>
      </div>
      {inviteOpen ? (
        <ReferralShareModal onClose={() => setInviteOpen(false)} />
      ) : null}
    </>
  );
}
