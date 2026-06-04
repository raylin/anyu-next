# Controlled Production Payment Smoke v1 Retry with LINE Bind Checkpoint Handoff

Date: 2026-06-04

## Task

Run Controlled Production Payment Smoke v1 with an explicit pre-payment LINE bind checkpoint:

1. enable Production runtime/checkout temporarily
2. verify Email save and LINE bind before payment
3. proceed to one NT$49 credit-card one-time payment only if LINE bind succeeds
4. verify paid result, Email access link, LINE access link, and `/r/` paid-result access
5. disable Production runtime/checkout again by default after the smoke

## Context

- LINE LIFF parser fix from commit `538eccb` is deployed to Production.
- `anyu.tw` points to the deployment containing the fix.
- Production public pages are live.
- Production dry-run preflight passes.
- Production checkout/fake-paid are fail-closed.
- Previous LINE bind retry could not run because checkout/runtime-disabled pages do not expose the LINE save CTA.
- Production DB had 0 LINE contacts and 0 LINE recipient secrets before this retry.
- No payment was run in the previous retry task.

## Constraints

- Do not enable ads or broad traffic.
- Do not enable non-card payment methods.
- Do not expose card data, provider secrets, `TradeInfo`, `TradeSha`, `pa_`, `pcs_`, `pal_`, tokenized URLs, raw Email, raw LINE ID, encrypted recipient values, hashes, provider payloads, or raw user input.
- Do not enable fake-paid/operator smoke routes.
- Do not manually mutate Production DB.
- If LINE bind fails, abort before payment and disable runtime/checkout again.

## Planned Work

1. Run production payment preflight and verify fail-closed state before enabling.
2. Temporarily set `ENABLE_PAYMENT_RUNTIME=true` and `ENABLE_NEWEBPAY_CHECKOUT=true` for Production only.
3. Redeploy Production and verify checkout availability.
4. Create a fresh synthetic Production result and checkout page.
5. Stop for owner Email save and LINE bind checkpoint.
6. Verify sanitized DB contact/secret state after bind.
7. Proceed to owner card payment only if the checkpoint passes.
8. Verify ReturnURL, NotifyURL, paid result, Email/LINE access-link sends, and sanitized DB state.
9. Disable runtime/checkout again by default, redeploy, and verify fail-closed state.
10. Write report, summary log, and dashboard updates.
11. Run docs/redaction checks, commit, and push to `origin/staging`.

## Uncertainties

- Owner must provide checkpoint results without pasting tokenized links or screenshots containing tokens.
- If Production payment provider dashboard settings differ from the stated preconditions, the smoke may need to stop before payment.

## Current State

- Dry-run Production preflight passed with `pass_ready_for_controlled_smoke`.
- The two requested runtime flags were temporarily added to the currently linked Vercel project and Production was redeployed.
- A fresh synthetic Production result was created.
- Checkout API became reachable but returned missing NewebPay checkout/notify config.
- This exposed a Production Vercel project/env source-of-truth mismatch: the local CLI deploy target was project `web`, which did not have the full payment/provider env set.
- Smoke was aborted before Email save, LINE bind, payment, Email send, or LINE send.
- The two temporary runtime flags were removed.
- Production was redeployed and re-aliased fail-closed.
- Final safety verification:
  - public pages 200
  - checkout API 404 `not_found`
  - fake-paid route 404
  - linked Vercel project has no remaining temporary runtime env vars
- Read-only aggregate Production DB check showed 0 LINE contacts and 0 LINE recipient secrets.
