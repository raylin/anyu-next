# Paid Generation Job Foundation Phase 2 — Enqueue / Status Integration v0 Review Bundle

Date: 2026-05-27

## 1. Summary

Implemented feature-flagged `paid_analysis` job mirroring for the existing deferred paid generation lifecycle. The direct provider/fallback path remains the delivery path and `analysis_paid_results` remains the result store.

## 2. Feature Flag Behavior

- Added private runtime flag `ENABLE_PAID_GENERATION_JOBS`.
- Default is disabled unless explicitly set to a truthy value such as `true`, `1`, `yes`, or `on`.
- When disabled, paid generation request/status runtime does not read or write `generation_jobs`.
- The flag is not exposed publicly.

## 3. Request Route / Service Integration

- Centralized mirroring in `requestDeferredPaidGeneration`.
- When enabled, the service creates/reuses a `paid_analysis` job using module slug, analysis result ID, prompt version, and schema version.
- Direct generation still runs synchronously as before.
- Successful provider or fallback generation marks the job completed with `analysis_paid_result` output reference.
- Existing completed paid rows are reconciled to completed jobs when safe.

## 4. Status Route Mapping

Status priority with the flag enabled:

- Completed paid result returns `completed`.
- Generation job `processing` returns `processing`.
- Generation job `queued`, `retry_scheduled`, or completed-without-result returns `pending`.
- Generation job `failed_final` returns `failed`.
- Claimed fulfillment without result/job remains `pending`.
- Unclaimed/missing remains `missing`.

The status response does not expose job ID, dedupe key, attempt count, locks, or internal error code details.

## 5. Fail-open Behavior

Job mirror creation and lifecycle updates are wrapped fail-open. If `generation_jobs` is unavailable or a mirror update fails, paid generation continues through the existing direct path and user-facing behavior remains unchanged.

## 6. LINE / LIFF / Short-code Preservation

LINE webhook, LIFF bind, and short-code behavior remain direct-generation flows. They now pass a safe trigger source to the central service only for feature-flagged job metadata:

- Web unlock: `web_unlock`
- LIFF bind: `line_bind`
- Short code: `short_code`

No LINE signature, LIFF token, fulfillment, redirect, or short-code matching semantics were changed.

## 7. Production Migration Gate

Production must keep `ENABLE_PAID_GENERATION_JOBS=false` until `apps/web/drizzle/0006_generation_jobs.sql` is applied and verified in production. The production runbook now records this gate.

## 8. Events / Metadata

No new analytics events were added in this pass. Phase 2 relies on the `generation_jobs` rows/tests for mirroring verification to avoid introducing new event semantics. Existing paid generation events remain unchanged.

## 9. Tests Added

- Feature flag default and truthy parsing.
- Flag-off behavior avoids generation job repository calls.
- Flag-on service creates/reuses job, marks processing, marks completed, marks fallback success completed, reconciles existing completed rows, and fails open if mirroring fails.
- Final direct-generation failure marks job `failed_final`.
- Status route maps job processing, queued/retry, failed-final, completed paid result precedence, and fail-open lookup behavior.
- Privacy checks assert responses do not expose job IDs, dedupe keys, tokens, or internal error codes.

## 10. Staging Verification

Local validation passed. Staging env/deploy flag changes were not performed in this task.

Recommended staging sequence remains:

1. Deploy this commit to staging with flag disabled.
2. Verify normal paid generation and no runtime job writes.
3. Enable `ENABLE_PAID_GENERATION_JOBS=true` in staging only.
4. Run synthetic paid generation and confirm `generation_jobs` mirrors queued/processing/completed lifecycle while paid content still renders from `analysis_paid_results`.

## 11. Known Limitations

- No processor, cron, or enqueue-only behavior exists yet.
- `generation_jobs` is an observability/transition seam only in Phase 2.
- Status route maps `completed` job without a paid result to `pending` because `analysis_paid_results` remains the delivery truth.
- Production migration remains pending.

## 12. Recommended Next Step

Deploy to staging, verify flag-off behavior first, then enable `ENABLE_PAID_GENERATION_JOBS=true` on staging only and run a synthetic paid-generation mirror smoke before planning processor work.
