# Processor Latency + Paid Generation Readiness v0

## Metadata

- task name: Processor Latency + Paid Generation Readiness v0
- date: 2026-06-07
- report path: `ai-collaboration/reports/2026-06-07-processor-latency-paid-generation-readiness-v0.md`
- commit: not committed
- branch / push status: not pushed
- model / effort: GPT-5 Codex, high
- taskStartedAt: 2026-06-07T15:12:34Z
- taskCompletedAt: 2026-06-07T15:23:54Z
- totalWallClockDuration: 11m20s
- humanWaitDuration: 0m00s
- netCodexWorkDuration: 11m20s

## Context

- why this task exists: Gate 1 functional production smoke passed, but paid generation stayed queued longer than expected and required one approved processor invocation.
- upstream blocker / mainline context: soft public readiness remains conditional until processor latency and automatic drain behavior are measurable.
- out-of-scope items: production runtime open, production payment, real Email/LINE, Vercel env changes, DB mutation, theme work, Module 02.

## Scope

- what changed: added paid-generation latency/readiness metrics, sanitized Admin/Ops generation visibility, a bounded mock benchmark command, tests, and production gate/runbook updates.
- what did not change: no schema migration, no processor behavior change, no production runtime/payment/channel action.

## Implementation Summary

- files / areas changed:
  - `apps/web/src/lib/modules/paid-generation-readiness.ts`
  - `apps/web/src/lib/admin/paid-result-lookup.ts`
  - `tools/admin-cli/src/lookup-result.ts`
  - `apps/web/scripts/paid-generation-benchmark-qa.mjs`
  - `apps/web/package.json`
  - targeted tests for readiness, benchmark output, Admin lookup, and Admin CLI lookup
  - `ai-collaboration/process/production-gate-policy.md`
  - dashboard, summary, handoff, and this report
- key design decisions:
  - reused existing timestamps instead of adding a migration.
  - exposed latency as millisecond metrics and booleans, not raw timestamps or internal IDs.
  - kept benchmark default to mock mode with `maxJobs=5` and explicit `automaticDrainVerified=false`.
  - did not implement staging benchmark in v0 because it needs a deployed safe harness and freshness guard; production is not the benchmark environment.
- local / opportunistic cleanup decisions: updated stale dashboard blocker language from Admin-token/dashboard-verification blocker to processor readiness blocker.

## Current Processor Architecture

- Paid delivery artifact creation creates/reuses entitlement and a `generation_jobs` row after paid truth.
- Queue trigger can send a reference-only payload with `generationJobId` via `vercel_queue`; no sensitive payload is placed in the queue.
- Vercel Queue callback calls the targeted processor path for that exact `generationJobId`.
- Cron route calls `processPaidAnalysisJobs({ limit: 1, lockedBy: "paid_generation_cron" })`.
- Internal operator processor route calls `processPaidAnalysisJobs` with optional `limit` and `dryRun`.
- Processor claiming uses DB row locking with `FOR UPDATE SKIP LOCKED`, increments `attemptCount`, sets `lockedAt`, and processes claimed jobs sequentially per invocation.
- Idempotency is provided by generation-job dedupe keys, targeted job status checks, existing paid-result checks, and DB locking.
- Retry/failure state is stored on `generation_jobs` via `retry_scheduled`, `failed_final`, `lastErrorCategory`, `lastErrorAt`, and attempt counts.
- User-facing queued state remains the paid-result pending/processing path until paid result completion.

## Metric Model

- `enqueueLatencyMs`: payment paid / entitlement active to generation job creation.
- `queueWaitMs`: generation job creation to processor start/lock.
- `processorPickupLatencyMs`: eligible queued job to processor pickup.
- `processingDurationMs`: processor start to paid result completion.
- `totalPaidReadyMs`: payment paid / entitlement active to paid result completion.
- `deliveryReadyMs`: paid result completion to first Email/LINE access-link readiness timestamp.
- `queueStuckThresholdMs`: v0 default `300000` ms.

Existing schema was sufficient:

- `payment_intents.paid_at`
- `entitlements.activated_at`
- `generation_jobs.created_at`, `next_run_at`, `locked_at`, `updated_at`, `attempt_count`, `max_attempts`, `last_error_*`
- `analysis_paid_results.started_at`, `completed_at`
- `paid_result_access_links.created_at`, `sent_at`

## Admin/Ops Visibility

`pnpm ops lookup-result` now accepts and pretty-prints sanitized generation readiness fields:

