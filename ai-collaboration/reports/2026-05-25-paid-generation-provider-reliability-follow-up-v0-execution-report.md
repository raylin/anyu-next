# Paid Generation Provider Reliability Follow-up v0 Execution Report

## Summary

Implemented reliability improvements and safe diagnostics for deferred paid generation. The provider path is improved but not fully stabilized: final staging smoke still completed through fallback with `fallbackReason: output_validation`.

Production was not deployed.

## Files Created

- `ai-collaboration/handoffs/2026-05-25-paid-generation-provider-reliability-follow-up-v0-handoff.md`
- `ai-collaboration/research/2026-05-25-paid-generation-provider-reliability-follow-up-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-25-paid-generation-provider-reliability-follow-up-v0-execution-report.md`
- `apps/web/src/tests/paid-generation-service.test.ts`

## Files Updated

- `apps/web/src/lib/ai/assets/paid_result_prompt_v0.md`
- `apps/web/src/lib/ai/paid-result-generation.ts`
- `apps/web/src/lib/ai/paid-result-semantic-validation.ts`
- `apps/web/src/lib/modules/paid-generation-service.ts`
- `apps/web/src/tests/product-result-validation.test.ts`
- `ai-collaboration/summaries/summary_log.md`

## Root Cause

The confirmed safe root cause is provider output validation instability. Provider generation can complete, but common synthetic staging cases still sometimes fail validation and fall through to fallback. Final staging metadata identifies the fallback reason as `output_validation`.

The exact raw provider mismatch was not inspected or recorded because provider raw output must not be printed or committed.

## Fixes Applied

- Added normalization for provider output wrapped as `{ paid_result: ... }`.
- Tightened paid prompt with exact JSON shape and copyable-message counts.
- Added one same-model provider retry on output-validation failure.
- Preserved fallback only after provider/runtime/output-validation failure.
- Added completed-event `source` metadata.
- Added completed-event `fallbackReason` metadata for fallback completions.
- Lowered compact paid semantic text minimum from 1,200 to 900 characters.

## Provider Path Result

Partial.

Observed one staging provider-generated completion with model `claude-haiku-4-5-20251001` before the final fallback-reason metadata change. However, final staging smoke still completed through fallback, so this task should not be considered a complete provider-reliability fix.

## Fallback Path Result

Working.

Fallback completed final staging paid generation, stored validated paid content, preserved retention, and rendered paid content on the unlocked route. Final event metadata recorded `source: fallback` and `fallbackReason: output_validation`.

## Tests Added

Added coverage for:

- provider success path and `source: provider`
- retry on output-validation before fallback
- fallback after retry failure
- fallback model marker
- fallback source/reason event metadata
- wrapped provider output normalization
- compact semantic depth threshold

## Staging Smoke

Final sanitized staging smoke:

- fresh analyze: HTTP 200, cache miss, about 15.8s
- unlock intent: HTTP 200
- paid request: HTTP 200 completed, about 55.6s
- repeat paid request: HTTP 200 completed reused, about 1.5s
- unlocked route: HTTP 200, completed paid-content marker present
- DB verification: paid row completed, paid JSON present, retention set
- Source verification: fallback, not provider
- Safe fallback reason: `output_validation`

No production smoke was run.

## Validation Results

Passed:

- `python3 -m compileall oradar`
- `python3 -m compileall tools/topic-ingestion`
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`
- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm test:e2e:local`

## Known Technical Debt

Provider-output mismatch remains unresolved. The safe metadata now identifies fallback reason, but field-level provider validation failure still requires secure raw-output inspection or a sanitized validation-debug path.

## Tech Debt Review

### New Technical Debt Introduced

- Added `fallbackReason` as event metadata rather than a dedicated typed DB column.

### Existing Technical Debt Observed

- Provider paid generation remains synchronous and can take about 55s when retry plus fallback is needed.
- CLI preview deploys still need non-secret runtime env overrides to match branch-scoped staging model strategy.

### Opportunistic Cleanup Completed

- Prompt/schema adapter now accepts a common provider wrapper shape.
- Provider output-validation retry is explicit and covered by unit tests.

### Deferred Cleanup Candidates

- Add secure non-persistent provider validation diagnostics.
- Consider a typed paid-result source column if source needs operational querying.
- Move paid generation to background/polling before production LINE fulfillment scale.

### Recommended Follow-up

Run secure provider-output diagnostics and fix the exact field-level mismatch before treating provider path as primary.

## Deviations From Handoff

- Provider path was not fully stabilized.
- Production deployment was skipped.
- No LINE bind/webhook trigger was added.

## Git Commit

Pending.

## Staging Push

Pending.

## Remaining Uncertainties

- Exact raw provider mismatch remains unknown.
- It is unclear whether the main blocker is schema field shape, forbidden phrasing, aggregate depth, or another semantic check.

## Recommended Next Step

Create a secure provider-validation diagnostic that keeps raw output transient and records only sanitized field-level failure categories, then apply a second targeted prompt/adapter fix.
