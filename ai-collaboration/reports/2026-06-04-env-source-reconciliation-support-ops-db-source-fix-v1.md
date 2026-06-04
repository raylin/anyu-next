# Env Source Reconciliation + Support Ops DB Source Fix v1

Date: 2026-06-05

## Status

Partial / blocked at support lookup.

The source policy has been fixed: `SUPPORT_OPS_DATABASE_URL` remains highest priority, and `DATABASE_URL` is now allowed only after a clean access-link schema probe. However, the live `apps/web/.env.local` `DATABASE_URL` probe did not verify the clean access-link schema, so support lookup remains blocked with `blocked_database_url_schema_mismatch`.

## Four-Source Env Model

Owner-confirmed expected source model:

- Local staging: `apps/web/.env.local`
- Host staging: Vercel Preview(staging)
- Local production: `apps/web/.env`
- Host production: Vercel Production

Actual key-presence inventory, values not printed:

| Source | Exists / reachable | Result |
| --- | --- | --- |
| `apps/web/.env.local` | yes | `DATABASE_URL`, staging payment/provider names, Email provider names present; `SUPPORT_OPS_DATABASE_URL` absent; access-link/LINE provider names mostly absent locally. |
| `apps/web/.env` | yes | `DATABASE_URL`, payment/provider names, Email provider names present; `SUPPORT_OPS_DATABASE_URL` absent. |
| Vercel Preview(staging) | reachable by `vercel env ls preview` | Expected staging names present, including payment, access-link, Email, LINE, queue/processor, LIFF, and operator smoke flags. |
| Vercel Production | reachable by `vercel env ls production` | Expected production names present for payment, access-link, Email, LINE, queue/processor, and DB. Runtime checkout flags remain absent/disabled. |

Note: the installed Vercel CLI supports branch-scoped `env pull`, but `env ls --git-branch` is not supported in this environment. Host staging name inventory used `vercel env ls preview`, which shows Preview(staging) rows where applicable.

## Local Env Loading Behavior

Inspected:

- `apps/web/scripts/lib/load-local-env.mjs`
- `apps/web/scripts/qa-env-preflight.mjs`
- `apps/web/scripts/support-paid-result-lookup.mjs`
- `apps/web/scripts/production-payment-runtime-preflight.mjs`

Findings:

- `loadLocalEnv()` resolves the web app directory by walking from the current directory until it finds `apps/web/package.json` or the web app package.
- Default local env file is `apps/web/.env.local`.
- Existing exported shell env values take precedence over file values.
- Repo-root `.env` is not loaded by the shared local QA env loader.
- `ops:paid-result:lookup` loads `apps/web/.env.local` unless `--no-local-env` / `SUPPORT_LOOKUP_DISABLE_LOCAL_ENV=1` is used.
- `qa:env:preflight` loads `apps/web/.env.local`.
- `qa:production:payment-preflight -- --source vercel-production` reads Vercel Production env metadata and does not rely on local `.env` values.

Test coverage added:

- `qa-local-env-loader.test.ts` now verifies repo-root cwd shape still loads `apps/web/.env.local` and ignores root `.env`.

## `apps/web/.env.local` DATABASE_URL Schema Probe

Read-only schema probe result:

- `DATABASE_URL`: present
- `SUPPORT_OPS_DATABASE_URL`: absent
- clean access-link schema probe: failed
- category: `database_url_schema_mismatch`
- access-link tables present at that target: false
- old recovery tables absent at that target: true
- no connection string, host, DB name, branch name, value length, prefix, suffix, hash, checksum, or row values were printed

Interpretation:

- The previous conclusion that local `DATABASE_URL` could not be used for support lookup is still correct for the current local file contents.
- The reason is now classified precisely as `database_url_schema_mismatch`, not “missing support DB URL.”
- This contradicts the intended source model for the current local file state and should be corrected by updating local operator env outside tracked files.

## Host Preview Schema Reference

Using safe Neon metadata/SQL tools, Preview branch schema was previously verified with schema/aggregate-only checks:

- `payment_access_link_contacts`: exists
- `paid_result_access_links`: exists
- `payment_access_link_contact_secrets`: exists
- old recovery-named access-link tables/views: absent

No private row values were printed.

## Support Lookup Source Policy

Implemented policy:

