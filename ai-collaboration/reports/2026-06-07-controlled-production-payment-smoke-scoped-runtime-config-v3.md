# Controlled Production Payment Smoke Retry with Scoped Runtime Config v3

## Metadata

- task name: Controlled Production Payment Smoke Retry with Scoped Runtime Config v3
- date: 2026-06-07
- report path: `ai-collaboration/reports/2026-06-07-controlled-production-payment-smoke-scoped-runtime-config-v3.md`
- commit: not committed at report creation
- branch / push status: not pushed at report creation
- model / effort: GPT-5 Codex, high
- taskStartedAt: 2026-06-07T12:08:31Z
- taskCompletedAt: 2026-06-07T12:25:30Z
- totalWallClockDuration: 16m59s
- humanWaitDuration: approx 3m owner confirmation / Email save / LINE bind wait
- netCodexWorkDuration: approx 13m59s

## Context

- why this task exists: staging had rebaselined the pre-payment save path, including Email save to mock/no-card access-link readiness and LINE bind deliverability, so production smoke v3 was the final acceptance attempt.
- upstream blocker / mainline context: prior production attempts failed before payment because production was stale, pre-payment save failed, or a fresh fixture was not guaranteed. This run promoted the latest accepted code fail-closed, asserted production freshness, and used the fresh fixture contract.
- out-of-scope items: product implementation, theme UI, Module 02, broad traffic, ads, non-card payment methods, Vercel env changes, direct DB mutation, and ad hoc scripts.

## Follow-Up Classification Note

- 2026-06-07 follow-up classification: the v3 smoke blocker is `production_admin_token_missing_owner_action_required` / `admin_lookup_failed`.
- Email and LINE saves were owner-visible successes, but Admin/Ops proof was unavailable because production `pnpm ops` did not have `ADMIN_API_TOKEN` in process env.
- This note does not rewrite historical facts; it clarifies that v3 should not be treated as an Email/LINE product failure.

## Scope

- what changed: production was promoted to the accepted staging commit while fail-closed, scoped runtime config was opened and closed for one controlled smoke window, and one fresh production result was created from the tracked fixture.
- what did not change: no Vercel env values, provider credentials, theme routes, product code, or database schema were changed.

## Implementation Summary

- files / areas changed: handoff, report, summary log, and dashboard.
- key design decisions: stopped before NewebPay provider form/payment because mandatory Admin/Ops verification failed with `admin_token_missing` after owner-visible Email and LINE saves succeeded.
- local / opportunistic cleanup decisions: none. This was a controlled production operation; the required next action is a workflow/preflight fix, not another production retry.

## Validation

- commands run:
  - `git fetch origin --prune`: pass.
  - production freshness before promotion: blocked, Preview/production health served stale commit `ece51709f4e3` instead of target `fe300e8`.
  - `vercel deploy --prod --yes --scope studioanyu-1488s-projects`: pass; production deployed fail-closed to deployment `dpl_HiaS6wwAtqAyrQPBH3W38BasnUo3`.
  - `cd apps/web && corepack pnpm run qa:deploy:freshness -- --env production --expected-commit fe300e8`: pass, deployed start/end `fe300e84f3a3`, `mixedDeploymentDetected=false`.
  - `cd apps/web && corepack pnpm run qa:module01:local`: pass, `gateStatus=pass`, `requiredChecksStatus=pass`.
  - `cd apps/web && corepack pnpm run qa:module01:mock-flow`: pass, 18 files / 150 tests.
  - `cd apps/web && corepack pnpm run qa:module01:ui`: pass, 5 Playwright tests.
  - `cd apps/web && corepack pnpm run qa:module01:smoke-fixture -- --json`: pass, `smokeRunIdPresent=true`, `freshDimensionPresent=true`, `expectedFreshResult=true`.
  - pre-open `cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status`: pass, `stateCategory=fail_closed_ready`.
  - pre-open `cd apps/web && corepack pnpm run qa:module01:production-preflight`: pass, `gateStatus=pass`, `requiredChecksStatus=pass`.
  - `cd apps/web && corepack pnpm run qa:production:runtime-window -- --action enable --confirm-controlled-smoke --reason "controlled production payment smoke"`: pass, `stateCategory=runtime_config_open`.
  - open-state `cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status`: pass, `stateCategory=runtime_config_open`.
  - production analyze using tracked fixture artifact: pass, result ID `451bdc2a-a690-4b27-b9c2-41de5ffba8ab`, request ID `454dc174-21df-436c-a089-eb33d5ee13a3`, `cacheHit=false`.
  - checkout route header check for the fresh result: pass, HTTP 200.
  - owner Email save: visible success.
  - owner mobile LINE bind: visible success.
  - `corepack pnpm --silent ops lookup-result --env production --id 451bdc2a-a690-4b27-b9c2-41de5ffba8ab`: failed, `admin_token_missing`.
  - `corepack pnpm --silent ops lookup-result --env production --id 451bdc2a-a690-4b27-b9c2-41de5ffba8ab --json`: failed, `admin_token_missing`.
  - `corepack pnpm --silent ops lookup-line-bind --env production --result-id 451bdc2a-a690-4b27-b9c2-41de5ffba8ab`: failed, `admin_token_missing`.
  - `corepack pnpm --silent ops lookup-line-bind --env production --result-id 451bdc2a-a690-4b27-b9c2-41de5ffba8ab --json`: failed, `admin_token_missing`.
  - `cd apps/web && corepack pnpm run qa:production:runtime-window -- --action disable --confirm-shutdown --reason "controlled production payment smoke blocked before payment: admin token missing"`: pass; scoped runtime config closed.
  - final `cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status`: pass, `stateCategory=fail_closed_ready`, `runtimeEnabled=false`, `checkoutEnabled=false`, `paymentWindowEnabled=false`.
  - final `cd apps/web && corepack pnpm run qa:module01:production-preflight`: pass, `gateStatus=pass`, `requiredChecksStatus=pass`.
