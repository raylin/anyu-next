# Paid Generation Job Foundation Phase 3 — Processor / Cron Plan v0

Date: 2026-05-27

## 1. Summary

Recommendation: implement Phase 3A as a narrow, secret-gated `paid_analysis` processor that can be invoked manually or by Vercel Cron, but do not switch user-facing request routes to enqueue-only yet.

Phase 3A should prove claim/lock, stale recovery, provider generation, retry/fallback, and aggregate-safe observability in isolation. After staging verification, Phase 3B can move the paid-result request route to enqueue + best-effort processor kick while keeping direct generation as compatibility fallback. Full enqueue-only should wait until processor/cron has production history.

## 2. Current State

Completed foundation:

- `generation_jobs` schema exists in staging and production.
- Repository helpers support create/reuse, lookup, due-job listing, and lifecycle transitions.
- `requestDeferredPaidGeneration` mirrors lifecycle into `generation_jobs` when `ENABLE_PAID_GENERATION_JOBS=true`.
- Staging flag-on verified one `paid_analysis` job reached `completed`.
- Production schema is migrated, but production `ENABLE_PAID_GENERATION_JOBS` remains absent/disabled.

Current limitations:

- `listDueGenerationJobs` reads due jobs but does not atomically claim with `FOR UPDATE SKIP LOCKED`.
- `markGenerationJobProcessing` is a separate update, so it should not be used alone for concurrent processors.
- Direct paid generation still happens inside request-triggered flows.
- No processor endpoint, cron config, stale lock recovery, or queue metrics exist yet.

## 3. Processor Rollout Options

Option A: processor exists, request route still direct-generates.

- Pros: lowest runtime risk; processor can be tested manually on staging without changing user flows.
- Cons: does not immediately improve customer-facing durability.

Option B: request route enqueues + best-effort kicks processor, with direct fallback.

- Pros: starts moving user flow toward durable pending/polling.
- Cons: more state and fallback complexity; riskier before processor behavior is proven.

Option C: full enqueue-only.

- Pros: clean final architecture.
- Cons: too risky before processor/cron and failure policy are proven.

Recommendation: Phase 3A should use Option A. Phase 3B can move to Option B. Do not jump to Option C.

## 4. Recommended Phase 3 Scope

Build only:

- `POST /api/internal/jobs/process`
- secret authorization using `CRON_SECRET` or a dedicated `INTERNAL_JOB_SECRET`
- `paid_analysis` only
- aggregate-only response
- atomic claim helper
- stale lock recovery
- processor service that reuses current paid-result generation internals
- Vercel Cron config only after manual staging processor verification

Do not build:

- general job platform
- external queue vendor
- admin retry UI
- payment entitlement engine
- enqueue-only request route
- LINE/LIFF/short-code behavior changes

## 5. Processor Endpoint Design

Recommended route:

```text
POST /api/internal/jobs/process
```

Security:

- Require `Authorization: Bearer <secret>`.
- Prefer `INTERNAL_JOB_SECRET`; fall back to `CRON_SECRET` only if the team wants one shared cron secret.
- Reject missing/invalid secret with `401`.
- Return `503` if DB is unconfigured or no processor secret is configured.
- Do not accept arbitrary job payload or job IDs.

Request body v1:

```json
{
  "jobType": "paid_analysis",
  "limit": 1,
  "dryRun": false
}
```

Defaults:

- `jobType`: `paid_analysis`
- `limit`: `1`
- max limit: `3`
- `dryRun`: `false`

Safe response:

```json
{
  "ok": true,
  "processed": 1,
  "completed": 1,
  "retryScheduled": 0,
  "failedFinal": 0,
  "staleRecovered": 0,
  "skipped": 0
}
```

Never return job IDs, dedupe keys, raw error messages, raw input, paid result JSON, provider output, tokens, LINE IDs, or secrets.

## 6. Claim / Lock Design

Add a repository helper, not a route-local query:

```text
claimDueGenerationJobs({ jobType: "paid_analysis", limit, lockedBy, now })
```

Atomic claim SQL shape:

