# Payment / Entitlement Schema Staging Migration Verification v0 Execution Report

## Summary

Applied and verified `0007_payment_entitlements.sql` on staging only.

Both `payment_intents` and `entitlements` exist with expected columns, defaults, indexes, unique constraints, and foreign keys. Synthetic staging-safe payment/entitlement lifecycle smoke passed, token safety checks passed, and all synthetic rows were cleaned up.

Normal staging runtime route checks passed and did not write rows to the new payment tables.

Production migration was not applied.

## Files Created

- `ai-collaboration/handoffs/2026-05-27-payment-entitlement-schema-staging-migration-verification-v0-handoff.md`
- `ai-collaboration/research/2026-05-27-payment-entitlement-schema-staging-migration-verification-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-27-payment-entitlement-schema-staging-migration-verification-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Migration Status

- Staging deployment freshness: passed.
- Staging build marker: branch `staging`, commit prefix `87ac2f4c3120`.
- Migration applied: `apps/web/drizzle/0007_payment_entitlements.sql`.
- Target: staging database only.
- Production migration: not run.

## Schema Verification

`payment_intents`:

- Table exists.
- Expected columns present: 28 of 28.
- Key defaults/nullability passed.
- Primary key exists.
- Expected unique/index coverage passed.
- Expected foreign keys passed.

`entitlements`:

- Table exists.
- Expected columns present: 23 of 23.
- Key defaults/nullability passed.
- Primary key exists.
- Expected partial unique/index coverage passed.
- Expected foreign keys passed.

## Synthetic Repo Smoke

Synthetic staging-safe SQL smoke passed.

Covered:

- Synthetic analysis request/result prerequisites.
- Synthetic payment intent create/update lifecycle.
- Synthetic entitlement creation.
- Synthetic paid access token hash rotation.
- Synthetic refund/refunded state updates.
- Synthetic cleanup.

Final synthetic row count verification passed.

## Token Safety Result

Passed.

- Entitlement token hash column did not contain raw paid access token shape.
- Old synthetic token hash lookup returned zero rows after rotation.
- New synthetic token hash lookup returned one row during the controlled smoke.
- Raw tokens, token hashes, secrets, tokenized URLs, raw input, provider output, paid result JSON, short codes, and LINE IDs were not recorded.

## Runtime Regression Result

Staging route/API checks passed:

- Health route returned HTTP 200.
- Module landing returned HTTP 200.
- LIFF bridge debug route returned HTTP 200.
- Invalid LIFF bind rejected with HTTP 400.
- Invalid non-empty LINE webhook signature rejected with HTTP 401.
- Empty-events LINE webhook verification ping returned HTTP 200.
- Synthetic analyze returned HTTP 200.
- Result page returned HTTP 200.
- Unlock intent returned HTTP 200.
- Paid generation request returned HTTP 200 with completed status.
- Paid result status returned HTTP 200 with completed status.
- Unlocked route returned HTTP 200.

The initial synthetic route attempt returned `input_too_short`; this confirmed the existing validation guard and was rerun with a valid synthetic sample.

## Runtime Write Verification

Passed.

Final aggregate counts after synthetic cleanup and route regression checks:

- `payment_intents`: 0.
- `entitlements`: 0.

No normal runtime route wrote to the new payment/entitlement tables.

## Validation Results

Passed:

- `python3 -m compileall oradar`
- `python3 -m compileall tools/topic-ingestion`
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`
- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`

Playwright was not required because this task made no app code changes.

## Tech Debt Review

### New Technical Debt Introduced

None.

### Existing Technical Debt Observed

The local working tree contains substantial pre-existing dirty/untracked changes from prior handoffs, so final commit/push was prepared from a clean clone to avoid staging unrelated work.

### Opportunistic Cleanup Completed

None. This task was intentionally limited to staging verification and documentation.

### Deferred Cleanup Candidates

Consider documenting the clean-clone commit workflow as an operational fallback for dirty local worktrees if this continues to be common.

### Recommended Follow-up

Run a separate production migration gate only when the owner wants production schema readiness.

## Deviations From Handoff

- No code changes were made, so `test:e2e:local` was not run.
- Route-level smoke was recorded with sanitized statuses only.

## Git Commit

Initial verification docs commit: `03b208b`.

Final report-status update commit: recorded in the final Codex completion summary.

## Staging Push

Initial verification docs commit pushed to `origin/staging`.

Final report-status update push recorded in the final Codex completion summary.

## Remaining Uncertainties

- Production migration remains pending by design.
- Runtime payment/entitlement integration is not enabled yet, so this verification covers schema readiness, repository-level smoke, and unchanged runtime behavior only.

## Recommended Next Step

Run `Payment / Entitlement Schema Production Migration Gate v0` when schema readiness is needed in production, or defer until NewebPay/payment runtime implementation is closer.