- gateStatus: blocked.
- commandExitCode: pre-open gates, runtime open/close, fresh result creation, and final gates returned 0; mandatory Admin/Ops lookups returned non-zero with `admin_token_missing`.
- requiredChecksStatus: pass before runtime open; blocked before payment at mandatory Admin/Ops verification.
- optionalChecksStatus: not_applicable.
- targetDeployCommit: `fe300e84f3a3c3afb3e67595253122ffc7512b1f`.
- deployedCommitAtGateStart: `fe300e84f3a3`.
- deployedCommitAtGateEnd: `fe300e84f3a3`.
- freshnessStatus: pass after fail-closed production promotion.
- gates skipped and why:
  - `qa:module01:staging`: skipped because staging Email/access-link and LINE bind evidence had already passed, and this task was production final acceptance after production freshness.
  - NewebPay provider form, card payment, ReturnURL, NotifyURL, processor, paid result, Email delivery, and LINE delivery: skipped because mandatory Admin/Ops verification failed before payment.

## Production Deploy Freshness / Promotion

- initial production freshness result: blocked, stale commit `ece51709f4e3` served while target was `fe300e8`.
- promotion method: Vercel production deploy from repo root while production runtime remained fail-closed.
- deployment result: pass, `dpl_HiaS6wwAtqAyrQPBH3W38BasnUo3`, aliased to `https://anyu.tw`.
- post-promotion freshness result: pass.
- alias/project proof: pass through runtime-window and production preflight.
- mixed deployment detected: false.
- Vercel env changed: no.

## Pre-Open Gates

- `qa:module01:local`: pass.
- `qa:module01:mock-flow`: pass.
- `qa:module01:ui`: pass.
- `qa:module01:smoke-fixture -- --json`: pass.
- smoke fixture freshness fields:
  - `smokeRunIdPresent=true`
  - `freshDimensionPresent=true`
  - `expectedFreshResult=true`
- runtime-window status: pass, `stateCategory=fail_closed_ready`, `payment.window.enabled=false`, `payment.global.disabled=false`, aliasGuardStatus `pass`, public pages OK, checkout/fake-paid/operator routes fail-closed.
- production-preflight: pass, `gateStatus=pass`.

## Scoped Runtime Config Open / Close

- open method: scoped runtime config, not Vercel env and not redeploy.
- key: `payment.window.enabled`.
- scope: `module:ai-temperature`.
- open result: pass, `stateCategory=runtime_config_open`, `payment.global.disabled=false`.
- close result: pass.
- final runtime-window status: pass, `stateCategory=fail_closed_ready`.
- final production-preflight: pass, `gateStatus=pass`.

## Fresh Result / Cache Assertion

- resultSourceCategory: `production_runtime`.
- result ID: `451bdc2a-a690-4b27-b9c2-41de5ffba8ab`.
- request ID: `454dc174-21df-436c-a089-eb33d5ee13a3`.
- cacheHit assertion: pass, `cacheHit=false`.
- reused known failed result: no; result ID differs from `800c88fa-04de-4172-b34a-3bc78cd4d0fa`.
- checkout route: reachable, HTTP 200.

