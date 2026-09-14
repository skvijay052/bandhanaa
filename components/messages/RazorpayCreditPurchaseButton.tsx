"use client";

import { useState } from "react";
import { CreditCard, LoaderCircle } from "lucide-react";

type CreateOrderResponse = {
  ok?: boolean;
  message?: string;
  keyId?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  credits?: number;
  email?: string;
};

type VerifyResponse = {
  ok?: boolean;
  message?: string;
  status?: "success" | "pending" | "failed";
  availableCredits?: number;
  creditsAdded?: number;
};

type CheckoutSuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: CheckoutSuccess) => void;
  prefill?: { email?: string };
  theme?: { color?: string };
  modal?: {
    confirm_close?: boolean;
    ondismiss?: () => void;
  };
  retry?: { enabled: boolean };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", callback: (response: any) => void) => void;
};

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

async function loadRazorpayCheckout() {
  if (window.Razorpay) return window.Razorpay;

  const existing = document.querySelector<HTMLScriptElement>(
    'script[data-bandhanaa-razorpay="true"]',
  );

  await new Promise<void>((resolve, reject) => {
    const script = existing ?? document.createElement("script");
    const loaded = () => {
      cleanup();
      resolve();
    };
    const failed = () => {
      cleanup();
      reject(new Error("Razorpay checkout could not be loaded."));
    };
    const cleanup = () => {
      script.removeEventListener("load", loaded);
      script.removeEventListener("error", failed);
    };

    script.addEventListener("load", loaded, { once: true });
    script.addEventListener("error", failed, { once: true });

    if (!existing) {
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.dataset.bandhanaaRazorpay = "true";
      document.head.appendChild(script);
    } else if (window.Razorpay) {
      loaded();
    }
  });

  if (!window.Razorpay) throw new Error("Razorpay checkout is unavailable.");
  return window.Razorpay;
}

async function readJson<T>(response: Response) {
  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}

export function RazorpayCreditPurchaseButton({
  onSuccess,
  onStatus,
}: {
  onSuccess: () => void | Promise<void>;
  onStatus: (message: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  const verifyPayment = async (payment: CheckoutSuccess) => {
    onStatus("Verifying your Razorpay payment…");
    try {
      const response = await fetch("/api/razorpay/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          orderId: payment.razorpay_order_id,
          paymentId: payment.razorpay_payment_id,
          signature: payment.razorpay_signature,
        }),
      });
      const result = await readJson<VerifyResponse>(response);

      if (!response.ok || !result.ok) {
        throw new Error(result.message ?? "We couldn't verify the payment yet.");
      }

      if (result.status === "success") {
        onStatus(
          `Payment successful. ${result.creditsAdded ?? 10} message credits added.`,
        );
        window.dispatchEvent(new Event("bandhanaa-message-credits-changed"));
        await onSuccess();
      } else if (result.status === "pending") {
        onStatus(
          "Payment is still processing. Credits will be added after Razorpay confirms capture.",
        );
      } else {
        onStatus(result.message ?? "Payment was not successful. No credits were added.");
      }
    } catch (error) {
      onStatus(
        error instanceof Error
          ? error.message
          : "We couldn't verify the payment yet.",
      );
    } finally {
      setBusy(false);
    }
  };

  const startPayment = async () => {
    if (busy) return;
    setBusy(true);
    onStatus("Preparing secure Razorpay checkout…");

    try {
      const response = await fetch("/api/razorpay/create-order", {
        method: "POST",
      });
      const order = await readJson<CreateOrderResponse>(response);

      if (
        !response.ok ||
        !order.ok ||
        !order.keyId ||
        !order.orderId ||
        !order.amount ||
        !order.currency
      ) {
        throw new Error(order.message ?? "We couldn't start the payment.");
      }

      const Razorpay = await loadRazorpayCheckout();
      const checkout = new Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Bandhanaa",
        description: "10 message credits",
        order_id: order.orderId,
        handler: (payment) => {
          void verifyPayment(payment);
        },
        prefill: order.email ? { email: order.email } : undefined,
        theme: { color: "#e83e78" },
        retry: { enabled: true },
        modal: {
          confirm_close: true,
          ondismiss: () => {
            onStatus(
              "Payment window closed. No credits are added unless Razorpay confirms a successful payment.",
            );
            setBusy(false);
          },
        },
      });

      checkout.on("payment.failed", (failure) => {
        const description = failure?.error?.description;
        onStatus(
          typeof description === "string" && description
            ? description
            : "Payment failed. No message credits were added.",
        );
        setBusy(false);
      });

      onStatus(
        "Complete the ₹10 payment securely with Razorpay. Choose UPI for Google Pay, PhonePe or another UPI app.",
      );
      checkout.open();
    } catch (error) {
      setBusy(false);
      onStatus(
        error instanceof Error
          ? error.message
          : "We couldn't start the payment. Please try again.",
      );
    }
  };

  return (
    <button
      type="button"
      onClick={() => void startPayment()}
      disabled={busy}
      className="message-credit-pay inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl bg-[#121820] px-2.5 text-[11px] font-semibold text-white transition hover:bg-black disabled:cursor-wait disabled:opacity-70"
      aria-describedby="message-credit-payment-notice"
      aria-busy={busy}
    >
      {busy ? (
        <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
      ) : (
        <CreditCard size={14} aria-hidden="true" />
      )}
      <span>{busy ? "Opening Razorpay…" : "₹10 for 10 messages"}</span>
    </button>
  );
}
