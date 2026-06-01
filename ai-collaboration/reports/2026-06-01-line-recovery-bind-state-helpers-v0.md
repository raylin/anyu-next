# LINE Recovery Bind State Helpers v0

Date: 2026-06-01
Task: LINE Recovery Bind State Helpers v0

## Completed Work

- Added server-only LINE recovery bind state helpers in `apps/web/src/lib/line/recovery-bind-state.ts`.
- Added route-ready signed state token creation and resolution for future LIFF recovery binding.
- Added a server-side helper that maps a verified LINE user identity into `payment_recovery_contacts` using the existing hash-only LINE recovery contact service.
- Added targeted tests in `apps/web/src/tests/line-recovery-bind-state.test.ts`.
- Updated the dashboard LINE roadmap from "helpers next" to "helpers implemented; route/callback next".

## Helper / State Shape

The new bind state is purpose-specific for `recovery_line_bind:v1` and contains only safe references:

- `moduleSlug`
- `resultId`
- optional `paymentIntentId`
- optional `entitlementId`
- `source`: `checkout_start`, `paid_ready`, or `completed_result`
- safe relative `returnPath`
- `marketingOptIn`
- `iat` / `exp`
- `nonce`
- `stateId`

It intentionally does not carry raw paid access tokens, checkout session tokens, unlock tokens, short codes, tokenized URLs, raw LINE user IDs, raw Email, provider payloads, source text, or report content.

## Persistence / Signing Choice

Implemented v0 uses a signed short-lived opaque client-carried token with prefix `rlb_`.

- Signing secret: `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`
- Integrity: HMAC-SHA256 over the recovery-specific purpose and encoded payload
- Default TTL: 10 minutes
- Persistence: no new DB table yet

This is the smallest route-ready primitive. A future DB-backed bind-intent table can be added if the LIFF route needs replay tracking, single-use semantics, or support diagnostics.

## LINE Hash Behavior

The bind helper accepts a verified LINE user ID only on the server side and immediately passes it into `createOrUpdateLineRecoveryContact`.

Resulting recovery contact behavior:

- `contact_type=line`
- `contact_hash` and `line_user_hash` use the existing recovery contact keyed hash
- no raw LINE user ID is stored in `payment_recovery_contacts`
- `contact_encrypted` remains `null`
- `email_hash` remains `null`
- source/status/consent fields are copied from the verified bind state

## Bind Helper Behavior

`bindVerifiedLineUserToRecoveryContact` returns sanitized categories only:

- `success`
- `state_invalid`
- `line_user_missing`
- `line_hash_failed`
- `recovery_contact_write_failed`

The helper sets status to `bound` when an entitlement is present in the state, otherwise `verified`. Marketing opt-in remains separate from transactional recovery consent.

## Raw Token Exclusion Guarantees

The helper rejects unsafe return paths and forbidden state values containing:

- `pa_`-style paid access bearer values
- `pcs_`-style checkout session bearer values
- unlock payload markers
- fulfillment code markers
- provider payload markers
- `/unlock/` return paths
- external or protocol-relative return paths

Tests verify that signed state creation/resolution does not expose raw bearer-token examples, raw LINE user IDs, or raw Email values.

## Architecture Decisions

- Reused existing recovery contact hashing and DB helpers instead of legacy LINE fulfillment routes.
- Did not reuse legacy short-code/unlock-token semantics.
- Did not add a public route, LIFF UI, webhook behavior, LINE push, Email sending, or membership.
- Used signed short-lived state now; deferred DB-backed bind-intent persistence until route needs are proven.

## Blockers

- None for this helper-layer task.

## Uncertainties

- Future LIFF route may need single-use state invalidation or a DB-backed bind intent if replay tracking is required.
- Desktop LINE binding UX still needs QR/open-on-phone design.
- Legacy raw LINE ID storage in older unlock infrastructure remains privacy debt and should not be expanded.

## Tech Debt Review

- New technical debt introduced: signed state is not single-use because no server-side persistence exists in v0.
- Existing technical debt observed: legacy LINE fulfillment/unlock flow still contains short-code/link-delivery semantics and raw LINE ID storage.
- Opportunistic cleanup completed: helper returns `state_invalid` rather than throwing when forbidden values are passed during state creation.
- Deferred cleanup candidates: legacy LINE fulfillment containment/retirement after recovery-specific binding is stable.

## Validation

- `cd apps/web && corepack pnpm test -- src/tests/line-recovery-bind-state.test.ts src/tests/payment-recovery-contacts.test.ts`: passed; Vitest ran 66 files / 426 tests.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed; 66 files / 426 tests.
- `cd apps/web && corepack pnpm build`: passed.

## Suggested Next Steps

1. Implement `LINE Recovery Bind Route / LIFF Callback v0` using these helpers.
2. Keep LINE as recovery identity only; do not add LINE paid report delivery.
3. If route-level replay concerns appear, add a DB-backed recovery bind intent table in a separate schema-approved task.
