import { and, asc, eq, inArray, lte, sql } from "drizzle-orm";
import { requireDb } from "@/lib/db/client";
import { generationJobs } from "@/lib/db/schema";

export const GENERATION_JOB_TYPES = ["paid_analysis"] as const;
export const GENERATION_JOB_STATUSES = [
  "queued",
  "processing",
  "retry_scheduled",
  "completed",
  "failed_final",
] as const;
export const GENERATION_JOB_TRIGGER_SOURCES = [
  "web_unlock",
  "line_bind",
  "short_code",
  "payment_success_future",
  "operator",
] as const;
export const GENERATION_JOB_INPUT_REF_TYPES = ["analysis_result"] as const;
export const GENERATION_JOB_OUTPUT_REF_TYPES = ["analysis_paid_result"] as const;

export type GenerationJobType = (typeof GENERATION_JOB_TYPES)[number];
export type GenerationJobStatus = (typeof GENERATION_JOB_STATUSES)[number];
export type GenerationJobTriggerSource = (typeof GENERATION_JOB_TRIGGER_SOURCES)[number];
export type GenerationJobInputRefType = (typeof GENERATION_JOB_INPUT_REF_TYPES)[number];
export type GenerationJobOutputRefType = (typeof GENERATION_JOB_OUTPUT_REF_TYPES)[number];
export type GenerationJob = typeof generationJobs.$inferSelect;

const PAID_ANALYSIS_JOB_TYPE: GenerationJobType = "paid_analysis";
const PAID_ANALYSIS_INPUT_REF_TYPE: GenerationJobInputRefType = "analysis_result";
const PAID_ANALYSIS_OUTPUT_REF_TYPE: GenerationJobOutputRefType = "analysis_paid_result";
const DEFAULT_PRIORITY = 50;
const DEFAULT_MAX_ATTEMPTS = 3;

function assertAllowed<T extends string>(
  value: string,
  allowed: readonly T[],
  label: string,
): asserts value is T {
  if (!allowed.includes(value as T)) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
}

function assertSafeDedupePart(value: string, label: string) {
  if (!/^[A-Za-z0-9._:-]{1,160}$/u.test(value)) {
    throw new Error(`Invalid paid generation job dedupe ${label}.`);
  }
}

export function buildPaidAnalysisJobDedupeKey(input: {
  moduleSlug: string;
  analysisResultId: string;
  promptVersion: string;
  schemaVersion: string;
}) {
  assertSafeDedupePart(input.moduleSlug, "moduleSlug");
  assertSafeDedupePart(input.analysisResultId, "analysisResultId");
  assertSafeDedupePart(input.promptVersion, "promptVersion");
  assertSafeDedupePart(input.schemaVersion, "schemaVersion");

  return [
    PAID_ANALYSIS_JOB_TYPE,
    input.moduleSlug,
    input.analysisResultId,
    input.promptVersion,
    input.schemaVersion,
  ].join(":");
}

export async function createOrReusePaidAnalysisJob(input: {
  moduleSlug: string;
  analysisResultId: string;
  triggerSource: GenerationJobTriggerSource;
  priority?: number;
  promptVersion: string;
  schemaVersion: string;
  operatorTest?: boolean;
  modelProvider?: string | null;
  modelName?: string | null;
  nextRunAt?: Date;
  maxAttempts?: number;
}) {
  assertAllowed(input.triggerSource, GENERATION_JOB_TRIGGER_SOURCES, "triggerSource");

  const db = requireDb();
  const now = new Date();
  const dedupeKey = buildPaidAnalysisJobDedupeKey({
    moduleSlug: input.moduleSlug,
    analysisResultId: input.analysisResultId,
    promptVersion: input.promptVersion,
    schemaVersion: input.schemaVersion,
  });

  const [created] = await db
    .insert(generationJobs)
    .values({
      jobType: PAID_ANALYSIS_JOB_TYPE,
      status: "queued",
      priority: input.priority ?? DEFAULT_PRIORITY,
      moduleSlug: input.moduleSlug,
      inputRefType: PAID_ANALYSIS_INPUT_REF_TYPE,
      inputRefId: input.analysisResultId,
      outputRefType: PAID_ANALYSIS_OUTPUT_REF_TYPE,
      triggerSource: input.triggerSource,
      dedupeKey,
      maxAttempts: input.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
      nextRunAt: input.nextRunAt ?? now,
      modelProvider: input.modelProvider ?? null,
      modelName: input.modelName ?? null,
      promptVersion: input.promptVersion,
      schemaVersion: input.schemaVersion,
      operatorTest: input.operatorTest ?? false,
      updatedAt: now,
    })
    .onConflictDoNothing({ target: generationJobs.dedupeKey })
    .returning();

  if (created) {
    return {
      job: created,
      created: true,
    };
  }

  const existing = await getGenerationJobByDedupeKey(dedupeKey);

  if (!existing) {
    throw new Error("generation_job_reuse_failed");
  }

  return {
    job: existing,
    created: false,
  };
}

