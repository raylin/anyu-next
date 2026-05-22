# LIFF ID Token Verification + Webhook Hardening v0 Review Bundle

Date: 2026-05-21

## 1. Summary

Hardened LINE fulfillment before production activation. LIFF bind now requires server-side LINE ID token verification, webhook processing now has database-backed duplicate event protection, invalid short-code attempts are rate-guarded, and event metadata guards were strengthened to reject LINE identity, code, token, URL, raw text, contact, provider-output, and secret-like metadata keys.

Production was not activated, deployed, smoked, or migrated.

## 2. LIFF Verification Design

- The LIFF bridge now sends `idToken` from `liff.getIDToken()`.
- The bind API no longer accepts a client-provided `liffUserId` as identity proof.
- The server verifies the ID token through LINE's verify endpoint.
- The expected LINE Login channel ID comes from optional `LINE_LOGIN_CHANNEL_ID`, falling back to the numeric prefix of `NEXT_PUBLIC_LINE_LIFF_ID`.
- The verified LINE token subject is the only value stored in `unlock_intents.line_user_id`.
- Display name and profile picture are not requested or stored.

## 3. Env / Config Changes

Added optional env support:

- `LINE_LOGIN_CHANNEL_ID`

If unset, the implementation derives the channel ID from `NEXT_PUBLIC_LINE_LIFF_ID`.

No secret values were added to docs or committed. Existing server secrets remain server-only.

## 4. Webhook Idempotency

Added `line_webhook_events` for durable event dedupe.

Behavior:

- Uses LINE `webhookEventId` when present.
- Falls back to a hashed derived key from event type, timestamp, and reply token hash.
- Duplicate events return 200 safely and are ignored.
- Duplicate events do not trigger a second reply or mutate fulfillment state again.

## 5. Webhook Abuse Guard

Added `line_webhook_rate_limits` for invalid short-code attempts.

Behavior:

- Tracks invalid attempts by hashed LINE user ID.
- Uses a 10-minute window.
- Allows up to 5 invalid attempts before returning a cooldown reply.
- Does not store raw message text or fulfillment short code.

## 6. Privacy / Event Metadata

Strengthened the event metadata guard to reject:

- LINE user ID
- display name
- message text
- fulfillment code
- unlock token
- tokenized URL
- raw input / redacted input
- email
- provider output
- database URL / LINE channel secrets / cache and cleanup secrets

Allowed fulfillment metadata remains limited to safe routing and aggregate fields such as result ID, unlock intent ID, channel, status, error code, dedupe status, and rate-limited boolean.

## 7. Schema / Migration Changes

Created `apps/web/drizzle/0004_line_webhook_hardening.sql`.

Tables:

- `line_webhook_events`
- `line_webhook_rate_limits`

Staging Neon branch `br-fragrant-union-aoh4udf1` was migrated and verified to contain both tables. Production migration was not run and remains a separate approval step.

## 8. Tests Added

Added/updated tests for:

- LINE ID token verification helper.
- LINE Login channel ID derivation.
- LIFF bind rejecting client-only user ID.
- LIFF bind using verified LINE token subject.
- webhook duplicate event idempotency.
- invalid-code rate limiting.
- safe webhook dedupe key derivation.
- metadata guard rejection of LINE/code/token/URL/secret-like fields.

## 9. Staging Verification

Staging database migration was applied and verified for the two new hardening tables.

Live staging invalid-signature webhook smoke still returns `invalid_signature`. Live route-level verification of the new deployed ID-token, dedupe, and rate-guard behavior is pending a fresh staging deployment from this commit. Local route tests cover the new behavior before push.

## 10. Production Activation Impact

Before production LINE fulfillment activation:

- Deploy this hardening commit.
- Apply `apps/web/drizzle/0004_line_webhook_hardening.sql` to production only after explicit approval.
- Confirm production LINE Login channel ID is either derivable from LIFF ID or set through `LINE_LOGIN_CHANNEL_ID`.
- Re-run production LINE smoke as a separate, approved workflow.

## 11. Known Limitations

- Real LINE ID token verification requires a real LIFF runtime token and cannot be fully exercised from shell.
- Duplicate fallback key is best-effort when LINE does not provide `webhookEventId`.
- The invalid-attempt guard is simple and per hashed LINE user ID, not a full abuse-prevention system.
- Recoverable unlock token storage remains from the MVP design.

## 12. Recommended Next Step

Push this hardening commit to staging, wait for staging deployment, then run staging route-level smoke for missing/invalid LIFF ID token rejection, webhook duplicate handling, and invalid-code rate guard. Production remains blocked until a separate production migration and smoke are approved.
