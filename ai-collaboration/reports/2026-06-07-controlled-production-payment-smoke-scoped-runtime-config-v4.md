# Controlled Production Payment Smoke Retry with Scoped Runtime Config v4

## Metadata

- task name: Controlled Production Payment Smoke Retry with Scoped Runtime Config v4
- date: 2026-06-07
- report path: `ai-collaboration/reports/2026-06-07-controlled-production-payment-smoke-scoped-runtime-config-v4.md`
- commit: not committed at report creation
- branch / push status: not pushed at report creation
- model / effort: GPT-5 Codex, high
- taskStartedAt: 2026-06-07T14:26:59Z
- taskCompletedAt: 2026-06-07T14:54:38Z
- totalWallClockDuration: 27m39s
- humanWaitDuration: approx 5m30s for owner Email save, LINE bind, card payment, and delivery confirmation
- netCodexWorkDuration: approx 22m09s

## Context

- why this task exists: production payment smoke could resume after scoped runtime config, production Admin/Ops credentials, NewebPay URL/env alignment, staging Email/access-link rebaseline, and staging LINE bind validation were completed.
- upstream blocker / mainline context: v3 stopped before payment because mandatory production Admin/Ops lookup was unavailable. v4 added the Admin/Ops preflight requirement and used production as final acceptance, not diagnostics.
- out-of-scope items: product implementation, theme UI, Module 02, broad public traffic, ads, non-card payment methods, Vercel env mutation, provider credential changes, direct DB mutation, and additional diagnostics.

## Scope

- what changed: one controlled production Module 01 payment smoke was executed through scoped runtime config, using the tracked fresh fixture and one NT$49 credit-card one-time payment.
- what did not change: no runtime/product code, Vercel env values, provider credentials, DB schema, theme routes, or Module 02 work changed.

## Implementation Summary

- files / areas changed: handoff, report, summary log, and dashboard only.
- key design decisions: used scoped runtime config for runtime open/close; used Admin/Ops for all support-state checks; used the approved internal processor endpoint once after the paid generation job remained queued and preflight had shown processor readiness.
- local / opportunistic cleanup decisions: none. The long processor queue delay is recorded as a follow-up observation, not hidden.

## Validation

