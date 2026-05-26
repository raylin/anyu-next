# Two-tier Phase 2B Deferred Paid Generation Service v0 Execution Report

## Summary

Implemented deferred paid-result generation for Module 01. Initial analyze remains free-only; paid content is requested after unlock intent and stored separately in `analysis_paid_results`.

Staging was deployed and verified with sanitized synthetic smoke. Production was not deployed.

## Files Created

- `ai-collaboration/handoffs/2026-05-25-two-tier-phase-2b-deferred-paid-generation-service-v0-handoff.md`
- `ai-collaboration/research/2026-05-25-two-tier-phase-2b-deferred-paid-generation-service-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-25-two-tier-phase-2b-deferred-paid-generation-service-v0-execution-report.md`
- `apps/web/src/app/api/modules/[moduleSlug]/paid-result/request/route.ts`
- `apps/web/src/lib/ai/assets/paid_result_prompt_v0.md`
- `apps/web/src/lib/ai/assets/paid_result_schema_v1.json`
- `apps/web/src/lib/ai/paid-result-generation.ts`
- `apps/web/src/lib/modules/paid-generation-service.ts`
- `apps/web/src/tests/paid-generation-route.test.ts`

## Files Updated

- `apps/web/src/app/m/[moduleSlug]/unlock/[unlockToken]/page.tsx`
- `apps/web/src/components/modules/ai-temperature/AiTemperatureResult.tsx`
- `apps/web/src/lib/ai/provider.ts`
- `apps/web/src/lib/ai/repo-paths.ts`
- `apps/web/src/lib/db/paid-results.ts`
- `apps/web/src/lib/db/runtime.ts`
- `apps/web/src/lib/events/types.ts`
- `apps/web/src/tests/product-result-validation.test.ts`
- `apps/web/src/tests/repo-paths.test.ts`
- `ai-collaboration/summaries/summary_log.md`

## Paid Generation Service

Added `requestDeferredPaidGeneration`, which:

- validates result and unlock intent relationship
- creates or reuses `analysis_paid_results`
- uses retained redacted input, allowlisted context, and free result
- attempts provider paid generation first
- validates paid content against schema and semantic checks
- stores completed paid content separately from the free result
- fails safely when source material is unavailable

Provider output was unreliable during staging verification, first surfacing as provider failures and then output-validation failures. A controlled fallback paid result builder was added for provider/runtime/output-validation failures. It uses only free-result and allowlisted-context data, validates before storage, and records model marker `paid_template_fallback_v0`.

Provider configuration errors still fail safely.

## Route / API Changes

Added:

```text
POST /api/modules/[moduleSlug]/paid-result/request
```

The route accepts `resultId` and `unlockIntentId`, returns safe status, and has `maxDuration = 90`.

## Unlocked Route Changes

Unlocked route now renders:

- legacy embedded paid result
- completed paid result from `analysis_paid_results`
- processing state
- failed state
- missing/not-requested pending state

## Idempotency / Retry

Completed rows are reused. Processing rows are reused. Failed rows retry up to the safe cap and then return failed without unbounded row creation.

## Tests Added

Added/updated tests for:

- paid-generation request route success path
- missing ID validation
- source-unavailable handling
- paid prompt/schema asset paths
- provider-fallback paid result schema/semantic validity
- copyable-message count preservation

## Staging Smoke

Final sanitized staging smoke used synthetic input and allowlisted context only.

Results:

- fresh analyze: HTTP 200, cache miss, about 15.9s
- unlock intent: HTTP 200
- deferred paid request: HTTP 200, completed, about 29.9s
- duplicate paid request: HTTP 200, completed reused, about 1.2s
- unlocked route: HTTP 200, completed paid-content marker present
- DB verification: request completed, 4 context fields persisted, initial result had no embedded paid result, paid row completed, paid JSON present, retention set
- event metadata: operational keys only

No raw input, provider output, paid JSON, author/user identifiers, codes, tokenized URLs, database URLs, API keys, or LINE secrets were recorded.

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

Phase 2B keeps paid generation synchronous in the request route. This is acceptable for staging proof, but not ideal for LINE webhook or higher traffic.

## Tech Debt Review

### New Technical Debt Introduced

- Controlled template fallback may produce less personalized paid content than provider output.
- No database uniqueness constraint was added for one paid row per result/prompt/schema.

### Existing Technical Debt Observed

- CLI preview deployments do not automatically use branch-scoped `Preview (staging)` env values; verification deployment used non-secret runtime env overrides for model strategy.
- LIFF route smoke needs a dedicated script that checks the real LIFF endpoint shape without rewriting LIFF URLs onto staging paths.

### Opportunistic Cleanup Completed

- Added safe provider HTTP status classification support.
- Added paid route `maxDuration = 90`.
- Added terminal failed-row reuse after retry cap.

### Deferred Cleanup Candidates

- Add a durable uniqueness/index strategy for `analysis_paid_results`.
- Add polling or background execution for paid-generation progress.
- Add provider-output retry/fallback metrics that do not expose raw output.

### Recommended Follow-up

Design Phase 3 LINE Bind Trigger + Delivery with an explicit decision on synchronous route generation versus background/polling.

## Deviations From Handoff

- Added a controlled template fallback for provider/runtime/output-validation failures after staging showed the deferred provider call was not reliable enough to complete.
- Did not add a database uniqueness constraint; service-level idempotency was used to avoid schema risk.
- Did not wire LINE webhook or LIFF bind to trigger generation.

## Git Commit

Pending.

## Staging Push

Pending.

## Remaining Uncertainties

- Whether provider-output failures were caused by model latency, truncation, or schema-shape drift. Raw provider output was intentionally not logged.
- Whether Phase 3 should use a worker/queue, route-triggered background execution, or polling.

## Recommended Next Step

Proceed to Phase 3 LINE Bind Trigger + Delivery planning after reviewing whether the controlled fallback is acceptable as a temporary paid-generation safety net.
