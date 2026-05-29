# Payment / Entitlement Schema Migration Plan v0

Date: 2026-05-27

## 1. Summary

Plan the next future migration as:

```text
apps/web/drizzle/0007_payment_entitlements.sql
```

This plan is exact enough for implementation but does not create the migration.

Recommendations:

- Add `payment_intents` for NewebPay/order/payment truth.
- Add `entitlements` for product access truth.
- Store paid access tokens as `pa_`-prefixed raw URLs only and `paid_access_token_hash` in DB.
- Use a dedicated `PAID_ACCESS_TOKEN_HASH_SECRET`.
- Keep `/m/{moduleSlug}/unlock/{token}` externally for v0 with a dual resolver.
- Keep status columns as `text` with app constants first, matching current repo style.
- Keep `generation_jobs.entitlement_ref_id` as the payment-created job linkage.
- Do not add a provider-events/audit table in the first migration unless NewebPay implementation later proves replay/audit requires it.

No DB migration, schema file, repository helper, runtime route, payment, LINE, or production behavior was changed.

## 2. Approved Boundaries

Approved model boundaries:

- `payment_intents`: payment/order truth.
- `entitlements`: product access truth.
- `paid_access_token`: web paid-result access proof.
- `unlock_intents`: LINE/LIFF and short-code fulfillment infrastructure.
- `generation_jobs`: paid-analysis work lifecycle.
- `analysis_paid_results`: completed paid-result storage/delivery truth.

Policy boundary:

- NT$49 paid result access is retention-limited for v0. Do not promise permanent access until long-term history/account support exists.

## 3. payment_intents Exact Schema

Future SQL shape:

```sql
CREATE TABLE "payment_intents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "provider" text NOT NULL,
  "provider_environment" text DEFAULT 'unknown' NOT NULL,
  "merchant_order_no" text NOT NULL,
  "module_slug" text NOT NULL,
  "analysis_request_id" uuid NOT NULL,
  "analysis_result_id" uuid NOT NULL,
  "unlock_intent_id" uuid,
  "amount_minor" integer NOT NULL,
  "currency" text DEFAULT 'TWD' NOT NULL,
  "status" text DEFAULT 'created' NOT NULL,
  "provider_status" text,
  "provider_trade_no" text,
  "provider_payment_type" text,
  "provider_response_code" text,
  "provider_message_category" text,
  "checkout_started_at" timestamp with time zone,
  "notify_received_at" timestamp with time zone,
  "return_received_at" timestamp with time zone,
  "paid_at" timestamp with time zone,
  "failed_at" timestamp with time zone,
  "cancelled_at" timestamp with time zone,
  "expired_at" timestamp with time zone,
  "refund_requested_at" timestamp with time zone,
  "refunded_at" timestamp with time zone,
  "expires_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "payment_intents_analysis_request_id_analysis_requests_id_fk"
    FOREIGN KEY ("analysis_request_id") REFERENCES "public"."analysis_requests"("id"),
  CONSTRAINT "payment_intents_analysis_result_id_analysis_results_id_fk"
    FOREIGN KEY ("analysis_result_id") REFERENCES "public"."analysis_results"("id"),
  CONSTRAINT "payment_intents_unlock_intent_id_unlock_intents_id_fk"
    FOREIGN KEY ("unlock_intent_id") REFERENCES "public"."unlock_intents"("id")
);
```

Amount recommendation:

- Use `amount_minor integer` plus `currency`.
- For TWD, `NT$49` is stored as `49` because TWD has no practical cents in this product context.
- `amount_minor` keeps the field future-compatible if another currency/provider is ever added.

Status values:

- `created`
- `checkout_started`
- `paid`
- `failed`
- `cancelled`
- `expired`
- `refund_pending`
- `refunded`

Validation strategy:

- Use `text` fields with app constants first. This matches existing repo conventions for `analysis_paid_results.status`, `unlock_intents.fulfillment_status`, and `generation_jobs.status`.
- Defer DB check constraints unless the team decides stricter DB-level contracts are worth the migration friction.

## 4. entitlements Exact Schema

Future SQL shape:

