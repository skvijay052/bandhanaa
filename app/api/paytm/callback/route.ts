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

function messagesRedirect(request: Request, payment: string) {
  const configuredSite = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const base = configuredSite || new URL(request.url).origin;
  const url = new URL("/messages", base);
  url.searchParams.set("payment", payment);
  return NextResponse.redirect(url, 303);
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
      return new NextResponse("Invalid Paytm callback signature.", {
        status: 400,
      });
    }

    const result = await reconcilePaytmMessageCreditPurchase(orderId);
    return messagesRedirect(request, result.status);
  } catch (error) {
    console.error("Paytm callback processing failed", {
      error: error instanceof Error ? error.message : "UnknownError",
    });
    return messagesRedirect(request, "error");
  }
}

export async function GET(request: Request) {
  return messagesRedirect(request, "error");
}
