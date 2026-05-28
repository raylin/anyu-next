import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockRequireDb } = vi.hoisted(() => ({
  mockRequireDb: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  requireDb: mockRequireDb,
}));

import {
  buildPaidAnalysisJobDedupeKey,
  claimDuePaidAnalysisJobs,
  createOrReusePaidAnalysisJob,
  GENERATION_JOB_INPUT_REF_TYPES,
  GENERATION_JOB_OUTPUT_REF_TYPES,
  GENERATION_JOB_STATUSES,
  GENERATION_JOB_TRIGGER_SOURCES,
  GENERATION_JOB_TYPES,
  getGenerationJobByDedupeKey,
  getGenerationJobById,
  listDueGenerationJobs,
  markGenerationJobCompleted,
  markGenerationJobFailedFinal,
  markGenerationJobProcessing,
  markGenerationJobRetryScheduled,
  recoverStalePaidAnalysisJobs,
} from "@/lib/db/generation-jobs";

const JOB_ID = "11111111-1111-4111-8111-111111111111";
const RESULT_ID = "22222222-2222-4222-8222-222222222222";
const PAID_RESULT_ID = "33333333-3333-4333-8333-333333333333";
const NOW = new Date("2026-05-27T12:00:00.000Z");

function createInsertDb(returningRows: unknown[] = []) {
  const capture: { values?: unknown; conflictTarget?: unknown } = {};
  const chain = {
    values: vi.fn((values) => {
      capture.values = values;
      return chain;
    }),
    onConflictDoNothing: vi.fn((args) => {
      capture.conflictTarget = args;
      return chain;
    }),
    returning: vi.fn(async () => returningRows),
  };

  return {
    capture,
    db: {
      insert: vi.fn(() => chain),
    },
  };
}

function createSelectDb(returningRows: unknown[] = []) {
  const chain = {
    from: vi.fn(() => chain),
    where: vi.fn(() => chain),
    orderBy: vi.fn(() => chain),
    limit: vi.fn(async () => returningRows),
  };

  return {
    chain,
    db: {
      select: vi.fn(() => chain),
    },
  };
}

function createUpdateDb(returningRows: unknown[] = []) {
  const capture: { set?: Record<string, unknown> } = {};
  const chain = {
    set: vi.fn((values) => {
      capture.set = values;
      return chain;
    }),
    where: vi.fn(() => chain),
    returning: vi.fn(async () => returningRows),
  };

  return {
    capture,
    db: {
      update: vi.fn(() => chain),
    },
  };
}

function createExecuteDb(returningRows: unknown[] = []) {
  return {
    db: {
      execute: vi.fn(async () => ({
        rows: returningRows,
      })),
    },
  };
}

