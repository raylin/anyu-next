# Module 01 Metrics Report

Date: 2026-05-27

## Purpose

The Module 01 funnel metrics report is a read-only internal CLI for low-key production/staging monitoring. It aggregates existing `events` rows into a privacy-safe markdown or JSON report.

It is not an admin console and does not expose a public route.

## Command

Run from `apps/web`:

```bash
corepack pnpm module01:metrics --target local --last 24h
corepack pnpm module01:metrics --target staging --last 24h --base-url https://staging.anyu.tw
corepack pnpm module01:metrics --target production --confirm-production --last 24h --base-url https://anyu.tw
corepack pnpm module01:metrics --target production --confirm-production --dry-run
corepack pnpm module01:metrics --target staging --include-operator
corepack pnpm module01:metrics --target staging --format json --output ../../ai-collaboration/reports/metrics/module-01-funnel.json
```

Default behavior:

- time range: last 24 hours
- operator traffic: excluded
- output: markdown report plus console table
- default file: `ai-collaboration/reports/metrics/YYYY-MM-DD-module-01-funnel.md`
- target: `local` when omitted, with report metadata marked as default-local
- production target: refused unless `--confirm-production` is also present
- dry run: validates target/range/health-marker settings and skips the database query

The command requires `DATABASE_URL` for the environment being reviewed. Do not print or paste the connection string into reports.

## Safe Operator Workflow

Use explicit target labels for every non-local report:

```bash
cd apps/web
corepack pnpm module01:metrics --target staging --last 24h --base-url https://staging.anyu.tw --format markdown
corepack pnpm module01:metrics --target production --confirm-production --last 24h --base-url https://anyu.tw --format markdown
```

Before running production metrics:

- confirm the secure operator environment has the intended production `DATABASE_URL` without printing it
- run `--dry-run` first to verify target, time range, operator inclusion, and health marker behavior
- use `--target production --confirm-production` together; production runs without confirmation are intentionally blocked
- record only the target label and safe `/api/health` marker fields in reports

For staging:

- use `--target staging`
- include `--base-url https://staging.anyu.tw` when freshness context matters
- do not use staging reports as production conversion evidence

## Deployment Freshness Context

When metrics are used for a production or staging readiness decision, include the target environment health marker through `--base-url` or request it manually:

```bash
curl -sS https://anyu.tw/api/health
```

Record only these safe fields alongside the metrics interpretation:

- `app`
- `environment`
- `gitCommit`
- `gitBranch`
- `buildTime`
- `deploymentProvider`
- `versionSource`

If commit or build-time fields are `unknown`, state that deployment freshness could not be confirmed from runtime metadata and rely on the approved Vercel deployment ID plus smoke results. Do not paste full env output, `DATABASE_URL`, provider keys, LINE credentials, retention secrets, cache secrets, tokenized URLs, or raw content into metrics reports.

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

The CLI also rejects generated report output when forbidden operational keys appear in markdown or JSON output. If this guard fails, stop and inspect the report generator with synthetic data only; do not paste the failed output into ChatGPT or external docs.
