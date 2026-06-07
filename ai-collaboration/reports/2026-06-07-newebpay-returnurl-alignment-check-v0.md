# NewebPay ReturnURL Alignment Check v0

## Metadata

- task name: NewebPay ReturnURL Alignment Check v0
- date: 2026-06-07
- report path: `ai-collaboration/reports/2026-06-07-newebpay-returnurl-alignment-check-v0.md`
- commit: pending
- branch / push status: pending
- model / effort: GPT-5 Codex, high
- taskStartedAt: 2026-06-07T13:51:22Z
- taskCompletedAt: 2026-06-07T13:57:34Z
- totalWallClockDuration: 6m12s
- humanWaitDuration: 0m
- netCodexWorkDuration: 6m12s

## Context

- why this task exists: before another NewebPay payment smoke, ReturnURL source-of-truth needed explicit verification across code, local env mirrors, Vercel env, process docs, provider dashboard expectations, and legacy route behavior.
- upstream blocker / mainline context: production smoke v3 stopped before payment due Admin/Ops token availability after Email/LINE save success. This audit found an additional pre-payment smoke blocker in Vercel URL-bearing env values.
- out-of-scope items: production runtime open, payment, Email/LINE sends, Vercel env mutation, DB mutation, migrations, and provider dashboard mutation.

## Scope

- what changed: documentation/report/dashboard state only.
- what did not change: no runtime route behavior, app code, env values, provider dashboard settings, DB state, or Vercel project settings changed.

## Implementation Summary

- files / areas changed: production gate policy, summary log, dashboard, handoff, and report.
- key design decisions: did not silently treat the legacy module route as a redirect; recorded it as compatibility-only by checkout generation contract but not currently an HTTP redirect.
- local / opportunistic cleanup decisions: deleted temporary Vercel env pull files after extracting only safe URL-bearing fields.

## Canonical ReturnURL Findings

- canonical code path: `apps/web/src/lib/payments/newebpay/checkout-service.ts` constructs ReturnURL as `${NEXT_PUBLIC_APP_URL}/payment/newebpay/return?...`.
- canonical route exists: `apps/web/src/app/payment/newebpay/return/page.tsx`.
- checkout contract test asserts generated ReturnURL contains `/payment/newebpay/return` and does not contain `/m/ambiguous-temperature/payment/return`.
- result: canonical ReturnURL route is `/payment/newebpay/return`.

## Local Env Mirror Findings

- `.env.staging` contains `NEXT_PUBLIC_APP_URL="https://staging.anyu.tw"` and `NEWEBPAY_NOTIFY_URL="https://staging.anyu.tw/api/payments/newebpay/notify"`.
- `.env.production` contains `NEXT_PUBLIC_APP_URL="https://anyu.tw"` and `NEWEBPAY_NOTIFY_URL="https://anyu.tw/api/payments/newebpay/notify"`.
- there is no separate ReturnURL env variable in current code; ReturnURL is derived from `NEXT_PUBLIC_APP_URL`.
- local mirror result: pass.
- derived staging ReturnURL: `https://staging.anyu.tw/payment/newebpay/return`.
- derived production ReturnURL: `https://anyu.tw/payment/newebpay/return`.

## Vercel Env Findings

- `vercel env ls` shows `NEXT_PUBLIC_APP_URL` and `NEWEBPAY_NOTIFY_URL` names exist for Production and Preview(staging).
- `vercel env pull --environment production` returned blank values for `NEXT_PUBLIC_APP_URL` and `NEWEBPAY_NOTIFY_URL`.
- `vercel env pull --environment preview --git-branch staging` returned blank values for `NEXT_PUBLIC_APP_URL` and `NEWEBPAY_NOTIFY_URL`.
- result: blocked.
- first failure category: `vercel_returnurl_env_blank`.
- impact: payment smoke must not continue until Vercel Preview(staging) and Production URL-bearing values are restored from local mirrors and redeployed fail-closed if required.

## Process Docs / Production Gate Result

- existing process docs already required ReturnURL/NotifyURL reporting, but did not name the canonical path.
- updated `ai-collaboration/process/production-gate-policy.md` to require:
  - production canonical ReturnURL: `https://anyu.tw/payment/newebpay/return`
  - production NotifyURL: `https://anyu.tw/api/payments/newebpay/notify`
  - blocking payment smoke when Vercel URL-bearing env values are blank
  - legacy module ReturnURL must not be active provider dashboard ReturnURL.

## NewebPay Dashboard Owner Action

