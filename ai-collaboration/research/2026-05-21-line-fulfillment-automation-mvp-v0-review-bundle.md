# LINE Fulfillment Automation MVP v0 Review Bundle

Date: 2026-05-21

## 1. Summary

Implemented the first LINE fulfillment MVP for Module 01. A user who clicks unlock now receives a fulfillment code/token payload from `/api/unlock-intent`, sees fulfillment-oriented LINE copy, can enter a LIFF bridge path, and has a short-code LINE webhook fallback that can reply with an unlocked result link.

No real payment, email delivery, rich menu, broadcast, portal/account system, new LLM generation, model switch, or legal semantic change was implemented.

## 2. Architecture Used

- LIFF is the mobile-primary path.
- Short code sent to LINE OA is the desktop/fallback path.
- `unlock_intents` was extended instead of adding a separate fulfillment table.
- `/m/[moduleSlug]/unlock/[unlockToken]` is the canonical unlocked result route.
- Unlocked content renders persisted `analysis_results.normalizedResultJson.paid_result`; no provider call is made.
- LINE configuration is read from env only.

## 3. Schema / Migration Changes

Added `apps/web/drizzle/0003_line_fulfillment.sql`.

`unlock_intents` now supports fulfillment state:

- code hash
- token and token hash
- fulfillment status
- fulfillment channel
- LINE user ID
- bind / fulfilled / expiry timestamps
- delivery attempt metadata

Implementation stores the high-entropy unlock token because the LINE webhook short-code path must reconstruct and send the unlocked route after matching a code. The token is also hashed for lookup/validation.

## 4. Routes / APIs Added

- `POST /api/unlock-intent`: now creates fulfillment code/token and returns public fulfillment panel data.
- `POST /api/line/fulfillment/bind-liff`: binds a LIFF user to an unlock intent and returns the unlocked URL.
- `POST /api/line/webhook`: verifies LINE signature, handles follow events, matches short-code text messages, and replies with a link.
- `GET /m/[moduleSlug]/line/fulfill`: LIFF bridge page.
- `GET /m/[moduleSlug]/unlock/[unlockToken]`: unlocked result route.

## 5. LIFF Path

The fulfillment panel opens the env-provided LIFF URL with `unlockIntentId`, `unlockToken`, and fallback code query params. The LIFF bridge loads the LINE LIFF SDK, initializes with `NEXT_PUBLIC_LINE_LIFF_ID`, requests login when needed, obtains the LINE profile user ID, calls the bind API, and redirects to the unlocked route.

## 6. Short-code Fallback Path

Unlock intent creation generates a short code and 30-minute expiry. The contact panel displays the fallback code. The LINE webhook verifies the LINE signature, normalizes text messages into short-code shape, matches the code hash, binds the LINE user ID, and replies with the unlocked result link.

Unsupported message types are ignored safely. Invalid or expired codes receive safe recovery copy.

## 7. Unlocked Result Route

The unlocked route validates the token hash, checks expiry, loads the associated persisted result, and renders the paid result sections:

- deeper signal analysis
- possible interpretation
- reply strategies
- risk warning
- what not to do

The route does not require auth in v0 and does not expose raw input.

## 8. Copy Changes

The contact panel changed from notification-oriented copy to fulfillment-oriented copy:

- primary CTA: `用 LINE 領取完整分析`
- support copy: internal-test/no-charge promise plus complete-analysis link delivery
- fallback copy: short-code instructions

Email fallback remains secondary and capture-only.

## 9. Security / Privacy

Implemented:

- LINE webhook signature verification
- server-only channel access token use
- short-code expiry
- high-entropy unlock token
- token hash validation
- idempotent-ish fulfillment updates for repeated valid actions
- safe invalid/expired code replies
- no LINE display name/profile image storage
- no arbitrary LINE message text persistence
- event metadata guard now rejects email, LINE message text, provider output, token, and secret-like keys

LINE replies send links, not raw analysis text.

## 10. Events / Metrics

Added safe event names:

- `fulfillment_liff_opened`
- `fulfillment_liff_bound`
- `fulfillment_code_shown`
- `fulfillment_code_matched`
- `fulfillment_link_delivered`
- `fulfillment_failed`
- `line_webhook_received`

Implemented event writes for code shown, LIFF bound, link delivered, webhook received, code matched, and failed delivery where route context exists.

## 11. Tests Added

Added `apps/web/src/tests/line-fulfillment.test.ts` for:

- code generation and shape
- code normalization
- token generation and hashing
- expiration windows
- LIFF URL building
- LINE webhook signature verification

Updated tests for:

- fulfillment-oriented contact copy
- safe event metadata keys
- new fulfillment event names
- Playwright LINE panel CTA copy

## 12. Staging Smoke

Not run from this workspace.

Reason: the new migration and routes must first be deployed to staging and `apps/web/drizzle/0003_line_fulfillment.sql` must be applied to the staging database. The setup records indicate LINE/Vercel env status is configured, but the implementation is not live until this commit is deployed and migrated.

Required staging smoke after deploy:

- apply migration to staging DB
- create synthetic result
- click unlock and confirm code/token payload
- confirm LIFF page loads
- confirm webhook rejects invalid signature
- test one valid short-code reply with test OA
- open unlocked route
- scan events/logs for raw input, message text, email, tokens, or secrets

## 13. Production Smoke

Not run.

Reason: production smoke requires explicit production deployment/migration approval after staging smoke passes. This task only pushed to `origin/staging`.

## 14. Known Limitations

- LIFF bind currently uses LIFF client profile user ID from the browser after LIFF login; a later hardening pass should validate ID tokens server-side if the LINE channel setup supports it cleanly.
- The short-code webhook stores the high-entropy unlock token so it can reply with the unlocked link after code matching.
- Delivery attempt count is incremented only on reply attempts, not every invalid code message.
- No rate limiter was added to the webhook in this MVP.
- Email fallback remains capture-only.
- No live LINE smoke was completed before commit.

## 15. Recommended Next Step

Deploy this commit to staging, apply `0003_line_fulfillment.sql` to the staging database, and run the staging test OA smoke before any production promotion or ad/growth work.
