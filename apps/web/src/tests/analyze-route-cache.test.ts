import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCreateAnalysisRequestRecord,
  mockCreateAnalysisResultRecord,
  mockGetCachedAnalysisResult,
  mockInsertEvent,
  mockUpdateAnalysisRequestState,
  mockGenerateModuleResult,
  mockIsOutputValidationError,
  mockCheckIpHourlyLimit,
  mockCheckPersistedAnalyzeLimits,
  mockGetOperatorTestMode,
  mockResolveRuntimeStrategy,
  mockCreateCompletedPaidResultShadowRecord,
} = vi.hoisted(() => ({
  mockCreateAnalysisRequestRecord: vi.fn(),
  mockCreateAnalysisResultRecord: vi.fn(),
  mockGetCachedAnalysisResult: vi.fn(),
  mockInsertEvent: vi.fn(),
  mockUpdateAnalysisRequestState: vi.fn(),
  mockGenerateModuleResult: vi.fn(),
  mockIsOutputValidationError: vi.fn(),
  mockCheckIpHourlyLimit: vi.fn(),
  mockCheckPersistedAnalyzeLimits: vi.fn(),
  mockGetOperatorTestMode: vi.fn(),
  mockResolveRuntimeStrategy: vi.fn(),
  mockCreateCompletedPaidResultShadowRecord: vi.fn(),
}));

vi.mock("@/lib/db/runtime", () => ({
  createAnalysisRequestRecord: mockCreateAnalysisRequestRecord,
  createAnalysisResultRecord: mockCreateAnalysisResultRecord,
  getCachedAnalysisResult: mockGetCachedAnalysisResult,
  insertEvent: mockInsertEvent,
  updateAnalysisRequestState: mockUpdateAnalysisRequestState,
}));

vi.mock("@/lib/db/paid-results", () => ({
  createCompletedPaidResultShadowRecord: mockCreateCompletedPaidResultShadowRecord,
}));

vi.mock("@/lib/ai/runtime", () => ({
  generateModuleResult: mockGenerateModuleResult,
  isOutputValidationError: mockIsOutputValidationError,
  resolveRuntimeStrategy: mockResolveRuntimeStrategy,
}));

vi.mock("@/lib/ai/provider", () => ({
  getActiveProviderInfo: () => ({
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
  }),
  getProviderUserMessage: () => "provider error",
  isProviderConfigError: () => false,
}));

vi.mock("@/lib/db/client", () => ({
  isDbConfigured: () => true,
}));

vi.mock("@/lib/runtime/abuse-guard", () => ({
  checkIpHourlyLimit: mockCheckIpHourlyLimit,
  checkPersistedAnalyzeLimits: mockCheckPersistedAnalyzeLimits,
  getAnalysisGuardConfig: () => ({ ipHourlyLimit: 10 }),
  getClientIpAddress: () => null,
  getOperatorTestEventMetadata: (mode: { enabled: boolean; source?: string }) =>
    mode.enabled ? { operatorTest: true, testModeSource: mode.source } : {},
  getOperatorTestMode: mockGetOperatorTestMode,
  looksLikePromptInjection: () => false,
  looksLikeUnsupportedRelationshipContent: () => false,
}));

import { maxDuration, POST as analyzePost } from "@/app/api/modules/[moduleSlug]/analyze/route";
import { aiTemperatureDemoProductResult } from "@/lib/modules/demo-result";
import { extractFreeResult } from "@/lib/modules/result-adapters";

