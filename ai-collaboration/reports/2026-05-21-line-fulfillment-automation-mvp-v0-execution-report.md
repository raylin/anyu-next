# LINE Fulfillment Automation MVP v0 Execution Report

## Summary

Implemented the LINE fulfillment automation MVP for Module 01. The app now creates fulfillment codes/tokens on unlock intent, exposes a LIFF bridge, supports a LINE webhook short-code fallback, and renders persisted paid-result content through an unlocked route.

## Files Created

- `ai-collaboration/handoffs/2026-05-21-line-fulfillment-automation-mvp-v0-handoff.md`
- `ai-collaboration/research/2026-05-21-line-fulfillment-automation-mvp-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-21-line-fulfillment-automation-mvp-v0-execution-report.md`
- `apps/web/drizzle/0003_line_fulfillment.sql`
- `apps/web/src/app/api/line/fulfillment/bind-liff/route.ts`
- `apps/web/src/app/api/line/webhook/route.ts`
- `apps/web/src/app/m/[moduleSlug]/line/fulfill/page.tsx`
- `apps/web/src/app/m/[moduleSlug]/unlock/[unlockToken]/page.tsx`
- `apps/web/src/lib/line/config.ts`
- `apps/web/src/lib/line/fulfillment.ts`
- `apps/web/src/lib/line/webhook.ts`
- `apps/web/src/tests/line-fulfillment.test.ts`

## Files Updated

- `apps/web/src/app/api/unlock-intent/route.ts`
- `apps/web/src/components/anyu/ContactCapture.tsx`
- `apps/web/src/components/modules/ai-temperature/AiTemperatureResult.tsx`
- `apps/web/src/lib/db/runtime.ts`
- `apps/web/src/lib/db/schema.ts`
- `apps/web/src/lib/events/types.ts`
- `apps/web/src/lib/modules/ai-temperature-ui.ts`
- `apps/web/src/styles/globals.css`
- `apps/web/src/tests/ai-temperature-ui.test.ts`
- `apps/web/src/tests/contact-capture.test.tsx`
- `apps/web/src/tests/event-metadata.test.ts`
- `apps/web/e2e/line-funnel.spec.ts`
- `apps/web/e2e/module-01-smoke.spec.ts`
- `apps/web/README.md`
- `docs/operations/production-deployment-runbook.md`
- `ai-collaboration/research/line/line-fulfillment-env-matrix.md`
- `ai-collaboration/research/line/line-oa-staging-setup.md`
- `ai-collaboration/research/line/line-oa-production-setup.md`
- `ai-collaboration/summaries/summary_log.md`
- `apps/web/drizzle/meta/_journal.json`

## Schema / Migration Changes

Added `0003_line_fulfillment.sql` to extend `unlock_intents` with fulfillment code/token, fulfillment status/channel, LINE user binding, expiry timestamps, and delivery metadata.

The implementation stores a high-entropy token plus token hash. The plaintext token is needed for the LINE webhook short-code path to reply with the unlocked URL after code matching.

## Routes / APIs

- `POST /api/unlock-intent` now returns fulfillment data for the panel.
- `POST /api/line/fulfillment/bind-liff` binds LIFF identity and returns unlocked URL.
- `POST /api/line/webhook` verifies signatures and handles follow/message events.
- `GET /m/[moduleSlug]/line/fulfill` handles LIFF client flow.
- `GET /m/[moduleSlug]/unlock/[unlockToken]` renders persisted paid-result content.

## UI / Copy Changes

- Updated the contact panel to `用 LINE 領取完整分析`.
- Added short-code fallback display.
- Kept Email fallback secondary and capture-only.

## LINE / LIFF Integration

- Uses `NEXT_PUBLIC_LINE_LIFF_ID` and `NEXT_PUBLIC_LINE_LIFF_URL` from env.
- Uses `LINE_CHANNEL_SECRET` and `LINE_CHANNEL_ACCESS_TOKEN` server-side only.
- Does not hard-code staging or production LINE IDs/URLs in app code.

## Security / Privacy

- LINE webhook signature verification implemented.
- Short-code expiry is 30 minutes.
- Unlock token expiry is 24 hours.
- No LINE display name/profile image storage.
- No arbitrary LINE message text persistence.
- LINE replies send links, not raw analysis text.
- Event metadata guard now blocks email, message text, token, secret, and provider-output keys.

## Tests Added

- Added LINE fulfillment helper tests.
- Updated contact copy tests.
- Updated event metadata tests.
- Updated Playwright copy expectations.

## Validation Results

- Passed: `python3 -m compileall oradar`
- Passed: `python3 -m compileall tools/topic-ingestion`
- Passed: `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` (25 tests)
- Passed: `cd apps/web && corepack pnpm lint`
- Passed: `cd apps/web && corepack pnpm test` (23 files / 85 tests)
- Passed: `cd apps/web && corepack pnpm build`
- Passed: `cd apps/web && corepack pnpm test:e2e:local` (9 Playwright tests)

## Staging Smoke

Not run.

Reason: staging must first receive this commit and the `0003_line_fulfillment.sql` migration. After deploy/migration, test OA smoke should verify LIFF page load, webhook signature rejection, short-code reply, unlocked route, and event privacy.

## Production Smoke

Not run.

Reason: production smoke requires explicit production deploy/migration approval after staging smoke passes.

## Known Technical Debt

- LIFF bind uses the LIFF client profile user ID after login; server-side ID token verification is recommended for a hardening pass.
- The unlock token is stored because the short-code webhook needs to send a link after matching a code.
- No webhook rate limiter was added in this MVP.
- Live LINE smoke remains pending after staging deploy/migration.

## Tech Debt Review

### New Technical Debt Introduced

- Plaintext high-entropy fulfillment token storage for webhook reply capability.
- LIFF identity validation should be hardened beyond client profile user ID.
- Webhook rate limiting is not implemented.

### Existing Technical Debt Observed

- Email fallback remains capture-only.
- Production deployment/migration remains manual and separate from staging push.

### Opportunistic Cleanup Completed

- Strengthened event metadata forbidden keys for fulfillment privacy.
- Updated docs to make LINE env source-of-truth clearer.

### Deferred Cleanup Candidates

- Add server-side LINE ID token verification.
- Add webhook rate limiting.
- Add duplicate LINE event idempotency if duplicate events appear in live logs.
- Consider token encryption or split delivery-token storage if the webhook path matures.

### Recommended Follow-up

- Deploy to staging, apply migration, and run staging test OA smoke.

## Deviations From Handoff

- Stored `fulfillment_token` in addition to token hash so the webhook can send an unlocked URL after short-code matching.
- Live staging and production smoke were not run because deployment/migration gates have not happened yet.

## Git Commit

- Pending at report-write time.

## Staging Push

- Pending at report-write time.

## Remaining Uncertainties

- Whether the current LINE LIFF channel supports a clean server-side ID token verification path.
- Whether the staging webhook verification status passes after deploy.
- Whether production smoke should be approved immediately after staging smoke or held for another review.

## Recommended Next Step

Deploy this commit to staging, apply `apps/web/drizzle/0003_line_fulfillment.sql`, then run the staging test OA smoke before production promotion.
