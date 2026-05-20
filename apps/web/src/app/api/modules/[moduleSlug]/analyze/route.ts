import { NextRequest, NextResponse } from "next/server";
import { createAnalysisRequestRecord, createAnalysisResultRecord, insertEvent } from "@/lib/db/runtime";
import { getProviderUserMessage, isProviderConfigError } from "@/lib/ai/provider";
import { generateModuleResult } from "@/lib/ai/runtime";
import { isDbConfigured } from "@/lib/db/client";
import { validateAnalyzeInput } from "@/lib/modules/ai-temperature-ui";
import { getModuleBySlug } from "@/lib/modules/registry";
import { redactUserInput } from "@/lib/privacy/pii";
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

  let body: AnalyzeRequestPayload;

  try {
    body = (await request.json()) as AnalyzeRequestPayload;
  } catch {
    return errorResponse(400, "invalid_json", "送出的資料格式不正確。");
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

  try {
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

    return errorResponse(502, "analyze_failed", "分析暫時失敗，請晚點再試一次。");
  }
}
