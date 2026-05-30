import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { processNewebPayNotify } from "@/lib/payments/newebpay/notify-service";

type NotifyPayload = FormData | Record<string, string | undefined>;

function providerResponse(ok: boolean, category: string, status = 200) {
  return new NextResponse(ok ? "1|OK" : "0|ERROR", {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "x-anyu-payment-category": category,
    },
  });
}

function readPayloadString(payload: NotifyPayload | null, key: string) {
  if (!payload) {
    return "";
  }

  const value = payload instanceof FormData ? payload.get(key) : payload[key];

  return typeof value === "string" ? value.trim() : "";
}

function getContentTypeCategory(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (contentType.includes("application/json")) {
    return "json";
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    return "form_urlencoded";
  }

  if (contentType.includes("multipart/form-data")) {
    return "multipart_form";
  }

  return contentType ? "other" : "missing";
}

function logNotifyDiagnostic(input: {
  request: Request;
  payload: NotifyPayload | null;
  ok: boolean;
  category: string;
  paymentIntentStatus?: string | null;
  moduleSlug?: string | null;
  queueCategory?: string | null;
}) {
  const merchantId = readPayloadString(input.payload, "MerchantID");
  const tradeInfo = readPayloadString(input.payload, "TradeInfo");
  const tradeSha = readPayloadString(input.payload, "TradeSha");
  const version = readPayloadString(input.payload, "Version");
  const providerEnvironment =
    process.env.NEWEBPAY_ENVIRONMENT === "production" ||
    process.env.NEWEBPAY_ENVIRONMENT === "staging" ||
    process.env.NEWEBPAY_ENVIRONMENT === "sandbox"
      ? process.env.NEWEBPAY_ENVIRONMENT
      : "unknown";

  console.info(
    JSON.stringify({
      event: input.ok ? "newebpay_notify_processed" : "newebpay_notify_failed",
      ok: input.ok,
      category: input.category,
      environment: providerEnvironment,
      httpTransportStatus: 200,
      providerResponse: input.ok ? "1|OK" : "0|ERROR",
      contentTypeCategory: getContentTypeCategory(input.request),
      payloadShape: {
        merchantIdPresent: Boolean(merchantId),
        tradeInfoPresent: Boolean(tradeInfo),
        tradeShaPresent: Boolean(tradeSha),
        versionPresent: Boolean(version),
      },
      merchantMatch: input.category === "merchant_mismatch" ? false : null,
      amountMatch: input.category === "amount_mismatch" ? false : null,
      paymentIntentFound: input.category === "payment_intent_not_found" ? false : null,
      paymentIntentStatus: input.paymentIntentStatus ?? null,
      moduleSlug: input.moduleSlug ?? null,
      queueCategory: input.queueCategory ?? null,
    }),
  );
}

async function readNotifyPayload(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as unknown;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return {};
    }

    return body as Record<string, string | undefined>;
  }

  return request.formData();
}

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    logNotifyDiagnostic({
      request,
      payload: null,
      ok: false,
      category: "provider_config_missing",
    });

    return providerResponse(false, "provider_config_missing", 503);
  }

  let payload: NotifyPayload;

  try {
    payload = await readNotifyPayload(request);
  } catch {
    logNotifyDiagnostic({
      request,
      payload: null,
      ok: false,
      category: "malformed_payload",
    });

    return providerResponse(false, "malformed_payload");
  }

  const result = await processNewebPayNotify(payload);

  if (!result.ok) {
    logNotifyDiagnostic({
      request,
      payload,
      ok: false,
      category: result.category,
    });

    return providerResponse(false, result.category);
  }

  logNotifyDiagnostic({
    request,
    payload,
    ok: true,
    category: result.category,
    paymentIntentStatus: result.paymentIntentStatus,
    moduleSlug: result.paymentIntent.moduleSlug,
    queueCategory: result.queueTrigger.category,
  });

  return providerResponse(true, result.category);
}
