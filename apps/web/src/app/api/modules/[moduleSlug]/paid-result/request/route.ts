import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { getModuleBySlug } from "@/lib/modules/registry";
import { requestDeferredPaidGeneration } from "@/lib/modules/paid-generation-service";

type PaidGenerationPayload = {
  resultId?: string;
  unlockIntentId?: string;
};

type RouteProps = {
  params: Promise<{
    moduleSlug: string;
  }>;
};

export const maxDuration = 90;

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

  let body: PaidGenerationPayload;

  try {
    body = (await request.json()) as PaidGenerationPayload;
  } catch {
    return errorResponse(400, "invalid_json", "送出的資料格式不正確。");
  }

  if (!body.resultId || !body.unlockIntentId) {
    return errorResponse(400, "invalid_input", "缺少完整分析資料。");
  }

  const result = await requestDeferredPaidGeneration({
    moduleConfig,
    resultId: body.resultId,
    unlockIntentId: body.unlockIntentId,
    triggerSource: "web_unlock",
  });

  if (!result.ok) {
    return errorResponse(
      result.status,
      result.error,
      result.error === "source_unavailable"
        ? "這份結果已超過保留期限，無法整理完整分析。"
        : "目前完整分析暫時無法建立。",
    );
  }

  return NextResponse.json({
    ok: true,
    status: result.status,
    paidResultId: result.paidResultId,
    reused: result.reused,
    errorCategory: result.status === "failed" ? result.errorCategory : undefined,
  });
}
