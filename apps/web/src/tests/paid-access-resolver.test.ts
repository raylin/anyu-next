import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetEntitlementByPaidAccessToken,
  mockGetAnalysisResultWithRequestById,
  mockGetPaidResultForAnalysisResult,
  mockGetGenerationJobById,
  mockGetGenerationJobByDedupeKey,
} = vi.hoisted(() => ({
  mockGetEntitlementByPaidAccessToken: vi.fn(),
  mockGetAnalysisResultWithRequestById: vi.fn(),
  mockGetPaidResultForAnalysisResult: vi.fn(),
  mockGetGenerationJobById: vi.fn(),
  mockGetGenerationJobByDedupeKey: vi.fn(),
}));

vi.mock("@/lib/db/entitlements", () => ({
  getEntitlementByPaidAccessToken: mockGetEntitlementByPaidAccessToken,
}));

vi.mock("@/lib/db/runtime", () => ({
  getAnalysisResultWithRequestById: mockGetAnalysisResultWithRequestById,
}));

vi.mock("@/lib/db/paid-results", () => ({
  getPaidResultForAnalysisResult: mockGetPaidResultForAnalysisResult,
}));

vi.mock("@/lib/db/generation-jobs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/db/generation-jobs")>();

  return {
    ...actual,
    getGenerationJobById: mockGetGenerationJobById,
    getGenerationJobByDedupeKey: mockGetGenerationJobByDedupeKey,
  };
});

import { resolvePaidAccessToken } from "@/lib/payments/paid-access-resolver";

const VALID_PAID_TOKEN = `pa_${"a".repeat(43)}`;
const NOW = new Date("2026-05-27T00:00:00.000Z");

function entitlement(overrides: Record<string, unknown> = {}) {
  return {
    id: "entitlement-1",
    status: "active",
    moduleSlug: "ambiguous-temperature",
    analysisRequestId: "request-1",
    analysisResultId: "result-1",
    paymentIntentId: "payment-1",
    generationJobId: null,
    expiresAt: null,
    paidAccessTokenExpiresAt: null,
    ...overrides,
  };
}

function analysisRecord(input: { hasLegacyPaidResult?: boolean } = {}) {
  return {
    request: {
      id: "request-1",
      anonymousSessionId: "session-1",
    },
    result: {
      id: "result-1",
      scoreBucket: "warm",
      createdAt: NOW,
      normalizedResultJson: {
        ...(input.hasLegacyPaidResult === true
          ? {
              paid_result: {
                fullSummary: "safe paid summary",
                possibleStates: [],
                signalDeepDive: [],
                replyStrategies: [],
                next48HourPlan: [],
                avoidDoing: [],
                softInsight: "safe insight",
                summaryCard: {
                  headline: "headline",
                  body: "body",
                  nextMove: "next",
                },
              },
            }
          : {}),
        free_result: {
          temperature_score: 60,
          state_label: "偏暖",
        },
        paid_preview: {
          headline: "完整分析",
        },
      },
    },
  };
}

function paidAnalysisRecord() {
  return {
    request: {
      id: "request-1",
      anonymousSessionId: "session-1",
    },
    result: {
      id: "result-1",
      scoreBucket: "warm",
      createdAt: NOW,
      normalizedResultJson: {
        paid_result: {
          fullSummary: "safe paid summary",
          possibleStates: [],
          signalDeepDive: [],
          replyStrategies: [],
          next48HourPlan: [],
          avoidDoing: [],
          softInsight: "safe insight",
          summaryCard: {
            headline: "headline",
            body: "body",
            nextMove: "next",
          },
        },
      },
    },
  };
}

describe("paid access token resolver", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.ENABLE_PAID_GENERATION_JOBS;
  });

  it("resolves a valid pa_ token to ready without exposing raw token fields", async () => {
    mockGetEntitlementByPaidAccessToken.mockResolvedValue(entitlement());
    mockGetAnalysisResultWithRequestById.mockResolvedValue(paidAnalysisRecord());
    mockGetPaidResultForAnalysisResult.mockResolvedValue({
      status: "completed",
      paidResultJson: { fullSummary: "safe paid summary" },
      model: "claude",
    });

    const result = await resolvePaidAccessToken({
      moduleSlug: "ambiguous-temperature",
      rawToken: VALID_PAID_TOKEN,
      now: NOW,
    });

    expect(result).toMatchObject({
      ok: true,
      accessKind: "paid_access_token",
      state: "ready",
      moduleSlug: "ambiguous-temperature",
    });
    expect(mockGetEntitlementByPaidAccessToken).toHaveBeenCalledWith(VALID_PAID_TOKEN);
    expect(JSON.stringify(result)).not.toContain(VALID_PAID_TOKEN);
  });

  it("returns not_found for malformed pa_ tokens before lookup", async () => {
    const result = await resolvePaidAccessToken({
      moduleSlug: "ambiguous-temperature",
      rawToken: "pa_short",
      now: NOW,
    });

    expect(result).toEqual({
      ok: false,
      accessKind: "paid_access_token",
      state: "not_found",
      errorCategory: "invalid_token",
    });
    expect(mockGetEntitlementByPaidAccessToken).not.toHaveBeenCalled();
  });

  it("maps revoked and refunded entitlements to terminal resolver states", async () => {
    mockGetAnalysisResultWithRequestById.mockResolvedValue(analysisRecord());
    mockGetPaidResultForAnalysisResult.mockResolvedValue(null);
    mockGetEntitlementByPaidAccessToken.mockResolvedValueOnce(entitlement({ status: "revoked" }));

    await expect(
      resolvePaidAccessToken({
        moduleSlug: "ambiguous-temperature",
        rawToken: VALID_PAID_TOKEN,
        now: NOW,
      }),
    ).resolves.toMatchObject({ ok: true, state: "revoked" });

    mockGetEntitlementByPaidAccessToken.mockResolvedValueOnce(entitlement({ status: "refunded" }));

    await expect(
      resolvePaidAccessToken({
        moduleSlug: "ambiguous-temperature",
        rawToken: VALID_PAID_TOKEN,
        now: NOW,
      }),
    ).resolves.toMatchObject({ ok: true, state: "refunded" });
  });

  it("returns missing_generation_job when entitlement is active but no paid result or job exists", async () => {
    mockGetEntitlementByPaidAccessToken.mockResolvedValue(entitlement());
    mockGetAnalysisResultWithRequestById.mockResolvedValue(analysisRecord());
    mockGetPaidResultForAnalysisResult.mockResolvedValue(null);
    mockGetGenerationJobById.mockResolvedValue(null);
    mockGetGenerationJobByDedupeKey.mockResolvedValue(null);

    const result = await resolvePaidAccessToken({
      moduleSlug: "ambiguous-temperature",
      rawToken: VALID_PAID_TOKEN,
      now: NOW,
    });

    expect(result).toMatchObject({
      ok: true,
      state: "missing_generation_job",
    });
  });

  it("maps active entitlement with a processing generation job to processing", async () => {
    mockGetEntitlementByPaidAccessToken.mockResolvedValue(
      entitlement({ generationJobId: "job-1" }),
    );
    mockGetAnalysisResultWithRequestById.mockResolvedValue(analysisRecord());
    mockGetPaidResultForAnalysisResult.mockResolvedValue(null);
    mockGetGenerationJobById.mockResolvedValue({
      id: "job-1",
      status: "processing",
    });

    const result = await resolvePaidAccessToken({
      moduleSlug: "ambiguous-temperature",
      rawToken: VALID_PAID_TOKEN,
      now: NOW,
    });

    expect(result).toMatchObject({
      ok: true,
      state: "processing",
    });
  });
});
