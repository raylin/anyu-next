# Controlled Production Payment Smoke v1 Retry with LINE Bind Checkpoint Handoff

Date: 2026-06-04

## Task

Run a controlled Production payment smoke through canonical Vercel project `anyu-next`, with a pre-payment LINE bind checkpoint before owner card payment.

## Context

- Canonical Vercel source is restored.
- `anyu.tw` and `www.anyu.tw` point to canonical `anyu-next`.
- Production preflight passes with project linking aligned.
- Production checkout/fake-paid are fail-closed before this task.
- LINE parser fix is deployed to canonical Production.
- Prior v1 attempts were aborted before payment.

## Constraints

- Do not enable ads or broad traffic.
- Enable only the minimum Production runtime flags requested for the smoke window.
- Do not enable fake-paid/operator routes.
- Do not use sandbox credentials.
- Do not expose card data, provider credentials, `TradeInfo`, `TradeSha`, `pa_`, `pcs_`, `pal_`, tokenized URLs, raw Email, raw LINE ID, encrypted recipient values, hashes, provider payloads, or raw user input.
- If LINE bind fails, abort before payment and disable runtime/checkout again.
- Default final state is runtime/checkout disabled unless owner explicitly chooses soft public availability.

## Planned Work

1. Run production preflight from canonical path.
2. Enable `ENABLE_PAYMENT_RUNTIME=true` and `ENABLE_NEWEBPAY_CHECKOUT=true` on canonical project only.
3. Deploy from repo root to canonical `anyu-next`.
4. Create a fresh synthetic Production result and verify checkout-start copy.
5. Pause for owner Email save and LINE bind checkpoint.
6. Verify sanitized DB state for Email/LINE contacts and LINE recipient secret.
7. Proceed to owner payment only if checkpoint passes.
8. Verify ReturnURL, NotifyURL, paid result, Email/LINE access-link delivery, and sanitized DB state.
9. Disable runtime/checkout again by default, redeploy, and verify fail-closed.
10. Document and commit results.

## Current State

- Handoff saved before operational work.
- Production runtime/checkout was temporarily enabled on canonical `anyu-next`.
- Canonical deployment was healthy and checkout-start rendered expected Email/LINE save-link copy.
- Fresh Production result `939e3f40-d926-4239-8d41-f8a8aadd3754` was created for the smoke.
- Owner confirmed Email save and LINE bind both succeeded.
- Sanitized DB checkpoint verified:
  - Email contact exists
  - LINE contact is `verified`
  - transactional consent is present
  - both contacts are linked to the checkout payment context
  - one active LINE recipient secret exists
- Owner then encountered an expired payment link before completing card payment.
- Failure classification: `provider_form_failed / payment_link_expired`.
- Product bug observed: expired provider links should not redirect into the payment-checking page.
- Production runtime/checkout was disabled again and Production was redeployed fail-closed.
- ReturnURL expired-link handling was fixed in code:
  - expired provider browser returns render terminal expired/support state
  - failed/cancelled provider browser returns render terminal failed/support state
  - successful provider browser returns continue using the existing non-mutating polling path
  - NotifyURL remains payment truth
- Validation passed locally and staging QA passed.
- Next action: deploy this fix to Production fail-closed, then retry Controlled Production Payment Smoke v1 with a freshly generated provider form.
