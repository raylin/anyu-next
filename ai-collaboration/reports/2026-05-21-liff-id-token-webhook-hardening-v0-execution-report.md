# LIFF ID Token Verification + Webhook Hardening v0 Execution Report

## Summary

Implemented targeted LINE fulfillment hardening: server-side LIFF ID token verification, database-backed webhook idempotency, database-backed invalid-code rate guard, stronger event metadata privacy guard, tests, migration, and docs. Production was not touched.

## Files Created

- `ai-collaboration/handoffs/2026-05-21-liff-id-token-webhook-hardening-v0-handoff.md`
- `apps/web/drizzle/0004_line_webhook_hardening.sql`
- `apps/web/src/lib/line/liff.ts`
- `apps/web/src/lib/line/webhook-hardening.ts`
- `apps/web/src/tests/line-route-hardening.test.ts`
- `ai-collaboration/research/2026-05-21-liff-id-token-webhook-hardening-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-21-liff-id-token-webhook-hardening-v0-execution-report.md`

## Files Updated

- `apps/web/drizzle/meta/_journal.json`
- `apps/web/src/app/api/line/fulfillment/bind-liff/route.ts`
- `apps/web/src/app/api/line/webhook/route.ts`
- `apps/web/src/app/m/[moduleSlug]/line/fulfill/page.tsx`
- `apps/web/src/lib/db/runtime.ts`
- `apps/web/src/lib/db/schema.ts`
- `apps/web/src/lib/events/types.ts`
- `apps/web/src/lib/line/webhook.ts`
- `apps/web/src/tests/event-metadata.test.ts`
- `apps/web/src/tests/line-fulfillment.test.ts`
- `apps/web/README.md`
- `docs/operations/production-deployment-runbook.md`
- `ai-collaboration/research/line/line-fulfillment-env-matrix.md`
- `ai-collaboration/research/line/line-oa-staging-setup.md`
- `ai-collaboration/research/line/line-oa-production-setup.md`
- `ai-collaboration/summaries/summary_log.md`

## LIFF Verification Changes

- LIFF client now sends `idToken` from `liff.getIDToken()`.
- Bind API rejects client-only `liffUserId` payloads.
- Bind API verifies ID tokens server-side through LINE's verify endpoint.
- Verified LINE token subject is used for `unlock_intents.line_user_id`.
- No display name or profile picture is stored.

## Webhook Idempotency Changes

- Added `line_webhook_events` table.
- Webhook processing records a dedupe key before handling each event.
- Duplicate events return 200 safely and do not send duplicate replies.
- Dedupe uses LINE `webhookEventId` when available or a hashed derived key otherwise.

## Abuse Guard Changes

- Added `line_webhook_rate_limits` table.
- Invalid short-code attempts are tracked by hashed LINE user ID in a 10-minute window.
- More than 5 invalid attempts returns a cooldown message.
- Raw message text and codes are not stored.

## Privacy / Event Metadata Changes

- Event metadata guard now rejects LINE user identifiers, message text, fulfillment codes, unlock tokens, URLs, provider output, database URLs, LINE secrets, cache secrets, and retention cleanup secrets.
- Fulfillment events continue to use safe metadata only: result ID, unlock intent ID, channel, status, error code, dedupe status, and rate-limited boolean.

## Schema / Migration Changes

- Created `apps/web/drizzle/0004_line_webhook_hardening.sql`.
- Updated the Drizzle migration journal.
- Applied equivalent idempotent SQL to staging Neon branch `br-fragrant-union-aoh4udf1`.
- Verified staging has `line_webhook_events` and `line_webhook_rate_limits`.
- Production migration was not run.

## Tests Added

- LINE ID token verification helper tests.
- LIFF channel ID derivation tests.
- LIFF bind route hardening tests.
- Webhook duplicate event test.
- Webhook rate-limit test.
- Webhook dedupe key tests.
- Event metadata guard hardening tests.

## Validation Results

- `python3 -m compileall oradar` passed.
- `python3 -m compileall tools/topic-ingestion` passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed, 25 tests.
- `corepack pnpm lint` passed.
- `corepack pnpm test` passed, 24 files / 94 tests.
- `corepack pnpm build` passed.
- `corepack pnpm test:e2e:local` passed, 9 Playwright tests.

## Staging Verification

- Staging DB migration: applied and verified.
- Staging invalid-signature webhook smoke: passed.
- New live route-level behavior: pending staging deployment from this commit.
- Manual production or production smoke: not run.

## Known Technical Debt

- Recoverable unlock token storage remains from the v0 fulfillment design.
- Fallback webhook dedupe is best-effort when LINE omits `webhookEventId`.
- Abuse guard is intentionally simple and not a comprehensive fraud prevention system.

## Tech Debt Review

### New Technical Debt Introduced

- None beyond the documented simple v0 abuse guard limitation.

### Existing Technical Debt Observed

- Recoverable unlock token storage.
- Production LINE activation still depends on an explicit migration/smoke workflow.

### Opportunistic Cleanup Completed

- Strengthened event metadata guard and docs while touching fulfillment security paths.

### Deferred Cleanup Candidates

- Consider hash-only unlock token storage when fulfillment can be redesigned safely.
- Add cleanup/retention for webhook dedupe/rate-limit rows if volume grows.

### Recommended Follow-up

Run staging route-level smoke after the staging deployment for this commit is live.

## Deviations From Handoff

- Real LINE ID token success verification could not be exercised from shell because it requires a real LIFF runtime token. It is covered by injected fetch tests and documented for staging manual verification.

## Git Commit

Pending at report finalization time.

## Staging Push

Pending at report finalization time.

## Remaining Uncertainties

- Whether the staging LIFF runtime returns an ID token with the expected channel audience after deployment.
- Whether production should explicitly set `LINE_LOGIN_CHANNEL_ID` or rely on LIFF ID prefix derivation.

## Recommended Next Step

After staging deploys this commit, run route-level staging smoke for invalid LIFF ID token rejection, webhook duplicate idempotency, invalid-code rate guard, and event privacy. Keep production blocked until production migration and production smoke are separately approved.
