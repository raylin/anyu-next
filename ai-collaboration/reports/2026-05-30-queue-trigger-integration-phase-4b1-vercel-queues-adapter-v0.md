# Queue Trigger Integration Phase 4B.1: Vercel Queues Adapter v0

Date: 2026-05-30

## Summary

Implemented the first real paid job queue provider adapter behind the existing paid job queue trigger abstraction.

The implementation remains disabled by default and does not enable broad public payment runtime. It adds:

- `@vercel/queue` dependency.
- `PAID_JOB_QUEUE_PROVIDER=vercel_queue` support.
- `PAID_JOB_QUEUE_TOPIC` provider config.
- Vercel Queues `queue/v2beta` trigger config for topic `paid-generation-jobs`.
- Internal queue consumer route at `/api/internal/queues/paid-generation`.
- In-process queue consumer service that delegates to the existing paid generation processor.
- Targeted tests for Vercel enqueue, failure, payload safety, and consumer validation.

Live Vercel Queues dashboard/staging smoke was not run in this task. Production env values were not modified and no deployment was performed.

## Files Changed

- `apps/web/package.json`
- `pnpm-lock.yaml`
- `apps/web/vercel.json`
- `apps/web/src/lib/payments/paid-job-queue-trigger.ts`
- `apps/web/src/lib/payments/paid-job-queue-consumer.ts`
- `apps/web/src/app/api/internal/queues/paid-generation/route.ts`
- `apps/web/src/tests/paid-job-queue-trigger.test.ts`
- `apps/web/src/tests/paid-job-queue-consumer.test.ts`
- `ai-collaboration/handoffs/2026-05-30-queue-trigger-integration-phase-4b1-vercel-queues-adapter-v0-handoff.md`
- `ai-collaboration/reports/2026-05-30-queue-trigger-integration-phase-4b1-vercel-queues-adapter-v0.md`
- `ai-collaboration/summaries/summary_log.md`

## Adapter API

Existing abstraction:

- `triggerPaidJobProcessing(...)`
- Payload type: `paid_analysis_job_available`
- Payload version: `1`

Provider values after this task:

- `none`
- `noop`
- `test`
- `vercel_queue`

Result categories after this task:

- `disabled`
- `noop`
- `enqueued`
- `provider_config_missing`
- `provider_error`
- `unsupported_provider`
- `unexpected_error`

`vercel_queue` behavior:

- Requires `ENABLE_PAID_JOB_QUEUE_TRIGGER=true`.
- Requires `PAID_JOB_QUEUE_PROVIDER=vercel_queue`.
- Requires `PAID_JOB_QUEUE_TOPIC`.
- Calls `send(topic, payload, { idempotencyKey, retentionSeconds })`.
- Uses `paid-job:<generationJobId>` as the Vercel Queues idempotency key.
- Treats Vercel duplicate-message responses as an idempotent accepted enqueue result.
- Returns `provider_config_missing` if the queue topic is absent.
- Returns `provider_error` for queue send failures.

## Queue Config

`apps/web/vercel.json` now configures:

- Function: `src/app/api/internal/queues/paid-generation/route.ts`
- Trigger type: `queue/v2beta`
- Topic: `paid-generation-jobs`
- Retry delay: `60` seconds

This route appears in the local Next build route inventory as:

- `/api/internal/queues/paid-generation`

The route is not intended as a public/manual API surface; it is the Vercel Queues consumer function.

## Consumer / Handler Design

New consumer service:

- `processPaidJobQueueMessage(...)`
- `parsePaidJobQueuePayload(...)`

Consumer route:

- `POST /api/internal/queues/paid-generation`
- Uses `QueueClient(...).handleCallback(...)`.
- Uses `VERCEL_REGION` when available and falls back to `iad1` locally to avoid build-time region warnings.

Consumer behavior:

- Validates payload shape.
- Requires `ENABLE_PAID_JOB_QUEUE_TRIGGER=true` before processing.
- Requires `ENABLE_PAID_GENERATION_PROCESSOR=true` before invoking the processor.
- Requires DB config before invoking the processor.
- Calls `processPaidAnalysisJobs({ limit: 1, lockedBy: "paid_generation_queue" })`.
- Does not expose `/api/internal/jobs/process` directly to Vercel Queues.
- Does not mutate payment state itself.
- Leaves job/result idempotency to the existing processor and DB state machine.

## Payload Safety

Queue payload remains DB-reference-only:

- `paymentIntentId`
- `generationJobId`
- `moduleSlug`
- `triggerSource`

Payload deliberately excludes:

