# Staging Analyze Provider Error Follow-up v0 Review Bundle

Date: 2026-05-26

## Scope

Investigated staging fresh analyze `provider_error` failures observed after the Phase 1 shadow paid-result migration. Scope was limited to the fresh analyze path, paid-result v2 validation, result persistence, context persistence, and the best-effort shadow paid-result write.

## Diagnosis Summary

- Existing failed staging request records only persisted `provider_error` with generic `provider` category, so the exact provider subcause from those historical failures was not recoverable from database state.
- The failed records were before result persistence and had no linked analysis result.
- `analysis_requests.user_context_json` had persisted on the failed records, which confirmed request creation and context persistence occurred before the failure.
- Code inspection confirmed `analysis_paid_results` shadow writes are best-effort and wrapped in `try/catch`; they cannot cause analyze failure.
- Code inspection found a concrete retry-classification gap: `PaidResultSemanticValidationError` was not treated as output validation, so guarded retry/fallback could misclassify semantic/schema output failures as provider errors.

## Hotfix

- Classified `PaidResultSemanticValidationError` as an output-validation error in the runtime retry classifier.
- Added sanitized internal failure categorization so future output-validation failures persist `error_category = output_validation` while the public response remains `provider_error`.
- Preserved the current paid-result v2 shape and did not change prompt/schema, LINE, payment, email, ads, or production behavior.

## Staging Verification

- Final staging deployment: `dpl_76uNTwRNMrFuBtRnoPhwQZ4fj5P7`
- Staging alias: `staging.anyu.tw`
- Exact requested synthetic case returned HTTP 200 from cache, so it did not verify fresh persistence.
- A near-identical synthetic fresh request returned HTTP 200 with `cacheHit = false`.
- Fresh request record status: completed.
- Fresh request context persistence: present with 4 allowlisted context fields.
- Fresh result shape: both `free_result` and `paid_result` present.
- Shadow paid-result row: created with completed status.
- Result page: HTTP 200.
- Unlock intent: HTTP 200.
- Unlocked route: HTTP 200.

## Privacy/Safety Check

- No raw input, provider output, `paid_result_json`, secrets, or tokenized URLs are included in this bundle.
- Event metadata key inspection showed only expected operational keys, not raw source text or provider output.

## Production Status

- Production was not deployed.
- Production migration `0005` remains pending.
