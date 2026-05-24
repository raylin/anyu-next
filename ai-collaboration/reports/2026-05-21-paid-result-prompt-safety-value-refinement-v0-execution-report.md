# Paid Result Prompt Safety / Value Refinement v0 Execution Report

## Summary

Implemented focused paid-result safety/value refinement. The work adds prompt v0.4, schema v2, runtime semantic validation, stronger reply strategy fields, tests, and a synthetic staging review. Production and LINE production behavior were not changed.

## Files Created

- `ai-collaboration/handoffs/2026-05-21-paid-result-prompt-safety-value-refinement-v0-handoff.md`
- `ai-collaboration/research/2026-05-21-paid-result-prompt-safety-value-refinement-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-21-paid-result-prompt-safety-value-refinement-v0-execution-report.md`
- `apps/web/src/lib/ai/assets/product_result_schema_v2.json`
- `apps/web/src/lib/ai/paid-result-semantic-validation.ts`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`
- `apps/web/src/content/modules/ai-temperature.ts`
- `apps/web/src/lib/ai/assets/product_result_prompt_v0.md`
- `apps/web/src/lib/ai/product-result-schema.ts`
- `apps/web/src/lib/ai/repo-paths.ts`
- `apps/web/src/lib/ai/validate-product-result.ts`
- `apps/web/src/lib/modules/demo-result.ts`
- `apps/web/src/lib/runtime/retention-cleanup.ts`
- `apps/web/src/app/m/[moduleSlug]/unlock/[unlockToken]/page.tsx`
- related tests

## Prompt Refinements

- Bumped prompt to `product_result_prompt_v0.4`.
- Added stronger paid-result depth target: 1,800–2,800 Traditional Chinese characters.
- Added guidance against overclaiming, clinical language, manipulation, and the problematic phrase pattern found in staging.
- Added explicit requirements for v2 reply-strategy fields.

## Semantic Validation

Added post-parse paid-result semantic validation for schema v2:

- forbidden substrings
- minimum structural sections
- minimum copyable message count
- concrete next48HourPlan
- non-empty summaryCard
- non-empty avoidDoing and softInsight
- aggregate paid-result text length threshold of 1,200 chars

Provider outputs that fail semantic validation are treated as invalid and follow the existing safe provider failure path.

## Value Improvements

- Schema v2 requires reply `tone`, `possibleReaction`, and `followUpIfTheyReply`.
- Unlocked route now renders those fields when present.
- Demo fixture was expanded to pass the new paid-value threshold.

## Tests Added

- Paid-result semantic validation rejects forbidden phrasing.
- Paid-result semantic validation rejects insufficient strategy/message/plan/summary depth.
- Valid paid result v2 passes.
- Schema v2 path resolves.
- Cache and route fixtures use prompt v0.4 / schema v2.

## Staging Review Status

Passed.

Staging synthetic review verified:

- prompt version `product_result_prompt_v0.4`
- schema version `product_result_schema_v2`
- 3 states / 3 signal dives / 3 reply strategies
- 6 copyable messages
- v2 strategy fields present
- paid-result JSON length 2,246 chars
- forbidden substring scan false
- repeat same input/context returned cache hit
- event metadata did not include raw context values, paid result text, or operational secret markers

## Validation Results

- `python3 -m compileall oradar` passed.
- `python3 -m compileall tools/topic-ingestion` passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed, 25 tests.
- `corepack pnpm lint` passed.
- `corepack pnpm test` passed, 24 files / 104 tests.
- `corepack pnpm build` passed.
- `corepack pnpm test:e2e:local` passed, 9 Playwright tests.

## Known Technical Debt

- Semantic validation is conservative substring/structure matching, not policy classification.
- Automatic retry on semantic validation failure is not implemented.

## Tech Debt Review

### New Technical Debt Introduced

- None. The conservative validator is intentionally scoped for v0 safety.

### Existing Technical Debt Observed

- Copyable paid messages still do not have dedicated copy buttons.
- Legacy paid-result display adaptation remains approximate.

### Opportunistic Cleanup Completed

- Added schema v2 resolver support.
- Rendered v2 reply-strategy detail fields on the unlocked route.

### Deferred Cleanup Candidates

- Add one safe retry on semantic validation failure if staging shows frequent provider near-misses.
- Add copy affordance for each unlocked reply message.

### Recommended Follow-up

Proceed to Landing / Share Title Hierarchy Polish v0.

## Deviations From Handoff

- Schema version was bumped to v2 because reply-strategy shape changed materially.
- Cache key version stayed `v2`; prompt/schema versions already participate in the cache hash.

## Git Commit

- Implementation commit already pushed: `d754dfb`
- Final docs/report commit pending at report-write time

## Staging Push

- Implementation commit pushed to `origin/staging`
- Final docs/report commit pending at report-write time

## Remaining Uncertainties

- Whether semantic validation should eventually retry once instead of failing safe.
- Whether one staging sample is enough for tone calibration or ChatGPT wants another sample.

## Recommended Next Step

Proceed to Landing / Share Title Hierarchy Polish v0, unless another paid-result tone sample is requested first.