- raw user input
- raw `pa_` token
- `pcs_` checkout session token
- provider payload
- decrypted provider payload
- tokenized URLs
- queue credentials
- provider credentials

Tests assert that trigger and consumer outputs do not contain raw token/provider payload markers.

## Integration Points

Existing Phase 4A integration points remain unchanged:

- Verified NewebPay NotifyURL delivery artifact creation calls `triggerPaidJobProcessing(...)`.
- Operator fake-paid delivery artifact creation calls `triggerPaidJobProcessing(...)`.

With the queue flag off, behavior remains unchanged:

- no enqueue
- manual processor fallback remains
- fake-paid QA path remains compatible

Routes that do not trigger queue processing:

- ReturnURL
- payment status polling
- payment access page
- `pa_` unlock resolver

## Idempotency Model

Phase 4B.1 uses two layers:

- Vercel Queues idempotency key: `paid-job:<generationJobId>`.
- Existing paid generation processor DB idempotency and job locking.

Duplicate NotifyURL and duplicate operator fake-paid calls remain safe because delivery artifact creation is already idempotent and the queue payload points to DB state rather than containing work data.

Deferred:

- dedicated queue event/audit table
- provider enqueue attempt counters
- targeted processor API for a specific `generationJobId`

The current consumer processes one due paid job from DB as source of truth. A future targeted processor method could use the queue payload’s `generationJobId` for narrower processing, but that is not required for initial safe queue integration.

## Feature Flags / Env Names

Names only, no values:

- `ENABLE_PAID_JOB_QUEUE_TRIGGER`
- `PAID_JOB_QUEUE_PROVIDER`
- `PAID_JOB_QUEUE_TOPIC`
- `ENABLE_PAID_GENERATION_PROCESSOR`
- `DATABASE_URL`

Expected staging setup for smoke:

- Branch-scoped Preview(`staging`) should be authoritative.
- `ENABLE_PAID_JOB_QUEUE_TRIGGER=true`
- `PAID_JOB_QUEUE_PROVIDER=vercel_queue`
- `PAID_JOB_QUEUE_TOPIC=paid-generation-jobs`
- `ENABLE_PAID_GENERATION_PROCESSOR=true`

Production remains disabled unless explicitly configured later.

## Validation

Ran:

- `cd apps/web && corepack pnpm test -- paid-job-queue` - passed, 56 test files / 352 tests.
- `cd apps/web && corepack pnpm lint` - passed.
- `cd apps/web && corepack pnpm test` - passed, 56 test files / 352 tests.
- `cd apps/web && corepack pnpm build` - passed; route inventory includes `/api/internal/queues/paid-generation`.

Python validation was not run because this task changed only the web app and documentation.

## Staging Smoke Requirements

Live smoke is deferred until owner/operator confirms Vercel Queues setup in the dashboard for `anyu-next`.

Recommended smoke:

1. Confirm Vercel Queues dashboard/topic visibility for `anyu-next`.
2. Set branch-scoped Preview(`staging`) env values for queue trigger and topic.
3. Deploy staging from the latest `staging` commit.
4. Run fake-paid QA with existing staging secrets.
5. Confirm queue message observed in Vercel Queues.
6. Confirm paid generation is processed without manual processor call.
7. Confirm manual processor fallback still works if queue processing fails.

## Tech Debt Review

New technical debt introduced:

- The queue consumer currently invokes the generic processor for one due paid job instead of a targeted `generationJobId` processor path.
- Queue enqueue attempts are not persisted in an audit table.

Existing technical debt observed:

- Vercel Hobby Cron route still exists as a fallback wrapper but must not become the primary paid-generation trigger.
- `payment_success_future` remains a confusing trigger-source label from earlier payment phases.

Opportunistic cleanup completed:

- Avoided Vercel Queues build-time region warnings by using an explicit `QueueClient` region fallback in the consumer route.

Deferred cleanup candidates:

- Add targeted processor function for a specific generation job.
- Add queue attempt/event observability after staging smoke proves provider behavior.
- Decide whether the old cron wrapper should remain as emergency fallback or be removed after queue launch.

## Blockers / Uncertainties

- Live Vercel Queues availability remains unproven until dashboard/staging smoke.
- Exact Vercel Queues operational limits for the active account should be confirmed in the dashboard during staging setup.
- Production enablement remains intentionally blocked by payment launch gates.

## Recommended Next Step

Run **Vercel Queues Staging Smoke / Phase 4B.2 v0**:

- configure branch-scoped Preview(`staging`) queue env values,
- deploy staging,
- run fake-paid QA,
- confirm queue-triggered processor completion,
- document queue dashboard evidence and manual fallback behavior.
