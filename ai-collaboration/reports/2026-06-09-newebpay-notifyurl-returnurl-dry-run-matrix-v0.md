# NewebPay NotifyURL / ReturnURL Dry-Run Matrix v0

## Metadata

- task name: NewebPay NotifyURL / ReturnURL Dry-Run Matrix v0
- date: 2026-06-09
- report path: `ai-collaboration/reports/2026-06-09-newebpay-notifyurl-returnurl-dry-run-matrix-v0.md`
- commit: not committed at report creation
- branch / push status: `staging` / not pushed at report creation
- model / effort: GPT-5 Codex, high effort
- taskStartedAt: 2026-06-09T15:14:45Z
- taskCompletedAt: 2026-06-09T15:20:11Z
- totalWallClockDuration: 5m 26s
- humanWaitDuration: 0m
- netCodexWorkDuration: 5m 26s

## Context

- why this task exists: Repeated / Concurrency Paid-Generation Benchmark v0 passed in local/mock scope, and the next low-risk readiness gate was the provider callback truth/recovery matrix before any further real-payment activation work.
- upstream blocker / mainline context: production payment runtime remains disabled; real payment is still out of scope; low-key soft public still needs deployed repeated/concurrency automatic-drain evidence later.
- out-of-scope items: production runtime, production payment, real Email/LINE, Vercel env changes, production DB mutation, NewebPay merchant config changes, legal/product copy changes, and visual redesign.

## Scope

- what changed: added focused deterministic tests for NotifyURL/ReturnURL ordering, duplicate success, non-success provider states, unknown/wrong merchant orders, generation enqueue failure after verified payment, and ReturnURL-before-NotifyURL no-side-effect behavior.
- what did not change: NewebPay provider config, runtime config, payment business logic, entitlement schema, generation job schema, ReturnURL copy/visual layout, Email/LINE delivery, production runtime, and Vercel env.

## Current Callback Flow Inventory

| Flow step | File / route | Current behavior | Idempotency / duplicate protection | Existing coverage and gaps |
| --- | --- | --- | --- | --- |
| checkout / payment intent creation | `apps/web/src/lib/payments/newebpay/checkout-service.ts`; `/api/modules/[moduleSlug]/checkout/newebpay` | creates or reuses a pending NewebPay payment intent and builds the hosted form contract with provider-level ReturnURL | unique merchant order number; service reuses existing checkout-started intent | checkout service/route tests already cover canonical ReturnURL and no raw provider leakage |
| NotifyURL verification | `apps/web/src/lib/payments/newebpay/notify-verification.ts` | validates MerchantID, version, TradeSha, decrypts TradeInfo, parses order/amount/status/provider fields | invalid signature/decrypt/malformed payload returns safe categories before DB mutation | existing tests covered malformed, invalid signature, amount mismatch; this task strengthened matrix documentation |
| NotifyURL route response | `apps/web/src/app/api/payments/newebpay/notify/route.ts` | always returns provider-compatible text response and logs sanitized diagnostics | does not include raw payload values, TradeInfo, TradeSha, payment IDs, or tokens in response | route tests cover safe response/log shape |
| NotifyURL paid transition | `apps/web/src/lib/payments/newebpay/notify-service.ts` | verified success marks `created` / `checkout_started` intent paid, then creates delivery artifacts and triggers queue | duplicate paid intent path skips `markPaymentPaid` and reuses delivery artifact service | this task added success-then-duplicate test |
| non-success NotifyURL | `notify-service.ts` | verified non-success provider callback returns `payment_not_success`; does not mark paid and does not create entitlement/job | no paid transition; no artifacts | this task added failed/cancelled/expired provider status table; current code intentionally does not map provider failure taxonomy into local terminal status yet |
| entitlement creation | `apps/web/src/lib/payments/paid-delivery-artifacts.ts` | NotifyURL success creates or reuses one payment entitlement, with raw paid token withheld for provider payments | unique `entitlements_payment_intent_unique_idx`; unique token hash; unique conflict reread | existing tests cover reuse, unique conflict, missing token config |
| generation job enqueue | `paid-delivery-artifacts.ts`; `apps/web/src/lib/db/generation-jobs.ts` | creates or reuses one paid analysis generation job with `triggerSource="newebpay_notify"` | unique `generation_jobs_dedupe_key_idx` | this task added NotifyURL service coverage for `generation_job_create_failed` after verified payment truth |
| ReturnURL route | `apps/web/src/app/payment/newebpay/return/page.tsx`; legacy `/m/[moduleSlug]/payment/return` | renders UX/recovery state via checkout session and browser signal; it does not mark paid | ReturnURL calls `resolvePaymentAccessHandoff`; no paid mutation functions are used | existing tests covered pending, success browser return still polling, failed/expired/missing token states; this task added explicit no entitlement/job reads before NotifyURL truth |
| access handoff / status recovery | `apps/web/src/lib/payments/payment-access-handoff.ts` | reads checkout session, payment intent, entitlement, generation job, and paid result state to show waiting/processing/ready/failed | no entitlement/job creation; access path only when payment is paid and completed result is ready | this task added ordering test: ReturnURL before NotifyURL pending, then after paid truth transitions to processing |
| paid result polling | `/api/modules/[moduleSlug]/paid-result/status` | read-only status endpoint for paid access / legacy unlock state | no paid mutation; existing repeated polling tests pass | unchanged in this task |

