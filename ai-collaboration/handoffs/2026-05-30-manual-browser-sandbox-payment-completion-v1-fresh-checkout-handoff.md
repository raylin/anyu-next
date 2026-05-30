# Manual Browser Sandbox Payment Completion v1 Fresh Checkout Handoff

Date: 2026-05-30

## Task

Create a fresh NewebPay sandbox checkout form on Preview(`staging`), pause for owner manual browser payment submission, then verify the E2E chain after owner confirmation.

## Scope

In scope:

- Create fresh Module 01 source result.
- Create fresh NewebPay sandbox checkout.
- Generate temporary local HTML payment form outside the repo.
- Stop for owner browser action before verification polling.
- After owner confirms payment, verify sanitized status/ReturnURL/NotifyURL/delivery/queue/access.

Out of scope:

- Production runtime/env changes.
- Real credit cards.
- Non-credit-card payment methods.
- Provider implementation changes, public copy, Module 01 prompt/result behavior, or LINE delivery.

## Safety Constraints

- Do not print or commit MerchantID, HashKey, HashIV, `TradeInfo`, `TradeSha`, raw provider payloads, decrypted payloads, raw `pa_`, raw `pcs_`, tokenized URLs, raw user input, card data, or private values.
- Do not commit the temporary checkout form.
- Do not poll for payment completion before owner confirms browser payment action.
- Do not enable or modify Production payment runtime.

## Validation Plan

- If no code changes: docs presence check, secret/private scan, `git diff --check`.
- If code changes unexpectedly: `cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build`.

## Completion Notes

- Fresh checkout run id: `20260530-230023`.
- Preview(`staging`) health was verified at `environment=preview`, `gitBranch=staging`, `routeBundleVersion=payment-foundation-2026-05-29`, and `gitCommit=4c43ab562363`.
- Fresh source result creation passed.
- Fresh NewebPay sandbox checkout creation passed with HTTP 200, `paymentIntentStatus=checkout_started`, sandbox `ccore` gateway, MPG `Version=2.0`, expected NT$49 amount, and `pcs_` handoff present.
- Temporary form was generated at `/private/tmp/anyu-newebpay-smoke/newebpay-sandbox-submit-20260530-230023.html`; it is outside the repo and contains provider payment payload fields.
- Owner confirmed sandbox payment was submitted with credit-card one-time payment and browser returned to staging.
- Session-bound payment status polling ran for 72 attempts over about 6 minutes and remained `waiting_for_payment`; no access path appeared.
- Recent Vercel logs showed ReturnURL/status activity but no visible `POST /api/payments/newebpay/notify` entry in the checked window.
- First failure classification: `notify_not_received`.
- Production safety checks passed: production stayed `environment=production`, `gitBranch=main`, `gitCommit=1990fc034d74`; public pages returned 200; checkout/fake-paid routes returned JSON `404 not_found`.
