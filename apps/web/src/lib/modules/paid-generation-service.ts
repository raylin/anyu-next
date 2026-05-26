import {
  buildProviderFallbackPaidResult,
  generatePaidResult,
  getPaidResultValidationDiagnostics,
  PAID_RESULT_PROVIDER_FALLBACK_MODEL,
  PAID_RESULT_PROMPT_VERSION,
  PAID_RESULT_SCHEMA_VERSION,
  type PaidResultValidationDiagnostics,
} from "@/lib/ai/paid-result-generation";
import { isOutputValidationError, resolveRuntimeStrategy } from "@/lib/ai/runtime";
import {
  createPaidResultRecord,
  getPaidResultForAnalysisResult,
  markPaidResultCompleted,
  markPaidResultFailed,
  markPaidResultProcessing,
} from "@/lib/db/paid-results";
import {
  getActiveProviderInfo,
  getProviderRuntimeErrorCode,
  isProviderConfigError,
} from "@/lib/ai/provider";
import { getAnalysisResultWithRequestById, getUnlockIntentById, insertEvent } from "@/lib/db/runtime";
import type { ProductModuleConfig } from "@/lib/modules/types";

export type PaidGenerationStatus = "processing" | "completed" | "failed" | "expired";
type PaidGenerationSource = "provider" | "fallback";

function getPaidGenerationSourceFromModel(model?: string | null): PaidGenerationSource {
  return model === PAID_RESULT_PROVIDER_FALLBACK_MODEL ? "fallback" : "provider";
}

function getSafeErrorCode(error: unknown) {
  if (isProviderConfigError(error)) {
    return "configuration";
  }

  if (isOutputValidationError(error)) {
    return "output_validation";
  }

  return getProviderRuntimeErrorCode(error) ?? "provider";
}

