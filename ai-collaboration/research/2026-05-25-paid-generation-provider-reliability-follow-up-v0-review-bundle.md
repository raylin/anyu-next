# Paid Generation Provider Reliability Follow-up v0 Review Bundle

Date: 2026-05-25

## 1. Summary

This follow-up tightened the deferred paid-generation provider path after Phase 2B. The implementation now normalizes a common provider wrapper shape, retries provider output-validation failures once before fallback, records safe provider/fallback source metadata, and keeps fallback as a fail-safe.

The task is not fully successful as a provider-reliability fix: staging still completed the final smoke through fallback with `fallbackReason: output_validation`. User-facing paid generation still completed, but provider generation is not reliable enough to treat as the primary paid-result source.

Production was not deployed.

## 2. Phase 2B Issue Recap

Phase 2B proved the deferred paid-generation lifecycle, but staging paid generation completed through `paid_template_fallback_v0` rather than provider output. The concern was that fallback is less personalized and should not become the intended primary paid result.

## 3. Root Cause Analysis

Confirmed safe symptoms:

- Provider path can complete in staging, observed once with model `claude-haiku-4-5-20251001`.
- Final staging smoke still fell back with safe metadata `fallbackReason: output_validation`.
- The paid request completed in about 55.6s when fallback was used, consistent with provider attempt plus retry before fallback.
- Pulled local preview env did not provide usable provider secrets, so a local raw-output probe could not be run.

Most likely remaining blocker:

- Provider output is still failing schema or semantic validation for common synthetic cases.
- Raw provider output was intentionally not printed or stored, so the exact field-level mismatch remains unknown.

## 4. Fixes Applied

- Added wrapper normalization for provider output shaped as `{ paid_result: ... }`.
- Tightened the paid prompt with an explicit JSON skeleton and exact field names.
- Clarified that each reply strategy should include exactly two copyable messages.
- Added one provider retry for output-validation failures before fallback.
- Lowered semantic aggregate text floor from 1,200 to 900 characters to match compact paid-result prompt targets.
- Added safe source metadata for completed paid-generation events.
- Added `fallbackReason` metadata for fallback completions.

## 5. Provider vs Fallback Behavior

Provider behavior:

- Provider path stores the actual provider model and emits `source: provider`.
- One staging smoke before the final fallback-reason change produced a provider row with model `claude-haiku-4-5-20251001`.

Fallback behavior:

- Fallback remains available after provider/runtime/output-validation failure.
- Final staging smoke completed via fallback with `fallbackReason: output_validation`.
- Fallback still validates against schema and semantic checks before storage.

## 6. Prompt / Schema / Validation Changes

Prompt changes:

- Added explicit JSON skeleton.
- Repeated no-wrapper/no-extra-keys requirement.
- Made copyable message count unambiguous.
- Aligned compact output target to 900-1,500 Traditional Chinese characters.

Schema changes:

- No schema changes.

Validation changes:

- Kept hard safety and structure checks.
- Reduced aggregate text minimum to avoid rejecting compact but complete provider-style output.

## 7. Tests Added

Added tests for:

- provider success path storing provider model and `source: provider`
- output-validation retry before fallback
- fallback use only after retry failure
- fallback model marker
- fallback source/reason event metadata
- wrapped provider output under `paid_result`
- compact semantic depth threshold

## 8. Staging Provider Smoke

Sanitized staging observations:

- Case B earlier smoke: paid row completed with provider model `claude-haiku-4-5-20251001`.
- Final smoke after all changes: analyze HTTP 200, unlock HTTP 200, paid request HTTP 200 completed, repeat request reused completed row, unlocked page rendered paid content.
- Final DB verification: paid row completed, paid JSON present, retention set, model `paid_template_fallback_v0`.
- Final event metadata: `source: fallback`, `fallbackReason: output_validation`, operational IDs/status/elapsed/retry only.

Provider path status: partial / not reliable enough.

Fallback status: working as fail-safe.

## 9. Event / Privacy Verification

Verified event metadata used only safe operational fields:

```text
resultId
unlockIntentId
status
source
fallbackReason
elapsedMs
retryCount
```

No raw input, provider output, paid JSON dump, secrets, LINE IDs, fulfillment codes, unlock tokens, or tokenized URLs were recorded in reports.

## 10. Known Limitations

- Final staging smoke still used fallback.
- Exact provider mismatch remains unknown because raw provider output is intentionally not logged or committed.
- No production deployment was performed.
- Paid generation remains synchronous in the request route.

## 11. Recommended Next Step

Do not proceed to Phase 3 as if provider generation is fully stable. Run a targeted provider-output diagnostic in a secure environment that can inspect raw provider output transiently, summarize only field-level failure categories, then either refine the prompt/schema adapter or add a non-persistent validation-debug mode.
