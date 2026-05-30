# NewebPay Sandbox NotifyURL Debug v0

Date: 2026-05-30

## Summary

Investigated why the fresh NewebPay sandbox payment smoke returned the browser to staging but did not move the session-bound payment status beyond `waiting_for_payment`.

Key finding: the actual fresh checkout payload included `NotifyURL` inside encrypted `TradeInfo`, and it matched `https://staging.anyu.tw/api/payments/newebpay/notify`. The staging NotifyURL route is reachable and returns provider-compatible text responses for malformed requests. Recent Vercel logs showed ReturnURL/status traffic and the deliberate malformed reachability tests, but no visible NewebPay provider callback for the payment smoke.

Likely root cause: NewebPay sandbox did not send the server-to-server NotifyURL callback for this transaction, or sandbox backend/transaction settings prevented callback delivery. The current evidence does not point to a missing API `NotifyURL` field or an unreachable ANYU route.

No provider credentials, `TradeInfo`, `TradeSha`, raw provider payloads, decrypted payloads, card data, raw `pa_`, raw `pcs_`, tokenized URLs, raw user input, or private values are recorded in this report.

## Current Smoke Context

| Item | Result |
|---|---|
| Fresh checkout run | `20260530-230023` |
| Checkout result | HTTP `200` |
| Payment intent state before payment | `checkout_started` / `waiting_for_payment` |
| Gateway | Sandbox `ccore` |
| MPG version | `2.0` |
| Amount | NT$49 |
| Browser payment | Owner confirmed submitted with sandbox credit-card one-time payment |
| Browser result | Owner confirmed returned to staging |
| Status after return | Stayed `waiting_for_payment` for 72 polls |
| First failure from smoke | `notify_not_received` |

## Checkout Payload Inspection

Source files reviewed:

- `apps/web/src/lib/payments/newebpay/checkout-payload.ts`
- `apps/web/src/lib/payments/newebpay/checkout-service.ts`
- `apps/web/src/tests/newebpay-checkout-service.test.ts`

Implementation behavior:

| Field | Current behavior |
|---|---|
| `MerchantID` | Included in encrypted payload and outer form field |
| `RespondType` | Included as `JSON` |
| `TimeStamp` | Included |
| `Version` | Included as hard-coded `2.0` |
| `MerchantOrderNo` | Included |
| `Amt` | Included as `49` |
| `ItemDesc` | Included |
| `ReturnURL` | Included; built from `NEXT_PUBLIC_APP_URL` with `pcs_` handoff |
| `NotifyURL` | Included from `NEWEBPAY_NOTIFY_URL` |
| `ClientBackURL` | Not included |
| `LoginType` | Not included |
| `Email` | Not included |
| Payment method flags such as `CREDIT` | Not included |

Actual fresh temporary form shape was safely inspected locally without printing encrypted or decrypted values:

| Check | Result |
|---|---|
| Form present | Yes |
| `TradeInfo` present | Yes, value not recorded |
| `TradeSha` present | Yes, value not recorded |
| `NotifyURL` present inside decrypted TradeInfo | Yes |
| `NotifyURL` matches staging route | Yes |
| `ReturnURL` present | Yes |
| `ReturnURL` uses staging | Yes |
| `ReturnURL` includes `pcs_` handoff | Yes, token not recorded |
| `MerchantOrderNo` present | Yes, value not recorded |
| `Amt` | `49` |
| `ItemDesc` present | Yes |
| `Version` | `2.0` |
| `RespondType` | `JSON` |
| `ClientBackURL` present | No |
| `LoginType` present | No |
| `Email` present | No |
| `CREDIT` flag present | No |
| Gateway category | Sandbox `ccore` |

## Expected NotifyURL Behavior

Reference reviewed:

- NewebPay official MPG manual download page: https://www.newebpay.com/website/Page/download_file?name=%E7%B7%9A%E4%B8%8A%E4%BA%A4%E6%98%93%E2%94%80%E5%B9%95%E5%89%8D%E6%94%AF%E4%BB%98%E6%8A%80%E8%A1%93%E4%B8%B2%E6%8E%A5%E6%89%8B%E5%86%8A_NDNF-1.1.6.pdf
- Search-visible manual excerpt states `NotifyURL` and `ReturnURL` can be set either per transaction by API parameter or in the NewebPay merchant backend, and API parameter settings take priority when both are configured.

Working assumptions:

- `NotifyURL` should be present in the encrypted MPG request payload.
- Merchant backend API URL settings may also exist and should be verified.
- `ReturnURL` can return the browser to staging even if server-to-server NotifyURL is not delivered.
- For credit-card one-time payment, a successful sandbox payment is expected to trigger server-to-server notification.
- ANYU must continue treating NotifyURL as payment truth; ReturnURL remains read-only.

## NotifyURL Route Reachability

Source files reviewed:

