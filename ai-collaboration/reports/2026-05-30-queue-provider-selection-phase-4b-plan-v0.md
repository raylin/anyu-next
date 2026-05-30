# Queue Provider Selection / Phase 4B Plan v0

Date: 2026-05-30

## Executive Summary

Recommended Phase 4B provider:

1. **Primary recommendation: Vercel Queues**, if available in the ANYU Vercel account/project.
2. **Fallback recommendation: Upstash QStash**, if Vercel Queues beta/access constraints block implementation.

Reasoning:

- ANYU is already deployed on Vercel and uses Next.js route handlers.
- Vercel Queues avoids exposing a public queue webhook endpoint for provider delivery. Its consumer functions are not publicly accessible, which reduces auth surface for a one-person operation.
- The current Phase 4A payload is already trigger-only and DB-reference-only, which maps cleanly to either Vercel Queues or QStash.
- Manual processor recovery must remain available regardless of provider.

Phase 4B should not enable production payment runtime. It should add one real provider adapter behind flags, run staging QA with Preview(`staging`) env, and deploy disabled-by-default to production.

Source references reviewed:

- Vercel Queues docs: `https://vercel.com/docs/queues`
- Vercel Queues limits/docs: `https://vercel.com/docs/queues/limits`
- Vercel Queues quickstart: `https://vercel.com/docs/queues/quickstart`
- Vercel Workflow docs: `https://vercel.com/docs/workflow`
- Vercel Functions guidance via local Vercel plugin
- Upstash QStash docs/product page: `https://upstash.com/qstash`

## 1. Current Phase 4A Implementation Review

Current abstraction:

- File: `apps/web/src/lib/payments/paid-job-queue-trigger.ts`
- Function: `triggerPaidJobProcessing(...)`
- Flag: `ENABLE_PAID_JOB_QUEUE_TRIGGER`
- Provider selector: `PAID_JOB_QUEUE_PROVIDER`
- Current providers:
  - `none`
  - `noop`
  - `test`

Current result categories:

- `disabled`
- `noop`
- `enqueued`
- `failed`

Current trigger payload:

```ts
{
  version: 1,
  type: "paid_analysis_job_available",
  paymentIntentId: string,
  generationJobId: string,
  moduleSlug: string,
  triggerSource: "newebpay_notify" | "operator_fake_paid"
}
```

Payload safety:

- No raw user input.
- No raw `pa_` token.
- No `pcs_` checkout session token.
- No tokenized URL.
- No provider payload.
- No decrypted provider payload.
- No provider or queue credential.

Current integration points:

- `apps/web/src/lib/payments/newebpay/notify-service.ts`
  - after verified NotifyURL marks/reuses paid payment intent and creates/reuses delivery artifacts.
- `apps/web/src/lib/payments/operator-fake-paid-success.ts`
  - after operator fake-paid creates/reuses delivery artifacts.

Not wired:

- ReturnURL
- payment status endpoint
- payment access page
- paid-result status endpoint
- pa_ unlock resolver
- processor route
- cron wrapper

Current tests:

- `apps/web/src/tests/paid-job-queue-trigger.test.ts`
- `apps/web/src/tests/newebpay-notify-service.test.ts`
- `apps/web/src/tests/operator-fake-paid-success.test.ts`
- `apps/web/src/tests/feature-flags.test.ts`

Current limitations:

- No real provider adapter.
- No provider-level retry/dedupe.
- No queue delivery endpoint/consumer.
- No persisted trigger attempt tracking.
- No provider failure categories beyond the generic `failed`.
- No real staging queue smoke yet.

## 2. Queue Provider Options

