import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  MESSAGE_CREDIT_PACK,
  checkoutScriptUrl,
  getPaytmConfig,
  initiatePaytmTransaction,
} from "@/lib/paytm";

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

  let purchaseId: string | null = null;

  try {
    // Validate all server-only configuration before creating an order row.
    getPaytmConfig();
    const admin = createAdminClient();
    const orderId = `BNDMSG_${Date.now()}_${randomUUID()
      .replaceAll("-", "")
      .slice(0, 12)}`;

    const { data: purchase, error: purchaseError } = await admin
      .from("message_credit_purchases")
      .insert({
        user_id: user.id,
        order_id: orderId,
        amount_paise: MESSAGE_CREDIT_PACK.amountPaise,
        credits: MESSAGE_CREDIT_PACK.credits,
        status: "created",
      })
      .select("id")
      .single();

    if (purchaseError || !purchase) {
      console.error("Paytm purchase order creation failed", {
        userId: user.id,
        code: purchaseError?.code,
      });
      return jsonError(
        "Payment setup is incomplete. Please try again after the payment database migration is applied.",
        503,
      );
    }

    purchaseId = String(purchase.id);
    const { config, response } = await initiatePaytmTransaction({
      orderId,
      userId: user.id,
    });
    const resultInfo = response.body?.resultInfo;
    const txnToken = response.body?.txnToken;

    if (resultInfo?.resultStatus !== "S" || !txnToken) {
      await admin
        .from("message_credit_purchases")
        .update({
          status: "failed",
          provider_result_code: resultInfo?.resultCode ?? null,
          provider_result_message:
            resultInfo?.resultMsg ?? "Paytm could not create a transaction.",
          updated_at: new Date().toISOString(),
        })
        .eq("id", purchaseId);

      return jsonError(
        resultInfo?.resultMsg ?? "Paytm could not start the payment.",
        502,
      );
    }

    const { error: pendingError } = await admin
      .from("message_credit_purchases")
      .update({
        status: "pending",
        provider_result_code: resultInfo?.resultCode ?? null,
        provider_result_message: resultInfo?.resultMsg ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", purchaseId);

    if (pendingError) {
      throw new Error("Unable to save the Paytm transaction state.");
    }

    return NextResponse.json({
      ok: true,
      mid: config.mid,
      orderId,
      txnToken,
      amount: MESSAGE_CREDIT_PACK.amount,
      credits: MESSAGE_CREDIT_PACK.credits,
      callbackUrl: config.callbackUrl,
      checkoutScriptUrl: checkoutScriptUrl(config.host, config.mid),
      environment: config.environment,
    });
  } catch (error) {
    console.error("Paytm create-order failed", {
      userId: user.id,
      purchaseId,
      error: error instanceof Error ? error.message : "UnknownError",
    });

    return jsonError(
      error instanceof Error &&
        (error.message.includes("not configured") ||
          error.message.includes("16-byte") ||
          error.message.includes("payment administration"))
        ? "Paytm is not configured yet. Add the Paytm and Supabase server credentials first."
        : "We couldn't start the payment. Please try again.",
      503,
    );
  }
}
