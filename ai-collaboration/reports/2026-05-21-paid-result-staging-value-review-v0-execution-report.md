# Paid Result Staging Value Review v0 Execution Report

## Summary

Ran a staging value review for paid result v1 using synthetic-safe input and context. The review initially exposed a context allowlist mismatch and a likely output-budget/runtime stability issue. I applied targeted fixes, refreshed staging, reran the review, and verified structure, cache behavior, unlocked rendering, paid preview copy, and privacy metadata.

## Files Created

- `ai-collaboration/handoffs/2026-05-21-paid-result-staging-value-review-v0-handoff.md`
- `ai-collaboration/research/2026-05-21-paid-result-staging-value-review-v0.md`
- `ai-collaboration/reports/2026-05-21-paid-result-staging-value-review-v0-execution-report.md`
- `apps/web/src/lib/ai/assets/product_result_schema_v1.json`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`
- `apps/web/src/lib/ai/repo-paths.ts`
- `apps/web/src/lib/ai/validate-product-result.ts`
- `apps/web/src/lib/ai/runtime.ts`
- `apps/web/src/lib/ai/provider.ts`
- `apps/web/src/lib/modules/ai-temperature-context.ts`
- `apps/web/src/lib/ai/assets/product_result_schema_v0.json`
- `apps/web/src/lib/ai/assets/product_result_prompt_v0.md`
- `apps/web/src/lib/modules/demo-result.ts`
- `apps/web/src/components/anyu/PaidPreviewCard.tsx`
- `apps/web/src/components/modules/ai-temperature/AiTemperatureResult.tsx`
- related tests and local Playwright smoke

## Staging Review Status

Passed after targeted stabilization and staging refresh.

Staging target:

- `https://staging.anyu.tw`
- refreshed preview deployment: `anyu-next-jzjk40g10-studioanyu-1488s-projects.vercel.app`

Production was not touched.

## Paid Result Value Findings

- v1 structure was present and rendered on the unlocked route.
- The result is materially richer than the free result.
- Copyable messages are present and usable.
- The reviewed primary paid-result JSON was approximately 1,728 characters, slightly below the rough 1,800+ target.
- One generated guardrail used a phrase from the prompt's forbidden substring list, so the prompt/validator needs one more safety refinement pass.

## Context / Cache Findings

- The first deployed allowlist rejected the handoff's recommended context values. This was fixed.
- Same text + same context produced a cache hit on repeat and reused the same result.
- Same text + different context produced a cache miss and a different result.
- Event metadata stored context status as boolean/count only and did not include context values.

## Opportunistic Cleanup

- Added a separate `product_result_schema_v1.json`.
- Restored v0 schema content to the v0 file.
- Added version-aware schema resolution.
- Raised Anthropic max output tokens to fit the richer paid-result JSON.
- Updated paid preview copy to match the richer paid-result package.

## Tests Added

- Schema v1 path resolution test.
- Updated context validation test for the handoff's review context values.
- Updated local Playwright smoke to click the revised context chip.
- Updated paid preview/result tests for richer-value copy.

## Validation Results

- `python3 -m compileall oradar` passed.
- `python3 -m compileall tools/topic-ingestion` passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed, 25 tests.
- `corepack pnpm lint` passed.
- `corepack pnpm test` passed, 24 files / 98 tests.
- `corepack pnpm build` passed.
- `corepack pnpm test:e2e:local` passed, 9 Playwright tests.

## Known Technical Debt

- The prompt forbids certain substrings but runtime validation does not yet enforce that semantic rule.
- Copyable messages are rendered as list items, not with an explicit copy affordance.

## Tech Debt Review

### New Technical Debt Introduced

- None beyond the known prompt semantic-validation gap documented above.

### Existing Technical Debt Observed

- Paid result safety constraints are prompt-only.
- Legacy paid-result compatibility is approximate because old rows do not contain v1 section boundaries.

### Opportunistic Cleanup Completed

- Version-aware schema file resolution.
- Paid preview value-copy update.
- Context allowlist alignment with review inputs.

### Deferred Cleanup Candidates

- Add product-result semantic validation for forbidden substrings.
- Add copy buttons or clearer copy affordance for paid reply messages.

### Recommended Follow-up

Run a focused paid-result prompt safety/value refinement pass before treating v1 as monetization-ready.

## Deviations From Handoff

- Added a targeted stabilization commit before completing the staging review because current staging could not accept the recommended context values and the first accepted generation failed.
- Refreshed the staging alias to a new preview deployment; production remained untouched.

## Git Commit

- Stabilization commit already pushed: `71026c0`
- Final review commit: pending at report-write time

## Staging Push

- Stabilization commit pushed to `origin/staging`
- Final review commit pending at report-write time

## Remaining Uncertainties

- Whether semantic validation should reject forbidden substrings with a provider retry or fail fast.
- Whether the paid-result length target should be enforced in prompt or validator.

## Recommended Next Step

Run paid-result prompt safety/value refinement, then proceed to Landing / Share Title Hierarchy Polish v0.