| Option | Cost / free-tier suitability | Setup complexity | Reliability / retry | Auth/security | Observability | Lock-in | Fit for ANYU |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Vercel Queues | Best operational fit if available on current plan; verify account limits before implementation. | Medium: add package/config/consumer and env. | At-least-once delivery and retries; provider-native queue semantics. | Strong fit: consumer functions are not publicly accessible. | Vercel-native deployment/log context; queue-level observability depends on Vercel UI/docs. | Vercel-specific. | Recommended primary. Keeps infra within current platform and avoids public webhook auth. |
| Upstash QStash | Side-project-friendly and mature; verify current pricing/free tier before implementation. | Medium: create QStash resource, configure token/signature, publish HTTP message. | Built for delayed/retried webhook delivery. | Requires public endpoint with QStash signature verification. | Upstash dashboard plus Vercel logs. | External provider. | Good fallback if Vercel Queues is unavailable or too beta. More webhook/auth surface. |
| Direct internal trigger from NotifyURL | Lowest cost; no external queue. | Low. | Weak: NotifyURL request can time out or couple provider callback to processing. | Simple internal call but poor isolation. | Minimal. | None. | Not recommended as primary. It undermines decoupling from provider callback. |
| Existing manual processor fallback only | No new cost. | None. | Manual and slow. | Existing bearer auth. | Existing logs/results only. | None. | Keep as fallback, not launch path. |
| Vercel Cron / Hobby Cron | Low cost but Hobby cadence is daily-only. | Low. | Not suitable for immediate paid delivery. | Existing cron auth. | Basic. | Vercel-specific. | Explicitly not primary. Can remain recovery/maintenance only if needed. |
| Vercel Workflow | Potentially good for multi-step durable orchestration. | Higher: workflow model, step design, lifecycle. | Durable steps/retries. | Vercel-native. | Workflow run observability. | Vercel-specific. | Defer. Overkill for Phase 4B’s single trigger-to-processor requirement. Reconsider for future multi-step delivery/LINE/refund flows. |
| External worker later | Flexible and robust. | Highest: worker deploy, secrets, monitoring, queue infra. | Strong if implemented well. | Separate service auth. | Requires extra observability. | Depends on provider. | Defer until volume/complexity justifies it. |

## 3. Recommended Provider

Recommended Phase 4B provider:

- Add `vercel_queue` as the first real provider under the existing abstraction.
- Keep `qstash` as the planned fallback provider if Vercel Queues is unavailable in the owner account or too constrained for the workload.

Why Vercel Queues first:

- It avoids creating a public queue webhook solely for queue delivery.
- It aligns with the current Vercel deployment/source-of-truth cleanup.
- It keeps DB as source of truth and lets the queue payload stay tiny.
- It is easier to operate alone than adding another dashboard/secret/signature path immediately.

Critical caveat:

- Vercel Queues is newer/beta relative to QStash. Phase 4B.1 should include a quick account/project availability check before implementation. If setup is blocked, switch to the QStash fallback plan.

## 4. Provider Adapter Design

Add provider enum value:

- `vercel_queue`

Possible fallback enum value:

- `qstash`

New/updated result categories:

- `disabled`
- `noop`
- `enqueued`
- `provider_config_missing`
- `provider_auth_missing`
- `provider_error`
- `rate_limited`
- `unexpected_error`

Vercel Queues env names, values not committed:

- `ENABLE_PAID_JOB_QUEUE_TRIGGER`
- `PAID_JOB_QUEUE_PROVIDER=vercel_queue`
- `PAID_JOB_QUEUE_NAME`
- Vercel-managed queue env/config names as required by provider docs

QStash fallback env names, values not committed:

- `ENABLE_PAID_JOB_QUEUE_TRIGGER`
- `PAID_JOB_QUEUE_PROVIDER=qstash`
- `QSTASH_TOKEN`
- `QSTASH_CURRENT_SIGNING_KEY`
- `QSTASH_NEXT_SIGNING_KEY`
- `PAID_JOB_QUEUE_TARGET_URL`

Target/consumer model:

- Vercel Queues primary:
  - enqueue trigger-only payload to a named queue.
  - consumer fetches DB state and invokes existing paid generation processor service.
- QStash fallback:
  - publish trigger-only payload to a queue-specific Vercel route.
  - route verifies QStash signature, then invokes existing paid generation processor service.

