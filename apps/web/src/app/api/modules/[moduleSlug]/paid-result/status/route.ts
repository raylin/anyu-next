import { NextResponse } from "next/server";
import { PAID_RESULT_PROMPT_VERSION, PAID_RESULT_SCHEMA_VERSION } from "@/lib/ai/paid-result-generation";
import { isDbConfigured } from "@/lib/db/client";
import { getPaidResultStatusForAnalysisResult } from "@/lib/db/paid-results";
import { getUnlockIntentByTokenHash } from "@/lib/db/runtime";
import { hashFulfillmentSecret, isExpired } from "@/lib/line/fulfillment";
import { getModuleBySlug } from "@/lib/modules/registry";

type RouteProps = {
  params: Promise<{
    moduleSlug: string;
  }>;
};

type PaidResultStatusPayload = {
  unlockToken?: string;
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
    return errorResponse(503, "config_error", "目前完整分析服務尚未設定完成。");
  }

  let body: PaidResultStatusPayload;

  try {
    body = (await request.json()) as PaidResultStatusPayload;
  } catch {
    return errorResponse(400, "invalid_json", "送出的資料格式不正確。");
  }

  if (!body.unlockToken || typeof body.unlockToken !== "string") {
    return errorResponse(400, "invalid_input", "缺少完整分析連結資料。");
  }

  const record = await getUnlockIntentByTokenHash(hashFulfillmentSecret(body.unlockToken));

  if (!record || record.unlockIntent.themeSlug !== moduleSlug) {
    return NextResponse.json({
      ok: true,
      status: "expired",
      retryable: false,
      errorCategory: "invalid_unlock",
    });
  }

  if (isExpired(record.unlockIntent.unlockTokenExpiresAt)) {
    return NextResponse.json({
      ok: true,
      status: "expired",
      retryable: false,
      errorCategory: "unlock_expired",
    });
  }

  const paidStatus = await getPaidResultStatusForAnalysisResult({
    analysisResultId: record.result.id,
    promptVersion: PAID_RESULT_PROMPT_VERSION,
    schemaVersion: PAID_RESULT_SCHEMA_VERSION,
  });

  if (!paidStatus) {
    const legacyCompletedStatus = await getPaidResultStatusForAnalysisResult({
      analysisResultId: record.result.id,
      status: "completed",
    });

    if (legacyCompletedStatus) {
      return NextResponse.json({
        ok: true,
        status: "completed",
        retryable: false,
        errorCategory: null,
      });
    }

    const isFulfillmentClaimed =
      record.unlockIntent.fulfillmentStatus === "bound" ||
      record.unlockIntent.fulfillmentStatus === "delivered";

    return NextResponse.json({
      ok: true,
      status: isFulfillmentClaimed ? "pending" : "missing",
      retryable: true,
      errorCategory: null,
    });
  }

  return NextResponse.json({
    ok: true,
    status: paidStatus.status,
    retryable: paidStatus.status === "pending" || paidStatus.status === "processing",
    errorCategory: paidStatus.status === "failed" ? paidStatus.errorCode ?? "paid_generation_failed" : null,
  });
}
