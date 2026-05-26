# Two-tier Phase 2A Free-only Analyze Compatibility v0 Execution Report

## Summary

Implemented the first two-tier behavior switch for Module 01: initial analyze now generates a free-only result using a dedicated prompt/schema. Result, unlock, LIFF, cache, and legacy full-result compatibility were updated and verified on staging.

## Files Created

- `ai-collaboration/handoffs/2026-05-25-two-tier-phase-2a-free-only-analyze-compatibility-v0-handoff.md`
- `ai-collaboration/research/2026-05-25-two-tier-phase-2a-free-only-analyze-compatibility-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-25-two-tier-phase-2a-free-only-analyze-compatibility-v0-execution-report.md`
- `apps/web/src/lib/ai/assets/product_result_prompt_free_v0.md`
- `apps/web/src/lib/ai/assets/product_result_schema_free_v1.json`

## Files Updated

- `apps/web/src/content/modules/ai-temperature.ts`
- `apps/web/src/lib/ai/product-result-schema.ts`
- `apps/web/src/lib/ai/paid-result-semantic-validation.ts`
- `apps/web/src/lib/ai/prompt.ts`
- `apps/web/src/lib/ai/repo-paths.ts`
- `apps/web/src/lib/ai/runtime.ts`
- `apps/web/src/lib/modules/ai-temperature-ui.ts`
- `apps/web/src/app/m/[moduleSlug]/unlock/[unlockToken]/page.tsx`
- `apps/web/src/tests/analyze-route-cache.test.ts`
- `apps/web/src/tests/product-result-validation.test.ts`
- `apps/web/src/tests/repo-paths.test.ts`
- `apps/web/src/tests/two-tier-phase-1-seams.test.ts`
- `ai-collaboration/summaries/summary_log.md`

## Behavior Changes

- Fresh Module 01 analyze uses `product_result_prompt_free_v0.1` and `product_result_schema_free_v1`.
- Fresh Module 01 analyze stores a free-only result without `paid_result`.
- The current unlock intent flow still creates an intent and delivery link, but unlocked route shows pending copy if paid content is absent.
- Legacy full results with `paid_result` continue to render normally.

## Prompt / Schema Changes

- Added a free prompt that explicitly excludes paid-result generation.
- Added a free schema that excludes `paid_result`.
- Existing paid-result v2 schema/prompt remain available for legacy/future paid generation.
- Paid-result semantic validation remains active for v2 and does not run for the free schema.

## Result / Unlock / LINE Compatibility

- Result page handles missing paid content.
- Paid preview remains visible.
- Unlock intent works for free-only result.
- Unlocked route handles missing paid content with an honest pending state.
- LIFF route loads.
- LINE webhook and LIFF security behavior were not changed.

## Cache Changes

- Cache key already includes prompt/schema versions.
- New free prompt/schema versions separate free-only cache entries from older full-result entries.
- Staging repeat request returned cache hit.

## Tests Added

- Free-only schema validation without `paid_result`.
- Analyze route free-only persistence and no shadow paid-result write.
- Free prompt/schema path resolution.
- Existing full-result validation and adapter tests remain.

## Staging Review Status

- Staging deployment: `dpl_BzNUydTQxi8to9RdbjC6uApjAfwU`.
- Alias: `https://staging.anyu.tw`.
- Fresh analyze: HTTP 200.
- Result page: HTTP 200.
- Unlock intent: HTTP 200.
- Unlocked route: HTTP 200 with pending copy.
- LIFF page: HTTP 200.
- Shadow paid-result row for free-only result: absent, as intended.
- `user_context_json`: persisted with 4 allowlisted fields.
- Event metadata: operational keys only.

## Latency Results

- Fresh staging analyze latency: about `20.7s`.
- Prior full paid-result baseline: roughly `60-70s`.
- Repeat cache-hit latency: about `1.5s`.

## Validation Results

- `python3 -m compileall oradar`: passed.
- `python3 -m compileall tools/topic-ingestion`: passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`: passed, 25 tests.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed, 120 tests.
- `cd apps/web && corepack pnpm build`: passed.
- `cd apps/web && corepack pnpm test:e2e:local`: passed, 9 tests.

## Known Technical Debt

- Deferred paid-result generation is not implemented.
- Unlocked route pending copy is a compatibility stopgap until paid generation is wired.

## Tech Debt Review

### New Technical Debt Introduced

- Pending unlocked state is temporary until Phase 2B/3 generation exists.

### Existing Technical Debt Observed

- LINE fulfillment can deliver an unlocked link before paid content is generated; the page is safe but not the final product behavior.

### Opportunistic Cleanup Completed

- Prompt/schema resolution now supports versioned free assets.

### Deferred Cleanup Candidates

- Add paid-result generation status display backed by `analysis_paid_results`.
- Backfill or generate paid result on unlock/LINE bind in the next phase.

### Recommended Follow-up

Implement deferred paid-result generation and connect unlock/LINE fulfillment to a real pending/completed lifecycle.

## Deviations From Handoff

- Production was not deployed. The handoff default recommended staging first, then ask before production.

## Git Commit

Pending at report creation time.

## Staging Push

Pending at report creation time.

## Remaining Uncertainties

- Exact paid generation trigger design remains for Phase 2B/3.
- Production latency should be verified only after explicit production approval.

## Recommended Next Step

Proceed to Phase 2B/3 deferred paid-result generation design/implementation.