- Codex cannot inspect or mutate the NewebPay dashboard in this task.
- owner must verify staging dashboard ReturnURL is `https://staging.anyu.tw/payment/newebpay/return` if using staging provider settings.
- owner must verify production dashboard ReturnURL is `https://anyu.tw/payment/newebpay/return`.
- owner must verify NotifyURL settings:
  - staging: `https://staging.anyu.tw/api/payments/newebpay/notify`
  - production: `https://anyu.tw/api/payments/newebpay/notify`

## Legacy Module ReturnURL Route

- legacy route exists: `apps/web/src/app/m/[moduleSlug]/payment/return/page.tsx`.
- active checkout generation does not use this route.
- current behavior: renders the shared NewebPay return experience with `moduleSlugHint`.
- status: compatibility-only by generation contract, but not an HTTP redirect.
- follow-up if strict redirect is required: convert this route to a compatibility redirect preserving safe query params to `/payment/newebpay/return`.

## Validation

- commands run:
  - `rg` searches for ReturnURL / NotifyURL / NewebPay route references.
  - `vercel env ls`: read-only metadata check for Production and Preview(staging).
  - `vercel env pull` to `/private/tmp`: read-only value check, extracting only `NEXT_PUBLIC_APP_URL` and `NEWEBPAY_NOTIFY_URL`.
  - `curl -sS https://anyu.tw/api/health`: production health reachable.
  - `curl -sS https://staging.anyu.tw/api/health`: staging health reachable.
- gateStatus: blocked.
- commandExitCode: Vercel metadata/value commands returned 0; blocker is semantic blank value mismatch.
- requiredChecksStatus: blocked due Vercel URL-bearing env blank values.
- optionalChecksStatus: not_applicable.
- targetDeployCommit / deployedCommitAtGateStart / deployedCommitAtGateEnd: not_applicable.
- gates skipped and why:
  - production runtime/payment/Email/LINE: skipped; this is an alignment audit and Vercel env is blocked.
  - NewebPay dashboard direct check: skipped; requires owner dashboard access.

## Safety

- production runtime enabled: no.
- payment run: no.
- Email sent: no.
- LINE sent: no.
- Vercel env changed: no.
- DB mutated: no.
- secrets/private data exposed: no.
- temporary Vercel env pull files deleted: yes.

## Result

- result: blocked.
- first failure category: `vercel_returnurl_env_blank`.
- blocker status: Vercel Preview(staging) and Production URL-bearing env values must be restored and NewebPay dashboard ReturnURL must be owner-verified before another production payment smoke.

## Tech Debt / Cleanup Notes

- new technical debt introduced: none.
- existing technical debt observed: legacy module ReturnURL route is compatibility-only but not an HTTP redirect.
- opportunistic cleanup completed: production gate policy now names canonical ReturnURL/NotifyURL.
- deferred cleanup candidates: convert legacy module ReturnURL route into explicit compatibility redirect if owner wants that stricter invariant.

## Decisions Made

- Did not mutate Vercel env values.
- Did not mutate provider dashboard values.
- Did not run production runtime or payment.
- Treated blank Vercel URL-bearing env values as a hard blocker, not a warning.

## Uncertainties / Blockers

- Whether NewebPay staging dashboard currently points to the canonical staging ReturnURL is unknown and owner-action required.
- Whether blank Vercel env values are intentional is unknown; by policy they block payment smoke because local mirrors contain non-empty values.

## Recommended Next Step

Restore Vercel Preview(staging) and Production `NEXT_PUBLIC_APP_URL` / `NEWEBPAY_NOTIFY_URL` from the local mirrors, redeploy fail-closed if required, have owner verify NewebPay dashboard ReturnURL/NotifyURL settings, then rerun ReturnURL alignment and production Admin/Ops preflight before Controlled Production Payment Smoke Retry with Scoped Runtime Config v4.

## Paste-Back Context

The code canonical NewebPay ReturnURL is `/payment/newebpay/return`, derived from `NEXT_PUBLIC_APP_URL`; local staging/production mirrors are aligned. Read-only Vercel env pull returned blank values for `NEXT_PUBLIC_APP_URL` and `NEWEBPAY_NOTIFY_URL` in both Preview(staging) and Production, so payment smoke is blocked until Vercel env is restored from local mirrors. The legacy module ReturnURL route is not used by checkout generation, but it renders shared return UX rather than redirecting; convert it to an explicit compatibility redirect only if that stricter invariant is required.
