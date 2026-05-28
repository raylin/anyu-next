# Queue / Worker Strategy Evaluation v0 Execution Report

## Summary

Created a planning evaluation for ANYU's durable paid-generation trigger strategy after Vercel Hobby Cron proved unsuitable for low-latency paid generation. No code, cron config, runtime behavior, payment behavior, LINE behavior, DB schema, or production settings were changed.

## Files Created

- `ai-collaboration/handoffs/2026-05-27-queue-worker-strategy-evaluation-v0-handoff.md`
- `ai-collaboration/research/2026-05-27-queue-worker-strategy-evaluation-v0.md`
- `ai-collaboration/reports/2026-05-27-queue-worker-strategy-evaluation-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Sources Checked

- Vercel Cron usage/pricing: https://vercel.com/docs/cron-jobs/usage-and-pricing
- Upstash QStash overview: https://upstash.com/docs/qstash/overall/getstarted
- Upstash QStash pricing: https://upstash.com/docs/qstash/overall/pricing
- Upstash QStash signature verification: https://upstash.com/docs/qstash/howto/signature
- Upstash QStash retry behavior: https://upstash.com/docs/qstash/features/retry
- Inngest pricing: https://www.inngest.com/pricing
- Trigger.dev pricing: https://trigger.dev/pricing
- Google Cloud Tasks pricing: https://cloud.google.com/tasks/pricing
- Railway pricing plans: https://docs.railway.com/pricing/plans
- Fly pricing: https://fly.io/docs/about/pricing/
- Render pricing/background workers: https://render.com/pricing and https://render.com/docs/background-workers/

## Recommendation

- Short-term: keep the current `generation_jobs` + processor setup with manual/operator recovery; do not add a new queue before payment approval.
- Payment-launch: prefer a QStash-like webhook queue if a staging proof confirms signed delivery, retries, and safe payloads.
- Scale-up: revisit Inngest/Trigger.dev if follow-up sessions or multi-step workflows become real.

## Short-term Plan

- Treat Vercel Hobby daily cron as recovery/readiness only.
- Keep request flows unchanged.
- Use operator/manual processor trigger for staging/beta.
- Do not make enqueue-only changes.

## Payment-launch Plan

- Add a thin queue publish adapter after payment approval.
- Queue payload should contain only safe references.
- Verify webhook signatures.
- Keep `analysis_paid_results` as delivery truth.
- Keep processor idempotent and aggregate-only.

## Scale-up Plan

- Use Inngest or Trigger.dev only if workflows become multi-step.
- Use a dedicated worker only if Vercel serverless constraints become a measurable bottleneck.
- Use Cloud Tasks/Cloud Run only if ANYU is already moving into GCP or needs stronger cloud queue semantics.

## Validation Results

- `python3 -m compileall oradar`: passed.
- `python3 -m compileall tools/topic-ingestion`: passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`: passed, 25 tests.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed, 39 files / 261 tests.
- `cd apps/web && corepack pnpm build`: passed.
- Playwright was not run; this was a docs/research-only evaluation with no UI/runtime change.

## Tech Debt Review

### New Technical Debt Introduced

None; docs/research only.

### Existing Technical Debt Observed

- Vercel Hobby daily cron is insufficient for paid-generation latency.
- Direct paid-generation orchestration still needs future consolidation if a queue adapter is added.
- Phase 3A temporary Vercel project cleanup remains an owner/operator console task.

### Opportunistic Cleanup Completed

None; no code changes were made.

### Deferred Cleanup Candidates

- QStash proof-of-concept after payment approval.
- Queue webhook auth adapter.
- Aggregate queue/processor monitoring.
- Follow-up workflow platform evaluation after Module 02 or relationship packs become concrete.

### Recommended Follow-up

Wait for NewebPay review. If real payment is approved, run a staging-only QStash proof-of-concept handoff.

## Deviations From Handoff

None.

## Git Commit

Pending until final commit step.

## Staging Push

Pending until final push step.

## Remaining Uncertainties

- Actual NewebPay approval timing and real payment launch date.
- Whether owner prefers paying for Vercel Pro before adding a new vendor.
- Whether QStash signing/retry behavior is acceptable after a staging proof.

## Recommended Next Step

Do not implement a queue yet. Run a focused QStash proof-of-concept only after payment approval or a clear need for near-realtime paid delivery.