- commands run:
  - `git status --short`: pass; only the v4 handoff was untracked at start.
  - `vercel deploy --prod --yes --scope studioanyu-1488s-projects`: pass; production deployment `dpl_57JAHjNc8PMnnJcUm4M9tQ2JbnwC` aliased to `https://anyu.tw` while fail-closed.
  - `curl -sS https://anyu.tw/api/health`: pass; production health reported `environment=production`, `gitCommit=3423c98e08f9`.
  - `vercel inspect https://anyu.tw --scope studioanyu-1488s-projects`: pass; canonical project `anyu-next`, aliases `anyu.tw` and `www.anyu.tw`, target production, ready.
  - `cd apps/web && corepack pnpm run qa:deploy:freshness -- --env production --expected-commit 3423c98e08f9`: pass, `freshnessStatus=pass`, `mixedDeploymentDetected=false`.
  - `cd apps/web && corepack pnpm run qa:module01:local`: pass, `gateStatus=pass`, `requiredChecksStatus=pass`.
  - `cd apps/web && corepack pnpm run qa:module01:mock-flow`: pass; all scenarios passed, including Email save to mock paid access-link and LINE recipient-secret scenarios.
  - `cd apps/web && corepack pnpm run qa:module01:ui`: first run failed because sandboxed Chromium launch was denied; rerun with approved escalation passed, 5 Playwright tests.
  - `cd apps/web && corepack pnpm run qa:module01:smoke-fixture -- --json`: pass, `smokeRunIdPresent=true`, `freshDimensionPresent=true`, `expectedFreshResult=true`.
  - pre-open `cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status`: pass, `stateCategory=fail_closed_ready`, `payment.window.enabled=false`, `payment.global.disabled=false`, alias guard pass.
  - pre-open `cd apps/web && corepack pnpm run qa:module01:production-preflight`: pass, `gateStatus=pass`, `requiredChecksStatus=pass`.
  - pre-open `cd apps/web && corepack pnpm run qa:production:admin-ops-preflight`: pass, `gateStatus=pass`, `adminOpsStatus=production_admin_ops_ready`, token source `credentials_file`.
  - `pnpm ops config set --env production payment.window.enabled true --module ai-temperature --reason "controlled production payment smoke"`: pass.
  - open-state `pnpm ops config get --env production payment.window.enabled --module ai-temperature --json`: pass, value `true`.
  - open-state `cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status`: pass, `stateCategory=runtime_config_open`, `payment.global.disabled=false`.
  - production analyze using tracked `.qa/module01-valid-analyze-request.json`: pass, HTTP 200, result ID `245be67b-a229-4cd9-b9d6-1f5c2b98e3bf`, `cacheHit=false`, not a known failed smoke result.
  - production result page checkout CTA check: pass, checkout path present, no forbidden/secret patterns detected.
  - production mobile checkout-start check: pass, mandatory save gate present, mobile LINE above Email fallback, NT$49 one-time copy present, no legacy short-code or report-body promise, no provider/token leakage detected.
  - owner Email save: pass, owner-visible success.
  - `pnpm ops lookup-result --env production --id 245be67b-a229-4cd9-b9d6-1f5c2b98e3bf` and `--json`: pass; Email saved/deliverable, `email_save_success`.
  - owner mobile LINE bind: pass, owner-visible success.
  - `pnpm ops lookup-line-bind --env production --result-id 245be67b-a229-4cd9-b9d6-1f5c2b98e3bf` and `--json`: pass; `bind_success`, recipient secret created.
  - pre-payment `pnpm ops lookup-result --env production --id ... --json`: pass; LINE `recipientSecretExists=true`, deliverable.
  - owner NT$49 credit-card one-time payment: pass, owner reported completed.
  - post-payment `pnpm ops lookup-result --env production --id ...` and `--json`: pass; payment `paid`, entitlement `active`, generation initially `queued`.
  - approved processor path `POST https://anyu.tw/api/internal/jobs/process` with `jobType=paid_analysis`, `limit=1`: pass, HTTP 200, processed `1`, completed `1`, failed `null`, retryScheduled `0`. Secret value was loaded from the production local mirror and never printed.
  - final `pnpm ops lookup-result --env production --id ...` and `--json`: pass; paid result `completed`, delivery artifact ready, Email and LINE access links sent/active.
  - final `pnpm ops lookup-line-bind --env production --result-id ... --json`: pass; `bind_success`.
  - owner Email and LINE delivery verification: pass; both messages received and both `/r/` links opened the completed paid result.
  - `pnpm ops config set --env production payment.window.enabled false --module ai-temperature --reason "controlled production payment smoke complete"`: pass.
  - final `pnpm ops config get --env production payment.window.enabled --module ai-temperature --json`: pass, value `false`.
  - final `cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status`: pass, `stateCategory=fail_closed_ready`, checkout disabled, fake-paid/operator routes fail-closed, alias guard pass.
  - final `cd apps/web && corepack pnpm run qa:module01:production-preflight`: pass, `gateStatus=pass`, `requiredChecksStatus=pass`.
  - final `pnpm ops config history --env production payment.window.enabled --module ai-temperature`: pass, history available.
- gateStatus: pass.
- commandExitCode: all required gates/ops commands returned 0 after the UI sandbox rerun; the first UI command had a sandbox launch failure and was rerun with approval.
- requiredChecksStatus: pass.
- optionalChecksStatus: not_applicable.
- targetDeployCommit: `3423c98e08f928110f0e3199be9868c82b65f067`.
- deployedCommitAtGateStart: `3423c98e08f9`.
- deployedCommitAtGateEnd: `3423c98e08f9`.
- freshnessStatus: pass.
- gates skipped and why:
  - `qa:module01:staging`: skipped because staging Email/access-link and LINE bind evidence had already passed and no deployed staging behavior changed during this task.
  - `qa:module01:staging:channels`: skipped; production smoke used owner-approved real production Email/LINE delivery, and staging channel suite was out of scope.

