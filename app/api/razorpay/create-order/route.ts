import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { createRazorpayOrder, getRazorpayConfig, MESSAGE_CREDIT_PACK } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return jsonError("Your session has expired. Please sign in again.", 401);
  }

  try {
    const config = getRazorpayConfig();
    const admin = createAdminClient();
    const receipt = `BNDMSG_${Date.now()}_${randomUUID()
      .replaceAll("-", "")
      .slice(0, 10)}`;

    const order = await createRazorpayOrder({ receipt, userId: user.id });
    if (
      !order.id ||
      order.amount !== MESSAGE_CREDIT_PACK.amountPaise ||
      order.currency !== MESSAGE_CREDIT_PACK.currency
    ) {
      throw new Error("Razorpay returned an invalid credit order.");
    }

    const { error: purchaseError } = await admin
      .from("message_credit_purchases")
      .insert({
        user_id: user.id,
        provider: "razorpay",
        order_id: order.id,
        razorpay_order_id: order.id,
        amount_paise: MESSAGE_CREDIT_PACK.amountPaise,
        credits: MESSAGE_CREDIT_PACK.credits,
        status: "pending",
        provider_result_code: order.status ?? "created",
        provider_result_message: "Razorpay order created",
        provider_payload: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt ?? receipt,
          status: order.status ?? null,
          createdAt: order.created_at ?? null,
        },
      });

    if (purchaseError) {
      console.error("Razorpay purchase row creation failed", {
        userId: user.id,
        orderId: order.id,
        code: purchaseError.code,
      });
      return jsonError(
        "Payment setup is incomplete. Apply the Razorpay Supabase migration first.",
        503,
      );
    }

    return NextResponse.json({
      ok: true,
      keyId: config.keyId,
      orderId: order.id,
      amount: MESSAGE_CREDIT_PACK.amountPaise,
      currency: MESSAGE_CREDIT_PACK.currency,
      credits: MESSAGE_CREDIT_PACK.credits,
      email: user.email ?? "",
    });
  } catch (error) {
    console.error("Razorpay create-order failed", {
      userId: user.id,
      error: error instanceof Error ? error.message : "UnknownError",
    });

    return jsonError(
      error instanceof Error &&
        (error.message.includes("not configured") ||
          error.message.includes("payment administration"))
        ? "Razorpay is not configured yet. Add the Razorpay and Supabase server credentials first."
        : "We couldn't start the payment. Please try again.",
      503,
    );
  }
}
