import { describe, expect, it } from "vitest";
import {
  assertReportIsSafe,
  buildFunnelMetricsReport,
  fetchHealthMarker,
  formatMarkdownReport,
  formatReportOutput,
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
    target: "local",
    targetExplicit: false,
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
    expect(mapEventToCanonicalSteps(event({ eventName: "unlocked_result_view" }))).toEqual([
      "unlocked_result_view",
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
      event({ eventName: "unlocked_result_view", metadataJson: { paidResultSource: "provider" } }),
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
      unlocked_result_view: 1,
    });
    expect(metrics.derivedMetrics.landing_to_analyze_rate).toBe(0.5);
    expect(metrics.derivedMetrics.analyze_completion_rate).toBe(1);
    expect(metrics.derivedMetrics.paid_generation_completion_rate).toBe(1);
    expect(metrics.derivedMetrics.provider_success_rate).toBe(1);
    expect(metrics.derivedMetrics.unlocked_view_rate).toBe(1);
  });

  it("handles division by zero as n/a in markdown", () => {
    const markdown = formatMarkdownReport(report([]));

    expect(markdown).toContain("Target: local");
    expect(markdown).toContain("| landing_view | 0 | n/a | n/a |");
    expect(markdown).toContain("- landing_to_analyze_rate: n/a");
    expect(markdown).toContain("## Data Quality Notes");
  });

  it("warns when downstream event counts exceed upstream counts or landing volume is too low", () => {
    const metrics = report([
      event({ eventName: "page_view", metadataJson: { pageType: "landing" } }),
      event({ eventName: "analysis_completed" }),
      event({ eventName: "analysis_completed" }),
      event({ eventName: "paid_generation_completed", metadataJson: { source: "provider" } }),
      event({ eventName: "paid_generation_completed", metadataJson: { source: "provider" } }),
      event({ eventName: "unlocked_result_view" }),
      event({ eventName: "unlocked_result_view" }),
    ]);
    const markdown = formatMarkdownReport(metrics);

    expect(metrics.status.status).toBe("WATCH");
    expect(metrics.dataQualityNotes).toContain(
      "Downstream events exceed upstream events; report appears smoke/API-heavy or non-sessionized.",
    );
    expect(metrics.dataQualityNotes).toContain(
      "Traffic is too low for conversion conclusions because landing_view is below 30.",
    );
    expect(markdown).toContain("## Data Quality Notes");
    expect(markdown).toContain("unlocked_result_view exceeds landing_view");
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

  it("parses CLI date range, last-window, target, health marker, and operator flags", () => {
    expect(
      parseReportArgs(
        [
          "--from",
          "2026-05-27",
          "--to",
          "2026-05-28",
          "--include-operator",
          "--target",
          "staging",
          "--base-url",
          "https://staging.anyu.tw",
        ],
        BASE_TIME,
      ),
    ).toMatchObject({
      from: new Date("2026-05-27T00:00:00.000Z"),
      to: new Date("2026-05-28T00:00:00.000Z"),
      includeOperator: true,
      target: "staging",
      targetExplicit: true,
      baseUrl: "https://staging.anyu.tw",
    });

    expect(parseReportArgs(["--last", "24h"], BASE_TIME)).toMatchObject({
      from: new Date("2026-05-26T12:00:00.000Z"),
      to: BASE_TIME,
      target: "local",
      targetExplicit: false,
    });
  });

  it("requires explicit production confirmation", () => {
    expect(() => parseReportArgs(["--target", "production"], BASE_TIME)).toThrow(
      "--target production requires --confirm-production.",
    );

    expect(parseReportArgs(["--target", "production", "--confirm-production"], BASE_TIME)).toMatchObject({
      target: "production",
      confirmProduction: true,
    });
  });

  it("includes target metadata and health marker in markdown and json reports", () => {
    const metrics = buildFunnelMetricsReport([], {
      from: new Date("2026-05-27T00:00:00.000Z"),
      to: new Date("2026-05-28T00:00:00.000Z"),
      includeOperator: false,
      target: "production",
      targetExplicit: true,
      baseUrl: "https://anyu.tw",
      healthMarker: {
        available: true,
        app: "anyu-web",
        environment: "production",
        gitCommit: "2fff33edf7f0",
        gitBranch: "staging",
        buildTime: "unknown",
        deploymentProvider: "vercel",
        versionSource: "env",
      },
    });
    const markdown = formatReportOutput(metrics, "markdown");
    const json = JSON.parse(formatReportOutput(metrics, "json"));

    expect(markdown).toContain("Target: production");
    expect(markdown).toContain("- environment: production");
    expect(markdown).toContain("- gitCommit: 2fff33edf7f0");
    expect(json.target).toBe("production");
    expect(json.healthMarker).toMatchObject({
      available: true,
      environment: "production",
      deploymentProvider: "vercel",
    });
  });

  it("fetches health marker safely without requiring network in tests", async () => {
    const marker = await fetchHealthMarker("https://anyu.tw", async (url: string) => {
      expect(url).toBe("https://anyu.tw/api/health");
      return {
        ok: true,
        status: 200,
        json: async () => ({
          app: "anyu-web",
          environment: "production",
          gitCommit: "2fff33edf7f0",
          gitBranch: "staging",
          buildTime: "unknown",
          deploymentProvider: "vercel",
          versionSource: "env",
          DATABASE_URL: "postgres://should-not-appear",
        }),
      };
    });

    expect(marker).toMatchObject({
      available: true,
      app: "anyu-web",
      environment: "production",
      gitCommit: "2fff33edf7f0",
    });
    expect(JSON.stringify(marker)).not.toContain("DATABASE_URL");
    expect(JSON.stringify(marker)).not.toContain("should-not-appear");
  });

  it("handles health marker failure safely", async () => {
    await expect(fetchHealthMarker(null)).resolves.toEqual({
      available: false,
      errorCategory: "not_requested",
    });
    await expect(fetchHealthMarker("https://anyu.tw", async () => ({ ok: false, status: 503 }))).resolves.toEqual({
      available: false,
      errorCategory: "http_503",
    });
  });

  it("rejects forbidden report output keys in markdown and json safety checks", () => {
    expect(() => assertReportIsSafe("paid_result_json")).toThrow("Report output failed privacy guard");
    expect(() => assertReportIsSafe("DATABASE_URL=postgres://example")).toThrow("Report output failed privacy guard");
    expect(() => assertReportIsSafe("lineUserId")).toThrow("Report output failed privacy guard");
  });
});
