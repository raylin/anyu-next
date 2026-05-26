import { describe, expect, it, vi } from "vitest";
import {
  getRetentionCleanupSecret,
  isRetentionCleanupAuthorized,
  runScheduledRetentionCleanup,
} from "@/lib/runtime/retention-cleanup";

describe("retention cleanup helper", () => {
  it("prefers RETENTION_CLEANUP_SECRET and falls back to CRON_SECRET", () => {
    expect(
      getRetentionCleanupSecret({
        RETENTION_CLEANUP_SECRET: "retention-secret",
        CRON_SECRET: "cron-secret",
      } as NodeJS.ProcessEnv),
    ).toBe("retention-secret");

    expect(
      getRetentionCleanupSecret({
        CRON_SECRET: "cron-secret",
      } as NodeJS.ProcessEnv),
    ).toBe("cron-secret");
  });

  it("requires an exact bearer token match", () => {
    const env = {
      RETENTION_CLEANUP_SECRET: "cleanup-secret",
    } as NodeJS.ProcessEnv;

    expect(
      isRetentionCleanupAuthorized("Bearer cleanup-secret", env),
    ).toBe(true);
    expect(
      isRetentionCleanupAuthorized("Bearer wrong-secret", env),
    ).toBe(false);
    expect(isRetentionCleanupAuthorized(null, env)).toBe(false);
  });

  it("returns aggregate counts without mutating in dry-run mode", async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce({ rows: [{ count: 2 }] })
      .mockResolvedValueOnce({ rows: [{ count: 3 }] })
      .mockResolvedValueOnce({
        rows: [
          {
            total: 5,
            with_retention: 4,
            overdue: 3,
            eligible_for_cleanup: 2,
          },
        ],
      });

    const db = { execute } as never;
    const now = new Date("2026-05-21T12:00:00.000Z");
    const summary = await runScheduledRetentionCleanup(
      { dryRun: true, now },
      db,
    );

    expect(summary.ok).toBe(true);
    expect(summary.dryRun).toBe(true);
    expect(summary.analysisRequestsDeleted).toBe(2);
    expect(summary.analysisResultsDeleted).toBe(3);
    expect(summary.analysisPaidResults).toEqual({
      total: 5,
      withRetention: 4,
      overdue: 3,
      eligibleForCleanup: 2,
      scrubbed: 0,
    });
    expect(execute).toHaveBeenCalledTimes(3);
  });

  it("updates only the targeted analysis tables when not dry-run", async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce({ rows: [{ count: 1 }] })
      .mockResolvedValueOnce({ rows: [{ count: 2 }] })
      .mockResolvedValueOnce({
        rows: [
          {
            total: 4,
            with_retention: 3,
            overdue: 2,
            eligible_for_cleanup: 1,
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const db = { execute } as never;
    const summary = await runScheduledRetentionCleanup(
      {
        dryRun: false,
        now: new Date("2026-05-21T12:00:00.000Z"),
      },
      db,
    );

    expect(execute).toHaveBeenCalledTimes(6);
    expect(summary.analysisRequestsDeleted).toBe(1);
    expect(summary.analysisResultsDeleted).toBe(2);
    expect(summary.analysisPaidResults).toEqual({
      total: 4,
      withRetention: 3,
      overdue: 2,
      eligibleForCleanup: 1,
      scrubbed: 1,
    });
    expect(summary.dryRun).toBe(false);
  });

  it("leaves already scrubbed paid-result rows untouched", async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce({ rows: [{ count: 0 }] })
      .mockResolvedValueOnce({ rows: [{ count: 0 }] })
      .mockResolvedValueOnce({
        rows: [
          {
            total: 2,
            with_retention: 2,
            overdue: 1,
            eligible_for_cleanup: 0,
          },
        ],
      });

    const db = { execute } as never;
    const summary = await runScheduledRetentionCleanup(
      {
        dryRun: false,
        now: new Date("2026-05-21T12:00:00.000Z"),
      },
      db,
    );

    expect(execute).toHaveBeenCalledTimes(3);
    expect(summary.analysisPaidResults).toEqual({
      total: 2,
      withRetention: 2,
      overdue: 1,
      eligibleForCleanup: 0,
      scrubbed: 0,
    });
  });
});
