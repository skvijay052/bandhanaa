import { createHmac, timingSafeEqual } from "node:crypto";

export const MESSAGE_CREDIT_PACK = {
  amountPaise: 1000,
  credits: 10,
  currency: "INR",
} as const;

export type RazorpayOrder = {
  id: string;
  entity?: string;
  amount: number;
  amount_paid?: number;
  amount_due?: number;
  currency: string;
  receipt?: string | null;
  status?: string;
  attempts?: number;
  notes?: Record<string, string> | string[];
  created_at?: number;
};

export type RazorpayPayment = {
  id: string;
  entity?: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string | null;
  method?: string | null;
  captured?: boolean;
  email?: string | null;
  contact?: string | null;
  vpa?: string | null;
  bank?: string | null;
  wallet?: string | null;
  error_code?: string | null;
  error_description?: string | null;
  error_source?: string | null;
  error_step?: string | null;
  error_reason?: string | null;
  created_at?: number;
};

export type RazorpayConfig = {
  keyId: string;
  keySecret: string;
};

export function getRazorpayConfig(): RazorpayConfig {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!keyId || !keySecret) {
    throw new Error("Razorpay payment credentials are not configured.");
  }
  return { keyId, keySecret };
}

export function getRazorpayWebhookSecret() {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!secret) throw new Error("Razorpay webhook secret is not configured.");
  return secret;
}

function safeEqualHex(expected: string, received: string) {
  if (!/^[a-f0-9]{64}$/i.test(received)) return false;
  const left = Buffer.from(expected, "hex");
  const right = Buffer.from(received, "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

export function verifyRazorpayCheckoutSignature(args: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const { keySecret } = getRazorpayConfig();
  const expected = createHmac("sha256", keySecret)
    .update(`${args.orderId}|${args.paymentId}`)
    .digest("hex");
  return safeEqualHex(expected, args.signature);
}

export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string,
) {
  const expected = createHmac("sha256", getRazorpayWebhookSecret())
    .update(rawBody)
    .digest("hex");
  return safeEqualHex(expected, signature);
}

async function razorpayRequest<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const { keyId, keySecret } = getRazorpayConfig();
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    method: init.method ?? "GET",
    headers: {
      authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "content-type": "application/json",
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });

  const text = await response.text();
  let payload: unknown = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = {};
  }

  if (!response.ok) {
    const providerError = payload as {
      error?: { description?: string; code?: string };
    };
    const detail =
      providerError.error?.description ??
      providerError.error?.code ??
      `HTTP ${response.status}`;
    throw new Error(`Razorpay request failed: ${detail}`);
  }

  return payload as T;
}

export async function createRazorpayOrder(args: {
  receipt: string;
  userId: string;
}) {
  return razorpayRequest<RazorpayOrder>("/orders", {
    method: "POST",
    body: {
      amount: MESSAGE_CREDIT_PACK.amountPaise,
      currency: MESSAGE_CREDIT_PACK.currency,
      receipt: args.receipt,
      partial_payment: false,
      notes: {
        product: "bandhanaa_message_credits",
        credits: String(MESSAGE_CREDIT_PACK.credits),
        user_id: args.userId,
      },
    },
  });
}

export async function fetchRazorpayPayment(paymentId: string) {
  return razorpayRequest<RazorpayPayment>(
    `/payments/${encodeURIComponent(paymentId)}`,
  );
}

export async function captureRazorpayPayment(paymentId: string, amount: number) {
  return razorpayRequest<RazorpayPayment>(
    `/payments/${encodeURIComponent(paymentId)}/capture`,
    {
      method: "POST",
      body: { amount, currency: MESSAGE_CREDIT_PACK.currency },
    },
  );
}

export function sanitizeRazorpayPayment(payment: RazorpayPayment) {
  return {
    id: payment.id,
    orderId: payment.order_id,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    method: payment.method ?? null,
    captured: Boolean(payment.captured),
    errorCode: payment.error_code ?? null,
    errorDescription: payment.error_description ?? null,
    errorReason: payment.error_reason ?? null,
    createdAt: payment.created_at ?? null,
  };
}