Request payload:

```json
{
  "version": 1,
  "type": "paid_analysis_job_available",
  "paymentIntentId": "db-ref-only",
  "generationJobId": "db-ref-only",
  "moduleSlug": "ambiguous-temperature",
  "triggerSource": "newebpay_notify"
}
```

Payload exclusions:

- no raw user input
- no raw `pa_`
- no `pcs_`
- no unlock URL
- no provider payload
- no decrypted provider payload
- no provider credentials
- no queue credentials

## 5. Webhook / Processor Auth Recommendation

Recommended for Vercel Queues:

- Do not expose `/api/internal/jobs/process` directly to the queue provider.
- Add a queue consumer/handler that is not public and calls the existing processor service function internally.
- Keep `/api/internal/jobs/process` as manual/operator recovery with `INTERNAL_JOB_SECRET`.

Recommended for QStash fallback:

- Add a new queue-specific endpoint, for example:
  - `POST /api/internal/paid-jobs/queue`
- Verify QStash signature on that endpoint.
- Do not use only `INTERNAL_JOB_SECRET` for QStash delivery.
- Do not expose raw processor endpoint to QStash unless there is no safer alternative.

Why not call `/api/internal/jobs/process` directly:

- The current processor route is an internal manual route protected by bearer secret.
- Queue-provider authentication should be distinct from manual operator auth.
- A queue-specific endpoint/consumer can validate provider-specific signature and payload shape before invoking the processor.

## 6. Idempotency / Duplicate Trigger Plan

Current service-level idempotency already covers:

- duplicate NotifyURL paid transition
- duplicate entitlement creation
- duplicate generation_job creation
- processor DB fetch/source-of-truth behavior

Phase 4B should add provider-level idempotency where available:

- Use a deterministic dedupe/idempotency key based on `generationJobId`.
- Recommended key shape: `paid-job:<generationJobId>`.
- If provider supports delayed/retry/dedupe windows, use it.

Do not add a new queue audit table in Phase 4B unless provider behavior proves insufficient.

Recommended duplicate behavior:

| Case | Expected behavior |
| --- | --- |
| Duplicate NotifyURL | Delivery artifacts reused; enqueue attempt may be skipped or deduped by `generationJobId`. |
| Duplicate enqueue | Provider dedupe key prevents extra delivery where supported; otherwise processor idempotency handles it. |
| Duplicate queue delivery | Processor sees job state and avoids duplicate completed output. |
| Job already processing | Processor should skip/lock safely. |
| Job already completed | Processor should no-op / skip safely. |
| Job failed retryable | Queue retry or manual processor can retry if job state allows. |
| Job failed final | Manual support path decides whether to reset/recover. |

## 7. Failure Behavior

Do not roll back payment success or delivery artifacts if enqueue fails.

Planned behavior:

| Failure | Behavior |
| --- | --- |
| Enqueue failure after verified paid | Keep payment paid and delivery artifacts. Return/log safe queue category; user sees waiting/processing state. |
| Queue provider unavailable | Same as enqueue failure; manual processor recovery remains available. |
| Queue consumer auth/signature failure | Reject safely; provider retries where supported; log safe category. |
| Processor 500/timeout | Queue retries where supported; job remains pending/processing/failed according to existing processor rules. |
| Job stuck queued | Manual recovery SOP uses existing internal processor route. |
| User returns before processing | ReturnURL/status remains waiting or processing. |
| User support path | Support can inspect payment intent/job safe IDs and manually run processor. |

Manual recovery SOP should remain:

1. Verify payment intent is paid and entitlement/job exist.
2. Run existing authorized processor route with `INTERNAL_JOB_SECRET`.
3. Confirm payment status/paid access handoff reaches ready.

## 8. Env / Flag Matrix Update Plan

Add/update matrix names only:

Common:

- `ENABLE_PAID_JOB_QUEUE_TRIGGER`
- `PAID_JOB_QUEUE_PROVIDER`
- `PAID_JOB_QUEUE_NAME`