## Production Freshness / Promotion

- targetDeployCommit: `3423c98e08f928110f0e3199be9868c82b65f067`.
- production was promoted while fail-closed because the accepted target commit needed to be asserted on Production.
- deployment: `dpl_57JAHjNc8PMnnJcUm4M9tQ2JbnwC`.
- health environment: production.
- canonical project / alias proof: pass for `anyu.tw` and `www.anyu.tw`.
- deployedCommitAtGateStart: `3423c98e08f9`.
- deployedCommitAtGateEnd: `3423c98e08f9`.
- mixedDeploymentDetected: false.
- Vercel env changed: no.

## Pre-Open Gates

- `qa:module01:local`: pass.
- `qa:module01:mock-flow`: pass.
- `qa:module01:ui`: pass after approved sandbox escalation.
- `qa:module01:smoke-fixture -- --json`: pass.
- smoke fixture freshness fields:
  - `smokeRunIdPresent=true`
  - `freshDimensionPresent=true`
  - `expectedFreshResult=true`
- runtime-window status before open: `fail_closed_ready`.
- `payment.window.enabled`: false.
- `payment.global.disabled`: false.
- aliasGuardStatus: pass.
- production-preflight: pass.
- production Admin/Ops preflight: pass, `production_admin_ops_ready`.

## Scoped Runtime Config Open / Close

- open command: `pnpm ops config set --env production payment.window.enabled true --module ai-temperature --reason "controlled production payment smoke"`.
- open result: pass, `stateCategory=runtime_config_open`.
- close command: `pnpm ops config set --env production payment.window.enabled false --module ai-temperature --reason "controlled production payment smoke complete"`.
- close result: pass, final value `false`.
- final runtime-window status: `fail_closed_ready`.
- comparison note: no Vercel env or redeploy was used for runtime open/close.

## Fresh Result / Cache Assertion

- resultSourceCategory: `production_runtime`.
- result ID: `245be67b-a229-4cd9-b9d6-1f5c2b98e3bf`.
- cacheHit assertion: pass, `cacheHit=false`.
- reused known failed result: no; it did not match `800c88fa-04de-4172-b34a-3bc78cd4d0fa` or `451bdc2a-a690-4b27-b9c2-41de5ffba8ab`.
- checkout-start: pass, HTTP 200, mandatory save gate and NT$49 one-time payment copy verified.

## Email Save

- owner-visible Email save: pass.
- Admin/Ops result: pass.
- sanitized category: `email_save_success`.
- Email contact saved: yes.
- Email deliverable: yes.
- raw Email exposed: no.

## Mobile LINE Bind

- owner-visible LINE bind: pass.
- Admin/Ops result: pass.
- latest diagnostic category: `bind_success`.
- recipientSecretExists: true.
- deliverable: true.
- raw LINE user ID / idToken / LIFF state exposed: no.

## Payment

- provider form: generated through the production checkout UI after Email and LINE saves passed.
- payment method: NT$49 credit-card one-time payment.
- owner result: payment completed.
- provider/card payload recorded: no.
- sandbox credentials used: no.

## ReturnURL / NotifyURL

- owner reported payment completed after provider flow.
- Admin/Ops payment truth: payment status `paid`, `paidAtPresent=true`, provider `newebpay`.
- entitlement: `active`.
- manual NotifyURL resend: not used.
- ReturnURL did not serve as the sole source of truth; Admin/Ops payment state was used.

## Processor / Generation

- initial post-payment generation state: `queued`.
- observation: processing took noticeably longer than prior runs.
- approved processor path used: yes, after Admin/Ops recommended `retry_processor_if_safe` and production preflight had shown processor readiness.
- processor result: HTTP 200, processed `1`, completed `1`, failed `null`, retryScheduled `0`.
- final generation status: `completed`.
- final paid result status: `completed`.
- delivery artifact ready: true.
- manual DB mutation: no.

