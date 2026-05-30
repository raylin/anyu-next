import {
  PAID_RESULT_PROMPT_VERSION,
  PAID_RESULT_SCHEMA_VERSION,
} from "@/lib/ai/paid-result-generation";
import {
  claimDuePaidAnalysisJobById,
  claimDuePaidAnalysisJobs,
  getGenerationJobById,
  listDueGenerationJobs,
  markGenerationJobCompleted,
  markGenerationJobFailedFinal,
  markGenerationJobRetryScheduled,
  recoverStalePaidAnalysisJobs,
  type GenerationJob,
} from "@/lib/db/generation-jobs";
import {
  createPaidResultRecord,
  getPaidResultForAnalysisResult,
  markPaidResultCompleted,
  markPaidResultFailed,
  markPaidResultProcessing,
} from "@/lib/db/paid-results";
import { getAnalysisResultWithRequestById } from "@/lib/db/runtime";
import { getModuleBySlug } from "@/lib/modules/registry";
import {
  generateDeferredPaidResultPayload,
  getSafePaidGenerationErrorCode,
} from "@/lib/modules/paid-generation-service";

export type PaidGenerationProcessorResult = {
  ok: true;
  dryRun: boolean;
  processed: number;
  completed: number;
  retryScheduled: number;
  failedFinal: number;
  staleRecovered: number;
  skipped: number;
};

export type TargetedPaidGenerationProcessorCategory =
  | "processed"
  | "already_completed"
  | "already_processing"
  | "not_found"
  | "invalid_job"
  | "failed"
  | "retryable_error"
  | "unexpected_error";

export type TargetedPaidGenerationProcessorResult =
  | {
      ok: true;
      category: "processed" | "already_completed";
      jobId: string;
      jobResult?: "completed" | "retry_scheduled" | "failed_final";
    }
  | {
      ok: false;
      category: Exclude<TargetedPaidGenerationProcessorCategory, "processed" | "already_completed">;
      jobId: string;
    };

const DEFAULT_PROCESSOR_LIMIT = 1;
const MAX_PROCESSOR_LIMIT = 3;
const STALE_LOCK_TIMEOUT_MS = 10 * 60 * 1000;

function clampProcessorLimit(limit?: number) {
  if (!Number.isFinite(limit)) {
    return DEFAULT_PROCESSOR_LIMIT;
  }

  return Math.max(1, Math.min(Math.trunc(limit ?? DEFAULT_PROCESSOR_LIMIT), MAX_PROCESSOR_LIMIT));
}

function getBackoffMs(errorCategory: string, attemptCount: number) {
  if (errorCategory === "provider_http_429") {
    return 5 * 60 * 1000;
  }

  return attemptCount <= 1 ? 30 * 1000 : 2 * 60 * 1000;
}

function isRetryablePaidGenerationError(errorCategory: string) {
  return (
    errorCategory === "output_validation" ||
    errorCategory === "provider" ||
    errorCategory === "provider_http_408" ||
    errorCategory === "provider_http_429" ||
    errorCategory === "provider_http_500" ||
    errorCategory === "provider_http_502" ||
    errorCategory === "provider_http_503" ||
    errorCategory === "provider_http_504"
  );
}

async function markJobFailure(input: {
  job: GenerationJob;
  errorCategory: string;
  paidResultId?: string | null;
  now: Date;
}) {
  if (input.paidResultId) {
    await markPaidResultFailed({
      paidResultId: input.paidResultId,
      errorCode: input.errorCategory,
      failedAt: input.now,
    });
  }

  if (
    isRetryablePaidGenerationError(input.errorCategory) &&
    input.job.attemptCount < input.job.maxAttempts
  ) {
    await markGenerationJobRetryScheduled({
      jobId: input.job.id,
      nextRunAt: new Date(input.now.getTime() + getBackoffMs(input.errorCategory, input.job.attemptCount)),
      errorCategory: input.errorCategory,
      errorAt: input.now,
    });

    return "retry_scheduled" as const;
  }

  await markGenerationJobFailedFinal({
    jobId: input.job.id,
    errorCategory: input.errorCategory,
    errorAt: input.now,
  });

  return "failed_final" as const;
}

