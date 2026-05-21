# LINE Fulfillment Staging Deploy + Smoke v0 Review Bundle

Date: 2026-05-21

## 1. Summary

Staging smoke partially passed. The implementation commit `58f9f94` is present locally and `staging.anyu.tw` is serving the new LINE fulfillment routes. The staging Neon preview branch migration `0003_line_fulfillment.sql` was applied and verified.

Core app behavior verified:

- synthetic analyze succeeded
- unlock intent created fulfillment fields
- valid unlocked route loaded persisted paid-result content
- invalid unlocked route showed a safe error state
- LIFF bridge page route loaded
- LIFF bind API accepted a valid synthetic payload and returned an unlocked URL
- webhook rejected an invalid signature
- event metadata for the smoke session was privacy-safe

Blocking issue before real test-OA smoke:

- live staging unlock response returned `liffUrl: null`
- live staging unlock response returned the old production OA add-friend URL instead of the staging/test OA URL

This indicates Vercel Preview/Staging public LINE env is not aligned with the setup record or was not active in the deployed build.

## 2. Staging Deployment

Status: partially verified.

Evidence:

- `https://staging.anyu.tw/api/health` returned `200`.
- `https://staging.anyu.tw/m/ambiguous-temperature/line/fulfill` rendered the new LIFF bridge page.
- `https://staging.anyu.tw/api/line/webhook` returned `invalid_signature` for an unsigned request.
- `https://staging.anyu.tw/m/ambiguous-temperature/unlock/[token]` rendered the new unlocked route.

Limitations:

- Vercel CLI is not installed on PATH in this shell, so exact deployment metadata / commit inspection was not available.
- Route freshness confirms the new implementation is deployed, but exact deployment commit was not directly inspected.

## 3. Migration Status

Status: passed.

Applied `apps/web/drizzle/0003_line_fulfillment.sql` to Neon project `shy-silence-43729807`, branch `br-fragrant-union-aoh4udf1` (`preview`) only.

Verified new `unlock_intents` columns:

- `fulfillment_code_hash`
- `fulfillment_token`
- `fulfillment_token_hash`
- `fulfillment_status`
- `fulfillment_channel`
- `line_user_id`
- `line_bound_at`
- `fulfilled_at`
- `fulfillment_expires_at`
- `unlock_token_expires_at`
- `delivery_attempt_count`
- `last_delivery_error`
- `last_delivery_at`

Verified new indexes:

- `unlock_intents_fulfillment_code_hash_idx`
- `unlock_intents_fulfillment_status_idx`
- `unlock_intents_fulfillment_token_hash_idx`

Production migration was not run.

## 4. Env / Setup Status

Setup docs say staging/test OA and LIFF are configured, but live staging behavior disagrees.

Observed from live `/api/unlock-intent` response:

- fulfillment code: present
- fulfillment expiry: present
- unlock token: present
- `liffUrl`: missing / null
- `lineAddUrl`: old production OA URL

Conclusion:

- `LINE_CHANNEL_SECRET` and `LINE_CHANNEL_ACCESS_TOKEN` appear sufficient for route behavior that does not require successful LINE reply.
- `NEXT_PUBLIC_LINE_LIFF_URL` is missing or not active in the staging deployment.
- `NEXT_PUBLIC_LINE_ADD_URL` is pointed at the wrong OA for staging.
- `NEXT_PUBLIC_LINE_LIFF_ID` could not be fully verified because the LIFF URL was not emitted from unlock intent.

Updated setup docs to mark staging public LINE env as `unknown` / `mismatch` pending Vercel Preview env correction and redeploy.

## 5. Unlock Intent Verification

Status: passed with env caveat.

Synthetic analyze returned a completed result. Posting to `/api/unlock-intent` returned:

- `unlockIntentId`
- `fulfillmentCode`
- `fulfillmentExpiresAt`
- `unlockToken`
- `lineAddUrl`

Database verification showed the unlock intent has:

- delivery status `delivered` after synthetic LIFF bind
- channel `liff`
- LINE user marker present
- code hash present
- token hash present
- code expiry present
- token expiry present

Env caveat:

- `liffUrl` was null.
- `lineAddUrl` was not the staging/test OA URL.

## 6. Fulfillment Panel Verification

Status: partially verified.

Route/source freshness and local Playwright confirm the new panel copy:

- primary CTA: `用 LINE 領取完整分析`
- Email fallback remains available
- short-code fallback is implemented

Live staging panel end-to-end via browser click was not completed in this shell. The API payload that powers the panel generated the short-code fields, but public LINE env mismatch would prevent the intended LIFF CTA from working correctly on staging.

## 7. Unlocked Route Verification

Status: passed.

Valid token:

- `/m/ambiguous-temperature/unlock/[unlockToken]` loaded persisted paid-result content.
- Rendered complete-analysis sections from existing result data.
- No provider call was required.

Invalid token:

- `/m/ambiguous-temperature/unlock/invalid-token-smoke` rendered a safe recovery state.
- No stack trace was exposed.

## 8. LIFF Page / Bind Verification

Status: partial pass.

LIFF page:

- `/m/ambiguous-temperature/line/fulfill` loaded and rendered the LIFF bridge shell.

Bind API:

- invalid token was rejected with a safe `invalid_token` response.
- valid synthetic payload returned an unlocked URL.
- database status updated to delivered via `liff`.

Limitations:

- Real LIFF SDK flow was not completed from this shell.
- Server-side ID token verification remains a known hardening item.
- Public staging LIFF URL env is not active, so the panel cannot currently emit the staging LIFF URL.

## 9. Webhook Verification

Status: partial pass.

Verified:

- unsigned request to `/api/line/webhook` returned `invalid_signature`.

Not verified:

- valid signed webhook payload.
- real test OA short-code reply.

Reason:

- the shell does not have access to `LINE_CHANNEL_SECRET`, and Vercel CLI is not available to run an env-context smoke without printing secrets.

## 10. Test OA Short-code Smoke

Status: not run.

Blocking reason:

- staging public env mismatch means the user-facing LINE handoff points at the wrong OA and emits no LIFF URL.
- valid signed webhook smoke requires LINE Console/test OA interaction or a secret-backed signing context not available in this shell.

Pending manual action:

- fix Vercel Preview env so staging points to test OA + staging LIFF
- redeploy staging
- open the test OA
- send a generated short code
- confirm bot replies with unlocked link
- open link and confirm unlocked result

## 11. Event / Privacy Verification

Status: passed for automated smoke session.

Queried staging Neon events for the synthetic smoke session. Observed fulfillment events:

- `fulfillment_code_shown`
- `fulfillment_liff_bound`
- `fulfillment_link_delivered`
- `paid_unlock_clicked`

Observed metadata contained only safe fields such as:

- `resultId`
- `unlockIntentId`
- `channel`
- `status`
- model/cache/timing metadata from existing analyze events

No raw input, LINE message text, email, LINE display name, full result JSON, provider output, database URL, LINE secrets, cache secret, or retention secret was observed in the smoke-session event metadata.

## 12. Known Limitations

- Vercel CLI is unavailable on PATH, so exact deployment inspection and env-context route calls could not be performed.
- Staging public LINE env is mismatched or stale.
- Real test OA short-code smoke is pending.
- Valid signed webhook payload was not tested.
- LIFF server-side ID token verification remains a known hardening item.
- Webhook rate limiting and duplicate LINE event idempotency remain deferred hardening items.

## 13. Recommended Next Step

Fix Vercel Preview/Staging env:

- set `NEXT_PUBLIC_LINE_ADD_URL` to the test OA add-friend URL
- set `NEXT_PUBLIC_LINE_LIFF_URL` to the staging LIFF URL
- verify `NEXT_PUBLIC_LINE_LIFF_ID`
- redeploy staging so public env is baked into the build

Then rerun a narrow staging test OA smoke covering LIFF URL emission, real short-code LINE reply, and unlocked link open.
