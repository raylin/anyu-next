# Payment / Entitlement Schema Implementation v0 Review Bundle

Date: 2026-05-27

## 1. Summary

Implemented the additive payment/entitlement foundation for future payment launch. This adds schema, repository, and helper seams only. It does not enable payment, checkout, NewebPay integration, route resolution, LINE behavior changes, or production behavior changes.

## 2. Migration / Schema

Added future migration:

- `apps/web/drizzle/0007_payment_entitlements.sql`

Added tables:

- `payment_intents`
- `entitlements`

Updated Drizzle schema:

- `paymentIntents`
- `entitlements`
- relations from requests/results/unlock intents/payment intents/entitlements

The migration is additive and does not modify existing tables or runtime flows.

## 3. Payment Intent Helpers

Added `apps/web/src/lib/db/payment-intents.ts` with:

- `PAYMENT_PROVIDERS`
- `PAYMENT_PROVIDER_ENVIRONMENTS`
- `PAYMENT_INTENT_STATUSES`
- `createPaymentIntent`
- `getPaymentIntentById`
- `getPaymentIntentByMerchantOrderNo`
- `markPaymentCheckoutStarted`
- `markPaymentPaid`
- `markPaymentFailed`
- `markPaymentCancelled`
- `markPaymentExpired`
- `markPaymentRefundPending`
- `markPaymentRefunded`

Provider payload storage is intentionally not implemented.

## 4. Entitlement Helpers

Added `apps/web/src/lib/db/entitlements.ts` with:

- `ENTITLEMENT_TYPES`
- `ENTITLEMENT_SOURCES`
- `ENTITLEMENT_STATUSES`
- `createPaymentSingleEntitlement`
- `getEntitlementById`
- `getEntitlementByPaidAccessToken`
- `markEntitlementRefunded`
- `markEntitlementRevoked`
- `markEntitlementExpired`
- `rotatePaidAccessToken`

Creation/rotation returns the raw paid access token only to the caller and stores only the hash.

## 5. Paid Access Token Helper

Added `apps/web/src/lib/payments/paid-access-token.ts`.

Behavior:

- generates `pa_`-prefixed high-entropy tokens
- validates token shape
- hashes with HMAC-SHA256
- requires `PAID_ACCESS_TOKEN_HASH_SECRET`
- does not fall back to insecure hashing

## 6. MerchantOrderNo Helper

Added `apps/web/src/lib/payments/merchant-order.ts`.

Format:

```text
ANYU + yymmddHHmmss + 6 uppercase base36 chars
```

The helper does not include user data, module copy, LINE identifiers, tokens, or raw input.

## 7. Runtime Behavior Preservation

No existing route imports the new payment/entitlement helpers.

Preserved:

- existing unlock route behavior
- existing LINE/LIFF/short-code behavior
- existing paid generation behavior
- existing queue/processor behavior
- existing prompt/schema/cache behavior
- production behavior

## 8. Privacy / Security

Sensitive values intentionally excluded:

- raw paid access tokens in storage
- raw provider payloads
- card data
- raw input
- paid result JSON in payment/entitlement tables
- tokenized URLs
- LINE IDs in queue/payment payloads
- secrets

The staged docs mention secret names only as configuration requirements; no secret values are included.

## 9. Tests Added

Added `apps/web/src/tests/payment-entitlement-foundation.test.ts`.

Coverage:

- approved constants
- MerchantOrderNo format and uniqueness shape
- paid access token generation and hashing
- secret-required hash behavior
- payment intent creation and transitions
- entitlement creation, lookup, terminal transitions, and token rotation
- raw paid token not stored
- legacy unlock tokens not treated as paid tokens

## 10. Schema Decision Log

Decisions:

- `payment_intents` is separate from `unlock_intents` because payment/order truth should not depend on LINE or short-code fulfillment.
- `entitlements` is separate from `payment_intents` because payment status and product access can diverge during refund, duplicate payment, support, or re-delivery.
- `paid_access_token_hash` lives on `entitlements` for v0 to keep the access model simple.
- A separate `paid_access_tokens` table is deferred until multi-link, multi-device, or detailed revocation history is needed.
- `amount_minor + currency` was selected for future compatibility while keeping NT$49 as `49` for TWD.
- `PAID_ACCESS_TOKEN_HASH_SECRET` is dedicated so access-token authorization does not share cache or fulfillment hashing secrets.
- Access remains retention-limited until account/history support exists.

## 11. Known Limitations

- Migration has not been applied to staging or production.
- Runtime route resolver is not implemented.
- Payment return/notify integration is not implemented.
- Queue publish after payment success is not implemented.
- Support/re-delivery UI is not implemented.

## 12. Recommended Next Step

Run `Payment / Entitlement Schema Staging Migration Verification v0` to apply and verify `0007_payment_entitlements.sql` on staging only.
