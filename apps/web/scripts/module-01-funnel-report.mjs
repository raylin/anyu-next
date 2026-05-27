#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

export const MODULE_01_ID = "ai-temperature";
export const MODULE_01_SLUG = "ambiguous-temperature";
export const DEFAULT_REPORT_FORMAT = "markdown";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(SCRIPT_DIR, "../../..");

const FUNNEL_STEPS = [
  { key: "landing_view", label: "Landing view" },
  { key: "analyze_clicked", label: "Analyze clicked" },
  { key: "analyze_completed", label: "Analyze completed" },
  { key: "result_view", label: "Result view" },
  { key: "unlock_clicked", label: "Unlock clicked" },
  { key: "line_fulfillment_started", label: "LINE fulfillment started" },
  { key: "liff_bind_success", label: "LIFF bind success" },
  { key: "short_code_success", label: "Short-code success" },
  { key: "paid_generation_requested", label: "Paid generation requested" },
  { key: "paid_generation_completed", label: "Paid generation completed" },
  { key: "unlocked_result_view", label: "Unlocked result view" },
];

const THEME_VARIANTS = ["classic", "riso", "unknown"];
const THEME_SOURCES = [
  "ab_assigned",
  "manual_override",
  "query_hint",
  "unlock_intent",
  "local_storage",
  "default",
  "unknown",
];

const FORBIDDEN_REPORT_PATTERNS = [
  /raw_input/iu,
  /raw_input_redacted/iu,
  /paid_result_json/iu,
  /provider_output/iu,
  /line_user_id/iu,
  /database_url/iu,
  /anthropic_api_key/iu,
  /line_channel_secret/iu,
  /line_channel_access_token/iu,
  /retention_cleanup_secret/iu,
  /analysis_cache_hash_secret/iu,
];

function getDefaultDateRange(now = new Date()) {
  return {
    from: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    to: now,
  };
}

