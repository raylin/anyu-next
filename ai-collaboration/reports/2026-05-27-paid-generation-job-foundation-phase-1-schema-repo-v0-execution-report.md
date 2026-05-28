# Paid Generation Job Foundation Phase 1 — DB Schema + Repository Seams v0 Execution Report

## Summary

Added additive schema and repository seams for future durable paid-analysis generation jobs. Runtime paid generation, LINE, LIFF, payment, prompt/schema, and status/poller behavior were not changed.

## Files Created

- `ai-collaboration/handoffs/2026-05-27-paid-generation-job-foundation-phase-1-schema-repo-v0-handoff.md`
- `apps/web/drizzle/0006_generation_jobs.sql`
- `apps/web/src/lib/db/generation-jobs.ts`
- `apps/web/src/tests/generation-jobs.test.ts`
- `ai-collaboration/research/2026-05-27-paid-generation-job-foundation-phase-1-schema-repo-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-27-paid-generation-job-foundation-phase-1-schema-repo-v0-execution-report.md`

## Files Updated

- `apps/web/drizzle/meta/_journal.json`
- `apps/web/src/lib/db/schema.ts`
- `ai-collaboration/summaries/summary_log.md`

## Schema Changes

Added `generation_jobs` with:

- v1 job type support for `paid_analysis`
- lifecycle statuses for queued/processing/retry/completed/final failure
- refs to input/output records by type/id
- trigger source and operator-test flag
- dedupe key unique index
- future processor indexes
- safe error/model/version metadata

No production migration was applied.

## Repository Helpers

Added helper module:

- `buildPaidAnalysisJobDedupeKey`
- `createOrReusePaidAnalysisJob`
- `getGenerationJobById`
- `getGenerationJobByDedupeKey`
- `markGenerationJobProcessing`
- `markGenerationJobCompleted`
- `markGenerationJobRetryScheduled`
- `markGenerationJobFailedFinal`
- `listDueGenerationJobs`

`attempt_count` increments when a job is marked processing because that marks the start of a processor attempt.

## Behavior Preservation

No runtime route imports or invokes the new repository in this phase.

Preserved:

- existing paid generation service
- paid-result request/status routes
- LIFF bind
- LINE webhook and short-code fallback
- pending poller
- payment disabled state
- provider prompt/schema behavior
- event names

## Tests Added

Added `apps/web/src/tests/generation-jobs.test.ts`.

Tests cover allowed values, dedupe key behavior, create/reuse behavior, repository state transitions, due-job listing, and privacy-safe serialized job fixtures.

## Validation Results

- `python3 -m compileall oradar` passed.
- `python3 -m compileall tools/topic-ingestion` passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed: 25 tests.
- `cd apps/web && corepack pnpm lint` passed.
- `cd apps/web && corepack pnpm test` passed: 32 files, 226 tests.
- `cd apps/web && corepack pnpm build` passed.
- `cd apps/web && corepack pnpm test:e2e:local` passed: 11 Playwright tests.

## Tech Debt Review

### New Technical Debt Introduced

None. The schema is additive and unused by runtime until later phases.

### Existing Technical Debt Observed

Paid generation runtime still uses `analysis_paid_results` as transient lifecycle state, and LINE short-code generation remains best-effort until later phases.

### Opportunistic Cleanup Completed

None beyond adding focused tests for the new repository seam.

### Deferred Cleanup Candidates

- Add staging migration verification for `0006_generation_jobs.sql`.
- Wire paid-result request/status routes to enqueue/reuse jobs in Phase 2.
- Add secret-gated processor and retry/backoff in Phase 3.
- Convert LINE/short-code paths to enqueue-only in Phase 4.

### Recommended Follow-up

Run `Paid Generation Job Foundation Phase 1 Staging Migration Verification v0`.

## Deviations From Handoff

None.

## Git Commit

Pending commit at report update time.

## Staging Push

Pending push to `origin/staging` at report update time.

## Remaining Uncertainties

- Production migration timing requires separate explicit approval.
- Job retention duration still needs a future retention-policy decision.
- Payment entitlement refs remain nullable until payment schema is approved.

## Recommended Next Step

Verify the additive migration on staging, then plan Phase 2 enqueue/status integration.
