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
  createOrReusePaidAnalysisJob,
  markGenerationJobCompleted,
  markGenerationJobFailedFinal,
  markGenerationJobProcessing,
  type GenerationJob,
  type GenerationJobTriggerSource,
} from "@/lib/db/generation-jobs";
import {
  getActiveProviderInfo,
  getProviderRuntimeErrorCode,
  isProviderConfigError,
} from "@/lib/ai/provider";
import { getAnalysisResultWithRequestById, getUnlockIntentById, insertEvent } from "@/lib/db/runtime";
import type { ProductModuleConfig } from "@/lib/modules/types";
import { isPaidGenerationJobsEnabled } from "@/lib/runtime/feature-flags";

export type PaidGenerationStatus = "processing" | "completed" | "failed" | "expired";
type PaidGenerationSource = "provider" | "fallback";
type PaidGenerationJobMirror = {
  job: GenerationJob;
  created: boolean;
};

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

async function createPaidGenerationJobMirror(input: {
  moduleSlug: string;
  analysisResultId: string;
  triggerSource: GenerationJobTriggerSource;
  modelProvider?: string | null;
  modelName?: string | null;
}): Promise<PaidGenerationJobMirror | null> {
  if (!isPaidGenerationJobsEnabled()) {
    return null;
  }

  try {
    return await createOrReusePaidAnalysisJob({
      moduleSlug: input.moduleSlug,
      analysisResultId: input.analysisResultId,
      triggerSource: input.triggerSource,
      promptVersion: PAID_RESULT_PROMPT_VERSION,
      schemaVersion: PAID_RESULT_SCHEMA_VERSION,
      modelProvider: input.modelProvider,
      modelName: input.modelName,
    });
  } catch {
    return null;
  }
}

async function markPaidGenerationJobProcessing(jobMirror: PaidGenerationJobMirror | null) {
  if (!jobMirror) {
    return;
  }

  if (!jobMirror.created && jobMirror.job.status === "processing") {
    return;
  }

  if (jobMirror.job.status === "completed") {
    return;
  }

  try {
    await markGenerationJobProcessing({
      jobId: jobMirror.job.id,
      lockedBy: "direct_paid_generation",
    });
  } catch {
    // Phase 2 job mirroring is intentionally fail-open.
  }
}

async function markPaidGenerationJobCompleted(input: {
  jobMirror: PaidGenerationJobMirror | null;
  paidResultId: string;
  source?: PaidGenerationSource | null;
  modelProvider?: string | null;
  modelName?: string | null;
}) {
  if (!input.jobMirror) {
    return;
  }

  try {
    await markGenerationJobCompleted({
      jobId: input.jobMirror.job.id,
      outputRefId: input.paidResultId,
      source: input.source,
      modelProvider: input.modelProvider,
      modelName: input.modelName,
    });
  } catch {
    // Phase 2 job mirroring is intentionally fail-open.
  }
}

async function markPaidGenerationJobFailedFinal(input: {
  jobMirror: PaidGenerationJobMirror | null;
  errorCategory: string;
}) {
  if (!input.jobMirror) {
    return;
  }

  try {
    await markGenerationJobFailedFinal({
      jobId: input.jobMirror.job.id,
      errorCategory: input.errorCategory,
    });
  } catch {
    // Phase 2 job mirroring is intentionally fail-open.
  }
}

export async function requestDeferredPaidGeneration(input: {
  moduleConfig: ProductModuleConfig;
  resultId: string;
  unlockIntentId: string;
  triggerSource?: GenerationJobTriggerSource;
}) {
  const triggerSource = input.triggerSource ?? "web_unlock";
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
    const completedJobMirror = await createPaidGenerationJobMirror({
      moduleSlug: input.moduleConfig.slug,
      analysisResultId: input.resultId,
      triggerSource,
      modelName: completed.model,
    });
    await markPaidGenerationJobCompleted({
      jobMirror: completedJobMirror,
      paidResultId: completed.id,
      source: getPaidGenerationSourceFromModel(completed.model),
      modelName: completed.model,
    });

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
    const processingJobMirror = await createPaidGenerationJobMirror({
      moduleSlug: input.moduleConfig.slug,
      analysisResultId: input.resultId,
      triggerSource,
      modelName: current.model,
    });
    await markPaidGenerationJobProcessing(processingJobMirror);

    return {
      ok: true as const,
      status: "processing" as PaidGenerationStatus,
      paidResultId: current.id,
      reused: true,
    };
  }

  if (current?.status === "failed" && current.retryCount >= 2) {
    const failedJobMirror = await createPaidGenerationJobMirror({
      moduleSlug: input.moduleConfig.slug,
      analysisResultId: input.resultId,
      triggerSource,
      modelName: current.model,
    });
    await markPaidGenerationJobFailedFinal({
      jobMirror: failedJobMirror,
      errorCategory: current.errorCode ?? "provider",
    });

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

  const providerInfo = getActiveProviderInfo();
  const jobMirror = await createPaidGenerationJobMirror({
    moduleSlug: input.moduleConfig.slug,
    analysisResultId: input.resultId,
    triggerSource,
    modelProvider: providerInfo.provider,
    modelName: providerInfo.model,
  });
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
    await markPaidGenerationJobFailedFinal({
      jobMirror,
      errorCategory: "paid_record_unavailable",
    });
    return { ok: false as const, status: 500, error: "paid_record_unavailable" };
  }

  await markPaidGenerationJobProcessing(jobMirror);

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
    const completedPaidResultId = completedRecord?.id ?? paidRecord.id;

    await markPaidGenerationJobCompleted({
      jobMirror,
      paidResultId: completedPaidResultId,
      source: generated.source,
      modelProvider: providerInfo.provider,
      modelName: generated.model,
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
      paidResultId: completedPaidResultId,
      source: generated.source,
      reused: false,
    };
  } catch (error) {
    const errorCode = getSafeErrorCode(error);
    await markPaidGenerationJobFailedFinal({
      jobMirror,
      errorCategory: errorCode,
    });
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
