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
  mockResolveRuntimeStrategy,
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
  mockResolveRuntimeStrategy: vi.fn(),
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

vi.mock("@/lib/db/runtime", () => ({
  getAnalysisResultWithRequestById: mockGetAnalysisResultWithRequestById,
  getUnlockIntentById: mockGetUnlockIntentById,
  insertEvent: mockInsertEvent,
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
    mockBaseRecords();
    mockIsOutputValidationError.mockReturnValue(false);
    mockBuildProviderFallbackPaidResult.mockReturnValue(paidResult);
    mockGetPaidResultValidationDiagnostics.mockReturnValue(null);
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
});