function parseDateOption(value, optionName) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid ${optionName} value: ${value}`);
  }

  return parsed;
}

function parseLastOption(value, now = new Date()) {
  const match = /^(\d+)(h|d)$/u.exec(value);

  if (!match) {
    throw new Error(`Invalid --last value: ${value}. Use values like 24h or 7d.`);
  }

  const amount = Number.parseInt(match[1], 10);
  const unit = match[2];
  const multiplier = unit === "d" ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;

  return {
    from: new Date(now.getTime() - amount * multiplier),
    to: now,
  };
}

export function parseReportArgs(argv, now = new Date()) {
  const defaults = getDefaultDateRange(now);
  const options = {
    from: defaults.from,
    to: defaults.to,
    includeOperator: false,
    format: DEFAULT_REPORT_FORMAT,
    output: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--from") {
      options.from = parseDateOption(argv[index + 1], "--from");
      index += 1;
    } else if (arg === "--to") {
      options.to = parseDateOption(argv[index + 1], "--to");
      index += 1;
    } else if (arg === "--last") {
      const range = parseLastOption(argv[index + 1], now);
      options.from = range.from;
      options.to = range.to;
      index += 1;
    } else if (arg === "--include-operator") {
      options.includeOperator = true;
    } else if (arg === "--format") {
      const format = argv[index + 1];

      if (!["markdown", "json"].includes(format)) {
        throw new Error(`Invalid --format value: ${format}`);
      }

      options.format = format;
      index += 1;
    } else if (arg === "--output") {
      options.output = argv[index + 1];
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (options.from >= options.to) {
    throw new Error("--from must be before --to.");
  }

  return options;
}

function emptyCounts() {
  return Object.fromEntries(FUNNEL_STEPS.map((step) => [step.key, 0]));
}

function increment(map, key, amount = 1) {
  map[key] = (map[key] ?? 0) + amount;
}

function getMetadata(event) {
  const metadata = event.metadataJson ?? event.metadata_json ?? {};
  return metadata && typeof metadata === "object" && !Array.isArray(metadata) ? metadata : {};
}

function getThemeVariant(metadata) {
  return THEME_VARIANTS.includes(metadata.themeVariant) ? metadata.themeVariant : "unknown";
}

function getThemeSource(metadata) {
  return THEME_SOURCES.includes(metadata.themeSource) ? metadata.themeSource : "unknown";
}

function getPaidSource(metadata) {
  return ["provider", "fallback"].includes(metadata.source) ? metadata.source : "unknown";
}

function getSafeCategory(value) {
  if (typeof value !== "string") {
    return "unknown";
  }

  const normalizedValue = value.trim();

  if (!/^[a-z0-9_:-]{1,80}$/iu.test(normalizedValue)) {
    return "unknown";
  }

  return normalizedValue;
}

function isOperatorEvent(event) {
  return getMetadata(event).operatorTest === true;
}

function eventCreatedAt(event) {
  return event.createdAt instanceof Date ? event.createdAt : new Date(event.createdAt);
}

export function mapEventToCanonicalSteps(event) {
  const metadata = getMetadata(event);

  switch (event.eventName) {
    case "page_view":
      if (metadata.pageType === "landing") {
        return ["landing_view"];
      }

      if (metadata.pageType === "result_runtime") {
        return ["result_view"];
      }

      if (metadata.pageType === "unlock_completed" || metadata.pageType === "unlocked_result") {
        return ["unlocked_result_view"];
      }

      return [];
    case "analysis_started":
      return ["analyze_clicked"];
    case "analysis_completed":
      return ["analyze_completed"];
    case "paid_unlock_clicked":
      return ["unlock_clicked"];
    case "fulfillment_code_shown":
    case "line_add_clicked":
    case "fulfillment_liff_opened":
      return ["line_fulfillment_started"];
    case "fulfillment_liff_bound":
      return ["liff_bind_success"];
    case "fulfillment_code_matched":
      return metadata.status === "failed" ? [] : ["short_code_success"];
    case "paid_generation_started":
      return ["paid_generation_requested"];
    case "paid_generation_completed":
      return ["paid_generation_completed"];
    default:
      return [];
  }
}

function rate(numerator, denominator) {
  if (!denominator) {
    return null;
  }

  return numerator / denominator;
}

function formatRate(value) {
  return value === null ? "n/a" : `${(value * 100).toFixed(1)}%`;
}

function buildFunnelRows(counts) {
  const landingCount = counts.landing_view ?? 0;
  let previousCount = null;

  return FUNNEL_STEPS.map((step) => {
    const count = counts[step.key] ?? 0;
    const previousRate = previousCount === null ? null : rate(count, previousCount);
    const landingRate = step.key === "landing_view" ? null : rate(count, landingCount);
    previousCount = count;

    return {
      key: step.key,
      label: step.label,
      count,
      conversionFromPrevious: previousRate,
      conversionFromLanding: landingRate,
    };
  });
}

function buildDerivedMetrics(counts, paidSourceCounts, lineCounts) {
  const paidCompleted = counts.paid_generation_completed ?? 0;
  const lineSuccess = (counts.liff_bind_success ?? 0) + (counts.short_code_success ?? 0);

  return {
    landing_to_analyze_rate: rate(counts.analyze_clicked ?? 0, counts.landing_view ?? 0),
    analyze_completion_rate: rate(counts.analyze_completed ?? 0, counts.analyze_clicked ?? 0),
    result_to_unlock_rate: rate(counts.unlock_clicked ?? 0, counts.result_view ?? 0),
    unlock_to_line_success_rate: rate(lineSuccess, counts.unlock_clicked ?? 0),
    paid_generation_completion_rate: rate(paidCompleted, counts.paid_generation_requested ?? 0),
    unlocked_view_rate: rate(counts.unlocked_result_view ?? 0, paidCompleted),
    overall_unlocked_per_landing: rate(counts.unlocked_result_view ?? 0, counts.landing_view ?? 0),
    fallback_rate: rate(paidSourceCounts.fallback ?? 0, paidCompleted),
    provider_success_rate: rate(paidSourceCounts.provider ?? 0, paidCompleted),
    liff_success_rate: rate(lineCounts.liff_bind_success ?? 0, lineCounts.liff_bind_started ?? 0),
    short_code_success_rate: rate(lineCounts.short_code_success ?? 0, lineCounts.short_code_received ?? 0),
    line_fulfillment_success_rate: rate(lineSuccess, counts.line_fulfillment_started ?? 0),
  };
}

function buildStatus(derivedMetrics) {
  const warnings = [];
  const watches = [];

  if (derivedMetrics.analyze_completion_rate !== null && derivedMetrics.analyze_completion_rate < 0.8) {
    warnings.push("analyze_completion_rate below 80%");
  }

  if (
    derivedMetrics.paid_generation_completion_rate !== null &&
    derivedMetrics.paid_generation_completion_rate < 0.9
  ) {
    warnings.push("paid_generation_completion_rate below 90%");
  }

  if (derivedMetrics.fallback_rate !== null && derivedMetrics.fallback_rate > 0.1) {
    warnings.push("fallback_rate above 10%");
  }

  if (
    derivedMetrics.line_fulfillment_success_rate !== null &&
    derivedMetrics.line_fulfillment_success_rate < 0.7
  ) {
    warnings.push("line_fulfillment_success_rate below 70%");
  }

  if (derivedMetrics.result_to_unlock_rate !== null && derivedMetrics.result_to_unlock_rate < 0.05) {
    watches.push("result_to_unlock_rate below 5%");
  }

  if (derivedMetrics.landing_to_analyze_rate !== null && derivedMetrics.landing_to_analyze_rate < 0.15) {
    watches.push("landing_to_analyze_rate below 15%");
  }

  return {
    status: warnings.length > 0 ? "WARN" : watches.length > 0 ? "WATCH" : "OK",
    warnings,
    watches,
  };
}

function emptyThemeSplit() {
  return {
    counts: emptyCounts(),
    rows: [],
    landingToAnalyzeRate: null,
    resultToUnlockRate: null,
    unlockedPerLandingRate: null,
  };
}

export function buildFunnelMetricsReport(events, options) {
  const from = options.from instanceof Date ? options.from : new Date(options.from);
  const to = options.to instanceof Date ? options.to : new Date(options.to);
  const filteredByRange = events.filter((event) => {
    const createdAt = eventCreatedAt(event);
    return createdAt >= from && createdAt < to;
  });
  const operatorEvents = filteredByRange.filter(isOperatorEvent);
  const includedEvents = options.includeOperator
    ? filteredByRange
    : filteredByRange.filter((event) => !isOperatorEvent(event));
  const counts = emptyCounts();
  const paidSourceCounts = { provider: 0, fallback: 0, unknown: 0 };
  const paidFailureCategories = {};
  const analyzeFailureCategories = {};
  const lineFailureCategories = {};
  const lineCounts = {
    liff_bind_started: 0,
    liff_bind_success: 0,
    liff_bind_failed: 0,
    short_code_received: 0,
    short_code_success: 0,
    short_code_failed: 0,
    webhook_invalid_signature: 0,
    paid_pending_started: 0,
    paid_pending_completed: 0,
    paid_pending_stuck: 0,
  };
  const themeCounts = {};
  const manualOverrideCounts = {};
  let themeSwitchClickedCount = 0;

  for (const event of includedEvents) {
    const metadata = getMetadata(event);
    const canonicalSteps = mapEventToCanonicalSteps(event);
    const themeVariant = getThemeVariant(metadata);
    const themeSource = getThemeSource(metadata);

    for (const step of canonicalSteps) {
      counts[step] += 1;

      const splitKey = `${themeVariant}:${themeSource}`;
      const split = themeCounts[splitKey] ?? emptyThemeSplit();
      split.counts[step] += 1;
      themeCounts[splitKey] = split;

      if (themeSource === "manual_override") {
        const manual = manualOverrideCounts[themeVariant] ?? emptyCounts();
        manual[step] += 1;
        manualOverrideCounts[themeVariant] = manual;
      }
    }

    if (event.eventName === "theme_switch_clicked") {
      themeSwitchClickedCount += 1;
    }

    if (event.eventName === "paid_generation_completed") {
      increment(paidSourceCounts, getPaidSource(metadata));
      if (metadata.source === "fallback") {
        increment(paidFailureCategories, getSafeCategory(metadata.fallbackReason));
      }
    }

    if (event.eventName === "paid_generation_failed") {
      increment(paidFailureCategories, getSafeCategory(metadata.errorCategory));
    }

    if (event.eventName === "analysis_failed") {
      increment(analyzeFailureCategories, getSafeCategory(metadata.errorCategory ?? metadata.reason));
    }

    if (event.eventName === "fulfillment_liff_opened") {
      lineCounts.liff_bind_started += 1;
    }

    if (event.eventName === "fulfillment_liff_bound") {
      lineCounts.liff_bind_success += 1;
    }

    if (event.eventName === "fulfillment_code_shown") {
      lineCounts.short_code_received += 1;
    }

    if (event.eventName === "line_webhook_received") {
      lineCounts.short_code_received += 1;
    }

    if (event.eventName === "fulfillment_code_matched") {
      if (metadata.status === "failed") {
        lineCounts.short_code_failed += 1;
      } else {
        lineCounts.short_code_success += 1;
      }
    }

    if (event.eventName === "fulfillment_failed") {
      const channel = metadata.channel;

      if (channel === "liff") {
        lineCounts.liff_bind_failed += 1;
      } else {
        lineCounts.short_code_failed += 1;
      }

      increment(lineFailureCategories, getSafeCategory(metadata.errorCategory ?? metadata.errorCode));
    }

    if (event.eventName === "paid_generation_started") {
      lineCounts.paid_pending_started += 1;
    }

    if (event.eventName === "paid_generation_completed") {
      lineCounts.paid_pending_completed += 1;
    }
  }

  for (const split of Object.values(themeCounts)) {
    split.rows = buildFunnelRows(split.counts);
    split.landingToAnalyzeRate = rate(split.counts.analyze_clicked, split.counts.landing_view);
    split.resultToUnlockRate = rate(split.counts.unlock_clicked, split.counts.result_view);
    split.unlockedPerLandingRate = rate(split.counts.unlocked_result_view, split.counts.landing_view);
  }

  const derivedMetrics = buildDerivedMetrics(counts, paidSourceCounts, lineCounts);

  return {
    generatedAt: new Date().toISOString(),
    moduleId: MODULE_01_ID,
    moduleSlug: MODULE_01_SLUG,
    range: {
      from: from.toISOString(),
      to: to.toISOString(),
    },
    includeOperator: options.includeOperator === true,
    excludedOperatorEvents: options.includeOperator ? 0 : operatorEvents.length,
    totalEventsInRange: filteredByRange.length,
    includedEvents: includedEvents.length,
    funnelRows: buildFunnelRows(counts),
    counts,
    derivedMetrics,
    status: buildStatus(derivedMetrics),
    themeSplits: themeCounts,
    manualOverrideCounts,
    themeSwitchClickedCount,
    paidSourceCounts,
    paidFailureCategories,
    analyzeFailureCategories,
    lineFailureCategories,
    lineCounts,
    eventMappingGaps: [
      "unlocked_result_view requires a page_view event with pageType=unlock_completed or unlocked_result; current app may not emit it.",
      "webhook_invalid_signature is not emitted as a DB event because invalid signatures are rejected before event persistence.",
      "liff_bind_started is only available if fulfillment_liff_opened events are emitted.",
    ],
  };
}

function formatCountMap(map) {
  const entries = Object.entries(map);

  if (entries.length === 0) {
    return "- none\n";
  }

  return entries
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `- ${key}: ${value}`)
    .join("\n")
    .concat("\n");
}

function formatFunnelTable(rows) {
  const lines = [
    "| Step | Count | From Previous | From Landing |",
    "|---|---:|---:|---:|",
  ];

  for (const row of rows) {
    lines.push(
      `| ${row.key} | ${row.count} | ${formatRate(row.conversionFromPrevious)} | ${formatRate(row.conversionFromLanding)} |`,
    );
  }

  return lines.join("\n");
}

function formatThemeSplitTable(themeSplits) {
  const lines = [
    "| Theme Variant | Theme Source | Landing | Analyze | Result | Unlock | Unlocked | Landing → Analyze | Result → Unlock | Unlocked / Landing |",
    "|---|---|---:|---:|---:|---:|---:|---:|---:|---:|",
  ];
  const entries = Object.entries(themeSplits);

  if (entries.length === 0) {
    lines.push("| unknown | unknown | 0 | 0 | 0 | 0 | 0 | n/a | n/a | n/a |");
    return lines.join("\n");
  }

  for (const [key, split] of entries.sort(([left], [right]) => left.localeCompare(right))) {
    const [variant, source] = key.split(":");
    lines.push(
      `| ${variant} | ${source} | ${split.counts.landing_view} | ${split.counts.analyze_clicked} | ${split.counts.result_view} | ${split.counts.unlock_clicked} | ${split.counts.unlocked_result_view} | ${formatRate(split.landingToAnalyzeRate)} | ${formatRate(split.resultToUnlockRate)} | ${formatRate(split.unlockedPerLandingRate)} |`,
    );
  }

  return lines.join("\n");
}

function formatDerivedMetrics(metrics) {
  return Object.entries(metrics)
    .map(([key, value]) => `- ${key}: ${formatRate(value)}`)
    .join("\n");
}

export function formatMarkdownReport(report) {
  const operatorBanner = report.includeOperator
    ? "\n> OPERATOR TRAFFIC INCLUDED. Do not mix this report with public conversion analysis silently.\n"
    : "";
  const statusNotes = [
    ...report.status.warnings.map((warning) => `- WARN: ${warning}`),
    ...report.status.watches.map((watch) => `- WATCH: ${watch}`),
  ];
  const markdown = `# Module 01 Funnel Metrics Report

