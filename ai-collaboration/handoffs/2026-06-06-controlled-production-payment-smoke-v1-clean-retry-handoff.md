# Controlled Production Payment Smoke v1 Clean Retry Handoff

Date: 2026-06-06

## Task

Run one controlled production Module 01 payment smoke using credit-card one-time payment, with pre-payment Email save, mobile LINE bind, paid generation, Email/LINE access-link delivery, Admin CLI verification, and final fail-closed shutdown.

## Scope

- Production smoke only after gates pass.
- Temporarily enable only `ENABLE_PAYMENT_RUNTIME=true` and `ENABLE_NEWEBPAY_CHECKOUT=true`.
- Keep fake-paid/operator routes disabled.
- Disable runtime/checkout again after the smoke unless owner explicitly chooses soft availability.
- No ads, no broad traffic, no theme implementation.

## Constraints

- Do not expose card data, provider payloads, TradeInfo/TradeSha, MerchantID/HashKey/HashIV, raw Email/LINE ID, encrypted recipient/hashes, or `pa_`/`pcs_`/`pal_` tokens.
- Do not commit env files or secrets.
- Use Admin API/CLI for support lookup; direct DB only for approved debugging.
- Stop on first hard failure and classify it.

## Preconditions To Confirm During Run

- NewebPay production dashboard: credit-card one-time enabled, non-card disabled, NotifyURL and ReturnURL correct, production credentials.
- Owner ready for immediate NT$49 card payment after fresh provider form.
- Owner can verify Email inbox and LINE message.
- Owner uses mobile LINE context for LINE bind.

## Deliverables

- `ai-collaboration/reports/2026-06-06-controlled-production-payment-smoke-v1-clean-retry.md`
- Updated summary log and dashboard.
- Commit and push to `origin/staging` if documentation changes pass safety checks.
