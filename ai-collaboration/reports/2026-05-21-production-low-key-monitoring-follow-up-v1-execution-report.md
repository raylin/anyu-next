# Production Low-Key Monitoring Follow-up v1 Execution Report

## Summary

Completed focused production monitoring after the result-cache, retention-cleanup, request-state, and production-refresh changes. Production remains healthy in the post-refresh monitoring window. No code or configuration changes were made.

## Files Created

- `ai-collaboration/handoffs/2026-05-21-production-low-key-monitoring-follow-up-v1-handoff.md`
- `ai-collaboration/research/2026-05-21-production-low-key-monitoring-follow-up-v1.md`
- `ai-collaboration/reports/2026-05-21-production-low-key-monitoring-follow-up-v1-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Monitoring Window

```text
2026-05-21 06:22:40 UTC to 2026-05-21 06:35:13 UTC
```

The window starts at the production app refresh deployment time for `dpl_BMJ4b7TrYnJa6Ze68r34kso2WHFc`.

## Production Health Status

Passed.

- apex loaded with 200
- Module 01 landing loaded with 200
- demo result loaded with 200
- privacy/terms/disclaimer/legal loaded with 200
- `www.anyu.tw` redirected to apex with 308

## Request-State / Cache Status

Passed.

- requests in window: 1
- results in window: 1
- completed: 1
- failed: 0
- expired: 0
- processing/stuck: 0
- median request-state latency: 29,530 ms
- provider latency median: 27,245 ms
- cache-hit events: 1
- cache-miss events: 1
- cache hit ratio: 50% in the narrow smoke-driven window
- no duplicate request row observed for the cached repeat

## Retention Status

Acceptable.

- unauthorized cleanup dry-run returned 401 JSON
- overdue `analysis_requests`: 0
- overdue `analysis_results`: 0
- authorized dry-run could not be completed because the Vercel env export did not provide a usable cleanup secret locally
- no manual cleanup recommended

## Funnel Status

Passed.

- unlock intents in window: 5
- contact submissions in window: 2
- `paid_unlock_clicked`: 5
- `email_fallback_opened`: 2
- `contact_submitted`: 2
- `line_add_clicked`: 0
- `share_card_clicked`: 0
- LINE target was verified as `https://lin.ee/S6dnbJO`
- Email fallback submitted with synthetic-only email during the refreshed production smoke

## Event / Privacy Status

Passed.

Aggregate metadata scan found no raw synthetic input fragments, contact values, email-like markers, provider raw markers, or secret-name markers.

## Abuse / Cost Status

Acceptable.

- analyze requests today UTC: 3
- analyze requests last hour: 1
- request error code count in window: 0
- analysis failed events in window: 0
- estimated provider calls avoided by cache in window: 1
- no evidence of abuse/cost spike

## Validation Results

All required validation passed:

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed, 25 tests
- `corepack pnpm lint` passed
- `corepack pnpm test` passed, 22 files / 79 tests
- `corepack pnpm build` passed

Local Playwright was not run because no app code changed.

## Known Technical Debt

Provider latency remains the main perceived-wait risk because request-state v0 is still synchronous on cache misses.

## Tech Debt Review

### New Technical Debt Introduced

None.

### Existing Technical Debt Observed

- No app-exposed commit/version marker exists, so production freshness checks rely on Vercel CLI inspection and route behavior.
- Authorized retention dry-run is awkward from this shell when the cleanup secret is not available in the local env export.

### Opportunistic Cleanup Completed

- Removed temporary Vercel env files created during the authorized dry-run attempt.

### Deferred Cleanup Candidates

- Add a narrow app version/commit health marker.
- Improve operator workflow for authorized retention dry-run verification without exposing secrets.

### Recommended Follow-up

Run the next monitoring checkpoint after the next scheduled retention cron window or after meaningful organic traffic arrives.

## Deviations From Handoff

Authorized retention dry-run was not completed because no usable cleanup secret was available from the Vercel env export. The report instead uses unauthorized-route verification plus direct aggregate overdue DB counts.

## Git Commit

Pending at report-write time.

## Staging Push

Pending at report-write time.

## Remaining Uncertainties

- Whether the next scheduled cron run has executed after the production refresh.
- Whether a future operator shell can access the cleanup secret for authorized dry-run verification without exposing it.

## Recommended Next Step

Continue `GO / monitor`; run the next routine production monitoring checkpoint after the next cron cycle or after meaningful organic traffic arrives.
