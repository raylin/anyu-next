# Fresh NewebPay Sandbox E2E Payment Smoke v3 Handoff

Date: 2026-05-31

## Task

Run a fresh NewebPay sandbox credit-card one-time payment smoke on Preview(`staging`) after safe NotifyURL category diagnostics were deployed.

## Scope

In scope:

- Create a fresh Module 01 source result and NewebPay sandbox checkout.
- Generate a temporary local HTML payment form outside the repo.
- Pause for owner browser payment.
- After owner confirmation, poll session-bound status and inspect safe Vercel NotifyURL diagnostics.
- If paid transition succeeds, verify delivery artifacts, Vercel Queue completion, and session-bound paid access render.
- Confirm Production remains disabled.
- Document sanitized results.

Out of scope:

- Production runtime or env changes.
- Real card usage.
- Provider credential, raw payload, token, or card-data recording.
- Public copy, prompt/result behavior, LINE delivery, or broader payment behavior changes.

## Safety Constraints

- Do not print or commit MerchantID, HashKey, HashIV, `TradeInfo`, `TradeSha`, raw provider payloads, decrypted payloads, raw `pa_`, raw `pcs_`, tokenized URLs, card data, raw user input, or private values.
- Do not test Apple Pay, Google Pay, ATM, WebATM, installment, or rewards.
- Do not enable or modify Production payment runtime.

## Execution Plan

1. Verify repo/source and staging health.
2. Create fresh checkout and temporary local form.
3. Stop for owner browser payment using sandbox credit-card one-time payment only.
4. Poll status and inspect safe `newebpay_notify_failed.category` logs if payment remains pending.
5. Verify production disabled safety.
6. Write report, update summary log, commit, and push to `origin/staging`.

## Execution Notes

- Fresh checkout was created successfully for run `20260530161320`.
- Owner confirmed sandbox credit-card one-time payment was submitted and browser returned to staging.
- Session-bound status remained `waiting_for_payment` for 72 polling attempts.
- Safe NotifyURL diagnostics showed `newebpay_notify_failed.category=trade_info_decrypt_failed`.
- Production checkout and fake-paid routes remained JSON 404 `not_found`.