## Email / LINE Delivery

- Email access link:
  - sent: true.
  - active: true.
  - provider status: accepted.
  - owner receipt: confirmed.
  - owner `/r/` link check: opened completed paid result.
- LINE access link:
  - sent: true.
  - active: true.
  - recipientSecretExists: true.
  - owner receipt: confirmed.
  - owner `/r/` link check: opened completed paid result.
- tokenized links pasted: no.

## Admin / Ops Final State

- payment: paid.
- entitlement: active.
- generation: completed.
- paid result: completed.
- delivery artifact: ready.
- Email: saved, deliverable, sent, active, used.
- LINE: saved, deliverable, recipient secret exists, sent, active, used.
- `line_bind_incomplete`: absent.
- private data in outputs: no.

## Safety

- production runtime enabled: yes, controlled scoped runtime window only.
- payment run: yes, one NT$49 credit-card one-time payment.
- Email sent: yes, production access-link delivery after paid result completion.
- LINE sent: yes, production access-link delivery after paid result completion.
- Vercel env changed: no.
- DB mutated: yes, only normal production flow writes: runtime config open/close, fresh result, save/bind contacts, payment/entitlement/generation/paid-result/access-link records. No manual DB mutation occurred.
- secrets/private data exposed: no.
- direct DB used: no.
- production final status: fail-closed.
- theme route preservation: Theme Architecture remains archived and untouched; no theme UI or route behavior was changed.

## Result

- result: pass.
- first failure category: not_applicable.
- blocker status: resolved for controlled production payment smoke; processor latency remains a follow-up observation before any soft availability decision.

## Tech Debt / Cleanup Notes

- new technical debt introduced: none.
- existing technical debt observed: paid generation stayed queued long enough to require the approved internal processor endpoint; this should be investigated before soft public availability or launch automation.
- opportunistic cleanup completed: none.
- deferred cleanup candidates: add a production-safe processor latency/readiness gate or queue drain observability check so future smokes can distinguish normal background delay from processor scheduling issues.

## Decisions Made

- Promoted latest accepted code to production while fail-closed before the smoke.
- Used scoped runtime config, not Vercel env, for runtime open/close.
- Required Admin/Ops preflight before opening runtime.
- Proceeded to payment only after owner-visible and Admin/Ops-verified Email and LINE saves passed.
- Used the approved processor endpoint once after the job remained queued and Admin/Ops recommended `retry_processor_if_safe`.
- Closed runtime immediately after delivery verification and final Admin/Ops checks.

## Uncertainties / Blockers

- No blocker remains for this controlled smoke.
- The main uncertainty is processor latency: the manual approved endpoint completed successfully, but the queue did not auto-complete within the observed wait window.

## Recommended Next Step

Controlled Production Payment Smoke Final Assessment / Gate 1 Decision v0, explicitly including the processor latency observation before any soft availability or broader traffic decision.

## Paste-Back Context

Controlled Production Payment Smoke Retry with Scoped Runtime Config v4 passed end-to-end on production. Production was promoted to target commit `3423c98e08f9` fail-closed, pre-open gates and Admin/Ops preflight passed, `payment.window.enabled` was opened via scoped runtime config, fresh production result `245be67b-a229-4cd9-b9d6-1f5c2b98e3bf` was created with `cacheHit=false`, Email save and mobile LINE bind both passed and were Admin/Ops verified, one NT$49 credit-card payment completed, Admin/Ops confirmed payment paid and entitlement active, the approved internal processor endpoint completed the queued job, paid result completed, delivery artifact was ready, Email and LINE access links were sent/active/used, and owner confirmed both `/r/` links opened the completed paid result. Runtime was closed afterward and final production status is `fail_closed_ready`. No Vercel env change, direct DB mutation, token/private output, theme work, or Module 02 work occurred. Follow-up: Gate 1 final assessment should include a processor latency/queue auto-drain observation before soft availability.
