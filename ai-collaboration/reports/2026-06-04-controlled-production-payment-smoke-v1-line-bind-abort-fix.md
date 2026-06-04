# Controlled Production Payment Smoke v1 LINE Bind Abort / Fix

Date: 2026-06-04

## Completed Work

- Ran the production payment runtime preflight before v1.
- Verified readiness classification: `pass_ready_for_controlled_smoke`.
- Temporarily enabled minimum Production runtime flags for the controlled smoke window:
  - `ENABLE_PAYMENT_RUNTIME`
  - `ENABLE_NEWEBPAY_CHECKOUT`
  - `ENABLE_PAID_JOB_QUEUE_TRIGGER`
  - `ENABLE_PAID_GENERATION_PROCESSOR`
- Redeployed Production for the smoke window.
- Created a fresh Production Module 01 free result.
- Verified checkout-start page contained:
  - Email / LINE 保存查看連結 copy
  - NT$49 pricing
  - provider form
  - no internal-test/no-charge copy
  - no Email/LINE report-body delivery promise
- Owner attempted LINE bind before payment and reported the screen:
  - `這個 LINE 查看連結已失效`
- Sanitized DB verification showed:
  - Email contact created and payment-intent linked
  - no LINE contact created
  - no LINE recipient secret created
  - payment remained `checkout_started`
- Aborted v1 before payment per owner instruction.
- Disabled Production runtime/checkout/queue/processor flags again and redeployed.
- Verified Production returned to fail-closed:
  - health reachable
  - checkout API returns `not_found`
  - fake-paid route returns 404
- Implemented a narrow LINE LIFF state parsing fix.

## Failure Classification

- First failure: `line_bind_failed`
- More specific category: `liff_state_overridden_by_oauth_state`
- Payment was not attempted in v1 after this failure.
- No production Email or LINE access-link message was sent for v1.

## Root Cause

The checkout LINE CTA generated a safe LIFF entry URL with:

- LIFF entry URL
- `rlb_` bind state
- internal checkout return path

However, after LINE login, LINE can add its own OAuth `state` query parameter. The existing parser trusted direct query `state` before `liff.state`. If LINE OAuth `state` was present, it could override the valid `rlb_` bind state embedded in `liff.state`, causing `LineRecoveryBindBridge` to classify the state shape as invalid and render:

`這個 LINE 查看連結已失效`

## Fix

Updated `parseLineRecoveryBindContext` to choose the first valid recovery bind state:

1. use direct query state only if it is a valid `rlb_` recovery bind state
2. otherwise use `liff.state` if it contains a valid `rlb_` recovery bind state
3. otherwise fall back to the previous direct/liff state for safe failure messaging

This preserves safety boundaries:

- no raw `pa_`
- no raw `pcs_`
- no raw `pal_`
- no raw LINE user ID
- no provider payload
- no report body

## Tests / Validation

- Added regression coverage for the LINE login URL shape:
  - direct OAuth `state`
  - valid recovery bind state inside `liff.state`
- Targeted LINE tests passed:
  - `line-recovery-liff-page`
  - `line-recovery-bind-state`
  - `line-recovery-bind-route`
- `cd apps/web && corepack pnpm lint` passed.
- `cd apps/web && corepack pnpm test` passed: 80 files, 562 tests.
- `cd apps/web && corepack pnpm build` passed.

## Production Runtime Safety

- Production runtime was disabled after abort.
- Production checkout was disabled after abort.
- Production queue trigger and processor flags were disabled after abort.
- Production was redeployed after disabling flags.
- No payment was run in v1.
- No production DB mutation was performed manually.

## Architecture Decisions

- Did not continue with Email-only v1 because owner selected abort/fix first.
- Fixed parser behavior rather than weakening state validation.
- Kept `/r/` route and `rlb_` bind-state prefix unchanged.

## Blockers

- Controlled Production Payment Smoke v1 remains pending until the fix is deployed and owner retries LINE bind.

## Uncertainties

- The fix matches the likely LINE login redirect shape, but it still needs owner-assisted production LIFF retry after deployment.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: production LINE LIFF behavior depends on LINE-owned redirect query conventions that are hard to simulate fully in local tests.
- Opportunistic cleanup completed: added a precise regression test for OAuth `state` plus `liff.state`.
- Deferred cleanup candidates:
  - add a sanitized LIFF diagnostic event for state source/failure category without storing tokens
  - add a production-safe LINE bind pre-payment smoke path before payment runtime enablement

## Suggested Next Steps

1. Deploy the LINE LIFF parser fix.
2. Retry production LINE bind on the same non-paid v1 checkout result or create a fresh result.
3. Rerun Controlled Production Payment Smoke v1 only after LINE bind succeeds, if LINE coverage remains required.
