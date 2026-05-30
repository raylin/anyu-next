# NewebPay Sandbox TradeInfo Decrypt Config Alignment v0

Date: 2026-05-31

## Summary

Force-aligned branch-scoped Preview(`staging`) NewebPay sandbox config after Fresh NewebPay Sandbox E2E Payment Smoke v3 identified `newebpay_notify_failed.category=trade_info_decrypt_failed`.

No application code was changed. Production env and production runtime were not modified.

## Context

Latest sandbox v3 facts:

- Fresh checkout succeeded.
- Owner submitted sandbox credit-card one-time payment.
- Browser returned to staging.
- NotifyURL reached staging with HTTP 200.
- Payment status stayed `waiting_for_payment`.
- Safe diagnostics showed `trade_info_decrypt_failed`.

Interpretation:

- NotifyURL transport works.
- Provider callback form fields are present.
- ANYU cannot decrypt provider `TradeInfo`.
- Most likely cause is sandbox credential/config mismatch: MerchantID / HashKey / HashIV / sandbox shop / gateway alignment.

## Config Source Findings

Checkout creation and NotifyURL verification both use the same helper:

- `getNewebPayConfig(...)` in `apps/web/src/lib/payments/newebpay/config.ts`

Checkout path:

- `createNewebPayCheckout(...)`
- calls `getNewebPayConfig(...)`
- builds checkout contract with `NEWEBPAY_MERCHANT_ID`, `NEWEBPAY_HASH_KEY`, `NEWEBPAY_HASH_IV`, `NEWEBPAY_CHECKOUT_URL`, `NEWEBPAY_NOTIFY_URL`, and `NEXT_PUBLIC_APP_URL`

NotifyURL path:

- `processNewebPayNotify(...)`
- calls `getNewebPayConfig(...)`
- verifies MerchantID, TradeSha, and decrypts TradeInfo using the same `NEWEBPAY_HASH_KEY` / `NEWEBPAY_HASH_IV` env names

Env names used by both paths:

- `NEWEBPAY_MERCHANT_ID`
- `NEWEBPAY_HASH_KEY`
- `NEWEBPAY_HASH_IV`
- `NEWEBPAY_CHECKOUT_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEWEBPAY_NOTIFY_URL`
- `NEWEBPAY_ENVIRONMENT`

Feature gate:

- `ENABLE_NEWEBPAY_CHECKOUT`

Other findings:

- `NEWEBPAY_ENVIRONMENT` only categorizes provider environment as `production`, `staging`, `sandbox`, or `unknown`; it does not change crypto behavior.
- `NEWEBPAY_CHECKOUT_URL` controls checkout gateway target; it does not affect NotifyURL decryption directly.
- No alternate fallback env names were found for NewebPay credentials.
- Branch-scoped Preview(`staging`) env values are authoritative over general Preview values for staging deployments.

## Secret Presence Preflight

Shell presence before alignment:

- `NEWEBPAY_MERCHANT_ID`: missing
- `NEWEBPAY_HASH_KEY`: missing
- `NEWEBPAY_HASH_IV`: missing
- `VERCEL_TOKEN`: present

Owner approved using `apps/web/.env.local` as the secure local credential source for this alignment.

Local secure source presence:

- `NEWEBPAY_MERCHANT_ID`: present
- `NEWEBPAY_HASH_KEY`: present
- `NEWEBPAY_HASH_IV`: present

No values, lengths, prefixes, suffixes, hashes, or derived secrets were printed or recorded.

## Preview(staging) Env Alignment

Updated branch-scoped Preview(`staging`) only:

- `NEWEBPAY_MERCHANT_ID`
- `NEWEBPAY_HASH_KEY`
- `NEWEBPAY_HASH_IV`
- `NEWEBPAY_CHECKOUT_URL`
- `NEWEBPAY_NOTIFY_URL`
- `NEWEBPAY_ENVIRONMENT`
- `NEXT_PUBLIC_APP_URL`
- `ENABLE_NEWEBPAY_CHECKOUT`

Safe categories confirmed:

- environment: `sandbox`
- checkout URL category: `ccore_sandbox`
- NotifyURL host: `staging.anyu.tw`
- checkout config present: true
- notify config present: true
- checkout/notify config helper: same source

Production env was not modified. General Preview env was not modified.

## Staging Redeploy

Preview(`staging`) was redeployed after env alignment.

Staging health:

| Field | Result |
|---|---|
| URL | `https://staging.anyu.tw/api/health` |
| HTTP status | 200 |
| environment | `preview` |
| branch | `staging` |
| git commit | `ebfc83b71c84` |
| route bundle | `payment-foundation-2026-05-29` |

## Production Safety

Production remained disabled and fail-closed.

| Check | Result |
|---|---|
| Production health | HTTP 200, `environment=production`, `gitBranch=main`, `gitCommit=1990fc034d74` |
| Production checkout route | JSON 404 `not_found` |
| Production fake-paid route | JSON 404 `not_found` |
| Production runtime | Not enabled |

## Validation

No code changed, so app lint/test/build was not required.

- Docs presence check: passed.
- Secret/private scan: passed.
- `git diff --check`: passed.

## Readiness For Next Smoke

Ready for Fresh NewebPay Sandbox E2E Payment Smoke v4.

Expected v4 outcome if alignment fixed the issue:

- NotifyURL should no longer fail at `trade_info_decrypt_failed`.
- If decrypted payload verifies, status should move from `waiting_for_payment` to paid processing/ready.
- Delivery artifacts, queue completion, and session-bound access rendering can then be verified.

If v4 still fails with `trade_info_decrypt_failed`, next evidence should come from NewebPay backend config review:

- verify MerchantID / HashKey / HashIV are from the exact sandbox shop that processed payment
- verify sandbox gateway/shop pairing
- verify no old sandbox shop or production credential mix

## Tech Debt Review

New technical debt introduced:

- None in code.

Existing technical debt observed:

- Sandbox E2E remains manual and requires repeated secret-safe checkout scripts.
- Branch-scoped Preview(`staging`) env precedence remains an operational footgun.

Opportunistic cleanup completed:

- None.

Deferred cleanup candidates:

- Create a dedicated secret-safe sandbox checkout helper.
- Add an env readiness script that reports only safe booleans/categories.

## Recommended Next Step

Fresh NewebPay Sandbox E2E Payment Smoke v4.
