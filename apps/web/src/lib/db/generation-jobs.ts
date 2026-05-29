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
type GenerationJobSqlRow = {
  id: string;
  job_type: GenerationJobType;
  status: GenerationJobStatus;
  priority: number;
  module_slug: string;
  input_ref_type: GenerationJobInputRefType;
  input_ref_id: string;
  output_ref_type: GenerationJobOutputRefType | null;
  output_ref_id: string | null;
  trigger_source: GenerationJobTriggerSource;
  dedupe_key: string;
  entitlement_ref_id: string | null;
  attempt_count: number;
  max_attempts: number;
  next_run_at: Date;
  locked_at: Date | null;
  locked_by: string | null;
  last_error_category: string | null;
  last_error_code: string | null;
  last_error_at: Date | null;
  model_provider: string | null;
  model_name: string | null;
  prompt_version: string | null;
  schema_version: string | null;
  source: string | null;
  operator_test: boolean;
  created_at: Date;
  updated_at: Date;
};

const PAID_ANALYSIS_JOB_TYPE: GenerationJobType = "paid_analysis";
const PAID_ANALYSIS_INPUT_REF_TYPE: GenerationJobInputRefType = "analysis_result";
const PAID_ANALYSIS_OUTPUT_REF_TYPE: GenerationJobOutputRefType = "analysis_paid_result";
const DEFAULT_PRIORITY = 50;
const DEFAULT_MAX_ATTEMPTS = 3;

function mapGenerationJobSqlRow(row: GenerationJobSqlRow): GenerationJob {
  return {
    id: row.id,
    jobType: row.job_type,
    status: row.status,
    priority: row.priority,
    moduleSlug: row.module_slug,
    inputRefType: row.input_ref_type,
    inputRefId: row.input_ref_id,
    outputRefType: row.output_ref_type,
    outputRefId: row.output_ref_id,
    triggerSource: row.trigger_source,
    dedupeKey: row.dedupe_key,
    entitlementRefId: row.entitlement_ref_id,
    attemptCount: row.attempt_count,
    maxAttempts: row.max_attempts,
    nextRunAt: row.next_run_at,
    lockedAt: row.locked_at,
    lockedBy: row.locked_by,
    lastErrorCategory: row.last_error_category,
    lastErrorCode: row.last_error_code,
    lastErrorAt: row.last_error_at,
    modelProvider: row.model_provider,
    modelName: row.model_name,
    promptVersion: row.prompt_version,
    schemaVersion: row.schema_version,
    source: row.source,
    operatorTest: row.operator_test,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

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
  entitlementRefId?: string | null;
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
      entitlementRefId: input.entitlementRefId ?? null,
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

export async function claimDuePaidAnalysisJobs(input: {
  limit: number;
  lockedBy: string;
  now?: Date;
}) {
  const db = requireDb();
  const now = input.now ?? new Date();
  const limit = Math.max(1, Math.min(Math.trunc(input.limit), 10));

  const result = await db.execute(sql`
    WITH due AS (
      SELECT id
      FROM generation_jobs
      WHERE job_type = ${PAID_ANALYSIS_JOB_TYPE}
        AND status IN ('queued', 'retry_scheduled')
        AND next_run_at <= ${now}
        AND attempt_count < max_attempts
      ORDER BY priority DESC, next_run_at ASC, created_at ASC
      LIMIT ${limit}
      FOR UPDATE SKIP LOCKED
    )
    UPDATE generation_jobs
    SET
      status = 'processing',
      attempt_count = attempt_count + 1,
      locked_at = ${now},
      locked_by = ${input.lockedBy},
      updated_at = ${now}
    WHERE id IN (SELECT id FROM due)
    RETURNING
      id,
      job_type,
      status,
      priority,
      module_slug,
      input_ref_type,
      input_ref_id,
      output_ref_type,
      output_ref_id,
      trigger_source,
      dedupe_key,
      entitlement_ref_id,
      attempt_count,
      max_attempts,
      next_run_at,
      locked_at,
      locked_by,
      last_error_category,
      last_error_code,
      last_error_at,
      model_provider,
      model_name,
      prompt_version,
      schema_version,
      source,
      operator_test,
      created_at,
      updated_at
  `);

  return (result.rows as GenerationJobSqlRow[]).map(mapGenerationJobSqlRow);
}

export async function recoverStalePaidAnalysisJobs(input: {
  now?: Date;
  staleBefore: Date;
}) {
  const db = requireDb();
  const now = input.now ?? new Date();

  const retryable = await db.execute(sql`
    UPDATE generation_jobs
    SET
      status = 'retry_scheduled',
      next_run_at = ${now},
      locked_at = NULL,
      locked_by = NULL,
      last_error_category = 'stale_lock_recovered',
      last_error_code = NULL,
      last_error_at = ${now},
      updated_at = ${now}
    WHERE job_type = ${PAID_ANALYSIS_JOB_TYPE}
      AND status = 'processing'
      AND locked_at < ${input.staleBefore}
      AND attempt_count < max_attempts
    RETURNING id
  `);

  const final = await db.execute(sql`
    UPDATE generation_jobs
    SET
      status = 'failed_final',
      locked_at = NULL,
      locked_by = NULL,
      last_error_category = 'stale_lock_failed_final',
      last_error_code = NULL,
      last_error_at = ${now},
      updated_at = ${now}
    WHERE job_type = ${PAID_ANALYSIS_JOB_TYPE}
      AND status = 'processing'
      AND locked_at < ${input.staleBefore}
      AND attempt_count >= max_attempts
    RETURNING id
  `);

  return {
    retryScheduled: retryable.rows.length,
    failedFinal: final.rows.length,
    staleRecovered: retryable.rows.length + final.rows.length,
  };
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
