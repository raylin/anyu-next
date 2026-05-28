# Paid Generation Job Foundation Plan v0 Execution Report

## Summary

Created a planning report for a narrow DB-backed paid generation job foundation. No app code, DB schema, LINE behavior, payment behavior, prompt/schema behavior, or production runtime behavior was changed.

## Files Created

- `ai-collaboration/handoffs/2026-05-27-paid-generation-job-foundation-plan-v0-handoff.md`
- `ai-collaboration/research/2026-05-27-paid-generation-job-foundation-plan-v0.md`
- `ai-collaboration/reports/2026-05-27-paid-generation-job-foundation-plan-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Planning Decisions

- Recommend a separate future `generation_jobs` table instead of expanding `analysis_paid_results` into a combined job/result table.
- Keep v1 scoped to `paid_analysis` only.
- Keep `analysis_paid_results` as the paid output store.
- Treat LINE as a delivery/retention channel and short-code as fallback/recovery, not the core generation mechanism.
- Preserve the current external polling/status simplicity while allowing a future internal job state machine.

## Recommended Architecture

Future v1 should add:

- `generation_jobs` table
- dedupe key based on module/result/schema/prompt version
- statuses: `queued`, `processing`, `retry_scheduled`, `completed`, `failed_final`
- trigger sources: `web_unlock`, `line_bind`, `short_code`, `payment_success_future`, `operator`
- secret-gated processor endpoint
- Vercel Cron processing only `paid_analysis`
- retry/backoff and safe fallback policy

## Implementation Phases

1. Phase 1: DB schema + repository seams with tests, no behavior switch.
2. Phase 2: enqueue paid-analysis jobs from paid-result request/status paths.
3. Phase 3: secret-gated processor endpoint + cron.
4. Phase 4: LINE/short-code enqueue-only migration.
5. Phase 5: payment success enqueue integration.
6. Phase 6: future follow-up/pack reuse only after separate approval.

## Validation Results

- `python3 -m compileall oradar` passed.
- `python3 -m compileall tools/topic-ingestion` passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed: 25 tests.
- `cd apps/web && corepack pnpm lint` passed.
- `cd apps/web && corepack pnpm test` passed: 31 files, 214 tests.
- `cd apps/web && corepack pnpm build` passed.

## Known Technical Debt

- Current paid generation lifecycle stores transient generation state in `analysis_paid_results`.
- LINE short-code path triggers generation through best-effort `after()` behavior.
- LIFF bind can still invoke provider generation during bind completion.
- There is no durable independent job claim/retry/recovery model yet.

## Tech Debt Review

### New Technical Debt Introduced

None. This was planning-only.

### Existing Technical Debt Observed

Durable paid generation is the key unresolved launch-safety debt before real payment/web checkout.

### Opportunistic Cleanup Completed

None. Code changes were intentionally avoided.

### Deferred Cleanup Candidates

- Split job lifecycle out of `analysis_paid_results`.
- Replace webhook/LIFF direct generation triggers with enqueue-only behavior.
- Add stale processing recovery after job foundation exists.

### Recommended Follow-up

Run a separate human-approved Phase 1 task for DB schema + repository seams.

## Deviations From Handoff

None.

## Git Commit

Pending commit at report update time.

## Staging Push

Pending push to `origin/staging` at report update time.

## Remaining Uncertainties

- Exact entitlement table shape should wait for payment provider implementation.
- Whether fallback output is acceptable after real payment failure requires product/support approval.
- Job retention duration needs a future retention-policy decision.

## Recommended Next Step

Ask for architecture approval to proceed with `Paid Generation Job Foundation Phase 1 — DB schema + repository seams`.
