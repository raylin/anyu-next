# Paid Generation Job Foundation Plan v0

Date: 2026-05-27

## 1. Summary

Recommendation: add a separate DB-backed `generation_jobs` foundation in a future implementation, scoped narrowly to `paid_analysis` v1. Keep `analysis_paid_results` as paid-result storage, not the durable job lifecycle table.

This should not become a general AI queue platform yet. The foundation should solve the immediate durability gap for paid analysis generation across web unlock, LINE/LIFF bind, short-code fallback, and future payment success while leaving broader job orchestration deferred.

## 2. Current Paid Generation Lifecycle

Current relevant flow:

- Free analyze stores `analysis_requests` and `analysis_results`.
- Unlock intent creates fulfillment state in `unlock_intents`.
- `POST /api/modules/[moduleSlug]/paid-result/request` calls `requestDeferredPaidGeneration`.
- LIFF bind calls `requestDeferredPaidGeneration` during bind completion.
- LINE short-code webhook replies with the unlocked link and schedules `requestDeferredPaidGeneration` through `after()`.
- `analysis_paid_results` stores current paid generation status and the completed `paid_result_json`.
- `POST /api/modules/[moduleSlug]/paid-result/status` reads `analysis_paid_results` and maps missing claimed fulfillment to a pending state.
- `PaidResultPendingPoller` polls the status API and refreshes the unlocked route when completed.

Current durable weakness:

- LINE short-code generation is best-effort background work after reply.
- LIFF bind can still wait on provider generation work.
- Retry state is coupled to `analysis_paid_results.retry_count`.
- There is no independent queue/claim/recovery model for future payment success or web-only checkout.

## 3. Why Not General Queue Yet

A general AI job platform would be premature because Module 01 is still low-key production/monitoring and Module 02/follow-up flows are not fully known.

Do not build yet:

- general multi-job dependency graph
- multi-model routing platform
- admin retry/dead-letter console
- external queue vendor integration
- sessionized follow-up job framework

The right v1 boundary is a boring DB-backed job record for one job type: `paid_analysis`.

## 4. Why Not Couple To analysis_paid_results

Expanding `analysis_paid_results` into a combined job/result table is tempting because it is smaller, but it will increase coupling.

Why not:

- result retention and job retry history have different lifecycles
- payment success should enqueue work without needing to pre-create a result row as the job identity
- LINE and short-code should be trigger sources, not owners of generation state
- future schema/prompt rollover should be reflected in a dedupe key, not hidden inside result-row lookup logic
- failed/retried jobs need observability even if result content is later scrubbed

`analysis_paid_results` should remain the durable paid-content output store.

## 5. Recommended Job Foundation Shape

Future table: `generation_jobs`.

Minimal v1 fields:

