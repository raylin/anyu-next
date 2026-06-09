import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockBuildProviderFallbackPaidResult,
  mockCreatePaidResultRecord,
  mockGeneratePaidResult,
  mockGetPaidResultValidationDiagnostics,
  mockGetAnalysisResultWithRequestById,
  mockGetPaidResultForAnalysisResult,
  mockGetUnlockIntentById,
  mockInsertEvent,
  mockIsOutputValidationError,
  mockMarkPaidResultCompleted,
  mockMarkPaidResultFailed,
  mockMarkPaidResultProcessing,
  mockCreateOrReusePaidAnalysisJob,
  mockMarkGenerationJobCompleted,
  mockMarkGenerationJobFailedFinal,
  mockMarkGenerationJobProcessing,
  mockResolveRuntimeStrategy,
  mockSendRecoveryLinksForCompletedPaidResult,
} = vi.hoisted(() => ({
  mockBuildProviderFallbackPaidResult: vi.fn(),
  mockCreatePaidResultRecord: vi.fn(),
  mockGeneratePaidResult: vi.fn(),
  mockGetPaidResultValidationDiagnostics: vi.fn(),
  mockGetAnalysisResultWithRequestById: vi.fn(),
  mockGetPaidResultForAnalysisResult: vi.fn(),
  mockGetUnlockIntentById: vi.fn(),
  mockInsertEvent: vi.fn(),
  mockIsOutputValidationError: vi.fn(),
  mockMarkPaidResultCompleted: vi.fn(),
  mockMarkPaidResultFailed: vi.fn(),
  mockMarkPaidResultProcessing: vi.fn(),
  mockCreateOrReusePaidAnalysisJob: vi.fn(),
  mockMarkGenerationJobCompleted: vi.fn(),
  mockMarkGenerationJobFailedFinal: vi.fn(),
  mockMarkGenerationJobProcessing: vi.fn(),
  mockResolveRuntimeStrategy: vi.fn(),
  mockSendRecoveryLinksForCompletedPaidResult: vi.fn(),
}));

vi.mock("@/lib/ai/paid-result-generation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/ai/paid-result-generation")>();

  return {
    ...actual,
    buildProviderFallbackPaidResult: mockBuildProviderFallbackPaidResult,
    generatePaidResult: mockGeneratePaidResult,
    getPaidResultValidationDiagnostics: mockGetPaidResultValidationDiagnostics,
  };
});

vi.mock("@/lib/ai/provider", () => ({
  getActiveProviderInfo: () => ({
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
  }),
  getProviderRuntimeErrorCode: () => null,
  isProviderConfigError: () => false,
}));

vi.mock("@/lib/ai/runtime", () => ({
  isOutputValidationError: mockIsOutputValidationError,
  resolveRuntimeStrategy: mockResolveRuntimeStrategy,
}));

vi.mock("@/lib/db/paid-results", () => ({
  createPaidResultRecord: mockCreatePaidResultRecord,
  getPaidResultForAnalysisResult: mockGetPaidResultForAnalysisResult,
  markPaidResultCompleted: mockMarkPaidResultCompleted,
  markPaidResultFailed: mockMarkPaidResultFailed,
  markPaidResultProcessing: mockMarkPaidResultProcessing,
}));

vi.mock("@/lib/db/generation-jobs", () => ({
  createOrReusePaidAnalysisJob: mockCreateOrReusePaidAnalysisJob,
  markGenerationJobCompleted: mockMarkGenerationJobCompleted,
  markGenerationJobFailedFinal: mockMarkGenerationJobFailedFinal,
  markGenerationJobProcessing: mockMarkGenerationJobProcessing,
}));

vi.mock("@/lib/db/runtime", () => ({
  getAnalysisResultWithRequestById: mockGetAnalysisResultWithRequestById,
  getUnlockIntentById: mockGetUnlockIntentById,
  insertEvent: mockInsertEvent,
}));

vi.mock("@/lib/notifications/email-recovery-link", () => ({
  sendRecoveryLinksForCompletedPaidResult: mockSendRecoveryLinksForCompletedPaidResult,
}));

import { aiTemperatureModule } from "@/content/modules/ai-temperature";
import { aiTemperatureDemoProductResult } from "@/lib/modules/demo-result";
import { requestDeferredPaidGeneration } from "@/lib/modules/paid-generation-service";
import { extractFreeResult } from "@/lib/modules/result-adapters";

