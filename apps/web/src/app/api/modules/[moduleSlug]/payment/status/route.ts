import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { getModuleBySlug } from "@/lib/modules/registry";
import { resolvePaymentAccessHandoff } from "@/lib/payments/payment-access-handoff";

type RouteProps = {
  params: Promise<{
    moduleSlug: string;
  }>;
};

type PaymentStatusPayload = {
  checkoutToken?: string;
};

function errorResponse(status: number, error: string, message: string) {
  return NextResponse.json({ ok: false, error, message }, { status });
}

export async function POST(request: Request, { params }: RouteProps) {
  const { moduleSlug } = await params;
  const moduleConfig = getModuleBySlug(moduleSlug);

  if (!moduleConfig) {
    return errorResponse(404, "module_not_found", "找不到這個模組。");
  }

  if (!isDbConfigured()) {
    return errorResponse(503, "config_error", "目前付款狀態服務尚未設定完成。");
  }

  let body: PaymentStatusPayload;

  try {
    body = (await request.json()) as PaymentStatusPayload;
  } catch {
    return errorResponse(400, "invalid_json", "送出的資料格式不正確。");
  }

  if (!body.checkoutToken || typeof body.checkoutToken !== "string") {
    return errorResponse(400, "invalid_input", "缺少付款確認資料。");
  }

  const handoff = await resolvePaymentAccessHandoff({
    moduleSlug: moduleConfig.slug,
    checkoutToken: body.checkoutToken,
  });

  if (!handoff.ok) {
    return NextResponse.json({
      ok: true,
      status: handoff.state,
      retryable: false,
      errorCategory: handoff.errorCategory,
      accessPath: null,
    });
  }

  return NextResponse.json({
    ok: true,
    status: handoff.state,
    retryable: handoff.retryable,
    errorCategory: handoff.state === "paid_failed" ? "payment_access_failed" : null,
    accessPath: handoff.accessPath,
  });
}