describe("generation job repository seams", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defines only the approved Phase 1 paid analysis values", () => {
    expect(GENERATION_JOB_TYPES).toEqual(["paid_analysis"]);
    expect(GENERATION_JOB_STATUSES).toEqual([
      "queued",
      "processing",
      "retry_scheduled",
      "completed",
      "failed_final",
    ]);
    expect(GENERATION_JOB_TRIGGER_SOURCES).toEqual([
      "web_unlock",
      "line_bind",
      "short_code",
      "payment_success_future",
      "operator",
    ]);
    expect(GENERATION_JOB_INPUT_REF_TYPES).toEqual(["analysis_result"]);
    expect(GENERATION_JOB_OUTPUT_REF_TYPES).toEqual(["analysis_paid_result"]);
  });

  it("builds a stable paid-analysis dedupe key without raw input", () => {
    const key = buildPaidAnalysisJobDedupeKey({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: RESULT_ID,
      promptVersion: "product_result_prompt_v0.5",
      schemaVersion: "paid_result_schema_v3",
    });

    expect(key).toBe(
      `paid_analysis:ambiguous-temperature:${RESULT_ID}:product_result_prompt_v0.5:paid_result_schema_v3`,
    );
    expect(key).not.toContain("他最近回訊息變慢");
    expect(key).not.toContain("LINE");
    expect(key).not.toContain("token");
  });

  it("rejects unsafe dedupe key parts", () => {
    expect(() =>
      buildPaidAnalysisJobDedupeKey({
        moduleSlug: "ambiguous-temperature",
        analysisResultId: RESULT_ID,
        promptVersion: "prompt with raw spaces",
        schemaVersion: "paid_result_schema_v3",
      }),
    ).toThrow("Invalid paid generation job dedupe promptVersion.");
  });

  it("creates one queued paid-analysis job", async () => {
    const createdJob = { id: JOB_ID, status: "queued" };
    const { db, capture } = createInsertDb([createdJob]);
    mockRequireDb.mockReturnValue(db);

    const result = await createOrReusePaidAnalysisJob({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: RESULT_ID,
      triggerSource: "web_unlock",
      promptVersion: "product_result_prompt_v0.5",
      schemaVersion: "paid_result_schema_v3",
      modelProvider: "anthropic",
      modelName: "claude-sonnet-4-20250514",
      operatorTest: true,
      nextRunAt: NOW,
    });

    expect(result).toEqual({ job: createdJob, created: true });
    expect(capture.values).toMatchObject({
      jobType: "paid_analysis",
      status: "queued",
      priority: 50,
      moduleSlug: "ambiguous-temperature",
      inputRefType: "analysis_result",
      inputRefId: RESULT_ID,
      outputRefType: "analysis_paid_result",
      triggerSource: "web_unlock",
      maxAttempts: 3,
      nextRunAt: NOW,
      modelProvider: "anthropic",
      modelName: "claude-sonnet-4-20250514",
      promptVersion: "product_result_prompt_v0.5",
      schemaVersion: "paid_result_schema_v3",
      operatorTest: true,
    });
    expect(String((capture.values as { dedupeKey: string }).dedupeKey)).toContain(RESULT_ID);
  });

  it("reuses an existing job on duplicate dedupe key", async () => {
    const existingJob = { id: JOB_ID, status: "processing" };
    const insert = createInsertDb([]);
    const select = createSelectDb([existingJob]);
    mockRequireDb.mockReturnValueOnce(insert.db).mockReturnValueOnce(select.db);

    const result = await createOrReusePaidAnalysisJob({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: RESULT_ID,
      triggerSource: "line_bind",
      promptVersion: "product_result_prompt_v0.5",
      schemaVersion: "paid_result_schema_v3",
    });

    expect(result).toEqual({ job: existingJob, created: false });
    expect(select.db.select).toHaveBeenCalledTimes(1);
  });

  it("gets jobs by ID and dedupe key", async () => {
    const selected = createSelectDb([{ id: JOB_ID }]);
    mockRequireDb.mockReturnValue(selected.db);
    await expect(getGenerationJobById(JOB_ID)).resolves.toEqual({ id: JOB_ID });

    const selectedByKey = createSelectDb([{ id: JOB_ID, dedupeKey: "key" }]);
    mockRequireDb.mockReturnValue(selectedByKey.db);
    await expect(getGenerationJobByDedupeKey("key")).resolves.toEqual({ id: JOB_ID, dedupeKey: "key" });
  });

  it("marks processing and increments attempt count when a processor claim begins", async () => {
    const { db, capture } = createUpdateDb([{ id: JOB_ID, status: "processing", attemptCount: 1 }]);
    mockRequireDb.mockReturnValue(db);

    await expect(
      markGenerationJobProcessing({
        jobId: JOB_ID,
        lockedBy: "worker-1",
        lockedAt: NOW,
      }),
    ).resolves.toMatchObject({ id: JOB_ID, status: "processing", attemptCount: 1 });

    expect(capture.set).toMatchObject({
      status: "processing",
      lockedAt: NOW,
      lockedBy: "worker-1",
    });
    expect(capture.set?.attemptCount).toBeTruthy();
  });

  it("marks completed and links the paid-result output ref", async () => {
    const { db, capture } = createUpdateDb([{ id: JOB_ID, status: "completed", outputRefId: PAID_RESULT_ID }]);
    mockRequireDb.mockReturnValue(db);

    await expect(
      markGenerationJobCompleted({
        jobId: JOB_ID,
        outputRefId: PAID_RESULT_ID,
        source: "provider",
        modelProvider: "anthropic",
        modelName: "claude-sonnet-4-20250514",
      }),
    ).resolves.toMatchObject({ id: JOB_ID, status: "completed", outputRefId: PAID_RESULT_ID });

    expect(capture.set).toMatchObject({
      status: "completed",
      outputRefType: "analysis_paid_result",
      outputRefId: PAID_RESULT_ID,
      source: "provider",
      modelProvider: "anthropic",
      modelName: "claude-sonnet-4-20250514",
      lockedAt: null,
      lockedBy: null,
      lastErrorCategory: null,
      lastErrorCode: null,
      lastErrorAt: null,
    });
  });

  it("marks retry scheduled with safe error metadata", async () => {
    const nextRunAt = new Date("2026-05-27T12:01:00.000Z");
    const { db, capture } = createUpdateDb([{ id: JOB_ID, status: "retry_scheduled" }]);
    mockRequireDb.mockReturnValue(db);

    await expect(
      markGenerationJobRetryScheduled({
        jobId: JOB_ID,
        nextRunAt,
        errorCategory: "provider_timeout",
        errorCode: "timeout",
        errorAt: NOW,
      }),
    ).resolves.toMatchObject({ id: JOB_ID, status: "retry_scheduled" });

    expect(capture.set).toMatchObject({
      status: "retry_scheduled",
      nextRunAt,
      lockedAt: null,
      lockedBy: null,
      lastErrorCategory: "provider_timeout",
      lastErrorCode: "timeout",
      lastErrorAt: NOW,
    });
  });

  it("marks failed final with safe error metadata", async () => {
    const { db, capture } = createUpdateDb([{ id: JOB_ID, status: "failed_final" }]);
    mockRequireDb.mockReturnValue(db);

    await expect(
      markGenerationJobFailedFinal({
        jobId: JOB_ID,
        errorCategory: "provider_auth_error",
        errorCode: "configuration",
        errorAt: NOW,
      }),
    ).resolves.toMatchObject({ id: JOB_ID, status: "failed_final" });

    expect(capture.set).toMatchObject({
      status: "failed_final",
      lockedAt: null,
      lockedBy: null,
      lastErrorCategory: "provider_auth_error",
      lastErrorCode: "configuration",
      lastErrorAt: NOW,
    });
  });

  it("lists due queued and retry-scheduled jobs", async () => {
    const dueJobs = [{ id: JOB_ID, status: "queued" }];
    const selected = createSelectDb(dueJobs);
    mockRequireDb.mockReturnValue(selected.db);

    await expect(listDueGenerationJobs({ now: NOW, limit: 5, jobType: "paid_analysis" })).resolves.toEqual(dueJobs);
    expect(selected.chain.orderBy).toHaveBeenCalled();
  });

  it("atomically claims due paid-analysis jobs with safe worker metadata", async () => {
    const { db } = createExecuteDb([
      {
        id: JOB_ID,
        job_type: "paid_analysis",
        status: "processing",
        priority: 50,
        module_slug: "ambiguous-temperature",
        input_ref_type: "analysis_result",
        input_ref_id: RESULT_ID,
        output_ref_type: "analysis_paid_result",
        output_ref_id: null,
        trigger_source: "web_unlock",
        dedupe_key: "redacted-dedupe-key",
        entitlement_ref_id: null,
        attempt_count: 1,
        max_attempts: 3,
        next_run_at: NOW,
        locked_at: NOW,
        locked_by: "worker-1",
        last_error_category: null,
        last_error_code: null,
        last_error_at: null,
        model_provider: null,
        model_name: null,
        prompt_version: "paid_result_prompt_v0.2",
        schema_version: "paid_result_schema_v3",
        source: null,
        operator_test: false,
        created_at: NOW,
        updated_at: NOW,
      },
    ]);
    mockRequireDb.mockReturnValue(db);

    const claimed = await claimDuePaidAnalysisJobs({
      limit: 1,
      lockedBy: "worker-1",
      now: NOW,
    });

    expect(claimed).toHaveLength(1);
    expect(claimed[0]).toMatchObject({
      id: JOB_ID,
      status: "processing",
      attemptCount: 1,
      lockedBy: "worker-1",
    });
    expect(db.execute).toHaveBeenCalledTimes(1);
  });

  it("recovers stale processing jobs into retry or final aggregate counts", async () => {
    const db = {
      execute: vi
        .fn()
        .mockResolvedValueOnce({ rows: [{ id: JOB_ID }] })
        .mockResolvedValueOnce({ rows: [{ id: "final-job" }] }),
    };
    mockRequireDb.mockReturnValue(db);

    await expect(
      recoverStalePaidAnalysisJobs({
        now: NOW,
        staleBefore: new Date("2026-05-27T11:50:00.000Z"),
      }),
    ).resolves.toEqual({
      retryScheduled: 1,
      failedFinal: 1,
      staleRecovered: 2,
    });
    expect(db.execute).toHaveBeenCalledTimes(2);
  });

  it("keeps serialized job fixtures free of forbidden private fields", () => {
    const serializedJob = JSON.stringify({
      id: JOB_ID,
      jobType: "paid_analysis",
      status: "queued",
      moduleSlug: "ambiguous-temperature",
      inputRefType: "analysis_result",
      inputRefId: RESULT_ID,
      outputRefType: "analysis_paid_result",
      triggerSource: "web_unlock",
      dedupeKey: `paid_analysis:ambiguous-temperature:${RESULT_ID}:prompt:schema`,
      operatorTest: false,
      lastErrorCategory: "provider_timeout",
    });

    for (const forbidden of [
      "raw_input",
      "paid_result_json",
      "provider_output",
      "line_user_id",
      "idToken",
      "fulfillmentCode",
      "unlockToken",
      "DATABASE_URL",
      "ANTHROPIC_API_KEY",
      "LINE_CHANNEL_SECRET",
      "OPERATOR_TEST_SECRET",
    ]) {
      expect(serializedJob).not.toContain(forbidden);
    }
  });
});