Generated: ${report.generatedAt}

Module: ${report.moduleSlug}

Range: ${report.range.from} to ${report.range.to}
${operatorBanner}
Status: ${report.status.status}

Included events: ${report.includedEvents}

Excluded operator events: ${report.excludedOperatorEvents}

## Funnel

${formatFunnelTable(report.funnelRows)}

## Derived Metrics

${formatDerivedMetrics(report.derivedMetrics)}

## Threshold Notes

${statusNotes.length > 0 ? statusNotes.join("\n") : "- OK: no threshold hints triggered"}

## Theme Split

Only compare A/B performance using rows where themeSource is \`ab_assigned\`.

${formatThemeSplitTable(report.themeSplits)}

Manual override counts:

${formatCountMap(report.manualOverrideCounts)}
Theme switch clicked count: ${report.themeSwitchClickedCount}

## Paid Generation Source

${formatCountMap(report.paidSourceCounts)}
Paid generation failure categories:

${formatCountMap(report.paidFailureCategories)}
## LINE Fulfillment Health

${formatCountMap(report.lineCounts)}
LINE failure categories:

${formatCountMap(report.lineFailureCategories)}
## Analyze Error Summary

${formatCountMap(report.analyzeFailureCategories)}
## Event Mapping Gaps

${report.eventMappingGaps.map((gap) => `- ${gap}`).join("\n")}

## Privacy Guardrails

This report contains only aggregate event counts, conversion rates, safe theme labels, safe source labels, and safe error categories. It intentionally excludes raw input, result JSON, paid result JSON, provider output, LINE identifiers, tokenized URLs, emails, and secrets.
`;

  assertReportIsSafe(markdown);
  return markdown;
}