```text
id uuid primary key
job_type text not null                         -- v1 only paid_analysis
status text not null                           -- queued | processing | retry_scheduled | completed | failed_final
priority integer not null default 0
module_slug text not null
input_ref_type text not null                   -- v1 analysis_result
input_ref_id uuid not null
output_ref_type text not null default analysis_paid_result
output_ref_id uuid null
trigger_source text not null                   -- web_unlock | line_bind | short_code | payment_success_future | operator
entitlement_ref_id uuid null
dedupe_key text not null
attempt_count integer not null default 0
max_attempts integer not null default 3
next_run_at timestamptz not null default now()
locked_at timestamptz null
locked_by text null
last_error_category text null
last_error_code text null
prompt_version text null
schema_version text null
model_provider text null
model_name text null
operator_test boolean not null default false
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Recommended indexes:

- unique index on `dedupe_key`
- index on `(status, next_run_at, priority)`
- index on `(input_ref_type, input_ref_id)`
- index on `(output_ref_type, output_ref_id)`
- index on `(trigger_source, created_at)`

Include now:

- prompt/schema/model metadata if already available cheaply
- `operator_test` for QA/analytics exclusion
- safe error categories

Defer:

- token usage
- cost accounting
- model strategy snapshots beyond simple metadata
- raw provider output
- LINE user refs
- payment refs beyond nullable entitlement ref

## 6. Job State Machine

V1 statuses:

```text
queued
processing
retry_scheduled
completed
failed_final
```

Transitions:

```text
queued -> processing -> completed
queued -> processing -> retry_scheduled -> queued
queued -> processing -> failed_final
processing -> retry_scheduled
processing -> failed_final
```

Avoid in v1 unless proven needed:

- `cancelled`
- `expired`
- `paused`
- `dead_letter`
- `scheduled`

## 7. Trigger Sources

Recommended trigger sources:

- `web_unlock`: user requests full analysis from web route before real payment or during beta/free unlock.
- `line_bind`: LIFF bind succeeds and user can receive an unlocked route.
- `short_code`: user submits fallback/recovery short-code to LINE OA.
- `payment_success_future`: future verified NewebPay success creates entitlement and queues paid analysis.
- `operator`: operator/test trigger, always marked `operator_test` when applicable.

Core architecture rule:

Generation should be triggered by entitlement/fulfillment state, not by LINE itself.

## 8. Desktop / Mobile / LINE Flow

Mobile / LINE-first:

```text
mobile result page
-> LINE / LIFF bind
-> enqueue paid_analysis job
-> redirect unlocked pending page
-> polling
-> completed paid content
```

Desktop / web-first future payment:

```text
desktop result page
-> web checkout
-> payment success verified server-side
-> entitlement created
-> enqueue paid_analysis job
-> redirect unlocked pending page
-> polling
-> completed paid content
```

Short-code fallback:

```text
LIFF unavailable or desktop recovery
-> user sends short-code to OA
-> unlock intent matched
-> enqueue paid_analysis if no completed/active job exists
-> bot replies with pending/unlocked link
-> polling
-> completed paid content
```

LINE becomes a delivery and retention channel, not the only full-analysis path. Short-code becomes fallback/recovery, not the main generation mechanism.

## 9. Processor / Cron Architecture

Future v1 processor:

```text
POST /api/internal/jobs/process
```

Security:

- require `INTERNAL_JOB_SECRET` or `CRON_SECRET`
- return only aggregate counts and safe error categories
- never return raw input, paid result JSON, provider output, tokens, LINE IDs, or secrets

Processor behavior:

- claim due jobs where `status in queued/retry_scheduled` and `next_run_at <= now`
- claim max N jobs per invocation
- claim atomically with `locked_at`, `locked_by`, and status `processing`
- process only `job_type = paid_analysis` in v1
- load the analysis result/request by ref
- run existing paid-result provider generation service logic
- store completed output in `analysis_paid_results`
- set `output_ref_id`
- mark job `completed`, `retry_scheduled`, or `failed_final`

Cron:

- Vercel Cron every 1 or 5 minutes
- request routes may enqueue and optionally best-effort kick the processor
- the persisted job is the durable source of truth, not the kick

## 10. Idempotency / Locking

Recommended dedupe key:

```text
paid_analysis:{moduleSlug}:{analysisResultId}:{schemaVersion}:{promptVersion}
```

This allows schema/prompt version rollover to generate a new paid result when the paid-result contract changes.

Rules:

- repeated web unlock calls reuse an existing completed/queued/processing job
- repeated LIFF bind calls reuse an existing job
- repeated short-code fallback calls reuse an existing job
- payment success should enqueue only once per entitlement/result/version
- existing completed `analysis_paid_results` should short-circuit job creation when versions match
- processor claims must be atomic to avoid double generation
- stale `processing` locks should be recoverable by a later maintenance pass

Stale lock policy:

- if `processing.locked_at` is older than a safe threshold, move back to `retry_scheduled` with `last_error_category = stale_lock`
- emit a safe recovery event

## 11. Retry / Backoff / Fallback

Initial retry policy:

```text
maxAttempts = 3
attempt 1: immediate
attempt 2: +30s
attempt 3: +2m
failed_final after max attempts
```

Error categories:

- `output_validation`: retry
- `provider_timeout`: retry
- `provider_rate_limit`: retry later
- `provider_auth_error`: failed final
- `input_invalid`: failed final
- `not_found`: failed final
- `unknown`: retry once, then failed final

Fallback:

- after provider retry failure, controlled fallback may complete the job if the fallback is product-acceptable and safe
- fallback output should still be stored in `analysis_paid_results` with model/source metadata
- for future real payment, if fallback quality is not acceptable, `failed_final` must support safe support/refund/retry copy instead of silently degrading quality

## 12. Pending Status API Contract

External status API should remain simple and not expose job internals.

Recommended response:

```json
{
  "status": "queued|processing|completed|failed",
  "retryAfterMs": 3000,
  "message": "safe user-facing copy"
}
```

Internal mapping:

```text
queued -> queued
retry_scheduled -> queued
processing -> processing
completed -> completed
failed_final -> failed
```

User-facing copy:

- queued: `正在排隊整理你的完整分析`
- processing: `正在整理你的完整分析`
- failed: `這次整理沒有成功，請稍後再試或聯絡客服`

The current `PaidResultPendingPoller` can keep polling the same endpoint. The status route should eventually read job status first, then fall back to legacy `analysis_paid_results` status during migration.

## 13. Metrics / Observability

New event names to add in a future implementation:

- `paid_generation_job_queued`
- `paid_generation_job_claimed`
- `paid_generation_job_completed`
- `paid_generation_job_retry_scheduled`
- `paid_generation_job_failed_final`
- `paid_generation_job_stuck_recovered`

Metrics:

- queued count
- processing count
- retry_scheduled count
- failed_final count
- completion rate
- queued-to-completed latency
- attempt distribution
- fallback rate
- stale processing recovery count

Event metadata should include only safe fields:

- job type
- status
- trigger source
- attempt count
- safe error category/code
- module slug/id
- prompt/schema version
- `operatorTest` when applicable

Do not include raw input, paid result JSON, provider output, tokenized URLs, LINE IDs, payment secrets, or database URLs.

## 14. Retention / Privacy

`generation_jobs` should not store raw input or paid result content.

Retention recommendations:

- keep job rows for aggregate observability with safe metadata
- preserve refs and safe categories after result content is scrubbed
- align job retention with operational support window
- continue scrubbing paid content through `analysis_paid_results.retention_expires_at`
- never store raw provider output in job rows

Failed job metadata should remain safe enough for support and metrics:

- status
- attempts
- safe error category/code
- timestamps
- refs

## 15. External Queue Upgrade Point

Stay DB-backed until one or more triggers appear:

- real payment volume exceeds cron comfort
- provider retries become a support burden
- stale locks or long-running functions become frequent
- multiple modules create meaningful background workload
- admin retry/dead-letter tooling becomes necessary
- multi-model routing or cost controls become complex

Possible future vendors:

- Inngest
- Trigger.dev
- QStash
- Cloud Tasks
- Temporal-like workflow

Do not choose a vendor in v1.

## 16. Implementation Phases

Phase 0: plan.

This document.

Phase 1: DB schema + repository.

- add `generation_jobs` migration
- add repo helpers for create/reuse, claim, complete, retry, fail
- add dedupe key tests
- no behavior switch

Phase 2: enqueue paid_analysis job.

- paid-result request route creates/reuses job
- status route understands job status
- existing direct generation may remain as rollout fallback

Phase 3: processor endpoint + cron.

- secret-gated processor
- process `paid_analysis` jobs only
- retry/backoff/fallback behavior
- safe events and metrics

Phase 4: LINE / short-code enqueue-only.

- LIFF bind enqueues and redirects
- short-code webhook enqueues and replies with pending link
- remove best-effort direct generation from webhook path

Phase 5: payment success integration.

- NewebPay success creates entitlement
- payment success enqueues paid analysis
- web-only polling works
- LINE is optional

Phase 6: future follow-up / pack.

- relationship session/follow-up jobs may reuse the foundation only after separate architecture approval

## 17. What Not To Build Yet

Do not build now:

- general AI job platform
- multi-job dependency graph
- admin retry console
- external queue vendor
- multi-model router
- sessionized follow-up jobs
- payment entitlement engine
- relationship session memory
- payment packs
- Module 02 job abstractions

## 18. Recommended Next Step

Proceed to Phase 1 only after human architecture approval:

```text
Paid Generation Job Foundation Phase 1 — DB schema + repository seams
```

Phase 1 should create the schema and repository helpers behind tests, without changing live paid generation behavior.
