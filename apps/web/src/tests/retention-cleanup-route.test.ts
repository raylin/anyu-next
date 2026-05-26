import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockRunScheduledRetentionCleanup } = vi.hoisted(() => ({
  mockRunScheduledRetentionCleanup: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  isDbConfigured: () => true,
}));

vi.mock("@/lib/runtime/retention-cleanup", async () => {
  const actual = await vi.importActual<typeof import("@/lib/runtime/retention-cleanup")>(
    "@/lib/runtime/retention-cleanup",
  );

  return {
    ...actual,
    runScheduledRetentionCleanup: mockRunScheduledRetentionCleanup,
  };
});

import { GET } from "@/app/api/cron/retention-cleanup/route";

const originalRetentionCleanupSecret = process.env.RETENTION_CLEANUP_SECRET;
const originalCronSecret = process.env.CRON_SECRET;

describe("retention cleanup cron route", () => {
  beforeEach(() => {
    process.env.RETENTION_CLEANUP_SECRET = "cleanup-secret";
    delete process.env.CRON_SECRET;
    mockRunScheduledRetentionCleanup.mockReset();
  });

  afterEach(() => {
    if (originalRetentionCleanupSecret === undefined) {
      delete process.env.RETENTION_CLEANUP_SECRET;
    } else {
      process.env.RETENTION_CLEANUP_SECRET = originalRetentionCleanupSecret;
    }

    if (originalCronSecret === undefined) {
      delete process.env.CRON_SECRET;
    } else {
      process.env.CRON_SECRET = originalCronSecret;
    }
  });

  it("refuses requests without a valid secret", async () => {
    const response = await GET(
      new Request("http://localhost/api/cron/retention-cleanup"),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "unauthorized",
    });
    expect(mockRunScheduledRetentionCleanup).not.toHaveBeenCalled();
  });

  it("supports dry-run requests and returns aggregate counts only", async () => {
    mockRunScheduledRetentionCleanup.mockResolvedValue({
      ok: true,
      dryRun: true,
      analysisRequestsDeleted: 1,
      analysisResultsDeleted: 2,
      analysisPaidResults: {
        total: 5,
        withRetention: 4,
        overdue: 3,
        eligibleForCleanup: 2,
        scrubbed: 0,
      },
      startedAt: "2026-05-21T12:00:00.000Z",
      finishedAt: "2026-05-21T12:00:01.000Z",
      durationMs: 1000,
    });

    const response = await GET(
      new Request("http://localhost/api/cron/retention-cleanup?dryRun=1", {
        headers: {
          Authorization: "Bearer cleanup-secret",
        },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      dryRun: true,
      analysisRequestsDeleted: 1,
      analysisResultsDeleted: 2,
      analysisPaidResults: {
        total: 5,
        withRetention: 4,
        overdue: 3,
        eligibleForCleanup: 2,
        scrubbed: 0,
      },
      startedAt: "2026-05-21T12:00:00.000Z",
      finishedAt: "2026-05-21T12:00:01.000Z",
      durationMs: 1000,
    });
    expect(mockRunScheduledRetentionCleanup).toHaveBeenCalledWith(
      expect.objectContaining({ dryRun: true }),
    );
  });

  it("returns a friendly config error when the cleanup secret is absent", async () => {
    delete process.env.RETENTION_CLEANUP_SECRET;
    delete process.env.CRON_SECRET;

    const response = await GET(
      new Request("http://localhost/api/cron/retention-cleanup", {
        headers: {
          Authorization: "Bearer cleanup-secret",
        },
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "config_error",
    });
  });
});
