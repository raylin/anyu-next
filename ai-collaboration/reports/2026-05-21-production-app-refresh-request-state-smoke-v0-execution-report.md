# Production App Refresh + Request-State Smoke v0 Execution Report

## Summary

Refreshed the production app deployment so `https://anyu.tw` serves the request-state code path, then completed the blocked production request-state smoke. The poll route, fresh analyze, request state, poll completed response, cache hit, result page, unlock intent, LINE panel, Email fallback, and privacy checks passed.

No source code was changed. The production DB migration was not rerun.

## Files Created

- `ai-collaboration/handoffs/2026-05-21-production-app-refresh-request-state-smoke-v0-handoff.md`
- `ai-collaboration/research/2026-05-21-production-app-refresh-request-state-smoke-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-21-production-app-refresh-request-state-smoke-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Production Refresh Status

Completed.

Production deployment was refreshed on the linked Vercel project `anyu-next`, and `https://anyu.tw` now serves the request-state poll route.

## Deployed Commit / Deployment

- candidate commit: `9433a01`
- required minimum commit: `1d9700d`
- Vercel deployment ID: `dpl_BMJ4b7TrYnJa6Ze68r34kso2WHFc`
- deployment URL: `https://anyu-next-n859mhgak-studioanyu-1488s-projects.vercel.app`
- inspector URL: `https://vercel.com/studioanyu-1488s-projects/anyu-next/BMJ4b7TrYnJa6Ze68r34kso2WHFc`
- production alias: `https://anyu.tw`

## Poll Route Status

Passed.

The poll route now returns JSON application errors for unknown request IDs instead of the generic app-level 404 page.

## Fresh Analyze Status

Passed.

One synthetic production analyze completed successfully:

- status: `completed`
- cache hit: `false`
- request ID returned: yes
- result ID returned: yes

DB request-state verification:

- status: `completed`
- result ID present: yes
- started/completed timestamps present: yes
- failed/error fields absent: yes

## Poll Endpoint Status

Passed.

The poll endpoint returned:

- status: `completed`
- same result ID as analyze response
- same result route as analyze response
- `retryable: false`

## Cache Interaction Status

Passed.

Exact same input returned:

- cache hit: `true`
- same result ID
- no duplicate request row for the cached repeat when safely inspected

## Funnel Status

Passed.

- result page loaded with HTTP 200
- unlock intent API succeeded
- LINE-first panel appeared
- LINE CTA target remained `https://lin.ee/S6dnbJO`
- Email fallback submitted successfully with synthetic contact value
- legal footer link remained visible

## Event / Privacy Status

Passed.

Aggregate event metadata checks found no raw synthetic input fragments, synthetic contact value, provider raw marker, or secret-name markers.

## Validation Results

All required local validation passed:

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed, 25 tests
- `corepack pnpm lint` passed
- `corepack pnpm test` passed, 22 files / 79 tests
- `corepack pnpm build` passed

Local Playwright smoke was not rerun because no app code changed. Production browser-level smoke was run against the refreshed deployment for the affected result/funnel surfaces.

## Known Technical Debt

The request-state implementation remains synchronous on cache misses. The poll endpoint is not a true async worker/queue mechanism.

## Tech Debt Review

### New Technical Debt Introduced

None.

### Existing Technical Debt Observed

Production freshness had previously lagged behind DB migration. This is now resolved for this route, but future migration handoffs should perform an app freshness precheck before production DB changes.

### Opportunistic Cleanup Completed

None. This was an ops refresh and smoke task only.

### Deferred Cleanup Candidates

- Add a narrow app version/commit health marker if deployment freshness checks remain recurring operational friction.
- Consider true async worker/queue only if provider latency and real-user behavior justify the architecture.

### Recommended Follow-up

Continue normal production monitoring for analyze success/failure rate, cache-hit behavior, event metadata safety, and contact funnel health.

## Deviations From Handoff

None materially. A browser-level LINE/Email check required rerunning Playwright outside the sandbox because Chromium launch was blocked by macOS sandbox permissions.

## Git Commit

Pending at report-write time.

## Staging Push

Pending at report-write time.

## Remaining Uncertainties

- No app-exposed commit endpoint exists; deployment freshness was verified through Vercel deployment inspection and route behavior.

## Recommended Next Step

Monitor production request-state behavior during the next low-key launch window.