```sql
CREATE TABLE "entitlements" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "entitlement_type" text NOT NULL,
  "source" text NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "module_slug" text NOT NULL,
  "analysis_request_id" uuid NOT NULL,
  "analysis_result_id" uuid NOT NULL,
  "payment_intent_id" uuid,
  "unlock_intent_id" uuid,
  "generation_job_id" uuid,
  "line_user_ref" text,
  "paid_access_token_hash" text,
  "paid_access_token_expires_at" timestamp with time zone,
  "paid_access_token_last_used_at" timestamp with time zone,
  "remaining_uses" integer,
  "expires_at" timestamp with time zone,
  "activated_at" timestamp with time zone,
  "consumed_at" timestamp with time zone,
  "revoked_at" timestamp with time zone,
  "refunded_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "entitlements_analysis_request_id_analysis_requests_id_fk"
    FOREIGN KEY ("analysis_request_id") REFERENCES "public"."analysis_requests"("id"),
  CONSTRAINT "entitlements_analysis_result_id_analysis_results_id_fk"
    FOREIGN KEY ("analysis_result_id") REFERENCES "public"."analysis_results"("id"),
  CONSTRAINT "entitlements_payment_intent_id_payment_intents_id_fk"
    FOREIGN KEY ("payment_intent_id") REFERENCES "public"."payment_intents"("id"),
  CONSTRAINT "entitlements_unlock_intent_id_unlock_intents_id_fk"
    FOREIGN KEY ("unlock_intent_id") REFERENCES "public"."unlock_intents"("id"),
  CONSTRAINT "entitlements_generation_job_id_generation_jobs_id_fk"
    FOREIGN KEY ("generation_job_id") REFERENCES "public"."generation_jobs"("id")
);
```

V0 values:

- `entitlement_type = single_paid_analysis`
- `source = payment_single`
- `status = active`
- `remaining_uses = null`

Status values:

- `active`
- `consumed`
- `expired`
- `revoked`
- `refunded`

Single paid analysis behavior:

- Keep `status = active` until retention expiry, refund, revocation, or explicit expiry.
- Do not mark `consumed` after first view unless the business chooses one-time-only viewing. Current product copy says a complete result page can be revisited within retention, not one-time-only.

## 5. Paid Access Token Strategy

Token format:

```text
pa_<base64url random 32 bytes>
```

Raw token rules:

- Generated server-side only.
- Returned only in redirect/link response.
- Appears only in the URL/link.
- Never stored in plain text.
- Never logged.
- Never committed.

Hashing:

```text
sha256(PAID_ACCESS_TOKEN_HASH_SECRET + ":" + token)
```

Recommendation:

- Add a dedicated `PAID_ACCESS_TOKEN_HASH_SECRET`.
- Do not reuse `ANALYSIS_CACHE_HASH_SECRET`, because cache-key privacy and paid-access authorization are separate threat surfaces.
- Do not reuse `FULFILLMENT_TOKEN_SECRET` unless intentionally approved; LINE fulfillment and paid web access should remain separable.

Expiry:

- For v0, set `paid_access_token_expires_at` to align with paid-result retention.
- `expires_at` on entitlement may mirror paid access expiry.
- If retention behavior is not exact at implementation time, keep expiry nullable but ensure public copy does not promise permanent access.

Re-delivery:

- Support can rotate the token by replacing `paid_access_token_hash` and `paid_access_token_last_rotated_at` if that column is added later.
- In the exact v0 table above, rotation can be represented by replacing the hash and updating `updated_at`; add `paid_access_token_last_rotated_at` only if support audit requires it.

## 6. Token Resolver Strategy

Future resolver:

```ts
resolvePaidAccessOrUnlockToken(moduleSlug, token)
```

Recommended branch:

```text
if token starts with "pa_":
  hash with PAID_ACCESS_TOKEN_HASH_SECRET
  resolve active entitlement
else:
  hash with fulfillment token secret
  resolve legacy unlock_intent
```

Return shape:

```ts
type PaidAccessResolution =
  | { kind: "paid_access"; entitlement: SafeEntitlement }
  | { kind: "unlock_intent"; unlockIntent: SafeUnlockIntent }
  | { kind: "missing" }
  | { kind: "expired" }
  | { kind: "revoked" }
  | { kind: "refunded" };
```

Resolver rules:

- Do not return raw token.
- Do not log raw token.
- Validate `module_slug`.
- Treat expired/refunded/revoked entitlements as unavailable.
- Keep legacy unlock token behavior intact.

## 7. Route Strategy

Keep externally:

```text
/m/{moduleSlug}/unlock/{token}
```

Future behavior:

- `pa_` token + active entitlement + completed paid result -> render paid result.
- `pa_` token + active entitlement + queued/processing job -> render pending poller.
- `pa_` token + active entitlement + failed final -> render support/retry/refund copy.
- `pa_` token + refunded/revoked entitlement -> render unavailable/refund state.
- `pa_` token + expired access -> render retention-expired/access-expired state.
- legacy token -> current unlock intent flow.

