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
      .mockResolvedValueOnce({ rows: [{ count: 3 }] });

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
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it("updates only the targeted analysis tables when not dry-run", async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce({ rows: [{ count: 1 }] })
      .mockResolvedValueOnce({ rows: [{ count: 2 }] })
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

    expect(execute).toHaveBeenCalledTimes(4);
    expect(summary.analysisRequestsDeleted).toBe(1);
    expect(summary.analysisResultsDeleted).toBe(2);
    expect(summary.dryRun).toBe(false);
  });
});