## Dry-Run Scenario Matrix

| Scenario | Expected behavior | Automated in this task / existing coverage | Result |
| --- | --- | --- | --- |
| NotifyURL success once | mark payment paid, create/reuse entitlement, create/reuse generation job once | existing `newebpay-notify-service.test.ts` success test | pass |
| NotifyURL success repeated | no second paid transition; delivery artifacts reused/idempotent | added `handles success followed by duplicate success without duplicate paid transition` | pass |
| ReturnURL before NotifyURL | pending/recovery UX only; no entitlement/job creation | added `keeps ReturnURL-before-NotifyURL as UX-only without paid side effects` | pass |
| ReturnURL after NotifyURL success | resolves to paid processing/ready path safely based on truth state | same ordering test plus existing paid processing/ready tests | pass |
| NotifyURL success after ReturnURL pending | verified truth activates entitlement/job chain; polling/ReturnURL can recover | ordering test simulates pending first, then paid truth and entitlement/job presence | pass |
| NotifyURL failed/cancelled/expired | no paid transition; no entitlement/job | added non-success provider status table | pass; local payment intent terminal-state mapping is intentionally deferred until provider status taxonomy is defined |
| NotifyURL malformed payload | safe reject; no payment mutation | existing malformed payload tests | pass |
| NotifyURL invalid signature/hash | safe reject; no payment mutation | existing invalid signature tests | pass |
| Unknown merchant order / mismatched intent | safe reject; no entitlement/job | added unknown merchant order and wrong provider tests | pass |
| Duplicate provider trade / merchant order conflict | duplicate merchant order is handled by merchant order lookup and paid-intent status idempotency | success-then-duplicate test and delivery artifact unique-conflict tests | pass for merchant order; provider trade uniqueness is not enforced by schema and remains informational |
| ReturnURL malformed/missing token | safe UX state; no paid mutation | existing ReturnURL missing/invalid/expired checkout session tests | pass |
| Generation enqueue failure after verified payment | payment truth remains paid; service returns recovery category; entitlement/job recovery path remains diagnosable | added `generation_job_create_failed` NotifyURL service test | pass |

## Implementation Summary

- files / areas changed:
  - `apps/web/src/tests/newebpay-notify-service.test.ts`
  - `apps/web/src/tests/payment-access-handoff.test.ts`
  - `ai-collaboration/handoffs/2026-06-09-newebpay-notifyurl-returnurl-dry-run-matrix-v0-handoff.md`
  - `ai-collaboration/reports/2026-06-09-newebpay-notifyurl-returnurl-dry-run-matrix-v0.md`
  - `ai-collaboration/summaries/summary_log.md`
  - `ai-collaboration/dashboard/anyu-project-dashboard.html`
- key design decisions:
  - No provider logic rewrite was needed; the new tests confirm current truth boundary and ordering behavior.
  - NotifyURL remains the only verified paid-transition path.
  - ReturnURL remains read-only UX/recovery and does not create entitlements or generation jobs before NotifyURL truth.
  - Non-success provider NotifyURL currently rejects without marking the local intent terminal. That is safer than inventing provider status taxonomy in this task; it is documented as a future decision if needed.
- local / opportunistic cleanup decisions: none.

## Bugs Or Risks Found

- No implementation bug requiring code changes was found.
- Risk observed: provider-trade-number uniqueness is not enforced in schema. The active idempotency key is merchant order number and payment intent status. This is acceptable for the current dry-run matrix, but provider-trade uniqueness can be revisited only if NewebPay evidence shows a real conflict mode.
- Risk observed: failed/cancelled/expired provider statuses are safely rejected and do not create paid artifacts, but are not currently written as local terminal payment statuses. This avoids guessing provider taxonomy but means terminal non-paid local status mapping remains a future enhancement if support workflows require it.

## NotifyURL Truth / ReturnURL UX Conclusion

- NotifyURL is payment truth: verified success is required before paid transition, entitlement creation, generation job enqueue, paid access token issuance, and queue trigger.
- ReturnURL is UX/recovery only: before NotifyURL truth, it renders waiting/recovery state and does not read/create entitlement/job state; after truth exists, it reads the paid handoff state and shows processing/ready/failed UX.
- Browser ReturnURL `SUCCESS` is not treated as payment truth; it remains on the polling path until NotifyURL/DB state proves payment.

## Entitlement / Job Gating Conclusion

