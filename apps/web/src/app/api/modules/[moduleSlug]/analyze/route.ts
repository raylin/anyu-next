import { NextRequest, NextResponse } from "next/server";
import { createAnalysisRequestRecord, createAnalysisResultRecord, insertEvent } from "@/lib/db/runtime";
import { getProviderUserMessage, isProviderConfigError } from "@/lib/ai/provider";
import { generateModuleResult } from "@/lib/ai/runtime";
import { isDbConfigured } from "@/lib/db/client";
import { validateAnalyzeInput } from "@/lib/modules/ai-temperature-ui";
import { getModuleBySlug } from "@/lib/modules/registry";
import { redactUserInput } from "@/lib/privacy/pii";
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

  try {
    const retentionExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const redaction = redactUserInput(validatedInput.text);
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
      text: validatedInput.text,
      situation: validatedInput.situation,
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
