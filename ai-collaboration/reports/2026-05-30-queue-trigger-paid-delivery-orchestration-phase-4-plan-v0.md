# Queue Trigger Integration / Paid Delivery Orchestration Phase 4 Plan v0

Date: 2026-05-30

## Summary

Paid delivery can now create the right database artifacts after verified payment, but paid generation still requires manual processor invocation. Phase 4 should add a minimal trigger-only queue layer that asks the existing processor to process paid jobs after payment without making the queue provider a source of truth.

Recommended short-term architecture:

```text
verified payment / operator fake-paid
→ create/reuse payment_intent + entitlement + generation_job
→ enqueue trigger-only queue message when enabled
→ queue calls internal processor/trigger endpoint with signed/authenticated request
→ processor fetches job data from DB and claims work idempotently
→ ReturnURL/status keeps polling read-only states
→ manual processor remains recovery path
```

Vercel Hobby Cron must remain a safety net only. It is daily-only and is not acceptable as the primary paid generation trigger.

## Current Processor / Job Architecture

### generation_jobs

Current repository behavior:

- `generation_jobs` supports one current job type: `paid_analysis`.
- Current statuses are `queued`, `processing`, `retry_scheduled`, `completed`, and `failed_final`.
- Current trigger sources are `web_unlock`, `line_bind`, `short_code`, `payment_success_future`, and `operator`.
- `createOrReusePaidAnalysisJob(...)` dedupes by `paid_analysis:{moduleSlug}:{analysisResultId}:{promptVersion}:{schemaVersion}`.
- Job creation starts at `queued`, sets `nextRunAt`, and stores prompt/schema versions.
- `claimDuePaidAnalysisJobs(...)` claims due `queued` / `retry_scheduled` jobs using `FOR UPDATE SKIP LOCKED`.
- Processor retry behavior uses `retry_scheduled` for retryable provider/output errors, `failed_final` for terminal failures, and stale lock recovery for long-running `processing` jobs.

Implication for Phase 4:

- Queue duplicate delivery is acceptable if the processor remains DB-claim based.
- The queue must not carry job input data because the DB already has the job reference.
- If a future queue payload includes a `jobId`, the processor should still verify the job from DB before processing.

### Processor Route

Current route:

```text
POST /api/internal/jobs/process
```

Current auth:

- `Authorization: Bearer <internal secret>`.
- Secret source is `INTERNAL_JOB_SECRET`, falling back to `CRON_SECRET`.
- Missing/invalid auth returns `401`.
- The processor also requires `ENABLE_PAID_GENERATION_PROCESSOR=true`; otherwise it returns `403 processor_disabled`.
- Payload currently accepts `jobType`, `limit`, and `dryRun`.
- Current processing uses `processPaidAnalysisJobs({ limit, dryRun })`.

Temporary diagnostics:

- Non-production auth diagnostics can be returned when `x-processor-auth-diagnostic: 1` is present.
- These diagnostics were useful for staging secret mismatch debugging.
- They should be removed or deliberately retained after queue QA stabilizes.

### Cron Wrapper

Current route:

```text
GET /api/cron/paid-generation
```

Current behavior:

- Requires `CRON_SECRET`.
- Requires `ENABLE_PAID_GENERATION_PROCESSOR=true`.
- Processes at most one paid analysis job per invocation.
- Exists as a fallback/safety wrapper.

Phase 4 position:

- Keep cron as recovery/safety only.
- Do not rely on Vercel Hobby Cron as the main paid generation trigger.

### Fake-Paid QA Processor Flow

The authorized fake-paid QA path has proven:

- fake/operator payment intent paid transition
- entitlement creation
- `pa_` token hash creation and first-response-only raw token behavior
- generation job creation
- idempotent repeat call
- manual processor completion through `/api/internal/jobs/process`
- paid status ready
- completed paid access rendering

This confirms the processor and status/access pages work when manually triggered.

### NewebPay NotifyURL To Job Creation