- job status and safe failure category
- jobCreatedAtPresent / jobStartedAtPresent / jobCompletedAtPresent / jobUpdatedAtPresent
- paidResultCompletedAtPresent
- attemptCount / maxAttempts
- lastErrorAtPresent
- queueStateCategory
- recommendedAction
- latency metrics in milliseconds

No prompts, raw user input, provider payloads, provider IDs, tokenized URLs, contact hashes, encrypted recipients, or private recipient values are exposed.

## Benchmark Method

Added:

```bash
cd apps/web && corepack pnpm run qa:paid-generation:benchmark -- --mode mock --jobs 1 --json
cd apps/web && corepack pnpm run qa:paid-generation:benchmark -- --mode mock --jobs 3 --concurrency 2 --json
```

Benchmark safety:

- mock mode by default
- jobs capped at 5
- concurrency capped at 5
- JSON output
- no real payment
- no real Email
- no real LINE
- production untouched
- no private/tokenized output

## Measured Baseline

Mock benchmark, `jobs=1`, `concurrency=1`:

- enqueueLatencyMs p95: 800
- queueWaitMs p95: 2000
- processorPickupLatencyMs p95: 2000
- processingDurationMs p95: 18000
- totalPaidReadyMs p95: 20800
- deliveryReadyMs p95: 1200
- failures: 0
- stuckJobs: 0
- benchmark classification: `ready_for_owner_controlled_window`
- evidence limit: mock mode does not prove deployed cron or automatic provider drain latency

Mock benchmark, `jobs=3`, `concurrency=2`:

- enqueueLatencyMs p95: 900
- queueWaitMs p95: 3500
- processorPickupLatencyMs p95: 3500
- processingDurationMs p95: 19200
- totalPaidReadyMs p95: 23600
- deliveryReadyMs p95: 1400
- failures: 0
- stuckJobs: 0
- benchmark classification: `ready_for_owner_controlled_window`
- evidence limit: mock mode does not prove deployed cron or automatic provider drain latency

These are mock contract baselines, not production/staging automatic-drain baselines.

## Queue Wait / Pickup / Duration Result

- queue wait result: mock p95 <= 3500 ms.
- processor pickup result: mock p95 <= 3500 ms.
- processing duration result: mock p95 <= 19200 ms.
- total paid ready result: mock p95 <= 23600 ms.
- deployed automatic queue pickup result: not measured in this task.
- production v4 observed fact: job stayed queued longer than expected and needed one approved processor invocation; exact latency was not captured.

## Parallelism / Concurrency Finding

- Current generic processor claims up to a clamped limit and processes claimed jobs sequentially in one invocation.
- Targeted queue consumer processes the exact `generationJobId` from the queue payload.
- DB locking uses `FOR UPDATE SKIP LOCKED`; duplicate/racing processors should not process the same due job concurrently.
- Multiple processor invocations can race safely at the claim layer, but v0 operational limit should remain small and sequential for paid production traffic until deployed queue pickup is measured.
- Safe v0 recommendation: owner-controlled windows only with low volume and operator monitoring; no broad traffic.

## Proposed Initial SLO

Starting proposal, pending deployed data:

- paidResultReadyP50 <= 60s
- paidResultReadyP95 <= 180s
- queueWaitP95 <= 60s
- no queued job > 5 minutes without safe Admin/Ops action
- processor failure rate = 0 in controlled small sample

Confidence level: low-to-medium. The metric model and mock harness exist, but deployed automatic drain behavior was not measured in v0.

## Readiness Classification

- Gate 1 functional smoke: already accepted as pass.
- Processor readiness classification for soft public: `blocked_needs_automatic_drain`.
- Owner-only controlled window: possible only as an explicitly monitored exception with Admin/Ops lookup and approved processor action ready.
- Low-key soft public: not recommended yet.
- Ads / broader traffic: blocked.

Rationale:

- Functional payment/result/delivery path is proven.
- Admin/Ops can now report stuck/queued categories and latency fields.
- Mock benchmark is structured and bounded.
- Deployed automatic queue drain latency remains unproven.
- Production v4 needed approved manual processor invocation once.

## Runbook / Monitoring Recommendations

- Use `pnpm ops lookup-result --env <env> --id <resultId>` to inspect generation status, queue state, attempts, and safe latency metrics.
- If `queueStateCategory=queued_within_threshold` or `processing_within_threshold`, wait using structured helpers.
- If `queueStateCategory=queued_stuck` or `retry_scheduled`, use only an approved processor path and record the action.
- Stop accepting payments if jobs repeatedly need manual processor action.
- Add a deployed staging benchmark path next, using no-card/fake-paid and freshness guard, before any soft public decision.
- Consider a minimal scheduled monitor later: aggregate queued paid jobs older than threshold, no private values.