1. `SUPPORT_OPS_DATABASE_URL` is highest priority.
2. If `SUPPORT_OPS_DATABASE_URL` is missing and `DATABASE_URL` exists, support lookup probes `DATABASE_URL`.
3. `DATABASE_URL` is usable only if the clean access-link schema probe passes.
4. If the probe fails, lookup blocks safely.

Connection source categories:

- `support_ops_database_url`
- `database_url_schema_verified`
- `blocked_database_url_schema_mismatch`
- `blocked_missing_db_url`

`DATABASE_URL` fallback is no longer silent. It must explicitly pass the clean schema probe and report `database_url_schema_verified`, without printing values.

## Support Preflight Result

Command:

- `cd apps/web && corepack pnpm run qa:env:preflight -- support-ops-lookup`

Result:

- failed safely
- category: `blocked_database_url_schema_mismatch`
- `SUPPORT_OPS_DATABASE_URL`: missing
- `DATABASE_URL`: present
- database URL schema probe: checked
- access-link tables present: false
- old recovery tables absent: true
- values/lengths/prefixes/suffixes/hashes not printed

## Support Lookup Result

Command:

- `cd apps/web && corepack pnpm run ops:paid-result:lookup -- --result-id <synthetic-staging-result-id>`

Result:

- failed safely before querying support data
- category: `blocked_database_url_schema_mismatch`
- connection source category: `blocked_database_url_schema_mismatch`
- no DB URL, token, raw Email, LINE ID, encrypted recipient, hashes, raw source text, or provider payload was printed

Support lookup against the real staging Email/LINE artifact was not run because the DB source was not verified.

## Staging Baseline Status

Partial.

Still verified from prior v1:

- real staging Email received and `/r/` opened completed paid result
- real staging LINE received and `/r/` opened completed paid result
- desktop Email-only mandatory save works
- mobile LINE-first mandatory save works
- automated access-link/no-card QA passes
- Production remains frozen/fail-closed

Still blocked:

- support lookup cannot run until local/operator DB source points to the clean Preview(staging) access-link schema

## Production Freeze Status

Production remained frozen/fail-closed:

- public `/`, `/refund`, and `/legal`: 200
- checkout route: 404 fail-closed
- operator fake-paid route: 404 fail-closed
- operator access-link smoke route: 404 fail-closed
- `qa:production:payment-preflight -- --source vercel-production --mode dry-run`: `pass_ready_for_controlled_smoke`
- no Production payment was run
- no Production Email/LINE was sent
- no Production env or provider dashboard setting was changed

## Validation

Passed:

- `cd apps/web && corepack pnpm lint`
- targeted env/source/support tests: 3 files / 21 tests
- `cd apps/web && corepack pnpm test`: 80 files / 572 tests
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm run qa:access-link:smoke`
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`
- `cd apps/web && corepack pnpm run qa:production:payment-preflight -- --source vercel-production --mode dry-run`

Blocked by design:

- `cd apps/web && corepack pnpm run qa:env:preflight -- support-ops-lookup`
- `cd apps/web && corepack pnpm run ops:paid-result:lookup -- --result-id <staging-result-id>`

## Remaining Tech Debt

Must fix before production smoke:

- align `apps/web/.env.local` `DATABASE_URL` or provide `SUPPORT_OPS_DATABASE_URL` so local support lookup targets the clean Preview(staging) schema
- preserve schema-probed fallback behavior; do not reintroduce silent `DATABASE_URL` use
- harden production preflight empty-secret validation
- keep Vercel deploy/source guard checks

Can fix after staging baseline before Module 02:

- recovery-named env vars and module aliases
- recovery-named operator endpoint/script names

Intentionally retained:

- `/r/[token]` route
- `rlb_` LINE bind state prefix
- desktop/non-mobile Email-only checkout boundary

## Recommended Next Action

Correct the local operator DB source outside tracked files:

- either update `apps/web/.env.local` `DATABASE_URL` to the clean Preview(staging) DB source, or
- set `SUPPORT_OPS_DATABASE_URL` via an untracked local env file or process-only export.

Then rerun:

- `cd apps/web && corepack pnpm run qa:env:preflight -- support-ops-lookup`
- `cd apps/web && corepack pnpm run ops:paid-result:lookup -- --result-id <staging-result-id>`

Hold for owner acceptance before any production readiness task.
