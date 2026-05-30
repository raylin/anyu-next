# Fresh NewebPay Sandbox E2E Payment Smoke v4

Date: 2026-05-31

## Summary

Ran a fresh NewebPay sandbox credit-card one-time payment smoke after Preview(`staging`) NewebPay config alignment.

Result: partial progress, not full E2E pass.

What is proven:

- Fresh checkout creation still works on Preview(`staging`).
- Owner successfully submitted sandbox credit-card one-time payment and returned to staging.
- NewebPay NotifyURL reached staging with HTTP 200 transport.
- Safe diagnostics again captured `trade_info_decrypt_failed`.
- Production remained disabled and fail-closed.

First failure:

- `trade_info_decrypt_failed`

Interpretation:

- The Preview(`staging`) env alignment did not resolve decryption.
- The provider callback form shape is present and transport is healthy.
- The failure still occurs before decrypted payload parsing, payment intent lookup, amount matching, paid transition, delivery artifact creation, queue trigger, or access handoff.
- Do not change decrypt code yet. The next evidence should come from NewebPay sandbox backend/shop credential verification.

No provider credentials, raw `TradeInfo`, raw `TradeSha`, decrypted payload, raw provider payload, card data, raw `pa_`, raw `pcs_`, tokenized URLs, raw user input, or private values are recorded in this report.

## Preflight

| Check | Result |
|---|---|
| Local branch | `staging` |
| Local HEAD before smoke | `86dddcbe4e2b` |
| `origin/staging` before smoke | `86dddcbe4e2b` |
| Staging health | HTTP 200 |
| Staging environment | `preview` |
| Staging branch | `staging` |
| Staging commit | `86dddcbe4e2b` |
| Route bundle | `payment-foundation-2026-05-29` |
| Production health | HTTP 200, `production` / `main` |

## Fresh Checkout Result

| Check | Result |
|---|---|
| Run id | `20260530164832` |
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

- `/private/tmp/anyu-newebpay-smoke/newebpay-sandbox-submit-v4-20260530164832.html`

The temporary form contains a sandbox payment payload and must not be committed, pasted, or shared.

## Browser Payment Result

Owner confirmed:

- Payment submitted: yes.
- Method: sandbox credit-card one-time payment.
- Result: returned to staging.

No card data, full URL, provider payload, `TradeInfo`, or `TradeSha` was requested or recorded.

## Payment Status Polling

Session-bound payment status was polled for 72 attempts, about 6 minutes.

| Check | Result |
|---|---|
| Route | `POST /api/modules/ambiguous-temperature/payment/status` |
| HTTP status | 200 |
| Final status | `waiting_for_payment` |
| Retryable | true |
| Access path | absent |
| Error category | null |

No transition to `paid_processing` or `paid_ready` occurred.

## NotifyURL Diagnostic Result

Vercel logs showed one real provider NotifyURL callback for this smoke.

Sanitized diagnostic:

| Field | Result |
|---|---|
| Event | `newebpay_notify_failed` |
| Category | `trade_info_decrypt_failed` |
| Environment | `sandbox` |
| HTTP transport status | 200 |
| Provider response | `0|ERROR` |
| Content type category | `form_urlencoded` |
| MerchantID present | true |
| TradeInfo present | true |
| TradeSha present | true |
| Version present | true |
| Merchant match | not reached |
| Amount match | not reached |
| Payment intent found | not reached |

## Paid Transition Result

| Check | Result |
|---|---|
| Payment intent transitioned to paid | No |
| Provider verification success | No |
| First failure | `trade_info_decrypt_failed` |

## Delivery Artifact Result

Not reached because payment did not transition to paid.

| Artifact | Result |
|---|---|
| Entitlement | Not created/verified |
| Paid access token hash | Not created/verified |
| Generation job | Not created/verified |
| NotifyURL raw token exposure | No raw token exposure observed |

## Queue And Access Result

Not reached because no paid generation job was created from a verified payment.

| Check | Result |
|---|---|
| Queue trigger enqueued via `vercel_queue` | Not observed |
| Queue consumer processed exact `generationJobId` | Not observed |
| Paid generation completed | Not observed |
| Session-bound paid access rendered | Not observed |

## Production Safety

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

## Recommended Next Step

Do not change decrypt algorithm yet.

Recommended next task: **NewebPay Sandbox Backend Credential Verification v0**.

Owner/operator should verify in NewebPay sandbox backend and local secure config, without pasting values into chat:

- MerchantID belongs to the exact sandbox shop that processed the transaction.
- HashKey belongs to that same sandbox shop.
- HashIV belongs to that same sandbox shop.
- There is no production/sandbox mix.
- There is no old sandbox shop/new sandbox shop mix.
- Values have no copied whitespace, quotes, hidden characters, or truncated characters.
- Gateway/environment is sandbox `ccore`.
- The transaction being inspected belongs to the same MerchantID/shop as the configured values.

After backend credential verification or correction, rerun a fresh sandbox E2E smoke.

## Tech Debt Review

New technical debt introduced:

- None in code.

Existing technical debt observed:

- Sandbox E2E remains manual and needs repeated temporary form generation.
- Real-provider paid transition remains blocked until NewebPay sandbox credential/shop alignment is resolved.

Opportunistic cleanup completed:

- Updated project dashboard state to reflect that v4 has run and still fails at `trade_info_decrypt_failed`.

Deferred cleanup candidates:

- Dedicated secret-safe sandbox checkout/E2E helper.
- Safe env readiness script that can compare presence/categories but never values.

## Blockers / Uncertainties

- The reason real NewebPay sandbox callbacks cannot be decrypted remains outside observable app logs because raw payloads and secrets must not be recorded.
- The strongest remaining hypothesis is backend/shop credential mismatch or copied value formatting issue.
