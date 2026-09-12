import { NextResponse } from "next/server";

import { getPaytmConfig, verifyPaytmFormSignature } from "@/lib/paytm";
import { reconcilePaytmMessageCreditPurchase } from "@/lib/paytm-purchases";

export const runtime = "nodejs";

async function readPaytmParams(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const value = (await request.json()) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, String(item ?? "")]),
    );
  }

  const text = await request.text();
  return Object.fromEntries(new URLSearchParams(text).entries());
}

export async function POST(request: Request) {
  try {
    const params = await readPaytmParams(request);
    const checksum = params.CHECKSUMHASH ?? "";
    const orderId = params.ORDERID ?? params.orderId ?? "";
    const config = getPaytmConfig();

    if (
      !orderId ||
      !verifyPaytmFormSignature(params, config.merchantKey, checksum)
    ) {
      return NextResponse.json(
        { ok: false, message: "Invalid Paytm webhook signature." },
        { status: 400 },
      );
    }

    const result = await reconcilePaytmMessageCreditPurchase(orderId);
    return NextResponse.json({ ok: true, status: result.status });
  } catch (error) {
    console.error("Paytm webhook processing failed", {
      error: error instanceof Error ? error.message : "UnknownError",
    });
    return NextResponse.json(
      { ok: false, message: "Unable to reconcile Paytm payment." },
      { status: 500 },
    );
  }
}
