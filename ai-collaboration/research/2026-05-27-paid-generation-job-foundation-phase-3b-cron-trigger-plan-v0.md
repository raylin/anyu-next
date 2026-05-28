# Paid Generation Job Foundation Phase 3B — Cron Trigger Plan v0

Date: 2026-05-27

## 1. Summary

Recommendation: do not add paid-generation cron yet. Keep Phase 3B as a rollout plan and continue with manual operator triggering on staging until there is explicit approval to add cron configuration.

When cron is implemented, start with a narrow paid-generation cron wrapper that calls the existing processor with `jobType=paid_analysis`, `limit=1`, and aggregate-only responses. Use `CRON_SECRET` for Vercel Cron because Vercel automatically sends it as an `Authorization: Bearer <secret>` header, and keep `INTERNAL_JOB_SECRET` for manual/operator processor calls. The current repo already uses this bearer-header pattern for retention cleanup.

Initial production cron should be either disabled or no-op/low-risk only. Do not combine cron enablement with request-route enqueue-only behavior.

## 2. Current Processor State

Completed:

- `generation_jobs` schema exists in staging and production.
- `POST /api/internal/jobs/process` exists for `paid_analysis`.
- Processor endpoint is secret-gated.
- Processor endpoint is gated by `ENABLE_PAID_GENERATION_PROCESSOR`.
- Processor supports aggregate-only responses.
- Claiming uses `FOR UPDATE SKIP LOCKED`.
- Stale lock recovery runs at processor start.
- Staging processor smoke completed one synthetic queued job through provider source.
- Production processor flag/secret remain absent.

Not implemented:

- Paid-generation cron trigger.
- Paid-generation cron wrapper route.
- Request-route enqueue-only behavior.
- LINE/LIFF/short-code enqueue-only behavior.
- Payment success enqueue behavior.

Existing repo cron pattern:

- `apps/web/vercel.json` currently schedules `/api/cron/retention-cleanup`.
- `apps/web/src/app/api/cron/retention-cleanup/route.ts` checks `Authorization: Bearer <secret>`.
- Retention cleanup uses `RETENTION_CLEANUP_SECRET` with `CRON_SECRET` fallback.
- Vercel docs state that when `CRON_SECRET` is set, Vercel sends it as an `Authorization` header with the `Bearer` prefix for cron invocations: https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs

## 3. Cron Options

Option A: manual trigger only for now.

- Operators call `POST /api/internal/jobs/process` with the internal bearer secret.
- Pros: lowest production risk, no background cost, already verified on staging.
- Cons: queued jobs need an operator or later route kick to progress.

Option B: staging cron only.

- Add a staging/preview-only scheduled trigger if Vercel supports the desired environment behavior.
- Pros: validates schedule behavior before production.
- Cons: preview cron support and domain behavior may not match production; it still adds operational surface.

Option C: production cron no-op enabled.

- Add production cron with `CRON_SECRET`, processor flag, and max one job per run while normal production routes remain non-enqueue-only.
- Pros: validates production scheduled path with low expected work.
- Cons: adds production background surface and must be monitored.

Option D: production cron plus enqueue route.

- Cron is live and user-facing routes enqueue paid generation work.
- Pros: target async architecture.
- Cons: too early; combines too many behavior changes.

Recommendation: use Option A now. If a cron implementation is approved next, use Option C only after a no-op production gate, or Option B if staging cron behavior is known to be reliable. Do not use Option D yet.

## 4. Recommended Initial Cron Strategy

For the next implementation task, add a dedicated cron wrapper route rather than scheduling `POST /api/internal/jobs/process` directly.

Recommended route:

```text
GET /api/cron/paid-generation
```

Reason:

- Vercel Cron examples and current repo cron route use `GET`.
- The existing processor endpoint is intentionally `POST` and better suited for manual/operator calls.
- A wrapper can translate the scheduled `GET` into an internal processor service call without exposing request body shape.
- The wrapper can hard-code safe defaults: `jobType=paid_analysis`, `limit=1`, `dryRun=false`.
- The wrapper can return the same aggregate-only response shape.

Initial cron state:

- Do not add cron config in this planning task.
- First implementation should add route tests and a no-op staging/prod verification plan.
- Do not enable production processor until explicit approval.

## 5. Cadence / Max Jobs

Recommended initial cadence:

- Manual staging/operator trigger now.
- Future production no-op/low-risk cron: every 5 minutes.
- Future faster delivery cadence: every 1 minute only after real payment or real queued jobs require it.

Recommended max jobs:

- Production initial: `limit=1`.
- Staging/manual smoke: `limit=1` or `2`.
- Increase to `3` only after monitoring confirms stable provider latency, fallback rate, and failure categories.

Why not every 1 minute now:

- Current normal production flow does not depend on queued jobs.
- A 5-minute interval reduces accidental provider/cost pressure.
- Vercel warns that cron invocations can overlap if a job runs longer than the interval; the processor claim helper is idempotent, but a slower cadence is still safer for first production readiness.

## 6. Secrets / Flags

Secrets:

- Use `INTERNAL_JOB_SECRET` for manual/operator `POST /api/internal/jobs/process`.
- Use `CRON_SECRET` for future Vercel Cron wrapper route.
- Do not print or commit either value.
- If either secret is exposed, rotate it.

Flags:

- `ENABLE_PAID_GENERATION_PROCESSOR` must stay required.
- Production processor flag must stay absent/false until explicit approval.
- `ENABLE_PAID_GENERATION_JOBS` controls job mirroring and is separate from processor execution.

