# Repeated / Concurrency Paid-Generation Benchmark v0

## Metadata

- task name: Repeated / Concurrency Paid-Generation Benchmark v0
- date: 2026-06-09
- report path: `ai-collaboration/reports/2026-06-09-repeated-concurrency-paid-generation-benchmark-v0.md`
- commit: not committed at report creation
- branch / push status: `staging` / not pushed at report creation
- model / effort: GPT-5 Codex, high effort
- taskStartedAt: 2026-06-09T14:52:28Z
- taskCompletedAt: 2026-06-09T15:05:55Z
- totalWallClockDuration: 13m 27s
- humanWaitDuration: 0m
- netCodexWorkDuration: 13m 27s

## Context

- why this task exists: Gate 1 functional smoke passed, paid-state visual alignment is complete enough to continue low-risk readiness gates, and production payment runtime remains disabled while NewebPay runtime activation waits.
- upstream blocker / mainline context: before more real payment activation work, the paid-generation path needed repeated request, retry, polling, and lightweight concurrency evidence without real payment or production runtime.
- out-of-scope items: production runtime, production payment, real Email/LINE, Vercel env changes, production DB mutation, NewebPay config, legal/product copy, and visual redesign.

## Scope

- what changed: added idempotent reuse handling for existing queued/processing/retry/final-failed generation jobs, plus focused tests for repeated polling, repeated paid-generation triggers, targeted processor concurrency, and invalid token stability.
- what did not change: provider/payment logic, entitlement creation logic, access-link resolver semantics, visual surfaces, production runtime state, Email/LINE delivery, Vercel env, and database schema.

## Current Paid-Generation Chain Inventory

| Step | Route / function / file | Idempotency / uniqueness | Duplicate protection | Retry / recovery path | Risk level |
| --- | --- | --- | --- | --- | --- |
| `payment_intent` | `payment_intents` schema in `apps/web/src/lib/db/schema.ts`; paid transition from NewebPay NotifyURL and operator/no-card helpers | unique `payment_intents_merchant_order_no_idx`; indexed by result/status/provider trade | one merchant order maps to one intent; entitlements have a unique payment-intent constraint | provider truth marks paid; failed/cancelled/expired states remain terminal by status | low for duplicate order identity; real provider retry remains covered by NotifyURL idempotency tests |
| entitlement | `apps/web/src/lib/db/entitlements.ts`; schema in `apps/web/src/lib/db/schema.ts` | unique `entitlements_payment_intent_unique_idx`; unique hash-only `entitlements_paid_access_token_hash_idx` | one entitlement per payment intent; paid token lookup uses hash-only token storage | revoked/refunded/expired map to safe terminal resolver states | low |
| paid access token | `resolvePaidAccessToken` / `resolvePaidEntitlementAccess` in `apps/web/src/lib/payments/paid-access-resolver.ts` | hash-only lookup; module slug match; expiry/status checks | invalid/wrong-module/missing tokens resolve to safe not-found/expired categories | terminal states are returned without consuming entitlement twice | low |
| generation job | `createOrReusePaidAnalysisJob`, `claimDuePaidAnalysisJobById`, and `claimDuePaidAnalysisJobs` in `apps/web/src/lib/db/generation-jobs.ts` | unique `generation_jobs_dedupe_key_idx` over job type, module slug, result id, prompt version, and schema version | `onConflictDoNothing` reuses existing jobs; processor claims via `FOR UPDATE SKIP LOCKED` | retryable failures move to `retry_scheduled`; stale processing locks can recover or fail final | medium before this task for direct repeated trigger path; now reduced |
| paid artifact / result | `requestDeferredPaidGeneration` in `apps/web/src/lib/modules/paid-generation-service.ts`; paid result DB helpers | current/completed paid result lookup by analysis result, prompt version, and schema version | completed results are reused; failed current results can retry within existing retry policy | failed paid result maps to safe failed state; provider failures mark retry/final by category | medium before this task for reused queued/processing job; now reduced |
| processor | `processPaidAnalysisJobById` / `processPaidAnalysisJobs` in `apps/web/src/lib/modules/paid-generation-processor.ts` | job claim by id/due queue with locked state and attempt count | repeated targeted calls return `already_processing` / `already_completed` when appropriate | retryable provider errors schedule backoff; stale locks recover via processor path | low to medium; deployed queue concurrency still needs broader evidence before soft public |
| polling/status route | `/api/modules/[moduleSlug]/paid-result/status` | read-only resolver/status lookup | repeated polling does not call generation request route and does not fall back from `pa_` tokens to legacy unlock lookup | queued/processing/pending/completed/expired/failed categories are stable | low |
| `/r` access-link route | `/r/[recoveryToken]` in `apps/web/src/app/r/[recoveryToken]/page.tsx`; resolver in `paid-result-recovery-links` | hash-only recovery token resolution and entitlement access resolution | invalid/expired/pending routes do not expose raw token values; completed state reuses the paid result | processing state asks the user to retry later; terminal states are safe | low for repeated reads; true route-level concurrent access is covered by resolver tests and existing access-link tests, not a new deployed benchmark |