Current `POST /api/payments/newebpay/notify` flow:

- Verifies NewebPay config and provider signature.
- Decrypts and validates provider callback payload.
- Matches an existing `newebpay` payment intent by merchant order number.
- Transitions `created` / `checkout_started` to `paid`.
- Calls `createPaidDeliveryArtifactsForPaymentIntent(...)`.
- Creates/reuses entitlement, `pa_` token hash, and a `generation_job`.
- Does not expose raw `pa_` token or unlock path to NotifyURL.

Phase 4 integration should happen after delivery artifact creation returns a generation job.

### ReturnURL / Status / pcs_ Handoff

Current user-facing paid handoff:

- `pcs_` checkout session tokens are signed and session-bound.
- ReturnURL is non-mutating.
- Payment status resolves via `pcs_` token and returns safe states:
  `waiting_for_payment`, `paid_processing`, `paid_ready`, `paid_failed`, `expired`, `invalid_session`.
- Session-bound paid access renders only after payment is paid and a completed paid result exists.

Phase 4 must preserve this:

- ReturnURL must not trigger jobs.
- Public polling must not trigger jobs.
- Resolver/access pages must not enqueue or process jobs.

## Queue Trigger Options

| Option | Reliability | Idempotency | Complexity | Cost | Operational Risk | Retry Behavior | Security/Auth | Suitability |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| QStash-like webhook queue | Good for small paid volume; managed delivery and retries | Good if payload is trigger-only and processor claims DB jobs | Moderate | Low at small volume | Low to moderate; adds provider env and signature verification | Built-in retry/backoff depending on provider | Requires queue token and webhook signature or internal secret | Recommended short-term |
| Direct server-to-server trigger from NotifyURL | Fast and simple | Good if processor remains DB-claim based | Low | Lowest | Higher; provider callback waits on trigger and failures couple payment callback to processing | No durable retry unless implemented | Internal secret only | Acceptable as emergency fallback, not primary |
| Manual processor fallback only | Reliable only when operator is available | Safe | Lowest | Lowest | High UX/ops risk after real payment | Human-driven | Internal secret | Keep as recovery, not production path |
| Vercel Cron / Hobby Cron | Low for paid UX on Hobby due daily schedule | Safe | Low | Low | High latency; not payment-triggered | Schedule-based only | `CRON_SECRET` | Safety net only, not primary |
| External always-on worker | High | Good | High | Medium to high | Higher setup and ops overhead | Full worker-controlled retry | Worker secret/service identity | Later scale option, overkill now |
| Vercel Workflow | Good for durable multi-step orchestration | Good | Moderate to high | Depends on platform usage | Adds a new orchestration model | Built-in workflow retries/checkpoints | Vercel app/runtime auth model | Future option if payment delivery becomes multi-step |

Recommendation:

- Implement a QStash-like webhook queue adapter behind flags for Phase 4.
- Keep the abstraction provider-neutral so QStash can be swapped for another webhook queue later.
- Keep direct processor invocation as a local/test adapter only, not the production payment-triggered default.

## Recommended Short-Term Architecture

### Phase 4 Target

Add a small paid job trigger layer:

```text
lib/payments/paid-job-trigger/
  enqueuePaidGenerationJobTrigger(...)
  adapters/noop
  adapters/test
  adapters/qstash-or-webhook
```

The trigger service should:

- Accept a `generationJob` or safe `jobId`.
- Check `ENABLE_PAID_JOB_QUEUE_TRIGGER`.
- Return a categorized result instead of throwing into payment mutation flow.
- Never receive raw user input, provider payloads, decrypted payment details, raw `pa_` token, or tokenized URLs.
- Be safe to call repeatedly.
- Leave manual recovery possible.

Recommended route shape:

```text
POST /api/internal/jobs/trigger
```

Purpose:

- Verify queue webhook signature or internal queue secret.
- Accept a trigger-only payload.
- Call processor logic using DB as source of truth.
- Optionally process one targeted job if Phase 4 adds safe targeted processing.

