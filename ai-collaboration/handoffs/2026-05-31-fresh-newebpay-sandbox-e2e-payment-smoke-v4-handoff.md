# Fresh NewebPay Sandbox E2E Payment Smoke v4 Handoff

Date: 2026-05-31

## Task

Run a fresh NewebPay sandbox credit-card one-time payment smoke after Preview(`staging`) NewebPay config alignment.

## Scope

In scope:

- Create fresh Module 01 source result and fresh NewebPay sandbox checkout.
- Generate temporary local HTML payment form outside the repo.
- Pause for owner browser payment.
- Poll session-bound payment status after owner confirmation.
- Inspect safe NotifyURL diagnostics if payment remains pending.
- If paid transition succeeds, verify delivery artifacts, queue completion, and session-bound paid access render.
- Confirm Production remains disabled and fail-closed.
- Document sanitized results.

Out of scope:

- Production env/runtime changes.
- Real card usage.
- Provider credential, raw payload, token, card, or raw input recording.
- Public copy, prompt/result behavior, LINE delivery, or broad payment behavior changes.

## Safety Constraints

- Do not print or commit MerchantID, HashKey, HashIV, `TradeInfo`, `TradeSha`, raw provider payloads, decrypted payloads, raw `pa_`, raw `pcs_`, tokenized URLs, card data, raw user input, or private values.
- Use sandbox credit-card one-time payment only.
- Do not enable or modify Production payment runtime.

## Execution Plan

1. Verify repo/source and staging health.
2. Create fresh checkout and temporary local form.
3. Stop for owner browser payment.
4. Poll status and inspect safe `newebpay_notify_failed.category` logs if needed.
5. Verify production disabled safety.
6. Write report, update summary log, commit, and push to `origin/staging`.

## Execution Notes

- Fresh checkout was created successfully for run `20260530164832`.
- Owner confirmed sandbox credit-card one-time payment was submitted and browser returned to staging.
- Session-bound status remained `waiting_for_payment` for 72 polling attempts.
- Safe NotifyURL diagnostics again showed `newebpay_notify_failed.category=trade_info_decrypt_failed`.
- Production checkout and fake-paid routes remained JSON 404 `not_found`.