const freeResult = extractFreeResult(aiTemperatureDemoProductResult);
const paidResult = aiTemperatureDemoProductResult.paid_result!;

function mockBaseRecords() {
  mockGetAnalysisResultWithRequestById.mockResolvedValue({
    request: {
      rawInputRedacted: "redacted synthetic input",
      userContextJson: {
        relationshipStage: "曖昧中",
        userGoal: "我該怎麼回",
        primaryPain: "回覆變慢",
        replyTone: "有界線但不冷",
      },
      anonymousSessionId: "session-1",
    },
    result: {
      normalizedResultJson: freeResult,
      retentionExpiresAt: new Date("2026-05-27T00:00:00.000Z"),
      visualVariant: "B",
      scoreBucket: "warm",
    },
  });
  mockGetUnlockIntentById.mockResolvedValue({
    id: "unlock-1",
    resultId: "result-1",
    moduleId: "ai-temperature",
    themeSlug: "ambiguous-temperature",
  });
  mockGetPaidResultForAnalysisResult.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
  mockCreatePaidResultRecord.mockResolvedValue({ id: "paid-1", retryCount: 0 });
  mockMarkPaidResultCompleted.mockResolvedValue({ id: "paid-1" });
  mockResolveRuntimeStrategy.mockReturnValue({
    primaryModel: "claude-haiku-4-5-20251001",
  });
}

