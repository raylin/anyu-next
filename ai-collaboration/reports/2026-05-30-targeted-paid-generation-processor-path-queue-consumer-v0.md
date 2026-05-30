# Targeted Paid Generation Processor Path for Queue Consumer v0

Date: 2026-05-30

## Summary

Added a targeted paid generation processor path so Vercel Queues messages process the exact `generationJobId` carried in the queue payload.

Before this task, the queue consumer validated `generationJobId` but called generic manual processing:

- `processPaidAnalysisJobs({ limit: 1, lockedBy: "paid_generation_queue" })`

That could process a different due paid job if multiple paid jobs were queued. The consumer now calls:

- `processPaidAnalysisJobById({ generationJobId, lockedBy: "paid_generation_queue" })`

No payment runtime, production flags, Vercel env values, NewebPay behavior, LINE delivery, public copy, or deployment behavior changed.

## Files Changed

- `apps/web/src/lib/db/generation-jobs.ts`
- `apps/web/src/lib/modules/paid-generation-processor.ts`
- `apps/web/src/lib/payments/paid-job-queue-consumer.ts`
- `apps/web/src/tests/generation-jobs.test.ts`
- `apps/web/src/tests/paid-generation-processor.test.ts`
- `apps/web/src/tests/paid-job-queue-consumer.test.ts`
- `ai-collaboration/handoffs/2026-05-30-targeted-paid-generation-processor-path-queue-consumer-v0-handoff.md`
- `ai-collaboration/reports/2026-05-30-targeted-paid-generation-processor-path-queue-consumer-v0.md`
- `ai-collaboration/summaries/summary_log.md`

## Targeted Processor API

New DB helper:

- `claimDuePaidAnalysisJobById({ jobId, lockedBy, now })`

Behavior:

- Claims only the requested `generation_jobs.id`.
- Requires `job_type = paid_analysis`.
- Requires status `queued` or `retry_scheduled`.
- Requires `next_run_at <= now`.
- Requires `attempt_count < max_attempts`.
- Uses `FOR UPDATE SKIP LOCKED`.
- Sets the job to `processing`, increments `attempt_count`, and records lock metadata.

New processor entrypoint:

- `processPaidAnalysisJobById({ generationJobId, lockedBy, now })`

Behavior:

- Claims only the requested job id.
- Reuses the existing paid generation implementation after claim.
- Does not create payment intents, entitlements, paid access tokens, or queue artifacts.
- Does not expose raw input, raw tokens, provider payloads, or tokenized URLs.
- Keeps generic `processPaidAnalysisJobs(...)` unchanged for manual fallback.

## Result Categories

Targeted processor categories:

- `processed`
- `already_completed`
- `already_processing`
- `not_found`
- `invalid_job`
- `failed`
- `retryable_error`
- `unexpected_error`

Queue consumer categories now include:

- `processed`
- `already_completed`
- `already_processing`
- `not_found`
- `invalid_job`
- `failed`
- `retryable_error`
- `disabled`
- `processor_disabled`
- `invalid_payload`
- `database_config_missing`
- `unexpected_error`

Queue consumer behavior:

- `processed` and `already_completed` remain successful/idempotent.
- `not_found`, `invalid_job`, `already_processing`, and `failed` are terminal safe categories from the consumer perspective.
- `retryable_error` and `unexpected_error` remain failing categories so Vercel Queues can retry.
- `disabled` and `processor_disabled` remain non-mutating and do not call the processor.

## Manual Fallback Compatibility

The existing manual processor route remains compatible:

- `/api/internal/jobs/process`
- still calls `processPaidAnalysisJobs({ limit, dryRun })`
- still supports generic due-job processing
- still requires internal job auth and processor feature flag

This preserves the fake-paid QA/manual recovery path.

## Idempotency / Safety

The targeted path keeps DB as source of truth:

- completed target job returns `already_completed`
- processing target job returns `already_processing`
- missing job returns `not_found`
- invalid job type/source returns `invalid_job`
- retryable processing failures return `retryable_error`
- duplicate queue messages remain safe because the claim helper only claims due jobs and completed jobs are idempotent

The queue payload remains DB-reference-only:

- `paymentIntentId`
- `generationJobId`
- `moduleSlug`
- `triggerSource`

It does not contain raw input, raw `pa_`, `pcs_`, provider payload, decrypted provider data, or tokenized URLs.

## Tests Added / Updated

Updated coverage:

- DB helper claims only the requested due paid-analysis job by id.
- Targeted processor processes exact `generationJobId`.
- Targeted processor does not call generic due-job claiming.
- Completed target job is idempotent.
- Missing target job returns `not_found`.
- Invalid target job returns `invalid_job`.
- Processing target job returns `already_processing`.
- Queue consumer calls `processPaidAnalysisJobById(...)` with the exact payload `generationJobId`.
- Queue consumer does not process another due job when a different target id is present.
- Queue consumer preserves safe terminal categories.
- Queue consumer returns retryable processor errors as queue retry failures.
- Existing manual processor behavior remains tested.

## Validation

Ran:

- `cd apps/web && corepack pnpm test -- paid-generation-processor.test.ts paid-job-queue-consumer.test.ts generation-jobs.test.ts` - passed, 56 files / 360 tests.
- `cd apps/web && corepack pnpm lint` - passed.
- `cd apps/web && corepack pnpm build` - passed.

Full validation is recorded in the completion summary.

Python validation was not run because this task changed only the web app and documentation.

## Tech Debt Review

New technical debt introduced:

- None beyond the existing queue smoke dependency.

Existing technical debt observed:

- Live Vercel Queues staging smoke is still pending.
- Queue enqueue attempts are not persisted in an audit table.
- Local `origin/staging` tracking ref still has permission-update issues after push operations.

Opportunistic cleanup completed:

- Removed the Phase 4B.1 targeted-processing caveat by making queue consumption job-specific.

Deferred cleanup candidates:

- Add queue attempt/audit persistence after live smoke proves provider behavior.
- Decide whether terminal queue categories should be explicitly acknowledged with richer queue-handler observability.

## Remaining Phase 4B.2 Smoke Steps

Recommended staging smoke remains:

1. Confirm Vercel Queues dashboard/topic visibility for `anyu-next`.
2. Set branch-scoped Preview(`staging`) env values:
   - `ENABLE_PAID_JOB_QUEUE_TRIGGER=true`
   - `PAID_JOB_QUEUE_PROVIDER=vercel_queue`
   - `PAID_JOB_QUEUE_TOPIC=paid-generation-jobs`
   - `ENABLE_PAID_GENERATION_PROCESSOR=true`
3. Deploy staging from the latest `staging` commit.
4. Run fake-paid QA with staging secrets.
5. Confirm queue message observed and target generation job processed.
6. Confirm manual processor fallback still works.

## Recommended Next Step

Run **Vercel Queues Staging Smoke / Phase 4B.2 v0** with branch-scoped Preview(`staging`) queue env enabled.