Cron wrapper auth:

- Follow the current retention cleanup pattern: compare the `Authorization` header to `Bearer ${process.env.CRON_SECRET}`.
- If `CRON_SECRET` is absent, return a configuration failure, not a public no-op.
- Do not use query-string secrets unless there is no viable header-based path; query secrets are easier to leak via URLs/logs.

## 7. No-op Safety

Cron must be safe when no due jobs exist.

Expected aggregate no-op response:

```json
{
  "ok": true,
  "dryRun": false,
  "processed": 0,
  "completed": 0,
  "retryScheduled": 0,
  "failedFinal": 0,
  "staleRecovered": 0,
  "skipped": 0
}
```

No-op runs should:

- Not call the provider.
- Not create paid-result rows.
- Not write unnecessary rows.
- Not expose job IDs, dedupe keys, input refs, output refs, raw content, provider output, paid-result JSON, tokenized URLs, LINE IDs, or secrets.

## 8. Cost / Rate-limit Guardrails

Guardrails:

- Start production with `limit=1`.
- Keep max attempts bounded by existing job policy.
- Treat provider rate-limit/5xx errors as retryable with backoff.
- Treat provider auth/config errors as final and alert-worthy; do not keep hammering the provider.
- Monitor fallback rate and failed-final count before increasing cadence or limit.
- Do not enable cron and enqueue-only in the same release.
- Keep direct/current user-facing generation path unchanged until cron has production history.

If provider rate limit occurs:

- Schedule retry later with longer backoff.
- Keep operator report aggregate-only.

If provider auth/config error occurs:

- Mark final failure by safe category.
- Disable processor flag if repeated.
- Investigate env/provider configuration without printing secrets.

## 9. Metrics / Monitoring

V0 monitoring can use aggregate processor responses and DB counts manually.

Recommended metrics:

- `processor_run_count`
- `jobs_processed`
- `jobs_completed`
- `jobs_retry_scheduled`
- `jobs_failed_final`
- `jobs_stale_recovered`
- `queued_count`
- `processing_count`
- `retry_scheduled_count`
- `failed_final_count`
- average queued-to-completed duration
- fallback rate

Do not add:

- public metrics endpoint
- admin dashboard
- raw job/debug payload logging
- sessionized analytics changes

## 10. Staging Verification Plan

For a future cron implementation:

1. Verify missing/invalid secret returns `401`.
2. Verify processor flag disabled returns disabled/`403`.
3. Enable processor on staging only.
4. With no due jobs, verify aggregate zero-work response.
5. Create one synthetic queued job and verify it completes.
6. Create one stale processing job and verify recovery.
7. Create one future `next_run_at` job and verify it is not claimed.
8. Verify no job internals appear in route responses or reports.
9. Verify current paid result, unlock, LIFF, and short-code behavior remains unchanged.

## 11. Production Rollout Plan

Recommended production steps for a later implementation:

1. Confirm production `/api/health` build marker.
2. Confirm production `generation_jobs` schema exists.
3. Confirm production request routes are still not enqueue-only.
4. Configure `CRON_SECRET` if not already suitable for cron.
5. Keep `INTERNAL_JOB_SECRET` separate for manual/operator calls if desired.
6. Deploy cron wrapper with processor flag still disabled.
7. Confirm disabled production cron/manual call returns safe disabled response.
8. With owner approval, enable `ENABLE_PAID_GENERATION_PROCESSOR=true`.
9. Start with `limit=1` and 5-minute cadence, or manual no-op trigger first.
10. Run no-op production smoke and confirm `generation_jobs` row counts remain stable when no due jobs exist.
11. Do not enable enqueue-only routes until separate approval and post-cron monitoring.

## 12. Rollback / Disable Procedure

If cron misbehaves:

1. Set `ENABLE_PAID_GENERATION_PROCESSOR=false` or remove it.
2. Disable/remove the cron schedule.
3. Inspect aggregate job status counts.
4. Rotate `CRON_SECRET` or `INTERNAL_JOB_SECRET` if exposure is suspected.
5. Leave `generation_jobs` table in place; it is additive.

Why flag first:

- The processor endpoint and future cron wrapper are inert without the flag.
- Disabling the flag stops provider work even if cron still invokes the route.

## 13. Temporary Vercel Deployment Cleanup Note

Phase 3A reported an unintended temporary Vercel project deployment during final deploy handling. It was not aliased to staging or production.

Operator recommendation:

- Remove the unintended temporary Vercel project from the Vercel console, or confirm it is harmless and inaccessible.
- Do not delete it via code in this planning task.

## 14. What Not To Build Yet

Do not build yet:

- request-route enqueue-only behavior
- LINE enqueue-only behavior
- payment success enqueue
- external queue vendor
- admin retry UI
- dashboard
- general AI job platform
- sessionized metrics
- new product module
- ads/payment activation

## 15. Recommended Next Step

If approved, implement Phase 3C as a narrow cron wrapper route plus `vercel.json` schedule, with route tests and no production processor enablement by default.

Suggested first implementation target:

- `GET /api/cron/paid-generation`
- `CRON_SECRET` bearer auth
- `ENABLE_PAID_GENERATION_PROCESSOR` gate
- hard-coded `jobType=paid_analysis`
- `limit=1`
- aggregate-only response
- no request-route enqueue-only changes