async function processPaidAnalysisJob(job: GenerationJob, now: Date) {
  if (job.inputRefType !== "analysis_result") {
    await markGenerationJobFailedFinal({
      jobId: job.id,
      errorCategory: "input_invalid",
      errorAt: now,
    });
    return "failed_final" as const;
  }

  const moduleConfig = getModuleBySlug(job.moduleSlug);

  if (!moduleConfig) {
    await markGenerationJobFailedFinal({
      jobId: job.id,
      errorCategory: "module_not_found",
      errorAt: now,
    });
    return "failed_final" as const;
  }

  const record = await getAnalysisResultWithRequestById(
    job.inputRefId,
    moduleConfig.moduleId,
    moduleConfig.slug,
  );

  if (!record) {
    await markGenerationJobFailedFinal({
      jobId: job.id,
      errorCategory: "result_not_found",
      errorAt: now,
    });
    return "failed_final" as const;
  }

  const completed = await getPaidResultForAnalysisResult({
    analysisResultId: job.inputRefId,
    status: "completed",
    promptVersion: PAID_RESULT_PROMPT_VERSION,
    schemaVersion: PAID_RESULT_SCHEMA_VERSION,
  });

  if (completed) {
    await markGenerationJobCompleted({
      jobId: job.id,
      outputRefId: completed.id,
      source: completed.model?.includes("fallback") ? "fallback" : "provider",
      modelName: completed.model,
    });
    return "completed" as const;
  }

  if (!record.request.rawInputRedacted) {
    await markGenerationJobFailedFinal({
      jobId: job.id,
      errorCategory: "source_unavailable",
      errorAt: now,
    });
    return "failed_final" as const;
  }

  const current = await getPaidResultForAnalysisResult({
    analysisResultId: job.inputRefId,
    promptVersion: PAID_RESULT_PROMPT_VERSION,
    schemaVersion: PAID_RESULT_SCHEMA_VERSION,
  });
  const paidRecord = current
    ? await markPaidResultProcessing({
        paidResultId: current.id,
        promptVersion: PAID_RESULT_PROMPT_VERSION,
        schemaVersion: PAID_RESULT_SCHEMA_VERSION,
        startedAt: now,
      })
    : await createPaidResultRecord({
        analysisResultId: job.inputRefId,
        moduleId: moduleConfig.moduleId,
        themeSlug: moduleConfig.slug,
        status: "processing",
        requestedReason: "generation_job",
        promptVersion: PAID_RESULT_PROMPT_VERSION,
        schemaVersion: PAID_RESULT_SCHEMA_VERSION,
        startedAt: now,
        retentionExpiresAt: record.result.retentionExpiresAt,
      });

  if (!paidRecord) {
    await markGenerationJobFailedFinal({
      jobId: job.id,
      errorCategory: "paid_record_unavailable",
      errorAt: now,
    });
    return "failed_final" as const;
  }

  try {
    const generated = await generateDeferredPaidResultPayload({ record });
    const completedRecord = await markPaidResultCompleted({
      paidResultId: paidRecord.id,
      paidResultJson: generated.paidResult,
      model: generated.model,
      completedAt: now,
    });

    await markGenerationJobCompleted({
      jobId: job.id,
      outputRefId: completedRecord?.id ?? paidRecord.id,
      source: generated.source,
      modelProvider: generated.providerInfo.provider,
      modelName: generated.model,
    });

    return "completed" as const;
  } catch (error) {
    return markJobFailure({
      job,
      paidResultId: paidRecord.id,
      errorCategory: getSafePaidGenerationErrorCode(error),
      now,
    });
  }
}

function classifyUnclaimedTargetJob(
  job: GenerationJob | null,
): Exclude<TargetedPaidGenerationProcessorCategory, "processed"> {
  if (!job) {
    return "not_found";
  }

  if (job.jobType !== "paid_analysis" || job.inputRefType !== "analysis_result") {
    return "invalid_job";
  }

  if (job.status === "completed") {
    return "already_completed";
  }

  if (job.status === "processing") {
    return "already_processing";
  }

  if (job.status === "failed_final" || job.attemptCount >= job.maxAttempts) {
    return "failed";
  }

  return "retryable_error";
}

export async function processPaidAnalysisJobById(input: {
  generationJobId: string;
  lockedBy?: string;
  now?: Date;
}): Promise<TargetedPaidGenerationProcessorResult> {
  const now = input.now ?? new Date();
  const jobId = input.generationJobId;

  try {
    const claimedJob = await claimDuePaidAnalysisJobById({
      jobId,
      lockedBy: input.lockedBy ?? "paid_generation_queue",
      now,
    });

    if (!claimedJob) {
      const currentJob = await getGenerationJobById(jobId);
      const category = classifyUnclaimedTargetJob(currentJob);

      if (category === "already_completed") {
        return { ok: true, category, jobId };
      }

      return { ok: false, category, jobId };
    }

    const jobResult = await processPaidAnalysisJob(claimedJob, now);

    if (jobResult === "completed") {
      return { ok: true, category: "processed", jobId, jobResult };
    }

    if (jobResult === "retry_scheduled") {
      return { ok: false, category: "retryable_error", jobId };
    }

    return { ok: false, category: "failed", jobId };
  } catch {
    return { ok: false, category: "unexpected_error", jobId };
  }
}

export async function processPaidAnalysisJobs(input: {
  limit?: number;
  dryRun?: boolean;
  lockedBy?: string;
  now?: Date;
} = {}): Promise<PaidGenerationProcessorResult> {
  const now = input.now ?? new Date();
  const limit = clampProcessorLimit(input.limit);

  if (input.dryRun) {
    const dueJobs = await listDueGenerationJobs({
      now,
      limit,
      jobType: "paid_analysis",
    });

    return {
      ok: true,
      dryRun: true,
      processed: 0,
      completed: 0,
      retryScheduled: 0,
      failedFinal: 0,
      staleRecovered: 0,
      skipped: dueJobs.length,
    };
  }

  const stale = await recoverStalePaidAnalysisJobs({
    now,
    staleBefore: new Date(now.getTime() - STALE_LOCK_TIMEOUT_MS),
  });
  const claimedJobs = await claimDuePaidAnalysisJobs({
    now,
    limit,
    lockedBy: input.lockedBy ?? "paid_generation_processor",
  });
  const result: PaidGenerationProcessorResult = {
    ok: true,
    dryRun: false,
    processed: claimedJobs.length,
    completed: 0,
    retryScheduled: stale.retryScheduled,
    failedFinal: stale.failedFinal,
    staleRecovered: stale.staleRecovered,
    skipped: 0,
  };

  for (const job of claimedJobs) {
    const jobResult = await processPaidAnalysisJob(job, now);

    if (jobResult === "completed") {
      result.completed += 1;
    } else if (jobResult === "retry_scheduled") {
      result.retryScheduled += 1;
    } else if (jobResult === "failed_final") {
      result.failedFinal += 1;
    } else {
      result.skipped += 1;
    }
  }

  return result;
}
