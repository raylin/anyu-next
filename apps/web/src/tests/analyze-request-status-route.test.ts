import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetAnalysisRequestStatusRecord,
  mockUpdateAnalysisRequestState,
} = vi.hoisted(() => ({
  mockGetAnalysisRequestStatusRecord: vi.fn(),
  mockUpdateAnalysisRequestState: vi.fn(),
}));

vi.mock("@/lib/db/runtime", () => ({
  getAnalysisRequestStatusRecord: mockGetAnalysisRequestStatusRecord,
  updateAnalysisRequestState: mockUpdateAnalysisRequestState,
}));

vi.mock("@/lib/db/client", () => ({
  isDbConfigured: () => true,
}));

import { GET as requestStatusGet } from "@/app/api/modules/[moduleSlug]/analyze/requests/[requestId]/route";

describe("analyze request status route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a privacy-safe processing status", async () => {
    mockGetAnalysisRequestStatusRecord.mockResolvedValue({
      request: {
        id: "request-1",
        status: "analyzing",
        createdAt: new Date(),
      },
      result: null,
    });

    const response = await requestStatusGet(
      new Request("http://localhost/api/modules/ambiguous-temperature/analyze/requests/request-1"),
      {
        params: Promise.resolve({
          moduleSlug: "ambiguous-temperature",
          requestId: "request-1",
        }),
      },
    );

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data).toMatchObject({
      ok: true,
      status: "processing",
      phase: "analyzing",
      retryable: false,
    });
    expect(JSON.stringify(data)).not.toContain("raw");
  });

  it("returns a completed result route without exposing result JSON", async () => {
    mockGetAnalysisRequestStatusRecord.mockResolvedValue({
      request: {
        id: "request-2",
        status: "completed",
        resultId: "result-2",
        createdAt: new Date(),
      },
      result: {
        id: "result-2",
        normalizedResultJson: { private: "not-returned" },
      },
    });

    const response = await requestStatusGet(
      new Request("http://localhost/api/modules/ambiguous-temperature/analyze/requests/request-2"),
      {
        params: Promise.resolve({
          moduleSlug: "ambiguous-temperature",
          requestId: "request-2",
        }),
      },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      status: "completed",
      resultId: "result-2",
      redirectTo: "/m/ambiguous-temperature/result/result-2",
      retryable: false,
    });
  });

  it("returns friendly failed status metadata", async () => {
    mockGetAnalysisRequestStatusRecord.mockResolvedValue({
      request: {
        id: "request-3",
        status: "failed",
        errorCode: "provider_error",
        errorCategory: "provider",
        createdAt: new Date(),
      },
      result: null,
    });

    const response = await requestStatusGet(
      new Request("http://localhost/api/modules/ambiguous-temperature/analyze/requests/request-3"),
      {
        params: Promise.resolve({
          moduleSlug: "ambiguous-temperature",
          requestId: "request-3",
        }),
      },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      status: "failed",
      errorCode: "provider_error",
      errorCategory: "provider",
      message: "這段內容暫時沒有分析成功，可以稍後再試一次。",
      retryable: true,
    });
  });

  it("marks old processing requests as expired", async () => {
    mockGetAnalysisRequestStatusRecord.mockResolvedValue({
      request: {
        id: "request-4",
        status: "analyzing",
        createdAt: new Date(Date.now() - 11 * 60 * 1000),
      },
      result: null,
    });

    const response = await requestStatusGet(
      new Request("http://localhost/api/modules/ambiguous-temperature/analyze/requests/request-4"),
      {
        params: Promise.resolve({
          moduleSlug: "ambiguous-temperature",
          requestId: "request-4",
        }),
      },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      status: "expired",
      errorCode: "request_expired",
      retryable: true,
    });
    expect(mockUpdateAnalysisRequestState).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: "request-4",
        status: "expired",
      }),
    );
  });
});
