import { NextResponse } from "next/server";
import {
  getAnalysisRequestStatusRecord,
  updateAnalysisRequestState,
  type AnalysisRequestStatus,
} from "@/lib/db/runtime";
import { isDbConfigured } from "@/lib/db/client";
import { getModuleBySlug } from "@/lib/modules/registry";
import type { AnalyzeRequestStatusResponse, ApiErrorResponse } from "@/lib/ai/types";

type ModuleAnalyzeRequestStatusRouteProps = {
  params: Promise<{
    moduleSlug: string;
    requestId: string;
  }>;
};

const REQUEST_EXPIRY_MS = 10 * 60 * 1000;
const FRIENDLY_FAILURE_MESSAGE = "這段內容暫時沒有分析成功，可以稍後再試一次。";

function errorResponse(
  status: number,
  error: string,
  message: string,
): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ ok: false, error, message }, { status });
}

function normalizeProcessingPhase(status: AnalysisRequestStatus | string): string {
  switch (status) {
    case "validating":
      return "validating";
    case "analyzing":
      return "analyzing";
    case "validating_result":
      return "validating_result";
    case "persisting":
      return "persisting";
    case "created":
    default:
      return "processing";
  }
}

function elapsedSince(createdAt: Date | string | null): number {
  if (!createdAt) {
    return 0;
  }

  return Math.max(0, Date.now() - new Date(createdAt).getTime());
}

export async function GET(
  _request: Request,
  { params }: ModuleAnalyzeRequestStatusRouteProps,
) {
  const { moduleSlug, requestId } = await params;
  const moduleConfig = getModuleBySlug(moduleSlug);

  if (!moduleConfig) {
    return errorResponse(404, "module_not_found", "找不到這個模組。");
  }

  if (!isDbConfigured()) {
    return errorResponse(503, "config_error", "目前分析服務尚未設定完成，請稍後再試。");
  }

  const record = await getAnalysisRequestStatusRecord({
    requestId,
    moduleId: moduleConfig.moduleId,
    themeSlug: moduleConfig.slug,
  });

  if (!record) {
    return errorResponse(404, "request_not_found", "找不到這次分析紀錄，請重新送出。");
  }

  const elapsedMs = elapsedSince(record.request.createdAt);
  const resultId = record.request.resultId ?? record.result?.id ?? null;

  if (record.request.status === "completed" && resultId) {
    return NextResponse.json({
      ok: true,
      status: "completed",
      resultId,
      redirectTo: `/m/${moduleConfig.slug}/result/${resultId}`,
      elapsedMs,
      retryable: false,
    } satisfies AnalyzeRequestStatusResponse);
  }

  if (record.request.status === "failed") {
    return NextResponse.json({
      ok: true,
      status: "failed",
      errorCode: record.request.errorCode ?? "analysis_failed",
      errorCategory: record.request.errorCategory ?? "runtime",
      message: FRIENDLY_FAILURE_MESSAGE,
      elapsedMs,
      retryable: true,
    } satisfies AnalyzeRequestStatusResponse);
  }

  if (record.request.status === "expired" || elapsedMs >= REQUEST_EXPIRY_MS) {
    if (record.request.status !== "expired") {
      await updateAnalysisRequestState({
        requestId: record.request.id,
        status: "expired",
        errorCode: "request_expired",
        errorCategory: "timeout",
      });
    }

    return NextResponse.json({
      ok: true,
      status: "expired",
      errorCode: "request_expired",
      errorCategory: "timeout",
      message: FRIENDLY_FAILURE_MESSAGE,
      elapsedMs,
      retryable: true,
    } satisfies AnalyzeRequestStatusResponse);
  }

  return NextResponse.json({
    ok: true,
    status: "processing",
    phase: normalizeProcessingPhase(record.request.status),
    elapsedMs,
    retryable: false,
  } satisfies AnalyzeRequestStatusResponse);
}
