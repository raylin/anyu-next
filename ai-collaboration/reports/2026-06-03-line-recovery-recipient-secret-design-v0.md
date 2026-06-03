# LINE Recovery Recipient Secret Design v0

Date: 2026-06-03

## 1. Current LINE Recovery Architecture Recap

Current LINE recovery pieces:

- `rlb_` recovery bind state is signed, short-lived, and scoped to recovery identity binding.
- `/line/recovery/bind` is the recovery-specific LIFF UI entry.
- `/api/line/recovery/bind-liff` accepts `rlb_` state plus LIFF `idToken`, verifies LINE identity server-side, and writes recovery identity.
- `payment_recovery_contacts` stores LINE recovery rows as hash-only identity: `contact_type=line`, `contact_hash`, and `line_user_hash`.
- LINE recovery bind is staging-proven through visible CTA → LIFF bind → safe return to result flow.
- LINE recovery link sender foundation exists with noop default and a gated LINE Messaging API adapter.
- The completed paid result recovery hook discovers eligible LINE recovery contacts, but real push is blocked because no sendable LINE recipient is stored.

Why blocked:

- LINE Messaging API push requires a recipient identifier.
- Current storage intentionally cannot reconstruct the raw LINE userId from hashes.
- The sender correctly avoids creating orphan `/r/` tokens when no sendable recipient is available.

## 2. Recipient Identity Requirement

LINE Messaging API push requires a sendable recipient ID, typically the userId returned by a verified LINE/LIFF identity context.

Hash-only identity cannot be used for push:

- HMAC/keyed hashes are one-way lookup/dedupe values.
- They cannot be reversed into LINE userId.
- They are useful for matching, dedupe, and privacy-preserving identity comparison, not for delivery.

Therefore LINE link delivery needs a separate server-only recipient secret, while `payment_recovery_contacts` remains hash-only.

## 3. Design Options

### A. Store encrypted LINE userId directly on `payment_recovery_contacts`

- Privacy risk: medium. The main recovery table would contain both identity hash and encrypted send secret.
- Complexity: low.
- Future membership compatibility: acceptable but less clean; purchase-level recovery rows become secret-bearing.
- Query/dedupe ability: good with existing hash fields.
- Support/debug usefulness: simple linkage.
- Rotation/deletion implications: harder to rotate/delete secrets independently from recovery contact metadata.
- Prior decision fit: partially violates the spirit of keeping `payment_recovery_contacts` hash-only.

### B. Add separate `line_recovery_recipients` table

- Privacy risk: lower than option A because sendable recipient secrets are isolated.
- Complexity: medium.
- Future membership compatibility: good for LINE-specific migration, less generic for Email or future channels.
- Query/dedupe ability: good if linked by `recovery_contact_id` and recipient hash.
- Support/debug usefulness: clear LINE-specific operational state.
- Rotation/deletion implications: can revoke/delete LINE secret independently.
- Prior decision fit: preserves hash-only recovery contact table.

### C. Add generic `payment_recovery_contact_secrets` table

- Privacy risk: lower than option A; secrets isolated from recovery metadata.
- Complexity: medium.
- Future membership compatibility: strongest because the table can support LINE now and other delivery secrets later.
- Query/dedupe ability: good with `channel`, `purpose`, and `recipient_hash`.
- Support/debug usefulness: good if statuses and timestamps are explicit.
- Rotation/deletion implications: best; secrets can be revoked/rotated independently per contact/channel/purpose.
- Prior decision fit: best. `payment_recovery_contacts` remains hash-only.

### D. Reuse legacy raw LINE userId storage

- Privacy risk: high unless fully audited.
- Complexity: low short-term, high long-term.
- Future membership compatibility: unclear; legacy fulfillment semantics may leak into recovery.
- Query/dedupe ability: depends on legacy shape.
- Support/debug usefulness: high, but for the wrong reason: raw identifiers are too accessible.
- Rotation/deletion implications: unclear.
- Prior decision fit: poor. It expands legacy raw storage and risks mixing unlock/fulfillment semantics with recovery.

