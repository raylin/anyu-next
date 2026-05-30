# NewebPay Sandbox Backend Credential Verification v0

Date: 2026-05-31

## Summary

Verified source/config consistency and env-name presence after Fresh NewebPay Sandbox E2E Payment Smoke v4 still failed with `trade_info_decrypt_failed`.

No code changed. No env values were printed or committed. Production runtime was not modified.

Current conclusion:

- The app source paths are consistent.
- Preview(`staging`) has the expected branch-scoped NewebPay env names.
- Production does not have NewebPay credential/config env names.
- The next evidence must come from manual NewebPay sandbox backend verification: confirm the exact sandbox shop that processed the transaction has the same MerchantID / HashKey / HashIV as the secure local/staging config, with no copy/formatting mistakes.

## Source Config Consistency Findings

Checkout creation and NotifyURL both use the same config helper:

- `apps/web/src/lib/payments/newebpay/config.ts`
- function: `getNewebPayConfig(...)`

Checkout path:

- `apps/web/src/lib/payments/newebpay/checkout-service.ts`
- `createNewebPayCheckout(...)`
- calls `getNewebPayConfig(input.env)`

NotifyURL path:

- `apps/web/src/lib/payments/newebpay/notify-service.ts`
- `processNewebPayNotify(...)`
- calls `getNewebPayConfig(env)`
- passes the same config to `verifyNewebPayNotifyPayload(...)`

Shared env names:

- `NEWEBPAY_MERCHANT_ID`
- `NEWEBPAY_HASH_KEY`
- `NEWEBPAY_HASH_IV`
- `NEWEBPAY_CHECKOUT_URL`
- `NEWEBPAY_ENVIRONMENT`
- `NEWEBPAY_NOTIFY_URL`
- `NEXT_PUBLIC_APP_URL`

Feature gate:

- `ENABLE_NEWEBPAY_CHECKOUT`

Other findings:

- No alternate or fallback NewebPay credential key names were found.
- `NEWEBPAY_ENVIRONMENT` only categorizes the provider environment; it does not change decrypt behavior.
- `NEWEBPAY_CHECKOUT_URL` controls the checkout gateway only; it does not directly affect NotifyURL decryption.
- No source path was found where Preview(`staging`) should read production credential names.
- Runtime reads `process.env` in both checkout and NotifyURL paths, so the relevant Vercel deployment env is the source of truth at runtime.

## Local Secure Env Presence Check

Checked `apps/web/.env.local` for presence only:

- `NEWEBPAY_MERCHANT_ID`: present
- `NEWEBPAY_HASH_KEY`: present
- `NEWEBPAY_HASH_IV`: present
- `NEWEBPAY_ENVIRONMENT`: not present locally
- `NEWEBPAY_CHECKOUT_URL`: not present locally

Interpretation:

- The local file contains the three sensitive credential values owner approved for prior Preview(`staging`) alignment.
- Non-secret runtime category/URL values were set directly in Vercel Preview(`staging`) during alignment.

No values, lengths, prefixes, suffixes, hashes, checksums, or derived identifiers were printed or recorded.

## Vercel Env Name Presence

Checked Vercel env metadata only through CLI. No env values were printed.

Branch-scoped Preview(`staging`) has:

- `NEWEBPAY_MERCHANT_ID`
- `NEWEBPAY_HASH_KEY`
- `NEWEBPAY_HASH_IV`
- `NEWEBPAY_CHECKOUT_URL`
- `NEWEBPAY_ENVIRONMENT`
- `NEWEBPAY_NOTIFY_URL`
- `NEXT_PUBLIC_APP_URL`
- `ENABLE_NEWEBPAY_CHECKOUT`

General Preview listing also contains NewebPay names, with most shown as branch-scoped in CLI metadata. Important operational rule remains: branch-scoped Preview(`staging`) values override general Preview for staging.

Production has:

- no `NEWEBPAY_MERCHANT_ID`
- no `NEWEBPAY_HASH_KEY`
- no `NEWEBPAY_HASH_IV`
- no `NEWEBPAY_CHECKOUT_URL`
- no `NEWEBPAY_ENVIRONMENT`
- no `NEWEBPAY_NOTIFY_URL`
- no `ENABLE_NEWEBPAY_CHECKOUT`

Production still has unrelated public app URL config as expected.

Preview(`staging`) env was not re-applied in this task. It was force-aligned in the prior task, and this task did not have explicit approval to write env again.

## Owner Backend Manual Checklist

Owner should verify these manually in the NewebPay sandbox backend. Do not paste values into chat or commit screenshots with private values.

