"use client";

import { useCallback, useEffect, useState } from "react";
import { CreditCard, MessageCircle, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ReferralShareModal } from "@/components/referrals/ReferralShareModal";

export function MessageCreditBalance({ userId }: { userId: string }) {
  const [summary, setSummary] = useState<{
    available_credits: number;
    requires_credit: boolean;
  } | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState("");

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

  const credits = summary?.available_credits ?? 0;
  const empty = Boolean(summary?.requires_credit && credits <= 0);
  const description = !summary
    ? "Checking your message credits…"
    : empty
      ? "You’ve used all your message credits. Keep the conversation going!"
      : summary.requires_credit
        ? "1 credit is used for each outgoing message. Incoming messages are free."
        : "Your current free messaging access continues. Credits are saved for messages that require them.";

  return (
    <>
      <div className="message-credit-balance flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-[#f3dce6] bg-[#fff7fb] px-4 py-2 text-[11px] text-[#171717]">
        <span className="message-credit-heading inline-flex items-center gap-1.5">
          <span className="message-credit-icon grid size-7 shrink-0 place-items-center rounded-full bg-[#fff0f7] text-[#e83e78]">
            <MessageCircle size={14} aria-hidden="true" />
          </span>
          <span aria-live="polite" className="message-credit-title">
            <strong>{credits}</strong> message credits
          </span>
        </span>

        <div className="message-credit-actions flex items-center gap-2">
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            aria-haspopup="dialog"
            className="message-credit-invite inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#eadfe4] bg-white px-3 py-2 font-semibold text-[#171717] focus-visible:outline-[#e83e78]"
          >
            <Users size={15} aria-hidden="true" />
            <span>Invite &amp; get 10 free</span>
          </button>
          <button
            type="button"
            onClick={() =>
              setPaymentNotice(
                "Online message-credit purchase is not enabled yet.",
              )
            }
            className="message-credit-pay inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#121820] px-3 py-2 font-semibold text-white"
            aria-describedby="message-credit-payment-notice"
          >
            <CreditCard size={15} aria-hidden="true" />
            <span>Pay ₹10 for 10</span>
          </button>
        </div>

        <span className="message-credit-description basis-full text-[10px] text-[#747076]">
          {description}
        </span>
        {paymentNotice ? (
          <span
            id="message-credit-payment-notice"
            role="status"
            aria-live="polite"
            className="message-credit-payment-notice basis-full text-[10px] text-[#9a526f]"
          >
            {paymentNotice}
          </span>
        ) : null}
      </div>
      {inviteOpen ? (
        <ReferralShareModal onClose={() => setInviteOpen(false)} />
      ) : null}
    </>
  );
}