### E. Delay LINE push until membership/user identity system

- Privacy risk: low.
- Complexity: low now, higher later.
- Future membership compatibility: high.
- Query/dedupe ability: deferred.
- Support/debug usefulness: poor until membership exists.
- Rotation/deletion implications: deferred.
- Prior decision fit: safe but delays the owner’s desired LINE recovery proof.

## 4. Recommended Model

Recommend option C: add a separate encrypted `payment_recovery_contact_secrets` table.

Principles:

- Keep `payment_recovery_contacts` hash-only.
- Store encrypted LINE userId only in a separate server-only secret table.
- Link secret rows by `recovery_contact_id`.
- Use recipient hash for dedupe and safe matching.
- Never return raw recipient to UI, API responses, logs, reports, analytics, or dashboards.
- Allow secret revocation/deletion independently from recovery contact metadata.

This preserves the prior hash-only decision while enabling LINE Messaging API push.

## 5. Proposed Schema Shape

Recommended table name:

- `payment_recovery_contact_secrets`

Proposed fields:

- `id`
- `recovery_contact_id`
- `channel`: `line`
- `encrypted_recipient`
- `recipient_hash`
- `purpose`: `recovery_link_delivery`
- `status`: `active | revoked | failed`
- `created_at`
- `updated_at`
- `last_used_at` nullable
- `revoked_at` nullable

Recommended constraints/indexes:

- foreign key from `recovery_contact_id` to `payment_recovery_contacts.id`
- unique active secret by `recovery_contact_id + channel + purpose`
- index by `recipient_hash + channel + purpose` for dedupe
- status check constraint
- channel and purpose check constraints

Do not store:

- raw LINE userId
- raw `pa_`, `pcs_`, or `prl_` tokens
- provider payload
- report content

## 6. Encryption / Key Strategy

Recommendation:

- Introduce `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`.
- Do not reuse `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY` for sendable LINE recipients.

Reasoning:

- Email recovery contact encryption protects a contact value.
- LINE recipient encryption protects a push-addressable delivery secret.
- Separate keys allow narrower rotation and incident response.
- Staging and production keys must be different.

Key behavior:

- Expected format should match existing recovery crypto convention if reused at helper level, likely a 32-byte base64url key.
- Missing or invalid key must fail closed for storing/resolving recipient secrets.
- Key values, lengths, prefixes, suffixes, hashes, and checksums must never be printed.

Rotation:

- v0 can be single-key.
- Future v1 should support key versioning if LINE recipient storage grows.
- Rotation should be planned before production scale, but not required before staging smoke.

## 7. Binding Flow Changes

Current LIFF bind:

1. Validate `rlb_` state.
2. Verify LINE `idToken`.
3. Hash verified LINE userId.
4. Create/update hash-only `payment_recovery_contacts` row.

Recommended v0 bind:

1. Validate `rlb_` state.
2. Verify LINE `idToken`.
3. Compute recovery contact hash and LINE user hash.
4. Create/update hash-only `payment_recovery_contacts` row.
5. Encrypt the verified LINE userId into `payment_recovery_contact_secrets`.
6. Store recipient hash for dedupe.
7. Record transactional consent on the recovery contact.
8. Record marketing consent separately only if explicitly requested.
9. Return sanitized success/failure only.

The raw LINE userId should exist only in process memory during bind and send.

## 8. Sending Flow Changes

Recommended LINE send flow:

1. Find eligible LINE recovery contacts:
   - `contact_type=line`
   - transactional consent present
   - status `verified` or `bound`
   - linked result/payment/entitlement context
   - not revoked or failed
2. Resolve active `payment_recovery_contact_secrets` row by `recovery_contact_id`, `channel=line`, and `purpose=recovery_link_delivery`.
3. Decrypt recipient server-side.
4. If no active recipient secret exists, do not create a `/r/` token and do not send.
5. Create `paid_result_recovery_links` row with channel `line`.
6. Send LINE message containing only the safe `/r/` web return link.
7. Mark sent only after LINE provider success.
8. Mark failed safely on provider/config error.
9. Do not fail paid delivery if LINE sending fails.