## Email Save Result

- result: visible success reported by owner.
- raw Email exposed: no.
- provider delivery Email sent: no.
- Admin/Ops verification: not completed because `pnpm ops lookup-result` failed with `admin_token_missing`.

## Mobile LINE Bind Result

- result: visible success reported by owner.
- raw LINE user ID / idToken / LIFF state exposed: no.
- LINE delivery message sent: no.
- Admin/Ops verification: not completed because `pnpm ops lookup-line-bind` and `lookup-result` failed with `admin_token_missing`.

## Payment Result

- not run.
- provider form generated: no.
- payment method used: none.
- reason: stopped before payment because mandatory Admin/Ops verification was unavailable.

## ReturnURL / NotifyURL Result

- not run.
- reason: no provider form or payment occurred.

## Processor / Generation Result

- not run.
- reason: no payment occurred.

## Email / LINE Delivery Result

- Email access-link delivery: not run.
- LINE access-link delivery: not run.
- reason: no payment occurred and no completed paid result was generated.

## Admin / Ops Final State

- `pnpm ops` production lookup failed because `ADMIN_API_TOKEN` was not present in the shell/process environment.
- `pnpm ops` correctly did not read app env mirror files.
- direct DB used: no.
- blocker category: production Admin/Ops token availability was not preflighted before opening the runtime window.

## Safety

- production runtime enabled: yes, briefly through scoped runtime config only.
- payment run: no.
- Email sent: no; Email save only.
- LINE sent: no; LINE bind only.
- Vercel env changed: no.
- DB mutated: yes, normal production smoke state was created/updated through runtime config open/close, fresh result creation, and owner save/bind actions; no manual DB mutation occurred.
- secrets/private data exposed: no.
- production deploy performed: yes, fail-closed production promotion to target commit.
- production final status: fail-closed.
- theme route preservation: Theme Architecture remains archived and untouched; no theme implementation was changed.

## Result

- result: blocked before payment.
- first failure category: `admin_lookup_failed`.
- blocker status: remaining blocker. Production Admin/Ops token availability must be a pre-open hard gate before another production smoke.

## Tech Debt / Cleanup Notes

- new technical debt introduced: none.
- existing technical debt observed: staging QA has an approved Admin token injection path, but production smoke has no equivalent pre-open assertion that `pnpm ops` can authenticate with an explicit process-env `ADMIN_API_TOKEN`.
- opportunistic cleanup completed: none.
- deferred cleanup candidates: add a production Admin/Ops token preflight or smoke-readiness helper that runs before runtime open and before result creation.

## Decisions Made

- Promoted latest accepted code to production fail-closed because production freshness was stale.
- Opened production runtime only after production freshness and pre-open gates passed.
- Stopped before payment after mandatory Admin/Ops lookups failed.
- Closed production runtime immediately after the blocker.
- Did not use direct DB because the blocker was missing Admin API token availability, not insufficient Admin API data.
- Did not run another production attempt in this task.

## Uncertainties / Blockers

- Email and LINE were owner-visible successes, but Admin/Ops could not verify sanitized saved/deliverable state because production `ADMIN_API_TOKEN` was missing from process env.
- Payment, NotifyURL, processor, paid result, and access-link delivery remain unverified in this run.

## Recommended Next Step

Production Admin/Ops Token Preflight + Smoke Resume Guard v0: add a pre-open production smoke gate that proves `pnpm ops` can authenticate with explicit process-env `ADMIN_API_TOKEN` before runtime open/result creation. Do not run another production smoke until that workflow blocker is resolved.

## Paste-Back Context

Production smoke v3 promoted latest accepted code fail-closed, asserted production freshness on `fe300e8`, passed local/mock/UI/fixture/runtime/preflight gates, opened `payment.window.enabled` through scoped runtime config, and created fresh production result `451bdc2a-a690-4b27-b9c2-41de5ffba8ab` with `cacheHit=false`. Owner reported Email save success and LINE save success. Codex stopped before NewebPay payment because mandatory production Admin/Ops lookup failed with `admin_token_missing`. Runtime config was closed immediately; final runtime-window is `fail_closed_ready` and production-preflight passes. No payment/provider form/NotifyURL/processor/Email delivery/LINE delivery occurred. First failure category is `admin_lookup_failed`; next task should fix production Admin/Ops token preflight before another production attempt.
