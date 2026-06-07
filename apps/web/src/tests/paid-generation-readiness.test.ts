import { describe, expect, it } from "vitest";
import {
  buildPaidGenerationReadinessSummary,
  calculatePaidGenerationLatencyMetrics,
  summarizePaidGenerationBenchmark,
} from "@/lib/modules/paid-generation-readiness";

const PAID_AT = new Date("2026-06-07T00:00:00.000Z");
const JOB_CREATED_AT = new Date("2026-06-07T00:00:02.000Z");
const JOB_LOCKED_AT = new Date("2026-06-07T00:00:12.000Z");
const RESULT_COMPLETED_AT = new Date("2026-06-07T00:00:42.000Z");
const ACCESS_LINK_READY_AT = new Date("2026-06-07T00:00:45.000Z");

describe("paid generation readiness", () => {
  it("calculates latency metrics from existing processor timestamps", () => {
    const metrics = calculatePaidGenerationLatencyMetrics({
      paidAt: PAID_AT,
      entitlementActivatedAt: null,
      jobCreatedAt: JOB_CREATED_AT,
      jobNextRunAt: JOB_CREATED_AT,
      jobLockedAt: JOB_LOCKED_AT,
      paidResultCompletedAt: RESULT_COMPLETED_AT,
      accessLinkReadyAt: ACCESS_LINK_READY_AT,
    });

    expect(metrics).toMatchObject({
      enqueueLatencyMs: 2_000,
      queueWaitMs: 10_000,
      processorPickupLatencyMs: 10_000,
      processingDurationMs: 30_000,
      totalPaidReadyMs: 42_000,
      deliveryReadyMs: 3_000,
      queueStuckThresholdMs: 300_000,
    });
  });

  it("classifies queued jobs past threshold as needing approved processor action", () => {
    const summary = buildPaidGenerationReadinessSummary({
      jobStatus: "queued",
      jobCreatedAt: JOB_CREATED_AT,
      now: new Date("2026-06-07T00:08:00.000Z"),
    });

    expect(summary.queueStateCategory).toBe("queued_stuck");
    expect(summary.recommendedAction).toBe("invoke_processor_if_approved");
  });

  it("classifies completed jobs as no action needed", () => {
    const summary = buildPaidGenerationReadinessSummary({
      jobStatus: "completed",
      jobCreatedAt: JOB_CREATED_AT,
      jobLockedAt: JOB_LOCKED_AT,
      jobUpdatedAt: RESULT_COMPLETED_AT,
      paidResultCompletedAt: RESULT_COMPLETED_AT,
      attemptCount: 1,
      maxAttempts: 3,
    });

    expect(summary).toMatchObject({
      jobCreatedAtPresent: true,
      jobStartedAtPresent: true,
      jobCompletedAtPresent: true,
      paidResultCompletedAtPresent: true,
      attemptCount: 1,
      maxAttempts: 3,
      queueStateCategory: "completed",
      recommendedAction: "no_action_needed",
    });
  });

  it("classifies failed_final jobs as support review required", () => {
    const summary = buildPaidGenerationReadinessSummary({
      jobStatus: "failed_final",
      jobCreatedAt: JOB_CREATED_AT,
      attemptCount: 3,
      maxAttempts: 3,
    });

    expect(summary.queueStateCategory).toBe("failed");
    expect(summary.recommendedAction).toBe("support_review_required");
  });

  it("summarizes benchmark samples and keeps readiness conservative when jobs are slow", () => {
    const summary = summarizePaidGenerationBenchmark(
      [
        {
          latency: {
            enqueueLatencyMs: 1_000,
            queueWaitMs: 70_000,
            processorPickupLatencyMs: 70_000,
            processingDurationMs: 120_000,
            totalPaidReadyMs: 191_000,
            deliveryReadyMs: 1_000,
            queueStuckThresholdMs: 300_000,
          },
          queueStateCategory: "completed",
          failed: false,
          stuck: false,
        },
      ],
      { jobCount: 1, concurrency: 1 },
    );

    expect(summary.metrics.queueWaitMs.p95).toBe(70_000);
    expect(summary.metrics.totalPaidReadyMs.p95).toBe(191_000);
    expect(summary.readinessClassification).toBe("blocked_needs_automatic_drain");
    expect(summary.recommendedAction).toBe("invoke_processor_if_approved");
  });
});
