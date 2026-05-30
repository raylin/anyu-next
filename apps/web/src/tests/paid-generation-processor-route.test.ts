import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockIsDbConfigured, mockProcessPaidAnalysisJobs } = vi.hoisted(() => ({
  mockIsDbConfigured: vi.fn(),
  mockProcessPaidAnalysisJobs: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  isDbConfigured: mockIsDbConfigured,
}));

vi.mock("@/lib/modules/paid-generation-processor", () => ({
  processPaidAnalysisJobs: mockProcessPaidAnalysisJobs,
}));

import { POST } from "@/app/api/internal/jobs/process/route";

describe("paid generation processor route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.INTERNAL_JOB_SECRET = "processor-secret";
    delete process.env.CRON_SECRET;
    delete process.env.ENABLE_PAID_GENERATION_PROCESSOR;
    delete process.env.VERCEL_ENV;
    mockIsDbConfigured.mockReturnValue(true);
    mockProcessPaidAnalysisJobs.mockResolvedValue({
      ok: true,
      dryRun: false,
      processed: 1,
      completed: 1,
      retryScheduled: 0,
      failedFinal: 0,
      staleRecovered: 0,
      skipped: 0,
    });
  });

  it("rejects missing and invalid secrets", async () => {
    const missing = await POST(
      new Request("http://localhost/api/internal/jobs/process", {
        method: "POST",
        body: JSON.stringify({ jobType: "paid_analysis" }),
      }),
    );
    const invalid = await POST(
      new Request("http://localhost/api/internal/jobs/process", {
        method: "POST",
        headers: { authorization: "Bearer wrong-secret" },
        body: JSON.stringify({ jobType: "paid_analysis" }),
      }),
    );

    expect(missing.status).toBe(401);
    expect(invalid.status).toBe(401);
    expect(mockProcessPaidAnalysisJobs).not.toHaveBeenCalled();
  });

  it("does not expose auth diagnostics for unauthorized requests", async () => {
    const response = await POST(
      new Request("http://localhost/api/internal/jobs/process", {
        method: "POST",
        headers: {
          authorization: "Bearer wrong-secret",
          "x-processor-auth-diagnostic": "1",
        },
        body: JSON.stringify({ jobType: "paid_analysis" }),
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({
      ok: false,
      error: "unauthorized",
      message: "Unauthorized processor request.",
    });
    expect(JSON.stringify(data)).not.toContain("processor-secret");
    expect(JSON.stringify(data)).not.toContain("wrong-secret");
    expect(JSON.stringify(data)).not.toContain(String("processor-secret".length));
    expect(mockProcessPaidAnalysisJobs).not.toHaveBeenCalled();
  });

  it("does not expose diagnostics in production mode", async () => {
    process.env.VERCEL_ENV = "production";

    const response = await POST(
      new Request("http://localhost/api/internal/jobs/process", {
        method: "POST",
        headers: {
          authorization: "Bearer wrong-secret",
          "x-processor-auth-diagnostic": "1",
        },
        body: JSON.stringify({ jobType: "paid_analysis" }),
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({
      ok: false,
      error: "unauthorized",
      message: "Unauthorized processor request.",
    });
  });

  it("returns safe config error when no internal job secret is configured", async () => {
    delete process.env.INTERNAL_JOB_SECRET;

    const response = await POST(
      new Request("http://localhost/api/internal/jobs/process", {
        method: "POST",
        headers: {
          authorization: "Bearer anything",
          "x-processor-auth-diagnostic": "1",
        },
        body: JSON.stringify({ jobType: "paid_analysis" }),
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toEqual({
      ok: false,
      error: "config_error",
      message: "Processor is not configured.",
    });
    expect(JSON.stringify(data)).not.toContain("anything");
    expect(mockProcessPaidAnalysisJobs).not.toHaveBeenCalled();
  });

  it("rejects valid secret while the processor flag is disabled", async () => {
    const response = await POST(
      new Request("http://localhost/api/internal/jobs/process", {
        method: "POST",
        headers: { authorization: "Bearer processor-secret" },
        body: JSON.stringify({ jobType: "paid_analysis" }),
      }),
    );

    expect(response.status).toBe(403);
    expect(mockProcessPaidAnalysisJobs).not.toHaveBeenCalled();
  });

  it("processes paid analysis jobs with aggregate-only response when enabled", async () => {
    process.env.ENABLE_PAID_GENERATION_PROCESSOR = "true";

    const response = await POST(
      new Request("http://localhost/api/internal/jobs/process", {
        method: "POST",
        headers: {
          authorization: "Bearer processor-secret",
          "content-type": "application/json",
        },
        body: JSON.stringify({ jobType: "paid_analysis", limit: 3 }),
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      ok: true,
      dryRun: false,
      processed: 1,
      completed: 1,
      retryScheduled: 0,
      failedFinal: 0,
      staleRecovered: 0,
      skipped: 0,
    });
    expect(JSON.stringify(data)).not.toContain("job-");
    expect(JSON.stringify(data)).not.toContain("dedupe");
    expect(JSON.stringify(data)).not.toContain("paid_result_json");
    expect(mockProcessPaidAnalysisJobs).toHaveBeenCalledWith({
      dryRun: false,
      limit: 3,
    });
  });

  it("rejects unsupported job types", async () => {
    process.env.ENABLE_PAID_GENERATION_PROCESSOR = "true";

    const response = await POST(
      new Request("http://localhost/api/internal/jobs/process", {
        method: "POST",
        headers: { authorization: "Bearer processor-secret" },
        body: JSON.stringify({ jobType: "other" }),
      }),
    );

    expect(response.status).toBe(400);
    expect(mockProcessPaidAnalysisJobs).not.toHaveBeenCalled();
  });
});