Vercel Queues:

- Vercel-managed queue connection/config variables, names to be confirmed during setup.

QStash fallback:

- `QSTASH_TOKEN`
- `QSTASH_CURRENT_SIGNING_KEY`
- `QSTASH_NEXT_SIGNING_KEY`
- `PAID_JOB_QUEUE_TARGET_URL`

Existing auth/config still relevant:

- `INTERNAL_JOB_SECRET`
- `ENABLE_PAID_GENERATION_PROCESSOR`
- `DATABASE_URL`
- NewebPay provider config names from previous phases
- paid access/session signing config names from previous phases

Environment requirements:

- Local: no real provider required; use `noop`/`test`.
- Preview general: do not rely on it for staging-specific QA.
- Preview(`staging`): authoritative for staging queue QA; branch-scoped values override general Preview.
- Production: keep disabled until launch checklist passes.

## 9. Tests and Staging QA Plan

Unit/integration tests:

- provider config missing returns `provider_config_missing`
- provider auth missing returns `provider_auth_missing`
- enqueue success returns `enqueued`
- enqueue provider error returns `provider_error`
- rate limit maps to `rate_limited`
- payload contains no raw input/tokens/provider data
- duplicate notify does not duplicate artifacts
- duplicate notify either skips enqueue or uses provider dedupe key
- queue consumer auth/signature success/failure
- queue consumer validates payload shape
- processor idempotency for queued/processing/completed jobs
- manual fallback remains possible

Staging QA:

1. Confirm staging health marker and branch-scoped Preview(`staging`) env.
2. Run fake-paid with `noop` provider to confirm integration still passes.
3. Enable real provider in Preview(`staging`) only.
4. Run fake-paid with real provider enqueue.
5. Confirm queue consumer processes job to ready.
6. Run verified NotifyURL fixture enqueue if fixture helpers are available.
7. Simulate provider enqueue failure by missing/invalid config and confirm paid/delivery artifacts remain.
8. Confirm manual processor fallback still completes a queued job.
9. Confirm production remains disabled.

## 10. Implementation Phase Split

Phase 4B.1: Provider adapter behind flag

- Add `vercel_queue` provider value.
- Add adapter config parsing and safe categories.
- Keep production disabled.
- Add unit tests for config/payload/categories.

Phase 4B.2: Queue consumer / processor integration

- Add Vercel Queue consumer or QStash fallback endpoint.
- Validate payload.
- Invoke existing processor service internally.
- Keep manual processor route unchanged.

Phase 4B.3: Staging smoke

- Configure Preview(`staging`) only.
- Run fake-paid enqueue and processor completion.
- Run invalid/missing config smoke.
- Verify manual fallback.

Phase 4B.4: Production disabled deployment

- Deploy code with queue flags off in production.
- Verify production health and fail-closed routes.

Phase 4B.5: Launch gate checklist

- Merchant review/payment runtime decision.
- Production env review.
- Queue provider dashboard/access review.
- Payment runtime launch decision record.

## 11. Recommended Next Implementation Task

Queue Trigger Integration Phase 4B.1: Vercel Queues Adapter v0

Scope:

- Add `vercel_queue` provider adapter behind `ENABLE_PAID_JOB_QUEUE_TRIGGER`.
- Add config parsing and safe error categories.
- Add tests for enqueue success/failure using mocks only.
- Do not enable production.
- Do not remove manual processor fallback.

Fallback task if Vercel Queues is unavailable:

Queue Trigger Integration Phase 4B.1: QStash Adapter v0

Scope:

- Add `qstash` provider adapter behind the same flag.
- Add queue-specific endpoint with signature verification.
- Add tests for signature success/failure and payload safety.

## Blockers / Owner Actions

- Confirm whether Vercel Queues is available for `studioanyu-1488` / `anyu-next`.
- If not available, decide whether to use Upstash QStash.
- Do not add production queue env until a launch decision exists.
- Continue tracking old Vercel `anyu` project/domain cleanup separately.
