# Two-tier Phase 2A Free-only Analyze Compatibility v0 Review Bundle

Date: 2026-05-26

## 1. Summary

Module 01 analyze now uses a free-first prompt/schema for fresh initial results. The generated result omits `paid_result`, while result, unlock, LIFF, and legacy full-result paths remain compatible.

## 2. Behavior Switch

- Active Module 01 prompt version: `product_result_prompt_free_v0.1`.
- Active Module 01 schema version: `product_result_schema_free_v1`.
- Fresh analyze stores a free-only normalized result.
- Fresh analyze no longer creates a shadow `analysis_paid_results` row.
- Legacy/full results with `paid_result` remain supported.

## 3. Free Result Schema / Prompt

- Added a dedicated free-result schema without `paid_result`.
- Added a dedicated free-result prompt that asks only for free result, insight layer, paid preview, share card, personal pattern candidate, and metadata.
- Paid-result semantic validation does not run for the free schema.

## 4. Paid Result Missing/Pending Compatibility

- Product result typing now allows `paid_result` to be absent.
- Result-page view-model mapping falls back to `free_result.uncertainty_note` when paid content is missing.
- The unlocked route renders a pending state when paid content is absent instead of showing placeholder paid analysis.

## 5. Cache Behavior

- Cache input includes the new prompt/schema versions, so new free-only cache entries do not collide with legacy full-result cache entries.
- Staging repeat request returned a cache hit for the free-only result.
- Same input with different context remains covered by existing context-sensitive cache key behavior.

## 6. Result Page Compatibility

- Free sections render from the free-only payload.
- Paid preview continues to render locked value proposition copy.
- Legacy demo/full result path still uses full paid result data.

## 7. Unlock / LINE Compatibility

- Unlock intent still succeeds for free-only results.
- Unlocked route returns HTTP 200 and displays pending copy when paid content is absent.
- LIFF fulfillment route returned HTTP 200.
- LINE webhook/bind security behavior was not changed.

## 8. Backward Compatibility

- Legacy full results still validate against `product_result_schema_v2`.
- Legacy paid-result display normalization remains available.
- Existing demo result and Playwright smoke tests still pass.

## 9. Tests Added

- Free-only schema validation accepts results without `paid_result`.
- Analyze route cache-miss test now verifies free-only result persistence and no shadow paid-result write.
- Repo-path tests verify free prompt/schema assets.
- Existing route, cache, product-result, and Playwright tests passed.

## 10. Staging Review

- Staging deployment: `dpl_BzNUydTQxi8to9RdbjC6uApjAfwU`.
- `https://staging.anyu.tw` points to the refreshed deployment.
- Fresh staging analyze returned HTTP 200.
- Result page returned HTTP 200.
- Unlock intent returned HTTP 200.
- Unlocked route returned HTTP 200 and rendered pending copy.
- LIFF route returned HTTP 200.
- No `analysis_paid_results` shadow row was created for the free-only result.
- Event metadata keys remained operational and did not include raw input or result content.

## 11. Latency Findings

- Fresh staging analyze latency: about `20.7s`.
- Previous full paid-result production/staging baseline was roughly `60-70s`.
- Repeat request returned cache hit in about `1.5s`.

## 12. Known Limitations

- Deferred paid-result generation is not implemented yet.
- Unlock and LINE fulfillment can currently deliver a link whose unlocked page displays pending copy.
- Production was not deployed in this task.

## 13. Recommended Next Step

Implement Phase 2B/3 deferred paid-result generation and connect it to unlock/LINE fulfillment states.
