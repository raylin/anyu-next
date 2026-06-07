# Deployed Staging Paid-Generation Automatic-Drain Benchmark v0

## Metadata

- task name: Deployed Staging Paid-Generation Automatic-Drain Benchmark v0
- date: 2026-06-07
- report path: `ai-collaboration/reports/2026-06-07-deployed-staging-paid-generation-automatic-drain-benchmark-v0.md`
- commit: not committed
- branch / push status: not pushed
- model / effort: GPT-5 Codex, high
- taskStartedAt: 2026-06-07T15:29:48Z
- taskCompletedAt: 2026-06-07T15:33:59Z
- totalWallClockDuration: 4m11s
- humanWaitDuration: 0m00s
- netCodexWorkDuration: 4m11s

## Context

- why this task exists: Processor Latency + Paid Generation Readiness v0 added metrics and mock benchmark output, but did not prove deployed staging automatic queue drain.
- upstream blocker / mainline context: soft public readiness stayed `blocked_needs_automatic_drain` until staging could show automatic drain without manual processor invocation.
- out-of-scope items: production runtime, production payment, real Email/LINE, Vercel env changes, direct DB mutation, ads/broad traffic.

## Scope

- what changed: docs/report/dashboard/runbook status only.
- what did not change: no product/runtime code, no env, no DB schema, no production state.

## Benchmark Setup

- targetDeployCommit: `83dc54fff2ecefcba22fda2fda388594ee23a525`
- deployedCommitAtGateStart: `83dc54fff2ec`
- deployedCommitAtGateEnd: `83dc54fff2ec`
- freshnessStatus: `pass`
- mixedDeploymentDetected: `false`
- environment: Preview(staging)
- flow: tracked fresh fixture → staging result → checkout-start → Email save → operator no-card/fake-paid → Vercel Queue trigger → automatic paid-generation drain → paid access render
- job count: 1
- concurrency: 1
- real payment: no
- real Email: no
- real LINE: no
- manual processor trigger before measurement: no
- manual processor cleanup used: no

## Runtime Config / Admin Readiness

- `payment.window.enabled` staging module `ai-temperature`: active, expected true.
- `payment.global.disabled` staging global: active, expected false.
- `pnpm ops auth status --env staging`: token available from `credentials_file`.
- `qa:module01:staging-runtime-config`: `gateStatus=pass`, expected config values matched.
- no token/private values printed.

## Fresh Fixture / Result Creation

- `qa:module01:smoke-fixture -- --json`: pass.
- smokeRunIdPresent: true.
- freshDimensionPresent: true.
- expectedFreshResult: true.
- staging resultId: `7a4ca853-abcc-417e-9e64-cb747fff4a9a`
- resultSourceCategory: `staging_runtime_no_card`
- cacheHit: false.
- tokenized URL printed: no.

## Automatic Drain Result

`qa:result-checkout:no-card` ran in queue mode:

- `secret_preflight`: pass.
- `staging_health`: pass on commit `83dc54fff2ec`.
- `source_analyze`: pass, `cacheHit=false`.
- `checkout_start_page`: pass.
- `email_recovery_save`: pass.
- `checkout_unlocked_after_email_save`: pass.
- `operator_fake_paid_success`: pass.
- initial generationJobStatus: `queued`.
- queueTriggerOk: true.
- queueTriggerCategory: `enqueued`.
- queueTriggerProvider: `vercel_queue`.
- paid status polls 1-12: `processing`.
- paid status poll 13: `completed`.
- paid access render: pass.
- production disabled check: pass.
- final_summary: pass.

No manual processor endpoint was called before or after the measurement.

## Admin/Ops Latency Evidence

`pnpm ops lookup-result --env staging --id 7a4ca853-abcc-417e-9e64-cb747fff4a9a --json`:

- payment status: `paid`.
- provider: `operator_fake`.
- entitlement: `active`.
- generation status: `completed`.
- failureCategory: null.
- jobCreatedAtPresent: true.
- jobStartedAtPresent: true.
- jobCompletedAtPresent: true.
- jobUpdatedAtPresent: true.
- paidResultCompletedAtPresent: true.
- attemptCount: 1.
- maxAttempts: 3.
- lastErrorAtPresent: false.
- queueStateCategory: `completed`.
- recommendedAction: `no_action_needed`.
- `enqueueLatencyMs`: 1064.
- `queueWaitMs`: 2685.
- `processorPickupLatencyMs`: 2797.
- `processingDurationMs`: 0.
- `totalPaidReadyMs`: 3749.
- `deliveryReadyMs`: 52164.
- `queueStuckThresholdMs`: 300000.

`qa:module01:wait-result`:

- status: pass.
- attempts: 1 after completion.
- paidResultStatus: `completed`.
- paymentStatus: `paid`.
- generationStatus: `completed`.
- Email accessLinkStatus: contact saved, sent, active.
- LINE accessLinkStatus: not used in this task.

## SLO Comparison

Candidate v0 targets:

- paidResultReadyP50 <= 60s: single sample `totalPaidReadyMs=3749`, within target.
- paidResultReadyP95 <= 180s: sample size too small for true P95; single sample within target.
- queueWaitP95 <= 60s: sample size too small for true P95; single sample `queueWaitMs=2685`, within target.
- no queued job > 5 minutes without Admin/Ops visible action: pass for this sample.
- processor failure rate = 0 in bounded sample: pass, 0/1.

Evidence strength:

- strong enough for one deployed owner-controlled staging path.
- not strong enough for low-key soft public because repeated samples and concurrency were not measured.

