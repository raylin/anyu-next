# Safe NotifyURL Category Diagnostics v0 Handoff

Date: 2026-05-30

## Task

Add safe category-only diagnostics for NewebPay NotifyURL processing so the next sandbox callback can reveal why it did not transition the payment intent to paid.

## Scope

In scope:

- Inspect NotifyURL categories and current route/service behavior.
- Add sanitized category-only logging for NotifyURL success/failure.
- Add/update tests proving response/log redaction.
- Run lint, targeted tests, full tests, and build.
- Deploy to staging and verify malformed callback diagnostics with non-secret payload only.

Out of scope:

- Production runtime/env changes.
- Real card or new sandbox payment execution.
- Raw provider payload, decrypted payload, token, or credential logging.
- Public copy, Module 01 prompt/result behavior, LINE delivery, or broad payment behavior changes.

## Safety Constraints

- Do not print, log, or commit MerchantID, HashKey, HashIV, `TradeInfo`, `TradeSha`, raw provider payloads, decrypted payloads, raw `pa_`, raw `pcs_`, tokenized URLs, card data, raw user input, or private values.
- Do not expose detailed diagnostics in the provider response body.
- Do not enable or modify Production payment runtime.

## Validation Plan

- `cd apps/web && corepack pnpm lint`
- Targeted NewebPay notify route/service tests.
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- Staging malformed non-secret callback check after deployment.

## Execution Notes

- Added safe category-only NotifyURL diagnostics in the route.
- Diagnostics log only category, transport outcome, content-type category, payload-shape booleans, and safe mismatch booleans.
- Provider response body remains `1|OK` or `0|ERROR`.
- Tests were updated to prove raw provider field values are not returned or logged in diagnostic metadata.
- Staging malformed callback verification remains the post-deploy check.