```sql
WITH due AS (
  SELECT id
  FROM generation_jobs
  WHERE job_type = 'paid_analysis'
    AND status IN ('queued', 'retry_scheduled')
    AND next_run_at <= now()
    AND attempt_count < max_attempts
  ORDER BY priority DESC, next_run_at ASC, created_at ASC
  LIMIT $1
  FOR UPDATE SKIP LOCKED
)
UPDATE generation_jobs
SET
  status = 'processing',
  attempt_count = attempt_count + 1,
  locked_at = now(),
  locked_by = $2,
  updated_at = now()
WHERE id IN (SELECT id FROM due)
RETURNING *
```

Implementation notes:

- Use a transaction.
- Use `FOR UPDATE SKIP LOCKED` to prevent duplicate workers.
- Increment `attempt_count` at claim time.
- Prefer `priority DESC` for higher numeric priority first. Existing `listDueGenerationJobs` orders priority ascending and should not be reused as the processor claim primitive.
- `lockedBy` should be a safe constant plus deployment/runtime marker, not a secret.

## 7. Stale Lock Recovery

Processor should recover stale jobs at the start of each run.

Recommended timeout:

- `10 minutes` initially, because provider calls can approach route timeout and Vercel cold starts add overhead.

Recovery query:

- Find `status = processing` with `locked_at < now() - processingTimeout`.
- If `attempt_count < max_attempts`, set `retry_scheduled`, `next_run_at = now()`, clear lock, set `last_error_category = stale_lock_recovered`.
- If `attempt_count >= max_attempts`, set `failed_final`, clear lock, set `last_error_category = stale_lock_final`.

Keep stale recovery inside the processor run instead of a separate endpoint/cron. This reduces operational surface area and ensures every cron tick heals stuck jobs before claiming new work.

## 8. Paid Analysis Processing Flow

For each claimed `paid_analysis` job:

1. Validate `input_ref_type = analysis_result`; otherwise mark `failed_final` with `input_invalid`.
2. Load analysis result and request by `input_ref_id`.
3. Resolve module by job `module_slug`; if missing, mark `failed_final` with `module_not_found`.
4. Check for a completed `analysis_paid_results` row for current prompt/schema.
5. If completed row exists, mark job `completed` with `output_ref_type = analysis_paid_result`; do not regenerate.
6. If no completed row exists, create or update an `analysis_paid_results` processing row.
7. Run existing provider/fallback paid generation using the same prompt/schema and user context.
8. Store completed paid result in `analysis_paid_results`.
9. Mark job `completed` with output ref, source, model provider, and model name.
10. Insert safe aggregate events if event semantics are approved.

Implementation should extract the current generation core from `requestDeferredPaidGeneration` into a reusable service function so the request route and processor do not duplicate provider/fallback logic.

## 9. Retry / Backoff / Fallback

Recommended max attempts:

- Keep existing `max_attempts = 3`.

Backoff:

- Attempt 1: immediate.
- Attempt 2: `+30 seconds`.
- Attempt 3: `+2 minutes`.
- Provider rate limit: `+2 to +5 minutes`.

Retryable categories:

- `output_validation`
- `provider_http_408`
- `provider_http_429`
- `provider_http_500`
- `provider_http_502`
- `provider_http_503`
- `provider_http_504`
- `provider`
- `unknown`, but only once
- stale lock recovery category

Final categories:

- `configuration`
- `provider_http_401`
- `provider_http_403`
- `input_invalid`
- `module_not_found`
- `result_not_found`
- `source_unavailable`
- exhausted retryable errors

Fallback policy:

- For current beta/no-charge flow, keep existing fallback behavior after provider retry because this preserves current product behavior.
- Before real payment, owner must approve whether fallback is acceptable after payment. If fallback is not acceptable, paid jobs should become `failed_final` with a support/retry/refund path instead of silently delivering fallback.

## 10. Request Route Integration Strategy

Recommended phases:

Phase 3A:

- Implement processor endpoint and service.
- Keep request route direct-generation behavior unchanged.
- Use manual/operator-created or staging-seeded jobs for processor verification.

Phase 3B:

- Request route creates/reuses job.
- Return `pending` quickly or wait a very short bounded time.
- Best-effort kick processor endpoint internally or call processor service directly with limit `1`.
- Keep direct-generation fallback behind compatibility flag if processor fails.

Phase 4:

- LINE/LIFF/short-code become enqueue-driven.
- Pending poller becomes the primary UX.
- Direct generation path remains rollback-only.

Phase 5:

- Payment success creates entitlement and queues `paid_analysis`.
- Checkout redirects to pending/unlocked route.

