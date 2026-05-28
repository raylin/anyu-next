# Paid Generation Job Foundation Phase 3 — Processor / Cron Plan v0 Execution Report

## Summary

Created a Phase 3 processor/cron architecture plan for `paid_analysis` generation jobs. No app code, DB schema, runtime behavior, LINE/LIFF behavior, payment behavior, production flags, processor endpoint, or cron config was changed.

## Files Created

- `ai-collaboration/handoffs/2026-05-27-paid-generation-job-foundation-phase-3-processor-cron-plan-v0-handoff.md`
- `ai-collaboration/research/2026-05-27-paid-generation-job-foundation-phase-3-processor-cron-plan-v0.md`
- `ai-collaboration/reports/2026-05-27-paid-generation-job-foundation-phase-3-processor-cron-plan-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Planning Decisions

- Recommend Phase 3A as processor-in-isolation, not enqueue-only.
- Keep request route direct-generation behavior unchanged for Phase 3A.
- Add a future secret-gated aggregate-only processor endpoint.
- Add atomic claim helper using `FOR UPDATE SKIP LOCKED`.
- Recover stale processing jobs inside each processor run.
- Keep current fallback behavior for beta/no-charge flows, but require owner approval before real-payment fallback policy.

## Recommended Phase 3 Scope

Phase 3A should include:

- `paid_analysis` only
- `POST /api/internal/jobs/process`
- bearer-secret authorization
- `ENABLE_PAID_GENERATION_PROCESSOR`
- atomic claim helper
- stale recovery helper
- processor service reusing current paid-generation internals
- manual staging smoke before cron

Phase 3A should not include:

- request route enqueue-only switch
- LINE/LIFF/short-code behavior changes
- payment behavior
- external queue
- admin UI

## Processor / Cron Recommendation

Processor:

- aggregate-only response
- no job IDs/dedupe keys/raw errors/raw content
- limit `1` by default, max `3`
- dry-run optional

Cron:

- every 1 minute after staging manual smoke
- production starts with max 1 job/run
- keep route max duration within provider timeout limits

## Production Safety Notes

Production has the `generation_jobs` schema, but `ENABLE_PAID_GENERATION_JOBS` remains disabled/absent and no processor exists.

Do not run processor in production until:

- processor code is deployed disabled
- secret is configured
- staging manual processor smoke passes
- staging cron smoke passes
- owner approves production processor enablement

## Validation Results

- `python3 -m compileall oradar`: passed
- `python3 -m compileall tools/topic-ingestion`: passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`: passed, 25 tests
- `cd apps/web && corepack pnpm lint`: passed
- `cd apps/web && corepack pnpm test`: passed, 33 files / 238 tests
- `cd apps/web && corepack pnpm build`: passed
- `cd apps/web && corepack pnpm test:e2e:local`: not run because no code changed

## Tech Debt Review

### New Technical Debt Introduced

None; docs/planning only.

### Existing Technical Debt Observed

- Existing due-job listing is not an atomic claim primitive and orders priority ascending.
- Paid generation core is embedded in `requestDeferredPaidGeneration`; processor implementation should extract shared generation internals to avoid duplication.
- No processor/cron/stale recovery exists yet.

### Opportunistic Cleanup Completed

None; no code changes were made.

### Deferred Cleanup Candidates

- Add `claimDueGenerationJobs` transaction helper.
- Add stale lock recovery helper.
- Extract reusable paid-generation execution core.
- Add safe processor metrics/events after event semantics approval.

### Recommended Follow-up

Implement Phase 3A processor endpoint + claim service on staging only.

## Deviations From Handoff

None.

## Git Commit

Pending at report creation.

## Staging Push

Pending at report creation.

## Remaining Uncertainties

- Whether future paid fallback is acceptable after real payment remains a product/support decision.
- Whether to use a dedicated `INTERNAL_JOB_SECRET` or shared `CRON_SECRET` should be decided during implementation.
- Exact Vercel Cron cadence can be adjusted after staging provider latency is measured.

## Recommended Next Step

Run `Paid Generation Job Foundation Phase 3A — Processor Endpoint + Claim Service v0`.
