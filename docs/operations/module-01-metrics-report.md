# Module 01 Metrics Report

Date: 2026-05-27

## Purpose

The Module 01 funnel metrics report is a read-only internal CLI for low-key production/staging monitoring. It aggregates existing `events` rows into a privacy-safe markdown or JSON report.

It is not an admin console and does not expose a public route.

## Command

Run from `apps/web`:

```bash
corepack pnpm module01:metrics --last 24h
corepack pnpm module01:metrics --from 2026-05-27 --to 2026-05-28
corepack pnpm module01:metrics --include-operator
corepack pnpm module01:metrics --format json --output ../../ai-collaboration/reports/metrics/module-01-funnel.json
```

Default behavior:

- time range: last 24 hours
- operator traffic: excluded
- output: markdown report plus console table
- default file: `ai-collaboration/reports/metrics/YYYY-MM-DD-module-01-funnel.md`

The command requires `DATABASE_URL` for the environment being reviewed. Do not print or paste the connection string into reports.

## Operator Traffic

Operator test traffic is excluded by default when event metadata contains:

- `operatorTest: true`

Use `--include-operator` only for QA diagnostics. Reports generated with that flag are marked with `OPERATOR TRAFFIC INCLUDED` and should not be mixed silently with public conversion analysis.

## Funnel Definitions

Canonical report rows map current events as follows:

- `landing_view`: `page_view` with `pageType=landing`
- `analyze_clicked`: `analysis_started`
- `analyze_completed`: `analysis_completed`
- `result_view`: `page_view` with `pageType=result_runtime`
- `unlock_clicked`: `paid_unlock_clicked`
- `line_fulfillment_started`: `fulfillment_code_shown`, `line_add_clicked`, or `fulfillment_liff_opened`
- `liff_bind_success`: `fulfillment_liff_bound`
- `short_code_success`: successful `fulfillment_code_matched`
- `paid_generation_requested`: `paid_generation_started`
- `paid_generation_completed`: `paid_generation_completed`
- `unlocked_result_view`: `page_view` with `pageType=unlock_completed` or `pageType=unlocked_result`

Known mapping gaps:

- The current app may not emit an unlocked-result page-view event yet.
- Invalid LINE webhook signatures are rejected before DB event persistence.
- LIFF bind-start metrics require `fulfillment_liff_opened` events.

## Threshold Hints

The report labels status as `OK`, `WATCH`, or `WARN`.

Warning hints:

- `analyze_completion_rate < 80%`
- `paid_generation_completion_rate < 90%`
- `fallback_rate > 10%`
- `line_fulfillment_success_rate < 70%`

Watch hints:

- `result_to_unlock_rate < 5%`
- `landing_to_analyze_rate < 15%`

These are interpretation hints, not statistically significant claims. Low-key production traffic may be too small for reliable conclusions.

## Theme A/B Reading

Only compare Theme A/B performance using rows where:

- `themeSource = ab_assigned`

Manual override traffic is reported separately and should not be treated as randomized A/B evidence.

## Privacy Boundary

Reports include only:

- aggregate counts
- conversion rates
- safe event names
- safe theme labels
- safe provider/fallback labels
- safe error categories
- time range
- operator event counts

Reports must not include raw input, redacted input text, full result JSON, paid result JSON, provider output, LINE identifiers, tokenized URLs, emails, database URLs, provider keys, LINE secrets, retention secrets, or cache secrets.