- `apps/web/src/app/api/payments/newebpay/notify/route.ts`
- `apps/web/src/lib/payments/newebpay/notify-service.ts`
- `apps/web/src/lib/payments/newebpay/notify-verification.ts`
- `apps/web/src/tests/newebpay-notify-route.test.ts`
- `apps/web/src/tests/newebpay-notify-service.test.ts`

Route behavior:

- Route path: `POST /api/payments/newebpay/notify`
- Auth: no operator/internal auth required.
- Content types: accepts form data and JSON.
- Response body: `1|OK` on success, `0|ERROR` on failure.
- Safe category header: `x-anyu-payment-category`.
- Raw provider fields are not echoed in response.

Safe staging reachability checks:

| Check | Result |
|---|---|
| `GET /api/payments/newebpay/notify` | HTTP `405`, route exists but GET unsupported |
| Empty form POST | HTTP `400`, body `0|ERROR`, category `malformed_payload` |
| Malformed form POST | HTTP `400`, body `0|ERROR`, category `merchant_mismatch` |
| Malformed JSON POST | HTTP `400`, body `0|ERROR`, category `merchant_mismatch` |

Conclusion: the staging NotifyURL route is not a generic 404, does not require operator auth, and is reachable from an external HTTPS request path.

## Vercel Log Observation

Recent Vercel logs showed:

- ReturnURL route activity.
- Payment status polling activity.
- NotifyURL route entries only for the deliberate malformed reachability tests.

No visible provider-originated `POST /api/payments/newebpay/notify` entry was found in the checked window for the payment smoke.

## Owner Backend Checklist

Owner should inspect the NewebPay sandbox backend for the specific sandbox transaction/order. Do not share secrets, full payloads, card data, or private account identifiers in chat or repo.

Check:

- Transaction status: is the transaction considered successful/paid?
- Merchant order number: does it match the latest ANYU sandbox order shown in the NewebPay backend?
- Payment method: credit-card one-time payment.
- Transaction amount: NT$49.
- API URL / NotifyURL setting: verify sandbox shop backend has `https://staging.anyu.tw/api/payments/newebpay/notify`.
- ReturnURL setting: verify staging ReturnURL is expected, or confirm API payload ReturnURL was used.
- Callback / backend notification status: was a server notification attempted?
- Callback HTTP status: if visible, what status did NewebPay receive?
- Callback response body: if visible, did NewebPay receive `1|OK` or `0|ERROR`?
- Error message: if visible, capture only sanitized category/text, not payload.
- Whether sandbox backend requires enabling server notification separately for the shop/payment method.

## Likely Fixes Evaluated

| Possible fix | Assessment |
|---|---|
| Add `NotifyURL` to checkout payload | Not needed; already present in actual encrypted payload. |
| Update sandbox backend NotifyURL | High-priority owner check; likely if callback was never attempted. |
| Adjust route path/method | Not indicated; current POST route is reachable and provider-compatible. |
| Add `ClientBackURL` | Not root cause for missing server callback, but may improve browser back/cancel UX if provider requires. |
| Add credit-card-only method flag | Not root cause for missing server callback, but may reduce sandbox UI ambiguity. |
| Adjust provider response body | Not indicated for no-request case; route returns `1|OK` / `0|ERROR`. |
| Add public echo/debug endpoint | Not recommended yet; route reachability is already proven. |
| Add safe route-level diagnostics | Defer until owner confirms NewebPay attempted a callback but received an unexpected response. |

## Likely Root Cause

Most likely: NewebPay sandbox did not send the server-to-server NotifyURL callback to staging for this transaction, despite the browser ReturnURL flow completing.

Why:

- Actual `TradeInfo` contained the correct `NotifyURL`.
- Staging route is reachable from HTTPS and accepts POST without operator auth.
- Status remained `waiting_for_payment`, meaning the verified NotifyURL path did not mutate the payment intent.
- Vercel logs did not show provider-originated NotifyURL traffic in the checked window.

## Recommended Next Step

Owner action first:

1. Inspect the NewebPay sandbox backend transaction for the latest order.
2. Confirm transaction success/paid status.
3. Confirm whether backend notification was attempted.
4. Confirm callback URL/status/response if visible.
5. Confirm sandbox shop API URL / NotifyURL setting.

Then run one of:

- If backend shows no callback attempted: update sandbox backend NotifyURL / notification settings, then retry fresh checkout.
- If backend shows callback attempted but non-200 or `0|ERROR`: run a targeted safe NotifyURL Route Diagnostic v1 with category-only logging.
- If backend shows transaction not paid/successful: investigate sandbox payment method/card flow before changing code.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: checkout does not include `ClientBackURL`, `LoginType`, `Email`, or explicit `CREDIT` flag; these are not proven blockers but may be worth adding if NewebPay sandbox/backend guidance requires them.
- Opportunistic cleanup completed: none.
- Deferred cleanup candidates: create a dedicated sandbox E2E helper that emits a fresh temporary form and a sanitized verification command.
