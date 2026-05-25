# Two-tier Phase 1 Schema + Service Seams v0 Review Bundle

Date: 2026-05-25

## 1. Summary

Phase 1 added additive schema and service seams for future free-first analyze and deferred paid generation while preserving current behavior.

Current behavior remains:

- Analyze still generates the current full `ProductResult` shape.
- `normalized_result_json` still includes `paid_result`.
- Result pages still render through the existing full-result path.
- Unlock and LINE fulfillment behavior are unchanged.
- No deferred paid generation, worker, payment, or LINE behavior switch was introduced.

## 2. Schema Changes

Added migration:

```text
apps/web/drizzle/0005_two_tier_phase_1.sql
```

Additive changes:

- `analysis_requests.user_context_json jsonb`
- new `analysis_paid_results` table

Updated Drizzle schema:

- `analysisRequests.userContextJson`
- `analysisPaidResults`
- relations from `analysisResults` and `unlockIntents` to paid-result records

## 3. analysis_paid_results Design

The new table stores a separated paid-result lifecycle seam:

- source analysis result
- module/theme dimensions
- paid result JSON
- lifecycle status
- optional unlock intent link
- prompt/schema/model metadata
- started/completed/failed timestamps
- retry count
- retention expiry

Phase 1 status usage:

```text
completed
```

for shadow records copied from the current synchronous analyze output.

Future status usage:

```text
pending
processing
completed
failed
expired
```

## 4. user_context_json Design

`analysis_requests.user_context_json` persists validated context chips for later deferred paid generation.

Stored values come from existing validated/normalized context only:

- `relationshipStage`
- `userGoal`
- `primaryPain`
- `replyTone`

Unknown context keys are still rejected by current input validation and are not stored.

No context values were added to event metadata.

## 5. Service / Repository Helpers

Added:

```text
apps/web/src/lib/db/paid-results.ts
```

Helpers:

- `createPaidResultRecord`
- `createCompletedPaidResultShadowRecord`
- `getPaidResultForAnalysisResult`
- `markPaidResultProcessing`
- `markPaidResultCompleted`
- `markPaidResultFailed`

These helpers are intentionally small. They do not implement deferred generation or background jobs.

## 6. Free/Paid Adapter Helpers

Added:

```text
apps/web/src/lib/modules/result-adapters.ts
```

Helpers:

- `extractFreeResult`
- `extractPaidResult`
- `combineFreeAndPaidForLegacyDisplay`
- `adaptLegacyProductResult`

Purpose:

- Provide the compatibility seam for future free-only result contracts.
- Keep current full `ProductResult` render behavior intact.

## 7. Analyze Behavior Compatibility

Analyze behavior is unchanged from a user/API perspective:

- Same endpoint.
- Same request shape.
- Same response shape.
- Same prompt/schema/model path.
- Same full `ProductResult` persisted to `analysis_results.normalized_result_json`.
- Same result route and unlock route behavior.

The only runtime additions are:

- storing validated `user_context_json` on fresh request records
- best-effort shadow copy of `paid_result` into `analysis_paid_results` after successful fresh analyze

Cache-hit behavior is unchanged and does not backfill shadow paid records.

## 8. Shadow Write Behavior

Shadow write implemented for fresh analyze only:

```text
successful provider result
→ create analysis_results row
→ extract paid_result
→ best-effort insert completed analysis_paid_results row
```

Safety behavior:

- Shadow write failure is caught.
- Current full-result analyze response is not blocked by shadow write failure.
- Cache-hit backfill is deferred.

## 9. Retention Implications

`analysis_paid_results.retention_expires_at` is populated with the same retention horizon used for the source analysis result in fresh analyze.

Deferred cleanup:

- Scheduled retention cleanup must include `analysis_paid_results` before broader traffic or deferred paid generation ships.
- Existing retention cleanup was not changed in this task.

## 10. Tests Added

Added/updated tests for:

- migration includes `analysis_paid_results`
- migration includes `analysis_requests.user_context_json`
- schema includes new table/fields
- current analyze response remains unchanged
- validated user context is persisted on fresh analyze request records
- cache hits do not create shadow paid result records
- fresh analyze creates a completed shadow paid result record
- current full result can be split/recombined through adapters
- repository helper seam exists for future lifecycle wiring

## 11. Migration / Rollout Notes

This migration was created but not applied to production.

Before deploying this code to an environment that receives fresh analyze traffic, apply:

```text
apps/web/drizzle/0005_two_tier_phase_1.sql
```

The migration is additive:

- nullable `user_context_json`
- new table
- new indexes
- no data rewrite
- no existing behavior switch

## 12. Known Limitations

- No free-only analyze behavior yet.
- No deferred paid generation yet.
- No worker/queue/cron paid processor yet.
- No LINE bind/webhook pending behavior yet.
- Cache-hit shadow backfill is deferred.
- Retention cleanup for `analysis_paid_results` is deferred.

## 13. Recommended Next Step

Run a migration live-verification task for staging:

```text
Two-tier Phase 1 Migration Live Verification v0
```

Then proceed to Phase 2 planning/implementation for free-only analyze behind a staging feature flag.