export async function requestDeferredPaidGeneration(input: {
  moduleConfig: ProductModuleConfig;
  resultId: string;
  unlockIntentId: string;
}) {
  const record = await getAnalysisResultWithRequestById(
    input.resultId,
    input.moduleConfig.moduleId,
    input.moduleConfig.slug,
  );

  if (!record) {
    return { ok: false as const, status: 404, error: "result_not_found" };
  }

  const unlockIntent = await getUnlockIntentById(input.unlockIntentId);

  if (
    !unlockIntent ||
    unlockIntent.resultId !== input.resultId ||
    unlockIntent.moduleId !== input.moduleConfig.moduleId ||
    unlockIntent.themeSlug !== input.moduleConfig.slug
  ) {
    return { ok: false as const, status: 404, error: "unlock_intent_not_found" };
  }

  const completed = await getPaidResultForAnalysisResult({
    analysisResultId: input.resultId,
    status: "completed",
    promptVersion: PAID_RESULT_PROMPT_VERSION,
    schemaVersion: PAID_RESULT_SCHEMA_VERSION,
  });

  if (completed) {
    return {
      ok: true as const,
      status: "completed" as PaidGenerationStatus,
      paidResultId: completed.id,
      source: getPaidGenerationSourceFromModel(completed.model),
      reused: true,
    };
  }

  const current = await getPaidResultForAnalysisResult({
    analysisResultId: input.resultId,
    promptVersion: PAID_RESULT_PROMPT_VERSION,
    schemaVersion: PAID_RESULT_SCHEMA_VERSION,
  });

  if (current?.status === "processing") {
    return {
      ok: true as const,
      status: "processing" as PaidGenerationStatus,
      paidResultId: current.id,
      reused: true,
    };
  }

  if (current?.status === "failed" && current.retryCount >= 2) {
    return {
      ok: true as const,
      status: "failed" as PaidGenerationStatus,
      paidResultId: current.id,
      errorCategory: current.errorCode ?? "provider",
      reused: true,
    };
  }

  if (!record.request.rawInputRedacted) {
    return { ok: false as const, status: 409, error: "source_unavailable" };
  }

  const now = new Date();
  const paidRecord =
    current?.status === "failed" && current.retryCount < 2
      ? await markPaidResultProcessing({
          paidResultId: current.id,
          requestedByUnlockIntentId: input.unlockIntentId,
          promptVersion: PAID_RESULT_PROMPT_VERSION,
          schemaVersion: PAID_RESULT_SCHEMA_VERSION,
          startedAt: now,
        })
      : await createPaidResultRecord({
          analysisResultId: input.resultId,
          moduleId: input.moduleConfig.moduleId,
          themeSlug: input.moduleConfig.slug,
          status: "processing",
          requestedByUnlockIntentId: input.unlockIntentId,
          requestedReason: "unlock_intent",
          promptVersion: PAID_RESULT_PROMPT_VERSION,
          schemaVersion: PAID_RESULT_SCHEMA_VERSION,
          startedAt: now,
          retentionExpiresAt: record.result.retentionExpiresAt,
        });

  if (!paidRecord) {
    return { ok: false as const, status: 500, error: "paid_record_unavailable" };
  }

  const providerInfo = getActiveProviderInfo();
  const runtimeStrategy = resolveRuntimeStrategy(providerInfo);
  const startedAt = Date.now();

  await insertEvent({
    eventName: "paid_generation_started",
    moduleId: input.moduleConfig.moduleId,
    themeSlug: input.moduleConfig.slug,
    experimentId: input.moduleConfig.experimentId,
    visualVariant: record.result.visualVariant,
    promptVersion: PAID_RESULT_PROMPT_VERSION,
    schemaVersion: PAID_RESULT_SCHEMA_VERSION,
    anonymousSessionId: record.request.anonymousSessionId,
    scoreBucket: record.result.scoreBucket,
    metadata: {
      resultId: input.resultId,
      unlockIntentId: input.unlockIntentId,
      status: "processing",
    },
  });

  try {
    let generated: {
      paidResult: Awaited<ReturnType<typeof generatePaidResult>>["paidResult"];
      model: string;
      source: PaidGenerationSource;
      fallbackReason?: string;
      validationDiagnostics?: PaidResultValidationDiagnostics | null;
    };

    try {
      generated = await generatePaidResult({
        redactedInput: record.request.rawInputRedacted,
        freeResult: record.result.normalizedResultJson,
        userContext: record.request.userContextJson,
        providerModel: runtimeStrategy.primaryModel,
      });
    } catch (error) {
      if (isProviderConfigError(error)) {
        throw error;
      }

      if (isOutputValidationError(error)) {
        try {
          generated = await generatePaidResult({
            redactedInput: record.request.rawInputRedacted,
            freeResult: record.result.normalizedResultJson,
            userContext: record.request.userContextJson,
            providerModel: runtimeStrategy.primaryModel,
          });
        } catch (retryError) {
          if (isProviderConfigError(retryError)) {
            throw retryError;
          }

          generated = {
            paidResult: buildProviderFallbackPaidResult({
              freeResult: record.result.normalizedResultJson,
              userContext: record.request.userContextJson,
            }),
            model: PAID_RESULT_PROVIDER_FALLBACK_MODEL,
            source: "fallback",
            fallbackReason: getSafeErrorCode(retryError),
            validationDiagnostics: getPaidResultValidationDiagnostics(retryError),
          };
        }
      } else {
        generated = {
          paidResult: buildProviderFallbackPaidResult({
            freeResult: record.result.normalizedResultJson,
            userContext: record.request.userContextJson,
          }),
          model: PAID_RESULT_PROVIDER_FALLBACK_MODEL,
          source: "fallback",
          fallbackReason: getSafeErrorCode(error),
          validationDiagnostics: getPaidResultValidationDiagnostics(error),
        };
      }
    }

    const completedRecord = await markPaidResultCompleted({
      paidResultId: paidRecord.id,
      paidResultJson: generated.paidResult,
      model: generated.model,
    });

    await insertEvent({
      eventName: "paid_generation_completed",
      moduleId: input.moduleConfig.moduleId,
      themeSlug: input.moduleConfig.slug,
      experimentId: input.moduleConfig.experimentId,
      visualVariant: record.result.visualVariant,
      promptVersion: PAID_RESULT_PROMPT_VERSION,
      schemaVersion: PAID_RESULT_SCHEMA_VERSION,
      anonymousSessionId: record.request.anonymousSessionId,
      scoreBucket: record.result.scoreBucket,
      metadata: {
        resultId: input.resultId,
        unlockIntentId: input.unlockIntentId,
        status: "completed",
        source: generated.source,
        fallbackReason: generated.fallbackReason,
        validationDiagnostics: generated.validationDiagnostics,
        elapsedMs: Date.now() - startedAt,
        retryCount: paidRecord.retryCount,
      },
    });

    return {
      ok: true as const,
      status: "completed" as PaidGenerationStatus,
      paidResultId: completedRecord?.id ?? paidRecord.id,
      source: generated.source,
      reused: false,
    };
  } catch (error) {
    const errorCode = getSafeErrorCode(error);
    await markPaidResultFailed({
      paidResultId: paidRecord.id,
      errorCode,
    });
    await insertEvent({
      eventName: "paid_generation_failed",
      moduleId: input.moduleConfig.moduleId,
      themeSlug: input.moduleConfig.slug,
      experimentId: input.moduleConfig.experimentId,
      visualVariant: record.result.visualVariant,
      promptVersion: PAID_RESULT_PROMPT_VERSION,
      schemaVersion: PAID_RESULT_SCHEMA_VERSION,
      anonymousSessionId: record.request.anonymousSessionId,
      scoreBucket: record.result.scoreBucket,
      metadata: {
        resultId: input.resultId,
        unlockIntentId: input.unlockIntentId,
        status: "failed",
        errorCategory: errorCode,
        elapsedMs: Date.now() - startedAt,
        retryCount: paidRecord.retryCount + 1,
      },
    });

    return {
      ok: true as const,
      status: "failed" as PaidGenerationStatus,
      paidResultId: paidRecord.id,
      errorCategory: errorCode,
      reused: false,
    };
  }
}
