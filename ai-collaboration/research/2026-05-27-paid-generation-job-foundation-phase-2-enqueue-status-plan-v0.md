# Paid Generation Job Foundation Phase 2 — Enqueue / Status Integration Plan v0

Date: 2026-05-27

## 1. Summary

Recommended Phase 2 rollout mode: Option B, enqueue + direct generation compatibility.

Phase 2 should introduce `generation_jobs` writes around the existing direct paid-generation path while preserving current user-facing behavior. The paid-result request path should create/reuse a `paid_analysis` job, mirror processing/completed/failed lifecycle into the job row, and keep storing paid content in `analysis_paid_results` as today.

Do not switch to full enqueue-only behavior until Phase 3 processor/cron exists.

## 2. Current Runtime Lifecycle

Current request flow:

- `POST /api/modules/[moduleSlug]/paid-result/request` validates module/input.
- It calls `requestDeferredPaidGeneration`.
- `requestDeferredPaidGeneration` validates analysis result and unlock intent.
- It short-circuits if a current completed paid result exists.
- It reuses current `processing` or exhausted `failed` paid-result rows.
- It creates or updates an `analysis_paid_results` row with `processing`.
- It runs provider/fallback generation directly.
- It stores completed paid result JSON in `analysis_paid_results`.
- It records `paid_generation_started`, `paid_generation_completed`, or `paid_generation_failed`.

Current status flow:

- `POST /api/modules/[moduleSlug]/paid-result/status` validates unlock token.
- It reads `analysis_paid_results` for current prompt/schema.
- It falls back to any legacy completed paid row.
- It maps claimed fulfillment without a paid row to pending.
- It returns simple external statuses: `missing`, `pending`, `processing`, `completed`, `failed`, `expired`.

Current LINE/LIFF treatment:

- LIFF bind calls `requestDeferredPaidGeneration` during bind completion.
- Short-code webhook replies with a pending link and schedules best-effort generation through `after()`.

## 3. Rollout Mode Options

### Option A — Shadow Enqueue Only

This would continue direct generation and also best-effort create/reuse a job row.

Rejected for Phase 2 because job rows would exist without real lifecycle meaning or a processor. That creates ambiguity without improving durability enough.

### Option B — Enqueue + Direct Generation Compatibility

This creates/reuses a job, marks it processing, runs direct generation as today, and mirrors final state into the job.

Recommended because:

- job rows reflect real generation lifecycle
- current UX remains stable
- no processor is required yet
- Phase 3 can later move generation work behind the processor
- completed result storage remains in `analysis_paid_results`

### Option C — Full Enqueue, No Direct Generation

This is the target architecture after a processor exists.

Rejected for Phase 2 because no processor/cron is live yet. It would turn current paid generation into passive queueing and break expected completion behavior.

## 4. Recommended Phase 2 Behavior

Phase 2 should add a feature-flagged compatibility mode:

```text
ENABLE_PAID_GENERATION_JOBS=true
```

When disabled or missing:

- existing behavior remains unchanged
- no `generation_jobs` read/write is required

When enabled:

- paid generation service creates/reuses `paid_analysis` job
- completed current paid result marks/reconciles job completed
- generation-needed path marks job processing before provider work
- successful direct generation marks job completed with `analysis_paid_result` output ref
- failed generation marks job retry/final state according to policy while preserving public response semantics

Recommended integration location:

- centralize job mirroring inside `requestDeferredPaidGeneration`, not separately in every route

Reason:

- paid-result request route, LIFF bind, and short-code webhook all already call this service
- centralizing avoids inconsistent job state if Phase 2 later covers LINE without touching route semantics

Guardrail:

- if job creation/mirroring fails while feature flag is enabled, decide whether to fail open or fail closed before implementation
- recommended initial behavior: fail open for low-key beta if `analysis_paid_results` generation can still complete, but record safe `paid_generation_job_failed_final` or `paid_generation_job_mirror_failed` only if event name is approved

## 5. Request Route Integration

The public request route should keep its current API contract.

Internal Phase 2 sequence when feature flag is enabled:

1. Validate module/result/unlock intent as today.
2. Build dedupe key:

   ```text
   paid_analysis:{moduleSlug}:{analysisResultId}:{promptVersion}:{schemaVersion}
   ```

