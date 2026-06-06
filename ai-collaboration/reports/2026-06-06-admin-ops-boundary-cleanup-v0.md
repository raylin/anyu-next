# Admin Ops Boundary Cleanup v0

## Date

2026-06-06

## Completed Work

- Removed the active direct DB support lookup package script.
- Removed `apps/web/scripts/support-paid-result-lookup.mjs`.
- Removed the direct DB support lookup test file.
- Removed `support-ops-lookup` / `support_ops_lookup` / `ops-paid-result-lookup` aliases and mode from `qa:env:preflight`.
- Removed active `SUPPORT_OPS_DATABASE_URL` reliance from `apps/web` scripts.
- Updated active tests, dashboard, summary, and report to point operators to Admin API + Admin CLI.

## Reference Inventory

Active references found and cleaned:

| Reference | Classification | Action |
| --- | --- | --- |
| `apps/web/package.json` `ops:paid-result:lookup` | active package script | removed |
| `apps/web/scripts/support-paid-result-lookup.mjs` | active direct DB script | removed |
| `apps/web/src/tests/support-paid-result-lookup.test.ts` | active test for deprecated path | removed |
| `apps/web/scripts/qa-env-preflight.mjs` import of `support-paid-result-lookup.mjs` | active code dependency | removed |
| `qa:env:preflight -- support-ops-lookup` aliases/mode | active preflight mode for deprecated path | removed |
| `SUPPORT_OPS_DATABASE_URL` in active scripts | active direct DB env target | removed |
| dashboard active ops text | active docs/status | updated |

Historical references left unchanged:

- prior handoffs
- prior reports
- prior summary-log entries

These are historical records, not active guidance.

## Current Supported Ops Path

Staging:

```bash
set ADMIN_API_TOKEN in the current shell to the staging token
pnpm ops lookup-result --env staging --id <resultId>
```

Production:

```bash
set ADMIN_API_TOKEN in the current shell to the production token
pnpm ops lookup-result --env production --id <resultId>
```

Rules:

- CLI reads `ADMIN_API_TOKEN` from the current shell/process env only.
- CLI does not read `apps/web/.env.staging`.
- CLI does not read `apps/web/.env.production`.
- CLI does not read DB URLs.
- CLI does not access Vercel env.
- CLI does not access Neon.
- CLI calls Admin API only.

## SUPPORT_OPS_DATABASE_URL Status

`SUPPORT_OPS_DATABASE_URL` no longer remains in active `apps/web` script/package/env-example paths.

The only remaining active mention is a test assertion verifying that `qa-env-preflight` no longer exposes it.

## Suite / Gate Status

`qa:module01:staging` remains the preferred safe staging validation gate and includes:

- `adminApiLookup`
- `adminCliLookup`

Direct DB support lookup is no longer part of the Module 01 baseline or target ops architecture.

## Validation

Validation was run after cleanup. Results are recorded in the completion summary.

## Production Safety

- Production runtime was not enabled.
- Production checkout was not enabled.
- Production env was not modified.
- No production payment was run.
- No Email or LINE message was sent.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: historical reports and summary entries still mention the removed direct DB lookup path, but they are intentionally retained as history.
- Opportunistic cleanup completed: removed active DB/env support lookup path instead of leaving a deprecated runnable stub.
- Deferred cleanup candidates: decide later whether to add a short docs note in a formal ops runbook once Admin CLI usage stabilizes.

## Suggested Next Steps

Owner acceptance of Module 01 safe staging gate, then decide whether to resume Controlled Production Payment Smoke v1 or address remaining non-blocking tech debt first.
