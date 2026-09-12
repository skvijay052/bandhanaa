import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import {
  getMessageCreditPurchase,
  reconcilePaytmMessageCreditPurchase,
} from "@/lib/paytm-purchases";

export const runtime = "nodejs";

const verifySchema = z.object({
  orderId: z.string().trim().min(8).max(64),
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
    return jsonError("A valid payment order is required.", 400);
  }

  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("A valid payment order is required.", 400);
  }

  try {
    const purchase = await getMessageCreditPurchase(parsed.data.orderId);
    if (!purchase || purchase.user_id !== user.id) {
      return jsonError("Payment order was not found.", 404);
    }

    const result = await reconcilePaytmMessageCreditPurchase(
      parsed.data.orderId,
    );

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Paytm payment verification failed", {
      userId: user.id,
      orderId: parsed.data.orderId,
      error: error instanceof Error ? error.message : "UnknownError",
    });
    return jsonError(
      "We couldn't verify this payment yet. If you already paid, please try again shortly.",
      502,
    );
  }
}