This matches current Email behavior while preserving LINE recipient secrecy.

## 9. Deletion / Revocation / Opt-Out

Rules:

- Revoked recovery contact should not send.
- Revoked recipient secret should not send.
- Failed recipient secret can be retried only after explicit repair/update.
- LINE block/unfollow webhook handling can be added later to mark recipient secret failed/revoked.
- Support removal request should revoke recipient secret and optionally recovery contact.
- Future account deletion should delete or revoke all linked contact secrets.

Do not rely on marketing opt-out for transactional recovery revocation. Transactional recovery and marketing consent remain separate.

## 10. Tests To Plan

Schema/helper tests:

- LINE bind stores hash-only recovery contact plus encrypted recipient secret.
- Raw LINE userId is never returned or logged.
- Recipient hash is deterministic for dedupe.
- Encryption key missing/invalid fails closed.
- Revoked recipient secret does not send.
- Missing recipient secret blocks send without creating orphan `/r/` token.

Send tests:

- Sender resolves recipient server-side and sends safe `/r/` link.
- Provider success marks recovery link sent.
- Provider failure marks failed and does not block paid delivery.
- Message contains no report body, raw input, `pa_`, `pcs_`, raw `prl_`, or raw LINE userId.
- Duplicate prevention avoids repeated LINE sends.

Regression tests:

- Email recovery remains unaffected.
- `qa:recovery-link:smoke` remains green.
- `qa:result-checkout:no-card` remains green.

## 11. Production And Staging Gates

Recommended gates:

1. Add schema/helper code only.
2. Apply migration and `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY` to Preview(staging) only.
3. Rerun owner-assisted LINE bind smoke.
4. Run real LINE recovery link smoke to owner test LINE account.
5. Verify `/r/` link opens paid result.
6. Keep production DB/env gated.
7. Do not send production LINE messages until explicit production launch gate.

Production prerequisites:

- production DB migration approval
- production recipient encryption key
- production LINE Messaging API config approval
- rollback/revocation runbook
- support copy and opt-out handling

## 12. Relation To Future Membership

This model does not implement membership.

Future migration path:

- `payment_recovery_contacts` remains report/purchase-level recovery identity.
- `payment_recovery_contact_secrets` remains channel delivery secret storage.
- A future member identity can own or link multiple recovery contacts.
- Report history and purchase history can consolidate identities later.
- Personal Insight Graph can attach to member/report history later without changing v0 recovery semantics.

## 13. Recommended Next Implementation Task

Recommended next task:

- `LINE Recovery Recipient Secret Schema v0`

Why:

- The schema boundary is the blocking decision for real LINE push.
- Once schema/helper storage exists, the existing LIFF bind route can store encrypted recipient secrets.
- The existing LINE sender foundation can then resolve recipient secrets and run a real owner-assisted staging smoke.

Suggested follow-up sequence:

1. `LINE Recovery Recipient Secret Schema v0`
2. `LINE Bind Recipient Secret Implementation v0`
3. `LINE Recovery Link Real Provider Smoke v0`

## 14. Blockers / Uncertainties

- Exact key format should match existing crypto helper conventions, but implementation should confirm before schema work.
- Whether to support key versioning in v0 is undecided; recommended to defer unless implementation cost is low.
- LINE block/unfollow webhook handling is not required for first smoke but should be planned before broad production usage.

## 15. Tech Debt Review

- New technical debt introduced: none; planning only.
- Existing technical debt observed: LINE sender foundation has a future explicit-recipient seam but no persistent secure resolver yet.
- Opportunistic cleanup completed: clarified that real push is blocked by recipient storage, not sender mechanics.
- Deferred cleanup candidates: dedicated recovery LIFF endpoint and shared recovery link URL builder extraction.