- Entitlement creation is gated behind verified NotifyURL success or explicit operator/no-card paths, not ReturnURL.
- Provider payment paths do not expose raw paid access tokens.
- Generation job creation is gated behind delivery artifacts after verified payment truth.
- Duplicate NotifyURL success reuses existing delivery artifacts and does not call `markPaymentPaid` again.
- If generation enqueue fails after payment is verified, payment truth remains recorded and the service returns `generation_job_create_failed` for Admin/Ops recovery instead of losing entitlement context silently.

## Validation

- commands run:
  - `cd apps/web && corepack pnpm test src/tests/newebpay-notify-service.test.ts src/tests/newebpay-notify-route.test.ts src/tests/newebpay-return-page.test.tsx src/tests/payment-access-handoff.test.ts src/tests/paid-delivery-artifacts.test.ts src/tests/newebpay-checkout-service.test.ts src/tests/newebpay-checkout-route.test.ts`: pass, 7 files / 55 tests
  - `cd apps/web && corepack pnpm lint`: pass
  - `cd apps/web && corepack pnpm test`: pass, 106 files / 734 tests
  - `cd apps/web && corepack pnpm build`: pass
  - `cd apps/web && corepack pnpm run qa:module01:ui`: pass, 5 Playwright tests
  - `cd apps/web && corepack pnpm run qa:module01:local`: pass, `gateStatus=pass`, `requiredChecksStatus=pass`
  - `cd apps/web && corepack pnpm run qa:module01:mock-flow`: pass
- gateStatus: pass
- commandExitCode: 0 for completed required gates
- requiredChecksStatus: pass
- optionalChecksStatus: skipped
- targetDeployCommit: not_applicable
- deployedCommitAtGateStart: not_applicable
- deployedCommitAtGateEnd: not_applicable
- freshnessStatus: not_applicable
- gates skipped and why:
  - `qa:result-checkout:no-card`: skipped because callback/gating changes were tests only and checkout/result rendering behavior was not touched.
  - `qa:fake-paid`: skipped because no staging-safe callback helper was needed for this local dry-run matrix.
  - staging-safe simulated NotifyURL / ReturnURL matrix: skipped because no existing committed helper runs this matrix against Preview(staging) without provider callback secrets; local deterministic tests covered the required boundary without deployed mutation.
  - production/runtime/payment/real channel gates: out of scope and explicitly prohibited.

## Safety

- production runtime enabled: no
- payment run: no
- Email sent: no
- LINE sent: no
- Vercel env changed: no
- DB mutated: no
- secrets/private data exposed: no

## Result

- result: pass
- first failure category: not_applicable
- blocker status: callback truth/UX matrix covered locally; production payment runtime remains disabled pending owner-selected next gate.

## Tech Debt / Cleanup Notes

- new technical debt introduced: none
- existing technical debt observed:
  - local terminal status mapping for provider failed/cancelled/expired statuses is conservative and not yet provider-taxonomy-aware.
  - provider trade number uniqueness is not a hard DB constraint.
  - no deployed staging simulated NotifyURL/ReturnURL matrix helper exists.
- opportunistic cleanup completed: explicit test coverage now protects the NotifyURL truth / ReturnURL UX boundary.
- deferred cleanup candidates:
  - NewebPay failure-status taxonomy and local terminal status mapping, only if support/Admin workflows need it.
  - staging-safe simulated callback matrix helper, only if local deterministic coverage becomes insufficient.

## Decisions Made

- Kept this as dry-run/test hardening because no runtime logic bug was found.
- Did not mark non-success provider callbacks as terminal local payment statuses without a provider-status taxonomy; rejection without paid artifacts is the safer current behavior.
- Did not run staging or no-card gates because the changed surface is local callback matrix tests, not rendering or deployed integration.

## Uncertainties / Blockers

- Real NewebPay callback transport behavior is not re-tested here because real provider transactions are out of scope.
- Low-key soft public remains blocked by deployed repeated/concurrency automatic-drain evidence, separate from this callback matrix.

## Recommended Next Step

Payment Runtime Activation Prep v0, if controlled payment-runtime readiness is the next priority.

If soft-public readiness becomes the immediate priority instead, run deployed repeated/concurrency automatic-drain benchmark before broader availability.

## Paste-Back Context

NewebPay NotifyURL / ReturnURL Dry-Run Matrix v0 passed. Added focused tests proving NotifyURL success/duplicate idempotency, ReturnURL-before-NotifyURL no side effects, NotifyURL-after-pending recovery, non-success provider callbacks no paid artifacts, unknown/wrong merchant orders safe reject, malformed/invalid signature safety, and generation enqueue failure after verified payment. No provider logic changes were required. NotifyURL remains payment truth; ReturnURL remains UX/recovery only. Full local validation, build, Module 01 UI/local/mock-flow passed. No production runtime, real payment, real Email/LINE, Vercel env change, or DB mutation occurred.