## Benchmark Scenario Matrix

| Scenario | Expected behavior | Automated coverage | Result |
| --- | --- | --- | --- |
| Repeated status polling | same token can be polled repeatedly; no duplicate jobs; stable sanitized status | `paid-generation-route.test.ts` repeated `pa_` status polling test | pass |
| Repeated paid-generation trigger | same result/unlock path reuses existing job or returns safe no-op; no duplicate paid result/provider work | `paid-generation-service.test.ts` reused queued/processing/final-failed job tests | pass; implementation hardened |
| Processor repeated trigger | same targeted job processor endpoint can be invoked repeatedly without duplicate artifact creation | `paid-generation-processor.test.ts` targeted concurrency test plus existing already-processing/completed tests | pass |
| Lightweight concurrent requests | several simultaneous same-token/job calls produce one effective generation path | `Promise.all` service and processor tests; mock benchmark jobs=3 concurrency=2 | pass in local/mock scope |
| Expired/invalid token repeated access | repeated invalid/expired access returns stable safe error state with no side effects | `paid-generation-route.test.ts` repeated invalid `pa_` test plus existing resolver/access-link tests | pass |
| Failed job recovery path | failed/stuck states are visible and do not silently consume entitlement or regenerate indefinitely | reused `failed_final` service test; existing processor retry/final tests | pass; recovery behavior documented |
| Completed job repeated access | completed result access stays stable and does not create a new charge/job | existing service/resolver/processor completed-result tests | pass |

## Implementation Summary

- files / areas changed:
  - `apps/web/src/lib/modules/paid-generation-service.ts`
  - `apps/web/src/tests/paid-generation-service.test.ts`
  - `apps/web/src/tests/paid-generation-processor.test.ts`
  - `apps/web/src/tests/paid-generation-route.test.ts`
- key design decisions:
  - Reused queued, processing, and retry-scheduled generation jobs now return `status="processing"` with `reused=true`.
  - Reused final-failed generation jobs now return a safe `status="failed"` / `paid_generation_failed` response instead of continuing through paid-result creation.
  - Freshly created generation jobs preserve existing direct-generation behavior.
  - Completed/current paid result reuse remains unchanged.
- local / opportunistic cleanup decisions: none beyond narrowly hardening the exposed idempotency gap.

## Bugs Or Risks Found

- Found risk: `createOrReusePaidAnalysisJob` correctly deduped job rows, but `requestDeferredPaidGeneration` did not previously stop when the returned job was an existing queued/processing/retry/final-failed job. Under repeated or concurrent generation requests, that could continue into paid-result/provider work even though the job row was already present.
- Fix made: added reused-job status classification before paid-result creation/provider generation. Reused active jobs are now safe processing no-ops; reused final-failed jobs return a safe failed category.

## Automated Benchmark Results

### Mock benchmark, 1 job

