# Paid Result Recovery Identity Schema v0

Date: 2026-05-31

## Summary

Added the foundational paid result recovery identity schema, migration file, server-side crypto helpers, repository/service helpers, and tests.

No checkout-start recovery UI, LINE push, Email sending, membership/login, production payment runtime, Vercel env, payment provider behavior, or DB apply was performed.

## 1. Completed Work

Added:

- `apps/web/drizzle/0009_payment_recovery_contacts.sql`
- `paymentRecoveryContacts` schema in `apps/web/src/lib/db/schema.ts`
- `apps/web/src/lib/payments/recovery-contact-crypto.ts`
- `apps/web/src/lib/db/payment-recovery-contacts.ts`
- `apps/web/src/tests/payment-recovery-contacts.test.ts`
- blank env-name placeholders in `apps/web/.env.example`

Dashboard and summary docs were updated to record that the schema/helper layer exists and staging DB apply is still pending.

## 2. Schema / Migration Added

New table:

```text
payment_recovery_contacts
```

Fields added:

- `id`
- `module_slug`
- `analysis_result_id`
- `payment_intent_id`
- `entitlement_id`
- `contact_type`
- `contact_hash`
- `contact_encrypted`
- `line_user_hash`
- `email_hash`
- `transactional_consent_at`
- `marketing_opt_in_at`
- `source`
- `status`
- `last_used_at`
- `created_at`
- `updated_at`

Indexes / uniqueness:

- result lookup index
- payment intent lookup index
- entitlement lookup index
- contact lookup index by type/hash
- active unique contact per result/type/hash
- active unique contact per payment intent/type/hash when payment intent is present

The schema permits multiple recovery contacts for a paid result when contact type differs, such as one Email and one LINE identity.

## 3. Encryption / Hash Strategy

New explicit env names:

- `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`
- `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY`

Strategy:

- Email is normalized to lowercase/trimmed before hashing/encryption.
- Contact lookup uses HMAC-SHA256 with `PAYMENT_RECOVERY_CONTACT_HASH_SECRET` and a dedicated purpose string.
- Email contact value is encrypted with AES-256-GCM using `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY`.
- The encryption key must decode to 32 bytes using base64url, base64, or 64-character hex.
- Missing hash/encryption secrets fail closed.
- LINE identity is stored as a keyed hash only; no raw LINE user ID field was added to the recovery contact table.
- Raw `pa_` and `pcs_` bearer-token-shaped values are rejected as recovery contact values.

The implementation does not reuse unrelated payment token secrets.

## 4. Service Helpers Added

Added server-side helpers in `apps/web/src/lib/db/payment-recovery-contacts.ts`:

- `createOrUpdateEmailRecoveryContact(...)`
- `createOrUpdateLineRecoveryContact(...)`
- `getPaymentRecoveryContactsByPaymentIntentId(...)`
- `getPaymentRecoveryContactsByEntitlementId(...)`
- `getPaymentRecoveryContactsByResultId(...)`
- `bindRecoveryContactsToEntitlement(...)`
- `markPaymentRecoveryContactStatus(...)`
- `recordPaymentRecoveryMarketingOptIn(...)`

Behavior:

- Sequential duplicate create/update for the same result/contact reuses the existing active record.
- Pre-payment contacts can later be linked to an entitlement by payment intent.
- Transactional consent and marketing opt-in are separate timestamps.
- Status transitions support `pending`, `verified`, `bound`, `failed`, and `revoked`.

## 5. Consent Model Implemented

Implemented at data/service layer only:

- transactional recovery consent is required as `transactional_consent_at`
- marketing/re-engagement consent is optional as `marketing_opt_in_at`

No UI or copy was added in this task.

## 6. Membership Compatibility

No membership table or login behavior was added.

The model is compatible with a future lightweight identity path because it keeps:

- module/result references
- payment/entitlement references
- contact hashes
- consent timestamps
- source/status lifecycle

A future member identity can map from recovery contact hashes without converting this v0 table into an account system.

## 7. Migration Status

Migration file added only:

```text
apps/web/drizzle/0009_payment_recovery_contacts.sql
```

Migration was not applied to staging or production in this task.

Recommended next step is a separate staging-verified apply task:

```text
Paid Result Recovery Identity Staging Apply v0
```

Production migration remains gated and should not happen before explicit production launch/migration approval.

## 8. Tests

Added tests for:

- approved recovery constants
- encryption/decryption without raw value as ciphertext
- missing encryption key fail-closed behavior
- email recovery contact stores hash/encrypted fields, not raw email
- duplicate email contact reuses existing active record
- LINE recovery contact stores hashed identity and no encrypted payload
- transactional consent and marketing opt-in are separate
- pre-payment contacts can be linked to entitlement
- raw `pa_` / `pcs_` bearer-token-shaped values are rejected
- migration and schema seam exist

## 9. Validation

Validation results are recorded in the final completion summary.

## Architecture Decisions

- Dedicated `payment_recovery_contacts` table was implemented instead of adding contact fields to `payment_intents` or `entitlements` only.
- Email storage uses encrypted normalized value plus keyed hash.
- LINE identity storage uses keyed hash only.
- Recovery helper secrets are explicit and separate from payment token secrets.
- Migration is committed but not applied.

## Blockers

- Staging DB migration apply is still pending.
- Production DB migration is not applied and remains gated.
- Actual checkout-start recovery UI remains future work.
- LINE/Email sending remains future work.

## Uncertainties

- Encryption key rotation policy is not yet defined.
- Whether the first UX should be Email-only or Email plus LINE remains open.
- Support-assisted recovery runbook still needs a future task.

## Tech Debt Review

### New Technical Debt Introduced

- The recovery contact schema exists in code/migration but is not applied to staging yet.

### Existing Technical Debt Observed

- Current user-facing recovery still depends on browser/session continuity until the later checkout-start soft gate is implemented.

### Opportunistic Cleanup Completed

- Added explicit `.env.example` placeholders for recovery contact secrets.

### Deferred Cleanup Candidates

- `Paid Result Recovery Identity Staging Apply v0`
- `Checkout-Start Recovery Soft Gate UX v0`
- `LINE Recovery Binding Reframe v0`
- `Support-Assisted Recovery Runbook v0`

### Recommended Follow-up

- Apply and verify the migration on staging before adding checkout-start recovery UI.