## 11. Status Route / Pending Poller Contract

Keep external statuses unchanged:

- `missing`
- `pending`
- `processing`
- `completed`
- `failed`
- `expired`

Mapping:

- Completed paid result exists → `completed`.
- Job `processing` → `processing`.
- Job `queued` or `retry_scheduled` → `pending`.
- Job `failed_final` → `failed`.
- Claimed intent but no job/result → `pending`.
- No claim/request → `missing`.

Do not expose:

- job IDs
- dedupe keys
- attempt count
- internal status
- locks
- raw error codes

Pending poller can keep the current 3-second interval and 120-second timeout for now. If cron is every 1 minute, copy should keep telling users the page auto-updates and that they can return later.

## 12. Cron / Operator Trigger Design

Manual operator trigger:

- Use the same processor endpoint with bearer secret.
- Supports staging smoke and recovery before cron is enabled.
- Returns aggregate counts only.

Vercel Cron:

- Start with every 1 minute.
- `limit = 1` in production initially.
- Staging can use `limit = 2` for smoke.
- Route `maxDuration` should be set high enough for one paid provider call, likely `90`.

Cost controls:

- Max jobs per run.
- Max attempts.
- Provider timeout.
- Optional global provider in-flight guard if volume grows.
- Metrics for fallback and retry categories.

## 13. Metrics / Observability

Safe processor events, if approved:

- `paid_generation_job_processor_run`
- `paid_generation_job_claimed`
- `paid_generation_job_completed`
- `paid_generation_job_retry_scheduled`
- `paid_generation_job_failed_final`
- `paid_generation_job_stale_recovered`

Allowed metadata:

- `jobType`
- `status`
- `triggerSource`
- `source`
- `errorCategory`
- `attemptBucket`
- `processedCount`
- `completedCount`
- `retryScheduledCount`
- `failedFinalCount`
- `staleRecoveredCount`
- `elapsedMs`

Metrics report should eventually include:

- queued count
- processing count
- retry scheduled count
- failed final count
- average queue wait
- average processing duration
- attempt distribution
- fallback rate
- stale recovery count

Do not include raw input, paid result JSON, provider output, tokens, LINE IDs, emails, dedupe keys, or job IDs.

## 14. Feature Flags

Keep:

- `ENABLE_PAID_GENERATION_JOBS`: controls job mirroring/status integration.

Add in Phase 3A:

- `ENABLE_PAID_GENERATION_PROCESSOR`: enables processor execution.

Do not add yet:

- `ENABLE_PAID_GENERATION_ENQUEUE_ONLY`

Reason:

- Enqueue-only is a later request-route switch. Adding the flag before the code path exists increases configuration complexity without safety benefit.

## 15. Production Safety

Production prerequisites before processor runs:

- Production `0006_generation_jobs.sql` applied and verified: done.
- Processor endpoint deployed: pending.
- Processor secret configured: pending.
- Staging manual processor smoke passes: pending.
- Staging cron smoke passes: pending.
- Fallback/support policy documented before payment: pending.

Recommended production rollout:

1. Deploy processor code with `ENABLE_PAID_GENERATION_PROCESSOR=false`.
2. Configure secret.
3. Enable processor on staging only.
4. Run a manual staging processor job.
5. Enable staging cron with low limit.
6. Monitor job counts/retries/fallback.
7. Deploy to production with processor disabled.
8. Enable production processor manually with cron disabled.
9. Trigger one operator-controlled job if approved.
10. Enable production cron with `limit = 1`.

Do not enable enqueue-only production behavior in Phase 3A.

## 16. What Not To Build Yet

Defer:

- external queue vendor
- admin retry console
- manual retry UI
- relationship session jobs
- payment entitlement engine
- multi-model router
- general AI job platform
- sessionized metrics
- broad analytics redesign

## 17. Recommended Next Step

Implement `Paid Generation Job Foundation Phase 3A — Processor Endpoint + Claim Service v0` on staging first.

Minimum implementation scope:

- claim helper with `FOR UPDATE SKIP LOCKED`
- stale recovery helper
- processor service for `paid_analysis`
- secret-gated aggregate-only endpoint
- tests for concurrency/claim safety, stale recovery, retry/final mapping, fallback completion, response privacy, and unauthorized access
- no request-route behavior switch
- no production cron enablement
