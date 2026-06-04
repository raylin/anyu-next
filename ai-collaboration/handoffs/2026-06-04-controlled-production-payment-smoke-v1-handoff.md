# Controlled Production Payment Smoke v1 Handoff

Date: 2026-06-04

## Task

Run one clean controlled production payment smoke using credit-card one-time payment and the owner's own card, verifying Module 01 paid result delivery end to end.

## Preconditions

- Owner must confirm NewebPay dashboard settings before runtime enablement:
  - credit-card one-time payment enabled
  - non-card payment methods disabled
  - NotifyURL exactly `https://anyu.tw/api/payments/newebpay/notify`
  - ReturnURL exactly `https://anyu.tw/payment/newebpay/return`
  - production credentials in use, not sandbox
- Owner must be ready to complete one NT$49 payment and verify Email/LINE messages.
- Owner must not paste card data, tokenized links, provider payloads, raw Email, raw LINE ID, hashes, or screenshots with tokens.

## Constraints

- Do not enable ads or growth launch.
- Do not enable non-card methods.
- Do not expose provider secrets, `TradeInfo`, `TradeSha`, `pa_`, `pcs_`, `pal_`, raw Email, raw LINE ID, encrypted recipient values, hashes, or provider payloads.
- Do not enable fake-paid/operator routes.
- Disable runtime again by default after the smoke unless owner explicitly chooses soft public availability.

## Planned Work

1. Run `qa:production:payment-preflight`.
2. Verify production health, clean schema, and fail-closed routes.
3. Stop for owner confirmation before runtime enablement.
4. Temporarily enable minimum runtime flags for payment smoke.
5. Create fresh production result, inspect checkout copy, save Email, and optionally bind LINE.
6. Owner completes NT$49 payment.
7. Verify ReturnURL, NotifyURL, paid result, Email/LINE access links, and sanitized DB state.
8. Disable runtime by default and document results.

## Current State

- Handoff saved before operational work.
- Production preflight passed.
- Runtime was temporarily enabled and production redeployed for the v1 smoke window.
- A fresh production result and checkout were created.
- Checkout page rendered Email/LINE save copy, NT$49, and provider form.
- Email save created a payment-linked Email contact.
- Owner reported LINE bind reached an invalid/expired LINE access-link screen before payment.
- Sanitized DB verification showed no LINE contact and no LINE recipient secret for the v1 result.
- V1 payment smoke was aborted before payment per owner instruction.
- Production runtime/checkout/queue/processor flags were disabled again and production redeployed.
- Root cause identified: LINE OAuth `state` can override valid `liff.state` recovery bind state.
- Local fix implemented and validated: prefer valid `rlb_` state from `liff.state` when direct OAuth `state` is not a recovery bind state.
