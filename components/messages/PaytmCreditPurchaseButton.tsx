"use client";

import { useState } from "react";
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
    redirect: true;
    callbackUrl: string;
  };
  payMode: {
    order: string[];
  };
  handler: {
    notifyMerchant: (eventName: string, data: unknown) => void;
  };
};

type PaytmCheckout = {
  onLoad: (callback: () => void) => void;
  init: (config: CheckoutConfig) => Promise<unknown>;
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
  callbackUrl?: string;
  checkoutScriptUrl?: string;
};

async function loadPaytmCheckout(scriptUrl: string) {
  if (!window.Paytm?.CheckoutJS) {
    document
      .querySelector<HTMLScriptElement>(
        'script[data-bandhanaa-paytm-checkout="true"]',
      )
      ?.remove();

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = scriptUrl;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.dataset.bandhanaaPaytmCheckout = "true";
      script.addEventListener("load", () => resolve(), { once: true });
      script.addEventListener(
        "error",
        () => reject(new Error("Paytm checkout could not be loaded.")),
        { once: true },
      );
      document.head.appendChild(script);
    });
  }

  const checkout = window.Paytm?.CheckoutJS;
  if (!checkout) throw new Error("Paytm checkout is unavailable.");

  await new Promise<void>((resolve) => checkout.onLoad(resolve));
  return checkout;
}

async function readJson<T>(response: Response) {
  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}

export function PaytmCreditPurchaseButton({
  onStatus,
}: {
  onStatus: (message: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  const startPayment = async () => {
    if (busy) return;
    setBusy(true);
    onStatus("Preparing secure Paytm UPI checkout…");

    try {
      const response = await fetch("/api/paytm/create-order", {
        method: "POST",
      });
      const order = await readJson<CreateOrderResponse>(response);

      if (
        !response.ok ||
        !order.ok ||
        !order.mid ||
        !order.orderId ||
        !order.txnToken ||
        !order.amount ||
        !order.callbackUrl ||
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
          redirect: true,
          callbackUrl: order.callbackUrl,
        },
        // Keep UPI first for Bandhanaa's INR 10 mobile credit pack.
        payMode: {
          order: ["UPI", "CARD", "NB"],
        },
        handler: {
          notifyMerchant: (eventName) => {
            if (eventName === "APP_CLOSED") {
              onStatus(
                "Payment window closed. No credits are added until Paytm confirms payment.",
              );
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
