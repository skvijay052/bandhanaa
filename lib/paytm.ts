import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const PAYTM_IV = Buffer.from("@@@@&&&&####$$$$", "utf8");

export const MESSAGE_CREDIT_PACK = {
  amount: "10.00",
  amountPaise: 1000,
  credits: 10,
} as const;

type PaytmEnvironment = "staging" | "production";

export type PaytmConfig = {
  environment: PaytmEnvironment;
  mid: string;
  merchantKey: string;
  websiteName: string;
  host: string;
  callbackUrl: string;
};

export type PaytmResultInfo = {
  resultStatus?: string;
  resultCode?: string;
  resultMsg?: string;
};

export type PaytmInitiateResponse = {
  body?: {
    txnToken?: string;
    resultInfo?: PaytmResultInfo;
  };
};

export type PaytmStatusBody = {
  resultInfo?: PaytmResultInfo;
  txnId?: string;
  bankTxnId?: string;
  orderId?: string;
  txnAmount?: string;
  txnType?: string;
  gatewayName?: string;
  bankName?: string;
  mid?: string;
  paymentMode?: string;
  txnDate?: string;
};

export type PaytmStatusResponse = {
  body?: PaytmStatusBody;
};

function requireMerchantKey(key: string) {
  const keyBuffer = Buffer.from(key, "utf8");
  if (keyBuffer.length !== 16) {
    throw new Error("PAYTM_MERCHANT_KEY must be a 16-byte Paytm merchant key.");
  }
  return keyBuffer;
}

function calculateHash(value: string, salt: string) {
  return createHash("sha256")
    .update(`${value}|${salt}`)
    .digest("hex") + salt;
}

function encryptChecksum(value: string, key: string) {
  const cipher = createCipheriv("aes-128-cbc", requireMerchantKey(key), PAYTM_IV);
  return cipher.update(value, "utf8", "base64") + cipher.final("base64");
}

function decryptChecksum(value: string, key: string) {
  const decipher = createDecipheriv(
    "aes-128-cbc",
    requireMerchantKey(key),
    PAYTM_IV,
  );
  return decipher.update(value, "base64", "utf8") + decipher.final("utf8");
}

function checksumParamString(params: Record<string, string>) {
  return Object.keys(params)
    .sort()
    .map((key) => params[key] ?? "")
    .join("|");
}

export function generatePaytmSignature(value: string, key: string) {
  // Paytm's checksum helper uses three random bytes encoded to four Base64 chars.
  const salt = randomBytes(3).toString("base64");
  return encryptChecksum(calculateHash(value, salt), key);
}

export function verifyPaytmFormSignature(
  params: Record<string, string>,
  key: string,
  checksum: string,
) {
  if (!checksum) return false;

  try {
    const unsigned = { ...params };
    delete unsigned.CHECKSUMHASH;
    const decrypted = decryptChecksum(checksum, key);
    const salt = decrypted.slice(-4);
    const expected = calculateHash(checksumParamString(unsigned), salt);
    const left = Buffer.from(decrypted, "utf8");
    const right = Buffer.from(expected, "utf8");
    return left.length === right.length && timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

export function getPaytmConfig(): PaytmConfig {
  const mid = process.env.PAYTM_MID?.trim();
  const merchantKey = process.env.PAYTM_MERCHANT_KEY?.trim();
  const environment: PaytmEnvironment =
    process.env.PAYTM_ENV?.trim().toLowerCase() === "production"
      ? "production"
      : "staging";
  const websiteName =
    process.env.PAYTM_WEBSITE?.trim() ||
    (environment === "production" ? "DEFAULT" : "WEBSTAGING");
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000"
  ).replace(/\/$/, "");

  if (!mid || !merchantKey) {
    throw new Error("Paytm payment credentials are not configured.");
  }

  // Validate early so a malformed secret never reaches the payment API.
  requireMerchantKey(merchantKey);

  const host =
    environment === "production"
      ? "https://securegw.paytm.in"
      : "https://securegw-stage.paytm.in";

  return {
    environment,
    mid,
    merchantKey,
    websiteName,
    host,
    callbackUrl: `${siteUrl}/api/paytm/callback`,
  };
}

async function postPaytm<T>(url: string, payload: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Paytm request failed with HTTP ${response.status}.`);
  }

  return (await response.json()) as T;
}

export async function initiatePaytmTransaction(args: {
  orderId: string;
  userId: string;
}) {
  const config = getPaytmConfig();
  const body = {
    requestType: "Payment",
    mid: config.mid,
    websiteName: config.websiteName,
    orderId: args.orderId,
    callbackUrl: config.callbackUrl,
    txnAmount: {
      value: MESSAGE_CREDIT_PACK.amount,
      currency: "INR",
    },
    userInfo: {
      custId: args.userId,
    },
  };
  const signature = generatePaytmSignature(
    JSON.stringify(body),
    config.merchantKey,
  );

  const response = await postPaytm<PaytmInitiateResponse>(
    `${config.host}/theia/api/v1/initiateTransaction?mid=${encodeURIComponent(
      config.mid,
    )}&orderId=${encodeURIComponent(args.orderId)}`,
    { body, head: { signature } },
  );

  return { config, response };
}

export async function getPaytmTransactionStatus(orderId: string) {
  const config = getPaytmConfig();
  const body = { mid: config.mid, orderId };
  const signature = generatePaytmSignature(
    JSON.stringify(body),
    config.merchantKey,
  );

  const response = await postPaytm<PaytmStatusResponse>(
    `${config.host}/v3/order/status`,
    { body, head: { signature } },
  );

  return { config, response };
}

export function amountToPaise(value: unknown) {
  const amount = typeof value === "number" ? value : Number(String(value ?? ""));
  if (!Number.isFinite(amount)) return null;
  return Math.round(amount * 100);
}

export function checkoutScriptUrl(host: string, mid: string) {
  return `${host}/merchantpgpui/checkoutjs/merchants/${encodeURIComponent(mid)}.js`;
}

export function sanitizePaytmStatus(body: PaytmStatusBody) {
  return {
    orderId: body.orderId ?? null,
    txnId: body.txnId ?? null,
    txnAmount: body.txnAmount ?? null,
    paymentMode: body.paymentMode ?? null,
    resultStatus: body.resultInfo?.resultStatus ?? null,
    resultCode: body.resultInfo?.resultCode ?? null,
    resultMsg: body.resultInfo?.resultMsg ?? null,
    txnDate: body.txnDate ?? null,
  };
}
