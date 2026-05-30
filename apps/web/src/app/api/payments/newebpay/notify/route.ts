import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { processNewebPayNotify } from "@/lib/payments/newebpay/notify-service";

function providerResponse(ok: boolean, category: string, status = ok ? 200 : 400) {
  return new NextResponse(ok ? "1|OK" : "0|ERROR", {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "x-anyu-payment-category": category,
    },
  });
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
    return providerResponse(false, "provider_config_missing", 503);
  }

  let payload: FormData | Record<string, string | undefined>;

  try {
    payload = await readNotifyPayload(request);
  } catch {
    return providerResponse(false, "malformed_payload", 400);
  }

  const result = await processNewebPayNotify(payload);

  if (!result.ok) {
    return providerResponse(false, result.category, result.status);
  }

  return providerResponse(true, result.category);
}

