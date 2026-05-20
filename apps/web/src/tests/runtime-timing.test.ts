import { describe, expect, it } from "vitest";
import { createTimingTracker, getEventTimingMetrics } from "@/lib/runtime/timing";

describe("runtime timing instrumentation", () => {
  it("records ordered phases and derives safe event metrics", () => {
    let nowValue = 1_000;
    const tracker = createTimingTracker(() => nowValue);

    tracker.mark("request_received");
    nowValue += 4;
    tracker.mark("input_validated");
    nowValue += 2;
    tracker.mark("input_redacted");
    nowValue += 6;
    tracker.mark("analysis_request_stored");
    nowValue += 30;
    tracker.mark("provider_started");
    nowValue += 180;
    tracker.mark("provider_completed");
    nowValue += 9;
    tracker.mark("schema_validated");
    nowValue += 7;
    tracker.mark("analysis_result_stored");
    nowValue += 3;
    tracker.mark("response_ready");

    const summary = tracker.summarize();
    const metrics = getEventTimingMetrics(summary);

    expect(summary.totalMs).toBe(241);
    expect(summary.phases.provider_started).toBe(42);
    expect(summary.phases.provider_completed).toBe(222);
    expect(summary.spans.provider_started_to_provider_completed).toBe(180);
    expect(metrics).toEqual({
      totalLatencyMs: 241,
      providerLatencyMs: 180,
      schemaValidationLatencyMs: 9,
      analysisRequestWriteLatencyMs: 6,
      analysisResultWriteLatencyMs: 7,
    });
  });
});
