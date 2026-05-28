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

import { GET } from "@/app/api/cron/paid-generation/route";

describe("paid generation cron route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "cron-secret";
    process.env.INTERNAL_JOB_SECRET = "internal-secret";
    delete process.env.ENABLE_PAID_GENERATION_PROCESSOR;
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

  it("rejects missing, invalid, query-string, and internal-only secrets", async () => {
    const missing = await GET(new Request("http://localhost/api/cron/paid-generation"));
    const invalid = await GET(
      new Request("http://localhost/api/cron/paid-generation", {
        headers: { authorization: "Bearer wrong-secret" },
      }),
    );
    const querySecret = await GET(
      new Request("http://localhost/api/cron/paid-generation?secret=cron-secret"),
    );
    const internalSecret = await GET(
      new Request("http://localhost/api/cron/paid-generation", {
        headers: { authorization: "Bearer internal-secret" },
      }),
    );

    expect(missing.status).toBe(401);
    expect(invalid.status).toBe(401);
    expect(querySecret.status).toBe(401);
    expect(internalSecret.status).toBe(401);
    expect(mockProcessPaidAnalysisJobs).not.toHaveBeenCalled();
  });

  it("rejects valid cron auth while the processor flag is disabled", async () => {
    const response = await GET(
      new Request("http://localhost/api/cron/paid-generation", {
        headers: { authorization: "Bearer cron-secret" },
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "processor_disabled",
    });
    expect(mockProcessPaidAnalysisJobs).not.toHaveBeenCalled();
  });

  it("delegates to the processor with safe cron defaults", async () => {
    process.env.ENABLE_PAID_GENERATION_PROCESSOR = "true";

    const response = await GET(
      new Request("http://localhost/api/cron/paid-generation", {
        headers: { authorization: "Bearer cron-secret" },
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      ok: true,
      source: "cron",
      jobType: "paid_analysis",
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
      limit: 1,
      lockedBy: "paid_generation_cron",
    });
  });

  it("supports aggregate-only dry run", async () => {
    process.env.ENABLE_PAID_GENERATION_PROCESSOR = "true";
    mockProcessPaidAnalysisJobs.mockResolvedValue({
      ok: true,
      dryRun: true,
      processed: 0,
      completed: 0,
      retryScheduled: 0,
      failedFinal: 0,
      staleRecovered: 0,
      skipped: 1,
    });

    const response = await GET(
      new Request("http://localhost/api/cron/paid-generation?dryRun=1", {
        headers: { authorization: "Bearer cron-secret" },
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      ok: true,
      source: "cron",
      jobType: "paid_analysis",
      dryRun: true,
      processed: 0,
      skipped: 1,
    });
    expect(mockProcessPaidAnalysisJobs).toHaveBeenCalledWith({
      dryRun: true,
      limit: 1,
      lockedBy: "paid_generation_cron",
    });
  });

  it("returns config error if CRON_SECRET is absent", async () => {
    delete process.env.CRON_SECRET;

    const response = await GET(
      new Request("http://localhost/api/cron/paid-generation", {
        headers: { authorization: "Bearer cron-secret" },
      }),
    );

    expect(response.status).toBe(503);
    expect(mockProcessPaidAnalysisJobs).not.toHaveBeenCalled();
  });
});