export function assertReportIsSafe(output) {
  const lowerOutput = output.toLowerCase();
  const forbiddenPattern = FORBIDDEN_REPORT_PATTERNS.find((pattern) => pattern.test(lowerOutput));

  if (forbiddenPattern) {
    throw new Error(`Report output failed privacy guard: ${forbiddenPattern.source}`);
  }
}

function defaultOutputPath(now = new Date()) {
  const date = now.toISOString().slice(0, 10);
  return resolve(PROJECT_ROOT, `ai-collaboration/reports/metrics/${date}-module-01-funnel.md`);
}

async function fetchEvents({ from, to }) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`
    SELECT event_name, visual_variant, metadata_json, created_at
    FROM events
    WHERE module_id = ${MODULE_01_ID}
      AND theme_slug = ${MODULE_01_SLUG}
      AND created_at >= ${from.toISOString()}
      AND created_at < ${to.toISOString()}
    ORDER BY created_at ASC
  `;

  return rows.map((row) => ({
    eventName: row.event_name,
    visualVariant: row.visual_variant,
    metadataJson: row.metadata_json,
    createdAt: row.created_at,
  }));
}

function printConsoleSummary(report) {
  console.log(`Module 01 funnel metrics (${report.range.from} to ${report.range.to})`);
  console.log(`Status: ${report.status.status}`);
  console.log(`Included events: ${report.includedEvents}`);
  console.log(`Excluded operator events: ${report.excludedOperatorEvents}`);
  console.table(
    report.funnelRows.map((row) => ({
      step: row.key,
      count: row.count,
      fromPrevious: formatRate(row.conversionFromPrevious),
      fromLanding: formatRate(row.conversionFromLanding),
    })),
  );
}

function printUsage() {
  console.log(`Usage:
  pnpm module01:metrics --from 2026-05-27 --to 2026-05-28
  pnpm module01:metrics --last 24h
  pnpm module01:metrics --include-operator
  pnpm module01:metrics --format markdown
  pnpm module01:metrics --format json
  pnpm module01:metrics --output ../../ai-collaboration/reports/metrics/custom.md
`);
}

async function main() {
  const options = parseReportArgs(process.argv.slice(2));

  if (options.help) {
    printUsage();
    return;
  }

  const events = await fetchEvents(options);
  const report = buildFunnelMetricsReport(events, options);
  const output = options.format === "json"
    ? JSON.stringify(report, null, 2)
    : formatMarkdownReport(report);
  const outputPath = resolve(process.cwd(), options.output ?? defaultOutputPath());

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${output}\n`, "utf8");
  printConsoleSummary(report);
  console.log(`Wrote report: ${outputPath}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
