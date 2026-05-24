# Paid Result Staging Value Review v0

Date: 2026-05-21

## 1. Summary

Staging review passed after a targeted stabilization fix and fresh staging deployment. The paid result v1 now renders as a materially richer unlocked package than the free result, with multiple structured decision-support sections and directly usable reply messages.

The review also found two issues:

- The first deployed context allowlist did not accept the handoff's recommended context values.
- One generated guardrail used a phrase from the prompt's forbidden substring list, so prompt-safety enforcement still needs tightening.

## 2. Staging Target

- Target: `https://staging.anyu.tw`
- Deployment inspected after refresh: `anyu-next-jzjk40g10-studioanyu-1488s-projects.vercel.app`
- Status: Ready
- Production was not touched.

## 3. Synthetic Inputs / Context Used

Synthetic input A was used. It described a safe fictional ambiguous-relationship situation involving slower replies, story views, and occasional low-stakes life updates.

Context A used:

- relationship stage: ambiguous / early romantic uncertainty
- user goal: deciding how to reply
- primary pain: slower replies
- reply tone: bounded but not cold

A second cache probe used the same synthetic input with a different goal/tone context to verify cache separation.

## 4. Paid Result Structure Verification

Verified against the staging stored v1 result:

- `fullSummary`: present
- `possibleStates`: 3
- `signalDeepDive`: 3
- `replyStrategies`: 3
- copyable messages: 6 total
- `next48HourPlan`: 5 items
- `avoidDoing`: 5 items
- `softInsight`: present
- `summaryCard`: present

The unlocked HTML contained the expected section headings:

- deeper signal
- possible states
- reply strategy
- risk guardrail
- next 48 hours
- summary card

Approximate paid-result JSON text length for the primary reviewed result was 1,728 characters. This is close to, but slightly below, the requested rough 1,800+ target.

## 5. Free vs Unlocked Value Difference

The unlocked result is materially richer than the free result:

- Free result gives a score, state label, observed signals, and a short insight.
- Unlocked result adds plausible state framing, signal explanation, concrete reply paths, short copyable messages, immediate 48-hour actions, avoid-doing guardrails, and a summary card.

Value judgment: useful enough for a staging value pass, but still needs one more prompt calibration pass before being treated as a strong NT$49 package.

## 6. Context Influence Review

Context influence was visible:

- Slower-reply context made the deep dive and 48-hour plan focus on observation cadence and low-pressure follow-up.
- Reply-tone context influenced reply copy toward bounded, lower-pressure options.
- Different context with the same text generated a different result and state label instead of reusing the prior cache entry.

Remaining issue: the first implementation's allowlist did not accept the handoff's recommended context values. This was fixed before the successful staging review.

## 7. Cache Behavior Review

Observed staging behavior:

- same text + same context first call: `cacheHit: false`
- same text + same context repeat call: `cacheHit: true`, same result reused
- same text + different context: `cacheHit: false`, different result generated

This confirms context dimensions are included in the cache key and the old cache version is not being reused for v1 paid results.

## 8. Unlocked Route Review

Unlocked route review passed:

- valid unlocked route loaded rich paid result v1
- old thin paid results remain covered by local compatibility tests
- invalid token route returned the safe "link unavailable" state
- no provider call is made by the unlocked route code path
- section order is understandable, but reply-message copy affordance could still be improved

## 9. Paid Preview Review

Paid preview was updated to better communicate the richer value:

- 3 next-reply options
- 3 possible states
- 48-hour observation strategy
- collectible summary card

The preview still does not reveal full paid content or make real-payment claims.

## 10. Safety / Legal Review

Pass with one important caveat.

Positive:

- Output preserved uncertainty.
- It did not diagnose a mental state as fact.
- It did not tell the user to stay or leave.
- It did not make therapy, legal, or safety claims.

Caveat:

- One generated guardrail used a phrase that appears in the prompt's forbidden substring list. This should be addressed with stricter semantic validation or another prompt calibration pass.

## 11. Event / Privacy Review

Event metadata review passed:

- context status was recorded as boolean/count fields
- raw context values were not found in event metadata
- forbidden operational markers were not found in event metadata
- unlock/contact events did not expose unlock tokens or fulfillment codes in metadata

## 12. Opportunistic Fixes Applied

- Added `product_result_schema_v1.json`.
- Restored `product_result_schema_v0.json` to the legacy v0 schema.
- Added version-aware schema resolution.
- Aligned context chip allowlist with the staging review inputs.
- Raised Anthropic output token budget for the richer JSON contract.
- Updated paid preview copy to reflect the richer paid result package.
- Added tests for schema v1 resolution and updated context/UI tests.

## 13. Remaining Issues

- Add semantic validation for forbidden product-result substrings or run one more prompt calibration pass.
- Primary reviewed result was slightly below the rough 1,800+ character target.
- Copyable messages are visible as list items, but not yet presented with a dedicated copy affordance.

## 14. Recommendation

Do not treat paid result v1 as final yet. It is a meaningful upgrade and good enough for continued staging iteration, but it needs one safety/value refinement pass before production-facing monetization.

## 15. Recommended Next Step

Run a focused paid-result prompt safety/value refinement pass, then proceed to Landing / Share Title Hierarchy Polish v0 after the paid result package is stable.