## Validation

- commands run:
  - `cd apps/web && corepack pnpm exec vitest run src/tests/paid-generation-readiness.test.ts src/tests/paid-generation-benchmark-qa.test.ts src/tests/admin-paid-result-lookup.test.ts`: pass, 14 tests
  - `corepack pnpm --filter @anyu/admin-cli test -- lookup-result.test.ts`: pass, 5 files / 49 tests
  - `cd apps/web && corepack pnpm lint`: pass
  - `cd apps/web && corepack pnpm test`: pass, 104 files / 702 tests
  - `corepack pnpm --filter @anyu/admin-cli test`: pass, 5 files / 49 tests
  - `corepack pnpm --filter @anyu/admin-cli typecheck`: pass
  - `cd apps/web && corepack pnpm build`: pass
  - `cd apps/web && corepack pnpm run qa:paid-generation:benchmark -- --mode mock --jobs 1 --json`: pass
  - `cd apps/web && corepack pnpm run qa:paid-generation:benchmark -- --mode mock --jobs 3 --concurrency 2 --json`: pass
- gateStatus: pass for implementation/validation; readiness remains conditional
- commandExitCode: 0 for final validation commands
- requiredChecksStatus: pass
- optionalChecksStatus: skipped
- targetDeployCommit: not_applicable
- deployedCommitAtGateStart: not_applicable
- deployedCommitAtGateEnd: not_applicable
- freshnessStatus: not_applicable
- gates skipped and why:
  - staging benchmark skipped because this task did not deploy and v0 staging benchmark requires a deployed safe harness/freshness guard.
  - production benchmark/payment/runtime skipped by policy.
  - real Email/LINE skipped by policy.

## Safety

- production runtime enabled: no
- payment run: no
- Email sent: no
- LINE sent: no
- Vercel env changed: no
- DB mutated: no
- secrets/private data exposed: no

## Result

- result: pass for instrumentation/benchmark/reporting; soft public readiness remains blocked
- first failure category: not_applicable
- blocker status: remaining blocker: deployed automatic paid-generation drain latency not measured

## Tech Debt / Cleanup Notes

- new technical debt introduced: staging benchmark mode is intentionally unavailable in v0; it needs a deployed safe harness before use.
- existing technical debt observed: production v4 needed an approved processor invocation and exact production queue latency was not captured.
- opportunistic cleanup completed: dashboard status corrected from stale pre-v4 blockers to current processor readiness blocker.
- deferred cleanup candidates:
  - add staging no-card/fake-paid benchmark with freshness guard.
  - add aggregate Admin/Ops queued-job monitor.
  - decide whether benchmark mock samples should be replaced by DB-backed local integration once test DB harness exists.

## Decisions Made

- No schema migration was needed for v0 metrics.
- Admin/Ops should expose present flags and latency durations, not raw timestamps.
- Mock benchmark output must explicitly state `automaticDrainVerified=false`.
- Overall soft-public readiness classification remains `blocked_needs_automatic_drain` despite fast mock timings.

## Uncertainties / Blockers

- Is Vercel Queue callback firing automatically and consistently in the current production configuration?
- What is the deployed staging queue pickup p95 for 1-3 no-card/fake-paid jobs?
- What exact user-facing pending duration occurred in v4?
- Should owner-only controlled windows allow manual processor invocation as an operational fallback, or require automatic drain first?

## Recommended Next Step

Implement a deployed staging paid-generation automatic-drain benchmark using no-card/fake-paid, freshness guard, Admin/Ops latency fields, and no real Email/LINE/payment. Do not proceed to low-key soft public until that benchmark proves queue drain within the proposed SLO or identifies the exact processor/queue fix.

## Paste-Back Context

Processor Latency + Paid Generation Readiness v0 added a safe metric model, Admin/Ops latency visibility, and bounded mock benchmark command. Validation passed: lint, full app tests, Admin CLI tests/typecheck, build, and mock benchmarks. Gate 1 functional smoke remains accepted, but soft public readiness is still `blocked_needs_automatic_drain` because production v4 needed one approved processor invocation and deployed automatic queue pickup latency was not measured. Next task should be a deployed staging automatic-drain benchmark with no real payment or channels.
