# LINE Fulfillment Hardening Staging Smoke v0 Execution Report

## Summary

Ran staging-only smoke verification for the hardened LINE fulfillment implementation. Staging DB migration `0004` is present, staging public LINE env still points to the test OA / staging LIFF, existing unlock flow works, the unlocked route renders, LIFF bind hardening rejects client-only user IDs and invalid ID tokens, invalid webhook signatures are rejected, and event metadata remains safe. Production was not touched.

## Files Created

- `ai-collaboration/handoffs/2026-05-21-line-fulfillment-hardening-staging-smoke-v0-handoff.md`
- `ai-collaboration/research/2026-05-21-line-fulfillment-hardening-staging-smoke-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-21-line-fulfillment-hardening-staging-smoke-v0-execution-report.md`

## Files Updated

- `ai-collaboration/research/line/line-oa-staging-setup.md`
- `ai-collaboration/summaries/summary_log.md`

## Staging Freshness Status

No explicit staging commit marker is exposed. Freshness was verified by hardened route behavior:

- client-only LIFF user ID payload rejected
- invalid LIFF ID token rejected with `invalid_line_identity`
- invalid webhook signature still rejected

Status: passed for behavioral freshness; exact commit hash not exposed by runtime.

## Migration Status

- Staging DB has `line_webhook_events`.
- Staging DB has `line_webhook_rate_limits`.
- Expected dedupe/rate-limit indexes are present.
- Production migration was not run.

## Smoke Results

- Synthetic analyze: passed after retry with longer timeout.
- Unlock intent: passed.
- Staging public LIFF URL: passed.
- Test OA add URL: passed.
- Unlocked route: passed.
- LIFF client-only user ID rejection: passed.
- LIFF invalid ID token rejection: passed.
- Webhook invalid signature rejection: passed.
- Signed duplicate webhook live smoke: not run, requires server secret.
- Signed invalid-code rate guard live smoke: not run, requires server secret.

## LIFF Verification Status

Hardened LIFF bind behavior is live on staging:

- missing/client-only identity payload rejected with `invalid_input`
- invalid ID token rejected with `invalid_line_identity`
- no LINE user was bound after failed attempts

Valid live ID token success remains a manual LIFF in-app test because shell cannot produce a real LINE-issued LIFF ID token.

## Webhook Hardening Status

- Invalid signature rejection passed on staging.
- DB-backed dedupe/rate-limit tables and indexes are present.
- Duplicate event and invalid-code cooldown behavior are covered by automated route tests.
- Live signed duplicate/rate-guard route smoke was skipped to avoid handling `LINE_CHANNEL_SECRET`.

## Event / Privacy Status

Staging event metadata for the synthetic smoke was safe. It contained request/result IDs, unlock intent ID, status, channel, cache/model/timing metadata only.

No LINE user ID, display name, message text, fulfillment code, unlock token, tokenized URL, raw input, redacted input, email, full result JSON, provider output, or server secret was observed in event metadata.

## Validation Results

- `python3 -m compileall oradar` passed.
- `python3 -m compileall tools/topic-ingestion` passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed, 25 tests.
- `corepack pnpm lint` passed.
- `corepack pnpm test` passed, 24 files / 94 tests.
- `corepack pnpm build` passed.
- `corepack pnpm test:e2e:local` passed, 9 Playwright tests.

## Known Technical Debt

- Recoverable unlock token storage remains from the v0 fulfillment design.
- Webhook dedupe/rate-limit rows do not yet have a dedicated retention cleanup policy.
- Real LIFF ID token success requires manual in-app LINE/LIFF verification.
- Production migration/activation remains pending separate approval.

## Tech Debt Review

### New Technical Debt Introduced

- None; this pass was smoke/docs only.

### Existing Technical Debt Observed

- Recoverable unlock token storage.
- No cleanup policy yet for webhook dedupe/rate-limit tables.

### Opportunistic Cleanup Completed

- Updated staging setup notes with hardened staging smoke status.

### Deferred Cleanup Candidates

- Add retention cleanup for `line_webhook_events` and `line_webhook_rate_limits` if volume grows.
- Revisit hash-only unlock token storage in a future hardening pass.

### Recommended Follow-up

Run a manual staging LIFF in-app smoke with a real LINE-issued ID token.

## Deviations From Handoff

- Valid signed webhook duplicate/rate guard live smoke was not run because it requires `LINE_CHANNEL_SECRET`.
- Manual test OA smoke was not repeated because previous manual short-code smoke already passed and this task focused on hardened route behavior.
- Exact deployed commit could not be read because the app does not expose a build marker; freshness was verified by hardened route behavior.

## Git Commit

Pending at report finalization time.

## Staging Push

Pending at report finalization time.

## Remaining Uncertainties

- Whether real staging LIFF in-app runtime returns and binds a valid ID token as expected.
- Whether production will explicitly configure `LINE_LOGIN_CHANNEL_ID` or rely on LIFF ID prefix derivation.

## Recommended Next Step

Run one manual staging LIFF in-app smoke, then prepare a separate production migration/smoke plan only if production activation is explicitly approved.
