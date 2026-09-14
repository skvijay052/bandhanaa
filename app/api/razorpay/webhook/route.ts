import { NextResponse } from "next/server";

import { reconcileRazorpayMessageCreditPurchase } from "@/lib/razorpay-purchases";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";

export const runtime = "nodejs";

type RazorpayWebhook = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string | null;
      };
    };
  };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  try {
    if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
      return NextResponse.json(
        { ok: false, message: "Invalid Razorpay webhook signature." },
        { status: 400 },
      );
    }

    const event = JSON.parse(rawBody) as RazorpayWebhook;
    const payment = event.payload?.payment?.entity;
    const paymentId = payment?.id?.trim();
    const orderId = payment?.order_id?.trim();

    // payment.authorized lets Bandhanaa capture immediately when auto-capture
    // has not completed yet. payment.captured is the normal final-state event.
    if (
      paymentId &&
      orderId &&
      (event.event === "payment.authorized" ||
        event.event === "payment.captured")
    ) {
      const result = await reconcileRazorpayMessageCreditPurchase(
        orderId,
        paymentId,
      );
      return NextResponse.json({ ok: true, status: result.status });
    }

    return NextResponse.json({ ok: true, ignored: true });
  } catch (error) {
    console.error("Razorpay webhook processing failed", {
      error: error instanceof Error ? error.message : "UnknownError",
    });
    return NextResponse.json(
      { ok: false, message: "Unable to reconcile Razorpay payment." },
      { status: 500 },
    );
  }
}
