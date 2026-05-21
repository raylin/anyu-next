# Execution Report: Scheduled Retention Cleanup v0

Date: 2026-05-21
Task: Scheduled Retention Cleanup v0
Commit: pending at report-write time

## Completed Work

- copied the provided handoff into `ai-collaboration/handoffs/2026-05-21-scheduled-retention-cleanup-v0-handoff.md`
- added a secret-guarded cron route at `apps/web/src/app/api/cron/retention-cleanup/route.ts`
- added cleanup logic in `apps/web/src/lib/runtime/retention-cleanup.ts`
- added local test coverage for cleanup logic and route auth/dry-run behavior
- added `apps/web/vercel.json` with the accepted Vercel cron schedule
- updated app/ops docs and the production launch decision to reflect scheduled cleanup coverage
- verified preview and production endpoint behavior live with unauthorized and authorized dry-run checks

## Architecture Decisions

- kept the cleanup endpoint local to the app runtime and Vercel Cron instead of introducing an external worker
- limited scheduled cleanup to `analysis_requests` and `analysis_results`, matching the current explicit `retention_expires_at` coverage
- scrubbed expired rows in place instead of hard-deleting referenced result rows
- used bearer-secret auth via `RETENTION_CLEANUP_SECRET` or `CRON_SECRET`
- accepted daily scheduling because the active Vercel plan rejected the intended 12-hour cadence

## Validation

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed
- preview live cron endpoint verification passed
- production live cron endpoint verification passed

## Live Verification Details

### Preview

- unauthorized dry run: `401`
- authorized dry run: `200`
- dry-run counts:
  - `analysisRequestsDeleted: 15`
  - `analysisResultsDeleted: 14`

### Production

- unauthorized dry run: `401`
- authorized dry run: `200`
- dry-run counts:
  - `analysisRequestsDeleted: 0`
  - `analysisResultsDeleted: 0`

## Blockers

- none for the scheduled cleanup rollout itself

## Uncertainties

- whether future policy should extend explicit scheduled retention to `unlock_intents` and `contact_submissions`
- whether a higher-frequency cleanup cadence is worth revisiting after plan/hosting changes

## Suggested Next Steps

- keep the current daily scheduled cleanup in place
- only widen retention coverage after an explicit policy decision for the non-target tables
- if broader traffic arrives, revisit whether daily cadence is still sufficient
