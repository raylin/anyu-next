# Analyze Request State Migration + Live Verification v0 Review Bundle

Date: 2026-05-21

## 1. Summary

Analyze Request State migration `0002` was applied and verified on both Neon target branches:

- staging/preview branch: `br-fragrant-union-aoh4udf1`
- production branch: `br-square-star-aosaqd0q`

Staging live verification passed for fresh analyze, poll endpoint, cache hit, result page, unlock intent, Email fallback, and event metadata privacy checks.

Production database migration passed, but production live smoke was blocked because `https://anyu.tw` does not currently serve the poll endpoint route from commit `1d9700d`. Production analyze smoke was not run to avoid creating misleading request-state rows through older production app code.

## 2. Migration Status

Staging / Preview:

- migration applied: yes
- request-state columns present: yes
- `analysis_requests_status_idx` present: yes

Production:

- migration applied: yes
- request-state columns present: yes
- `analysis_requests_status_idx` present: yes

Verified columns:

- `status`
- `started_at`
- `completed_at`
- `failed_at`
- `error_code`
- `error_category`
- `result_id`
- `last_heartbeat_at`

## 3. Staging Verification

Staging target:

- `https://staging.anyu.tw`

Fresh analyze:

- result: passed
- response status: `completed`
- cache hit: `false`
- request state in DB: `completed`
- request had result ID: yes
- request had started/completed timestamps: yes
- request had failed/error fields: no

Result page:

- result route returned HTTP 200

Funnel:

- unlock intent API passed
- Email fallback API passed with synthetic contact value
- result page still rendered the paid/fake-door affordance

Note:

- one intermediate staging cache attempt used a one-character typo in the synthetic input, so it correctly behaved as a fresh miss. The exact original input was then resubmitted and verified as a cache hit.

## 4. Production Verification

Production target:

- `https://anyu.tw`

Production database:

- migration applied and schema verified

Production live app:

- blocked for request-state smoke
- `GET /api/modules/ambiguous-temperature/analyze/requests/[requestId]` returned the app 404 page, indicating production is not yet serving the request-state route from commit `1d9700d`

Production analyze smoke:

- skipped intentionally
- reason: production app code freshness is not aligned with the migrated schema/request-state implementation
- risk avoided: submitting through older app code would not verify poll behavior and could create request rows that do not reach the new completed state

## 5. Poll Endpoint Verification

Staging:

- poll endpoint returned `status: completed`
- poll endpoint returned the same `resultId`
- poll endpoint returned the expected result route
- poll endpoint returned `retryable: false`
- poll endpoint did not expose raw input, redacted input, full result JSON, provider raw output, contact values, or secrets in the response body

Production:

- blocked
- live production route returned 404 because production is not serving the request-state route yet

## 6. Cache Interaction Verification

Staging:

- exact repeat submit returned `cacheHit: true`
- repeated result ID matched the original fresh result ID
- response returned immediately relative to provider-path latency

Production:

- skipped because production app route freshness is blocked

## 7. Funnel Verification

Staging:

- result page load passed
- unlock intent API passed
- Email fallback API passed with synthetic-only contact value
- LINE-first/fake-door result page affordance remained present

Production:

- skipped because production request-state smoke was blocked before analyze

## 8. Event / Privacy Verification

Staging event metadata checks:

- event count for synthetic verification session: 8
- raw synthetic input fragments in event metadata: no
- synthetic contact value in event metadata: no
- provider raw output marker in event metadata: no
- secret name markers in event metadata: no

Production:

- not checked from new smoke because production smoke was blocked and not run

## 9. Documentation Updates

No broad docs rewrite was needed. The previous request-state implementation handoff had already updated:

- `apps/web/README.md`
- `docs/operations/production-deployment-runbook.md`

This verification is recorded in this review bundle, the execution report, and the summary log.

## 10. Known Limitations

- Request-state v0 remains synchronous on cache misses.
- Poll endpoint is recovery/future-async readiness, not true background processing.
- Production DB is migrated, but production app code must be deployed/refreshed to commit `1d9700d` or later before production request-state smoke can pass.
- Production analyze smoke should be rerun only after route freshness is confirmed.

## 11. Recommended Next Step

Deploy or promote commit `1d9700d` or later to the production app through the approved production deployment workflow, then rerun only the blocked production checks:

- fresh analyze
- poll endpoint completed response
- cache hit
- result page
- unlock / LINE / Email fallback
- privacy-safe event metadata
