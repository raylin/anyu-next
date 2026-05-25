# Two-tier Free Analyze + Deferred Paid Generation v0 Implementation Plan Execution Report

## Summary

Created a schema-aware implementation plan for moving Module 01 from synchronous full-result generation to free-first analyze with deferred paid-result generation. This was a planning-only task. No code, prompt/schema assets, database schema, LINE behavior, env, provider calls, migrations, or production behavior were changed.

## Files Created

- `ai-collaboration/handoffs/2026-05-25-two-tier-free-analyze-deferred-paid-generation-v0-implementation-plan-handoff.md`
- `ai-collaboration/research/2026-05-25-two-tier-free-analyze-deferred-paid-generation-v0-implementation-plan.md`
- `ai-collaboration/reports/2026-05-25-two-tier-free-analyze-deferred-paid-generation-v0-implementation-plan-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Schema Findings

- `analysis_results.normalized_result_json` currently stores a required full `ProductResult`.
- `ProductResult` requires `paid_result`, so free-only rows need a new schema/type or adapter.
- `analysis_requests.raw_input_redacted` can support deferred paid generation while retention is valid.
- `analysis_requests` does not currently persist user context as structured JSON.
- `unlock_intents` already has LINE binding and delivery status fields but no paid-generation status.
- LINE webhook dedupe and rate-limit tables are present.

## Architecture Recommendation

- Use a separate `analysis_paid_results` table rather than nullable paid fields on `analysis_results`.
- Keep existing full-result rows compatible.
- Add a free-only result schema/prompt and paid-only result schema/prompt in a later implementation phase.
- Add paid-generation lifecycle and pending fulfillment states before switching LINE fulfillment behavior.

## Implementation Recommendation

Recommended phases:

1. Add schema and service seams with no behavior switch.
2. Add free-first analyze behind a staging feature flag.
3. Trigger deferred paid generation after LINE bind / short-code match.
4. Add first LINE friend free unlock per LINE user per module.
5. Add future paywall where payment success triggers paid generation.

## Validation Results

- `python3 -m compileall oradar`: passed.
- `python3 -m compileall tools/topic-ingestion`: passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`: passed, 25 tests.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed, 24 files / 111 tests.
- `cd apps/web && corepack pnpm build`: passed.

## Known Technical Debt

- Free and paid generation are coupled in one prompt/schema/runtime path.
- Result page currently reads `paid_result` to build free-page reassurance.
- Unlock page assumes paid result already exists.
- LINE webhook/LIFF bind currently deliver immediately and have no pending paid-generation flow.
- Background paid-generation processing does not exist yet.

## Tech Debt Review

### New Technical Debt Introduced

None. This was documentation-only.

### Existing Technical Debt Observed

- Current `ProductResult` type is not separable into free and paid lifecycles.
- Current cache key represents full generation, not free vs paid layers.
- Fulfillment state tracks delivery but not paid-generation lifecycle.

### Opportunistic Cleanup Completed

None. No code changes were made.

### Deferred Cleanup Candidates

- Add free/paid schema split.
- Add paid-generation table and service helpers.
- Add pending unlock route state.
- Add background processor for paid generation.
- Add retention cleanup for paid-result and LINE webhook tables.

### Recommended Follow-up

Create and review `Two-tier Phase 1 Schema + Service Seams v0` before implementing migrations.

## Deviations From Handoff

None.

## Git Commit

Recorded in final Codex completion summary.

## Staging Push

Recorded in final Codex completion summary.

## Remaining Uncertainties

- Whether Vercel Cron/internal route is acceptable for first paid-generation processing.
- Whether first-free unlock should start immediately or wait until after deferred paid flow stabilizes.
- Whether paid result should reuse free result as authoritative context or only as supporting context.

## Recommended Next Step

Prepare Phase 1 additive schema/service-seam handoff for human approval. Do not change runtime behavior until the schema plan is approved.
