import { createAdminClient } from "@/lib/supabase/admin";
import {
  MESSAGE_CREDIT_PACK,
  amountToPaise,
  getPaytmTransactionStatus,
  sanitizePaytmStatus,
} from "@/lib/paytm";

type PurchaseRow = {
  id: string;
  user_id: string;
  order_id: string;
  paytm_txn_id: string | null;
  amount_paise: number;
  credits: number;
  status: "created" | "pending" | "paid" | "failed" | "cancelled";
};

export async function getMessageCreditPurchase(orderId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("message_credit_purchases")
    .select(
      "id,user_id,order_id,paytm_txn_id,amount_paise,credits,status",
    )
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) throw new Error("Unable to read the payment order.");
  return (data as PurchaseRow | null) ?? null;
}

async function updateProviderStatus(
  purchase: PurchaseRow,
  status: "pending" | "failed" | "cancelled",
  body: Awaited<ReturnType<typeof getPaytmTransactionStatus>>["response"]["body"],
) {
  const admin = createAdminClient();
  const sanitized = sanitizePaytmStatus(body ?? {});
  const { error } = await admin
    .from("message_credit_purchases")
    .update({
      status,
      payment_mode: sanitized.paymentMode,
      provider_result_code: sanitized.resultCode,
      provider_result_message: sanitized.resultMsg,
      provider_payload: sanitized,
      updated_at: new Date().toISOString(),
    })
    .eq("id", purchase.id)
    .neq("status", "paid");

  if (error) throw new Error("Unable to update the payment order.");
}

export async function reconcilePaytmMessageCreditPurchase(orderId: string) {
  const purchase = await getMessageCreditPurchase(orderId);
  if (!purchase) throw new Error("Payment order was not found.");

  if (
    purchase.amount_paise !== MESSAGE_CREDIT_PACK.amountPaise ||
    purchase.credits !== MESSAGE_CREDIT_PACK.credits
  ) {
    throw new Error("Payment order does not match the Bandhanaa credit pack.");
  }

  const { config, response } = await getPaytmTransactionStatus(orderId);
  const body = response.body ?? {};
  const resultStatus = body.resultInfo?.resultStatus?.toUpperCase() ?? "";
  const sanitized = sanitizePaytmStatus(body);

  if (body.orderId && body.orderId !== purchase.order_id) {
    throw new Error("Paytm returned a different order id.");
  }
  if (body.mid && body.mid !== config.mid) {
    throw new Error("Paytm returned a different merchant id.");
  }

  if (resultStatus === "TXN_SUCCESS") {
    const amountPaise = amountToPaise(body.txnAmount);
    const txnId = body.txnId?.trim();

    if (amountPaise !== purchase.amount_paise || !txnId) {
      throw new Error("Verified Paytm payment details do not match the order.");
    }

    const admin = createAdminClient();
    const { data, error } = await admin.rpc(
      "finalize_paytm_message_credit_purchase",
      {
        p_order_id: purchase.order_id,
        p_paytm_txn_id: txnId,
        p_confirmed_amount_paise: amountPaise,
        p_payment_mode: body.paymentMode ?? null,
        p_result_code: body.resultInfo?.resultCode ?? null,
        p_result_message: body.resultInfo?.resultMsg ?? null,
        p_provider_payload: sanitized,
      },
    );

    if (error) {
      console.error("Paytm credit finalization failed", {
        orderId: purchase.order_id,
        code: error.code,
      });
      throw new Error("Payment was verified but credits could not be applied.");
    }

    const row = Array.isArray(data) ? data[0] : data;
    return {
      status: "success" as const,
      orderId: purchase.order_id,
      creditsAdded: MESSAGE_CREDIT_PACK.credits,
      applied: Boolean(row?.applied),
      availableCredits: Number(row?.available_credits ?? 0),
    };
  }

  if (
    resultStatus.includes("PENDING") ||
    resultStatus === "NO_RECORD_FOUND" ||
    !resultStatus
  ) {
    await updateProviderStatus(purchase, "pending", body);
    return {
      status: "pending" as const,
      orderId: purchase.order_id,
      message:
        body.resultInfo?.resultMsg ?? "Payment confirmation is still pending.",
    };
  }

  await updateProviderStatus(purchase, "failed", body);
  return {
    status: "failed" as const,
    orderId: purchase.order_id,
    message: body.resultInfo?.resultMsg ?? "Payment was not successful.",
  };
}
