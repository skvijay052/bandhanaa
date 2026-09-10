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
      ? "No credits left. Choose an option below to keep chatting."
      : summary.requires_credit
        ? "1 credit is used for each outgoing message."
        : "Your current free messaging access continues.";

  return (
    <>
      <div className="message-credit-balance w-full overflow-hidden rounded-[16px] border border-[#f4dbe6] bg-[#fff7fa] px-3 py-2.5 text-[#171717] shadow-none">
        <div className="flex items-center gap-2.5">
          <span className="message-credit-icon grid size-8 shrink-0 place-items-center rounded-full bg-[#ffe8f2] text-[#f43f93]">
            <MessageCircle size={15} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span aria-live="polite" className="message-credit-title text-[13px] font-semibold">
                <strong className="text-[#f43f93]">{credits}</strong> message credits
              </span>
              <span className="shrink-0 text-[10px] font-semibold text-[#b82e63]">
                Get 10 more messages
              </span>
            </div>
            <p className="message-credit-description mt-0.5 truncate text-[10px] text-[#747076]">
              {description}
            </p>
          </div>
        </div>

        <div className="message-credit-actions mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            aria-haspopup="dialog"
            className="message-credit-invite inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-[#eadfe4] bg-white px-2.5 text-[11px] font-semibold text-[#171717] transition hover:bg-[#fff8fb] focus-visible:outline-[#e83e78]"
          >
            <Users size={14} className="text-[#f43f93]" aria-hidden="true" />
            <span>Invite &amp; get 10 free</span>
          </button>
          <button
            type="button"
            onClick={() =>
              setPaymentNotice(
                "Online message-credit purchase is not enabled yet.",
              )
            }
            className="message-credit-pay inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl bg-[#121820] px-2.5 text-[11px] font-semibold text-white transition hover:bg-black"
            aria-describedby="message-credit-payment-notice"
          >
            <CreditCard size={14} aria-hidden="true" />
            <span>₹10 for 10 messages</span>
          </button>
        </div>

        {paymentNotice ? (
          <p
            id="message-credit-payment-notice"
            role="status"
            aria-live="polite"
            className="message-credit-payment-notice mt-1.5 text-center text-[9px] text-[#9a526f]"
          >
            {paymentNotice}
          </p>
        ) : null}
      </div>
      {inviteOpen ? (
        <ReferralShareModal onClose={() => setInviteOpen(false)} />
      ) : null}
    </>
  );
}
