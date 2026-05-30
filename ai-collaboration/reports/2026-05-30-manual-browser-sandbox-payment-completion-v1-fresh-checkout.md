# Manual Browser Sandbox Payment Completion v1 Fresh Checkout

Date: 2026-05-30

## Summary

A fresh NewebPay sandbox checkout was created and owner confirmed manual browser sandbox credit-card one-time payment was submitted and returned to staging. The E2E chain did not complete because the session-bound payment status remained `waiting_for_payment` for the full polling window and recent Vercel logs did not show a visible NotifyURL request.

First failure classification: `notify_not_received`.

No provider credentials, `TradeInfo`, `TradeSha`, raw provider payloads, decrypted payloads, card data, raw `pa_`, raw `pcs_`, tokenized URLs, raw user input, or private values are recorded in this report.

## Fresh Checkout Creation

| Check | Result |
|---|---|
| Run id | `20260530-230023` |
| Staging environment | `preview` |
| Staging branch | `staging` |
| Route bundle | `payment-foundation-2026-05-29` |
| Staging git commit | `4c43ab562363` |
| Source analyze | HTTP `200`, `ok=true`, `status=completed` |
| Checkout route | HTTP `200`, `ok=true` |
| Checkout created | `true` |
| Payment intent | Present |
| Payment intent status | `checkout_started` |
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

- Path: `/private/tmp/anyu-newebpay-smoke/newebpay-sandbox-submit-20260530-230023.html`
- Git-tracked: no
- Contains payment payload fields: yes

The temporary form must not be committed, pasted, or copied into reports.

## Owner Browser Payment Confirmation

Owner confirmed:

- Payment submitted in browser: yes.
- Method: sandbox credit-card one-time payment.
- Result: browser returned to staging.

No card data, provider payload, `TradeInfo`, `TradeSha`, or tokenized URL was requested or recorded.

## ReturnURL / pcs_ Handoff Verification

| Check | Result |
|---|---|
| Browser returned to staging | Confirmed by owner |
| Vercel logs showed ReturnURL page activity | Yes, sanitized route-level logs only |
| `pcs_` status endpoint | Pollable through saved local checkout token |
| ReturnURL mutation | No mutation observed; status remained waiting |
| Raw `pa_` exposure | Not observed |

## Payment Status And NotifyURL Verification

Session-bound payment status was polled for 72 attempts, about 6 minutes.

| Check | Result |
|---|---|
| Status endpoint | `POST /api/modules/ambiguous-temperature/payment/status` |
| HTTP status | `200` |
| Final status | `waiting_for_payment` |
| Retryable | `true` |
| Access path | Not present |
| Error category | `null` |
| NotifyURL route observed in recent Vercel logs | No visible `POST /api/payments/newebpay/notify` in checked window |

Payment did not transition to `paid_processing` or `paid_ready`.

First failure classification: `notify_not_received`.

## Delivery Artifact Verification

Not verified because payment did not transition to paid.

| Artifact | Result |
|---|---|
| Entitlement | Not observed |
| Paid access token hash | Not observed |
| Generation job | Not observed |
| NotifyURL raw `pa_`/unlock exposure | Not observed |

## Queue Completion Verification

Not verified because no paid generation job was created from a verified payment.

| Check | Result |
|---|---|
| Queue trigger enqueued via `vercel_queue` | Not observed |
| Queue consumer processed exact `generationJobId` | Not observed |
| Paid generation completed | Not observed |
| Status became ready/completed | Not observed |
| Session-bound access page rendered completed result | Skipped because access path was absent |

## Duplicate / Reload Safety

Only safe status polling was performed.

| Check | Result |
|---|---|
| Status polling / reload equivalent | Safe, remained `waiting_for_payment` |
| Duplicate paid mutation | Not applicable; no paid transition |
| Duplicate delivery artifacts | Not applicable; no delivery artifacts |
| Payment re-submit | Not performed |

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

## Likely Causes To Investigate

- NewebPay sandbox shop NotifyURL setting may not point to `https://staging.anyu.tw/api/payments/newebpay/notify`.
- NewebPay may require NotifyURL to be configured in backend and may not trust only the encrypted request payload, depending on sandbox settings.
- Sandbox payment may have returned browser flow without sending server callback.
- Provider callback may be delayed beyond the six-minute polling window, though no route-level NotifyURL log appeared in the checked window.
- If NewebPay requires additional fields such as `ClientBackURL`, payment method fields, or a backend MPG setting, the current checkout payload may need a follow-up adjustment.

## Suggested Next Step

NewebPay Sandbox NotifyURL Debug v0:

- Verify the sandbox shop backend NotifyURL is exactly `https://staging.anyu.tw/api/payments/newebpay/notify`.
- Check NewebPay sandbox transaction/backend callback status for the redacted test order.
- Inspect Vercel logs around the payment timestamp for any NotifyURL request or provider error.
- If backend settings are correct but NotifyURL still does not arrive, add a safe provider-callback diagnostic plan that records only route-level and categorized error metadata.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: current sandbox E2E relies on a temporary local form and manual provider UI; no dedicated operator sandbox flow exists.
- Opportunistic cleanup completed: none.
- Deferred cleanup candidates: add a dedicated sandbox E2E helper and consider `ClientBackURL` / explicit credit-card-only fields if provider requires them.
