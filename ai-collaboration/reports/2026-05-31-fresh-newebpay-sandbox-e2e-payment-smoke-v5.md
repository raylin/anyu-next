# Fresh NewebPay Sandbox E2E Payment Smoke v5

Date: 2026-05-31

## Summary

Result: pass.

Fresh NewebPay sandbox E2E payment smoke passed after the TradeInfo 32-byte padding compatibility fix.

What is proven:

- Preview(`staging`) was fresh at a commit newer than the padding fix.
- Fresh Module 01 source result creation passed.
- Fresh NewebPay sandbox checkout creation passed.
- Owner submitted sandbox credit-card one-time payment and returned to staging.
- NotifyURL/decrypt/provider verification path no longer blocked payment status.
- Session-bound status reached `paid_ready`.
- Paid delivery and queue completion were reached by app-level evidence.
- Session-bound access page rendered completed paid result.
- Duplicate status/access reload remained stable.
- Production stayed disabled and fail-closed.

No provider credentials, raw `TradeInfo`, raw `TradeSha`, decrypted provider payload, raw provider payload, card data, raw `pa_`, raw `pcs_`, tokenized URLs, raw user input, or private values are recorded in this report.

## Preflight And Env Alignment

Staging freshness before checkout:

| Check | Result |
|---|---|
| Staging health | HTTP 200 |
| Environment | `preview` |
| Branch | `staging` |
| Commit before smoke | `bdedda3670c3`, then redeployed to `26a890b2d62e` |
| Route bundle | `payment-foundation-2026-05-29` |

Operational note:

- Local `apps/web/.env.local` had `OPERATOR_TEST_SECRET` present, but staging initially rejected the operator header.
- Branch-scoped Preview(`staging`) `OPERATOR_TEST_SECRET` was updated from the local value without printing it.
- A fresh Preview(`staging`) deployment was triggered by pushing the handoff commit to `origin/staging`.
- Staging health then reported commit `26a890b2d62e`.

Production safety preflight:

| Check | Result |
|---|---|
| Production health | `production` / `main` / `1990fc034d74` |
| Production checkout route | JSON 404 `not_found` |
| Production fake-paid route | JSON 404 `not_found` |
| Production runtime | Not enabled |

## Fresh Checkout Result

| Check | Result |
|---|---|
| Run id | `20260530173208` |
| Source analyze | HTTP 200 |
| Checkout route | HTTP 200 |
| Checkout created | true |
| Payment intent present | true |
| Payment intent status before payment | `checkout_started` |
| Payment intent created | true |
| Sandbox gateway category | `ccore` |
| MPG version | `2.0` |
| Amount | Expected NT$49 |
| Merchant order number | Present, value not recorded |
| `TradeInfo` | Present, value not recorded |
| `TradeSha` | Present, value not recorded |
| `pcs_` ReturnURL handoff | Present, value not recorded |

Temporary local form:

- `/private/tmp/anyu-newebpay-smoke/newebpay-sandbox-submit-v5-20260530173208.html`

The temporary form contains a sandbox payment payload and must not be committed, pasted, or shared.

## Browser Payment Result

Owner confirmed:

- Payment submitted: yes.
- Method: sandbox credit-card one-time payment.
- Result: returned to staging.

No card data, full URL, provider payload, `TradeInfo`, or `TradeSha` was requested or recorded.

## NotifyURL / Paid Transition Result

Session-bound payment status after owner confirmation:

| Check | Result |
|---|---|
| Route | `POST /api/modules/ambiguous-temperature/payment/status` |
| First poll HTTP status | 200 |
| First poll status | `paid_ready` |
| Retryable | false |
| Error category | null |
| Access path | Present, value not recorded |

Interpretation:

- The previous `trade_info_decrypt_failed` blocker was resolved for this real sandbox callback.
- Payment reached the session-bound ready state.
- Paid transition, delivery artifacts, queue processing, and result readiness were completed before the first post-payment poll.

## Delivery Artifact / Queue / Access Result

App-level evidence:

| Check | Result |
|---|---|
| Paid transition | Passed by `paid_ready` state |
| Entitlement / paid access artifacts | Reached by `paid_ready` access state |
| Generation job | Reached and completed by `paid_ready` state |
| Vercel Queue trigger / consumer | Reached by paid result becoming ready without manual processor invocation |
| Manual processor invocation | Not used |
| Session-bound access page | HTTP 200 |
| Completed paid result content | Present |
| Duplicate access page reload | HTTP 200, completed content present |
| Duplicate status reload | `paid_ready`, retryable false |
| Raw `pa_` token exposure | Not observed in sanitized checks |

Note:

- The access page naturally contains the session-bound `pcs_` checkout token in browser state/URL handling. This report does not record that token or any tokenized URL.
- Vercel CLI log inspection was not used for final evidence because the app-level status/access proof was sufficient and CLI output can include tokenized helper text.

## Production Safety After Smoke

Production remained disabled and public pages remained live.

| Check | Result |
|---|---|
| Production health | HTTP 200, `environment=production`, `gitBranch=main`, `gitCommit=1990fc034d74` |
| Production homepage | HTTP 200 |
| Production `/refund` | HTTP 200 |
| Production `/legal` | HTTP 200 |
| Production checkout route | JSON 404 `not_found` |
| Production fake-paid route | JSON 404 `not_found` |
| Production payment runtime | Not enabled |

## First Failure

None.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: sandbox E2E still depends on ad hoc temporary form generation and manual owner browser payment.
- Opportunistic cleanup completed: branch-scoped Preview(`staging`) operator secret was aligned with local secure config.
- Deferred cleanup candidates: create a dedicated secret-safe sandbox checkout/E2E helper.

## Recommended Next Step

If NewebPay merchant review approval/formal credentials are available, proceed to **Production Payment Config Dry-Run v0**.

If approval is still pending, keep production runtime disabled and prepare the launch gate materials with v5 sandbox pass evidence.
