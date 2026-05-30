# NewebPay Sandbox E2E Payment Smoke v0

Date: 2026-05-30

## Summary

The controlled NewebPay sandbox E2E smoke was partially completed and is blocked at manual sandbox payment submission.

Completed:

- Verified Preview(`staging`) health and env-name presence.
- Verified Production remains disabled and fail-closed.
- Created a fresh Module 01 source result.
- Created a NewebPay sandbox checkout contract successfully.
- Generated a temporary local HTML form for manual sandbox payment submission outside the repo.

Blocked:

- Actual NewebPay sandbox credit-card one-time payment was not submitted because the Codex environment had no usable GUI browser. Generic `open` failed, and explicit `Google Chrome` / `Safari` application lookup failed.

No provider credentials, `TradeInfo`, `TradeSha`, raw provider payloads, decrypted payloads, card data, raw `pa_`, raw `pcs_`, tokenized URLs, raw user input, or private values are recorded in this report.

## Preflight

| Check | Result |
|---|---|
| Staging health URL | `https://staging.anyu.tw/api/health` |
| Staging environment | `preview` |
| Staging branch | `staging` |
| Staging route bundle | `payment-foundation-2026-05-29` |
| Staging commit | `462d11daa353` |
| Production health | `environment=production`, `gitBranch=main`, `gitCommit=1990fc034d74` |
| Production checkout route | JSON `404 not_found` |
| Production fake-paid route | JSON `404 not_found` |

Owner-provided sandbox shop/payment-method state:

- Sandbox shop status: `營運中`.
- First E2E target payment method: credit-card one-time payment only.

Preview(`staging`) env names confirmed present without values:

- `NEWEBPAY_MERCHANT_ID`
- `NEWEBPAY_HASH_KEY`
- `NEWEBPAY_HASH_IV`
- `NEWEBPAY_CHECKOUT_URL`
- `NEWEBPAY_NOTIFY_URL`
- `NEWEBPAY_ENVIRONMENT`
- `ENABLE_NEWEBPAY_CHECKOUT`
- `PAYMENT_CHECKOUT_SESSION_SECRET`
- `PAID_ACCESS_TOKEN_HASH_SECRET`
- `ENABLE_PAID_JOB_QUEUE_TRIGGER`
- `PAID_JOB_QUEUE_PROVIDER`
- `PAID_JOB_QUEUE_TOPIC`
- `OPERATOR_TEST_SECRET`
- `INTERNAL_JOB_SECRET`

Production env was not modified.

## Source Result Creation

Fresh Module 01 source result creation passed:

| Check | Result |
|---|---|
| Route | `POST /api/modules/ambiguous-temperature/analyze` |
| HTTP status | `200` |
| API status | `completed` |
| Result id | Present, value not recorded |

The synthetic QA input was not recorded in this report.

## Checkout Creation

Staging checkout creation passed:

| Check | Result |
|---|---|
| Route | `POST /api/modules/ambiguous-temperature/checkout/newebpay` |
| HTTP status | `200` |
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

No paid transition, entitlement, `pa_` token, `generation_job`, or queue trigger occurred at checkout creation.

## Sandbox Payment Submission

Status: blocked.

A temporary local checkout form was generated:

- Path: `/private/tmp/anyu-newebpay-smoke/newebpay-sandbox-submit.html`
- Git-tracked: no
- Contains payment payload: yes

The file is intentionally outside the repo and must not be committed, pasted, or copied into reports.

Browser availability result:

- Generic `open` failed with no compatible application.
- Explicit `Google Chrome` lookup failed.
- Explicit `Safari` lookup failed.

Current payment status after checkout remained:

| Check | Result |
|---|---|
| Status endpoint | `POST /api/modules/ambiguous-temperature/payment/status` |
| HTTP status | `200` |
| Status | `waiting_for_payment` |
| Retryable | `true` |
| Access path | Not present |

First failure classification: `payment_page_failure` / local browser unavailable before provider payment page submission.

## ReturnURL / NotifyURL / Delivery / Queue / Access

Not verified in this run because sandbox payment was not submitted.

| Area | Result |
|---|---|
| ReturnURL observation | Not reached |
| NotifyURL received | Not verified |
| Payment transition to paid | Not verified |
| Provider verification | Not verified |
| Entitlement creation | Not verified |
| Paid access token hash creation | Not verified |
| Generation job creation | Not verified |
| Vercel Queue enqueue | Not verified |
| Exact generation job processing | Not verified |
| Paid access render | Not verified |
| Duplicate/reload behavior | Not verified |

## Production Safety

Production remained disabled:

- Production health stayed on `main` at `1990fc034d74`.
- Production checkout route returned JSON `404 not_found`.
- Production operator fake-paid route returned JSON `404 not_found`.
- Production payment runtime was not enabled.
- Production env was not modified.

## Manual Continuation

To continue this exact smoke manually:

1. Open `/private/tmp/anyu-newebpay-smoke/newebpay-sandbox-submit.html` in a local browser that can reach the internet.
2. Submit the form to NewebPay sandbox.
3. Use credit-card one-time payment only.
4. Use only NewebPay sandbox test-card data from NewebPay sandbox documentation or backend; do not use a real card.
5. Do not save screenshots containing full card data, provider payloads, tokenized URLs, or private values into the repo.
6. After payment completion, re-run sanitized status/ReturnURL/queue/access verification.

Official NewebPay docs reference used for sandbox card guidance:

- https://developer.newebpay.com/docs/creditcard_credit_card_reference

## Blockers / Uncertainties

- Codex environment cannot complete the provider-hosted browser payment page without a usable browser.
- Actual sandbox NotifyURL, paid transition, delivery artifacts, queue completion, and paid access rendering remain unverified.
- If NewebPay requires `ClientBackURL` or explicit payment-method restriction fields, a follow-up implementation task is still needed.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: current checkout implementation does not include `ClientBackURL` or explicit credit-card-only provider fields.
- Opportunistic cleanup completed: none.
- Deferred cleanup candidates: add a dedicated sandbox E2E operator script that writes a temporary form and sanitized poller instructions without requiring ad hoc shell snippets.

## Suggested Next Step

Manual Browser Sandbox Payment Completion v0: owner opens the temporary checkout form in a real browser, completes sandbox credit-card one-time payment, then Codex verifies sanitized ReturnURL, NotifyURL, delivery artifacts, queue completion, and paid access rendering.
