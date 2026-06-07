# Production Smoke Runbook Update + Runtime Config Dry Run v0

## Metadata

- task name: Production Smoke Runbook Update + Runtime Config Dry Run v0
- date: 2026-06-07
- report path: `ai-collaboration/reports/2026-06-07-production-smoke-runbook-runtime-config-dry-run-v0.md`
- commit: pending commit
- branch / push status: pending push
- model / effort: GPT-5 Codex, high
- taskStartedAt: 2026-06-07T07:39:24Z
- taskCompletedAt: 2026-06-07T07:49:13Z
- totalWallClockDuration: 9m49s
- humanWaitDuration: 0m
- netCodexWorkDuration: 9m49s

## Context

- why this task exists: scoped runtime config replaced Vercel env runtime toggles, so the production smoke runbook needed to stop using redeploy-based open/close and prove Admin API / `pnpm ops config` can open and close the Module 01 runtime window safely.
- upstream blocker / mainline context: Scoped Runtime Config Stabilization + Gate Closure v0 completed with Production fail-closed, `qa:production:runtime-window` passing, and `qa:module01:production-preflight` passing. No production payment has been rerun after the migration.
- out-of-scope items: no production payment, no NewebPay provider form generation, no Email send, no LINE send, no Vercel env changes, no provider credential changes, no DB mutation outside approved runtime config writes, no theme work, and no Module 02 work.

## Scope

- what changed: production smoke runbook/process docs now use scoped runtime config for opening and closing the Module 01 payment runtime window. The runtime-window helper was corrected to represent an intentionally open scoped-config window as `runtime_config_open`.
- what did not change: payment/provider behavior, Email/LINE delivery behavior, Vercel env, deployment, database schema, and product UI/runtime implementation outside the QA helper classification.

## Implementation Summary

- files / areas changed: production gate policy, QA validation policy, Admin/Ops boundary docs, handoff template wording, production runtime-window helper, runtime-window tests, task handoff, dashboard, summary log, and this report.
- key design decisions: production smoke open/close now uses `pnpm ops config set --env production payment.window.enabled ... --module ai-temperature`; old `ENABLE_PAYMENT_RUNTIME` / `ENABLE_NEWEBPAY_CHECKOUT` are explicitly prohibited for active smoke runtime-window operations.
- local / opportunistic cleanup decisions: the first dry-run open revealed the helper still treated an expected open window as preflight-blocked because fail-closed preflight correctly blocks when checkout is open. The helper now distinguishes `runtime_config_open` from unsafe runtime state by requiring public pages OK and fake-paid/operator routes fail-closed.

## Initial Runtime Config State

- `pnpm ops config get --env production payment.window.enabled --module ai-temperature`: success; sanitized output only.
- `pnpm ops config get --env production payment.global.disabled --global`: success; sanitized output only.
- `pnpm ops config history --env production payment.window.enabled --module ai-temperature`: success; history was available before the dry run.
- `cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status`: pass; `stateCategory=fail_closed_ready`, `runtimeEnabled=false`, `checkoutEnabled=false`, `paymentGlobalDisabled=false`, `paymentWindowEnabled=false`, `aliasGuardStatus=pass`.
- `cd apps/web && corepack pnpm run qa:module01:production-preflight`: pass; `gateStatus=pass`, `commandExitCode=0`, required checks pass.

## Runbook Update Result

- production smoke pre-open instructions now include `qa:module01:smoke-fixture -- --json`.
- open command now uses `pnpm ops config set --env production payment.window.enabled true --module ai-temperature --reason "controlled production smoke"`.
- close command now uses `pnpm ops config set --env production payment.window.enabled false --module ai-temperature --reason "smoke complete"`.
- the runbook explicitly forbids Vercel env toggles, redeploys for normal runtime open/close, `ENABLE_PAYMENT_RUNTIME`, and `ENABLE_NEWEBPAY_CHECKOUT`.
- LINE bind failure inspection uses `pnpm ops lookup-line-bind`.
- payment/result completion inspection uses `pnpm ops lookup-result`.
- final close remains mandatory unless the owner explicitly chooses soft availability.

## Runtime Config Dry Run