Why not add `/paid/{token}` yet:

- Existing route, theme carryover, pending poller, unlocked result view tracker, and LINE compatibility are already built around `/unlock/{token}`.
- A neutral route can be a later cleanup after payment behavior stabilizes.

## 8. MerchantOrderNo Strategy

Proposed internal format:

```text
ANYU{yymmddHHmmss}{random6base36}
```

Example shape only:

```text
ANYU260527142233A1B2C3
```

Rules:

- Do not include user data.
- Do not include analysis text.
- Do not include LINE identifiers.
- Enforce uniqueness with DB unique index.
- Confirm final NewebPay length/character constraints during provider implementation.

If NewebPay constraints differ, keep the DB field as `text` and adjust generator only.

## 9. NewebPay Provider References

Store after verified notify/return:

- `provider_trade_no`
- `provider_status`
- `provider_payment_type`
- `provider_response_code`
- `provider_message_category`
- `paid_at`
- `notify_received_at`
- `return_received_at`

Do not store:

- full card number
- CVV
- raw card data
- raw provider payload by default
- unredacted payer PII if returned
- HashKey
- HashIV
- tokenized ANYU URLs

Provider-events table:

- Do not add `payment_provider_events` in first migration.
- Add it later only if NewebPay integration needs audit replay, dispute workflow, or debugging that cannot be handled through sanitized fields on `payment_intents`.

## 10. Repository Helper Plan

Future files:

```text
apps/web/src/lib/db/payment-intents.ts
apps/web/src/lib/db/entitlements.ts
apps/web/src/lib/modules/payment-access.ts
```

Payment intent helpers:

```ts
createPaymentIntent(args)
markCheckoutStarted(args)
markPaymentPaid(args)
markPaymentFailed(args)
markPaymentCancelled(args)
markPaymentExpired(args)
markRefundPending(args)
markRefunded(args)
getPaymentIntentByMerchantOrderNo(merchantOrderNo)
getPaymentIntentById(id)
getPaymentIntentForResult(args)
```

Entitlement helpers:

```ts
createPaymentSingleEntitlement(args)
getEntitlementByPaidAccessToken(token)
getEntitlementById(id)
getActiveEntitlementForPaymentIntent(paymentIntentId)
markEntitlementRefunded(args)
markEntitlementRevoked(args)
markEntitlementExpired(args)
rotatePaidAccessToken(args)
touchPaidAccessTokenLastUsed(args)
```

Payment-access helpers:

```ts
generatePaidAccessToken()
hashPaidAccessToken(token)
isPaidAccessTokenShape(token)
resolvePaidAccessOrUnlockToken(moduleSlug, token)
buildPaidAccessPath(moduleSlug, token)
```

Safety:

- Helper return types must not include raw tokens except from explicit create/rotate functions.
- Logs/events must contain only statuses/categories and safe IDs when needed.

## 11. Indexes / Constraints

Future SQL indexes:

```sql
CREATE UNIQUE INDEX "payment_intents_merchant_order_no_idx"
  ON "payment_intents" USING btree ("merchant_order_no");

CREATE INDEX "payment_intents_provider_trade_idx"
  ON "payment_intents" USING btree ("provider","provider_trade_no");

CREATE INDEX "payment_intents_result_idx"
  ON "payment_intents" USING btree ("analysis_result_id");

CREATE INDEX "payment_intents_request_idx"
  ON "payment_intents" USING btree ("analysis_request_id");

CREATE INDEX "payment_intents_status_created_idx"
  ON "payment_intents" USING btree ("status","created_at");

CREATE INDEX "payment_intents_module_created_idx"
  ON "payment_intents" USING btree ("module_slug","created_at");

CREATE UNIQUE INDEX "entitlements_paid_access_token_hash_idx"
  ON "entitlements" USING btree ("paid_access_token_hash")
  WHERE "paid_access_token_hash" IS NOT NULL;

CREATE INDEX "entitlements_payment_intent_idx"
  ON "entitlements" USING btree ("payment_intent_id");

CREATE INDEX "entitlements_result_idx"
  ON "entitlements" USING btree ("analysis_result_id");

CREATE INDEX "entitlements_unlock_intent_idx"
  ON "entitlements" USING btree ("unlock_intent_id");

CREATE INDEX "entitlements_generation_job_idx"
  ON "entitlements" USING btree ("generation_job_id");

CREATE INDEX "entitlements_module_status_idx"
  ON "entitlements" USING btree ("module_slug","status");

CREATE INDEX "entitlements_expires_at_idx"
  ON "entitlements" USING btree ("expires_at");
```