Shop / transaction:

- Current sandbox shop status is `營運中`.
- The successful sandbox transaction’s MerchantOrderNo belongs to this exact sandbox shop.
- The transaction being inspected is the same transaction from the latest ANYU staging smoke.
- The transaction payment method is credit-card one-time payment.

Merchant identity:

- The backend MerchantID shown for this sandbox shop matches the MerchantID used in staging.
- The MerchantID is sandbox, not production.
- The MerchantID is from the same shop that owns the HashKey and HashIV.

HashKey / HashIV:

- HashKey belongs to this exact same sandbox shop.
- HashIV belongs to this exact same sandbox shop.
- HashKey is copied from the correct HashKey field, not the IV field.
- HashIV is copied from the correct HashIV field, not the Key field.
- No extra spaces, quotes, line breaks, tabs, full-width characters, copied labels, or hidden characters are included.
- Values were not truncated or copied from a masked display.
- NewebPay has not regenerated sandbox keys after `.env.local` / Preview(`staging`) was set.

Environment / URLs:

- Gateway is sandbox `ccore`.
- NotifyURL is `https://staging.anyu.tw/api/payments/newebpay/notify`.
- ReturnURL points to staging.
- No production credentials or production backend settings are mixed into the sandbox shop.

Vercel / config source:

- Preview(`staging`) branch-scoped values are the intended active values.
- General Preview values are not the source of truth for staging.
- Production env should remain without sandbox credentials.

## Ranked Credential Mismatch Hypotheses

1. Wrong sandbox shop HashKey / HashIV.
   Risk: the MerchantID may pass, but TradeInfo decrypts with the wrong key/IV.

2. Old sandbox shop values.
   Risk: credentials were copied from a previous sandbox shop while the transaction was processed by a newer shop.

3. Production key/IV accidentally used.
   Risk: same provider family, wrong environment, decrypt fails.

4. Copied whitespace, quotes, hidden characters, or labels.
   Risk: Vercel value exists but crypto input is not exactly the NewebPay key/IV.

5. Branch-scoped Preview(`staging`) differs from `.env.local`.
   Risk: local source used for alignment may not match what owner sees in backend.

6. NewebPay regenerated keys after env was set.
   Risk: checkout was created with stale keys while backend now shows new keys, or vice versa.

7. Encrypted callback generated by a different shop than checkout.
   Risk: transaction belongs to another sandbox shop/account than expected.

## Decision Path

If owner confirms mismatch or uncertainty:

- Re-copy MerchantID / HashKey / HashIV directly from the successful transaction’s exact sandbox shop.
- Re-force-align branch-scoped Preview(`staging`) only.
- Redeploy Preview(`staging`).
- Rerun a fresh sandbox E2E payment smoke.

If owner is certain credentials match exactly:

- Start code-level decrypt compatibility investigation.
- Do not log raw provider payloads.
- Focus areas:
  - AES mode/padding
  - URL encoding or plus/space conversion before hex processing
  - hex casing and preprocessing
  - NewebPay official sample comparison
  - secure local decrypt fixture using owner-provided test payload outside repo and outside chat

## Likely Root Cause

Most likely: sandbox backend shop credential mismatch or copied credential formatting issue.

Reason:

- MerchantID, TradeInfo, TradeSha, and Version are all present in the real callback.
- Transport is HTTP 200.
- The failure occurs after signature comparison but before decrypted payload parsing succeeds.
- Checkout and NotifyURL use the same app config helper and env names.

## Validation

Documentation-only task:

- Docs presence check: passed.
- Secret/private scan: passed.
- `git diff --check`: passed.

No app code changed, so app lint/test/build was not required.

## Tech Debt Review

New technical debt introduced:

- None.

Existing technical debt observed:

- Sandbox E2E remains manual.
- Branch-scoped Preview(`staging`) env precedence is easy to confuse.
- There is no dedicated secret-safe credential readiness helper.

Opportunistic cleanup completed:

- None.

Deferred cleanup candidates:

- Secret-safe env readiness script that reports presence/categories only.
- Secret-safe sandbox decrypt fixture workflow for local-only payload debugging.

## Recommended Next Step

Owner performs NewebPay sandbox backend credential checklist.

Then:

- if mismatch/uncertainty is found: re-copy credentials, re-align Preview(`staging`), redeploy, and run Fresh NewebPay Sandbox E2E Payment Smoke v5.
- if credentials are confirmed exact: run NewebPay TradeInfo Decrypt Compatibility Investigation v0.
