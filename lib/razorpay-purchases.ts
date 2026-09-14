import { createAdminClient } from "@/lib/supabase/admin";
import {
  MESSAGE_CREDIT_PACK,
  captureRazorpayPayment,
  fetchRazorpayPayment,
  sanitizeRazorpayPayment,
  type RazorpayPayment,
} from "@/lib/razorpay";

type PurchaseRow = {
  id: string;
  user_id: string;
  provider: string;
  order_id: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  amount_paise: number;
  credits: number;
  status: "created" | "pending" | "paid" | "failed" | "cancelled";
};

export async function getRazorpayMessageCreditPurchase(orderId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("message_credit_purchases")
    .select(
      "id,user_id,provider,order_id,razorpay_order_id,razorpay_payment_id,amount_paise,credits,status",
    )
    .eq("provider", "razorpay")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) throw new Error("Unable to read the Razorpay payment order.");
  return (data as PurchaseRow | null) ?? null;
}

async function updateProviderStatus(
  purchase: PurchaseRow,
  status: "pending" | "failed" | "cancelled",
  payment: RazorpayPayment,
) {
  const admin = createAdminClient();
  const sanitized = sanitizeRazorpayPayment(payment);
  const { error } = await admin
    .from("message_credit_purchases")
    .update({
      status,
      razorpay_payment_id: payment.id || purchase.razorpay_payment_id,
      payment_mode: payment.method ?? null,
      provider_result_code: payment.error_code ?? payment.status,
      provider_result_message:
        payment.error_description ?? payment.error_reason ?? payment.status,
      provider_payload: sanitized,
      updated_at: new Date().toISOString(),
    })
    .eq("id", purchase.id)
    .neq("status", "paid");

  if (error) throw new Error("Unable to update the Razorpay payment order.");
}

async function fetchOrCapturePayment(paymentId: string) {
  let payment = await fetchRazorpayPayment(paymentId);
  if (payment.status !== "authorized") return payment;

  try {
    payment = await captureRazorpayPayment(
      paymentId,
      MESSAGE_CREDIT_PACK.amountPaise,
    );
  } catch {
    // A concurrent auto-capture/webhook may have completed first. Re-read the
    // provider before treating an authorization as still pending.
    payment = await fetchRazorpayPayment(paymentId);
  }
  return payment;
}

export async function reconcileRazorpayMessageCreditPurchase(
  orderId: string,
  paymentId: string,
) {
  const purchase = await getRazorpayMessageCreditPurchase(orderId);
  if (!purchase) throw new Error("Razorpay payment order was not found.");

  if (
    purchase.amount_paise !== MESSAGE_CREDIT_PACK.amountPaise ||
    purchase.credits !== MESSAGE_CREDIT_PACK.credits ||
    purchase.razorpay_order_id !== purchase.order_id
  ) {
    throw new Error("Payment order does not match the Bandhanaa credit pack.");
  }

  const payment = await fetchOrCapturePayment(paymentId);
  if (payment.order_id !== purchase.order_id) {
    throw new Error("Razorpay returned a different order id.");
  }
  if (
    payment.amount !== purchase.amount_paise ||
    payment.currency !== MESSAGE_CREDIT_PACK.currency
  ) {
    throw new Error("Verified Razorpay payment details do not match the order.");
  }

  if (payment.status === "captured" || payment.captured === true) {
    const admin = createAdminClient();
    const sanitized = sanitizeRazorpayPayment(payment);
    const { data, error } = await admin.rpc(
      "finalize_razorpay_message_credit_purchase",
      {
        p_order_id: purchase.order_id,
        p_razorpay_payment_id: payment.id,
        p_confirmed_amount_paise: payment.amount,
        p_payment_mode: payment.method ?? null,
        p_result_code: payment.status,
        p_result_message: "Razorpay payment captured",
        p_provider_payload: sanitized,
      },
    );

    if (error) {
      console.error("Razorpay credit finalization failed", {
        orderId: purchase.order_id,
        code: error.code,
      });
      throw new Error("Payment was verified but credits could not be applied.");
    }

    const row = Array.isArray(data) ? data[0] : data;
    return {
      status: "success" as const,
      orderId: purchase.order_id,
      paymentId: payment.id,
      creditsAdded: MESSAGE_CREDIT_PACK.credits,
      applied: Boolean(row?.applied),
      availableCredits: Number(row?.available_credits ?? 0),
    };
  }

  if (payment.status === "failed" || payment.status === "refunded") {
    await updateProviderStatus(purchase, "failed", payment);
    return {
      status: "failed" as const,
      orderId: purchase.order_id,
      message:
        payment.error_description ??
        payment.error_reason ??
        "Payment was not successful.",
    };
  }

  await updateProviderStatus(purchase, "pending", payment);
  return {
    status: "pending" as const,
    orderId: purchase.order_id,
    message: "Payment confirmation is still pending.",
  };
}
