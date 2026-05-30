# NewebPay Sandbox E2E Payment Smoke v0 Handoff

Date: 2026-05-30

## Task

Run a controlled NewebPay sandbox end-to-end payment smoke on Preview(`staging`) using credit-card one-time payment only.

## Scope

In scope:

- Verify staging health and production disabled posture.
- Verify required Preview(`staging`) env names are present without printing values.
- Create a fresh Module 01 source result.
- Create a staging NewebPay checkout contract.
- Submit or prepare checkout form for NewebPay sandbox credit-card one-time payment only.
- Observe sanitized ReturnURL / NotifyURL / delivery / queue / paid access state if payment completes.
- Document pass/fail with sanitized evidence.

Out of scope:

- Production runtime/env changes.
- Real credit cards or production payments.
- Apple Pay, Google Pay, ATM, WebATM, installment, rewards, or other payment methods.
- Public copy, Module 01 prompt/result behavior, LINE delivery, or provider implementation changes.

## Safety Constraints

- Do not print or commit MerchantID, HashKey, HashIV, `TradeInfo`, `TradeSha`, raw provider payloads, decrypted payloads, raw `pa_`, raw `pcs_`, tokenized URLs, raw user input, card data, or private values.
- Do not enable Production payment runtime.
- Do not modify Production env.
- Do not commit temporary checkout form artifacts.

## Validation Plan

- If no code changes: docs presence check, secret/private scan, `git diff --check`.
- If code changes unexpectedly: `cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build`.

## Completion Notes

- Preview(`staging`) health was verified at `environment=preview`, `gitBranch=staging`, `routeBundleVersion=payment-foundation-2026-05-29`, and `gitCommit=462d11daa353`.
- Required Preview(`staging`) env names were present without values; Production env was not modified.
- Fresh source result creation passed.
- NewebPay sandbox checkout creation passed with HTTP 200, `paymentIntentStatus=checkout_started`, sandbox `ccore` gateway, MPG `Version=2.0`, and `pcs_` ReturnURL handoff present.
- A temporary local checkout form was generated at `/private/tmp/anyu-newebpay-smoke/newebpay-sandbox-submit.html`; it is not tracked by git and contains payment payload fields, so it must not be committed or pasted.
- The actual sandbox payment submission could not be completed from this Codex environment because no usable GUI browser was available. Generic `open` failed and explicit `Google Chrome` / `Safari` lookup failed.
- Payment status remained `waiting_for_payment`; NotifyURL, paid transition, delivery artifacts, queue completion, and paid access rendering were not verified in this run.
- Production safety checks passed: production health stayed `environment=production`, `gitBranch=main`, `gitCommit=1990fc034d74`; production checkout and fake-paid routes returned JSON `404 not_found`.