Alternative:

- Queue can call existing `POST /api/internal/jobs/process` with `limit: 1`.
- This is simpler but less explicit than a queue-specific trigger endpoint.
- If used, payload should stay `{ "jobType": "paid_analysis", "limit": 1 }`.

Preferred:

- Add a queue-specific internal trigger endpoint in implementation Phase 4A/4B.
- Internally reuse `processPaidAnalysisJobs(...)`.
- Do not broaden public APIs.

## Trigger Payload Contract

Recommended minimal payload:

```json
{
  "version": 1,
  "type": "paid_analysis_job_available",
  "jobId": "generation_job_id",
  "dedupeKey": "paid_analysis_job_idempotency_key"
}
```

Payload rules:

- `jobId` is a DB reference only; processor must fetch and validate the job from DB.
- `dedupeKey` should be a safe queue-level idempotency key derived from the job id, not from user input.
- No raw user input.
- No raw `pa_` token.
- No `pcs_` token.
- No tokenized URL.
- No provider payload or decrypted provider data.
- No provider secrets.
- No payment card/bank details.
- No full `paid_result_json`.

If targeted job processing is not added in Phase 4A, use:

```json
{
  "version": 1,
  "type": "paid_analysis_available",
  "limit": 1
}
```

The `jobId` form is preferable because it is easier to audit, retry, and correlate with support cases, but it requires a small processor enhancement to claim/process one specific due job safely.

## Integration Points

Queue enqueue should be attempted only from trusted server-side mutation paths after the job exists.

Allowed integration points:

- Verified NewebPay NotifyURL after `createPaidDeliveryArtifactsForPaymentIntent(...)` returns a generation job.
- Operator fake-paid success after generation job creation, only when a staging/operator queue QA flag is enabled.

Disallowed integration points:

- ReturnURL.
- Public payment status polling.
- `pa_` resolver.
- Session-bound payment access page.
- Legacy unlock route.
- Client-side browser code.

Duplicate NotifyURL behavior:

- If duplicate verified NotifyURL finds an existing paid intent and existing job, it may enqueue a best-effort trigger only if the job is not terminal.
- Duplicate queue messages must remain safe because the processor claims DB work idempotently.

## Failure Behavior

### Queue Provider Unavailable

- Do not rollback paid payment intent.
- Do not rollback entitlement.
- Do not delete `pa_` token hash.
- Do not delete generation job.
- Return provider-compatible NotifyURL response based on payment verification outcome.
- Record safe category such as `paid_job_enqueue_failed`.
- User sees `paid_processing` while polling.
- Manual processor remains recovery path.

### Queue Enqueue Fails After Verified Payment

- Payment remains `paid`.
- Delivery artifacts remain created/reused.
- Generation job remains `queued`.
- Operator can run `/api/internal/jobs/process` manually.
- Support view/reporting should show safe references: payment intent id, entitlement id, generation job id.

### Duplicate Trigger

- Queue duplicate must not create duplicate paid result.
- Existing DB dedupe and `FOR UPDATE SKIP LOCKED` claiming should handle concurrent processors.
- If targeted job processing is added, only process if the job is due and not terminal.

### Processor 500

- Queue provider should retry according to provider policy.
- Processor should retain current retry/final failure state logic.
- Public status remains `paid_processing` unless job reaches `failed_final`.
- Logs should use safe error category, not raw provider/model output.

### Processor Timeout

- Job may remain `processing`.
- Existing stale lock recovery should move stale jobs back to `retry_scheduled` or `failed_final`.
- Queue retry may trigger another processor invocation; DB state decides whether work is due.

### Job Stuck Queued

- Status page remains `paid_processing`.
- Cron safety net may process later, but should not be the expected path.
- Manual recovery command remains documented.

### Job Failed

- Job status `failed_final` maps to paid failure status.
- User-facing status should show safe support/fallback copy.
- Refund/support policy should handle paid report not generated due to system issue.