- first open command: `pnpm ops config set --env production payment.window.enabled true --module ai-temperature --reason "runtime config dry run"` passed.
- first open verification found helper misclassification: runtime config was open, public pages were OK, fake-paid/operator were fail-closed, checkout returned a safe `source_result_not_found` category without creating a result, but helper reported `stateCategory=preflight_blocked`.
- immediate close command: `pnpm ops config set --env production payment.window.enabled false --module ai-temperature --reason "runtime config dry run complete"` passed.
- helper fix: status action now treats a scoped-config open window as `runtime_config_open` when public pages are OK and fake-paid/operator routes remain fail-closed.
- second open command passed.
- second open verification passed with `stateCategory=runtime_config_open`, `runtimeEnabled=true`, `checkoutEnabled=true`, `paymentGlobalDisabled=false`, `paymentWindowEnabled=true`, `aliasGuardStatus=pass`, public pages OK, and fake-paid/operator fail-closed.
- second close command passed.
- final state verification passed with `stateCategory=fail_closed_ready`, `runtimeEnabled=false`, `checkoutEnabled=false`, `paymentGlobalDisabled=false`, `paymentWindowEnabled=false`, checkout disabled, fake-paid/operator fail-closed, and production-preflight `gateStatus=pass`.

No production result, payment provider form, Email, or LINE event was created during the dry run.

## Legacy Runtime Flag Reference Audit

- searched active runtime/test/process paths for `ENABLE_PAYMENT_RUNTIME` and `ENABLE_NEWEBPAY_CHECKOUT`.
- acceptable references found:
  - `ai-collaboration/process/env-mirror-policy.md`: obsolete normal runtime-window controls.
  - `ai-collaboration/process/production-gate-policy.md`: explicit do-not-use / obsolete notes.
- unacceptable references found: none in the searched active paths.

## Validation

- commands run:
  - `cd apps/web && corepack pnpm lint`: pass.
  - `cd apps/web && corepack pnpm exec vitest run src/tests/production-runtime-window.test.ts`: pass, 12 tests.
  - `corepack pnpm --filter @anyu/admin-cli test`: pass.
  - `corepack pnpm --filter @anyu/admin-cli typecheck`: pass.
  - `cd apps/web && corepack pnpm test`: pass, 97 files / 659 tests.
  - `cd apps/web && corepack pnpm build`: pass.
  - `cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status`: pass before and after dry run; final `stateCategory=fail_closed_ready`.
  - `cd apps/web && corepack pnpm run qa:module01:production-preflight`: pass before and after dry run; final `gateStatus=pass`.
- gateStatus: pass.
- commandExitCode: 0 for required final gates.
- requiredChecksStatus: pass.
- optionalChecksStatus: not_applicable.
- targetDeployCommit: not_applicable; no deployment performed.
- deployedCommitAtGateStart: not_applicable.
- deployedCommitAtGateEnd: not_applicable.
- freshnessStatus: not_applicable.
- gates skipped and why:
  - `qa:module01:local`: skipped because product/runtime route behavior was not changed; broader app tests, build, runtime-window, and production-preflight covered the helper/docs dry run.
  - `qa:module01:mock-flow`: skipped because no payment/access-link flow implementation changed.
  - `qa:module01:ui`: skipped because no UI behavior changed.
  - `qa:module01:staging`: skipped because no deployed staging behavior or migration changed.
  - `qa:module01:staging:channels`: skipped because real channel checks were out of scope and not owner-approved.

## Safety

- production runtime enabled: yes, scoped `payment.window.enabled` was briefly set to true for the owner-approved dry run only; final state is false.
- payment run: no.
- Email sent: no.
- LINE sent: no.
- Vercel env changed: no.
- DB mutated: yes, only approved production runtime config value/audit writes for open/close dry run.
- secrets/private data exposed: no.

## Result

- result: pass.
- first failure category: not_applicable.
- blocker status: resolved for runtime config dry-run readiness.

## Tech Debt / Cleanup Notes

- new technical debt introduced: none.
- existing technical debt observed: Admin CLI still shows sanitized pretty output without printing boolean values, which is safe but makes reports rely on runtime-window JSON for explicit open/closed value evidence.
- opportunistic cleanup completed: runtime-window helper classification now supports `runtime_config_open` and detects unsafe fake-paid/operator exposure during an open window.
- deferred cleanup candidates: none blocking production smoke runbook use.

## Decisions Made

- treat fail-closed production preflight as expected to block while a scoped runtime window is open, rather than using that preflight result as the open-window state category.
- keep no redeploy requirement for scoped runtime config open/close.
- keep old Vercel runtime flag references only as explicit obsolete/do-not-use notes.

## Uncertainties / Blockers

- none for the next controlled production smoke retry.

## Recommended Next Step

Controlled Production Payment Smoke retry using scoped runtime config.

## Paste-Back Context

Production smoke runbook and process docs now use scoped runtime config via `pnpm ops config` instead of Vercel env toggles or redeploys. The owner-approved dry run briefly opened and closed production module `payment.window.enabled` without creating a result, provider form, payment, Email, or LINE message; final runtime-window status is fail-closed and production-preflight passes.
