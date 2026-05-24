# LINE Fulfillment Hardening Staging Smoke v0 Review Bundle

Date: 2026-05-24

## 1. Summary

Staging-only hardening smoke passed for the checks that can be run safely from shell without server secrets or a human LINE app action. Staging is serving the hardened LIFF bind behavior from commit `7d17a26` or newer, the staging DB has the `0004` hardening objects, public LINE env still points to the staging/test OA assets, unlock intent generation works, the unlocked route renders complete-analysis content, missing/client-only LIFF identity is rejected, invalid ID token is rejected, and invalid webhook signatures are rejected.

Production was not touched.

## 2. Staging Deployment Freshness

No explicit commit/build marker is exposed by the app. Freshness was verified through hardened route behavior:

- client-only `liffUserId` payload is rejected before DB binding
- invalid `idToken` payload is rejected with `invalid_line_identity`
- staging webhook still rejects unsigned requests with `invalid_signature`

This proves staging is serving the hardened bind route from `7d17a26` or newer.

## 3. Migration Status

Staging Neon branch `br-fragrant-union-aoh4udf1` has the expected `0004` objects:

- `line_webhook_events`
- `line_webhook_rate_limits`

Verified indexes:

- `line_webhook_events_dedupe_key_idx`
- `line_webhook_events_status_idx`
- `line_webhook_rate_limits_user_idx`
- `line_webhook_rate_limits_window_idx`

Production migration was not run.

## 4. Public Env Verification

Staging `/api/unlock-intent` returned:

- non-null LIFF URL using staging LIFF ID `2010157793-Q4JeeYv0`
- test OA add-friend URL `https://lin.ee/5uL4e9q`

Production OA URL did not appear in the staging response.

## 5. Existing Fulfillment Verification

Synthetic staging analyze completed and produced a staging result.

Unlock intent generation passed:

- fulfillment code present
- unlock token present
- fulfillment expiry present
- staging LIFF URL present
- test OA add-friend URL present

Valid unlocked route passed and rendered complete-analysis content, including the unlocked reply strategy and guardrail sections.

## 6. LIFF Bind Hardening Verification

Passed:

- client-only `liffUserId` payload is rejected with `invalid_input`
- invalid `idToken` payload is rejected with `invalid_line_identity`
- failed LIFF bind attempts did not bind a LINE user to the unlock intent

Valid live ID token behavior was not testable from shell because it requires a real LIFF runtime token issued inside the LINE/LIFF context.

## 7. Webhook Signature Verification

Unsigned webhook request to staging `/api/line/webhook` returned `invalid_signature`.

Valid signed webhook payload was not run because this smoke intentionally did not read, print, or handle `LINE_CHANNEL_SECRET`.

## 8. Webhook Idempotency Verification

Live signed duplicate webhook delivery was not run because it requires `LINE_CHANNEL_SECRET`.

Verification coverage:

- staging DB has the durable dedupe table and indexes
- automated route tests cover duplicate event behavior
- duplicate events are expected to return safe 200 and skip duplicate replies/mutations

## 9. Invalid-code Rate Guard Verification

Live signed invalid-code rate guard was not run because it requires `LINE_CHANNEL_SECRET`.

Verification coverage:

- staging DB has the durable rate-limit table and indexes
- automated route tests cover invalid-code cooldown behavior
- rate-limit storage is keyed by hashed LINE user ID and does not store raw message text or short codes

## 10. Manual Test OA Smoke

Not run in this pass. Previous manual staging/test OA short-code smoke already passed and was recorded. This pass focused on route-level hardening verification after deployment.

## 11. Event / Privacy Verification

Queried staging events for the synthetic smoke session.

Observed event metadata was limited to safe fields such as:

- request/result IDs
- unlock intent ID
- status
- channel
- cache/model/timing metadata

Not observed in event metadata:

- LINE user ID
- LINE display name
- LINE message text
- fulfillment code
- unlock token
- tokenized URL
- raw input
- redacted input text
- email
- full result JSON
- provider output
- server secrets

## 12. Known Limitations

- Recoverable unlock token storage remains from the fulfillment MVP design.
- Webhook dedupe/rate-limit rows do not yet have a dedicated cleanup policy.
- Valid live LIFF ID token success requires a real LIFF runtime/manual test.
- Production migration and activation remain pending separate explicit approval.

## 13. Recommended Next Step

Run one manual staging LIFF in-app smoke from LINE to confirm a real ID token binds successfully, then decide whether to prepare a separate production migration and production fulfillment smoke plan. Production remains blocked until explicitly approved.
