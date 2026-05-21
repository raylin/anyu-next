# Scheduled Retention Cleanup v0 Review Bundle

Date: 2026-05-21
Task: Scheduled Retention Cleanup v0

## Scope

- Add a scheduled, secret-guarded retention cleanup path for expired `analysis_requests` and `analysis_results`.
- Keep the change narrow: no schema change, no broader table-policy expansion, no event cleanup, no auth/product-flow change.

## Implemented Shape

- Added `GET /api/cron/retention-cleanup` for Vercel Cron or manual operator dry runs.
- Added secret auth using `RETENTION_CLEANUP_SECRET`, with `CRON_SECRET` fallback.
- Added `dryRun=1` support.
- Added `apps/web/vercel.json` with a daily cron schedule at `0 17 * * *`.
- Added a runtime cleanup module that scrubs expired rows in place instead of deleting referenced rows.

## Data Handling Decision

Hard deletion was intentionally avoided for `analysis_results` because runtime rows are still referenced by downstream records such as unlock/contact flows. The cleanup therefore:

- nulls sensitive request-side fields on expired `analysis_requests`
- replaces expired `normalized_result_json` with a safe placeholder payload
- nulls `provider_raw_json`
- leaves non-target tables unchanged

This keeps retention enforcement narrow and operationally safe for the current schema.

## Verification Notes

### Local validation

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

### Preview live verification

- preview env secret added
- fresh preview deploy required after env insertion
- unauthorized dry run returned `401`
- authorized dry run returned `200`
- preview dry run counts:
  - `analysisRequestsDeleted: 15`
  - `analysisResultsDeleted: 14`

### Production live verification

- production env secret added
- fresh production deploy performed with the new cron route
- unauthorized dry run returned `401`
- authorized dry run returned `200`
- production dry run counts:
  - `analysisRequestsDeleted: 0`
  - `analysisResultsDeleted: 0`

## Review Outcome

- Recommended: accept
- Reason: the implementation gives the current low-key production launch an actual scheduled cleanup path for the two tables that already carry explicit retention timestamps, without broadening into riskier schema or lifecycle changes.

## Remaining Follow-up

- `unlock_intents` and `contact_submissions` still do not have explicit retention timestamps.
- Current schedule is daily, not every 12 hours, because the active Vercel plan rejected the higher-frequency cron expression.
- If later policy requires true hard deletion, the reference chain and downstream data model will need an approved follow-up design.