- command: `cd apps/web && corepack pnpm run qa:paid-generation:benchmark -- --mode mock --jobs 1 --json`
- result: pass
- jobCount: 1
- concurrency: 1
- failures: 0
- stuckJobs: 0
- enqueueLatencyMs: p50=800, p95=800, max=800
- queueWaitMs: p50=2000, p95=2000, max=2000
- processorPickupLatencyMs: p50=2000, p95=2000, max=2000
- processingDurationMs: p50=18000, p95=18000, max=18000
- totalPaidReadyMs: p50=20800, p95=20800, max=20800
- deliveryReadyMs: p50=1200, p95=1200, max=1200
- readinessClassification: `ready_for_owner_controlled_window`
- evidence limit: mock mode does not prove deployed Vercel Queue / cron automatic-drain concurrency.

### Mock benchmark, 3 jobs / concurrency 2

- command: `cd apps/web && corepack pnpm run qa:paid-generation:benchmark -- --mode mock --jobs 3 --concurrency 2 --json`
- result: pass
- jobCount: 3
- concurrency: 2
- failures: 0
- stuckJobs: 0
- enqueueLatencyMs: p50=850, p95=900, max=900
- queueWaitMs: p50=2000, p95=3500, max=3500
- processorPickupLatencyMs: p50=2000, p95=3500, max=3500
- processingDurationMs: p50=18600, p95=19200, max=19200
- totalPaidReadyMs: p50=21450, p95=23600, max=23600
- deliveryReadyMs: p50=1300, p95=1400, max=1400
- readinessClassification: `ready_for_owner_controlled_window`
- evidence limit: mock mode proves deterministic benchmark behavior and bounded concurrency math, not deployed queue runtime behavior.

### Staging-safe no-card path

- command: `cd apps/web && corepack pnpm run qa:result-checkout:no-card`
- result: pass
- resultSourceCategory: Preview(staging) runtime
- productionDisabledCheck: pass
- providerPaymentSubmitted: false
- adminApiWaitPrimary: true
- fallbackTokenStatusUsed: false
- paid state: payment paid, entitlement active, paid result completed
- generation job: queued then completed through Admin API wait path
- limitation: this helper uses the operator fake-paid path, not NewebPay checkout intent, and it mutates Preview(staging) test data by design.

## Scenarios Not Fully Automated

- true deployed Postgres race under simultaneous real route invocations: not fully proven by unit tests. Current mitigation is the DB unique dedupe key plus `FOR UPDATE SKIP LOCKED`; local tests verify route/service/processor semantics.
- deployed repeated/concurrency automatic-drain: not run in this task. Prior evidence includes one deployed staging automatic-drain job; broader deployed concurrency remains the next evidence needed for low-key soft public readiness.
- real production payment concurrency: out of scope and not appropriate before runtime activation approval.

## Idempotency / Recovery Conclusion

- Local/mock repeated polling, repeated paid-generation trigger, targeted processor repeat/concurrency, invalid token repeat, failed-final state, and completed-state reuse all pass.
- The primary code-level idempotency gap found in the direct paid-generation request path is fixed.
- Owner-controlled short windows remain supportable with Admin/Ops monitoring and mandatory close.
- Low-key soft public is still not justified solely by this task because deployed repeated/concurrency automatic-drain behavior is not yet proven.

## Validation

- commands run:
  - `cd apps/web && corepack pnpm test src/tests/paid-generation-service.test.ts src/tests/paid-generation-processor.test.ts src/tests/paid-generation-route.test.ts src/tests/paid-access-resolver.test.ts src/tests/generation-jobs.test.ts src/tests/paid-result-recovery-links.test.ts`: pass, 6 files / 80 tests
  - `cd apps/web && corepack pnpm run qa:paid-generation:benchmark -- --mode mock --jobs 1 --json`: pass
  - `cd apps/web && corepack pnpm run qa:paid-generation:benchmark -- --mode mock --jobs 3 --concurrency 2 --json`: pass
  - `cd apps/web && corepack pnpm lint`: pass
  - `cd apps/web && corepack pnpm test`: pass, 106 files / 726 tests
  - `cd apps/web && corepack pnpm build`: pass
  - `cd apps/web && corepack pnpm run qa:module01:ui`: pass, 5 Playwright tests
  - `cd apps/web && corepack pnpm run qa:module01:local`: pass, `gateStatus=pass`, `requiredChecksStatus=pass`
  - `cd apps/web && corepack pnpm run qa:module01:mock-flow`: pass, 18 files / 156 tests
  - `cd apps/web && corepack pnpm run qa:result-checkout:no-card`: pass
