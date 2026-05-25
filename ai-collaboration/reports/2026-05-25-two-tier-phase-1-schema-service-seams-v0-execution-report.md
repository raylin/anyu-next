# Two-tier Phase 1 Schema + Service Seams v0 Execution Report

## Summary

Implemented additive Phase 1 schema and service seams for the future two-tier free/paid result architecture. Current analyze, result, unlock, and LINE fulfillment behavior remains unchanged.

## Files Created

- `ai-collaboration/handoffs/2026-05-25-two-tier-phase-1-schema-service-seams-v0-handoff.md`
- `ai-collaboration/research/2026-05-25-two-tier-phase-1-schema-service-seams-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-25-two-tier-phase-1-schema-service-seams-v0-execution-report.md`
- `apps/web/drizzle/0005_two_tier_phase_1.sql`
- `apps/web/src/lib/db/paid-results.ts`
- `apps/web/src/lib/modules/result-adapters.ts`
- `apps/web/src/tests/two-tier-phase-1-seams.test.ts`

## Files Updated

- `apps/web/drizzle/meta/_journal.json`
- `apps/web/src/lib/db/schema.ts`
- `apps/web/src/lib/db/runtime.ts`
- `apps/web/src/app/api/modules/[moduleSlug]/analyze/route.ts`
- `apps/web/src/tests/analyze-route-cache.test.ts`
- `ai-collaboration/summaries/summary_log.md`

## Schema / Migration Changes

Added `0005_two_tier_phase_1.sql`.

Schema changes:

- Added nullable `analysis_requests.user_context_json`.
- Added new `analysis_paid_results` table with paid-result JSON, status, optional unlock-intent relation, prompt/schema/model metadata, lifecycle timestamps, retry count, and retention expiry.
- Added indexes for analysis result lookup, unlock intent lookup, status lookup, and module/theme/status retention lookup.

## Service / Adapter Changes

Added paid-result repository helpers:

- `createPaidResultRecord`
- `createCompletedPaidResultShadowRecord`
- `getPaidResultForAnalysisResult`
- `markPaidResultProcessing`
- `markPaidResultCompleted`
- `markPaidResultFailed`

Added adapter helpers:

- `extractFreeResult`
- `extractPaidResult`
- `combineFreeAndPaidForLegacyDisplay`
- `adaptLegacyProductResult`

## Runtime Behavior

Current runtime behavior is preserved:

- Analyze still generates full `ProductResult`.
- `analysis_results.normalized_result_json` still includes `paid_result`.
- Result pages and unlock pages still use existing rendering paths.
- LINE fulfillment routes are unchanged.
- No deferred generation, worker, payment, or feature flag behavior was added.

Additive runtime seam:

- Fresh analyze now stores validated `user_context_json`.
- Fresh analyze attempts a best-effort completed shadow write to `analysis_paid_results`.
- Cache hits do not backfill shadow paid-result rows.
- Shadow write failure does not fail the current analyze response.

## Tests Added

Added/updated tests covering:

- migration/schema includes `analysis_paid_results`
- migration/schema includes `analysis_requests.user_context_json`
- adapter split/recombine behavior
- paid-result repository helper seam
- fresh analyze persists allowlisted user context
- fresh analyze creates shadow paid-result record
- cache-hit analyze does not write shadow paid result
- current analyze response shape remains unchanged

## Validation Results

- `python3 -m compileall oradar`: passed.
- `python3 -m compileall tools/topic-ingestion`: passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`: passed, 25 tests.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed, 25 files / 115 tests.
- `cd apps/web && corepack pnpm build`: passed.
- `cd apps/web && corepack pnpm test:e2e:local`: passed, 9 tests.

## Migration / Production Notes

The migration was created but not applied to production.

Before deploying this code to any live environment that receives fresh analyze traffic, apply:

```text
apps/web/drizzle/0005_two_tier_phase_1.sql
```

Reason:

- Fresh analyze now writes `analysis_requests.user_context_json`.
- Fresh analyze attempts a shadow write to `analysis_paid_results`.

## Known Technical Debt

- Retention cleanup does not yet delete `analysis_paid_results`.
- Cache-hit shadow backfill is deferred.
- No paid-generation worker or pending fulfillment state exists yet.

## Tech Debt Review

### New Technical Debt Introduced

- `analysis_paid_results` retention cleanup is not wired yet.
- Shadow write is best-effort and not backfilled for cached results.

### Existing Technical Debt Observed

- Current full `ProductResult` still couples free and paid result output.
- Result/unlock/LINE flows still assume paid content exists.

### Opportunistic Cleanup Completed

- Added adapter seam so future free-only results can be introduced without immediately rewriting current renderers.

### Deferred Cleanup Candidates

- Add retention cleanup for `analysis_paid_results`.
- Add cache-hit backfill after the table is proven stable.
- Add deferred paid-generation processor.
- Add pending/completed/failed unlock route states.

### Recommended Follow-up

Run staging migration live verification before deploying this code to staging/prod runtime traffic.

## Deviations From Handoff

- Used repo-standard `module_id` + `theme_slug` columns instead of a standalone `module_slug` column in `analysis_paid_results`.
- Shadow write is best-effort and caught to preserve current analyze behavior if the seam fails.

## Git Commit

Recorded in final Codex completion summary.

## Staging Push

Recorded in final Codex completion summary.

## Remaining Uncertainties

- Whether to add cache-hit shadow backfill after live migration verification.
- Whether retention cleanup for `analysis_paid_results` should happen before Phase 2 or before broader traffic.

## Recommended Next Step

Run `Two-tier Phase 1 Migration Live Verification v0` on staging, then proceed to Phase 2 free-only analyze behind a feature flag after migration is confirmed.
