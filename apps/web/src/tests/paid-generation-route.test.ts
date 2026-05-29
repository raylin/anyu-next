import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetPaidResultStatusForAnalysisResult,
  mockGetUnlockIntentByTokenHash,
  mockGetGenerationJobByDedupeKey,
  mockRequestDeferredPaidGeneration,
  mockResolvePaidAccessToken,
} = vi.hoisted(() => ({
  mockGetPaidResultStatusForAnalysisResult: vi.fn(),
  mockGetUnlockIntentByTokenHash: vi.fn(),
  mockGetGenerationJobByDedupeKey: vi.fn(),
  mockRequestDeferredPaidGeneration: vi.fn(),
  mockResolvePaidAccessToken: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  isDbConfigured: () => true,
}));

vi.mock("@/lib/modules/paid-generation-service", () => ({
  requestDeferredPaidGeneration: mockRequestDeferredPaidGeneration,
}));

vi.mock("@/lib/db/runtime", () => ({
  getUnlockIntentByTokenHash: mockGetUnlockIntentByTokenHash,
}));

vi.mock("@/lib/db/paid-results", () => ({
  getPaidResultStatusForAnalysisResult: mockGetPaidResultStatusForAnalysisResult,
}));

vi.mock("@/lib/db/generation-jobs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/db/generation-jobs")>();

  return {
    ...actual,
    getGenerationJobByDedupeKey: mockGetGenerationJobByDedupeKey,
  };
});

vi.mock("@/lib/payments/paid-access-resolver", () => ({
  resolvePaidAccessToken: mockResolvePaidAccessToken,
}));

import { POST } from "@/app/api/modules/[moduleSlug]/paid-result/request/route";
import { POST as statusPost } from "@/app/api/modules/[moduleSlug]/paid-result/status/route";

