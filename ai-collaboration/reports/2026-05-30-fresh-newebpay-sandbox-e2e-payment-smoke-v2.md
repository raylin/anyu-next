# Fresh NewebPay Sandbox E2E Payment Smoke v2

Date: 2026-05-30

## Summary

Ran a fresh NewebPay sandbox payment smoke after the NotifyURL HTTP 400 compatibility fix.

Result: partial progress, not full E2E pass.

What improved:

- NewebPay NotifyURL reached staging after browser payment.
- Staging route logs showed `POST /api/payments/newebpay/notify` with HTTP `200`.
- This confirms the previous transport HTTP `400` compatibility issue is fixed.

What still failed:

- Session-bound payment status remained `waiting_for_payment` for the full polling window.
- No paid transition occurred.
- No delivery artifacts, queue processing, or paid access render occurred.

First failure classification: `notify_verification_failed` / provider business rejection after transport-level HTTP `200`. The exact safe category was not observable from current route logs.

No provider credentials, `TradeInfo`, `TradeSha`, raw provider payloads, decrypted payloads, card data, raw `pa_`, raw `pcs_`, tokenized URLs, raw user input, or private values are recorded in this report.

## Fresh Checkout Result

| Check | Result |
|---|---|
| Run id | `20260530-234243` |
| Staging environment | `preview` |
| Staging branch | `staging` |
| Route bundle | `payment-foundation-2026-05-29` |
| Staging git commit | `8d63503a9eab` |
| Source analyze | HTTP `200`, `ok=true`, `status=completed` |
| Checkout route | HTTP `200`, `ok=true` |
| Checkout created | `true` |
| Payment intent | Present |
| Payment intent status before payment | `checkout_started` |
| Payment intent created | `true` |
| Amount | Expected NT$49 |
| Gateway category | Sandbox `ccore` |
| Merchant order number | Present, value not recorded |
| Merchant order format | Expected ANYU NewebPay order shape |
| TradeInfo | Present, value not recorded |
| TradeSha | Present, value not recorded |
| MPG version | `2.0` |
| ReturnURL | Staging URL with `pcs_` handoff present, token not recorded |

Temporary local form:

- Path: `/private/tmp/anyu-newebpay-smoke/newebpay-sandbox-submit-v2-20260530-234243.html`
- Git-tracked: no
- Contains payment payload fields: yes

The temporary form must not be committed, pasted, or copied into reports.

## Browser Payment Result

Owner confirmed:

- Payment submitted in browser: yes.
- Method: sandbox credit-card one-time payment.
- Result: browser returned to staging.

No card data, provider payload, `TradeInfo`, `TradeSha`, or tokenized URL was requested or recorded.

## NotifyURL Result

Vercel route-level logs showed:

- `POST /api/payments/newebpay/notify`
- HTTP status `200`
- Occurred after owner browser payment return.

Interpretation:

- NotifyURL reached staging.
- Transport-level compatibility fix worked.
- NewebPay should no longer report HTTP `400` for this callback path.

However:

- Payment status did not move beyond `waiting_for_payment`.
- The route response body/header category for the real provider callback is not visible in current logs.
- The likely remaining issue is verification/business rejection inside `processNewebPayNotify(...)`, such as signature mismatch, merchant mismatch, payment intent mismatch, amount mismatch, or provider status not successful.

## Payment Status Polling

Session-bound status endpoint was polled for 72 attempts, about 6 minutes.

| Check | Result |
|---|---|
| Route | `POST /api/modules/ambiguous-temperature/payment/status` |
| HTTP status | `200` |
| Final status | `waiting_for_payment` |
| Retryable | `true` |
| Access path | Not present |
| Error category | `null` |

No transition to `paid_processing` or `paid_ready` was observed.

## Paid Transition Result

| Check | Result |
|---|---|
| Payment intent transitioned to paid | No |
| Provider verification success | Not observed |
| First failure | `notify_verification_failed` / category unknown |

## Delivery Artifact Result

Not verified because payment did not transition to paid.

| Artifact | Result |
|---|---|
| Entitlement | Not observed |
| Paid access token hash | Not observed |
| Generation job | Not observed |
| NotifyURL raw `pa_`/unlock exposure | Not observed |

## Queue Completion Result

Not verified because no paid generation job was created from a verified payment.

| Check | Result |
|---|---|
| Queue trigger enqueued via `vercel_queue` | Not observed |
| Queue consumer processed exact `generationJobId` | Not observed |
| Paid generation completed | Not observed |
| Status became ready/completed | Not observed |
| Session-bound access page rendered completed result | Skipped because access path was absent |

## Production Safety

Production remained disabled and public merchant-review pages remained live.

| Check | Result |
|---|---|
| Production health | HTTP `200`, `environment=production`, `gitBranch=main`, `gitCommit=1990fc034d74` |
| Production homepage | HTTP `200` |
| Production `/refund` | HTTP `200` |
| Production `/legal` | HTTP `200` |
| Production checkout route | JSON `404 not_found` |
| Production fake-paid route | JSON `404 not_found` |
| Production payment runtime | Not enabled |

## Failure Classification

Previous failure:

- `notify_transport_failed` / HTTP `400` compatibility issue.

Current v2 failure:

- `notify_verification_failed` after HTTP `200` NotifyURL transport.

Exact safe category is unknown because current Vercel route logs do not expose `x-anyu-payment-category` for provider callbacks.

## Recommended Next Step

Implement safe category-only NotifyURL diagnostics:

- Log only route category, HTTP transport status, merchant order presence/shape, and result category.
- Do not log raw `TradeInfo`, `TradeSha`, decrypted payload, card data, provider secrets, raw `pcs_`, raw `pa_`, tokenized URLs, or raw user input.
- Gate diagnostics to Preview(`staging`) or keep logs category-only enough to be safe.
- Then run Fresh NewebPay Sandbox E2E Payment Smoke v3 to identify whether the remaining failure is `signature_invalid`, `merchant_mismatch`, `payment_intent_not_found`, `amount_mismatch`, `payment_not_success`, or another safe category.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: NotifyURL real-provider failure category is not observable from current Vercel logs.
- Opportunistic cleanup completed: none.
- Deferred cleanup candidates: category-only NotifyURL diagnostics and a dedicated sandbox E2E helper.
