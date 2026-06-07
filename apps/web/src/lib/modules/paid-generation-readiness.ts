export const DEFAULT_QUEUE_STUCK_THRESHOLD_MS = 5 * 60 * 1000;

export type PaidGenerationQueueStateCategory =
  | "no_generation_job"
  | "queued_within_threshold"
  | "queued_stuck"
  | "retry_scheduled"
  | "processing_within_threshold"
  | "processing_stuck"
  | "completed"
  | "failed"
  | "unknown";

export type PaidGenerationRecommendedAction =
  | "no_action_needed"
  | "wait_for_processing"
  | "invoke_processor_if_approved"
  | "support_review_required";

export type PaidGenerationReadinessClassification =
  | "ready_for_owner_controlled_window"
  | "ready_for_low_key_soft_public"
  | "not_ready_processor_manual_only"
  | "blocked_needs_automatic_drain"
  | "blocked_needs_observability";

export type PaidGenerationLatencyMetrics = {
  enqueueLatencyMs: number | null;
  queueWaitMs: number | null;
  processorPickupLatencyMs: number | null;
  processingDurationMs: number | null;
  totalPaidReadyMs: number | null;
  deliveryReadyMs: number | null;
  queueStuckThresholdMs: number;
};

export type PaidGenerationTimingInput = {
  paidAt?: Date | null;
  entitlementActivatedAt?: Date | null;
  jobCreatedAt?: Date | null;
  jobNextRunAt?: Date | null;
  jobLockedAt?: Date | null;
  jobUpdatedAt?: Date | null;
  jobStatus?: string | null;
  attemptCount?: number | null;
  maxAttempts?: number | null;
  paidResultStartedAt?: Date | null;
  paidResultCompletedAt?: Date | null;
  accessLinkReadyAt?: Date | null;
  now?: Date;
  queueStuckThresholdMs?: number;
};

export type PaidGenerationReadinessSummary = {
  jobCreatedAtPresent: boolean;
  jobStartedAtPresent: boolean;
  jobCompletedAtPresent: boolean;
  jobUpdatedAtPresent: boolean;
  paidResultCompletedAtPresent: boolean;
  attemptCount: number | null;
  maxAttempts: number | null;
  queueStateCategory: PaidGenerationQueueStateCategory;
  recommendedAction: PaidGenerationRecommendedAction;
  latency: PaidGenerationLatencyMetrics;
};

export type PaidGenerationBenchmarkSample = {
  latency: PaidGenerationLatencyMetrics;
  queueStateCategory: PaidGenerationQueueStateCategory;
  failed: boolean;
  stuck: boolean;
};

export type PaidGenerationMetricStats = {
  p50: number | null;
  p95: number | null;
  max: number | null;
};

export type PaidGenerationBenchmarkSummary = {
  jobCount: number;
  concurrency: number;
  failures: number;
  stuckJobs: number;
  metrics: Record<keyof PaidGenerationLatencyMetrics, PaidGenerationMetricStats>;
  readinessClassification: PaidGenerationReadinessClassification;
  recommendedAction: PaidGenerationRecommendedAction;
};

function toMillis(date: Date | null | undefined) {
  return date instanceof Date && Number.isFinite(date.getTime()) ? date.getTime() : null;
}

function durationMs(start: Date | null | undefined, end: Date | null | undefined) {
  const startMs = toMillis(start);
  const endMs = toMillis(end);

  if (startMs === null || endMs === null) {
    return null;
  }

  return Math.max(0, endMs - startMs);
}

function firstDate(...dates: Array<Date | null | undefined>) {
  return dates.find((date) => date instanceof Date && Number.isFinite(date.getTime())) ?? null;
}

export function calculatePaidGenerationLatencyMetrics(
  input: PaidGenerationTimingInput,
): PaidGenerationLatencyMetrics {
  const paidReadyAt = firstDate(input.paidAt, input.entitlementActivatedAt);
  const processorStartedAt = firstDate(input.jobLockedAt, input.paidResultStartedAt);
  const queueEligibleAt = input.jobNextRunAt ?? input.jobCreatedAt ?? null;

  return {
    enqueueLatencyMs: durationMs(paidReadyAt, input.jobCreatedAt),
    queueWaitMs: durationMs(input.jobCreatedAt, processorStartedAt),
    processorPickupLatencyMs: durationMs(queueEligibleAt, processorStartedAt),
    processingDurationMs: durationMs(processorStartedAt, input.paidResultCompletedAt),
    totalPaidReadyMs: durationMs(paidReadyAt, input.paidResultCompletedAt),
    deliveryReadyMs: durationMs(input.paidResultCompletedAt, input.accessLinkReadyAt),
    queueStuckThresholdMs: input.queueStuckThresholdMs ?? DEFAULT_QUEUE_STUCK_THRESHOLD_MS,
  };
}

