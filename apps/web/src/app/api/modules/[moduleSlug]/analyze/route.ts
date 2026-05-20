import { NextRequest, NextResponse } from "next/server";
import { createAnalysisRequestRecord, createAnalysisResultRecord, insertEvent } from "@/lib/db/runtime";
import { getProviderUserMessage, isProviderConfigError } from "@/lib/ai/provider";
import { generateModuleResult } from "@/lib/ai/runtime";
import { isDbConfigured } from "@/lib/db/client";
import { validateAnalyzeInput } from "@/lib/modules/ai-temperature-ui";
import { getModuleBySlug } from "@/lib/modules/registry";
import { redactUserInput } from "@/lib/privacy/pii";
import {
  checkIpHourlyLimit,
  checkPersistedAnalyzeLimits,
  getAnalysisGuardConfig,
  getClientIpAddress,
  looksLikePromptInjection,
  looksLikeUnsupportedRelationshipContent,
} from "@/lib/runtime/abuse-guard";
import { createTimingTracker, getEventTimingMetrics } from "@/lib/runtime/timing";
import type { AnalyzeRequestPayload, ApiErrorResponse } from "@/lib/ai/types";

type ModuleAnalyzeRouteProps = {
  params: Promise<{
    moduleSlug: string;
  }>;
};

function errorResponse(
  status: number,
  error: string,
  message: string,
): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ ok: false, error, message }, { status });
}

function isAnalyzeRequestPayload(body: unknown): body is AnalyzeRequestPayload {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return false;
  }

  const candidate = body as Record<string, unknown>;

  if (typeof candidate.text !== "string") {
    return false;
  }

  if (
    ("situation" in candidate && candidate.situation !== undefined && typeof candidate.situation !== "string") ||
    ("anonymousSessionId" in candidate &&
      candidate.anonymousSessionId !== undefined &&
      typeof candidate.anonymousSessionId !== "string")
  ) {
    return false;
  }

  return true;
}

