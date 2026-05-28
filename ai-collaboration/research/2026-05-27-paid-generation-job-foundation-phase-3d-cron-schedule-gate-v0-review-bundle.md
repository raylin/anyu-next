# Paid Generation Job Foundation Phase 3D — Cron Schedule Gate v0 Review Bundle

Date: 2026-05-27

## 1. Summary

Added the paid-generation cron schedule gate to the Vercel config:

```text
GET /api/cron/paid-generation
*/5 * * * *
```

The schedule points at the Phase 3C wrapper, which is `CRON_SECRET`-gated, `ENABLE_PAID_GENERATION_PROCESSOR`-gated, `paid_analysis` only, and `limit=1`.

No production deployment was performed and production processor remains disabled.

## 2. Cron Schedule Decision

Decision: add the 5-minute schedule in repo config, but keep production processing disabled until explicit approval.

Rationale:

- The wrapper is already aggregate-only and secret-gated.
- Production `CRON_SECRET` is configured.
- Production `ENABLE_PAID_GENERATION_PROCESSOR` is absent.
- Production `generation_jobs` aggregate count is zero.
- A 5-minute cadence is low-risk while no normal production flow depends on queued paid-generation jobs.

## 3. Config Changes

Updated:

```text
apps/web/vercel.json
```

Added:

```json
{
  "path": "/api/cron/paid-generation",
  "schedule": "*/5 * * * *"
}
```

Preserved existing retention cleanup cron:

```text
/api/cron/retention-cleanup
0 17 * * *
```

## 4. Secret / Flag Gate

Production posture checked:

- `CRON_SECRET`: configured in Production.
- `ENABLE_PAID_GENERATION_PROCESSOR`: not listed in Production.
- Mode: schedule added with processor disabled.

This means scheduled calls should be authenticated by Vercel but fail safe at the processor flag gate until the owner explicitly enables the processor.

## 5. Staging Verification

Staging was already serving the Phase 3C wrapper before the schedule config change.

Verified:

- staging health marker reachable
- missing auth returns `401`
- valid `CRON_SECRET` dry-run returns aggregate zero-work response

Vercel Cron schedule execution itself is production-deployment behavior; no production deploy was performed in this task.

## 6. Production Verification

Production checks performed without printing secrets:

- production health route reachable
- production `CRON_SECRET` listed as configured
- production `ENABLE_PAID_GENERATION_PROCESSOR` not listed
- production `generation_jobs` aggregates: total `0`, due paid-analysis `0`, processing `0`, failed-final `0`

No production deploy was performed. Therefore the new schedule is committed for the next approved production deployment but was not activated by this task.

## 7. No-op Safety

Expected disabled behavior:

```text
403 processor_disabled
```

Expected enabled no-due-job behavior:

```json
{
  "ok": true,
  "source": "cron",
  "jobType": "paid_analysis",
  "processed": 0,
  "completed": 0,
  "retryScheduled": 0,
  "failedFinal": 0,
  "staleRecovered": 0,
  "skipped": 0
}
```

## 8. Cost / Rate-limit Guardrails

Guardrails remain:

- `paid_analysis` only
- `limit=1`
- max attempts enforced by job records
- no request-route enqueue-only
- no LINE enqueue-only
- no payment success enqueue
- no external queue
- production processor flag remains disabled

## 9. Rollback / Disable Procedure

If cron misbehaves:

1. Remove `ENABLE_PAID_GENERATION_PROCESSOR` or set it false.
2. Remove the `/api/cron/paid-generation` schedule from `apps/web/vercel.json` in a rollback commit.
3. Rotate `CRON_SECRET` if exposure is suspected.
4. Leave `generation_jobs` in place; it is additive.
5. Request routes remain direct-generation and unaffected.

## 10. Temporary Vercel Deployment Cleanup

The Phase 3A temporary Vercel project cleanup remains an owner/operator console task. Codex did not delete or modify Vercel projects in this task.

## 11. Issues Found

- Local Playwright remains blocked by the known Chromium/MachPort permission issue.
- The active workspace still cannot write `.git/index.lock`, so commit/push was performed from a clean temporary clone.

## 12. Recommended Next Step

After the next approved production deployment, verify one scheduled run or an authorized manual call returns the expected disabled response. Do not enable `ENABLE_PAID_GENERATION_PROCESSOR` in production until a separate approval.
