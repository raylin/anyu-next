import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRequestDeferredPaidGeneration } = vi.hoisted(() => ({
  mockRequestDeferredPaidGeneration: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  isDbConfigured: () => true,
}));

vi.mock("@/lib/modules/paid-generation-service", () => ({
  requestDeferredPaidGeneration: mockRequestDeferredPaidGeneration,
}));

import { POST } from "@/app/api/modules/[moduleSlug]/paid-result/request/route";

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
});
