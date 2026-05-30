# Safe NotifyURL Category Diagnostics v0

Date: 2026-05-30

## Summary

Added category-only server diagnostics for `POST /api/payments/newebpay/notify` so the next NewebPay sandbox callback can identify why a callback returned provider-compatible HTTP 200 but did not transition a payment intent to paid.

The route behavior remains unchanged for payment processing:

- Verified success returns HTTP 200 with `1|OK`.
- Parsed provider callback failures return HTTP 200 with `0|ERROR`.
- Production payment runtime remains unchanged and disabled.
- No provider payload, decrypted payload, token, or credential is logged.

## Files Changed

- `apps/web/src/app/api/payments/newebpay/notify/route.ts`
- `apps/web/src/tests/newebpay-notify-route.test.ts`
- `ai-collaboration/handoffs/2026-05-30-safe-notifyurl-category-diagnostics-v0-handoff.md`
- `ai-collaboration/reports/2026-05-30-safe-notifyurl-category-diagnostics-v0.md`
- `ai-collaboration/summaries/summary_log.md`

## Diagnostic Behavior

The NotifyURL route now emits one JSON `console.info` record for each provider callback outcome.

Success event:

- `event: "newebpay_notify_processed"`
- `ok: true`
- `category`
- `environment`
- `httpTransportStatus: 200`
- `providerResponse: "1|OK"`
- `contentTypeCategory`
- payload presence booleans
- `paymentIntentStatus`
- `moduleSlug`
- `queueCategory`

Failure event:

- `event: "newebpay_notify_failed"`
- `ok: false`
- `category`
- `environment`
- `httpTransportStatus: 200`
- `providerResponse: "0|ERROR"`
- `contentTypeCategory`
- payload presence booleans
- safe mismatch booleans where known:
  - `merchantMatch: false` for `merchant_mismatch`
  - `amountMatch: false` for `amount_mismatch`
  - `paymentIntentFound: false` for `payment_intent_not_found`

## Categories Exposed

The route can now surface the existing NotifyURL processing category safely in logs, including:

- `provider_config_missing`
- `malformed_payload`
- `signature_missing`
- `signature_invalid`
- `trade_info_decrypt_failed`
- `merchant_mismatch`
- `payment_intent_not_found`
- `amount_mismatch`
- `payment_not_success`
- `payment_marked_paid`
- `payment_already_paid`
- `entitlement_creation_failed`
- `access_token_creation_failed`
- `generation_job_creation_failed`
- `unexpected_error`

## Redaction Guarantees

Diagnostics intentionally record only categories and shape booleans.

Not logged:

- raw `MerchantID`
- raw `TradeInfo`
- raw `TradeSha`
- decrypted provider payload
- raw provider POST body
- `HashKey` / `HashIV`
- raw `pa_` token
- raw `pcs_` token
- tokenized URLs
- card data
- raw user input
- provider credentials

The provider response body remains only `1|OK` or `0|ERROR`; detailed categories are not returned to NewebPay in the response body.

## Tests

Added/updated tests to prove:

- verified success still returns HTTP 200 + `1|OK`
- invalid signature returns HTTP 200 + `0|ERROR`
- malformed provider payload returns HTTP 200 + `0|ERROR`
- merchant mismatch logs only a safe category and boolean
- amount mismatch logs only a safe category and boolean
- payment intent not found logs only a safe category and boolean
- `TradeInfo`, `TradeSha`, and fake raw provider values are not present in response or diagnostic JSON

## Validation

- `cd apps/web && corepack pnpm vitest run src/tests/newebpay-notify-route.test.ts src/tests/newebpay-notify-service.test.ts` passed: 16 tests.
- `cd apps/web && corepack pnpm lint` passed.
- `cd apps/web && corepack pnpm test` passed: 364 tests.
- `cd apps/web && corepack pnpm build` passed.

## Staging Verification

Completed after deploying commit `21a873d` to Preview(`staging`).

Staging health marker:

- environment: `preview`
- branch: `staging`
- git commit: `21a873d51ad0`
- route bundle: `payment-foundation-2026-05-29`

Safe malformed callback checks:

- Missing-field form POST returned HTTP 200 + `0|ERROR`, category `malformed_payload`.
- Invalid non-secret form POST returned HTTP 200 + `0|ERROR`, category `merchant_mismatch`.

Safe log check:

- Vercel logs showed `newebpay_notify_failed` diagnostics for both malformed test requests.
- Logged categories were `malformed_payload` and `merchant_mismatch`.
- Logged metadata included only safe fields: event, category, environment, HTTP transport status, provider response, content-type category, payload-shape booleans, and safe mismatch booleans.
- No raw submitted form values, provider payloads, decrypted data, tokens, or credentials were observed in the diagnostic log records.

## Tech Debt Review

New technical debt introduced:

- None. The diagnostics are intentionally narrow and can remain useful for sandbox and launch debugging.

Existing technical debt observed:

- Real sandbox paid transition remains blocked until the next provider callback exposes the exact safe failure category.

Opportunistic cleanup completed:

- Consolidated NotifyURL payload presence parsing in the route.

Deferred cleanup candidates:

- Consider a shared structured logger if more payment/provider routes need similar safe diagnostics later.

## Blockers / Uncertainties

- The exact real sandbox callback failure category is still unknown until this diagnostic build is deployed and another sandbox callback is observed.

## Recommended Next Step

Fresh NewebPay Sandbox E2E Payment Smoke v3, then inspect `newebpay_notify_failed.category` if payment remains `waiting_for_payment`.
