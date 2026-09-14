import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getRazorpayMessageCreditPurchase,
  reconcileRazorpayMessageCreditPurchase,
} from "@/lib/razorpay-purchases";
import { verifyRazorpayCheckoutSignature } from "@/lib/razorpay";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const verifySchema = z.object({
  orderId: z.string().trim().min(8).max(64),
  paymentId: z.string().trim().min(8).max(80),
  signature: z.string().trim().regex(/^[a-f0-9]{64}$/i),
});

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return jsonError("Your session has expired. Please sign in again.", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("A valid Razorpay payment response is required.", 400);
  }

  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("A valid Razorpay payment response is required.", 400);
  }

  try {
    const purchase = await getRazorpayMessageCreditPurchase(parsed.data.orderId);
    if (!purchase || purchase.user_id !== user.id) {
      return jsonError("Payment order was not found.", 404);
    }

    if (
      !verifyRazorpayCheckoutSignature({
        orderId: purchase.order_id,
        paymentId: parsed.data.paymentId,
        signature: parsed.data.signature,
      })
    ) {
      return jsonError("Razorpay payment signature is invalid.", 400);
    }

    const result = await reconcileRazorpayMessageCreditPurchase(
      purchase.order_id,
      parsed.data.paymentId,
    );

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Razorpay payment verification failed", {
      userId: user.id,
      orderId: parsed.data.orderId,
      error: error instanceof Error ? error.message : "UnknownError",
    });
    return jsonError(
      "We couldn't verify this payment yet. If you already paid, your credits will be protected by server verification.",
      502,
    );
  }
}