describe("deferred paid generation service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.ENABLE_PAID_GENERATION_JOBS;
    mockBaseRecords();
    mockIsOutputValidationError.mockReturnValue(false);
    mockBuildProviderFallbackPaidResult.mockReturnValue(paidResult);
    mockGetPaidResultValidationDiagnostics.mockReturnValue(null);
    mockCreateOrReusePaidAnalysisJob.mockResolvedValue({
      job: {
        id: "job-1",
        status: "queued",
        entitlementRefId: null,
      },
      created: true,
    });
    mockSendRecoveryLinksForCompletedPaidResult.mockResolvedValue({
      attempted: 0,
      sent: 0,
      noop: 0,
      duplicate: 0,
      failed: 0,
      unavailable: 0,
    });
  });

  it("stores provider-generated paid results and records provider source metadata", async () => {
    mockGeneratePaidResult.mockResolvedValue({
      paidResult,
      model: "claude-haiku-4-5-20251001",
      source: "provider",
    });

    const result = await requestDeferredPaidGeneration({
      moduleConfig: aiTemperatureModule,
      resultId: "result-1",
      unlockIntentId: "unlock-1",
    });

    expect(result).toMatchObject({
      ok: true,
      status: "completed",
      paidResultId: "paid-1",
      source: "provider",
      reused: false,
    });
    expect(mockGeneratePaidResult).toHaveBeenCalledTimes(1);
    expect(mockBuildProviderFallbackPaidResult).not.toHaveBeenCalled();
    expect(mockMarkPaidResultCompleted).toHaveBeenCalledWith(
      expect.objectContaining({
        paidResultId: "paid-1",
        paidResultJson: paidResult,
        model: "claude-haiku-4-5-20251001",
      }),
    );
    expect(mockInsertEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "paid_generation_completed",
        metadata: expect.objectContaining({
          source: "provider",
          status: "completed",
        }),
      }),
    );
    expect(mockInsertEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "paid_generation_completed",
        metadata: expect.not.objectContaining({
          fallbackReason: expect.any(String),
        }),
      }),
    );
    expect(mockCreateOrReusePaidAnalysisJob).not.toHaveBeenCalled();
  });

  it("retries output validation once before falling back", async () => {
    const validationError = new Error("Model output was not valid JSON: truncated");
    mockIsOutputValidationError.mockImplementation((error) => error === validationError);
    mockGeneratePaidResult.mockRejectedValueOnce(validationError).mockResolvedValueOnce({
      paidResult,
      model: "claude-haiku-4-5-20251001",
      source: "provider",
    });

    const result = await requestDeferredPaidGeneration({
      moduleConfig: aiTemperatureModule,
      resultId: "result-1",
      unlockIntentId: "unlock-1",
    });

    expect(result).toMatchObject({
      ok: true,
      status: "completed",
      source: "provider",
    });
    expect(mockGeneratePaidResult).toHaveBeenCalledTimes(2);
    expect(mockBuildProviderFallbackPaidResult).not.toHaveBeenCalled();
  });

  it("uses fallback only after provider retry also fails", async () => {
    mockIsOutputValidationError.mockReturnValue(true);
    mockGeneratePaidResult
      .mockRejectedValueOnce(new Error("Model output was not valid JSON: truncated"))
      .mockRejectedValueOnce(new Error("/replyStrategies/0/tone is invalid"));
    mockGetPaidResultValidationDiagnostics.mockReturnValue({
      parse: "success",
      schemaFailurePaths: ["/replyStrategies/0"],
      missingFields: ["/replyStrategies/0.tone"],
      invalidTypeFields: [],
      arrayCounts: {
        replyStrategies: 3,
        "replyStrategies.0.copyableMessages": 2,
      },
      semanticCategory: null,
      aggregateTextLength: 850,
      copyableMessagesCount: 6,
    });

    const result = await requestDeferredPaidGeneration({
      moduleConfig: aiTemperatureModule,
      resultId: "result-1",
      unlockIntentId: "unlock-1",
    });

    expect(result).toMatchObject({
      ok: true,
      status: "completed",
      source: "fallback",
    });
    expect(mockGeneratePaidResult).toHaveBeenCalledTimes(2);
    expect(mockBuildProviderFallbackPaidResult).toHaveBeenCalledTimes(1);
    expect(mockMarkPaidResultCompleted).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "paid_template_fallback_v0",
      }),
    );
    expect(mockInsertEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "paid_generation_completed",
        metadata: expect.objectContaining({
          source: "fallback",
          fallbackReason: "output_validation",
          validationDiagnostics: expect.objectContaining({
            parse: "success",
            schemaFailurePaths: ["/replyStrategies/0"],
            missingFields: ["/replyStrategies/0.tone"],
            copyableMessagesCount: 6,
          }),
        }),
      }),
    );
  });

  it("mirrors direct paid generation into a paid_analysis job when the feature flag is enabled", async () => {
    process.env.ENABLE_PAID_GENERATION_JOBS = "true";
    mockGeneratePaidResult.mockResolvedValue({
      paidResult,
      model: "claude-haiku-4-5-20251001",
      source: "provider",
    });

    const result = await requestDeferredPaidGeneration({
      moduleConfig: aiTemperatureModule,
      resultId: "result-1",
      unlockIntentId: "unlock-1",
      triggerSource: "line_bind",
    });

    expect(result).toMatchObject({
      ok: true,
      status: "completed",
      paidResultId: "paid-1",
      source: "provider",
    });
    expect(mockCreateOrReusePaidAnalysisJob).toHaveBeenCalledWith(
      expect.objectContaining({
        moduleSlug: "ambiguous-temperature",
        analysisResultId: "result-1",
        triggerSource: "line_bind",
        promptVersion: "paid_result_prompt_v0.2",
        schemaVersion: "paid_result_schema_v3",
        modelProvider: "anthropic",
        modelName: "claude-sonnet-4-20250514",
      }),
    );
    expect(mockMarkGenerationJobProcessing).toHaveBeenCalledWith(
      expect.objectContaining({
        jobId: "job-1",
        lockedBy: "direct_paid_generation",
      }),
    );
    expect(mockMarkGenerationJobCompleted).toHaveBeenCalledWith(
      expect.objectContaining({
        jobId: "job-1",
        outputRefId: "paid-1",
        source: "provider",
        modelProvider: "anthropic",
        modelName: "claude-haiku-4-5-20251001",
      }),
    );
    expect(mockMarkGenerationJobFailedFinal).not.toHaveBeenCalled();
  });

  it("attempts recovery Email sends after completed paid result when job mirror has entitlement context", async () => {
    process.env.ENABLE_PAID_GENERATION_JOBS = "true";
    mockCreateOrReusePaidAnalysisJob.mockResolvedValue({
      job: {
        id: "job-1",
        status: "queued",
        entitlementRefId: "entitlement-1",
      },
      created: true,
    });
    mockGeneratePaidResult.mockResolvedValue({
      paidResult,
      model: "claude-haiku-4-5-20251001",
      source: "provider",
    });

    const result = await requestDeferredPaidGeneration({
      moduleConfig: aiTemperatureModule,
      resultId: "result-1",
      unlockIntentId: "unlock-1",
    });

    expect(result).toMatchObject({
      ok: true,
      status: "completed",
    });
    expect(mockSendRecoveryLinksForCompletedPaidResult).toHaveBeenCalledWith({
      moduleSlug: "ambiguous-temperature",
      moduleTitle: "曖昧溫度計",
      analysisResultId: "result-1",
      entitlementId: "entitlement-1",
    });
  });

  it("treats a reused queued generation job as an idempotent processing no-op", async () => {
    process.env.ENABLE_PAID_GENERATION_JOBS = "true";
    mockCreateOrReusePaidAnalysisJob.mockResolvedValue({
      job: {
        id: "job-1",
        status: "queued",
        entitlementRefId: "entitlement-1",
      },
      created: false,
    });

    const result = await requestDeferredPaidGeneration({
      moduleConfig: aiTemperatureModule,
      resultId: "result-1",
      unlockIntentId: "unlock-1",
    });

    expect(result).toEqual({
      ok: true,
      status: "processing",
      paidResultId: undefined,
      errorCategory: undefined,
      reused: true,
    });
    expect(mockCreatePaidResultRecord).not.toHaveBeenCalled();
    expect(mockMarkPaidResultProcessing).not.toHaveBeenCalled();
    expect(mockGeneratePaidResult).not.toHaveBeenCalled();
    expect(mockMarkGenerationJobProcessing).not.toHaveBeenCalled();
    expect(mockMarkGenerationJobCompleted).not.toHaveBeenCalled();
    expect(mockSendRecoveryLinksForCompletedPaidResult).not.toHaveBeenCalled();
  });

  it("treats a reused processing generation job as idempotent under repeated triggers", async () => {
    process.env.ENABLE_PAID_GENERATION_JOBS = "true";
    mockCreateOrReusePaidAnalysisJob.mockResolvedValue({
      job: {
        id: "job-1",
        status: "processing",
        entitlementRefId: "entitlement-1",
      },
      created: false,
    });

    const results = await Promise.all([
      requestDeferredPaidGeneration({
        moduleConfig: aiTemperatureModule,
        resultId: "result-1",
        unlockIntentId: "unlock-1",
      }),
      requestDeferredPaidGeneration({
        moduleConfig: aiTemperatureModule,
        resultId: "result-1",
        unlockIntentId: "unlock-1",
      }),
      requestDeferredPaidGeneration({
        moduleConfig: aiTemperatureModule,
        resultId: "result-1",
        unlockIntentId: "unlock-1",
      }),
    ]);

    expect(results).toEqual([
      {
        ok: true,
        status: "processing",
        paidResultId: undefined,
        errorCategory: undefined,
        reused: true,
      },
      {
        ok: true,
        status: "processing",
        paidResultId: undefined,
        errorCategory: undefined,
        reused: true,
      },
      {
        ok: true,
        status: "processing",
        paidResultId: undefined,
        errorCategory: undefined,
        reused: true,
      },
    ]);
    expect(mockGeneratePaidResult).not.toHaveBeenCalled();
    expect(mockCreatePaidResultRecord).not.toHaveBeenCalled();
  });

  it("returns a safe failed state for a reused failed-final generation job", async () => {
    process.env.ENABLE_PAID_GENERATION_JOBS = "true";
    mockCreateOrReusePaidAnalysisJob.mockResolvedValue({
      job: {
        id: "job-1",
        status: "failed_final",
        entitlementRefId: "entitlement-1",
      },
      created: false,
    });

    const result = await requestDeferredPaidGeneration({
      moduleConfig: aiTemperatureModule,
      resultId: "result-1",
      unlockIntentId: "unlock-1",
    });

    expect(result).toEqual({
      ok: true,
      status: "failed",
      paidResultId: undefined,
      errorCategory: "paid_generation_failed",
      reused: true,
    });
    expect(mockGeneratePaidResult).not.toHaveBeenCalled();
    expect(mockCreatePaidResultRecord).not.toHaveBeenCalled();
  });

  it("does not fail direct paid generation when recovery Email auto-send fails", async () => {
    process.env.ENABLE_PAID_GENERATION_JOBS = "true";
    mockCreateOrReusePaidAnalysisJob.mockResolvedValue({
      job: {
        id: "job-1",
        status: "queued",
        entitlementRefId: "entitlement-1",
      },
      created: true,
    });
    mockSendRecoveryLinksForCompletedPaidResult.mockRejectedValueOnce(
      new Error("email_send_failed"),
    );
    mockGeneratePaidResult.mockResolvedValue({
      paidResult,
      model: "claude-haiku-4-5-20251001",
      source: "provider",
    });

    const result = await requestDeferredPaidGeneration({
      moduleConfig: aiTemperatureModule,
      resultId: "result-1",
      unlockIntentId: "unlock-1",
    });

    expect(result).toMatchObject({
      ok: true,
      status: "completed",
      paidResultId: "paid-1",
    });
    expect(mockInsertEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "paid_generation_completed",
      }),
    );
  });

  it("marks fallback success as completed job output instead of failing the mirror", async () => {
    process.env.ENABLE_PAID_GENERATION_JOBS = "true";
    mockIsOutputValidationError.mockReturnValue(true);
    mockGeneratePaidResult
      .mockRejectedValueOnce(new Error("Model output was not valid JSON: truncated"))
      .mockRejectedValueOnce(new Error("Model output was still invalid"));

    const result = await requestDeferredPaidGeneration({
      moduleConfig: aiTemperatureModule,
      resultId: "result-1",
      unlockIntentId: "unlock-1",
    });

    expect(result).toMatchObject({
      ok: true,
      status: "completed",
      source: "fallback",
    });
    expect(mockMarkGenerationJobCompleted).toHaveBeenCalledWith(
      expect.objectContaining({
        jobId: "job-1",
        outputRefId: "paid-1",
        source: "fallback",
        modelName: "paid_template_fallback_v0",
      }),
    );
  });

  it("fails open when paid_analysis job mirroring is unavailable", async () => {
    process.env.ENABLE_PAID_GENERATION_JOBS = "true";
    mockCreateOrReusePaidAnalysisJob.mockRejectedValue(new Error("generation_jobs unavailable"));
    mockGeneratePaidResult.mockResolvedValue({
      paidResult,
      model: "claude-haiku-4-5-20251001",
      source: "provider",
    });

    const result = await requestDeferredPaidGeneration({
      moduleConfig: aiTemperatureModule,
      resultId: "result-1",
      unlockIntentId: "unlock-1",
    });

    expect(result).toMatchObject({
      ok: true,
      status: "completed",
      paidResultId: "paid-1",
    });
    expect(mockMarkPaidResultCompleted).toHaveBeenCalled();
    expect(mockMarkGenerationJobProcessing).not.toHaveBeenCalled();
    expect(mockMarkGenerationJobCompleted).not.toHaveBeenCalled();
  });

  it("reconciles an existing completed paid result with a completed job mirror when enabled", async () => {
    process.env.ENABLE_PAID_GENERATION_JOBS = "true";
    mockGetPaidResultForAnalysisResult.mockReset();
    mockGetPaidResultForAnalysisResult.mockResolvedValueOnce({
      id: "paid-existing",
      model: "claude-haiku-4-5-20251001",
    });

    const result = await requestDeferredPaidGeneration({
      moduleConfig: aiTemperatureModule,
      resultId: "result-1",
      unlockIntentId: "unlock-1",
    });

    expect(result).toMatchObject({
      ok: true,
      status: "completed",
      paidResultId: "paid-existing",
      source: "provider",
      reused: true,
    });
    expect(mockGeneratePaidResult).not.toHaveBeenCalled();
    expect(mockMarkGenerationJobCompleted).toHaveBeenCalledWith(
      expect.objectContaining({
        jobId: "job-1",
        outputRefId: "paid-existing",
        source: "provider",
      }),
    );
  });

  it("marks job failed_final only when direct paid generation ultimately fails", async () => {
    process.env.ENABLE_PAID_GENERATION_JOBS = "true";
    mockGeneratePaidResult.mockResolvedValue({
      paidResult,
      model: "claude-haiku-4-5-20251001",
      source: "provider",
    });
    mockMarkPaidResultCompleted.mockRejectedValue(new Error("write failed"));

    const result = await requestDeferredPaidGeneration({
      moduleConfig: aiTemperatureModule,
      resultId: "result-1",
      unlockIntentId: "unlock-1",
    });

    expect(result).toMatchObject({
      ok: true,
      status: "failed",
      paidResultId: "paid-1",
      errorCategory: "provider",
    });
    expect(mockMarkPaidResultFailed).toHaveBeenCalledWith({
      paidResultId: "paid-1",
      errorCode: "provider",
    });
    expect(mockMarkGenerationJobFailedFinal).toHaveBeenCalledWith({
      jobId: "job-1",
      errorCategory: "provider",
    });
  });
});
