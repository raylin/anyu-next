# LINE Recovery Bind Recipient Secret Integration v0

Date: 2026-06-03

## Completed Work

- Updated LINE recovery bind helper so successful bind now requires:
  - hash-only `payment_recovery_contacts` LINE row
  - encrypted `payment_recovery_contact_secrets` recipient secret row
- Preserved hash-only LINE identity in `payment_recovery_contacts`.
- Added safe failure handling for recipient secret write/config failures.
- Updated route and helper tests to verify recipient secret creation and sanitized responses.
- Ran local validation and staging regression QA.

## Route Integration Behavior

Route:

- `POST /api/line/recovery/bind-liff`

Flow after verified LIFF `idToken`:

1. Resolve and validate `rlb_` recovery state.
2. Verify LINE identity server-side.
3. Create/update hash-only `payment_recovery_contacts` row with:
   - `contact_type=line`
   - `contact_hash`
   - `line_user_hash`
   - transactional consent
   - source from state
   - `verified` or `bound` status
4. Create/update encrypted `payment_recovery_contact_secrets` row linked by `recovery_contact_id`.
5. Return sanitized success with recovery contact status and safe return path.

Response does not include:

- raw LINE userId
- encrypted recipient
- recipient hash
- raw `pa_`, `pcs_`, or `prl_`
- LIFF `idToken`

## Recipient Secret Write Behavior

On success, the helper stores:

- `channel=line`
- `purpose=recovery_link_delivery`
- `encrypted_recipient`
- `recipient_hash`
- `status=active`
- `key_version=v1`

The raw LINE userId exists only in process memory during verification/encryption and is not returned in helper/route output.

## Failure Behavior

Safe failure categories:

- `state_invalid`
- `state_expired`
- `line_user_missing`
- `line_hash_failed`
- `recovery_contact_write_failed`
- `recipient_secret_write_failed`
- `success`

If the contact row is created/updated but recipient secret write fails:

- route returns `bind_failed`
- `bindCategory=recipient_secret_write_failed`
- safe return path points back with `lineRecovery=line_error`
- checkout/report access is not blocked
- Email fallback remains available
- no raw LINE ID, encrypted recipient, or recipient hash is returned

The route does not claim LINE save is complete unless recipient secret storage succeeds.

## Idempotency Behavior

- Existing recovery contact upsert behavior is preserved.
- Recipient secret helper updates an existing active secret by `recovery_contact_id + channel + purpose`.
- The unique active secret index prevents duplicate active recipient secrets.
- Marketing opt-in remains separate from transactional recovery consent.

## Tests / Validation

- `cd apps/web && corepack pnpm test -- src/tests/line-recovery-bind-state.test.ts src/tests/line-recovery-bind-route.test.ts src/tests/payment-recovery-contact-secrets.test.ts src/tests/line-recovery-link.test.ts src/tests/line-route-hardening.test.ts`: passed
- `cd apps/web && corepack pnpm lint`: passed
- `cd apps/web && corepack pnpm test`: passed
- `cd apps/web && corepack pnpm build`: passed
- `cd apps/web && corepack pnpm run qa:recovery-link:smoke`: passed against currently deployed Preview(staging) commit `0402797509a2`
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`: passed against currently deployed Preview(staging) commit `0402797509a2`

Note:

- Staging regression QA ran before this integration commit was deployed. It verifies no regression in the currently deployed staging flow.
- Owner-assisted LINE mobile bind smoke must be rerun after this commit is deployed to Preview(staging).

## Staging LINE Bind Smoke

Status: pending owner-assisted retry after deployment.

Reason:

- The required mobile LINE account/LIFF action cannot be completed from this CLI session.
- The integration is locally validated and staging DB/env are ready.

Expected verification after deploy:

- `payment_recovery_contacts` row exists with `contact_type=line`, transactional consent, expected source, and `verified`/`bound`.
- `payment_recovery_contact_secrets` row exists linked to the recovery contact with `channel=line`, `purpose=recovery_link_delivery`, `status=active`, and `key_version=v1`.
- Encrypted recipient and recipient hash are present but not printed.
- Raw LINE userId is not stored in `payment_recovery_contacts`.
- No LINE messages are sent.

## Production Safety

- Production payment runtime was not enabled.
- Production env was not modified.
- Production DB migration was not applied.
- No LINE messages were sent.
- No Email was sent.
- Payment provider behavior was not changed.
- Production fail-closed checks passed through no-card/recovery-link QA.

## Tech Debt Review

- New technical debt introduced: owner-assisted staging LINE bind smoke remains pending until this commit deploys.
- Existing technical debt observed: real LINE push remains blocked until a post-integration smoke proves recipient secret creation and sender resolves it.
- Opportunistic cleanup completed: centralized contact+recipient secret bind in `bindVerifiedLineUserToRecoveryContact`.
- Deferred cleanup candidates: add a sanitized DB verification helper for LINE recipient secret rows after owner-assisted smoke.

## Recommended Next Task

`LINE Recovery Bind Recipient Secret Staging Smoke v0`

Then, if it passes:

`LINE Recovery Link Real Message Smoke v0`
