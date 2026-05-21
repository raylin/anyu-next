# LINE Fulfillment Real Staging Test OA Smoke v0 Review Bundle

Date: 2026-05-21

## 1. Summary

Staging LINE fulfillment smoke passed after the public Preview/Staging LINE env sync. Staging returns a non-null staging LIFF URL and the test OA add-friend URL, creates unlock intents with fulfillment code/token metadata, serves the unlocked result route, accepts valid synthetic LIFF binding, rejects invalid binding tokens, rejects unsigned webhook requests, and successfully completes the manual test OA short-code flow.

Manual test OA smoke was completed by the user with sanitized pass status only: the staging test OA webhook worked, the user pasted the fulfillment short code into the staging/test LINE OA, the bot replied with a complete-analysis unlocked URL, opening the URL worked, and the unlocked content was correct.

## 2. Staging Env Verification

- Target: `https://staging.anyu.tw`
- Test OA add-friend URL returned by staging unlock intent: `https://lin.ee/5uL4e9q`
- Staging LIFF URL returned by staging unlock intent: `https://liff.line.me/2010157793-Q4JeeYv0`
- Production OA add-friend URL did not appear in the staging unlock intent response.
- No server secret values were read, printed, or committed.

## 3. Migration Status

Staging Neon branch `br-fragrant-union-aoh4udf1` in project `shy-silence-43729807` has the LINE fulfillment migration shape applied.

Verified `unlock_intents` columns include fulfillment code/token hashes, status/channel, LINE bind metadata, fulfillment expiry, unlock token expiry, delivery attempt metadata, and delivery timestamps.

Verified fulfillment indexes:

- `unlock_intents_fulfillment_code_hash_idx`
- `unlock_intents_fulfillment_token_hash_idx`
- `unlock_intents_fulfillment_status_idx`

## 4. Unlock Intent Verification

Synthetic analyze request succeeded on staging and returned cached result `3e1fa28c-39c7-4bee-bf03-6c46bfa3a083`.

Staging `/api/unlock-intent` then returned:

- `ok: true`
- unlock intent ID `8dcfc2cc-a05b-4dda-bc3a-63ed5de6a9ca`
- fulfillment code present
- unlock token present
- fulfillment expiry present
- staging LIFF URL present
- test OA add-friend URL present

The response did not include production OA routing.

## 5. Fulfillment Panel Verification

The staging result page loaded for the synthetic result. Static HTML confirmed the existing unpaid result page and unlock CTA. The interactive fulfillment panel copy is client-rendered after unlock intent state is requested from the browser; previous automated tests cover the LINE-first fulfillment copy and email fallback behavior.

Expected runtime behavior after client interaction remains:

- LINE is primary fulfillment path.
- Email remains secondary capture-only fallback.
- No real charge is taken in the current fake-door flow.
- Short-code fallback is available through the fulfillment code returned by `/api/unlock-intent`.

## 6. Unlocked Route Verification

Valid unlocked route passed:

- Route: `/m/ambiguous-temperature/unlock/[unlockToken]`
- Result: rendered persisted unlocked content.
- Verified visible sections included complete analysis, deeper signals, three reply styles, and do-not-do guidance.
- No provider call or stack trace was observed.

Invalid unlocked route passed:

- Route used an intentionally invalid token.
- Result: safe invalid-link state.
- No stack trace was observed.

## 7. LIFF Page / Bind Verification

LIFF fulfill page loaded on staging:

- Route: `/m/ambiguous-temperature/line/fulfill`
- Visible state: `LINE 領取`, `正在領取完整分析`, and loading copy.
- Static response did not expose server secrets.

Bind API behavior:

- Invalid unlock token returned `invalid_token`.
- Valid synthetic LIFF bind returned an unlocked staging URL.
- Staging DB row moved to `fulfillment_status = delivered` and `fulfillment_channel = liff`.
- Synthetic LINE user marker was stored on `unlock_intents`, not in event metadata.

## 8. Webhook Route Verification

Unsigned webhook request to `/api/line/webhook` returned:

- `ok: false`
- `error: invalid_signature`

Valid signed synthetic webhook payload was not run because doing so would require direct use of the server-only LINE channel secret. This pass intentionally avoided reading or printing server secrets.

## 9. Real Test OA Short-code Smoke

Status: passed.

Sanitized manual result:

- Staging test OA webhook worked.
- User pasted the fulfillment short code into the staging/test LINE OA.
- Bot replied with the complete-analysis unlocked URL.
- Opening the unlocked URL worked.
- Unlocked content was correct.
- Production was not touched.

No real LINE user ID, code, token, URL with token, raw input, or private message content is recorded in this review bundle.

## 10. Event / Privacy Verification

Queried staging events for synthetic session `line-real-staging-test-oa-smoke-20260521`.

Observed event names:

- `input_submitted`
- `analysis_completed`
- `paid_unlock_clicked`
- `fulfillment_code_shown`
- `fulfillment_liff_bound`
- `fulfillment_link_delivered`

Observed event metadata was limited to safe aggregate and routing fields such as:

- result ID
- unlock intent ID
- fulfillment status
- fulfillment channel
- cache/model/timing metadata from the existing analyze event path

Not observed in event metadata:

- raw input text
- LINE user ID
- fulfillment code
- unlock token
- email
- LINE message text
- provider output
- server secrets

## 11. Known Limitations

- Human-device test OA short-code reply passed on staging.
- LINE console webhook verification is treated as working for the manual staging smoke.
- The static HTML smoke cannot prove the LIFF SDK in-app profile flow; it proves page load and bind API behavior separately.
- The current implementation stores the unlock token in `unlock_intents` as designed for v0; future hardening should avoid storing recoverable tokens when a hash-only verification path is sufficient.
- Webhook duplicate event idempotency remains deferred until real duplicate delivery is observed.

## 12. Recommended Next Step

Staging/test OA fulfillment is ready for ChatGPT/user review before any separate production decision. Do not promote to production without explicit production approval and a separate production smoke plan.
