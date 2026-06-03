# Support Ops Env Alignment v0

Date: 2026-06-04

## Completed Work

- Added explicit support lookup DB convention: `SUPPORT_OPS_DATABASE_URL`.
- Updated `ops:paid-result:lookup` to prefer `SUPPORT_OPS_DATABASE_URL`.
- Changed staging support lookup to block safely when `SUPPORT_OPS_DATABASE_URL` is missing.
- Kept `DATABASE_URL` fallback only behind explicit opt-in via `SUPPORT_OPS_ALLOW_DATABASE_URL_FALLBACK=1` or `--allow-database-url-fallback`.
- Added `support_ops_lookup` mode to `qa:env:preflight`.
- Added blank support lookup env placeholders to `apps/web/.env.example`.
- Added tests for explicit DB env preference and fallback gating.
- Ran a sanitized Preview(staging) support lookup smoke with `SUPPORT_OPS_DATABASE_URL` supplied ephemerally.

## Env Convention Chosen

Use:

- `SUPPORT_OPS_DATABASE_URL`

Purpose:

- local/operator support diagnostics for Preview(staging)
- keeps support lookup DB target distinct from app/runtime `DATABASE_URL`
- avoids accidentally querying the wrong local/dev database

Fallback:

- `DATABASE_URL` is accepted only with explicit fallback opt-in.
- Operators must set either `SUPPORT_OPS_ALLOW_DATABASE_URL_FALLBACK=1` or pass `--allow-database-url-fallback`.
- This fallback is for exceptional sessions only and should not be the normal support lookup path.

## Preflight Behavior

Command:

```bash
cd apps/web
corepack pnpm run qa:env:preflight -- support-ops-lookup
```

Preflight checks:

- `SUPPORT_OPS_DATABASE_URL` required
- `PAYMENT_RECOVERY_CONTACT_HASH_SECRET` optional for Email-hash lookup
- target/fallback flags are listed by name only

Redaction:

- no values printed
- no lengths printed
- no prefixes/suffixes printed
- no hashes/checksums printed

Missing-env behavior:

- if `SUPPORT_OPS_DATABASE_URL` is absent, preflight reports the exact missing env name
- `ops:paid-result:lookup` returns `support_ops_database_url_missing` before any DB query

## Local-Only Env Alignment

No tracked env file was modified with secrets.

For this smoke, `SUPPORT_OPS_DATABASE_URL` was supplied ephemerally to the shell process from the verified Preview(staging) Neon branch. The value was not printed, documented, committed, or written into tracked files.

`PAYMENT_RECOVERY_CONTACT_HASH_SECRET` remains absent locally, so Email-hash lookup was not smoke-tested.

## Support Lookup Smoke

Lookup key type:

- internal recovery link id

Sanitized result:

- target: staging
- connection source category: `support_ops_database_url`
- payment found: yes
- payment status: `paid`
- entitlement status: `active`
- generation status: `completed`
- paid result status: `completed`
- LINE saved: yes
- LINE recipient secret active: yes
- active access link: yes
- diagnosis included: `paid_result_ready`, `access_link_sent`
- operator/test artifact also raised `duplicate_payment_possible`, which is expected caution for that artifact shape

No raw lookup value, DB connection value, token, hash, raw Email, LINE ID, encrypted recipient, source text, provider payload, or tokenized URL was included in this report.

## Email-Hash Lookup Smoke

Blocked reason:

- `PAYMENT_RECOVERY_CONTACT_HASH_SECRET` was missing locally.

The helper can perform Email-hash lookup when the secret is available, but this task did not sync or print it.

## Production Guard

Production target check still returned:

- `production_target_rejected`

No production DB query, write, env modification, Email, or LINE message occurred.

## Validation

- `corepack pnpm lint`: passed
- `corepack pnpm exec vitest run src/tests/support-paid-result-lookup.test.ts src/tests/recovery-link-smoke-qa.test.ts`: passed
- `corepack pnpm test`: passed, 79 files / 542 tests
- `corepack pnpm build`: passed
- missing support DB preflight: blocked safely with `SUPPORT_OPS_DATABASE_URL`
- explicit support DB preflight: passed with values redacted
- `ops:paid-result:lookup` staging smoke: passed with `connectionSourceCategory=support_ops_database_url`
- production guard: passed
- `corepack pnpm run qa:recovery-link:smoke`: passed
- `corepack pnpm run qa:result-checkout:no-card`: passed

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: Email-hash lookup cannot be exercised until `PAYMENT_RECOVERY_CONTACT_HASH_SECRET` is locally available for operator sessions.
- Opportunistic cleanup completed: made DB fallback explicit instead of silent.
- Deferred cleanup candidates: add a local-only secure env bootstrap note or helper if owner wants Codex to maintain `.env.local` support values.

## Suggested Next Steps

1. Module 02 Concept Spec: 職場暗流雷達 v0.
2. If support operations continue before Module 02, run Email-hash Support Lookup Smoke after local hash secret alignment.
3. Support Resend Operator Action v0 after verification/rate-limit rules are approved.
