# Paid Generation Job Foundation Phase 2 — Enqueue / Status Integration Plan v0 Execution Report

## Summary

Created a planning report for Phase 2 integration of `generation_jobs` into the paid generation request/status lifecycle. No runtime, schema, LINE, payment, prompt/schema, or production behavior was changed.

## Files Created

- `ai-collaboration/handoffs/2026-05-27-paid-generation-job-foundation-phase-2-enqueue-status-plan-v0-handoff.md`
- `ai-collaboration/research/2026-05-27-paid-generation-job-foundation-phase-2-enqueue-status-plan-v0.md`
- `ai-collaboration/reports/2026-05-27-paid-generation-job-foundation-phase-2-enqueue-status-plan-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Planning Decisions

- Recommend Option B: enqueue + direct generation compatibility.
- Do not use shadow-only rows because they would be ambiguous without a processor.
- Do not switch to enqueue-only until Phase 3 processor/cron exists.
- Add Phase 2 behind `ENABLE_PAID_GENERATION_JOBS=false` by default.
- Centralize job mirroring in `requestDeferredPaidGeneration` rather than duplicating logic in each route.
- Keep external paid status response simple and avoid exposing job internals.

## Recommended Phase 2 Scope

Phase 2 should:

- create/reuse `paid_analysis` jobs when flag is enabled
- mirror processing/completed/failed state from the existing direct generation path
- reconcile completed paid results into completed jobs
- teach status route to read job state only when flag is enabled
- preserve current user-facing behavior and API contracts

Phase 2 should not:

- add processor/cron
- make LINE enqueue-only
- change payment behavior
- change prompt/schema
- expose job internals to users

## Migration / Rollback Notes

Staging `0006_generation_jobs.sql` is already applied and verified.

Production migration remains pending. Production runtime must not access `generation_jobs` until production migration is applied or the feature flag is disabled.

Rollback:

- set `ENABLE_PAID_GENERATION_JOBS=false`
- ignore additive job rows
- continue using `analysis_paid_results` as current source of truth

## Validation Results

- `python3 -m compileall oradar` passed.
- `python3 -m compileall tools/topic-ingestion` passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed: 25 tests.
- `cd apps/web && corepack pnpm lint` passed.
- `cd apps/web && corepack pnpm test` passed: 32 files, 226 tests.
- `cd apps/web && corepack pnpm build` passed.

## Tech Debt Review

### New Technical Debt Introduced

None. This was planning-only.

### Existing Technical Debt Observed

Paid generation runtime still uses `analysis_paid_results` as lifecycle state, LIFF bind can invoke provider generation during bind, and short-code webhook still uses best-effort background generation.

### Opportunistic Cleanup Completed

None.

### Deferred Cleanup Candidates

- Phase 2 feature-flagged job mirroring.
- Phase 3 processor/cron.
- Phase 4 LINE enqueue-only.
- Phase 5 payment success enqueue.

### Recommended Follow-up

Implement Phase 2 behind `ENABLE_PAID_GENERATION_JOBS=false` by default and verify on staging before any production migration/enablement.

## Deviations From Handoff

None.

## Git Commit

Pending commit at report update time.

## Staging Push

Pending push to `origin/staging` at report update time.

## Remaining Uncertainties

- Exact fail-open/fail-closed behavior for job mirroring should be confirmed during Phase 2 implementation.
- Production migration timing remains separate and should be tied to Phase 2 production enablement.

## Recommended Next Step

Run `Paid Generation Job Foundation Phase 2 — Enqueue / Status Integration v0`.