export function classifyPaidGenerationQueueState(
  input: PaidGenerationTimingInput,
): PaidGenerationQueueStateCategory {
  const status = input.jobStatus ?? null;
  const now = input.now ?? new Date();
  const thresholdMs = input.queueStuckThresholdMs ?? DEFAULT_QUEUE_STUCK_THRESHOLD_MS;
  const ageFrom = (date: Date | null | undefined) => durationMs(date, now);

  if (!status) {
    return "no_generation_job";
  }

  if (status === "completed") {
    return "completed";
  }

  if (status === "failed" || status === "failed_final" || status === "cancelled" || status === "canceled") {
    return "failed";
  }

  if (status === "retry_scheduled") {
    return "retry_scheduled";
  }

  if (status === "queued") {
    const ageMs = ageFrom(input.jobCreatedAt);
    return ageMs !== null && ageMs > thresholdMs ? "queued_stuck" : "queued_within_threshold";
  }

  if (status === "processing" || status === "running") {
    const ageMs = ageFrom(input.jobLockedAt ?? input.paidResultStartedAt ?? input.jobUpdatedAt);
    return ageMs !== null && ageMs > thresholdMs ? "processing_stuck" : "processing_within_threshold";
  }

  return "unknown";
}

export function recommendPaidGenerationAction(
  category: PaidGenerationQueueStateCategory,
): PaidGenerationRecommendedAction {
  if (category === "completed") {
    return "no_action_needed";
  }

  if (category === "queued_within_threshold" || category === "processing_within_threshold") {
    return "wait_for_processing";
  }

  if (category === "queued_stuck" || category === "retry_scheduled") {
    return "invoke_processor_if_approved";
  }

  return "support_review_required";
}

export function buildPaidGenerationReadinessSummary(
  input: PaidGenerationTimingInput,
): PaidGenerationReadinessSummary {
  const queueStateCategory = classifyPaidGenerationQueueState(input);

  return {
    jobCreatedAtPresent: Boolean(input.jobCreatedAt),
    jobStartedAtPresent: Boolean(input.jobLockedAt ?? input.paidResultStartedAt),
    jobCompletedAtPresent: input.jobStatus === "completed" && Boolean(input.jobUpdatedAt),
    jobUpdatedAtPresent: Boolean(input.jobUpdatedAt),
    paidResultCompletedAtPresent: Boolean(input.paidResultCompletedAt),
    attemptCount: input.attemptCount ?? null,
    maxAttempts: input.maxAttempts ?? null,
    queueStateCategory,
    recommendedAction: recommendPaidGenerationAction(queueStateCategory),
    latency: calculatePaidGenerationLatencyMetrics(input),
  };
}

function percentile(values: number[], percentileValue: number) {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(
    sorted.length - 1,
    Math.ceil((percentileValue / 100) * sorted.length) - 1,
  );
  return sorted[index] ?? null;
}

function metricStats(values: Array<number | null>) {
  const present = values.filter((value): value is number => typeof value === "number");

  return {
    p50: percentile(present, 50),
    p95: percentile(present, 95),
    max: present.length > 0 ? Math.max(...present) : null,
  };
}

export function summarizePaidGenerationBenchmark(
  samples: PaidGenerationBenchmarkSample[],
  input: { jobCount: number; concurrency: number },
): PaidGenerationBenchmarkSummary {
  const metrics = {
    enqueueLatencyMs: metricStats(samples.map((sample) => sample.latency.enqueueLatencyMs)),
    queueWaitMs: metricStats(samples.map((sample) => sample.latency.queueWaitMs)),
    processorPickupLatencyMs: metricStats(
      samples.map((sample) => sample.latency.processorPickupLatencyMs),
    ),
    processingDurationMs: metricStats(samples.map((sample) => sample.latency.processingDurationMs)),
    totalPaidReadyMs: metricStats(samples.map((sample) => sample.latency.totalPaidReadyMs)),
    deliveryReadyMs: metricStats(samples.map((sample) => sample.latency.deliveryReadyMs)),
    queueStuckThresholdMs: metricStats(samples.map((sample) => sample.latency.queueStuckThresholdMs)),
  };
  const failures = samples.filter((sample) => sample.failed).length;
  const stuckJobs = samples.filter((sample) => sample.stuck).length;
  const totalPaidReadyP95 = metrics.totalPaidReadyMs.p95;
  const queueWaitP95 = metrics.queueWaitMs.p95;

  let readinessClassification: PaidGenerationReadinessClassification =
    "ready_for_owner_controlled_window";
  let recommendedAction: PaidGenerationRecommendedAction = "no_action_needed";

  if (samples.length === 0) {
    readinessClassification = "blocked_needs_observability";
    recommendedAction = "support_review_required";
  } else if (failures > 0 || stuckJobs > 0) {
    readinessClassification = "not_ready_processor_manual_only";
    recommendedAction = "support_review_required";
  } else if (totalPaidReadyP95 !== null && totalPaidReadyP95 > 180_000) {
    readinessClassification = "blocked_needs_automatic_drain";
    recommendedAction = "invoke_processor_if_approved";
  } else if (queueWaitP95 !== null && queueWaitP95 > 60_000) {
    readinessClassification = "blocked_needs_automatic_drain";
    recommendedAction = "invoke_processor_if_approved";
  }

  return {
    jobCount: input.jobCount,
    concurrency: input.concurrency,
    failures,
    stuckJobs,
    metrics,
    readinessClassification,
    recommendedAction,
  };
}