describe("module analyze cache route behavior", () => {
  const validBody = {
    text: "我們上週末見面時聊得很自然，他也說下次可以再約。但這幾天訊息變慢，常常隔半天才回，雖然還是會看我的限動、偶爾傳生活小事。我不知道他是真的忙，還是其實已經沒那麼想靠近了。",
    situation: "已讀不回",
    anonymousSessionId: "cache-test-session",
    userContext: {
      relationshipStage: "曖昧中",
      userGoal: "我該怎麼回",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockResolveRuntimeStrategy.mockReturnValue({
      strategy: "sonnet_default",
      provider: "anthropic",
      primaryModel: "claude-sonnet-4-20250514",
      retryOnInvalid: false,
      fallbackModel: null,
    });
    mockCheckIpHourlyLimit.mockReturnValue({ ok: true });
    mockCheckPersistedAnalyzeLimits.mockResolvedValue({ ok: true });
    mockGetOperatorTestMode.mockReturnValue({ enabled: false });
    mockUpdateAnalysisRequestState.mockResolvedValue({ id: "request-2" });
    mockIsOutputValidationError.mockReturnValue(false);
  });

  it("declares enough serverless time for synchronous provider generation", () => {
    expect(maxDuration).toBe(90);
  });

  it("returns the cached result without calling the provider", async () => {
    mockGetCachedAnalysisResult.mockResolvedValue({
      request: {
        id: "request-1",
        privacyFlags: ["email"],
        modelStrategy: "sonnet_default",
        primaryModel: "claude-sonnet-4-20250514",
      },
      result: {
        id: "result-1",
        scoreBucket: "warm",
        providerModel: "claude-sonnet-4-20250514",
      },
    });

    const response = await analyzePost(
      new Request("http://localhost/api/modules/ambiguous-temperature/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validBody),
      }),
      {
        params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }),
      },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      status: "completed",
      resultId: "result-1",
      cacheHit: true,
    });
    expect(mockGenerateModuleResult).not.toHaveBeenCalled();
    expect(mockCreateAnalysisRequestRecord).not.toHaveBeenCalled();
    expect(mockCreateCompletedPaidResultShadowRecord).not.toHaveBeenCalled();
    expect(mockUpdateAnalysisRequestState).not.toHaveBeenCalled();
    expect(mockCheckPersistedAnalyzeLimits).not.toHaveBeenCalled();
    expect(mockInsertEvent).toHaveBeenCalledTimes(2);
    expect(mockInsertEvent).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        eventName: "input_submitted",
        metadata: expect.objectContaining({
          cacheHit: true,
        }),
      }),
    );
    expect(mockInsertEvent).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        eventName: "analysis_completed",
        metadata: expect.objectContaining({
          resultId: "result-1",
          cacheHit: true,
          modelStrategy: "sonnet_default",
        }),
      }),
    );
  });

  it("creates a fresh request and result on a cache miss", async () => {
    mockGetCachedAnalysisResult.mockResolvedValue(null);
    mockCreateAnalysisRequestRecord.mockResolvedValue({ id: "request-2" });
    mockGenerateModuleResult.mockResolvedValue({
      result: extractFreeResult(aiTemperatureDemoProductResult),
      provider: "anthropic",
      providerModel: "claude-sonnet-4-20250514",
      providerRawJson: { id: "provider-response" },
      redactedText: "redacted",
      privacyFlags: ["name"],
      scoreBucket: "warm",
      runtimeModel: {
        modelStrategy: "sonnet_default",
        primaryModel: "claude-sonnet-4-20250514",
        finalModel: "claude-sonnet-4-20250514",
        retryCount: 0,
        fallbackUsed: false,
        schemaValidationPassed: true,
      },
    });
    mockCreateAnalysisResultRecord.mockResolvedValue({ id: "result-2" });

    const response = await analyzePost(
      new Request("http://localhost/api/modules/ambiguous-temperature/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validBody),
      }),
      {
        params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }),
      },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      status: "completed",
      requestId: "request-2",
      resultId: "result-2",
      cacheHit: false,
    });
    expect(mockCheckPersistedAnalyzeLimits).toHaveBeenCalledTimes(1);
    expect(mockCheckPersistedAnalyzeLimits).toHaveBeenCalledWith(
      expect.objectContaining({
        skipSessionLimit: false,
      }),
    );
    expect(mockCreateAnalysisRequestRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        cacheKeyVersion: "v2",
        cacheKeyHash: expect.any(String),
        modelStrategy: "sonnet_default",
        primaryModel: "claude-sonnet-4-20250514",
        userContextJson: {
          relationshipStage: "曖昧中",
          userGoal: "我該怎麼回",
        },
      }),
    );
    expect(mockGenerateModuleResult).toHaveBeenCalledTimes(1);
    expect(mockGenerateModuleResult).toHaveBeenCalledWith(
      expect.objectContaining({
        userContext: {
          relationshipStage: "曖昧中",
          userGoal: "我該怎麼回",
        },
      }),
      expect.any(Object),
    );
    expect(mockCreateCompletedPaidResultShadowRecord).not.toHaveBeenCalled();
    expect(mockCreateAnalysisResultRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: "request-2",
        promptVersion: "product_result_prompt_free_v0.1",
        schemaVersion: "product_result_schema_free_v1",
        normalizedResultJson: expect.not.objectContaining({
          paid_result: expect.anything(),
        }),
      }),
    );
    expect(mockUpdateAnalysisRequestState).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: "request-2",
        status: "analyzing",
      }),
    );
    expect(mockUpdateAnalysisRequestState).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: "request-2",
        status: "completed",
        resultId: "result-2",
      }),
    );
    expect(mockInsertEvent).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        eventName: "input_submitted",
        metadata: expect.objectContaining({
          cacheHit: false,
        }),
      }),
    );
    expect(mockInsertEvent).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        eventName: "analysis_completed",
        metadata: expect.objectContaining({
          resultId: "result-2",
          cacheHit: false,
        }),
      }),
    );
  });

  it("skips IP and session limits for valid operator test requests", async () => {
    mockGetOperatorTestMode.mockReturnValue({ enabled: true, source: "header" });
    mockGetCachedAnalysisResult.mockResolvedValue(null);
    mockCreateAnalysisRequestRecord.mockResolvedValue({ id: "request-operator" });
    mockGenerateModuleResult.mockResolvedValue({
      result: extractFreeResult(aiTemperatureDemoProductResult),
      provider: "anthropic",
      providerModel: "claude-sonnet-4-20250514",
      providerRawJson: { id: "provider-response" },
      redactedText: "redacted",
      privacyFlags: [],
      scoreBucket: "warm",
      runtimeModel: {
        modelStrategy: "sonnet_default",
        primaryModel: "claude-sonnet-4-20250514",
        finalModel: "claude-sonnet-4-20250514",
        retryCount: 0,
        fallbackUsed: false,
        schemaValidationPassed: true,
      },
    });
    mockCreateAnalysisResultRecord.mockResolvedValue({ id: "result-operator" });

    const response = await analyzePost(
      new Request("http://localhost/api/modules/ambiguous-temperature/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-operator-test-secret": "configured-secret",
        },
        body: JSON.stringify(validBody),
      }),
      {
        params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }),
      },
    );

    expect(response.status).toBe(200);
    expect(mockCheckIpHourlyLimit).not.toHaveBeenCalled();
    expect(mockCheckPersistedAnalyzeLimits).toHaveBeenCalledWith(
      expect.objectContaining({
        skipSessionLimit: true,
      }),
    );
    expect(mockInsertEvent).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        eventName: "input_submitted",
        metadata: expect.objectContaining({
          operatorTest: true,
          testModeSource: "header",
        }),
      }),
    );
    expect(mockInsertEvent).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        eventName: "analysis_completed",
        metadata: expect.objectContaining({
          operatorTest: true,
          testModeSource: "header",
        }),
      }),
    );
  });

  it("treats missing or invalid operator credentials like normal public traffic", async () => {
    mockGetCachedAnalysisResult.mockResolvedValue(null);
    mockCheckIpHourlyLimit.mockReturnValue({
      ok: false,
      error: "rate_limited_ip",
      message: "limited",
    });

    const response = await analyzePost(
      new Request("http://localhost/api/modules/ambiguous-temperature/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validBody),
      }),
      {
        params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }),
      },
    );

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "rate_limited_ip",
    });
    expect(mockCheckPersistedAnalyzeLimits).not.toHaveBeenCalled();
    expect(mockGenerateModuleResult).not.toHaveBeenCalled();
  });

  it("still enforces input validation in operator test mode", async () => {
    mockGetOperatorTestMode.mockReturnValue({ enabled: true, source: "header" });

    const response = await analyzePost(
      new Request("http://localhost/api/modules/ambiguous-temperature/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-operator-test-secret": "configured-secret",
        },
        body: JSON.stringify({
          ...validBody,
          text: "太短",
        }),
      }),
      {
        params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }),
      },
    );

    expect(response.status).toBe(400);
    expect(mockCheckIpHourlyLimit).not.toHaveBeenCalled();
    expect(mockCheckPersistedAnalyzeLimits).not.toHaveBeenCalled();
    expect(mockGenerateModuleResult).not.toHaveBeenCalled();
  });

  it("marks a persisted request failed when provider generation fails", async () => {
    mockGetCachedAnalysisResult.mockResolvedValue(null);
    mockCreateAnalysisRequestRecord.mockResolvedValue({ id: "request-failed" });
    mockGenerateModuleResult.mockRejectedValue(new Error("provider failed"));

    const response = await analyzePost(
      new Request("http://localhost/api/modules/ambiguous-temperature/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validBody),
      }),
      {
        params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }),
      },
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "provider_error",
    });
    expect(mockUpdateAnalysisRequestState).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: "request-failed",
        status: "failed",
        errorCode: "provider_error",
        errorCategory: "provider",
      }),
    );
  });

  it("marks output validation failures with a sanitized internal category", async () => {
    mockGetCachedAnalysisResult.mockResolvedValue(null);
    mockCreateAnalysisRequestRecord.mockResolvedValue({ id: "request-output-validation-failed" });
    mockGenerateModuleResult.mockRejectedValue(new Error("paid_result contains forbidden phrasing."));
    mockIsOutputValidationError.mockReturnValue(true);

    const response = await analyzePost(
      new Request("http://localhost/api/modules/ambiguous-temperature/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validBody),
      }),
      {
        params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }),
      },
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "provider_error",
    });
    expect(mockUpdateAnalysisRequestState).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: "request-output-validation-failed",
        status: "failed",
        errorCode: "provider_error",
        errorCategory: "output_validation",
      }),
    );
  });
});
