# Fresh NewebPay Sandbox E2E Payment Smoke v2 Handoff

Date: 2026-05-30

## Task

Run a fresh NewebPay sandbox E2E payment smoke after the NotifyURL HTTP 400 compatibility fix.

## Scope

In scope:

- Create fresh Module 01 source result and NewebPay sandbox checkout.
- Generate a fresh temporary local HTML payment form outside the repo.
- Pause for owner browser payment action.
- After confirmation, verify NotifyURL, paid transition, delivery artifacts, Vercel Queue completion, and session-bound access rendering.
- Verify production remains disabled.

Out of scope:

- Production runtime/env changes.
- Real card use.
- Non-credit-card payment methods.
- Raw provider payload collection or logging.
- Public copy, Module 01 prompt/result behavior, LINE delivery, or broad payment behavior changes.

## Safety Constraints

- Do not print or commit MerchantID, HashKey, HashIV, `TradeInfo`, `TradeSha`, raw provider payloads, decrypted payloads, raw `pa_`, raw `pcs_`, tokenized URLs, card data, raw user input, or private values.
- Do not commit the temporary checkout form.
- Do not enable or modify Production payment runtime.

## Validation Plan

- If no code changes: docs presence check, secret/private scan, `git diff --check`.
- If code changes unexpectedly: `cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build`.

## Completion Notes

- Fresh checkout run id: `20260530-234243`.
- Preview(`staging`) health was verified at `environment=preview`, `gitBranch=staging`, `routeBundleVersion=payment-foundation-2026-05-29`, and `gitCommit=8d63503a9eab`.
- Fresh source result creation passed.
- Fresh NewebPay sandbox checkout creation passed with HTTP 200, `paymentIntentStatus=checkout_started`, sandbox `ccore` gateway, MPG `Version=2.0`, expected NT$49 amount, and `pcs_` handoff present.
- Temporary form was generated at `/private/tmp/anyu-newebpay-smoke/newebpay-sandbox-submit-v2-20260530-234243.html`; it is outside the repo and contains provider payment payload fields.
- Owner confirmed sandbox payment was submitted with credit-card one-time payment and browser returned to staging.
- Vercel route logs showed `POST /api/payments/newebpay/notify` with HTTP 200 after the browser payment, confirming the prior HTTP 400 transport issue is fixed.
- Session-bound payment status polling ran for 72 attempts over about 6 minutes and remained `waiting_for_payment`; no access path appeared.
- First failure classification: `notify_verification_failed` or provider business rejection after HTTP 200 transport acknowledgement; exact category was not observable from current route logs.
- Production safety checks passed: production stayed `environment=production`, `gitBranch=main`, `gitCommit=1990fc034d74`; public pages returned 200; checkout/fake-paid routes returned JSON `404 not_found`.
