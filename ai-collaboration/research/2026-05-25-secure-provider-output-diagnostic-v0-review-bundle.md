# Secure Provider Output Diagnostic v0 Review Bundle

Date: 2026-05-25

## 1. Summary

Added a secure diagnostic path for deferred paid-generation provider validation failures. The diagnostic records only sanitized validation categories and counts, never raw provider output or paid JSON.

The staging diagnostic identified the provider failure as a parse failure before schema/semantic validation. After increasing the paid provider output budget, staging completed through the provider path without fallback.

Production was not deployed.

## 2. Diagnostic Method

The paid-result validator now throws a structured in-memory error with sanitized diagnostics:

- parse success/failure
- schema failure paths
- missing field paths
- invalid type paths
- array count summaries
- semantic category
- aggregate text length
- copyable message count

These diagnostics are attached only to fallback completion event metadata. They do not include raw provider output, raw input, paid JSON, secrets, tokens, LINE IDs, emails, or tokenized URLs.

## 3. Sanitized Root Cause

Staging diagnostic smoke showed:

- provider/fallback source: fallback
- fallback reason: `output_validation`
- diagnostic parse status: `failure`
- schema paths: none
- missing fields: none
- invalid type fields: none
- array counts: none
- aggregate text length: null
- copyable message count: null

Interpretation: the provider output failed before schema validation, consistent with malformed or truncated JSON rather than a field-level schema mismatch.

## 4. Fix Applied

Increased deferred paid-generation provider output budget:

```text
PAID_RESULT_MAX_OUTPUT_TOKENS: 2,400 -> 3,600
```

Prompt remains compact and fallback remains a fail-safe.

## 5. Provider Path Verification

After the output budget fix, staging synthetic flow completed through provider:

- analyze: HTTP 200
- unlock intent: HTTP 200
- paid request: HTTP 200 completed
- repeat paid request: HTTP 200 completed reused
- unlocked route: HTTP 200 with paid-content marker
- DB paid model: `claude-haiku-4-5-20251001`
- event source: `provider`
- fallback used: no

## 6. Fallback Status

Fallback remains active for provider/runtime/output-validation failures. It was not used in the final staging verification after the fix.

## 7. Privacy / Safety Verification

No raw provider output, raw input, paid result JSON, full result JSON, secrets, LINE IDs, emails, fulfillment codes, unlock tokens, or tokenized URLs were recorded in repo artifacts.

Allowed safe metadata observed:

```text
source
status
resultId
unlockIntentId
elapsedMs
retryCount
```

## 8. Tests Added

Added/updated tests for:

- sanitized schema diagnostics
- wrapper normalization
- output budget floor
- fallback event metadata carrying sanitized diagnostics

## 9. Known Limitations

- Diagnostic metadata is event metadata, not a typed DB column.
- The route remains synchronous.
- Only one final synthetic staging case was verified after the output-budget fix.

## 10. Recommended Next Step

Proceed to Phase 3 planning only with the assumption that provider path is now verified for the staging synthetic case, while keeping fallback and source metadata active for continued monitoring.
