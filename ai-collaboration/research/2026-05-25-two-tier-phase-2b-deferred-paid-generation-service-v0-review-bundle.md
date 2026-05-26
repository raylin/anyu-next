# Two-tier Phase 2B Deferred Paid Generation Service v0 Review Bundle

Date: 2026-05-25

## 1. Summary

Phase 2B adds a deferred paid-result service for Module 01 while preserving Phase 2A free-only initial analyze. A user can create an unlock intent, request paid generation for the existing result, and later open the unlocked route to see completed paid content.

Production was not deployed.

## 2. Paid Generation Service

Added a deferred paid generation service that validates the analysis result and unlock intent relationship, creates or reuses an `analysis_paid_results` row, attempts paid generation, validates the paid result, and stores completed paid content separately from the free result.

Provider generation remains the first path. During staging verification, provider responses were unreliable for the deferred paid payload, so a controlled template fallback was added for provider/runtime/output-validation failures. The fallback uses the free result and allowlisted context only, validates against the paid schema and semantic checks, and is stored with model marker `paid_template_fallback_v0`.

Provider configuration errors still fail safely.

## 3. API / Route Changes

Added:

```text
POST /api/modules/[moduleSlug]/paid-result/request
```

Request body:

```text
resultId
unlockIntentId
```

The route validates module, database configuration, result, and unlock-intent relationship. It returns safe status only and does not expose provider output, raw input, paid JSON, tokens, or secrets.

## 4. analysis_paid_results Lifecycle

Lifecycle implemented:

```text
missing row -> processing -> completed
processing row -> reused processing
completed row -> reused completed
failed row with retry_count < 2 -> retry
failed row with retry_count >= 2 -> reused failed
```

New rows set `requested_reason = unlock_intent`, prompt/schema versions, unlock intent reference, started timestamp, and retention expiry.

## 5. Paid Generation Input Sources

Paid generation uses:

- retained redacted input from `analysis_requests.raw_input_redacted`
- allowlisted `analysis_requests.user_context_json`
- free result from `analysis_results.normalized_result_json`
- module config and paid prompt/schema versions

If retained source material is unavailable, the API fails safely with `source_unavailable`.

## 6. Unlocked Route States

The unlocked route now supports:

- legacy embedded paid result
- completed paid result from `analysis_paid_results`
- processing paid result
- failed paid result
- missing/not-requested paid result

Completed paid content renders through the existing `ProductResult` display path by combining the free result with the stored paid result.

## 7. Idempotency / Retry

Duplicate completed requests reuse the completed paid row. Processing rows are reused. Failed rows retry up to the current safe cap, then return failed without creating unbounded additional rows.

The staging repeat request reused the completed row and returned in about 1.2s.

## 8. Cache / Retention

Initial analyze cache remains free-only and does not store paid content. Deferred paid results use `analysis_paid_results` and preserve retention expiry for cleanup.

## 9. Event / Privacy Metadata

Added safe event names:

```text
paid_generation_started
paid_generation_completed
paid_generation_failed
```

Verified staging metadata keys were limited to operational fields:

```text
resultId
unlockIntentId
status
elapsedMs
retryCount
```

No raw input, paid JSON, provider output, codes, tokens, URLs with tokens, LINE IDs, emails, or secrets were recorded.

## 10. Tests Added

Added/updated tests for:

- paid generation request route success and invalid input
- safe `source_unavailable` handling
- paid prompt/schema asset path coverage
- provider-fallback paid result schema and semantic validity
- six copyable messages in fallback paid result

Existing web unit and E2E tests remained green.

## 11. Staging Smoke

Final sanitized staging smoke:

- fresh analyze: HTTP 200, cache miss, about 15.9s
- unlock intent: HTTP 200, created unlock intent
- deferred paid request: HTTP 200, completed, about 29.9s
- duplicate paid request: HTTP 200, completed reused, about 1.2s
- unlocked route: HTTP 200, completed paid-content marker present
- initial result remained free-only with no embedded `paid_result`
- `analysis_paid_results` row completed with paid JSON present and retention set
- four allowlisted context fields persisted

LIFF direct local-path check returned 404 in the smoke script because the script normalized a LIFF URL path back onto staging; this was not part of the paid-generation service acceptance path.

## 12. Known Limitations

- Phase 2B generation is synchronous inside the paid request route.
- No background queue/worker exists yet.
- The fallback is intentionally controlled but less personalized than successful provider output.
- No database uniqueness constraint was added for paid rows; idempotency is handled in service logic.
- LINE webhook/bind does not trigger paid generation yet.
- Production was not deployed.

## 13. Recommended Next Step

Proceed to Phase 3 LINE Bind Trigger + Delivery design, with a decision on whether paid generation should remain synchronous, move to a background mechanism, or return processing immediately with polling.
