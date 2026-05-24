# Paid Result Prompt Safety / Value Refinement v0 Review Bundle

Date: 2026-05-21

## 1. Summary

Paid result safety/value refinement passed. The implementation now uses prompt version `product_result_prompt_v0.4` and schema version `product_result_schema_v2`, adds runtime semantic validation for paid-result depth and forbidden phrasing, and verifies staging output with synthetic-safe input.

Production, LINE production, payment, email, ads, and title hierarchy were not changed.

## 2. Issues From Staging Value Review

Issues addressed:

- One generated guardrail used a forbidden phrase.
- The reviewed paid result was slightly below the rough 1,800+ character target.
- Forbidden paid-result substrings were prompt-only and not runtime-enforced.
- Reply strategies needed clearer tactical fields beyond message examples.

## 3. Prompt Safety Refinements

Prompt v0.4 now emphasizes:

- possible states instead of certainty
- low-pressure reply and observation language
- no mind-reading or diagnosis as fact
- no manipulative importance games
- no clinical, shaming, or overclaiming phrasing
- explicit avoidance of the staging-found problematic phrase pattern

The final self-check list was expanded with additional forbidden phrasing.

## 4. Semantic Validation

Added runtime semantic validation after JSON schema validation.

Checks include:

- forbidden paid-result substrings
- at least 3 possible states
- at least 3 signal deep dives
- at least 3 reply strategies
- at least 6 total copyable messages
- concrete next-48-hour plan
- non-empty avoid list
- non-empty soft insight
- non-empty summary card
- aggregate paid-result text length at least 1,200 characters

Failure behavior:

- Provider output is treated as invalid.
- The analyze route returns the existing safe provider failure path.
- No raw provider output or validation text is written into events.

## 5. Content Depth / Value Improvements

The target is now explicit in prompt guidance:

- 1,800–2,800 Traditional Chinese characters
- 7–9 structured paid sections
- 3 possible states
- 3 signal deep dives
- 3 reply strategies
- 6–9 copyable messages
- concrete next 24/48-hour plan
- concrete summary card

Runtime uses a softer aggregate threshold of 1,200 characters to avoid false failures while still rejecting thin paid results.

## 6. Reply Strategy Improvements

Schema v2 requires each reply strategy to include:

- `label`
- `tone`
- `whenToUse`
- `whyItWorks`
- `possibleReaction`
- `followUpIfTheyReply`
- `copyableMessages`

The unlocked route renders the new tone/reaction/follow-up fields when present.

## 7. Prompt / Schema / Cache Versioning

- Prompt version: `product_result_prompt_v0.4`
- Schema version: `product_result_schema_v2`
- Cache key version remains `v2`

Because prompt/schema versions are included in the cache key payload, new v0.4/v2 results do not reuse older v0.3/v1 paid results.

## 8. Tests Added

Added or updated tests for:

- semantic validation rejecting forbidden paid phrasing
- insufficient reply strategies
- insufficient copyable messages
- insufficient next48HourPlan depth
- missing summaryCard depth
- valid paid result v2 fixture passing
- v2 schema path resolution
- prompt/schema version updates in cache and route fixtures
- legacy paid result adaptation still passing

## 9. Staging Synthetic Review

Staging target:

- `https://staging.anyu.tw`
- refreshed preview deployment for implementation commit `d754dfb`

Synthetic-safe review result:

- analyze completed
- prompt version: `product_result_prompt_v0.4`
- schema version: `product_result_schema_v2`
- 3 possible states
- 3 signal deep dives
- 3 reply strategies
- 6 total copyable messages
- v2 strategy fields present
- 4 next-48-hour plan items
- 4 avoid-doing items
- paid-result JSON length: 2,246 chars
- forbidden substring scan: none found
- same input/context repeat returned cache hit
- event metadata contained context booleans/counts only, not raw context values or paid result text

## 10. Remaining Limitations

- Semantic validation is conservative substring matching, not full policy classification.
- It fails safe without automatic retry; retry can be added later if staging shows avoidable provider failures.
- Copyable messages still do not have dedicated copy buttons.

## 11. Recommended Next Step

Proceed to Landing / Share Title Hierarchy Polish v0, unless ChatGPT wants one more staging sample for paid-result tone calibration.
