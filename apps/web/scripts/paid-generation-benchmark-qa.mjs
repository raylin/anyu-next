#!/usr/bin/env node

const DEFAULT_QUEUE_STUCK_THRESHOLD_MS = 5 * 60 * 1000;
const MAX_JOBS = 5;
const VALID_MODES = new Set(["mock", "staging"]);

function parseArgs(argv) {
  const args = {
    mode: "mock",
    jobs: 1,
    concurrency: 1,
    json: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--") {
      continue;
    }

    if (arg === "--json") {
      args.json = true;
      continue;
    }

    if (arg === "--mode") {
      args.mode = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--jobs") {
      args.jobs = Number(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === "--concurrency") {
      args.concurrency = Number(argv[index + 1]);
      index += 1;
      continue;
    }

    throw new Error(`unsupported_argument:${arg}`);
  }

  if (!VALID_MODES.has(args.mode)) {
    throw new Error("mode_invalid");
  }

  if (!Number.isInteger(args.jobs) || args.jobs < 1 || args.jobs > MAX_JOBS) {
    throw new Error("jobs_invalid");
  }

  if (!Number.isInteger(args.concurrency) || args.concurrency < 1 || args.concurrency > MAX_JOBS) {
    throw new Error("concurrency_invalid");
  }

  args.concurrency = Math.min(args.concurrency, args.jobs);
  return args;
}

function durationMs(start, end) {
  return Math.max(0, end.getTime() - start.getTime());
}

function buildMockSample(index, concurrency) {
  const base = new Date(Date.UTC(2026, 5, 7, 0, 0, index * 15));
  const paidAt = base;
  const jobCreatedAt = new Date(paidAt.getTime() + 800 + index * 50);
  const jobNextRunAt = jobCreatedAt;
  const queueSlot = Math.floor(index / concurrency);
  const jobLockedAt = new Date(jobNextRunAt.getTime() + 2_000 + queueSlot * 1_500);
  const paidResultCompletedAt = new Date(jobLockedAt.getTime() + 18_000 + index * 600);
  const accessLinkReadyAt = new Date(paidResultCompletedAt.getTime() + 1_200 + index * 100);

  return {
    latency: {
      enqueueLatencyMs: durationMs(paidAt, jobCreatedAt),
      queueWaitMs: durationMs(jobCreatedAt, jobLockedAt),
      processorPickupLatencyMs: durationMs(jobNextRunAt, jobLockedAt),
      processingDurationMs: durationMs(jobLockedAt, paidResultCompletedAt),
      totalPaidReadyMs: durationMs(paidAt, paidResultCompletedAt),
      deliveryReadyMs: durationMs(paidResultCompletedAt, accessLinkReadyAt),
      queueStuckThresholdMs: DEFAULT_QUEUE_STUCK_THRESHOLD_MS,
    },
    queueStateCategory: "completed",
    failed: false,
    stuck: false,
  };
}

function percentile(values, percentileValue) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.ceil((percentileValue / 100) * sorted.length) - 1);
  return sorted[index] ?? null;
}

function stats(values) {
  const present = values.filter((value) => typeof value === "number");
  return {
    p50: percentile(present, 50),
    p95: percentile(present, 95),
    max: present.length > 0 ? Math.max(...present) : null,
  };
}

function summarize(samples, input) {
  const metricNames = [
    "enqueueLatencyMs",
    "queueWaitMs",
    "processorPickupLatencyMs",
    "processingDurationMs",
    "totalPaidReadyMs",
    "deliveryReadyMs",
    "queueStuckThresholdMs",
  ];
  const metrics = Object.fromEntries(
    metricNames.map((name) => [name, stats(samples.map((sample) => sample.latency[name]))]),
  );
  const failures = samples.filter((sample) => sample.failed).length;
  const stuckJobs = samples.filter((sample) => sample.stuck).length;
  const totalPaidReadyP95 = metrics.totalPaidReadyMs.p95;
  const queueWaitP95 = metrics.queueWaitMs.p95;
  let readinessClassification = "ready_for_owner_controlled_window";
  let recommendedAction = "no_action_needed";

  if (samples.length === 0) {
    readinessClassification = "blocked_needs_observability";
    recommendedAction = "support_review_required";
  } else if (failures > 0 || stuckJobs > 0) {
    readinessClassification = "not_ready_processor_manual_only";
    recommendedAction = "support_review_required";
  } else if (
    (typeof totalPaidReadyP95 === "number" && totalPaidReadyP95 > 180_000) ||
    (typeof queueWaitP95 === "number" && queueWaitP95 > 60_000)
  ) {
    readinessClassification = "blocked_needs_automatic_drain";
    recommendedAction = "invoke_processor_if_approved";
  }

  return {
    ok: true,
    command: "qa:paid-generation:benchmark",
    mode: input.mode,
    baselineKind: input.mode === "mock" ? "mock_synthetic_processor_contract" : "staging_unavailable_in_v0",
    automaticDrainVerified: false,
    noRealPayment: true,
    noRealEmail: true,
    noRealLine: true,
    productionTouched: false,
    jobCount: input.jobs,
    concurrency: input.concurrency,
    maxJobs: MAX_JOBS,
    failures,
    stuckJobs,
    metrics,
    readinessClassification,
    recommendedAction,
    evidenceLimits:
      input.mode === "mock"
        ? ["mock mode does not prove deployed cron or automatic provider drain latency"]
        : ["staging benchmark is intentionally not implemented in v0 without a deployed safe harness"],
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.mode === "staging") {
    const summary = summarize([], args);
    summary.ok = false;
    summary.error = "staging_benchmark_not_implemented_in_v0";
    if (args.json) {
      process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
    } else {
      process.stderr.write("qa:paid-generation:benchmark failed: staging_benchmark_not_implemented_in_v0\n");
    }
    return 1;
  }

  const samples = Array.from({ length: args.jobs }, (_, index) =>
    buildMockSample(index, args.concurrency),
  );
  const summary = summarize(samples, args);

  if (args.json) {
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  } else {
    process.stdout.write(
      [
        "ANYU paid-generation benchmark",
        `Mode: ${summary.mode}`,
        `Jobs: ${summary.jobCount}`,
        `Concurrency: ${summary.concurrency}`,
        `Total paid ready p95 ms: ${summary.metrics.totalPaidReadyMs.p95 ?? "unknown"}`,
        `Queue wait p95 ms: ${summary.metrics.queueWaitMs.p95 ?? "unknown"}`,
        `Readiness: ${summary.readinessClassification}`,
        `Recommended action: ${summary.recommendedAction}`,
      ].join("\n") + "\n",
    );
  }

  return 0;
}

try {
  process.exitCode = main();
} catch (error) {
  const code = error instanceof Error ? error.message : "unknown";
  process.stderr.write(`qa:paid-generation:benchmark failed: ${code}\n`);
  process.exitCode = 1;
}
