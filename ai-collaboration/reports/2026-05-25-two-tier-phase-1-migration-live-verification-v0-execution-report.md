# Two-tier Phase 1 Migration Live Verification v0 Execution Report

## Summary

Applied `0005_two_tier_phase_1.sql` to the Neon staging/preview branch and verified the additive schema. Staging route-level regression checks passed using an existing cached result. The full staging gate did not pass because fresh analyze returned `provider_error` twice before result persistence, so the `analysis_paid_results` shadow-write seam could not be verified. Production migration was not applied.

## Files Created

- `ai-collaboration/handoffs/2026-05-25-two-tier-phase-1-migration-live-verification-v0-handoff.md`
- `ai-collaboration/research/2026-05-25-two-tier-phase-1-migration-live-verification-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-25-two-tier-phase-1-migration-live-verification-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Staging Migration Status

- Project: Neon `anyu-next`
- Branch: `preview`
- Migration: `0005_two_tier_phase_1.sql`
- Status: applied

Verified:

- `analysis_paid_results` table exists.
- `analysis_requests.user_context_json` exists as nullable `jsonb`.
- Expected `analysis_paid_results` indexes exist.

## Staging Smoke Results

Fresh analyze:

- Attempt 1: HTTP 502 `provider_error`, no result ID, about 66s.
- Attempt 2: HTTP 502 `provider_error`, no result ID, about 67s.

Cached analyze:

- HTTP 200
- Existing result returned
- Cache hit: yes
- Existing normalized result contains both `free_result` and `paid_result`.

Route-level regression checks with cached result:

- Result page: HTTP 200
- Unlock intent: HTTP 200
- Unlocked route: HTTP 200
- LIFF fulfill page: HTTP 200
- Invalid LIFF bind: HTTP 401
- Invalid webhook signature: HTTP 401

## Shadow Paid Result Status

- Shadow row created: no
- Completed shadow rows in recent verification window: 0
- Reason: fresh analyze failed before `analysis_results` persistence, so shadow write was not reached.

## User Context Persistence Status

Verified from failed fresh analyze request records:

- `user_context_json` persisted: yes
- Allowlisted context field count: 4
- Unknown arbitrary context: not stored/tested in live request; route validation already rejects unknown context in automated tests

No context values were printed in this report.

## Production Migration Status

Production migration was skipped.

Production schema check:

- `analysis_paid_results`: absent
- `analysis_requests.user_context_json`: absent

Reason:

- Staging did not pass the fresh analyze/shadow-write gate.

## Production Smoke Results

Not run. Production DB was not migrated and production app behavior was not changed.

## Event / Privacy Status

Reviewed staging event metadata keys only.

No forbidden keys/values were observed in the checked events:

- no raw input
- no redacted input text
- no context values
- no full result JSON
- no paid result JSON
- no provider raw output
- no email
- no LINE user ID
- no fulfillment code
- no unlock token
- no tokenized URL
- no secret values

## Validation Results

- `python3 -m compileall oradar`: passed.
- `python3 -m compileall tools/topic-ingestion`: passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`: passed, 25 tests.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed, 25 files / 115 tests.
- `cd apps/web && corepack pnpm build`: passed.
- `cd apps/web && corepack pnpm test:e2e:local`: passed, 9 tests.

## Known Technical Debt

- `analysis_paid_results` retention cleanup is not wired.
- Cache-hit shadow backfill is deferred.
- Fresh analyze provider errors still occur in staging and block shadow seam verification.

## Tech Debt Review

### New Technical Debt Introduced

- Staging now has the additive `analysis_paid_results` table without cleanup wiring.

### Existing Technical Debt Observed

- Fresh analyze remains slow and can fail with generic provider errors.
- Provider/semantic validation failures are not categorized enough in live smoke output to distinguish timeout, schema, and semantic false-fail cases.

### Opportunistic Cleanup Completed

- None. This was a migration verification task.

### Deferred Cleanup Candidates

- Add retention cleanup for `analysis_paid_results`.
- Add sanitized provider validation error categories.
- Add cache-hit shadow backfill after fresh analyze/shadow write is verified.

### Recommended Follow-up

Diagnose staging fresh analyze provider errors before applying production `0005`.

## Deviations From Handoff

- Production migration was not applied because staging did not pass the fresh analyze/shadow-write verification gate.
- Staging shadow write could not be verified because fresh analyze did not produce a new result.

## Git Commit

Recorded in final Codex completion summary.

## Staging Push

Recorded in final Codex completion summary.

## Remaining Uncertainties

- Whether the staging fresh analyze failures are provider latency, semantic validation false-fails, output truncation, or another provider/runtime category.
- Whether shadow write works in live staging once fresh analyze succeeds.

## Recommended Next Step

Run `Staging Analyze Provider Error Follow-up v0`, then rerun the Phase 1 migration live verification and apply production `0005` only after staging fresh analyze and shadow write pass.
