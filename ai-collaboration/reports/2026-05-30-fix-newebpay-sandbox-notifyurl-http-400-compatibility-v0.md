# Fix NewebPay Sandbox NotifyURL HTTP 400 Compatibility v0

Date: 2026-05-30

## Summary

Fixed the NewebPay NotifyURL route response policy so provider callback validation failures return HTTP `200` with body `0|ERROR` instead of HTTP `400`. This addresses the sandbox failure notice where NewebPay attempted the NotifyURL callback and received HTTP `400`.

No provider credentials, `TradeInfo`, `TradeSha`, raw provider payloads, decrypted payloads, card data, raw `pa_`, raw `pcs_`, tokenized URLs, raw user input, or private values are recorded in this report.

## Root Cause

Current route parsing already supported `application/x-www-form-urlencoded` through `request.formData()`, and prior debug confirmed the route was reachable.

The compatibility issue was response status propagation:

- `processNewebPayNotify(...)` returns safe failure categories with statuses such as `400`, `404`, or `409`.
- The route passed those statuses directly into the HTTP response.
- NewebPay interpreted HTTP `400` as NotifyURL delivery failure, even though ANYU returned provider-compatible body `0|ERROR`.

The route should distinguish:

- Provider-compatible callback acknowledgement transport status.
- Internal business/verification result category.

## Route Behavior After Fix

Route: `POST /api/payments/newebpay/notify`

| Case | HTTP status | Body | Category header |
|---|---:|---|---|
| Verified successful callback | `200` | `1|OK` | success category |
| Parsed callback with malformed/missing fields | `200` | `0|ERROR` | safe error category |
| Parsed callback with invalid signature | `200` | `0|ERROR` | `signature_invalid` |
| Parsed callback with payment mismatch/error | `200` | `0|ERROR` | safe error category |
| Runtime/database config missing | `503` | `0|ERROR` | `provider_config_missing` |
| GET / unsupported method | `405` | framework response | n/a |

The response does not echo `TradeInfo`, `TradeSha`, payment internals, provider secrets, raw tokens, or decrypted payloads.

## Parsing Support

The route continues to support:

- `application/x-www-form-urlencoded` via `request.formData()`.
- `multipart/form-data` via `request.formData()`.
- `application/json` for test/tooling compatibility.

Expected NewebPay fields:

- `Status`, if posted outside encrypted payload by provider.
- `MerchantID`
- `TradeInfo`
- `TradeSha`
- `Version`

The verifier still treats encrypted `TradeInfo` as the source of truth and does not trust ReturnURL.

## Tests Updated

Updated:

- `apps/web/src/tests/newebpay-notify-route.test.ts`

Added/updated coverage:

- `application/x-www-form-urlencoded` callback payload is parsed and passed as `FormData`.
- Missing-field callback returns HTTP `200` + `0|ERROR`.
- Invalid signature category returns HTTP `200` + `0|ERROR`.
- Success returns HTTP `200` + `1|OK`.
- Responses do not expose `TradeInfo` or `TradeSha`.
- Runtime config missing still fails safely.

Existing service coverage remains:

- valid encrypted sandbox-like payload marks matching payment intent paid.
- duplicate notify is idempotent.
- amount mismatch does not mark paid or create artifacts.
- failed/cancelled provider status does not mark paid or create artifacts.
- NotifyURL result does not expose raw paid access token.

## Validation

Commands run:

- `cd apps/web && corepack pnpm test -- --run src/tests/newebpay-notify-route.test.ts src/tests/newebpay-notify-service.test.ts`
- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`

Results:

- Lint passed.
- Tests passed: 56 test files, 362 tests.
- Build passed.

Note: the targeted test command completed successfully but Vitest argument handling ran the full suite.

## Staging Verification

Staging malformed form POST verification is required after the commit deploys to Preview(`staging`):

- POST `application/x-www-form-urlencoded` with missing/invalid `TradeInfo` / `TradeSha`.
- Expected HTTP `200`.
- Expected body `0|ERROR`.
- Expected safe category header such as `malformed_payload` or `merchant_mismatch`.

No real `TradeInfo`, `TradeSha`, card data, or provider payload should be used for this verification.

## Production Safety

- Production payment runtime was not enabled.
- Production env was not modified.
- No production flags were changed.
- No real payment was attempted.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: route still returns HTTP `503` for runtime/database config missing; this is intentional for infrastructure failure but may be revisited if NewebPay retry behavior requires transport-level 200 for every POST.
- Opportunistic cleanup completed: aligned route tests with provider transport semantics.
- Deferred cleanup candidates: add a small helper that explicitly maps internal NotifyURL categories to provider transport responses if more categories are added.

## Recommended Next Step

After staging deployment and malformed POST verification pass, run Fresh NewebPay Sandbox E2E Payment Smoke v2 using sandbox credit-card one-time payment only.
