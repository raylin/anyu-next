# Two-tier Phase 1 Production Migration + Smoke v0 Execution Report

## Summary

Applied the additive Two-tier Phase 1 migration to production, deployed current code to production, diagnosed one production output-validation smoke failure, applied a same-model output-validation retry hotfix, redeployed production, and verified the final production synthetic smoke passed.

## Files Created

- `ai-collaboration/handoffs/2026-05-25-two-tier-phase-1-production-migration-smoke-v0-handoff.md`
- `ai-collaboration/research/2026-05-25-two-tier-phase-1-production-migration-smoke-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-25-two-tier-phase-1-production-migration-smoke-v0-execution-report.md`

## Files Updated

- `apps/web/src/lib/ai/runtime.ts`
- `apps/web/src/tests/runtime-model-strategy.test.ts`
- `ai-collaboration/summaries/summary_log.md`

## Production Migration Status

- Production schema was checked before migration; Phase 1 objects were missing.
- Applied `apps/web/drizzle/0005_two_tier_phase_1.sql` to Neon production.
- Verified `analysis_requests.user_context_json` exists.
- Verified `analysis_paid_results` exists.
- Verified expected indexes and constraints exist.

## Production Deployment Status

- Initial production deployment after migration: `dpl_Dbfqd2pvH3FbjqfAi9NL9a6AK8i7`.
- Final production deployment after retry hotfix: `dpl_66hd3zGQjTLBKB3jZYDGFMZDTkRC`.
- Final production alias: `https://anyu.tw`.
- Final deployment status: ready.

## Production Smoke Results

- First production synthetic fresh analyze returned HTTP 502 and persisted sanitized `output_validation` failure category.
- Runtime was updated to retry output-validation failures once with the same model, without changing prompt/schema/provider/model defaults.
- Final production synthetic fresh analyze returned HTTP 200 with `cacheHit = false`.
- Final result page returned HTTP 200.
- Current ProductResult behavior remained unchanged; persisted normalized result includes both `free_result` and `paid_result`.

## Shadow Paid Result Status

- Shadow row created: yes.
- Status: completed.
- Linked analysis result: yes.
- Module/theme present: yes.
- Prompt/schema/model metadata present: yes.
- Retention expiry present: yes.
- `paid_result_json` was not selected or reported.

## User Context Persistence Status

- `analysis_requests.user_context_json` persisted: yes.
- Allowlisted field count: 4.
- Event metadata contains context presence/count only, not context values.

## Event / Privacy Status

- Event metadata key inspection showed expected operational keys only.
- No raw input, redacted input, context values, raw provider output, full result JSON, `paid_result_json`, fulfillment code, unlock token, tokenized URL, LINE user ID, or secrets were selected into reports.
- Route checks avoided real production OA message smoke.

## Validation Results

- `python3 -m compileall oradar`: passed.
- `python3 -m compileall tools/topic-ingestion`: passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`: passed, 25 tests.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed, 117 tests.
- `cd apps/web && corepack pnpm build`: passed.
- `cd apps/web && corepack pnpm test:e2e:local`: passed, 9 tests.

## Known Technical Debt

- `analysis_paid_results` is now live in production but is not yet included in scheduled retention cleanup.
- Same-model retry is a pragmatic robustness layer for output-validation failures but does not replace the planned free-first/deferred-paid architecture.

## Tech Debt Review

### New Technical Debt Introduced

None beyond the known temporary synchronous paid-result generation path.

### Existing Technical Debt Observed

- Production paid-result generation remains synchronous and can take roughly a minute on fresh analyze.
- `analysis_paid_results` retention cleanup remains pending.

### Opportunistic Cleanup Completed

- Enabled one same-model retry for output-validation failures so occasional invalid structured output does not immediately fail production analyze.

### Deferred Cleanup Candidates

- Add `analysis_paid_results` to scheduled retention cleanup.
- Continue Phase 2/Phase 3 two-tier work to avoid long synchronous paid-result generation.

### Recommended Follow-up

Implement `analysis_paid_results` retention cleanup before broader production traffic or ads.

## Deviations From Handoff

- The handoff did not explicitly request a new runtime change, but the first production smoke failed with sanitized `output_validation`. A minimal same-model retry hotfix was required to complete the production smoke without changing prompt/schema/provider/model defaults.

## Git Commit

Pending at report creation time.

## Staging Push

Pending at report creation time.

## Remaining Uncertainties

- Whether output-validation failures will recur under higher traffic; same-model retry reduces this risk but does not eliminate provider variability.
- Exact production traffic threshold before `analysis_paid_results` retention cleanup becomes operationally urgent.

## Recommended Next Step

Add `analysis_paid_results` to scheduled retention cleanup, then continue the two-tier free-first/deferred-paid implementation plan.
