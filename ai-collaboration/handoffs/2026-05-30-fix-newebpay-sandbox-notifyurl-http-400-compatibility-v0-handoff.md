# Fix NewebPay Sandbox NotifyURL HTTP 400 Compatibility v0 Handoff

Date: 2026-05-30

## Task

Fix or adapt the NewebPay NotifyURL route so real sandbox callbacks are parsed and answered with provider-compatible responses instead of HTTP 400 for normal provider callback validation failures.

## Scope

In scope:

- Inspect NotifyURL route parsing and response behavior.
- Support NewebPay form POST shapes safely.
- Return HTTP 200 + `0|ERROR` for provider callback validation failures where appropriate.
- Add/update targeted tests.
- Run lint, targeted tests, full tests, build.
- Deploy via staging push and verify safe malformed form POST behavior on Preview(`staging`).

Out of scope:

- Production runtime/env changes.
- Real card or new sandbox payment execution.
- Provider secret/payload logging.
- Public copy, Module 01 prompt/result behavior, LINE delivery, or broader payment behavior changes.

## Safety Constraints

- Do not print or commit MerchantID, HashKey, HashIV, `TradeInfo`, `TradeSha`, raw provider payloads, decrypted payloads, raw `pa_`, raw `pcs_`, tokenized URLs, card data, raw user input, or private values.
- Do not enable or modify Production payment runtime.
- Do not run another sandbox payment in this task unless explicitly requested after fix.

## Validation Plan

- `cd apps/web && corepack pnpm lint`
- Targeted NewebPay notify tests.
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- Staging malformed form POST after deployment, with no real provider payload.

## Completion Notes

- Root cause found: `POST /api/payments/newebpay/notify` parsed form callbacks, but propagated provider validation failures as HTTP 400 using `result.status`; NewebPay treats HTTP 400 as callback delivery failure.
- Route behavior changed so parsed provider callback failures return HTTP 200 with body `0|ERROR` and safe `x-anyu-payment-category`.
- Verified success still returns HTTP 200 with `1|OK`.
- Added route tests proving `application/x-www-form-urlencoded` payload parsing, missing-field failure as HTTP 200 + `0|ERROR`, invalid signature as HTTP 200 + `0|ERROR`, and no `TradeInfo` / `TradeSha` response exposure.
- Validation passed: lint, full Vitest suite, and build.
