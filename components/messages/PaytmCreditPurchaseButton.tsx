"use client";

import { useRef, useState } from "react";
import { CreditCard, LoaderCircle } from "lucide-react";

type CheckoutConfig = {
  root: string;
  flow: string;
  data: {
    orderId: string;
    token: string;
    tokenType: "TXN_TOKEN";
    amount: string;
  };
  merchant: {
    mid: string;
    name: string;
    redirect: false;
  };
  payMode: {
    order: string[];
  };
  handler: {
    transactionStatus: (data: unknown) => void;
    notifyMerchant: (eventName: string, data: unknown) => void;
  };
};

type PaytmCheckout = {
  init: (config: CheckoutConfig) => Promise<void>;
  invoke: () => void;
};

declare global {
  interface Window {
    Paytm?: {
      CheckoutJS?: PaytmCheckout;
    };
  }
}

type CreateOrderResponse = {
  ok?: boolean;
  message?: string;
  mid?: string;
  orderId?: string;
  txnToken?: string;
  amount?: string;
  credits?: number;
  checkoutScriptUrl?: string;
};

type VerifyResponse = {
  ok?: boolean;
  message?: string;
  status?: "success" | "pending" | "failed";
  availableCredits?: number;
  creditsAdded?: number;
};

async function loadPaytmCheckout(scriptUrl: string) {
  if (window.Paytm?.CheckoutJS) return window.Paytm.CheckoutJS;

  const existing = document.querySelector<HTMLScriptElement>(
    'script[data-bandhanaa-paytm-checkout="true"]',
  );

  await new Promise<void>((resolve, reject) => {
    const script = existing ?? document.createElement("script");

    const loaded = () => {
      cleanup();
      resolve();
    };
    const failed = () => {
      cleanup();
      reject(new Error("Paytm checkout could not be loaded."));
    };
    const cleanup = () => {
      script.removeEventListener("load", loaded);
      script.removeEventListener("error", failed);
    };

    script.addEventListener("load", loaded, { once: true });
    script.addEventListener("error", failed, { once: true });

    if (!existing) {
      script.src = scriptUrl;
      script.async = true;
      script.dataset.bandhanaaPaytmCheckout = "true";
      document.head.appendChild(script);
    } else if (window.Paytm?.CheckoutJS) {
      loaded();
    }
  });

  if (!window.Paytm?.CheckoutJS) {
    throw new Error("Paytm checkout is unavailable.");
  }

  return window.Paytm.CheckoutJS;
}

async function readJson<T>(response: Response) {
  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}

export function PaytmCreditPurchaseButton({
  onSuccess,
  onStatus,
}: {
  onSuccess: () => void | Promise<void>;
  onStatus: (message: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const verifyingRef = useRef(false);

  const verifyPayment = async (orderId: string) => {
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    onStatus("Verifying your Paytm payment…");

    try {
      const response = await fetch("/api/paytm/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const result = await readJson<VerifyResponse>(response);

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message ?? "We couldn't verify the payment yet.",
        );
      }

      if (result.status === "success") {
        onStatus(
          `Payment successful. ${result.creditsAdded ?? 10} message credits added.`,
        );
        window.dispatchEvent(new Event("bandhanaa-message-credits-changed"));
        await onSuccess();
      } else if (result.status === "pending") {
        onStatus("Payment is still pending. Your credits will be added after Paytm confirms it.");
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
      verifyingRef.current = false;
      setBusy(false);
    }
  };

  const startPayment = async () => {
    if (busy) return;
    setBusy(true);
    onStatus("Preparing secure Paytm UPI checkout…");

    try {
      const response = await fetch("/api/paytm/create-order", {
        method: "POST",
        headers: { "content-type": "application/json" },
      });
      const order = await readJson<CreateOrderResponse>(response);

      if (
        !response.ok ||
        !order.ok ||
        !order.mid ||
        !order.orderId ||
        !order.txnToken ||
        !order.amount ||
        !order.checkoutScriptUrl
      ) {
        throw new Error(order.message ?? "We couldn't start the payment.");
      }

      const checkout = await loadPaytmCheckout(order.checkoutScriptUrl);
      await checkout.init({
        root: "",
        flow: "DEFAULT",
        data: {
          orderId: order.orderId,
          token: order.txnToken,
          tokenType: "TXN_TOKEN",
          amount: order.amount,
        },
        merchant: {
          mid: order.mid,
          name: "Bandhanaa",
          redirect: false,
        },
        // UPI is deliberately first for the INR 10 mobile credit pack.
        payMode: {
          order: ["UPI", "CARD", "NB"],
        },
        handler: {
          transactionStatus: () => {
            void verifyPayment(order.orderId!);
          },
          notifyMerchant: (eventName) => {
            if (eventName === "APP_CLOSED") {
              onStatus("Payment window closed. No credits are added until Paytm confirms payment.");
              setBusy(false);
            }
          },
        },
      });

      onStatus("Complete the ₹10 payment securely with Paytm. UPI is shown first.");
      checkout.invoke();
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
      <span>{busy ? "Opening Paytm…" : "₹10 for 10 messages"}</span>
    </button>
  );
}
