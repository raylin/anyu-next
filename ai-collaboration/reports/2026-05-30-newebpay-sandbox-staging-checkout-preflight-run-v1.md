# NewebPay Sandbox Staging Checkout Preflight Run v1

Date: 2026-05-30

## Summary

Configured NewebPay sandbox checkout env for Vercel Preview(`staging`) only, redeployed staging, and ran a sanitized checkout preflight. The preflight created a pending NewebPay checkout intent and checkout contract without submitting payment or creating paid delivery artifacts.

No provider credentials, encrypted `TradeInfo`, `TradeSha`, raw `pcs_`, raw `pa_`, tokenized URLs, or private values are recorded in this report.

## Repo And Source State

| Item | Result |
|---|---|
| Working directory | `/Users/raylin/Projects/anyu-next` |
| Branch | `staging` |
| Local HEAD | `e8373433a596f4f74d8e7adf3673c994a46a2f9e` |
| Remote `staging` | `e8373433a596f4f74d8e7adf3673c994a46a2f9e` |
| Pre-task worktree | Clean except the task handoff |

## Secret And Env Handling

Sandbox credentials were available securely in local `apps/web/.env.local` and were used without printing values:

- `NEWEBPAY_MERCHANT_ID`
- `NEWEBPAY_HASH_KEY`
- `NEWEBPAY_HASH_IV`

Vercel CLI auth was available through `VERCEL_TOKEN`, and `vercel whoami` reported `studioanyu-1488`.

Configured branch-scoped Preview(`staging`) env only:

- `NEWEBPAY_MERCHANT_ID`
- `NEWEBPAY_HASH_KEY`
- `NEWEBPAY_HASH_IV`
- `NEWEBPAY_CHECKOUT_URL`
- `NEWEBPAY_NOTIFY_URL`
- `NEWEBPAY_ENVIRONMENT`
- `NEXT_PUBLIC_APP_URL`
- `ENABLE_NEWEBPAY_CHECKOUT`
- `OPERATOR_TEST_SECRET`
- `PAYMENT_CHECKOUT_SESSION_SECRET`

Supporting Preview(`staging`) env names were present from prior setup:

- `PAID_ACCESS_TOKEN_HASH_SECRET`
- `ENABLE_PAID_JOB_QUEUE_TRIGGER`
- `PAID_JOB_QUEUE_PROVIDER`
- `PAID_JOB_QUEUE_TOPIC`

Production env was not modified.

## Staging Redeploy And Health

Preview(`staging`) was redeployed after env alignment.

Staging health:

| Field | Result |
|---|---|
| URL | `https://staging.anyu.tw/api/health` |
| Environment | `preview` |
| Branch | `staging` |
| Route bundle | `payment-foundation-2026-05-29` |
| Git commit | `e8373433a596` |

## Checkout Preflight Result

Preflight steps:

1. Created a fresh Module 01 source result with synthetic QA input.
2. Called `POST /api/modules/ambiguous-temperature/checkout/newebpay` on staging with the operator test header.
3. Inspected only sanitized response metadata.
4. Did not submit the checkout form to NewebPay.

Sanitized result:

| Check | Result |
|---|---|
| Source analyze | HTTP `200`, `ok=true`, `status=completed`, result id present |
| Checkout route | HTTP `200`, `ok=true` |
| Mode | `newebpay_checkout_phase_1` |
| Payment intent | Present |
| Payment intent status | `checkout_started` |
| Payment intent created | `true` |
| Provider | Expected `newebpay` |
| Amount | Expected NT$49 |
| Gateway category | Sandbox `ccore` |
| Checkout method | `POST` |
| Merchant order number | Present, value redacted |
| Merchant order format | Expected ANYU NewebPay order shape |
| Merchant ID field | Present, value not recorded |
| TradeInfo | Present, value not recorded |
| TradeSha | Present, value not recorded |
| MPG version | `2.0` hard-coded by current implementation |
| ReturnURL | Staging URL with `pcs_` handoff present, token redacted |
| NotifyURL | Configured through `NEWEBPAY_NOTIFY_URL`; not decrypted from `TradeInfo` in this preflight |
| HashKey / HashIV exposure | Not exposed in checkout response |
| Paid access token exposure | Not exposed |
| Generation job exposure | Not exposed |

No paid transition, entitlement, `pa_` token, `generation_job`, queue trigger, or provider payment submission occurred.

## Production Safety Check

Production remained disabled and was not redeployed.

| Check | Result |
|---|---|
| Production health | HTTP `200`, `environment=production`, `gitBranch=main`, `gitCommit=1990fc034d74` |
| Production checkout route | JSON `404 not_found` |
| Production fake-paid route | JSON `404 not_found` |
| Production payment runtime | Not enabled |

## Gateway And URL Mapping

- Sandbox checkout gateway category: `ccore`.
- Checkout URL env name used by implementation: `NEWEBPAY_CHECKOUT_URL`.
- NotifyURL env name used by implementation: `NEWEBPAY_NOTIFY_URL`.
- ReturnURL base uses `NEXT_PUBLIC_APP_URL=https://staging.anyu.tw`.
- ReturnURL includes `merchantOrderNo` plus a `pcs_` checkout session handoff.
- `ClientBackURL` is not supported by current implementation.
- Payment method restriction is not supported by current implementation; the first sandbox payment smoke should manually choose credit-card one-time payment in NewebPay.

## Readiness For Actual Sandbox Payment

Ready for the next controlled task: NewebPay Sandbox E2E Payment Smoke v0, using credit-card one-time payment only.

Before running payment smoke:

- Keep sandbox credentials branch-scoped to Preview(`staging`).
- Do not configure sandbox credentials in Production.
- Do not enable Production payment runtime.
- Do not record raw provider payloads, decrypted payloads, `TradeInfo`, `TradeSha`, `pcs_`, `pa_`, or tokenized URLs.

## Blockers / Uncertainties

- No current blocker for starting the first manual sandbox payment smoke.
- Dashboard-side NewebPay field names may still differ from implementation names; implementation names listed above are authoritative for ANYU code.
- If NewebPay requires `ClientBackURL` or payment method restriction fields, a follow-up implementation task is needed.

## Tech Debt Review

- New technical debt introduced: none; docs/env-only task.
- Existing technical debt observed: checkout payload does not yet support `ClientBackURL` or provider-side payment method restriction.
- Opportunistic cleanup completed: none.
- Deferred cleanup candidates: add optional `ClientBackURL` and explicit credit-card-only provider fields if NewebPay sandbox review or UX requires them.

## Suggested Next Step

Run NewebPay Sandbox E2E Payment Smoke v0 on Preview(`staging`) using credit-card one-time payment only.