- gateStatus: pass
- commandExitCode: 0 for completed required gates
- requiredChecksStatus: pass
- optionalChecksStatus: pass for optional no-card check that was run
- targetDeployCommit: not_applicable
- deployedCommitAtGateStart: not_applicable
- deployedCommitAtGateEnd: not_applicable
- freshnessStatus: not_applicable
- gates skipped and why:
  - production runtime/payment gates: out of scope and explicitly prohibited
  - real Email/LINE channel gates: out of scope and explicitly prohibited
  - deployed staging concurrency benchmark: not run because this task prioritized local/mock repeated/concurrency hardening and did not need broader deployed queue load to fix the identified idempotency gap

## Safety

- production runtime enabled: no
- payment run: no
- Email sent: no
- LINE sent: no
- Vercel env changed: no
- DB mutated: production no; Preview(staging) yes through the approved staging-safe `qa:result-checkout:no-card` operator test path
- secrets/private data exposed: no

## Result

- result: pass
- first failure category: not_applicable
- blocker status: local/mock idempotency blocker resolved; deployed repeated/concurrency automatic-drain evidence remains for soft public readiness

## Tech Debt / Cleanup Notes

- new technical debt introduced: none
- existing technical debt observed: deployed queue concurrency evidence remains incomplete for low-key soft public; queue audit persistence remains a future Gate 2/growth consideration
- opportunistic cleanup completed: direct reused-job status guard added to prevent repeated generation triggers from bypassing the job dedupe intent
- deferred cleanup candidates: stronger DB-backed route-level concurrency integration tests, if future incidents show unit-level and staging-safe evidence are insufficient

## Decisions Made

- Treated the reused generation-job behavior as a real idempotency hardening bug because the DB dedupe layer alone did not guarantee route/service no-op semantics.
- Kept the fix narrow: no queue infrastructure rewrite, no schema migration, and no provider/payment behavior changes.
- Used existing mock benchmark and staging-safe no-card helper instead of production or real-channel testing.

## Uncertainties / Blockers

- Deployed repeated/concurrency automatic-drain remains unproven. This blocks low-key soft public and ads/broader traffic, but does not block owner-controlled short windows with monitoring.
- The staging-safe no-card helper proves the operator path and Admin API wait path, not real NewebPay checkout concurrency.

## Recommended Next Step

Owner chooses one:

- Payment Runtime Activation Prep v0, if the next priority is controlled payment-runtime readiness.
- NewebPay NotifyURL / ReturnURL Dry-Run Matrix v0, if provider callback confidence should be hardened before another real payment.
- Owner visual review and targeted paid-state visual fixes, if visual acceptance remains the priority.

If low-key soft public becomes the priority, run a deployed repeated/concurrency automatic-drain benchmark before any broader availability decision.

## Paste-Back Context

Repeated / Concurrency Paid-Generation Benchmark v0 passed. The task found and fixed one idempotency gap: repeated generation requests that reused an existing queued/processing/retry/final-failed generation job now return a safe reused status instead of continuing into paid-result/provider work. Targeted route/service/processor tests pass, mock benchmark passed for 1 job and 3 jobs at concurrency 2, full app tests/build/Module 01 UI/local/mock-flow passed, and the staging-safe no-card helper passed with Admin API wait as primary. Production runtime/payment/Email/LINE were untouched; Preview(staging) was mutated only through the approved no-card operator QA path. Low-key soft public still needs deployed repeated/concurrency automatic-drain evidence.
