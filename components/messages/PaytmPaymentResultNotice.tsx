"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";

type Result = "success" | "pending" | "failed" | "error" | null;

export function PaytmPaymentResultNotice() {
  const [result, setResult] = useState<Result>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const payment = url.searchParams.get("payment") as Result;
    if (!["success", "pending", "failed", "error"].includes(payment ?? "")) {
      return;
    }

    setResult(payment);
    url.searchParams.delete("payment");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);

    if (payment === "success") {
      window.dispatchEvent(new Event("bandhanaa-message-credits-changed"));
    }

    const timer = window.setTimeout(() => setResult(null), 6500);
    return () => window.clearTimeout(timer);
  }, []);

  if (!result) return null;

  const success = result === "success";
  const pending = result === "pending";
  const Icon = success ? CheckCircle2 : pending ? Clock3 : XCircle;
  const message = success
    ? "Payment successful — 10 message credits added."
    : pending
      ? "Payment is pending. Credits will be added after Paytm confirms it."
      : result === "failed"
        ? "Payment was not successful. No credits were added."
        : "We couldn't confirm the payment. If money was debited, Paytm verification will protect your credits.";

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-3 top-3 z-[220] mx-auto flex max-w-md items-center gap-2.5 rounded-2xl border border-[#eadfe4] bg-white px-4 py-3 text-[12px] font-semibold text-[#312b30] shadow-[0_14px_40px_rgba(35,24,31,0.16)] md:left-auto md:right-5 md:top-5 md:mx-0"
    >
      <Icon
        size={18}
        className={
          success
            ? "text-emerald-600"
            : pending
              ? "text-amber-600"
              : "text-[#d83370]"
        }
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1">{message}</span>
      <button
        type="button"
        onClick={() => setResult(null)}
        className="shrink-0 rounded-full px-2 py-1 text-[11px] text-[#756b72] hover:bg-[#f7f2f4]"
        aria-label="Dismiss payment status"
      >
        Close
      </button>
    </div>
  );
}
