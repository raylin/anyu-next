# Production Payment Config Dry-Run v0

Date: 2026-06-04

## Completed Work

- Inspected current NewebPay config helper, checkout route, NotifyURL route, and feature flags.
- Confirmed production payment runtime requires both `ENABLE_NEWEBPAY_CHECKOUT` and `ENABLE_PAYMENT_RUNTIME` for public checkout.
- Configured Production Vercel env names for NewebPay production provider settings.
- Kept Production checkout/runtime disabled with explicit false flags.
- Redeployed the existing latest Production deployment by URL to refresh env without deploying the local staging worktree.
- Verified Production public pages remain live.
- Verified Production checkout and operator routes remain fail-closed.
- Ran read-only Production DB migration gate inventory.

## Production Env Names Configured

Configured in Vercel Production, values not printed:

- `NEWEBPAY_MERCHANT_ID`
- `NEWEBPAY_HASH_KEY`
- `NEWEBPAY_HASH_IV`
- `NEWEBPAY_ENVIRONMENT`
- `NEWEBPAY_CHECKOUT_URL`
- `NEWEBPAY_NOTIFY_URL`
- `NEXT_PUBLIC_APP_URL`
- `ENABLE_NEWEBPAY_CHECKOUT`
- `ENABLE_PAYMENT_RUNTIME`

Expected categories:

- `NEWEBPAY_ENVIRONMENT`: production
- `NEWEBPAY_CHECKOUT_URL`: production NewebPay MPG gateway
- `NEWEBPAY_NOTIFY_URL`: production ANYU NotifyURL
- `NEXT_PUBLIC_APP_URL`: production ANYU domain
- `ENABLE_NEWEBPAY_CHECKOUT`: false
- `ENABLE_PAYMENT_RUNTIME`: false

No MerchantID, HashKey, HashIV, TradeInfo, TradeSha, env values, lengths, prefixes, suffixes, hashes, or checksums were printed.

## Payment Method Decision

Production controlled smoke path decision:

- first method: credit card one-time payment only
- Apple Pay / Google Pay / Samsung Pay: pending/separate review and non-blocking
- ATM / WebATM / convenience store / installment / rewards: remain disabled and out of scope
- no ads or broad launch from this task

## Config Contract Inspection

Implementation env names confirmed:

- `NEWEBPAY_MERCHANT_ID`
- `NEWEBPAY_HASH_KEY`
- `NEWEBPAY_HASH_IV`
- `NEWEBPAY_CHECKOUT_URL`
- `NEWEBPAY_NOTIFY_URL`
- `NEWEBPAY_ENVIRONMENT`
- `NEXT_PUBLIC_APP_URL`
- `ENABLE_NEWEBPAY_CHECKOUT`
- `ENABLE_PAYMENT_RUNTIME`

Checkout route behavior:

- returns 404 `not_found` when `ENABLE_NEWEBPAY_CHECKOUT` is false
- requires operator mode when runtime is disabled
- public production checkout requires both checkout and payment runtime flags enabled

NotifyURL behavior:

- remains provider endpoint code path
- logs only payload shape and safe categories
- does not expose TradeInfo / TradeSha values in diagnostics

## Production Redeploy / Health

Redeploy method:

- redeployed existing latest Production deployment URL
- did not run `vercel --prod` from the local staging worktree

Production health after redeploy:

- environment: production
- git branch: main
- route bundle version: `payment-foundation-2026-05-29`
- public home/refund/legal pages: 200

## Fail-Closed Verification

Production checks:

- checkout route: 404 `not_found`
- operator fake-paid route: 404 `not_found`
- operator recovery-link smoke route: 404
- operator LINE recovery smoke route: 404
- public pages: 200

Result:

- production checkout remains disabled
- production payment runtime remains disabled
- no provider form generated
- no TradeInfo / TradeSha generated or recorded
- no production payment was run

## Config Readiness Preflight

Secret-safe local config-shape dry-run passed:

- required production provider env names present in dry-run input
- HashKey/HashIV shape valid by boolean only
- production environment category correct
- production NotifyURL domain correct
- production app URL domain correct
- production checkout URL category correct
- feature flags disabled
- provider form generated: false
- TradeInfo generated: false
- TradeSha generated: false

## Production Backend / Provider Checklist

Owner/provider checklist status:

- formal NewebPay merchant approval: owner-confirmed complete
- production shop active/approved: owner-confirmed by task context
- NotifyURL should point to `https://anyu.tw/api/payments/newebpay/notify`: configured in Production env
- ReturnURL derives from `NEXT_PUBLIC_APP_URL=https://anyu.tw`: configured in Production env
- enabled method for first smoke: credit card one-time only
- Apple/Google/Samsung Pay: pending/non-blocking
- other methods: should remain disabled in backend/provider settings
- no sandbox credentials mixed into Production: env names configured from production env source

Direct provider dashboard inspection was not available to Codex, so backend settings beyond env configuration remain owner/provider-side confirmation.

## Production DB Migration Gate Inventory

Read-only Neon Production branch inventory:

- `payment_intents`: present
- `entitlements`: present
- `payment_intents_merchant_order_no_idx`: present
- `entitlements_payment_intent_unique_idx`: missing
- `payment_recovery_contacts`: missing
- `paid_result_recovery_links`: missing
- `payment_recovery_contact_secrets`: missing
- provider send audit columns: not applicable because `paid_result_recovery_links` is not present

No production DB migration was applied.

Required before controlled production payment smoke:

- entitlement payment-intent uniqueness migration
- `payment_recovery_contacts`
- `paid_result_recovery_links`
- `payment_recovery_contact_secrets`
- provider send audit columns

## Access-Link / Provider Env Inventory

Production remains gated for:

- payment checkout session secret
- paid access token hash secret
- recovery contact hash/encryption secrets
- recovery link token secret
- LINE recipient encryption key
- Email provider send config
- LINE provider send config

No production Email or LINE message was sent.

## Dry-Run Classification

Result:

- `pass`: production NewebPay provider config names are configured and Production remains fail-closed

Remaining gates before real production smoke:

- production DB migrations
- production payment/access-link runtime secrets
- explicit launch decision for controlled production payment smoke

## Validation

- Vercel Production env names: present, values encrypted
- Production redeploy: succeeded and re-aliased `https://anyu.tw`
- Production health: passed
- Public pages: passed
- Production checkout/operator fail-closed: passed
- Secret-safe config-shape dry-run: passed
- Production DB gate inventory: read-only check completed

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: production DB is still behind staging for recovery/access-link and entitlement uniqueness migrations.
- Opportunistic cleanup completed: none.
- Deferred cleanup candidates: add a first-class production payment config preflight script if repeated dry-runs are expected.

## Suggested Next Steps

1. Production DB Migration Gate Plan / Apply v0.
2. Production Runtime Secret Alignment v0 for payment/access-link secrets while still disabled.
3. Controlled Production Payment Smoke v0 with credit-card one-time payment only.
