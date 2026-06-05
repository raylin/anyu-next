# Env File Rename / Server Mirror Alignment v0

## Status

Completed.

This task aligned local server env mirror loading around explicit `apps/web/.env.staging` and `apps/web/.env.production` files. No Vercel env values, local env values, database state, production runtime flags, payment flows, Email sends, or LINE sends were changed.

## File Presence And Git Safety

Presence-only result:

| File | Present | Git status |
| --- | --- | --- |
| `apps/web/.env.staging` | yes | ignored |
| `apps/web/.env.production` | yes | ignored |
| `apps/web/.env.local` | no | ignored pattern exists |
| `apps/web/.env` | no | ignored pattern exists |
| `apps/web/.env.example` | yes | tracked placeholder file |

Tracked env files:

- `.env.example`
- `apps/web/.env.example`

No real env mirror file was staged or committed.

Deletion result:

- `apps/web/.env.local`: absent already; no removal needed.
- `apps/web/.env`: absent already; no removal needed.

## Env Loader Changes

### Shared local env loader

Updated `apps/web/scripts/lib/load-local-env.mjs`:

- default env file is now `apps/web/.env.staging`.
- no fallback to `apps/web/.env.local`.
- output reports whether deprecated `.env.local` exists.
- explicit `envFilePath` override still works for tests and specialized scripts.

Impact:

- staging QA helpers that call `loadLocalEnv()` now use `.env.staging` when shell env is absent.
- exported shell env still takes precedence.
- values are never printed by the loader.

### Production preflight local mode

Updated `apps/web/scripts/production-payment-runtime-preflight.mjs`:

- local source mode now defaults to `apps/web/.env.production`.
- no fallback to `apps/web/.env`.
- output reports expected file name and whether legacy `.env` is present.
- Vercel Production source mode is unchanged and remains the required production gate path.

Local mirror probe result:

- local `.env.production` was loaded in local dry-run mode.
- the local mirror exists but is incomplete for all production payment-runtime names, so local source mode classified `blocked_missing_payment_env`.
- this did not affect Vercel Production dry-run mode, which passed.

### Staging preflight

Updated `apps/web/scripts/qa-env-preflight.mjs`:

- reports `.env.staging` as the expected local mirror.
- reports deprecated `.env.local` presence separately.
- updates legacy support lookup command text to include `--no-local-env`.
- marks direct DB support lookup as legacy; target architecture is Admin API lookup.

### Legacy direct DB support helper

Updated `apps/web/scripts/support-paid-result-lookup.mjs`:

- no longer imports or auto-loads web env mirror files.
- refuses to run unless `--no-local-env` or `SUPPORT_LOOKUP_DISABLE_LOCAL_ENV=1` is used.
- requires process env to be explicit.
- remains legacy until Admin API + CLI replaces it.

This is intentional: future `pnpm ops` CLI must be a pure Admin API client and must not load `apps/web` env mirror files.

### Model latency helper

Updated `apps/web/scripts/evaluate-model-latency.mjs`:

- local env file path changed from `.env.local` to `.env.staging`.

## Example And Documentation Changes

Updated `apps/web/.env.example`:

- documents `.env.staging` as the staging QA/server mirror.
- documents `.env.production` as the production local preflight mirror.
- states future `pnpm ops` CLI must not load web env mirror files.
- marks `SUPPORT_OPS_DATABASE_URL` as legacy direct DB lookup only.
- contains placeholders only.

Updated dashboard:

- support lookup blocker now points to missing Admin API support lookup instead of local DB source repair.
- QA tooling text now states `.env.staging` / `.env.production` behavior.
- support ops readiness now treats direct DB lookup as legacy.

## Tests Added/Updated

Updated tests:

- `qa-local-env-loader.test.ts`
  - verifies `.env.staging` is the default from repo-root shape.
  - verifies deprecated `.env.local` is not used as fallback.
- `production-payment-runtime-preflight.test.ts`
  - verifies explicit `.env.production` local mirror loading.
  - verifies legacy `.env` is not loaded when `.env.production` is selected.
- `support-paid-result-lookup.test.ts`
  - documents legacy direct DB lookup as explicit process-env-only mode.

## Validation Results

Passed:

- `cd apps/web && corepack pnpm exec vitest run src/tests/qa-local-env-loader.test.ts src/tests/production-payment-runtime-preflight.test.ts src/tests/support-paid-result-lookup.test.ts`
- `cd apps/web && corepack pnpm run qa:env:preflight -- support-ops-lookup`
- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm run qa:access-link:smoke`
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`
- `cd apps/web && corepack pnpm run qa:production:payment-preflight -- --source vercel-production --mode dry-run`

Observed:

- `cd apps/web && corepack pnpm run qa:production:payment-preflight -- --source local --mode dry-run --skip-network` loaded `.env.production` but classified `blocked_missing_payment_env` because the local mirror is incomplete for production payment runtime env names.
- This was a local mirror completeness observation only; Vercel Production source mode passed and production remained fail-closed.

Not run:

- `qa:line-access-link:smoke`, because it may send a real staging LINE message and was not needed for this env loader task.

## Production Safety

Verified through Vercel Production dry-run preflight:

- production public pages are live.
- production checkout route is fail-closed.
- production fake-paid route is fail-closed.
- production runtime/checkout enable flags are not active.
- no production payment was run.
- no production Email or LINE message was sent.
- no production env values were changed.

## Tech Debt Review

New technical debt introduced:

- none.

Existing technical debt observed:

- local `.env.production` mirror is present but incomplete for local production payment-runtime preflight.
- direct DB support helper remains as legacy until Admin API + CLI is implemented.
- recovery-named env vars remain retained compatibility.

Opportunistic cleanup completed:

- removed silent `.env.local` and `.env` fallback behavior from project scripts.
- updated `.env.example` and dashboard to match the explicit mirror model.

Deferred cleanup candidates:

- decide whether local `.env.production` should be completed for local preflight parity or intentionally kept partial.
- implement Admin Paid Result Lookup API v0.
- implement Admin CLI Lookup Client v0.
- deprecate/remove `ops:paid-result:lookup` after Admin API/CLI staging smoke passes.

## Decisions Made

- `.env.staging` is the default local server env mirror for staging QA helpers.
- `.env.production` is the default local server env mirror for production local preflight.
- `.env.local` and `.env` are no longer loaded as implicit server mirrors.
- legacy direct DB support lookup no longer auto-loads web env mirror files.

## Recommended Next Task

Admin Paid Result Lookup API v0.