### User Polling Before Completion

- ReturnURL/status remains read-only.
- Polling must not enqueue or process.
- UX stays `waiting_for_payment` before NotifyURL and `paid_processing` after paid/job creation.

## Feature Gates And Environment

Existing gates to preserve:

- `ENABLE_PAYMENT_RUNTIME`: top-level runtime gate; remains disabled for broad public launch.
- `ENABLE_NEWEBPAY_CHECKOUT`: checkout creation gate.
- `ENABLE_PAID_GENERATION_PROCESSOR`: allows internal processor execution.
- `ENABLE_OPERATOR_FAKE_PAID_SUCCESS`: staging fake-paid QA gate.

Recommended Phase 4 gates:

- `ENABLE_PAID_JOB_QUEUE_TRIGGER`: enables queue enqueue attempts after job creation.
- `PAID_JOB_QUEUE_PROVIDER`: expected values such as `noop`, `test`, `qstash`.
- `ENABLE_OPERATOR_QUEUE_TRIGGER_QA`: optional staging-only gate if operator fake-paid should enqueue.

Recommended provider env names, values not committed:

- `QSTASH_TOKEN` or provider-specific enqueue token.
- `QSTASH_CURRENT_SIGNING_KEY`.
- `QSTASH_NEXT_SIGNING_KEY`.
- `PAID_JOB_QUEUE_ENDPOINT_URL`, if not derived from app URL.
- `INTERNAL_JOB_SECRET`, for internal processor route auth if the queue calls processor directly.

Operational warning:

- Branch-scoped `Preview(staging)` env vars override general Preview env vars.
- Staging queue secrets and flags must be checked in `Preview(staging)`, not only general Preview.
- Production remains disabled-by-default until a separate launch decision.

## Observability And Support

Log only safe metadata:

- generation job id
- payment intent id
- entitlement id
- module slug
- trigger source/category
- queue provider name
- enqueue result category
- processor result category
- retry/failure category

Do not log:

- raw user input
- raw `pa_` token
- `pcs_` token
- tokenized URLs
- provider secrets
- queue credentials
- decrypted provider payloads
- full provider callback payloads
- full `paid_result_json`

Recommended event/result categories:

- `queue_trigger_disabled`
- `queue_trigger_enqueued`
- `queue_trigger_duplicate`
- `queue_provider_config_missing`
- `queue_enqueue_failed`
- `queue_signature_invalid`
- `processor_triggered`
- `processor_disabled`
- `processor_failed`
- `manual_recovery_required`

Support posture:

- If queue enqueue fails, support/manual recovery can use generation job id and payment intent id.
- User-facing copy should remain generic: payment received, report is processing, contact support if delayed.

## Tests And Staging QA Plan

### Unit / Integration Tests

Add tests in Phase 4 implementation for:

- Verified payment creates job and enqueues trigger when `ENABLE_PAID_JOB_QUEUE_TRIGGER=true`.
- Verified payment creates job but does not enqueue when flag is off.
- Queue provider config missing returns safe category and does not rollback paid transition.
- Queue enqueue failure does not rollback payment intent, entitlement, or generation job.
- Duplicate NotifyURL does not create duplicate entitlement.
- Duplicate NotifyURL does not create duplicate generation job.
- Duplicate NotifyURL does not enqueue unsafe duplicate work.
- Queue trigger endpoint rejects missing auth/signature.
- Queue trigger endpoint rejects invalid signature.
- Queue trigger endpoint processes no raw payload data.
- Processor fetches DB state as source of truth.
- Duplicate trigger does not duplicate paid result.
- Manual processor path remains valid.
- ReturnURL/status/access pages remain non-mutating.
- Fake-paid QA path remains unaffected when queue flag is off.
- Operator fake-paid can enqueue only when explicit staging QA flag is on.

### Staging QA

Recommended staging smoke:

1. Confirm staging route bundle freshness with `/api/health`.
2. Confirm branch-scoped `Preview(staging)` queue env/flags.
3. Run fake-paid QA with queue trigger disabled to prove baseline remains unchanged.
4. Enable queue trigger in staging only.
5. Run fake-paid QA and verify generation job completes without manual processor call.
6. Run verified NotifyURL fixture/sandbox smoke if provider test payload helpers are available.
7. Simulate queue enqueue failure and confirm paid/delivery artifacts remain intact.
8. Confirm manual processor recovery still completes a queued job.
9. Confirm ReturnURL/status never mutates and only reflects state.
10. Confirm invalid queue webhook/auth produces safe rejection.

Do not use real payment attempts unless provider sandbox credentials and owner approval are available.

## Implementation Phase Breakdown

### Phase 4A: Trigger Abstraction + No-op/Test Adapter

Implement:

- `enqueuePaidGenerationJobTrigger(...)` service.
- `noop` adapter returning `queue_trigger_disabled` or `queue_trigger_skipped`.
- `test` adapter for unit tests.
- Feature flag parsing for `ENABLE_PAID_JOB_QUEUE_TRIGGER`.
- Safe result categories.
- No external provider dependency.

Goal:

- Wire the code path safely without changing runtime behavior when flag is off.

### Phase 4B: QStash/Webhook Provider Adapter Under Staging Flag

Implement:

- QStash-like adapter with trigger-only payload.
- Queue webhook signature/auth verification.
- Internal trigger endpoint or safe reuse of processor endpoint.
- Staging-only env documentation.

Goal:

- End-to-end queued trigger in staging without exposing sensitive data.

### Phase 4C: Staging Smoke

Run:

- Fake-paid queued delivery smoke.
- Verified NotifyURL fixture smoke where possible.
- Queue failure simulation.
- Manual recovery fallback check.
- Regression checks for ReturnURL/status/access.

Goal:

- Prove paid generation no longer requires manual invocation in staging.

### Phase 4D: Production Disabled Deployment + Launch Gate Checklist

Deploy code with:

- Queue trigger disabled by default.
- Payment runtime still disabled unless separate launch decision.
- Production env checklist prepared but not enabled.
- Rollback/recovery steps documented.

Goal:

- Make Phase 4 code safe to ship before runtime launch.

## What Remains Out Of Scope

- LINE delivery.
- Refund tooling.
- Queue-driven public launch.
- Broad production payment runtime enablement.
- Provider sandbox/real payment E2E unless credentials and owner approval are available.
- Prompt/result schema changes.
- Public legal/provider review copy changes.

## Validation

Documentation-only validation for this task:

- Docs presence check.
- Secret/private pattern scan on new docs.
- `git diff --check`.

No app code changed, so app lint/test/build is not required for this planning task.

## Tech Debt Review

### New Technical Debt Introduced

None. This task is planning-only.

### Existing Technical Debt Observed

- Temporary processor auth diagnostics remain in the internal processor route. Decide after queue QA whether to remove or explicitly retain them.
- `payment_success_future` is now the NewebPay NotifyURL job trigger source name. Consider renaming to a clearer provider trigger source during implementation only if safe and migration-free.
- Current processor route processes due jobs by limit, not by `jobId`. A targeted queue payload would need a small targeted claim/process enhancement.
- Branch-scoped `Preview(staging)` env precedence remains an operational footgun.

### Opportunistic Cleanup Completed

None.

### Deferred Cleanup Candidates

- Add a safe operator readiness endpoint for queue/processor config booleans after queue implementation stabilizes.
- Document manual recovery commands near the QA runner once queue trigger exists.
- Remove duplicate general Preview queue/QA env values if branch-scoped staging values become canonical.

## Recommended Next Implementation Task

Implement Phase 4A: paid job queue trigger abstraction with no-op/test adapter, feature flag `ENABLE_PAID_JOB_QUEUE_TRIGGER`, safe result categories, and tests proving flag-off behavior does not change paid delivery.
