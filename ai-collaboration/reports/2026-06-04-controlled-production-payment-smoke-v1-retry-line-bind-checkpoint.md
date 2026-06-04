# Controlled Production Payment Smoke v1 Retry with LINE Bind Checkpoint

Date: 2026-06-04

## Completed Work

- Saved the handoff before operational work.
- Ran Production payment runtime preflight in dry-run mode from the canonical project path.
- Confirmed readiness before enabling: `pass_ready_for_controlled_smoke`.
- Confirmed Production public pages were live and checkout/fake-paid routes were fail-closed.
- Temporarily enabled only the required Production runtime flags:
  - `ENABLE_PAYMENT_RUNTIME`
  - `ENABLE_NEWEBPAY_CHECKOUT`
- Redeployed Production from the repo root to canonical Vercel project `anyu-next`.
- Created a fresh Production Module 01 result using non-private smoke input.
- Verified checkout-start copy and provider form presence before payment:
  - NT$49
  - Email / LINE 保存查看連結
  - no internal-test/no-charge copy
  - no Email/LINE report-body delivery promise
- Owner completed pre-payment Email save.
- Owner completed pre-payment LINE bind.
- Sanitized DB checkpoint verified Email and LINE saved-contact state before payment.
- Aborted before card payment because the owner encountered an expired NewebPay payment link.
- Disabled the two runtime flags again and redeployed Production fail-closed.
- Implemented a narrow ReturnURL fix so expired/failed provider browser returns do not enter the payment-checking/polling page.

## Preflight Result

- Command: `qa:production:payment-preflight -- --source vercel-production --mode dry-run`
- Result: `pass_ready_for_controlled_smoke`
- Canonical project alignment: passed.
- Redaction: no values, lengths, prefixes, suffixes, hashes, checksums, provider payloads, or tokens printed.

## Runtime Enablement Window

- Start: after dry-run preflight passed.
- Enabled flags:
  - `ENABLE_PAYMENT_RUNTIME`
  - `ENABLE_NEWEBPAY_CHECKOUT`
- Fake-paid/operator routes were not enabled.
- End: flags removed and fail-closed redeploy completed after the provider-link expiry failure.

## Pre-Payment Save Checkpoint

- Email save result: owner-confirmed good.
- LINE bind result: owner-confirmed good.
- LINE bind failure copy not seen:
  - no `這個 LINE 查看連結已失效`
  - no LINE login 400
  - no legacy short-code copy
  - no report body shown in LINE

Sanitized DB checkpoint:

- Email contact exists in the same checkout payment context.
- LINE contact exists in the same checkout payment context.
- LINE contact status: verified.
- Transactional consent present.
- Active LINE recipient secret count: 1.
- No raw Email, raw LINE user ID, encrypted recipient, hash, token, provider payload, or raw result content was printed.

## Failure Classification

- First failure: `provider_form_failed`
- Specific category: `payment_link_expired`

The owner reached an expired NewebPay payment link before submitting the credit-card payment. The smoke was aborted before card payment, so no v1 production payment was run in this retry.

Observed product bug:

- Expired provider/browser-return states should not route into the `付款確認中` / payment-checking page.
- ReturnURL is UX-only and must not mutate payment state.
- NotifyURL remains the payment truth.

## Fix Implemented

- Added `classifyNewebPayBrowserReturnSignal`.
- Unified provider-level ReturnURL and legacy module ReturnURL now inspect safe browser-return status/message fields.
- Obvious expired provider browser returns render terminal expired/support state.
- Obvious failed/cancelled provider browser returns render terminal failed/support state.
- Expired checkout-session handoff state now maps to the same terminal expired/support state.
- Successful provider browser returns still use the existing pending/polling path.
- The fix intentionally runs before `resolvePaymentAccessHandoff` and before `PaymentReturnPoller`, so expired provider links do not enter the polling loop.
- No NotifyURL behavior changed.
- No payment state mutation was added.

## Payment Result

- No production card payment was submitted in this retry.
- Payment method was not used.
- ReturnURL / NotifyURL / paid result render were not exercised after payment in this retry.
- Email/LINE post-payment access-link sends were not exercised in this retry.

## Production Safety Result

- Final Production runtime status: disabled.
- Final checkout behavior: fail-closed.
- Public pages remained live.
- No production Email was sent.
- No production LINE message was sent.
- No production DB mutation was performed manually.
- No NewebPay dashboard setting was changed.
- No ads or broad traffic were enabled.

## Validation

- `corepack pnpm --dir apps/web test -- src/tests/newebpay-return-page.test.tsx`: passed.
- `corepack pnpm --dir apps/web lint`: passed.
- `corepack pnpm --dir apps/web test`: passed.
- `corepack pnpm --dir apps/web build`: passed.
- `corepack pnpm --dir apps/web run qa:access-link:smoke`: passed.
- `corepack pnpm --dir apps/web run qa:result-checkout:no-card`: passed.
- `corepack pnpm --dir apps/web run qa:production:payment-preflight -- --source vercel-production --mode dry-run`: passed with runtime disabled and fail-closed routes verified.

## Architecture Decisions

- Abort before card payment on provider-link expiry rather than manually retrying inside the active runtime window.
- Keep the fix in ReturnURL UX classification only; do not let browser return mutate payment truth.
- Keep Production disabled after the aborted smoke.

## Blockers

- Controlled Production Payment Smoke v1 still needs one clean card payment run after this fix is deployed to Production.
- The provider-link expiry path needs Production verification after deployment.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed:
  - NewebPay browser-return failure/expiry semantics are inferred from safe status/message fields; provider documentation-specific enum coverage can be expanded if more real cases appear.
  - Some env names still use legacy recovery terminology internally.
- Opportunistic cleanup completed:
  - Added regression coverage for expired/failed browser-return UX and expired checkout-session handoff UX.
- Deferred cleanup candidates:
  - Add a production smoke checklist item to regenerate provider form promptly before owner card payment.
  - Add provider-return category metrics after launch if failure volume matters.

## Suggested Next Steps

1. Deploy this ReturnURL expired-link fix to Production while keeping runtime disabled.
2. Re-run Production preflight.
3. Retry Controlled Production Payment Smoke v1 with Email and LINE checkpoint, using a freshly generated NewebPay form and credit-card one-time payment only.
