import { NextResponse } from "next/server";
import { PAID_RESULT_PROMPT_VERSION, PAID_RESULT_SCHEMA_VERSION } from "@/lib/ai/paid-result-generation";
import { isDbConfigured } from "@/lib/db/client";
import {
  buildPaidAnalysisJobDedupeKey,
  getGenerationJobByDedupeKey,
  type GenerationJob,
} from "@/lib/db/generation-jobs";
import { getPaidResultStatusForAnalysisResult } from "@/lib/db/paid-results";
import { getUnlockIntentByTokenHash } from "@/lib/db/runtime";
import { hashFulfillmentSecret, isExpired } from "@/lib/line/fulfillment";
import { getModuleBySlug } from "@/lib/modules/registry";
import { isPaidGenerationJobsEnabled } from "@/lib/runtime/feature-flags";

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

async function getPaidGenerationJobStatusSignal(input: {
  moduleSlug: string;
  analysisResultId: string;
}): Promise<GenerationJob | null> {
  if (!isPaidGenerationJobsEnabled()) {
    return null;
  }

  try {
    const dedupeKey = buildPaidAnalysisJobDedupeKey({
      moduleSlug: input.moduleSlug,
      analysisResultId: input.analysisResultId,
      promptVersion: PAID_RESULT_PROMPT_VERSION,
      schemaVersion: PAID_RESULT_SCHEMA_VERSION,
    });

    return await getGenerationJobByDedupeKey(dedupeKey);
  } catch {
    return null;
  }
}

function mapPaidGenerationJobStatus(job: GenerationJob | null) {
  if (!job) {
    return null;
  }

  if (job.status === "processing") {
    return {
      status: "processing",
      retryable: true,
      errorCategory: null,
    };
  }

  if (job.status === "queued" || job.status === "retry_scheduled" || job.status === "completed") {
    return {
      status: "pending",
      retryable: true,
      errorCategory: null,
    };
  }

  if (job.status === "failed_final") {
    return {
      status: "failed",
      retryable: false,
      errorCategory: "paid_generation_failed",
    };
  }

  return null;
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

  if (paidStatus?.status === "completed") {
    return NextResponse.json({
      ok: true,
      status: "completed",
      retryable: false,
      errorCategory: null,
    });
  }

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
  }

  const jobStatus = mapPaidGenerationJobStatus(
    await getPaidGenerationJobStatusSignal({
      moduleSlug,
      analysisResultId: record.result.id,
    }),
  );

  if (jobStatus) {
    return NextResponse.json({
      ok: true,
      ...jobStatus,
    });
  }

  if (paidStatus) {
    return NextResponse.json({
      ok: true,
      status: paidStatus.status,
      retryable: paidStatus.status === "pending" || paidStatus.status === "processing",
      errorCategory: paidStatus.status === "failed" ? paidStatus.errorCode ?? "paid_generation_failed" : null,
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
