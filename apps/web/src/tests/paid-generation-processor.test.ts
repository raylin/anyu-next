import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockClaimDuePaidAnalysisJobById,
  mockClaimDuePaidAnalysisJobs,
  mockCreatePaidResultRecord,
  mockGenerateDeferredPaidResultPayload,
  mockGetGenerationJobById,
  mockGetAnalysisResultWithRequestById,
  mockGetPaidResultForAnalysisResult,
  mockGetSafePaidGenerationErrorCode,
  mockListDueGenerationJobs,
  mockMarkGenerationJobCompleted,
  mockMarkGenerationJobFailedFinal,
  mockMarkGenerationJobRetryScheduled,
  mockMarkPaidResultCompleted,
  mockMarkPaidResultFailed,
  mockMarkPaidResultProcessing,
  mockRecoverStalePaidAnalysisJobs,
} = vi.hoisted(() => ({
  mockClaimDuePaidAnalysisJobById: vi.fn(),
  mockClaimDuePaidAnalysisJobs: vi.fn(),
  mockCreatePaidResultRecord: vi.fn(),
  mockGenerateDeferredPaidResultPayload: vi.fn(),
  mockGetGenerationJobById: vi.fn(),
  mockGetAnalysisResultWithRequestById: vi.fn(),
  mockGetPaidResultForAnalysisResult: vi.fn(),
  mockGetSafePaidGenerationErrorCode: vi.fn(),
  mockListDueGenerationJobs: vi.fn(),
  mockMarkGenerationJobCompleted: vi.fn(),
  mockMarkGenerationJobFailedFinal: vi.fn(),
  mockMarkGenerationJobRetryScheduled: vi.fn(),
  mockMarkPaidResultCompleted: vi.fn(),
  mockMarkPaidResultFailed: vi.fn(),
  mockMarkPaidResultProcessing: vi.fn(),
  mockRecoverStalePaidAnalysisJobs: vi.fn(),
}));

vi.mock("@/lib/db/generation-jobs", () => ({
  claimDuePaidAnalysisJobById: mockClaimDuePaidAnalysisJobById,
  claimDuePaidAnalysisJobs: mockClaimDuePaidAnalysisJobs,
  getGenerationJobById: mockGetGenerationJobById,
  listDueGenerationJobs: mockListDueGenerationJobs,
  markGenerationJobCompleted: mockMarkGenerationJobCompleted,
  markGenerationJobFailedFinal: mockMarkGenerationJobFailedFinal,
  markGenerationJobRetryScheduled: mockMarkGenerationJobRetryScheduled,
  recoverStalePaidAnalysisJobs: mockRecoverStalePaidAnalysisJobs,
}));

vi.mock("@/lib/db/paid-results", () => ({
  createPaidResultRecord: mockCreatePaidResultRecord,
  getPaidResultForAnalysisResult: mockGetPaidResultForAnalysisResult,
  markPaidResultCompleted: mockMarkPaidResultCompleted,
  markPaidResultFailed: mockMarkPaidResultFailed,
  markPaidResultProcessing: mockMarkPaidResultProcessing,
}));

vi.mock("@/lib/db/runtime", () => ({
  getAnalysisResultWithRequestById: mockGetAnalysisResultWithRequestById,
}));

vi.mock("@/lib/modules/paid-generation-service", () => ({
  generateDeferredPaidResultPayload: mockGenerateDeferredPaidResultPayload,
  getSafePaidGenerationErrorCode: mockGetSafePaidGenerationErrorCode,
}));

import { aiTemperatureDemoProductResult } from "@/lib/modules/demo-result";
import {
  processPaidAnalysisJobById,
  processPaidAnalysisJobs,
} from "@/lib/modules/paid-generation-processor";
import { extractFreeResult } from "@/lib/modules/result-adapters";

const NOW = new Date("2026-05-27T12:00:00.000Z");
const JOB = {
  id: "job-1",
  jobType: "paid_analysis",
  status: "processing",
  priority: 50,
  moduleSlug: "ambiguous-temperature",
  inputRefType: "analysis_result",
  inputRefId: "22222222-2222-4222-8222-222222222222",
  outputRefType: "analysis_paid_result",
  outputRefId: null,
  triggerSource: "web_unlock",
  dedupeKey: "redacted",
  entitlementRefId: null,
  attemptCount: 1,
  maxAttempts: 3,
  nextRunAt: NOW,
  lockedAt: NOW,
  lockedBy: "worker",
  lastErrorCategory: null,
  lastErrorCode: null,
  lastErrorAt: null,
  modelProvider: null,
  modelName: null,
  promptVersion: "paid_result_prompt_v0.2",
  schemaVersion: "paid_result_schema_v3",
  source: null,
  operatorTest: false,
  createdAt: NOW,
  updatedAt: NOW,
};
const paidResult = aiTemperatureDemoProductResult.paid_result!;

