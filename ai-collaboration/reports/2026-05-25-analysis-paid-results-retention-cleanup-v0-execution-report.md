# Analysis Paid Results Retention Cleanup v0 Execution Report

## Summary

Added `analysis_paid_results` to scheduled retention cleanup coverage with aggregate dry-run reporting and in-place scrubbing for expired paid-result content. Updated tests and documentation, deployed staging and production, and verified route protection plus safe aggregate counts. No destructive production cleanup was run.

## Files Created

- `ai-collaboration/handoffs/2026-05-25-analysis-paid-results-retention-cleanup-v0-handoff.md`
- `ai-collaboration/research/2026-05-25-analysis-paid-results-retention-cleanup-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-25-analysis-paid-results-retention-cleanup-v0-execution-report.md`

## Files Updated

- `apps/web/src/lib/runtime/retention-cleanup.ts`
- `apps/web/src/tests/retention-cleanup.test.ts`
- `apps/web/src/tests/retention-cleanup-route.test.ts`
- `docs/operations/production-deployment-runbook.md`
- `apps/web/README.md`
- `ai-collaboration/summaries/summary_log.md`

## Cleanup Policy

`analysis_paid_results` is scrubbed in place. Rows are eligible only when `retention_expires_at` is present, is before cleanup time, and `paid_result_json` is not null. Cleanup sets `paid_result_json` to null, marks `status` as `expired`, sets `error_code` to `retention_expired`, and updates `updated_at`.

## Runtime / Route Changes

- Dry-run summary now includes `analysisPaidResults`.
- `analysisPaidResults` reports total, with-retention, overdue, eligible-for-cleanup, and scrubbed counts.
- Dry-run does not mutate and reports `scrubbed: 0`.
- Non-dry-run scrubs only eligible paid-result rows.
- Existing `analysis_requests` and `analysis_results` cleanup behavior is unchanged.

## Tests Added

- Dry-run includes aggregate paid-result counts.
- Non-dry-run reports paid-result scrub count.
- Already scrubbed paid-result rows are untouched.
- Cron dry-run response includes the new `analysisPaidResults` block.
- Existing unauthorized-route behavior remains covered.

## Staging Verification

- Staging deployment: `dpl_wmQpvL15rP6yYen9VD2Ase19FbPm`.
- `https://staging.anyu.tw` points to the refreshed deployment.
- Unauthorized route check returned HTTP 401.
- Authorized route dry-run was unavailable because the pulled preview env did not expose a usable cleanup secret.
- Safe Neon aggregate check: total `2`, with retention `2`, overdue `0`, eligible for cleanup `0`.

## Production Verification

- Production deployment: `dpl_8wAC5ZnKjba5c8RCdB8tVwmtnYsr`.
- `https://anyu.tw` points to the refreshed deployment.
- Unauthorized route check returned HTTP 401.
- Authorized production route dry-run was blocked because the local Vercel env pull did not provide a usable cleanup secret value.
- Safe Neon aggregate check: total `1`, with retention `1`, overdue `0`, eligible for cleanup `0`.
- No destructive production cleanup was run.

## Event / Privacy Status

- Verification used aggregate counts only.
- No raw input, provider output, full result JSON, `paid_result_json`, contact values, LINE user IDs, fulfillment codes, unlock tokens, tokenized URLs, or secrets were written to this report.

## Validation Results

- `python3 -m compileall oradar`: passed.
- `python3 -m compileall tools/topic-ingestion`: passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`: passed, 25 tests.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed, 118 tests.
- `cd apps/web && corepack pnpm build`: passed.

## Known Technical Debt

- Authorized live route dry-run still needs to be run by a caller with direct access to `RETENTION_CLEANUP_SECRET` or `CRON_SECRET`.

## Tech Debt Review

### New Technical Debt Introduced

None.

### Existing Technical Debt Observed

- Retention cleanup still does not cover `events`, `unlock_intents`, contact data, or sessions.
- Secret access for manual retention dry-run verification is not convenient from the current local tooling path.

### Opportunistic Cleanup Completed

- Updated runbook language that previously said only `analysis_requests` and `analysis_results` were covered.

### Deferred Cleanup Candidates

- Add safe retention handling for `events`, `unlock_intents`, contact data, and sessions after policy approval.
- Add a documented operator path for authorized dry-run verification without exposing secrets.

### Recommended Follow-up

Run an authorized production dry-run from an environment with cleanup-secret access and record aggregate counts.

## Deviations From Handoff

- Authorized staging and production dry-runs could not be completed because local env pulls did not expose usable cleanup secret values. Unauthorized route checks and direct Neon aggregate verification were completed instead.

## Git Commit

Pending at report creation time.

## Staging Push

Pending at report creation time.

## Remaining Uncertainties

- Whether Vercel cron currently has a non-empty cleanup secret available in the same way the route does at runtime.

## Recommended Next Step

Run one authorized production dry-run with direct cleanup-secret access, then proceed to broader retention policy work for remaining tables.
