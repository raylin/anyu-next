# Paid Generation Job Foundation Phase 3A Processor Endpoint v0 Execution Report

## Summary

Implemented a secret-gated internal processor endpoint for `paid_analysis` jobs. The endpoint is feature-flagged, aggregate-only, and staging-verified with one synthetic queued job that completed through provider generation.

No production processor activation was performed.

## Files Created

- `apps/web/src/app/api/internal/jobs/process/route.ts`
- `apps/web/src/lib/modules/paid-generation-processor.ts`
- `apps/web/src/lib/runtime/internal-job-auth.ts`
- `apps/web/src/tests/internal-job-auth.test.ts`
- `apps/web/src/tests/paid-generation-processor-route.test.ts`
- `apps/web/src/tests/paid-generation-processor.test.ts`
- `ai-collaboration/handoffs/2026-05-27-paid-generation-job-foundation-phase-3a-processor-endpoint-v0-handoff.md`
- `ai-collaboration/research/2026-05-27-paid-generation-job-foundation-phase-3a-processor-endpoint-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-27-paid-generation-job-foundation-phase-3a-processor-endpoint-v0-execution-report.md`

## Files Updated

- `apps/web/src/lib/db/generation-jobs.ts`
- `apps/web/src/lib/modules/paid-generation-service.ts`
- `apps/web/src/lib/runtime/feature-flags.ts`
- `apps/web/src/tests/feature-flags.test.ts`
- `apps/web/src/tests/generation-jobs.test.ts`
- `ai-collaboration/summaries/summary_log.md`

## Processor Endpoint

- Added `POST /api/internal/jobs/process`.
- Requires an internal bearer secret.
- Requires `ENABLE_PAID_GENERATION_PROCESSOR=true`.
- Supports only `paid_analysis`.
- Returns aggregate counts only.
- Does not expose job identifiers, dedupe keys, input refs, output refs, raw text, provider output, paid-result JSON, tokens, LINE IDs, or secrets.

## Claim / Stale Recovery

- Added atomic due-job claiming with `FOR UPDATE SKIP LOCKED`.
- Added safe stale-lock recovery for stuck `processing` jobs.
- Stale jobs below max attempts return to `retry_scheduled`.
- Stale jobs at max attempts move to `failed_final`.

## Paid Analysis Processing

- Loads the job's referenced analysis record.
- Skips provider generation when a completed compatible paid result already exists.
- Creates or updates `analysis_paid_results` to `processing` before generation.
- Uses shared paid-generation payload generation for provider/fallback execution.
- Stores completed paid result payload and marks the job completed.
- Schedules retryable failures or marks final failures by safe error category.

## Security / Privacy

- Added `INTERNAL_JOB_SECRET` with fallback to `CRON_SECRET`.
- No secrets are printed or committed.
- Processor responses are aggregate-only.
- Staging verification recorded only safe counts/status categories.

## Staging Verification

- Staging preview deployment: `dpl_4CDC6LPkheurS47FG6wLcyPYmJbt`.
- Staging alias: `https://staging.anyu.tw`.
- Missing secret returned `401`.
- Valid secret with enabled staging flag processed one synthetic queued job.
- Processor aggregate: processed `1`, completed `1`, retry scheduled `0`, failed final `0`, skipped `0`, stale recovered `0`.
- Job safe status: `completed`, provider source, output reference present, no error category.
- Paid-result aggregate: completed `1`, processing `0`, failed `0`.
- Paid-result status route: `completed`.
- Unlocked route: HTTP `200`, paid-content marker present.
- Dry-run after processing: processed `0`.
- Production env listing showed no production processor flag/secret names.

## Validation Results

- `python3 -m compileall oradar`: passed.
- `python3 -m compileall tools/topic-ingestion`: passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`: passed, 25 tests.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed, 36 files / 253 tests.
- `cd apps/web && corepack pnpm build`: passed.
- `cd apps/web && corepack pnpm test:e2e:local`: passed, 11 tests.

## Tech Debt Review

### New Technical Debt Introduced

- None requiring immediate remediation.

### Existing Technical Debt Observed

- Paid-generation request-route orchestration still has adjacent direct-path logic that should eventually be consolidated around the shared generation payload helper.

### Opportunistic Cleanup Completed

- Extracted internal job auth into a small dedicated runtime helper.
- Extracted a reusable provider/fallback payload generation helper for the processor path.

### Deferred Cleanup Candidates

- Consolidate `requestDeferredPaidGeneration` further so direct and processor execution share one orchestration path.
- Add richer internal observability once cron exists, while keeping responses and logs aggregate-only.

### Recommended Follow-up

- Phase 3B: add the scheduled cron trigger and validate it on staging before any enqueue-only route changes.

## Deviations From Handoff

- Staging disabled-flag behavior was verified by route tests rather than by toggling the live staging flag back off, because staging needed to stay enabled for the processor smoke.
- No Vercel Cron was added, matching Phase 3A scope.

## Git Commit

Pending at report creation.

## Staging Push

Pending at report creation.

## Remaining Uncertainties

- Production processor activation remains intentionally pending.
- Cron cadence and timeout policy should be decided in Phase 3B.

## Recommended Next Step

Proceed to Phase 3B cron trigger implementation after review of the Phase 3A staging smoke.