function mockRecord() {
  mockGetAnalysisResultWithRequestById.mockResolvedValue({
    request: {
      rawInputRedacted: "redacted input",
      userContextJson: {},
    },
    result: {
      normalizedResultJson: extractFreeResult(aiTemperatureDemoProductResult),
      retentionExpiresAt: new Date("2026-06-01T00:00:00.000Z"),
    },
  });
}

describe("paid generation processor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRecoverStalePaidAnalysisJobs.mockResolvedValue({
      retryScheduled: 0,
      failedFinal: 0,
      staleRecovered: 0,
    });
    mockClaimDuePaidAnalysisJobById.mockResolvedValue(JOB);
    mockClaimDuePaidAnalysisJobs.mockResolvedValue([JOB]);
    mockGetGenerationJobById.mockResolvedValue(JOB);
    mockGetPaidResultForAnalysisResult.mockResolvedValue(null);
    mockCreatePaidResultRecord.mockResolvedValue({ id: "paid-1" });
    mockMarkPaidResultCompleted.mockResolvedValue({ id: "paid-1" });
    mockGenerateDeferredPaidResultPayload.mockResolvedValue({
      paidResult,
      model: "claude-haiku-4-5-20251001",
      source: "provider",
      providerInfo: {
        provider: "anthropic",
        model: "claude-sonnet-4-20250514",
      },
    });
    mockGetSafePaidGenerationErrorCode.mockReturnValue("provider");
    mockRecord();
  });

  it("returns aggregate due counts for dry runs without claiming jobs", async () => {
    mockListDueGenerationJobs.mockResolvedValue([JOB, { ...JOB, id: "job-2" }]);

    await expect(processPaidAnalysisJobs({ dryRun: true, limit: 2, now: NOW })).resolves.toEqual({
      ok: true,
      dryRun: true,
      processed: 0,
      completed: 0,
      retryScheduled: 0,
      failedFinal: 0,
      staleRecovered: 0,
      skipped: 2,
    });
    expect(mockClaimDuePaidAnalysisJobs).not.toHaveBeenCalled();
  });

  it("marks a job completed without provider call when a paid result already exists", async () => {
    mockGetPaidResultForAnalysisResult.mockResolvedValueOnce({
      id: "paid-existing",
      model: "claude-haiku-4-5-20251001",
    });

    const result = await processPaidAnalysisJobs({ now: NOW });

    expect(result).toMatchObject({ processed: 1, completed: 1 });
    expect(mockGenerateDeferredPaidResultPayload).not.toHaveBeenCalled();
    expect(mockMarkGenerationJobCompleted).toHaveBeenCalledWith(
      expect.objectContaining({
        jobId: "job-1",
        outputRefId: "paid-existing",
        source: "provider",
      }),
    );
  });

  it("stores provider output and marks the job completed", async () => {
    const result = await processPaidAnalysisJobs({ now: NOW, lockedBy: "worker-1" });

    expect(result).toMatchObject({ processed: 1, completed: 1 });
    expect(mockClaimDuePaidAnalysisJobs).toHaveBeenCalledWith(
      expect.objectContaining({ lockedBy: "worker-1", limit: 1 }),
    );
    expect(mockCreatePaidResultRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        analysisResultId: JOB.inputRefId,
        requestedReason: "generation_job",
        status: "processing",
      }),
    );
    expect(mockMarkPaidResultCompleted).toHaveBeenCalledWith(
      expect.objectContaining({
        paidResultId: "paid-1",
        paidResultJson: paidResult,
      }),
    );
    expect(mockMarkGenerationJobCompleted).toHaveBeenCalledWith(
      expect.objectContaining({
        outputRefId: "paid-1",
        source: "provider",
      }),
    );
  });

  it("processes a targeted paid generation job by id", async () => {
    const result = await processPaidAnalysisJobById({
      generationJobId: "job-1",
      lockedBy: "queue-worker",
      now: NOW,
    });

    expect(result).toEqual({
      ok: true,
      category: "processed",
      jobId: "job-1",
      jobResult: "completed",
    });
    expect(mockClaimDuePaidAnalysisJobById).toHaveBeenCalledWith({
      jobId: "job-1",
      lockedBy: "queue-worker",
      now: NOW,
    });
    expect(mockClaimDuePaidAnalysisJobs).not.toHaveBeenCalled();
    expect(mockMarkGenerationJobCompleted).toHaveBeenCalledWith(
      expect.objectContaining({
        jobId: "job-1",
        outputRefId: "paid-1",
      }),
    );
  });

  it("classifies completed targeted jobs as idempotent without processing another job", async () => {
    mockClaimDuePaidAnalysisJobById.mockResolvedValueOnce(null);
    mockGetGenerationJobById.mockResolvedValueOnce({
      ...JOB,
      status: "completed",
      outputRefId: "paid-1",
    });

    await expect(
      processPaidAnalysisJobById({
        generationJobId: "job-1",
        now: NOW,
      }),
    ).resolves.toEqual({
      ok: true,
      category: "already_completed",
      jobId: "job-1",
    });
    expect(mockClaimDuePaidAnalysisJobs).not.toHaveBeenCalled();
    expect(mockGenerateDeferredPaidResultPayload).not.toHaveBeenCalled();
  });

  it("classifies missing, invalid, and processing targeted jobs safely", async () => {
    mockClaimDuePaidAnalysisJobById.mockResolvedValue(null);
    mockGetGenerationJobById.mockResolvedValueOnce(null);

    await expect(
      processPaidAnalysisJobById({
        generationJobId: "missing-job",
        now: NOW,
      }),
    ).resolves.toEqual({
      ok: false,
      category: "not_found",
      jobId: "missing-job",
    });

    mockGetGenerationJobById.mockResolvedValueOnce({
      ...JOB,
      jobType: "other_job",
    });

    await expect(
      processPaidAnalysisJobById({
        generationJobId: "invalid-job",
        now: NOW,
      }),
    ).resolves.toEqual({
      ok: false,
      category: "invalid_job",
      jobId: "invalid-job",
    });

    mockGetGenerationJobById.mockResolvedValueOnce({
      ...JOB,
      status: "processing",
    });

    await expect(
      processPaidAnalysisJobById({
        generationJobId: "processing-job",
        now: NOW,
      }),
    ).resolves.toEqual({
      ok: false,
      category: "already_processing",
      jobId: "processing-job",
    });
  });

  it("marks fallback completions as completed with fallback source", async () => {
    mockGenerateDeferredPaidResultPayload.mockResolvedValue({
      paidResult,
      model: "paid_template_fallback_v0",
      source: "fallback",
      providerInfo: {
        provider: "anthropic",
        model: "claude-sonnet-4-20250514",
      },
    });

    await expect(processPaidAnalysisJobs({ now: NOW })).resolves.toMatchObject({
      completed: 1,
    });
    expect(mockMarkGenerationJobCompleted).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "fallback",
        modelName: "paid_template_fallback_v0",
      }),
    );
  });

  it("schedules retry for retryable failures below max attempts", async () => {
    mockGenerateDeferredPaidResultPayload.mockRejectedValue(new Error("provider failed"));
    mockGetSafePaidGenerationErrorCode.mockReturnValue("provider_http_500");

    await expect(processPaidAnalysisJobs({ now: NOW })).resolves.toMatchObject({
      processed: 1,
      retryScheduled: 1,
      failedFinal: 0,
    });
    expect(mockMarkPaidResultFailed).toHaveBeenCalledWith(
      expect.objectContaining({
        paidResultId: "paid-1",
        errorCode: "provider_http_500",
      }),
    );
    expect(mockMarkGenerationJobRetryScheduled).toHaveBeenCalledWith(
      expect.objectContaining({
        jobId: "job-1",
        errorCategory: "provider_http_500",
      }),
    );
  });

  it("marks final failures for non-retryable categories", async () => {
    mockGenerateDeferredPaidResultPayload.mockRejectedValue(new Error("configuration"));
    mockGetSafePaidGenerationErrorCode.mockReturnValue("configuration");

    await expect(processPaidAnalysisJobs({ now: NOW })).resolves.toMatchObject({
      processed: 1,
      retryScheduled: 0,
      failedFinal: 1,
    });
    expect(mockMarkGenerationJobFailedFinal).toHaveBeenCalledWith(
      expect.objectContaining({
        jobId: "job-1",
        errorCategory: "configuration",
      }),
    );
  });
});
