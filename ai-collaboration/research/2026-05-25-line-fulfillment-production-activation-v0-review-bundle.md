# LINE Fulfillment Production Activation v0 Review Bundle

Date: 2026-05-25

## 1. Summary

Production LINE fulfillment was activated at the app/database level and verified with a narrow synthetic production smoke. Production database migrations `0003_line_fulfillment.sql` and `0004_line_webhook_hardening.sql` were applied to the Neon production branch, the current approved app was deployed to production, and production unlock flow returned the production LIFF and production OA add-friend config.

Real production OA short-code smoke was not run because the repo setup record still marks LINE Console webhook verification / linked bot status as pending.

## 2. Production Env Status

- Required production env names are present in Vercel Production:
  - `LINE_CHANNEL_SECRET`
  - `LINE_CHANNEL_ACCESS_TOKEN`
  - `NEXT_PUBLIC_LINE_LIFF_ID`
  - `NEXT_PUBLIC_LINE_LIFF_URL`
  - `NEXT_PUBLIC_LINE_ADD_URL`
- Server secret values were not printed or recorded.
- Public production values were verified:
  - `NEXT_PUBLIC_LINE_LIFF_ID`: `2009959232-LhxoYMDV`
  - `NEXT_PUBLIC_LINE_ADD_URL`: `https://lin.ee/oX0rbiTf`
  - `NEXT_PUBLIC_LINE_LIFF_URL`: production LIFF URL for the same LIFF ID.
- Vercel env pull still produced an empty `DATABASE_URL` in the safe local pull path, matching the previously documented safe-probe inconsistency. Direct Neon production branch tools were used for schema verification and migrations.

## 3. Production Migration Status

- `0003_line_fulfillment.sql`: applied to Neon production branch.
- `0004_line_webhook_hardening.sql`: applied to Neon production branch.
- Verified production objects:
  - fulfillment columns on `unlock_intents`
  - fulfillment indexes on `unlock_intents`
  - `line_webhook_events`
  - `line_webhook_rate_limits`
  - webhook dedupe/status/rate-limit indexes

## 4. Production Deployment

- Production deployment completed.
- Deployment ID: `dpl_BoBThbexLN1dSCgFFfV7ewg6ugCu`
- Deployment URL: `https://anyu-next-ohdzb6y8w-studioanyu-1488s-projects.vercel.app`
- Production alias: `https://anyu.tw`
- Candidate commit: `974881f`

## 5. Public Env Verification

- Production unlock intent returned a non-null LIFF URL.
- LIFF URL used production LIFF ID `2009959232-LhxoYMDV`.
- LINE add URL pointed to production OA `https://lin.ee/oX0rbiTf`.
- No staging/test OA URL was observed in the production unlock response.

## 6. Analyze / Paid Result Verification

- Synthetic production analyze completed successfully.
- Result route returned HTTP 200.
- Paid preview was visible on the result page.
- The smoke did not use real private user input.

## 7. Unlock Intent Verification

- Unlock intent returned success.
- Fulfillment code was present.
- Unlock token was present.
- Fulfillment expiration was present.
- Code/token/tokenized URL were not recorded in repo artifacts.

## 8. Unlocked Route Verification

- Synthetic unlocked route returned HTTP 200.
- Rich unlocked content was visible.
- Tokenized unlocked URL was not recorded in repo artifacts.

## 9. LIFF Page / Bind Verification

- Production LIFF fulfill page returned HTTP 200.
- Production LIFF page showed the LINE fulfillment loading state.
- LIFF bind route rejected missing ID token.
- LIFF bind route rejected invalid ID token.
- In-app LIFF ID token smoke was not run.

## 10. Webhook Verification

- Production webhook route rejected invalid signature with HTTP 401.
- No LINE channel secret was read, printed, or used directly.

## 11. Real Production OA Short-code Smoke

- Not run.
- Reason: production setup record still marks LINE Console webhook verification / linked bot status as pending.
- Activation should be treated as app/database activated and route-smoke verified, not fully end-to-end OA verified.

## 12. Event / Privacy Verification

- Recent production event metadata keys were reviewed.
- No forbidden metadata keys were observed in recent smoke events.
- Observed safe metadata keys included result/request IDs, unlock intent ID, channel, status, model/timing flags, and context-count booleans/counts.
- No raw input, LINE user ID, LINE display name, message text, fulfillment code, unlock token, tokenized URL, email, secret name values, full result JSON, or provider output was recorded in repo artifacts.

## 13. Known Limitations

- Vercel production env pull still exposes an empty `DATABASE_URL` through the safe local pull path even though production runtime smoke and direct Neon tools worked.
- Real production OA short-code smoke remains pending until LINE Console webhook verification / linked bot status is confirmed.
- Retention cleanup for `line_webhook_events` and `line_webhook_rate_limits` is deferred unless volume grows.

## 14. Recommended Next Step

Manually verify LINE Console production webhook status and linked bot, then run one real production OA short-code smoke with an operator-owned LINE account.
