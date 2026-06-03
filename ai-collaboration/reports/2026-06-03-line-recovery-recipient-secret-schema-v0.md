# LINE Recovery Recipient Secret Schema v0

Date: 2026-06-03

## Completed Work

- Added migration `apps/web/drizzle/0011_payment_recovery_contact_secrets.sql`.
- Added Drizzle schema for `payment_recovery_contact_secrets`.
- Added server-only LINE recipient crypto helper using `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`.
- Added server-only DB helper layer for encrypted LINE recipient secrets.
- Added tests covering schema seam, encryption/hash behavior, fail-closed key behavior, sanitized helper returns, revocation/failure/last-used helpers, and raw token rejection.
- Updated `.env.example` with the new env name only.

## Schema Added

New table:

- `payment_recovery_contact_secrets`

Fields:

- `id`
- `recovery_contact_id`
- `channel`
- `purpose`
- `recipient_hash`
- `encrypted_recipient`
- `key_version`
- `status`
- `failure_category`
- `last_used_at`
- `revoked_at`
- `created_at`
- `updated_at`

Constraints and indexes:

- foreign key to `payment_recovery_contacts.id`
- `channel` constrained to `line`
- `purpose` constrained to `recovery_link_delivery`
- `status` constrained to `active`, `revoked`, or `failed`
- index on `recovery_contact_id`
- lookup index on `channel`, `purpose`, `recipient_hash`
- unique active secret by `recovery_contact_id`, `channel`, `purpose`

Migration status:

- Migration file added only.
- No staging or production DB migration was applied in this task.

## Encryption / Key Strategy

New env:

- `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`

Behavior:

- Separate from `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY`.
- Validates as a 32-byte key encoded as base64url, base64, or 64-char hex.
- Missing or invalid key fails closed.
- Recipient hash uses existing `PAYMENT_RECOVERY_CONTACT_HASH_SECRET` with a separate HMAC purpose: `line_recovery_recipient:v1`.
- Raw LINE recipient value is rejected if it contains `pa_`, `pcs_`, or `prl_` bearer-token patterns.

Key version:

- `key_version` is included with default `v1`.
- Multi-key rotation is deferred.

## Helper Behavior

Added:

- `createOrUpdateLineRecoveryRecipientSecret`
- `getActiveLineRecoveryRecipientSecretByContactId`
- `resolveLineRecoveryRecipientForSending`
- `markLineRecoveryRecipientSecretUsed`
- `revokeLineRecoveryRecipientSecret`
- `markLineRecoveryRecipientSecretFailed`

Safety behavior:

- Default create/update/revoke/failure/last-used helpers return sanitized metadata only.
- Sanitized returns omit `recipient_hash` and `encrypted_recipient`.
- Raw recipient is returned only by the explicit internal send resolver `resolveLineRecoveryRecipientForSending`.
- Helpers do not log raw LINE recipient values.

## Bind Route Integration

Deferred.

Reason:

- This task intentionally adds code + migration only.
- Preview(staging) DB does not have the new table yet.
- Integrating `/api/line/recovery/bind-liff` before staging migration would cause the already-staging-proven LINE bind path to hit a missing table.

Recommended follow-up:

- `LINE Recovery Recipient Secret Staging Apply v0`
- then `LINE Recovery Bind Recipient Secret Integration v0`

## Sending Flow Readiness

The existing LINE sender foundation remains ready for a future recipient resolver.

Next implementation should:

1. Find eligible LINE recovery contact.
2. Resolve active encrypted recipient secret server-side.
3. Decrypt recipient in process memory.
4. Create `/r/` recovery link only when recipient exists.
5. Send LINE message.
6. Mark sent only on provider success.
7. Keep failure non-fatal to paid delivery.

## Validation

- `cd apps/web && corepack pnpm test -- src/tests/payment-recovery-contact-secrets.test.ts src/tests/payment-recovery-contacts.test.ts src/tests/line-recovery-link.test.ts src/tests/line-recovery-bind-state.test.ts src/tests/line-route-hardening.test.ts`: passed
- `cd apps/web && corepack pnpm lint`: passed
- `cd apps/web && corepack pnpm test`: passed
- `cd apps/web && corepack pnpm build`: passed
- `cd apps/web && corepack pnpm exec drizzle-kit check`: passed
- `cd apps/web && corepack pnpm run qa:recovery-link:smoke`: passed against current Preview(staging); no Email/LINE sent
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`: passed against current Preview(staging); production fail-closed checks passed

## Production Safety

- Production payment runtime was not enabled.
- Production env was not modified.
- Production DB migration was not applied.
- No LINE messages were sent.
- No Email was sent.
- Payment provider behavior was not changed.

## Tech Debt Review

- New technical debt introduced: schema/helper exists before staging DB apply and bind integration; this is intentional sequencing.
- Existing technical debt observed: real LINE push remains blocked until staging migration and bind integration store recipient secrets.
- Opportunistic cleanup completed: added explicit `key_version` now to make future rotation less disruptive.
- Deferred cleanup candidates: multi-key rotation and LINE block/unfollow handling.

## Recommended Next Task

`LINE Recovery Recipient Secret Staging Apply v0`

Then:

`LINE Recovery Bind Recipient Secret Integration v0`