Foreign-key strategy:

- Use FKs where current schema already uses them.
- Do not use cascading deletes in the initial migration.
- Retention cleanup currently deletes/scrubs analysis content carefully; future cleanup must be updated to avoid FK blockers or to expire entitlements before deleting referenced analysis rows.
- If future retention requires hard deletes of analysis rows, consider `ON DELETE SET NULL` only for payment/entitlement refs after reviewing support/accounting requirements.

DB check constraints:

- Not recommended for first migration because existing repo uses text status fields without DB checks.
- Enforce statuses through app constants and tests.

## 12. Retention Interaction

Current policy:

- Paid result content should remain retention-limited.
- Payment/access metadata may need to outlive paid-result content for accounting/support.

Recommended state:

```text
entitlement active + paid result expired/scrubbed
-> show retention-expired state and support copy
```

Do not:

- Store raw input in payment/entitlement tables.
- Store `paid_result_json` in payment/entitlement tables.
- Promise permanent paid access without account/history infrastructure.

Future cleanup update:

- Retention cleanup should include aggregate reporting for expired entitlements once the tables exist.
- Payment records should not be deleted on the same short retention schedule as private analysis content.

## 13. Failure / Refund / Re-delivery

Paid but generation failed:

```text
payment_intents.status = paid
entitlements.status = active
generation_jobs.status = failed_final
analysis_paid_results.status = failed
```

UI:

- Show safe support/retry/refund copy.
- Do not add `needs_support` status in v0; derive it from job/result status.

Refund:

```text
payment_intents.status = refunded
entitlements.status = refunded
entitlements.refunded_at = now()
```

Access:

- Refunded/revoked entitlements should not render paid content.
- Preserve sanitized payment refs for reconciliation.

Duplicate payment:

- Detect existing active entitlement for same `analysis_result_id` or same provider/merchant refs.
- Existing entitlement remains access source.
- Duplicate payment intent moves to `refund_pending` or `refunded` after verification.

Expired checkout:

- `payment_intents.status = expired`.
- No entitlement is created.
- User can start a new checkout if free result retention still allows it.

Re-delivery:

- Rotate `paid_access_token_hash` or resend current access link if safe.
- Never ask user to send raw private input for re-delivery.

## 14. Tests For Future Implementation

Future tests:

- payment intent creation uses unique `merchant_order_no`.
- `merchant_order_no` contains no user data.
- payment paid transition is idempotent.
- failed/cancelled/expired/refund transitions preserve timestamps.
- entitlement creation stores hashed paid access token only.
- raw paid token is not stored.
- `pa_` token resolver resolves active entitlement.
- legacy unlock token still resolves current unlock intent flow.
- revoked/refunded/expired entitlement is rejected with safe state.
- entitlement does not store `paid_result_json`.
- payment intent does not store card data or raw provider payload.
- duplicate payment handling reuses existing entitlement.
- `generation_jobs.entitlement_ref_id` can link payment-created job.
- retention-expired paid result renders support/expired state.

## 15. Migration Rollout

### Phase 0 - This plan

No code or schema change.

### Phase 1 - Schema migration implementation

Add `0007_payment_entitlements.sql`, Drizzle schema updates, constants, and repository helpers. No runtime writes.

### Phase 2 - Staging schema verification

Apply migration to staging and verify:

- tables exist
- columns/defaults exist
- indexes exist
- foreign keys exist
- repository helper smoke can create synthetic records without secrets or raw content

### Phase 3 - Production migration gate

Apply production migration only after staging verification. Keep payment disabled and no runtime writes.

### Phase 4 - Fake provider / sandbox access flow

Operator-only fake payment success creates:

- payment intent
- entitlement
- paid access token
- payment-success generation job

Then verify `/unlock/{pa_...}` route and polling.

### Phase 5 - NewebPay integration

Implement payment intent creation, checkout redirect, notify/return verification, paid transition, entitlement creation, and queue trigger.

### Phase 6 - Queue trigger integration

Publish reference-only queue message after verified payment success.

## 16. What Not To Build Yet

Do not build yet:

- migration in this task
- repository helpers in this task
- token resolver in this task
- NewebPay API
- checkout
- queue provider integration
- request-route enqueue-only switch
- LINE enqueue-only switch
- admin dashboard
- membership
- paid result history library
- relationship packs
- invoice/fapiao logic
- ads

## 17. Recommended Next Step

Run `Payment / Entitlement Schema Implementation v0` only after human approval of this exact migration plan. That future task should include a decision log because it changes schema contracts.