3. Create/reuse job with trigger source:

   - `web_unlock` for paid-result request route
   - `line_bind` when called from LIFF bind
   - `short_code` when called from webhook
   - `operator` only for operator-triggered diagnostics

4. If current completed paid result exists:

   - return completed as today
   - mark/reconcile job completed if safe
   - do not regenerate

5. If current `analysis_paid_results` status is `processing`:

   - return processing as today
   - leave job `processing` or mark it processing only if not already completed/failed

6. If generation is needed:

   - mark job processing
   - increment `attempt_count` at processing claim/start
   - run direct generation as today
   - store result in `analysis_paid_results`
   - mark job completed with `output_ref_type=analysis_paid_result` and `output_ref_id`

7. If generation fails:

   - preserve current public behavior
   - map safe error category to retry/final job status
   - avoid exposing raw provider output or paid result JSON

Recommended service input addition:

```ts
triggerSource?: "web_unlock" | "line_bind" | "short_code" | "operator"
operatorTest?: boolean
```

Default trigger source should be `web_unlock` for current request route compatibility.

## 6. Status Route Mapping

Status route should combine three sources:

- `analysis_paid_results`
- `generation_jobs`
- `unlock_intents`

Priority order:

1. Current completed paid result exists: return `completed`.
2. Legacy completed paid result exists: return `completed`.
3. Current paid result status is `processing`: return `processing`.
4. Current paid result status is `failed`: return `failed`.
5. Job status is `completed`: return `completed` only if matching paid result exists; otherwise return `processing` or `pending` while reconciliation catches up.
6. Job status is `processing`: return `processing`.
7. Job status is `queued` or `retry_scheduled`: return `pending`.
8. Job status is `failed_final`: return `failed`.
9. Fulfillment is bound/delivered but no paid result/job exists: return `pending`.
10. No claim/request: return `missing`.

External response should stay simple:

```json
{
  "ok": true,
  "status": "missing|pending|processing|completed|failed|expired",
  "retryable": true,
  "retryAfterMs": 3000,
  "errorCategory": null
}
```

Do not expose internal job IDs, attempt counts, lock state, raw errors, tokens, or provider output.

Implementation note:

- add a repository helper to look up `paid_analysis` job by dedupe key or by input ref + current prompt/schema
- compute the dedupe key after resolving unlock token to result/module

## 7. Pending UI Contract

Keep `PaidResultPendingPoller` simple.

No complex job UI in Phase 2.

Recommended copy mapping:

- `pending`: current waiting card copy is acceptable
- `processing`: current waiting card copy is acceptable
- future `queued` internal state should map to external `pending`
- `failed`: current safe retry/check copy is acceptable
- `completed`: refresh route and show paid result as today

Optional future UI copy:

- queued: `正在排隊整理你的完整分析`
- processing: `正在整理你的完整分析`

Do not show:

- attempt count
- queue internals
- provider name
- job ID
- debug state

## 8. LINE / LIFF / Short-code Treatment

Phase 2 should not make LINE enqueue-only.

Recommended scope:

- focus on paid generation service-level mirroring so existing callers can benefit without route-specific rewrites
- keep LIFF bind behavior unchanged from the user's perspective
- keep short-code webhook behavior unchanged from the user's perspective
- do not change reply copy or fulfillment semantics

Important sequencing:

- If service-level mirroring is enabled globally, LIFF and short-code calls may create/mirror jobs because they call the shared service.
- That is acceptable only if it remains best-effort and behavior-neutral.
- Full LINE enqueue-only conversion remains Phase 4 after processor/cron is live.

## 9. Idempotency / Reuse

Rules:

- repeated paid-result request reuses same job via dedupe key
- repeated LIFF bind reuses same job if service mirroring is centralized
- repeated short-code message reuses same job if service mirroring is centralized
- completed paid result always short-circuits provider generation
- completed paid result should reconcile job to completed
- current processing paid result should not create duplicate paid-result rows
- prompt/schema version changes produce a new dedupe key and may create a new job
- failed/retry-scheduled job should be reused, not duplicated

Recommended behavior for failed jobs in Phase 2:

- if existing `analysis_paid_results` failed and retry count is still allowed, direct generation can retry as today and job should move back to processing
- if exhausted, public status remains failed and job should be `failed_final`

## 10. Production Migration Gate

Staging:

- `0006_generation_jobs.sql` has been applied and verified on staging.

Production:

- production migration is still pending
- do not deploy Phase 2 runtime with `ENABLE_PAID_GENERATION_JOBS=true` until production has `generation_jobs`

Recommended sequencing:

1. Implement Phase 2 behind `ENABLE_PAID_GENERATION_JOBS`.
2. Keep flag disabled by default.
3. Verify locally and on staging with flag enabled.
4. Before production flag enablement, run production migration gate for `0006_generation_jobs.sql`.
5. Deploy Phase 2 code to production with flag disabled if desired.
6. Enable flag only after production schema verification and low-key smoke.

If code deploys before production migration:

- the disabled flag must guarantee no `generation_jobs` access

## 11. Rollback / Feature Flag Strategy

Recommended flag:

```text
ENABLE_PAID_GENERATION_JOBS
```

Default:

```text
false
```

Rollback behavior:

- set flag false
- service stops reading/writing `generation_jobs`
- existing `generation_jobs` rows remain additive and ignored
- `analysis_paid_results` remains source of completed paid content
- no data rollback needed unless a migration itself caused DB issues

Implementation caution:

- status route must not require `generation_jobs` when flag is false
- request route must not fail if the table is absent and flag is false
- if flag is true and table is absent, fail safely with an operator-visible config/schema error in non-production, but do not expose DB internals to users

## 12. Metrics / Events

Future event names to add only during Phase 2 implementation if approved:

- `paid_generation_job_created`
- `paid_generation_job_reused`
- `paid_generation_job_processing`
- `paid_generation_job_completed`
- `paid_generation_job_retry_scheduled`
- `paid_generation_job_failed_final`

Safe metadata:

- `jobType`
- `status`
- `triggerSource`
- `operatorTest`
- `promptVersion`
- `schemaVersion`
- `source`
- `errorCategory`

Avoid:

- raw input
- redacted input text
- paid result JSON
- raw provider output
- LINE user ID
- ID token
- short code
- unlock token
- tokenized URL
- email
- secrets

Recommendation on job ID:

- do not include job ID in public/client responses
- internal event metadata may omit job ID in v0 to reduce accidental correlation risk; dedupe/job details can be inspected directly in DB during ops tasks when needed

## 13. Tests For Future Implementation

Phase 2 implementation tests should cover:

- flag disabled preserves current request route behavior
- flag disabled preserves current status route behavior
- production-missing-table path is not touched when flag is disabled
- paid-result request creates a `paid_analysis` job when enabled
- duplicate request reuses job via dedupe key
- completed paid result short-circuits generation and marks/reconciles job completed
- current processing paid result maps to processing and does not duplicate rows
- successful direct generation marks job completed with output ref
- provider/fallback source is mirrored safely
- output validation/provider failure maps to retry/final job state according to policy
- status route maps queued/retry_scheduled to pending
- status route maps processing to processing
- status route maps failed_final to failed
- status route still handles claimed_missing/no-job case
- LIFF bind and webhook behavior remain unchanged from user perspective
- no raw input, paid result JSON, tokens, LINE IDs, or secrets enter job rows or event metadata

## 14. What Not To Do In Phase 2

Do not build:

- processor endpoint
- Vercel Cron
- enqueue-only LINE webhook
- enqueue-only LIFF bind
- payment success enqueue
- external queue vendor
- admin retry console
- manual retry UI
- sessionized metrics
- payment entitlement engine

Do not change:

- prompts
- paid result schema
- LINE reply semantics
- LIFF verification
- payment disabled state
- public legal copy

## 15. Recommended Next Step

Proceed to:

```text
Paid Generation Job Foundation Phase 2 — Enqueue / Status Integration v0
```

Implementation prerequisites:

- keep `ENABLE_PAID_GENERATION_JOBS=false` by default
- implement service-level mirroring behind the flag
- verify staging with flag enabled
- do not enable production until production `0006_generation_jobs.sql` is applied and verified
