export const TIMING_PHASES = [
  "request_received",
  "input_validated",
  "input_redacted",
  "analysis_request_stored",
  "provider_started",
  "provider_completed",
  "schema_validated",
  "analysis_result_stored",
  "response_ready",
] as const;

export type TimingPhaseName = (typeof TIMING_PHASES)[number];

export type TimingSummary = {
  totalMs: number;
  phases: Partial<Record<TimingPhaseName, number>>;
  spans: Partial<Record<`${TimingPhaseName}_to_${TimingPhaseName}`, number>>;
};

type TimingEventMetrics = {
  totalLatencyMs: number;
  providerLatencyMs?: number;
  schemaValidationLatencyMs?: number;
  analysisRequestWriteLatencyMs?: number;
  analysisResultWriteLatencyMs?: number;
};

export function createTimingTracker(now: () => number = () => Date.now()) {
  const startedAt = now();
  const phases: Partial<Record<TimingPhaseName, number>> = {};

  function mark(name: TimingPhaseName): number {
    const elapsedMs = Math.max(0, now() - startedAt);
    phases[name] = elapsedMs;
    return elapsedMs;
  }

  function getPhase(name: TimingPhaseName): number | null {
    return phases[name] ?? null;
  }

  function getSpan(start: TimingPhaseName, end: TimingPhaseName): number | null {
    const startValue = phases[start];
    const endValue = phases[end];

    if (startValue == null || endValue == null) {
      return null;
    }

    return Math.max(0, endValue - startValue);
  }

  function summarize(): TimingSummary {
    const totalMs = phases.response_ready ?? Math.max(0, now() - startedAt);
    const spans: TimingSummary["spans"] = {};

    for (let index = 1; index < TIMING_PHASES.length; index += 1) {
      const start = TIMING_PHASES[index - 1];
      const end = TIMING_PHASES[index];
      const span = getSpan(start, end);

      if (span != null) {
        spans[`${start}_to_${end}`] = span;
      }
    }

    return {
      totalMs,
      phases: { ...phases },
      spans,
    };
  }

  return {
    mark,
    getPhase,
    getSpan,
    summarize,
  };
}

export function getEventTimingMetrics(summary: TimingSummary): TimingEventMetrics {
  const metrics: TimingEventMetrics = {
    totalLatencyMs: summary.totalMs,
  };

  const providerLatencyMs =
    summary.phases.provider_completed != null && summary.phases.provider_started != null
      ? summary.phases.provider_completed - summary.phases.provider_started
      : null;
  const schemaValidationLatencyMs =
    summary.phases.schema_validated != null && summary.phases.provider_completed != null
      ? summary.phases.schema_validated - summary.phases.provider_completed
      : null;
  const analysisRequestWriteLatencyMs =
    summary.phases.analysis_request_stored != null && summary.phases.input_redacted != null
      ? summary.phases.analysis_request_stored - summary.phases.input_redacted
      : null;
  const analysisResultWriteLatencyMs =
    summary.phases.analysis_result_stored != null && summary.phases.schema_validated != null
      ? summary.phases.analysis_result_stored - summary.phases.schema_validated
      : null;

  if (providerLatencyMs != null) {
    metrics.providerLatencyMs = Math.max(0, providerLatencyMs);
  }

  if (schemaValidationLatencyMs != null) {
    metrics.schemaValidationLatencyMs = Math.max(0, schemaValidationLatencyMs);
  }

  if (analysisRequestWriteLatencyMs != null) {
    metrics.analysisRequestWriteLatencyMs = Math.max(0, analysisRequestWriteLatencyMs);
  }

  if (analysisResultWriteLatencyMs != null) {
    metrics.analysisResultWriteLatencyMs = Math.max(0, analysisResultWriteLatencyMs);
  }

  return metrics;
}
