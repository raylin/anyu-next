import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetPaidResultStatusForAnalysisResult,
  mockGetUnlockIntentByTokenHash,
  mockRequestDeferredPaidGeneration,
} = vi.hoisted(() => ({
  mockGetPaidResultStatusForAnalysisResult: vi.fn(),
  mockGetUnlockIntentByTokenHash: vi.fn(),
  mockRequestDeferredPaidGeneration: vi.fn(),
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

import { POST } from "@/app/api/modules/[moduleSlug]/paid-result/request/route";
import { POST as statusPost } from "@/app/api/modules/[moduleSlug]/paid-result/status/route";

describe("paid result generation request route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
