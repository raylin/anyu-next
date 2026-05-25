import { NextRequest, NextResponse } from "next/server";
import {
  createAnalysisRequestRecord,
  createAnalysisResultRecord,
  getCachedAnalysisResult,
  insertEvent,
  updateAnalysisRequestState,
} from "@/lib/db/runtime";
import {
  getActiveProviderInfo,
  getProviderUserMessage,
  isProviderConfigError,
} from "@/lib/ai/provider";
import { buildAnalyzeCacheKey } from "@/lib/ai/result-cache";
import { generateModuleResult, resolveRuntimeStrategy } from "@/lib/ai/runtime";
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

export const maxDuration = 90;

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
      typeof candidate.anonymousSessionId !== "string") ||
    ("userContext" in candidate &&
      candidate.userContext !== undefined &&
      (typeof candidate.userContext !== "object" || candidate.userContext === null || Array.isArray(candidate.userContext)))
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
    userContext: body.userContext,
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

  let analysisRequestId: string | null = null;

  try {
    const redaction = redactUserInput(validatedInput.text);
    timing.mark("input_redacted");
    const providerInfo = getActiveProviderInfo();
    const runtimeStrategy = resolveRuntimeStrategy(providerInfo);
    const cacheKey = buildAnalyzeCacheKey({
      moduleSlug: moduleConfig.slug,
      redactedText: redaction.redactedText,
      situation: validatedInput.situation,
      userContext: validatedInput.userContext,
      promptVersion: moduleConfig.promptVersion,
      schemaVersion: moduleConfig.schemaVersion,
      modelStrategy: runtimeStrategy.strategy,
      provider: providerInfo.provider,
      primaryModel: runtimeStrategy.primaryModel,
    });
    const retentionExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    if (cacheKey) {
      const cachedAnalysis = await getCachedAnalysisResult({
        moduleId: moduleConfig.moduleId,
        themeSlug: moduleConfig.slug,
        cacheKeyVersion: cacheKey.cacheKeyVersion,
        cacheKeyHash: cacheKey.cacheKeyHash,
      });

      if (cachedAnalysis) {
        timing.mark("response_ready");

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
            userContextProvided: validatedInput.userContextProvided,
            userContextFieldCount: validatedInput.userContextFieldCount,
            cacheHit: true,
          },
        });

        await insertEvent({
          eventName: "analysis_completed",
          moduleId: moduleConfig.moduleId,
          themeSlug: moduleConfig.slug,
          experimentId: moduleConfig.experimentId,
          visualVariant: "B",
          promptVersion: moduleConfig.promptVersion,
          schemaVersion: moduleConfig.schemaVersion,
          situationType: validatedInput.situation,
          scoreBucket: cachedAnalysis.result.scoreBucket,
          anonymousSessionId: validatedInput.anonymousSessionId,
          metadata: {
            resultId: cachedAnalysis.result.id,
            privacyFlags: cachedAnalysis.request.privacyFlags,
            modelStrategy: cachedAnalysis.request.modelStrategy ?? runtimeStrategy.strategy,
            primaryModel: cachedAnalysis.request.primaryModel ?? runtimeStrategy.primaryModel,
            finalModel:
              cachedAnalysis.result.providerModel ??
              cachedAnalysis.request.primaryModel ??
              runtimeStrategy.primaryModel,
            retryCount: 0,
            fallbackUsed:
              Boolean(cachedAnalysis.result.providerModel) &&
              cachedAnalysis.result.providerModel !==
                (cachedAnalysis.request.primaryModel ?? runtimeStrategy.primaryModel),
            schemaValidationPassed: true,
            userContextProvided: validatedInput.userContextProvided,
            userContextFieldCount: validatedInput.userContextFieldCount,
            cacheHit: true,
            cacheKeyVersion: cacheKey.cacheKeyVersion,
            timingMs: getEventTimingMetrics(timing.summarize()),
          },
        });

        return NextResponse.json({
          ok: true,
          status: "completed",
          resultId: cachedAnalysis.result.id,
          redirectTo: `/m/${moduleConfig.slug}/result/${cachedAnalysis.result.id}`,
          cacheHit: true,
        });
      }
    }

    const persistedLimitResult = await checkPersistedAnalyzeLimits({
      moduleId: moduleConfig.moduleId,
      themeSlug: moduleConfig.slug,
      anonymousSessionId: validatedInput.anonymousSessionId,
    });

    if (!persistedLimitResult.ok) {
      return errorResponse(429, persistedLimitResult.error, persistedLimitResult.message);
    }

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
      cacheKeyVersion: cacheKey?.cacheKeyVersion,
      cacheKeyHash: cacheKey?.cacheKeyHash,
      modelStrategy: runtimeStrategy.strategy,
      primaryModel: runtimeStrategy.primaryModel,
      privacyFlags: redaction.flags,
      retentionExpiresAt,
    });
    analysisRequestId = analysisRequest.id;
    timing.mark("analysis_request_stored");
    await updateAnalysisRequestState({
      requestId: analysisRequest.id,
      status: "analyzing",
      startedAt: new Date(),
    });

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
        requestId: analysisRequest.id,
        status: "analyzing",
        inputCharCount: validatedInput.inputCharCount,
        userContextProvided: validatedInput.userContextProvided,
        userContextFieldCount: validatedInput.userContextFieldCount,
        cacheHit: false,
      },
    });

    const generated = await generateModuleResult(
      {
        moduleConfig,
        redactedText: redaction.redactedText,
        privacyFlags: redaction.flags,
        situation: validatedInput.situation,
        userContext: validatedInput.userContext,
      },
      {
        mark: timing.mark,
      },
    );
    await updateAnalysisRequestState({
      requestId: analysisRequest.id,
      status: "validating_result",
    });
    await updateAnalysisRequestState({
      requestId: analysisRequest.id,
      status: "persisting",
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
    await updateAnalysisRequestState({
      requestId: analysisRequest.id,
      status: "completed",
      completedAt: new Date(),
      resultId: analysisResult.id,
    });
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
        requestId: analysisRequest.id,
        status: "completed",
        resultId: analysisResult.id,
        privacyFlags: generated.privacyFlags,
        modelStrategy: generated.runtimeModel.modelStrategy,
        primaryModel: generated.runtimeModel.primaryModel,
        finalModel: generated.runtimeModel.finalModel,
        retryCount: generated.runtimeModel.retryCount,
        fallbackUsed: generated.runtimeModel.fallbackUsed,
        schemaValidationPassed: generated.runtimeModel.schemaValidationPassed,
        userContextProvided: validatedInput.userContextProvided,
        userContextFieldCount: validatedInput.userContextFieldCount,
        cacheHit: false,
        cacheKeyVersion: cacheKey?.cacheKeyVersion ?? null,
        timingMs: getEventTimingMetrics(timing.summarize()),
      },
    });

    return NextResponse.json({
      ok: true,
      status: "completed",
      requestId: analysisRequest.id,
      resultId: analysisResult.id,
      redirectTo: `/m/${moduleConfig.slug}/result/${analysisResult.id}`,
      cacheHit: false,
    });
  } catch (error) {
    if (analysisRequestId) {
      try {
        await updateAnalysisRequestState({
          requestId: analysisRequestId,
          status: "failed",
          failedAt: new Date(),
          errorCode: isProviderConfigError(error) ? "config_error" : "provider_error",
          errorCategory: isProviderConfigError(error) ? "configuration" : "provider",
        });
      } catch {
        // Preserve the original user-facing analyze failure if status persistence also fails.
      }
    }

    if (isProviderConfigError(error)) {
      return errorResponse(503, "config_error", getProviderUserMessage());
    }

    return errorResponse(502, "provider_error", "分析暫時失敗，請晚點再試一次。");
  }
}
