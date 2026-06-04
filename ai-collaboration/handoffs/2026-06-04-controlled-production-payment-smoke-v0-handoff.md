# Controlled Production Payment Smoke v0 Handoff

## Task

Run one controlled production payment smoke using credit-card one-time payment for Module 01, verifying payment, ReturnURL, NotifyURL, paid result rendering, and Email/LINE access-link delivery.

## Hard Gates

- Do not enable production runtime until the owner confirms the NewebPay dashboard checklist:
  - credit-card one-time payment enabled
  - non-card payment methods disabled
  - NotifyURL exactly `https://anyu.tw/api/payments/newebpay/notify`
  - ReturnURL exactly `https://anyu.tw/payment/newebpay/return`
  - production credentials in use
  - no staging/sandbox URL remains
- Do not expose card data, provider credentials, `TradeInfo`, `TradeSha`, `pa_`, `pcs_`, `pal_`, raw Email, LINE ID, hashes, encrypted values, or tokenized URLs.
- Do not enable ads or broaden launch scope.
- Do not enable fake-paid/operator production routes.

## Planned Steps

1. Read-only production/staging preflight.
2. Stop if provider dashboard checklist is not explicitly confirmed.
3. If confirmed, enable minimum production flags only.
4. Redeploy production and verify checkout availability.
5. Owner completes one NT$49 credit-card one-time payment.
6. Verify ReturnURL polling, NotifyURL transition, paid result, access-link delivery, and sanitized DB state.
7. Disable runtime again by default unless explicitly instructed otherwise.
8. Document results, update summary/dashboard, commit, and push to `origin/staging`.

## Current Execution State

- Handoff created before operational work.
- Owner confirmed the provider dashboard checklist and controlled-smoke scope.
- Production runtime was temporarily enabled for one controlled payment smoke, then disabled again after the recovered smoke.
- One production card payment was accepted by NewebPay and NotifyURL marked the payment paid.
- Missing runtime env was discovered, added, and activated; owner resent NotifyURL to recover downstream delivery.
- Final verified state: entitlement active, generation completed, paid result completed, Email access-link provider accepted, production checkout/runtime disabled again.