export async function POST(
  request: NextRequest,
  { params }: ModuleAnalyzeRouteProps,
) {
  const timing = createTimingTracker();
  timing.mark("request_received");
  const { moduleSlug } = await params;
  const moduleConfig = getModuleBySlug(moduleSlug);

  if (!moduleConfig) {
    return errorResponse(404, "module_not_found", "找不到這個模組。");
  }

  if (!isDbConfigured()) {
    return errorResponse(503, "config_error", "目前分析服務尚未設定完成，請稍後再試。");
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "invalid_json", "送出的資料格式不正確。");
  }

  if (!isAnalyzeRequestPayload(body)) {
    return errorResponse(400, "validation_error", "送出的內容格式不正確，請重新整理後再試。");
  }

  const validatedInput = validateAnalyzeInput({
    text: body.text,
    situation: body.situation,
    anonymousSessionId: body.anonymousSessionId,
    allowedChips: moduleConfig.chips,
  });

  if (!validatedInput.ok) {
    return errorResponse(400, validatedInput.error, validatedInput.message);
  }

  timing.mark("input_validated");

  if (looksLikePromptInjection(validatedInput.text)) {
    return errorResponse(
      422,
      "prompt_injection_detected",
      "這段裡有一些和關係分析無關的指令。請移除後再試一次。",
    );
  }

  if (looksLikeUnsupportedRelationshipContent(validatedInput.text)) {
    return errorResponse(
      422,
      "unsupported_content",
      "這段看起來不像曖昧或關係互動情境。請貼最近的對話，或用自己的話描述你卡住的互動。",
    );
  }

  const ipLimitResult = checkIpHourlyLimit(
    getClientIpAddress(request.headers),
    getAnalysisGuardConfig().ipHourlyLimit,
  );

  if (!ipLimitResult.ok) {
    return errorResponse(429, ipLimitResult.error, ipLimitResult.message);
  }

  try {
    const persistedLimitResult = await checkPersistedAnalyzeLimits({
      moduleId: moduleConfig.moduleId,
      themeSlug: moduleConfig.slug,
      anonymousSessionId: validatedInput.anonymousSessionId,
    });

    if (!persistedLimitResult.ok) {
      return errorResponse(429, persistedLimitResult.error, persistedLimitResult.message);
    }

    const retentionExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const redaction = redactUserInput(validatedInput.text);
    timing.mark("input_redacted");
    const analysisRequest = await createAnalysisRequestRecord({
      moduleId: moduleConfig.moduleId,
      themeSlug: moduleConfig.slug,
      experimentId: moduleConfig.experimentId,
      promptVersion: moduleConfig.promptVersion,
      schemaVersion: moduleConfig.schemaVersion,
      anonymousSessionId: validatedInput.anonymousSessionId,
      situationType: validatedInput.situation,
      inputCharCount: validatedInput.inputCharCount,
      rawInputRedacted: redaction.redactedText,
      privacyFlags: redaction.flags,
      retentionExpiresAt,
    });
    timing.mark("analysis_request_stored");

    await insertEvent({
      eventName: "input_submitted",
      moduleId: moduleConfig.moduleId,
      themeSlug: moduleConfig.slug,
      experimentId: moduleConfig.experimentId,
      visualVariant: "B",
      promptVersion: moduleConfig.promptVersion,
      schemaVersion: moduleConfig.schemaVersion,
      situationType: validatedInput.situation,
      anonymousSessionId: validatedInput.anonymousSessionId,
      metadata: {
        inputCharCount: validatedInput.inputCharCount,
      },
    });

    const generated = await generateModuleResult({
      moduleConfig,
      redactedText: redaction.redactedText,
      privacyFlags: redaction.flags,
      situation: validatedInput.situation,
    }, {
      mark: timing.mark,
    });

    const analysisResult = await createAnalysisResultRecord({
      requestId: analysisRequest.id,
      moduleId: moduleConfig.moduleId,
      themeSlug: moduleConfig.slug,
      experimentId: moduleConfig.experimentId,
      visualVariant: "B",
      promptVersion: moduleConfig.promptVersion,
      schemaVersion: moduleConfig.schemaVersion,
      score: generated.result.free_result.temperature_score,
      scoreBucket: generated.scoreBucket,
      stateLabel: generated.result.free_result.state_label,
      normalizedResultJson: generated.result,
      provider: generated.provider,
      providerModel: generated.providerModel,
      providerRawJson: generated.providerRawJson,
      retentionExpiresAt,
    });
    timing.mark("analysis_result_stored");
    timing.mark("response_ready");

    await insertEvent({
      eventName: "analysis_completed",
      moduleId: moduleConfig.moduleId,
      themeSlug: moduleConfig.slug,
      experimentId: moduleConfig.experimentId,
      visualVariant: "B",
      promptVersion: moduleConfig.promptVersion,
      schemaVersion: moduleConfig.schemaVersion,
      situationType: validatedInput.situation,
      scoreBucket: generated.scoreBucket,
      anonymousSessionId: validatedInput.anonymousSessionId,
      metadata: {
        resultId: analysisResult.id,
        privacyFlags: generated.privacyFlags,
        modelStrategy: generated.runtimeModel.modelStrategy,
        primaryModel: generated.runtimeModel.primaryModel,
        finalModel: generated.runtimeModel.finalModel,
        retryCount: generated.runtimeModel.retryCount,
        fallbackUsed: generated.runtimeModel.fallbackUsed,
        schemaValidationPassed: generated.runtimeModel.schemaValidationPassed,
        timingMs: getEventTimingMetrics(timing.summarize()),
      },
    });

    return NextResponse.json({
      ok: true,
      resultId: analysisResult.id,
      redirectTo: `/m/${moduleConfig.slug}/result/${analysisResult.id}`,
    });
  } catch (error) {
    if (isProviderConfigError(error)) {
      return errorResponse(503, "config_error", getProviderUserMessage());
    }

    return errorResponse(502, "provider_error", "分析暫時失敗，請晚點再試一次。");
  }
}
