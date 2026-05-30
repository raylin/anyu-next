# Fresh NewebPay Sandbox E2E Payment Smoke v3

Date: 2026-05-31

## Summary

Ran a fresh NewebPay sandbox credit-card one-time payment smoke on Preview(`staging`) after Safe NotifyURL Category Diagnostics v0 was deployed.

Result: partial progress, not full E2E pass.

What is proven:

- Fresh checkout creation still works on Preview(`staging`).
- Owner successfully submitted sandbox credit-card one-time payment and returned to staging.
- NewebPay NotifyURL reached staging and returned HTTP 200 transport.
- Safe diagnostics captured the exact business failure category.
- Production remained disabled and safe.

First failure:

- `trade_info_decrypt_failed`

Interpretation:

- The callback reached ANYU and had the expected provider form shape.
- The failure occurred while decrypting provider `TradeInfo`.
- This is most consistent with a staging NewebPay credential/config mismatch, especially `NEWEBPAY_HASH_KEY` / `NEWEBPAY_HASH_IV`, or sandbox shop/gateway credentials not matching the shop that sent the callback.
- Payment intent matching, amount matching, queue processing, and paid access rendering were not reached.

No provider credentials, raw `TradeInfo`, raw `TradeSha`, decrypted payload, raw provider payload, card data, raw `pa_`, raw `pcs_`, tokenized URLs, raw user input, or private values are recorded in this report.

## Preflight

| Check | Result |
|---|---|
| Local branch | `staging` |
| Local HEAD before smoke | `1bb76a9e73a4` |
| `origin/staging` before smoke | `1bb76a9e73a4` |
| Worktree before smoke | clean except task handoff |
| Staging health | HTTP 200 |
| Staging environment | `preview` |
| Staging branch | `staging` |
| Staging commit | `1bb76a9e73a4` |
| Route bundle | `payment-foundation-2026-05-29` |
| Production health | HTTP 200, `production` / `main` |

## Staging Secret Handling

The shell did not have `OPERATOR_TEST_SECRET`.

To create the gated staging checkout without enabling production runtime, `OPERATOR_TEST_SECRET` was rotated only for branch-scoped Preview(`staging`) and retained locally only under `/private/tmp` for this smoke. Production env was not modified.

Preview(`staging`) was redeployed after the staging-only operator secret rotation.

## Fresh Checkout Result

| Check | Result |
|---|---|
| Run id | `20260530161320` |
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

- `/private/tmp/anyu-newebpay-smoke/newebpay-sandbox-submit-v3-20260530161320.html`

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

This confirms:

- NotifyURL transport works.
- The provider POST shape is present.
- The failure occurs before decrypted payload parsing, payment intent lookup, amount check, paid transition, delivery artifacts, queue trigger, or access handoff.

## Paid Transition Result

| Check | Result |
|---|---|
| Payment intent transitioned to paid | No |
| Provider verification success | No |
| First failure | `trade_info_decrypt_failed` |

## Delivery Artifact Result

Not reached because the payment did not transition to paid.

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

## Recommended Minimal Next Fix

Do not change payment runtime behavior yet.

Recommended next task: **NewebPay Sandbox TradeInfo Decrypt Config Alignment v0**.

Scope should be:

- Verify branch-scoped Preview(`staging`) `NEWEBPAY_MERCHANT_ID`, `NEWEBPAY_HASH_KEY`, and `NEWEBPAY_HASH_IV` are from the same sandbox shop that processed the payment.
- Verify NewebPay sandbox gateway and environment are consistent with those credentials.
- Confirm no accidental copy from production credentials, old sandbox shop, or another NewebPay project.
- If credentials are confirmed, add a secret-safe local fixture test using owner-provided sandbox callback data only through secure shell/local file, never chat or repo.
- Re-run fresh sandbox E2E after config alignment.

## Tech Debt Review

New technical debt introduced:

- None in code. A staging-only `OPERATOR_TEST_SECRET` rotation was performed operationally to create the gated checkout.

Existing technical debt observed:

- Sandbox provider callback decryptability is not yet validated against real NewebPay callbacks.
- Checkout E2E requires operator-gated helper steps while production payment runtime remains disabled.

Opportunistic cleanup completed:

- None.

Deferred cleanup candidates:

- Create a dedicated secret-safe sandbox checkout helper to reduce repeated manual scripts.
- Add an operator-only staging checkout smoke command that can create the local payment form without exposing payload values.

## Blockers / Uncertainties

- The exact credential/config mismatch cannot be resolved from logs alone because raw provider payload and secrets must not be logged.
- Owner/operator must verify sandbox `HashKey` / `HashIV` / `MerchantID` alignment in Vercel Preview(`staging`) and NewebPay backend.

## Recommended Next Step

Run NewebPay Sandbox TradeInfo Decrypt Config Alignment v0, then rerun Fresh NewebPay Sandbox E2E Payment Smoke v4.