export async function getGenerationJobById(id: string) {
  const db = requireDb();
  const [record] = await db
    .select()
    .from(generationJobs)
    .where(eq(generationJobs.id, id))
    .limit(1);

  return record ?? null;
}

export async function getGenerationJobByDedupeKey(dedupeKey: string) {
  const db = requireDb();
  const [record] = await db
    .select()
    .from(generationJobs)
    .where(eq(generationJobs.dedupeKey, dedupeKey))
    .limit(1);

  return record ?? null;
}

export async function markGenerationJobProcessing(input: {
  jobId: string;
  lockedBy: string;
  lockedAt?: Date;
}) {
  const db = requireDb();
  const now = new Date();

  const [record] = await db
    .update(generationJobs)
    .set({
      status: "processing",
      attemptCount: sql`${generationJobs.attemptCount} + 1`,
      lockedAt: input.lockedAt ?? now,
      lockedBy: input.lockedBy,
      updatedAt: now,
    })
    .where(eq(generationJobs.id, input.jobId))
    .returning();

  return record ?? null;
}

export async function markGenerationJobCompleted(input: {
  jobId: string;
  outputRefId: string;
  outputRefType?: GenerationJobOutputRefType;
  source?: string | null;
  modelProvider?: string | null;
  modelName?: string | null;
}) {
  if (input.outputRefType) {
    assertAllowed(input.outputRefType, GENERATION_JOB_OUTPUT_REF_TYPES, "outputRefType");
  }

  const db = requireDb();
  const now = new Date();

  const [record] = await db
    .update(generationJobs)
    .set({
      status: "completed",
      outputRefType: input.outputRefType ?? PAID_ANALYSIS_OUTPUT_REF_TYPE,
      outputRefId: input.outputRefId,
      source: input.source ?? undefined,
      modelProvider: input.modelProvider ?? undefined,
      modelName: input.modelName ?? undefined,
      lockedAt: null,
      lockedBy: null,
      lastErrorCategory: null,
      lastErrorCode: null,
      lastErrorAt: null,
      updatedAt: now,
    })
    .where(eq(generationJobs.id, input.jobId))
    .returning();

  return record ?? null;
}

export async function markGenerationJobRetryScheduled(input: {
  jobId: string;
  nextRunAt: Date;
  errorCategory: string;
  errorCode?: string | null;
  errorAt?: Date;
}) {
  const db = requireDb();
  const now = new Date();

  const [record] = await db
    .update(generationJobs)
    .set({
      status: "retry_scheduled",
      nextRunAt: input.nextRunAt,
      lockedAt: null,
      lockedBy: null,
      lastErrorCategory: input.errorCategory,
      lastErrorCode: input.errorCode ?? null,
      lastErrorAt: input.errorAt ?? now,
      updatedAt: now,
    })
    .where(eq(generationJobs.id, input.jobId))
    .returning();

  return record ?? null;
}

export async function markGenerationJobFailedFinal(input: {
  jobId: string;
  errorCategory: string;
  errorCode?: string | null;
  errorAt?: Date;
}) {
  const db = requireDb();
  const now = new Date();

  const [record] = await db
    .update(generationJobs)
    .set({
      status: "failed_final",
      lockedAt: null,
      lockedBy: null,
      lastErrorCategory: input.errorCategory,
      lastErrorCode: input.errorCode ?? null,
      lastErrorAt: input.errorAt ?? now,
      updatedAt: now,
    })
    .where(eq(generationJobs.id, input.jobId))
    .returning();

  return record ?? null;
}

export async function listDueGenerationJobs(input: {
  now?: Date;
  limit?: number;
  jobType?: GenerationJobType;
}) {
  if (input.jobType) {
    assertAllowed(input.jobType, GENERATION_JOB_TYPES, "jobType");
  }

  const db = requireDb();
  const now = input.now ?? new Date();

  return db
    .select()
    .from(generationJobs)
    .where(
      and(
        inArray(generationJobs.status, ["queued", "retry_scheduled"]),
        lte(generationJobs.nextRunAt, now),
        input.jobType ? eq(generationJobs.jobType, input.jobType) : undefined,
      ),
    )
    .orderBy(asc(generationJobs.priority), asc(generationJobs.nextRunAt))
    .limit(input.limit ?? 10);
}
