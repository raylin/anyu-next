# LINE Fulfillment Staging Deploy + Smoke v0 Execution Report

## Summary

Completed staging migration and partial staging smoke for LINE Fulfillment Automation MVP v0. Staging is serving the new routes and the staging Neon preview branch has the fulfillment migration applied. Core unlock, unlocked-route, LIFF bind API, invalid webhook signature, and privacy-event checks passed.

The smoke did not pass fully because live staging public LINE env is mismatched: unlock intent returned `liffUrl: null` and the old production OA add-friend URL instead of the staging/test OA URL.

## Files Created

- `ai-collaboration/handoffs/2026-05-21-line-fulfillment-staging-deploy-smoke-v0-handoff.md`
- `ai-collaboration/research/2026-05-21-line-fulfillment-staging-deploy-smoke-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-21-line-fulfillment-staging-deploy-smoke-v0-execution-report.md`

## Files Updated

- `ai-collaboration/research/line/line-oa-staging-setup.md`
- `ai-collaboration/research/line/line-fulfillment-env-matrix.md`
- `ai-collaboration/summaries/summary_log.md`

## Staging Deployment Status

Status: partially verified.

Confirmed staging serves new implementation routes:

- `/api/health` returned `200`
- `/m/ambiguous-temperature/line/fulfill` rendered
- `/api/line/webhook` rejected invalid signature
- `/m/ambiguous-temperature/unlock/[unlockToken]` rendered

Vercel CLI was unavailable on PATH, so exact deployment commit inspection was not possible. Route freshness confirms new implementation is live.

## Migration Status

Status: passed.

Applied `apps/web/drizzle/0003_line_fulfillment.sql` to staging/preview Neon branch only:

- project: `shy-silence-43729807`
- branch: `br-fragrant-union-aoh4udf1`
- database: `neondb`

Verified all expected fulfillment columns and indexes on `unlock_intents`.

Production migration was not run.

## Env / Setup Status

Status: partial / blocked by public env mismatch.

Docs indicate staging/test OA setup exists. Live runtime showed:

- fulfillment code/token generation works
- `liffUrl` is null
- `lineAddUrl` points at old production OA URL

Updated staging setup docs and env matrix to mark public staging LINE env as unknown/mismatch pending Vercel Preview env correction and redeploy.

## Smoke Results

- Deployment freshness: partial pass; new routes are live, exact commit not inspected.
- Fresh analyze: passed using synthetic input.
- Unlock intent: passed; returned fulfillment-safe fields.
- Fulfillment panel: partial; copy/short-code implementation verified locally and API payload exists, but live public env mismatch blocks intended LIFF/test-OA CTA.
- Unlocked route valid token: passed.
- Unlocked route invalid token: passed with safe error state.
- LIFF page route: passed.
- LIFF bind invalid token: passed, safe rejection.
- LIFF bind valid synthetic payload: passed, returned unlocked URL and updated DB state.
- Webhook invalid signature: passed.
- Webhook valid signed payload: not run, no secret-backed signing context available.
- Real test OA short-code smoke: not run, blocked by staging public env mismatch and manual LINE interaction requirement.

## Event / Privacy Status

Status: passed for automated smoke session.

Staging Neon event metadata for the smoke session contained safe IDs, channel/status, and existing aggregate analyze metadata only. No raw input, LINE message text, email, LINE display name, full result JSON, provider output, database URL, LINE secrets, cache secret, or retention secret was observed.

## Validation Results

- Passed: `python3 -m compileall oradar`
- Passed: `python3 -m compileall tools/topic-ingestion`
- Passed: `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` (25 tests)
- Passed: `cd apps/web && corepack pnpm lint`
- Passed: `cd apps/web && corepack pnpm test` (23 files / 85 tests)
- Passed: `cd apps/web && corepack pnpm build`
- Passed: `cd apps/web && corepack pnpm test:e2e:local` (9 Playwright tests)

## Known Technical Debt

- LIFF server-side ID token verification remains deferred.
- Webhook rate limiting remains deferred.
- Duplicate LINE event idempotency remains deferred.
- Staging public LINE env requires correction before real test-OA smoke.

## Tech Debt Review

### New Technical Debt Introduced

- None in app code. This task only applied staging migration and updated docs/reports.

### Existing Technical Debt Observed

- Staging env records were over-optimistic; live runtime did not match the documented staging public LINE env.
- Vercel CLI is unavailable in this shell, limiting exact deployment/env inspection.

### Opportunistic Cleanup Completed

- Updated staging setup docs and env matrix to reflect observed live mismatch.

### Deferred Cleanup Candidates

- Add a lightweight app health/config marker that can report presence-only public LINE env status without exposing values.
- Add a deployment commit/version marker endpoint to remove ambiguity in future staging freshness checks.

### Recommended Follow-up

- Correct Vercel Preview public LINE env, redeploy staging, then rerun real test OA smoke.

## Deviations From Handoff

- Exact Vercel deployment commit was not inspected because Vercel CLI is unavailable.
- Real test OA short-code smoke was not run because staging public LINE env mismatch would point users to the wrong OA and no signed webhook context was available in shell.

## Git Commit

- Pending at report-write time.

## Staging Push

- Pending at report-write time.

## Remaining Uncertainties

- Whether Vercel Preview env has correct values but the current deployment is stale, or the env values themselves are incorrect.
- Whether LINE webhook verification passes in the LINE console after env correction.
- Whether real short-code reply succeeds after webhook setup is verified.

## Recommended Next Step

Fix Vercel Preview/Staging public LINE env, redeploy staging, then rerun the LINE fulfillment staging test OA smoke.
