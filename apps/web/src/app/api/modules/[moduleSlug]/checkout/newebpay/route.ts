import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { getModuleBySlug } from "@/lib/modules/registry";
import { createNewebPayCheckout } from "@/lib/payments/newebpay/checkout-service";
import { getPaymentRuntimeStateForModule } from "@/lib/runtime-config/payment";

type RouteProps = {
  params: Promise<{
    moduleSlug: string;
  }>;
};

type CheckoutPayload = {
  resultId?: string;
  idempotencyKey?: string;
};

function errorResponse(status: number, error: string, message: string, extra = {}) {
  return NextResponse.json({ ok: false, error, message, ...extra }, { status });
}

function parsePayload(body: unknown): CheckoutPayload {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {};
  }

  const candidate = body as CheckoutPayload;

  return {
    resultId: typeof candidate.resultId === "string" ? candidate.resultId : undefined,
    idempotencyKey:
      typeof candidate.idempotencyKey === "string" ? candidate.idempotencyKey : undefined,
  };
}

export async function POST(request: Request, { params }: RouteProps) {
  const { moduleSlug } = await params;
  const moduleConfig = getModuleBySlug(moduleSlug);

  if (!moduleConfig) {
    return errorResponse(404, "module_not_found", "找不到這個模組。");
  }

  const runtimeState = await getPaymentRuntimeStateForModule(moduleConfig);

  if (!runtimeState.ok) {
    return errorResponse(404, "payment_disabled", "Not found.", {
      category: runtimeState.category,
      errorCategory: runtimeState.errorCategory,
    });
  }

  if (!isDbConfigured()) {
    return errorResponse(503, "config_error", "Checkout is not configured.");
  }

  let payload: CheckoutPayload;

  try {
    payload = parsePayload(await request.json());
  } catch {
    return errorResponse(400, "invalid_json", "Invalid checkout payload.");
  }

  if (!payload.resultId) {
    return errorResponse(400, "invalid_input", "Missing resultId.");
  }

  const result = await createNewebPayCheckout({
    moduleConfig,
    resultId: payload.resultId,
    idempotencyKey: payload.idempotencyKey,
  });

  if (!result.ok) {
    return errorResponse(
      result.status,
      result.error,
      result.error === "source_result_not_found"
        ? "找不到這份分析結果。"
        : result.error === "payment_checkout_session_config_missing"
          ? "目前付款返回連結暫時無法建立。"
        : "目前付款連結暫時無法建立。",
      result.error === "missing_newebpay_config" || result.error === "invalid_newebpay_config"
        ? { missingConfig: result.missingConfig ?? [] }
        : {},
    );
  }

  return NextResponse.json({
    ok: true,
    mode: "newebpay_checkout_phase_1",
    moduleSlug: moduleConfig.slug,
    resultId: payload.resultId,
    paymentIntentId: result.paymentIntent.id,
    paymentIntentStatus: result.paymentIntent.status,
    paymentIntentCreated: result.paymentIntentCreated,
    merchantOrderNo: result.checkoutContract.merchantOrderNo,
    checkout: result.checkoutContract,
    pendingReturnPath: new URL(result.checkoutContract.returnUrl).pathname +
      new URL(result.checkoutContract.returnUrl).search,
  });
}
