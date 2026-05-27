import { describe, expect, it } from "vitest";
import {
  buildFunnelMetricsReport,
  formatMarkdownReport,
  mapEventToCanonicalSteps,
  parseReportArgs,
} from "../../scripts/module-01-funnel-report.mjs";

const BASE_TIME = new Date("2026-05-27T12:00:00.000Z");

type FixtureEvent = {
  eventName: string;
  createdAt?: string;
  metadataJson?: Record<string, unknown>;
  visualVariant?: string;
};

function event(input: FixtureEvent) {
  return {
    eventName: input.eventName,
    createdAt: input.createdAt ?? "2026-05-27T10:00:00.000Z",
    visualVariant: input.visualVariant ?? "B",
    metadataJson: {
      themeVariant: "riso",
      themeSource: "ab_assigned",
      ...input.metadataJson,
    },
  };
}

function report(events: ReturnType<typeof event>[], includeOperator = false) {
  return buildFunnelMetricsReport(events, {
    from: new Date("2026-05-27T00:00:00.000Z"),
    to: new Date("2026-05-28T00:00:00.000Z"),
    includeOperator,
  });
}

describe("module 01 funnel metrics report", () => {
  it("maps current event names to canonical funnel steps", () => {
    expect(mapEventToCanonicalSteps(event({ eventName: "page_view", metadataJson: { pageType: "landing" } }))).toEqual([
      "landing_view",
    ]);
    expect(mapEventToCanonicalSteps(event({ eventName: "analysis_started" }))).toEqual([
      "analyze_clicked",
    ]);
    expect(mapEventToCanonicalSteps(event({ eventName: "analysis_completed" }))).toEqual([
      "analyze_completed",
    ]);
    expect(mapEventToCanonicalSteps(event({ eventName: "paid_unlock_clicked" }))).toEqual([
      "unlock_clicked",
    ]);
    expect(mapEventToCanonicalSteps(event({ eventName: "paid_generation_completed" }))).toEqual([
      "paid_generation_completed",
    ]);
  });

  it("aggregates funnel counts and conversion rates", () => {
    const metrics = report([
      event({ eventName: "page_view", metadataJson: { pageType: "landing" } }),
      event({ eventName: "page_view", metadataJson: { pageType: "landing" } }),
      event({ eventName: "analysis_started" }),
      event({ eventName: "analysis_completed" }),
      event({ eventName: "page_view", metadataJson: { pageType: "result_runtime" } }),
      event({ eventName: "paid_unlock_clicked" }),
      event({ eventName: "fulfillment_code_shown" }),
      event({ eventName: "fulfillment_liff_bound" }),
      event({ eventName: "paid_generation_started" }),
      event({ eventName: "paid_generation_completed", metadataJson: { source: "provider" } }),
    ]);

    expect(metrics.counts).toMatchObject({
      landing_view: 2,
      analyze_clicked: 1,
      analyze_completed: 1,
      result_view: 1,
      unlock_clicked: 1,
      line_fulfillment_started: 1,
      liff_bind_success: 1,
      paid_generation_requested: 1,
      paid_generation_completed: 1,
    });
    expect(metrics.derivedMetrics.landing_to_analyze_rate).toBe(0.5);
    expect(metrics.derivedMetrics.analyze_completion_rate).toBe(1);
    expect(metrics.derivedMetrics.paid_generation_completion_rate).toBe(1);
    expect(metrics.derivedMetrics.provider_success_rate).toBe(1);
  });

  it("handles division by zero as n/a in markdown", () => {
    const markdown = formatMarkdownReport(report([]));

    expect(markdown).toContain("| landing_view | 0 | n/a | n/a |");
    expect(markdown).toContain("- landing_to_analyze_rate: n/a");
  });

  it("excludes operator test traffic by default and includes it only with an explicit flag", () => {
    const events = [
      event({ eventName: "page_view", metadataJson: { pageType: "landing" } }),
      event({
        eventName: "analysis_started",
        metadataJson: { operatorTest: true, testModeSource: "header" },
      }),
    ];
    const publicOnly = report(events);
    const withOperator = report(events, true);

    expect(publicOnly.counts.analyze_clicked).toBe(0);
    expect(publicOnly.excludedOperatorEvents).toBe(1);
    expect(withOperator.counts.analyze_clicked).toBe(1);
    expect(withOperator.includeOperator).toBe(true);
    expect(formatMarkdownReport(withOperator)).toContain("OPERATOR TRAFFIC INCLUDED");
  });

  it("splits theme metrics and keeps manual override separate from A/B comparison", () => {
    const metrics = report([
      event({ eventName: "page_view", metadataJson: { pageType: "landing", themeVariant: "classic" } }),
      event({ eventName: "analysis_started", metadataJson: { themeVariant: "classic" } }),
      event({
        eventName: "page_view",
        metadataJson: {
          pageType: "landing",
          themeVariant: "riso",
          themeSource: "manual_override",
        },
      }),
      event({
        eventName: "analysis_started",
        metadataJson: {
          themeVariant: "riso",
          themeSource: "manual_override",
        },
      }),
      event({
        eventName: "theme_switch_clicked",
        metadataJson: {
          themeVariant: "riso",
          themeSource: "manual_override",
        },
      }),
    ]);

    expect(metrics.themeSplits["classic:ab_assigned"].counts.landing_view).toBe(1);
    expect(metrics.themeSplits["riso:manual_override"].counts.analyze_clicked).toBe(1);
    expect(metrics.manualOverrideCounts.riso.analyze_clicked).toBe(1);
    expect(metrics.themeSwitchClickedCount).toBe(1);
  });

  it("aggregates provider/fallback source and safe error categories", () => {
    const metrics = report([
      event({ eventName: "paid_generation_completed", metadataJson: { source: "provider" } }),
      event({
        eventName: "paid_generation_completed",
        metadataJson: { source: "fallback", fallbackReason: "output_validation" },
      }),
      event({ eventName: "paid_generation_failed", metadataJson: { errorCategory: "timeout" } }),
      event({ eventName: "analysis_failed", metadataJson: { reason: "rate_limited_ip" } }),
      event({ eventName: "fulfillment_failed", metadataJson: { channel: "line_code", errorCode: "reply_failed" } }),
    ]);

    expect(metrics.paidSourceCounts).toMatchObject({ provider: 1, fallback: 1 });
    expect(metrics.paidFailureCategories).toMatchObject({ output_validation: 1, timeout: 1 });
    expect(metrics.analyzeFailureCategories).toMatchObject({ rate_limited_ip: 1 });
    expect(metrics.lineFailureCategories).toMatchObject({ reply_failed: 1 });
  });

  it("filters by date range", () => {
    const metrics = report([
      event({ eventName: "page_view", createdAt: "2026-05-26T23:59:59.000Z", metadataJson: { pageType: "landing" } }),
      event({ eventName: "page_view", createdAt: "2026-05-27T12:00:00.000Z", metadataJson: { pageType: "landing" } }),
      event({ eventName: "page_view", createdAt: "2026-05-28T00:00:00.000Z", metadataJson: { pageType: "landing" } }),
    ]);

    expect(metrics.counts.landing_view).toBe(1);
  });

  it("formats markdown without leaking raw fixture fields or values", () => {
    const markdown = formatMarkdownReport(
      report([
        event({
          eventName: "analysis_failed",
          metadataJson: {
            reason: "validation_error",
            text: "PRIVATE RAW CONVERSATION",
            unlock_token: "PRIVATE_UNLOCK_TOKEN",
            email: "person@example.test",
          },
        }),
      ]),
    );

    expect(markdown).not.toContain("PRIVATE RAW CONVERSATION");
    expect(markdown).not.toContain("PRIVATE_UNLOCK_TOKEN");
    expect(markdown).not.toContain("person@example.test");
    expect(markdown).toContain("validation_error");
  });

  it("collapses unsafe free-text error categories to unknown", () => {
    const metrics = report([
      event({
        eventName: "paid_generation_failed",
        metadataJson: {
          errorCategory: "raw private sentence with spaces",
        },
      }),
    ]);

    expect(metrics.paidFailureCategories).toEqual({ unknown: 1 });
  });

  it("parses CLI date range, last-window, and operator flags", () => {
    expect(
      parseReportArgs(["--from", "2026-05-27", "--to", "2026-05-28", "--include-operator"], BASE_TIME),
    ).toMatchObject({
      from: new Date("2026-05-27T00:00:00.000Z"),
      to: new Date("2026-05-28T00:00:00.000Z"),
      includeOperator: true,
    });

    expect(parseReportArgs(["--last", "24h"], BASE_TIME)).toMatchObject({
      from: new Date("2026-05-26T12:00:00.000Z"),
      to: BASE_TIME,
    });
  });
});
