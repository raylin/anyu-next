# LINE Fulfillment Real Staging Test OA Smoke v0 Review Bundle

Date: 2026-05-21

## 1. Summary

Staging LINE fulfillment route-level smoke passed after the public Preview/Staging LINE env sync. Staging now returns a non-null staging LIFF URL and the test OA add-friend URL, creates unlock intents with fulfillment code/token metadata, serves the unlocked result route, accepts valid synthetic LIFF binding, rejects invalid binding tokens, and rejects unsigned webhook requests.

The actual human-device test OA short-code message smoke was not completed in this pass because the staging setup record still lists LINE console webhook verification as pending and Codex cannot safely send a real LINE app message from the terminal.

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

Status: not completed.

Reason: the staging setup record still marks LINE console webhook verification as pending, and Codex cannot send a human LINE app message to the test OA from the terminal. The route-level webhook protection and LIFF bind path passed, but the end-to-end test OA short-code reply still requires a manual LINE app smoke after webhook verification is confirmed in LINE console.

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

- Human-device test OA short-code reply is still pending.
- LINE console webhook verification status remains pending in the repo setup record.
- The static HTML smoke cannot prove the LIFF SDK in-app profile flow; it proves page load and bind API behavior separately.
- The current implementation stores the unlock token in `unlock_intents` as designed for v0; future hardening should avoid storing recoverable tokens when a hash-only verification path is sufficient.
- Webhook duplicate event idempotency remains deferred until real duplicate delivery is observed.

## 12. Recommended Next Step

Confirm LINE console webhook verification for the test OA, then run one manual LINE app short-code smoke:

1. Open the staging result and generate a fresh fulfillment code.
2. Send that code to `暗語 ANYU Test`.
3. Verify the bot replies with an unlocked staging link.
4. Open the link and confirm the unlocked result renders.
5. Re-query staging event metadata for privacy boundaries.
