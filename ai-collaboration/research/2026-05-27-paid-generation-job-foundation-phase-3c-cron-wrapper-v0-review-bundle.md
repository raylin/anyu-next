# Paid Generation Job Foundation Phase 3C — Cron Wrapper v0 Review Bundle

Date: 2026-05-27

## 1. Summary

Implemented a narrow cron wrapper route for paid-generation jobs:

```text
GET /api/cron/paid-generation
```

The wrapper is Vercel-Cron-friendly, uses `CRON_SECRET` bearer auth only, respects `ENABLE_PAID_GENERATION_PROCESSOR`, delegates to the existing paid-generation processor service, and returns aggregate-only responses.

No cron schedule was added and production processor behavior was not enabled.

## 2. Cron Wrapper Route

- Route: `GET /api/cron/paid-generation`.
- Default job type: `paid_analysis`.
- Default limit: `1`.
- Optional dry run: `?dryRun=1`.
- Route `maxDuration` matches the processor endpoint.
- Response includes safe route-level context: `source: "cron"` and `jobType: "paid_analysis"`.

## 3. Authentication / Secret Handling

- Added `apps/web/src/lib/runtime/cron-auth.ts`.
- Cron wrapper reads `CRON_SECRET` only.
- `INTERNAL_JOB_SECRET` is not accepted by the cron wrapper.
- Auth requires `Authorization: Bearer <CRON_SECRET>`.
- Query-string secrets are not accepted.
- Missing/invalid auth returns `401`.
- Missing `CRON_SECRET` returns safe `503 config_error`.

## 4. Processor Delegation

The wrapper delegates to `processPaidAnalysisJobs` with:

```text
jobType: paid_analysis
limit: 1
lockedBy: paid_generation_cron
dryRun: parsed from dryRun=1
```

The wrapper does not duplicate generation, claim, retry, stale recovery, or paid-result persistence logic.

## 5. Feature Flag Behavior

- `ENABLE_PAID_GENERATION_PROCESSOR` remains required.
- If disabled or absent, the route returns `403 processor_disabled`.
- Disabled state does not claim jobs or call the provider.

## 6. No-op Safety

When no due jobs exist, the processor returns aggregate zero-work output.

Dry-run mode:

- does not claim jobs
- does not call provider
- returns aggregate due-work count via `skipped`

Stale recovery can still be reported by the normal non-dry-run processor path.

## 7. Tests Added

- Cron auth helper tests.
- Cron wrapper route tests for missing/invalid auth.
- Test proving query-string secret is ignored.
- Test proving `INTERNAL_JOB_SECRET` is not accepted by the cron wrapper.
- Disabled processor flag test.
- Enabled delegation test with `paid_analysis`, `limit=1`, and safe `lockedBy`.
- Aggregate-only response shape test.
- Dry-run behavior test.

Existing internal processor route tests remain unchanged and continue to cover manual/operator auth.

## 8. Staging Verification

Staging verification performed:

- Confirmed staging build marker after deployment.
- Missing auth returned `401`.
- Invalid bearer auth returned `401`.
- Query-string secret attempt returned `401`.
- Rotated Preview/Staging `CRON_SECRET` to a new secure value for authorized wrapper verification; the value was not printed or committed.
- Valid `CRON_SECRET` with enabled staging processor returned aggregate no-op/dry-run output.

No synthetic queued job was created for this wrapper pass because Phase 3A already verified one synthetic queued job through the same processor service. This pass verified wrapper auth and delegation safety.

## 9. Production Safety

- No Vercel Cron schedule was added.
- `apps/web/vercel.json` was not changed.
- Production cron was not enabled.
- Production processor was not enabled.
- The route is inert without `CRON_SECRET`, valid bearer auth, DB config, and `ENABLE_PAID_GENERATION_PROCESSOR`.

## 10. Runbook Updates

Updated `docs/operations/production-deployment-runbook.md` with:

- cron wrapper route
- required bearer auth
- no query-string secret rule
- no-op/dry-run guidance
- production schedule not configured
- future cadence recommendation: 5 minutes, `limit=1`, after approval
- safety reporting exclusions

## 11. Known Limitations

- No cron schedule exists yet.
- No production no-op cron has been run.
- The wrapper currently uses `limit=1` by design.
- Queue-based user-facing flows remain deferred.
- Phase 3A temporary Vercel project cleanup remains an operator console task.

## 12. Recommended Next Step

Run a separate production/staging cron schedule gate only after explicit approval. Do not enable enqueue-only behavior until the cron path has monitoring history.
