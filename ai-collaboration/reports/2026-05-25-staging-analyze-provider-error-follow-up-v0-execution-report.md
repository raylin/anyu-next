# Staging Analyze Provider Error Follow-up v0 Execution Report

Date: 2026-05-26

## Completed Work

- Saved the handoff in `ai-collaboration/handoffs/`.
- Inspected the fresh analyze runtime, provider retry path, paid-result v2 semantic validation, analyze route failure persistence, context persistence, and shadow paid-result write.
- Confirmed shadow paid-result writes are best-effort and cannot cause analyze failure.
- Added runtime classification for paid-result semantic validation failures as output-validation failures.
- Added sanitized internal `output_validation` failure categorization for future analyze request records.
- Added tests for retry classification and route failure categorization.
- Redeployed staging and pointed `staging.anyu.tw` at the final preview deployment.
- Verified a fresh staging analyze completed and created the Phase 1 shadow paid-result row.

## Diagnosis

Historical staging failures were persisted only as `provider_error` / `provider`, so the exact original subcause could not be recovered from stored request records. The failures occurred after request/context persistence and before result persistence. The concrete code defect found was that `PaidResultSemanticValidationError` was not included in the output-validation classifier, causing semantic paid-result failures to be treated as generic provider errors instead of retryable output validation in guarded runtime paths.

## Architecture Decisions

- Kept the current synchronous analyze flow and current `ProductResult` behavior unchanged.
- Kept `analysis_paid_results` shadow writes best-effort.
- Did not change prompt/schema versions or relax the paid-result v2 semantic contract.
- Added only sanitized internal failure categorization; public API response remains unchanged.

## Staging Verification

- Final staging deployment: `dpl_76uNTwRNMrFuBtRnoPhwQZ4fj5P7`.
- `staging.anyu.tw` alias updated to the final deployment.
- Exact requested synthetic case returned HTTP 200 from cache.
- Near-identical fresh synthetic request returned HTTP 200 with `cacheHit = false`.
- Fresh request persisted as completed with 4 allowlisted context fields.
- `analysis_paid_results` shadow row was created with completed status.
- Result page returned HTTP 200.
- Unlock intent returned HTTP 200.
- Unlocked route returned HTTP 200.
- Event metadata key check did not show raw input, provider output, paid-result JSON, secrets, or private source text.

## Validation

- `python3 -m compileall oradar`: passed.
- `python3 -m compileall tools/topic-ingestion`: passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`: passed, 25 tests.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed, 117 tests.
- `cd apps/web && corepack pnpm build`: passed.
- `cd apps/web && corepack pnpm test:e2e:local`: passed, 9 tests.

## Blockers

- None for staging.

## Uncertainties

- The exact original provider subcause for the two historical failed staging requests remains unrecoverable because they were stored with only generic `provider_error` metadata.
- Production remains intentionally unverified for Phase 1 because production migration `0005` was not applied.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: historical analyze failures lacked enough sanitized internal categorization to distinguish provider API failures from output validation failures.
- Opportunistic cleanup completed: added sanitized `output_validation` categorization for future failed analyze records.
- Deferred cleanup candidates: add a dedicated failure-classification helper if more analyze failure categories are introduced.

## Suggested Next Steps

- Apply production migration `0005` only after human approval and a production launch/migration gate.
- After production migration is applied, deploy the current staging-tested runtime to production and run one sanitized production fresh analyze smoke.