## Parallelism / Concurrency

- skipped.
- reason: current structured staging no-card helper supports one flow at a time; running unstructured parallel browser/API orchestration would violate the task preference for structured helpers and increase risk.
- impact: does not block owner-only controlled windows, but blocks `ready_for_low_key_soft_public`.

## Readiness Classification

- automaticDrainVerified: true for one deployed staging no-card/fake-paid job.
- stuck job result: none.
- manual processor cleanup used: no.
- readiness classification: `ready_for_owner_controlled_window`.
- soft public classification: not yet ready; concurrency/repeated-sample evidence remains missing.
- ads / broad traffic: blocked.

Rationale:

- deployed Vercel Queue automatic drain completed the staging paid-generation path without manual processor intervention.
- latency was well within candidate owner-controlled targets in this single sample.
- Admin/Ops visibility now shows safe queue state and latency metrics.
- one job is insufficient to prove soft-public reliability.

## Runbook Update

Production gate policy now records:

- the deployed staging single-job automatic-drain evidence.
- measured latency fields.
- owner-only controlled windows are acceptable if explicitly chosen and monitored.
- low-key soft public and ads remain blocked until repeated/concurrency evidence exists.

## Validation

- commands run:
  - `cd apps/web && corepack pnpm run qa:deploy:freshness -- --env staging --expected-commit 83dc54fff2ecefcba22fda2fda388594ee23a525`: pass
  - `pnpm ops config get --env staging payment.window.enabled --module ai-temperature`: pass
  - `pnpm ops config get --env staging payment.global.disabled --global`: pass
  - `pnpm ops auth status --env staging`: pass
  - `cd apps/web && corepack pnpm run qa:module01:staging-runtime-config`: pass
  - `cd apps/web && corepack pnpm run qa:module01:smoke-fixture -- --json`: pass
  - `cd apps/web && corepack pnpm run qa:paid-generation:benchmark -- --mode mock --jobs 1 --json`: pass
  - `cd apps/web && corepack pnpm run qa:result-checkout:no-card`: pass
  - `pnpm ops lookup-result --env staging --id 7a4ca853-abcc-417e-9e64-cb747fff4a9a`: pass
  - `pnpm ops lookup-result --env staging --id 7a4ca853-abcc-417e-9e64-cb747fff4a9a --json`: pass
  - `cd apps/web && corepack pnpm run qa:module01:wait-result -- --env staging --result-id 7a4ca853-abcc-417e-9e64-cb747fff4a9a --timeout 300000 --interval 15000 --json`: pass
- gateStatus: pass
- commandExitCode: 0 for required benchmark commands
- requiredChecksStatus: pass
- optionalChecksStatus: skipped
- targetDeployCommit: `83dc54fff2ecefcba22fda2fda388594ee23a525`
- deployedCommitAtGateStart: `83dc54fff2ec`
- deployedCommitAtGateEnd: `83dc54fff2ec`
- freshnessStatus: pass
- gates skipped and why:
  - parallel sample skipped because structured helper supports one flow at a time and one deployed sample is enough for owner-only classification.
  - `qa:module01:staging:channels` skipped because real channels were out of scope.
  - production runtime/payment skipped by policy.

## Safety

- production runtime enabled: no
- payment run: no real payment; staging operator no-card/fake-paid path only
- Email sent: no real Email; staging access-link state only
- LINE sent: no
- Vercel env changed: no
- DB mutated: staging QA data was created through approved app/Admin paths; production DB not mutated; no manual DB mutation
- secrets/private data exposed: no

## Result

- result: pass
- first failure category: not_applicable
- blocker status: automatic-drain blocker resolved for owner-only controlled windows; soft-public concurrency blocker remains

## Tech Debt / Cleanup Notes

- new technical debt introduced: none.
- existing technical debt observed: no structured multi-job staging benchmark exists yet.
- opportunistic cleanup completed: runbook/dashboard status updated from automatic-drain blocker to runtime availability decision.
- deferred cleanup candidates:
  - add `qa:paid-generation:benchmark -- --mode staging` as a real deployed no-card benchmark wrapper.
  - add structured multi-job bounded staging benchmark with concurrency controls.
  - add aggregate queued-job Admin/Ops monitor.

## Decisions Made

- Did not call manual processor because automatic drain completed.
- Did not run parallel sample because helper support is single-flow and owner-only readiness does not require concurrency proof.
- Classified as `ready_for_owner_controlled_window`, not `ready_for_low_key_soft_public`.

## Uncertainties / Blockers

- Multiple-job/concurrency behavior remains unproven.
- Repeated deployed samples are not yet available.
- Exact production queue behavior under real NewebPay NotifyURL may still differ from staging operator no-card trigger, though both use `generation_jobs` and Vercel Queue.

## Recommended Next Step

Gate 1 Runtime Availability Decision v0. Decide whether to allow owner-only controlled short windows with production remaining fail-closed by default. Do not approve low-key soft public or ads until repeated/concurrency staging evidence is added.

## Paste-Back Context

Deployed Staging Paid-Generation Automatic-Drain Benchmark v0 passed on commit `83dc54f`. A staging no-card/fake-paid queue-mode result completed automatically through Vercel Queue without manual processor invocation. Admin/Ops latency fields showed `queueWaitMs=2685`, `processorPickupLatencyMs=2797`, `totalPaidReadyMs=3749`, `attemptCount=1`, and queue state `completed`. Classification is `ready_for_owner_controlled_window`, not `ready_for_low_key_soft_public`, because concurrency/repeated samples remain unproven. Production was not touched.
