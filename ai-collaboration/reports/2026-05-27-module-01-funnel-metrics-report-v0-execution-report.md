# Module 01 Funnel Metrics Report v0 Execution Report

## Summary

Built a read-only Module 01 funnel metrics CLI that aggregates existing `events` rows into safe markdown or JSON reports.

## Files Created

- `apps/web/scripts/module-01-funnel-report.mjs`
- `apps/web/src/tests/module-01-funnel-report.test.ts`
- `docs/operations/module-01-metrics-report.md`
- `ai-collaboration/handoffs/2026-05-27-module-01-funnel-metrics-report-v0-handoff.md`
- `ai-collaboration/research/2026-05-27-module-01-funnel-metrics-report-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-27-module-01-funnel-metrics-report-v0-execution-report.md`

## Files Updated

- `apps/web/package.json`
- `docs/operations/production-deployment-runbook.md`
- `ai-collaboration/summaries/summary_log.md`

## Report Capabilities

- Reads Module 01 event rows for a date/time range.
- Defaults to the last 24 hours.
- Excludes operator test traffic by default.
- Supports `--include-operator`.
- Outputs a console table and markdown report by default.
- Supports JSON output with `--format json`.
- Supports explicit output path with `--output`.

## Event Mapping

Implemented canonical funnel mapping for landing, analyze, result, unlock, LINE fulfillment, paid generation, and unlocked-result rows.

Documented mapping gaps where events are not currently emitted.

## Operator/Test Filtering

Events with `metadataJson.operatorTest === true` are excluded by default and counted as excluded operator events.

Reports generated with `--include-operator` are clearly marked.

## Theme / Provider Splits

Theme split:

- `themeVariant`
- `themeSource`
- manual override counts
- theme switch count

Provider split:

- paid generation `provider`
- paid generation `fallback`
- `unknown`

Safe category aggregation collapses unsafe free-text values to `unknown`.

## Tests Added

Added `apps/web/src/tests/module-01-funnel-report.test.ts` with synthetic fixtures only.

Coverage includes funnel aggregation, conversion rates, zero-denominator handling, operator filtering, theme split, provider/fallback split, error summaries, privacy guardrails, markdown output, date filtering, and CLI option parsing.

## Validation Results

- `python3 -m compileall oradar` passed.
- `python3 -m compileall tools/topic-ingestion` passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed, 25 tests.
- `cd apps/web && corepack pnpm lint` passed.
- `cd apps/web && corepack pnpm test` passed, 30 files / 193 tests.
- `cd apps/web && corepack pnpm build` passed.
- `cd apps/web && corepack pnpm test -- src/tests/module-01-funnel-report.test.ts` passed.
- `cd apps/web && corepack pnpm module01:metrics --help` passed.

## Known Technical Debt

- The current event stream may not emit unlocked-result page views, so `unlocked_result_view` can remain zero until that event exists.
- Webhook invalid-signature attempts are intentionally not persisted as events, so that metric is unavailable from this report source.

## Tech Debt Review

### New Technical Debt Introduced

- The reporting CLI is JavaScript `.mjs` because the app does not currently include a TypeScript script runner.

### Existing Technical Debt Observed

- Funnel analytics event coverage is incomplete for unlocked-result views and LIFF bind-start events.

### Opportunistic Cleanup Completed

- Added a dedicated operations doc for running and interpreting the metrics report.

### Deferred Cleanup Candidates

- Add a safe unlocked-result page-view event if product analytics requires that metric.
- Add a safe LIFF-opened event if LIFF bind-start rate becomes important.

### Recommended Follow-up

- Run the report against staging or production only when aggregate event review is explicitly intended and the correct `DATABASE_URL` target is confirmed.

## Deviations From Handoff

- Implemented the CLI at `apps/web/scripts/module-01-funnel-report.mjs` instead of `.ts` to match available runtime tooling.
- Did not run the report against production data.

## Git Commit

Pending at report creation time.

## Staging Push

Pending at report creation time.

## Remaining Uncertainties

- Whether unlocked-result page-view tracking should be added is a separate analytics/event-semantics decision.
- Low-key traffic volume may be too small for strong A/B conclusions.

## Recommended Next Step

After production/staging has relevant event volume, run the report for a known date window with operator traffic excluded.