describe("paid result generation request route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.ENABLE_PAID_GENERATION_JOBS;
  });

  it("requests deferred paid generation for a result and unlock intent", async () => {
    mockRequestDeferredPaidGeneration.mockResolvedValue({
      ok: true,
      status: "completed",
      paidResultId: "paid-result-1",
      reused: false,
    });

    const response = await POST(
      new Request("http://localhost/api/modules/ambiguous-temperature/paid-result/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resultId: "result-1",
          unlockIntentId: "unlock-intent-1",
        }),
      }),
      { params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      status: "completed",
      paidResultId: "paid-result-1",
      reused: false,
    });
    expect(mockRequestDeferredPaidGeneration).toHaveBeenCalledWith(
      expect.objectContaining({
        resultId: "result-1",
        unlockIntentId: "unlock-intent-1",
        triggerSource: "web_unlock",
      }),
    );
  });

  it("rejects missing identifiers", async () => {
    const response = await POST(
      new Request("http://localhost/api/modules/ambiguous-temperature/paid-result/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultId: "result-1" }),
      }),
      { params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }) },
    );

    expect(response.status).toBe(400);
    expect(mockRequestDeferredPaidGeneration).not.toHaveBeenCalled();
  });

  it("returns safe errors without exposing source material", async () => {
    mockRequestDeferredPaidGeneration.mockResolvedValue({
      ok: false,
      status: 409,
      error: "source_unavailable",
    });

    const response = await POST(
      new Request("http://localhost/api/modules/ambiguous-temperature/paid-result/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resultId: "result-1",
          unlockIntentId: "unlock-intent-1",
        }),
      }),
      { params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }) },
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "source_unavailable",
    });
  });

  it("returns a privacy-safe paid result processing status", async () => {
    mockGetUnlockIntentByTokenHash.mockResolvedValue({
      unlockIntent: {
        themeSlug: "ambiguous-temperature",
        unlockTokenExpiresAt: new Date(Date.now() + 60_000),
      },
      result: {
        id: "result-1",
      },
    });
    mockGetPaidResultStatusForAnalysisResult.mockResolvedValue({
      status: "processing",
      errorCode: null,
    });

    const response = await statusPost(
      new Request("http://localhost/api/modules/ambiguous-temperature/paid-result/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unlockToken: "unlock-token-1.r" }),
      }),
      { params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }) },
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      ok: true,
      status: "processing",
      retryable: true,
      errorCategory: null,
    });
    expect(JSON.stringify(data)).not.toContain("unlock-token");
    expect(JSON.stringify(data)).not.toContain("paid_result");
  });

  it("returns completed paid status without returning paid result JSON", async () => {
    mockGetUnlockIntentByTokenHash.mockResolvedValue({
      unlockIntent: {
        themeSlug: "ambiguous-temperature",
        unlockTokenExpiresAt: new Date(Date.now() + 60_000),
      },
      result: {
        id: "result-1",
      },
    });
    mockGetPaidResultStatusForAnalysisResult.mockResolvedValue({
      status: "completed",
      errorCode: null,
    });

    const response = await statusPost(
      new Request("http://localhost/api/modules/ambiguous-temperature/paid-result/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unlockToken: "unlock-token-1.r" }),
      }),
      { params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      status: "completed",
      retryable: false,
      errorCategory: null,
    });
  });

  it("resolves pa_ paid access tokens without falling back to legacy unlock lookup", async () => {
    const paidAccessToken = `pa_${"a".repeat(43)}`;
    mockResolvePaidAccessToken.mockResolvedValue({
      ok: true,
      state: "ready",
    });

    const response = await statusPost(
      new Request("http://localhost/api/modules/ambiguous-temperature/paid-result/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unlockToken: paidAccessToken }),
      }),
      { params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }) },
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      ok: true,
      status: "completed",
      retryable: false,
      errorCategory: null,
    });
    expect(mockResolvePaidAccessToken).toHaveBeenCalledWith({
      moduleSlug: "ambiguous-temperature",
      rawToken: paidAccessToken,
    });
    expect(mockGetUnlockIntentByTokenHash).not.toHaveBeenCalled();
    expect(JSON.stringify(data)).not.toContain(paidAccessToken);
  });

  it("does not fall back to legacy unlock lookup for invalid pa_ tokens", async () => {
    mockResolvePaidAccessToken.mockResolvedValue({
      ok: false,
      state: "not_found",
      errorCategory: "invalid_token",
    });

    const response = await statusPost(
      new Request("http://localhost/api/modules/ambiguous-temperature/paid-result/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unlockToken: "pa_short" }),
      }),
      { params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      status: "expired",
      retryable: false,
      errorCategory: "invalid_paid_access",
    });
    expect(mockResolvePaidAccessToken).toHaveBeenCalledWith({
      moduleSlug: "ambiguous-temperature",
      rawToken: "pa_short",
    });
    expect(mockGetUnlockIntentByTokenHash).not.toHaveBeenCalled();
  });

  it("treats legacy completed paid rows as completed while current schema rolls forward", async () => {
    mockGetUnlockIntentByTokenHash.mockResolvedValue({
      unlockIntent: {
        themeSlug: "ambiguous-temperature",
        unlockTokenExpiresAt: new Date(Date.now() + 60_000),
      },
      result: {
        id: "result-1",
      },
    });
    mockGetPaidResultStatusForAnalysisResult
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        status: "completed",
        errorCode: null,
      });

    const response = await statusPost(
      new Request("http://localhost/api/modules/ambiguous-temperature/paid-result/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unlockToken: "unlock-token-1.r" }),
      }),
      { params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      status: "completed",
      retryable: false,
      errorCategory: null,
    });
    expect(mockGetPaidResultStatusForAnalysisResult).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        promptVersion: "paid_result_prompt_v0.2",
        schemaVersion: "paid_result_schema_v3",
      }),
    );
    expect(mockGetPaidResultStatusForAnalysisResult).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        status: "completed",
      }),
    );
  });

  it("treats claimed fulfillment links without a paid row as pending, not generic missing", async () => {
    mockGetUnlockIntentByTokenHash.mockResolvedValue({
      unlockIntent: {
        themeSlug: "ambiguous-temperature",
        fulfillmentStatus: "delivered",
        unlockTokenExpiresAt: new Date(Date.now() + 60_000),
      },
      result: {
        id: "result-1",
      },
    });
    mockGetPaidResultStatusForAnalysisResult.mockResolvedValue(null);

    const response = await statusPost(
      new Request("http://localhost/api/modules/ambiguous-temperature/paid-result/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unlockToken: "unlock-token-1.r" }),
      }),
      { params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      status: "pending",
      retryable: true,
      errorCategory: null,
    });
    expect(mockGetGenerationJobByDedupeKey).not.toHaveBeenCalled();
  });

  it("maps a processing generation job to a privacy-safe processing status when enabled", async () => {
    process.env.ENABLE_PAID_GENERATION_JOBS = "true";
    mockGetUnlockIntentByTokenHash.mockResolvedValue({
      unlockIntent: {
        themeSlug: "ambiguous-temperature",
        fulfillmentStatus: "bound",
        unlockTokenExpiresAt: new Date(Date.now() + 60_000),
      },
      result: {
        id: "result-1",
      },
    });
    mockGetPaidResultStatusForAnalysisResult.mockResolvedValue(null);
    mockGetGenerationJobByDedupeKey.mockResolvedValue({
      status: "processing",
      id: "job-1",
      dedupeKey: "paid_analysis:ambiguous-temperature:result-1:paid_result_prompt_v0.2:paid_result_schema_v3",
      attemptCount: 1,
      lockedBy: "direct_paid_generation",
    });

    const response = await statusPost(
      new Request("http://localhost/api/modules/ambiguous-temperature/paid-result/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unlockToken: "unlock-token-1.r" }),
      }),
      { params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }) },
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      ok: true,
      status: "processing",
      retryable: true,
      errorCategory: null,
    });
    expect(JSON.stringify(data)).not.toContain("job-1");
    expect(JSON.stringify(data)).not.toContain("dedupe");
    expect(JSON.stringify(data)).not.toContain("unlock-token");
  });

  it("maps queued and retry-scheduled generation jobs to pending without exposing internals", async () => {
    process.env.ENABLE_PAID_GENERATION_JOBS = "true";
    mockGetUnlockIntentByTokenHash.mockResolvedValue({
      unlockIntent: {
        themeSlug: "ambiguous-temperature",
        fulfillmentStatus: "bound",
        unlockTokenExpiresAt: new Date(Date.now() + 60_000),
      },
      result: {
        id: "result-1",
      },
    });
    mockGetPaidResultStatusForAnalysisResult.mockResolvedValue(null);
    mockGetGenerationJobByDedupeKey.mockResolvedValue({
      status: "retry_scheduled",
      id: "job-1",
      attemptCount: 1,
      lastErrorCategory: "provider",
    });

    const response = await statusPost(
      new Request("http://localhost/api/modules/ambiguous-temperature/paid-result/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unlockToken: "unlock-token-1.r" }),
      }),
      { params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      status: "pending",
      retryable: true,
      errorCategory: null,
    });
  });

  it("maps failed-final generation jobs to failed without exposing internal error details", async () => {
    process.env.ENABLE_PAID_GENERATION_JOBS = "true";
    mockGetUnlockIntentByTokenHash.mockResolvedValue({
      unlockIntent: {
        themeSlug: "ambiguous-temperature",
        fulfillmentStatus: "bound",
        unlockTokenExpiresAt: new Date(Date.now() + 60_000),
      },
      result: {
        id: "result-1",
      },
    });
    mockGetPaidResultStatusForAnalysisResult.mockResolvedValue(null);
    mockGetGenerationJobByDedupeKey.mockResolvedValue({
      status: "failed_final",
      id: "job-1",
      lastErrorCategory: "provider",
      lastErrorCode: "anthropic_timeout",
    });

    const response = await statusPost(
      new Request("http://localhost/api/modules/ambiguous-temperature/paid-result/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unlockToken: "unlock-token-1.r" }),
      }),
      { params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }) },
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      ok: true,
      status: "failed",
      retryable: false,
      errorCategory: "paid_generation_failed",
    });
    expect(JSON.stringify(data)).not.toContain("anthropic_timeout");
    expect(JSON.stringify(data)).not.toContain("job-1");
  });

  it("keeps completed paid results ahead of generation job state", async () => {
    process.env.ENABLE_PAID_GENERATION_JOBS = "true";
    mockGetUnlockIntentByTokenHash.mockResolvedValue({
      unlockIntent: {
        themeSlug: "ambiguous-temperature",
        fulfillmentStatus: "bound",
        unlockTokenExpiresAt: new Date(Date.now() + 60_000),
      },
      result: {
        id: "result-1",
      },
    });
    mockGetPaidResultStatusForAnalysisResult.mockResolvedValue({
      status: "completed",
      errorCode: null,
    });
    mockGetGenerationJobByDedupeKey.mockResolvedValue({
      status: "processing",
    });

    const response = await statusPost(
      new Request("http://localhost/api/modules/ambiguous-temperature/paid-result/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unlockToken: "unlock-token-1.r" }),
      }),
      { params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      status: "completed",
      retryable: false,
      errorCategory: null,
    });
    expect(mockGetGenerationJobByDedupeKey).not.toHaveBeenCalled();
  });

  it("fails open to claimed pending behavior if generation job lookup fails", async () => {
    process.env.ENABLE_PAID_GENERATION_JOBS = "true";
    mockGetUnlockIntentByTokenHash.mockResolvedValue({
      unlockIntent: {
        themeSlug: "ambiguous-temperature",
        fulfillmentStatus: "delivered",
        unlockTokenExpiresAt: new Date(Date.now() + 60_000),
      },
      result: {
        id: "result-1",
      },
    });
    mockGetPaidResultStatusForAnalysisResult.mockResolvedValue(null);
    mockGetGenerationJobByDedupeKey.mockRejectedValue(new Error("generation_jobs unavailable"));

    const response = await statusPost(
      new Request("http://localhost/api/modules/ambiguous-temperature/paid-result/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unlockToken: "unlock-token-1.r" }),
      }),
      { params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      status: "pending",
      retryable: true,
      errorCategory: null,
    });
  });
});
