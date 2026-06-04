# Local / Staging DB Branch Reconciliation v0

## Status

Completed as a read-only investigation.

No env files, Vercel env values, database schema/data, code, aliases, payment runtime flags, or deployment targets were changed.

## Purpose

Clarify whether `apps/web/.env.local` `DATABASE_URL` should be treated as Preview(staging) or as a separate local/dev database branch, then recommend the correct support ops lookup source.

## Safety Boundaries

- No connection strings, DB credentials, env values, value lengths, prefixes, suffixes, hashes, checksums, raw Email, raw LINE IDs, tokens, encrypted recipients, source text, or provider payloads were printed.
- Database checks were read-only schema/count probes.
- Production remained fail-closed; no payment or provider message was sent.

## Local Env File Presence

Presence-only result:

| Source | Exists | Relevant key presence |
| --- | --- | --- |
| `apps/web/.env.local` | yes | `DATABASE_URL` present; `SUPPORT_OPS_DATABASE_URL` absent; no Neon branch/project hint keys found |
| `apps/web/.env` | yes | `DATABASE_URL` present; `SUPPORT_OPS_DATABASE_URL` absent; no Neon branch/project hint keys found |
| root `.env.local` | no | not applicable |
| root `.env` | yes | no DB/support/Neon hint keys found |

## Local `.env.local` Database Probe

Using `apps/web/.env.local` `DATABASE_URL`, the read-only schema probe found:

| Check | Result |
| --- | --- |
| clean access-link schema present | no |
| old recovery schema present | no |
| base payment schema present | no |

Payment/access-link table presence:

| Table | Present | Aggregate count |
| --- | --- | --- |
| `payment_access_link_contacts` | no | not applicable |
| `paid_result_access_links` | no | not applicable |
| `payment_access_link_contact_secrets` | no | not applicable |
| `payment_recovery_contacts` | no | not applicable |
| `paid_result_recovery_links` | no | not applicable |
| `payment_recovery_contact_secrets` | no | not applicable |
| `payment_intents` | no | not applicable |
| `entitlements` | no | not applicable |
| `generation_jobs` | no | not applicable |

Public tables found in local `.env.local` DB:

| Table | Aggregate count |
| --- | ---: |
| `analysis_requests` | 1 |
| `analysis_results` | 1 |
| `contact_submissions` | 2 |
| `events` | 324 |
| `sessions` | 209 |
| `unlock_intents` | 1 |

Interpretation: local `.env.local` `DATABASE_URL` is not the Preview(staging) clean access-link database and not a migrated payment/access-link local database.

## Neon Branch Findings

Project metadata shows three relevant branch categories:

| Branch category | Finding |
| --- | --- |
| Preview(staging) | exists; clean access-link/payment schema present |
| dev/local | exists; older analysis/session/unlock schema present |
| Production | exists; not mutated by this task |

### Host Preview(staging)

Read-only schema/count probe on the Preview(staging) branch found:

| Table | Present | Aggregate count |
| --- | --- | ---: |
| `payment_access_link_contacts` | yes | 2 |
| `paid_result_access_links` | yes | 17 |
| `payment_access_link_contact_secrets` | yes | 1 |
| `payment_recovery_contacts` | no | not applicable |
| `paid_result_recovery_links` | no | not applicable |
| `payment_recovery_contact_secrets` | no | not applicable |
| `payment_intents` | yes | 256 |
| `entitlements` | yes | 133 |
| `generation_jobs` | yes | 122 |

Interpretation: Host Preview(staging) has the expected clean access-link schema and old recovery-named tables are absent.

### dev/local

Read-only schema/count probe on the Neon `dev/local` branch found the same public table set and aggregate counts as `apps/web/.env.local`:

| Table | Aggregate count |
| --- | ---: |
| `analysis_requests` | 1 |
| `analysis_results` | 1 |
| `contact_submissions` | 2 |
| `events` | 324 |
| `sessions` | 209 |
| `unlock_intents` | 1 |

Payment/access-link and recovery-named tables are absent on `dev/local`.

Interpretation: `apps/web/.env.local` `DATABASE_URL` matches the `dev/local` branch category by schema and aggregate counts. This strongly supports treating it as an intentional or historical local-dev DB branch, not as Vercel Preview(staging).

## Vercel Env Source Findings

Name-only Vercel metadata check:

| Source | Finding |
| --- | --- |
| Vercel Preview | canonical project is `anyu-next`; general Preview has `DATABASE_URL`; branch-scoped Preview(staging) has payment/access-link/Email/LINE/runtime key names present |
| Vercel Production | canonical project is `anyu-next`; payment/access-link/Email/LINE/runtime key names are present; runtime enable flags are absent in dry-run mode |

Repo root Vercel project link points to canonical `anyu-next`. `apps/web/.vercel/project.json` is absent, so the previous accidental `web` project link is no longer present.

## Comparison Classification

Classification: `same_project_different_branch` with likely `local_dev_branch_intentional`.

Evidence:

- local `.env.local` DB has no payment/access-link tables.
- Host Preview(staging) has clean access-link/payment tables.
- Neon `dev/local` exists and has the same public table set and aggregate counts as the local `.env.local` DB.
- Historical reports already warned that local `.env.local` DB can differ from Preview(staging).

The local DB may be stale relative to the current payment work, but it is not accidental evidence that Preview(staging) is missing migrations.

## Support Ops Recommendation

Recommended option: **Option A, with optional local-dev cleanup later.**

- Keep `apps/web/.env.local` `DATABASE_URL` as local/dev DB unless the owner explicitly wants to repoint it.
- Use `SUPPORT_OPS_DATABASE_URL` for Preview(staging) support lookup.
- Do not allow support lookup for staging artifacts to silently use local `.env.local` `DATABASE_URL`, because it targets `dev/local` and cannot see staging payment/access-link rows.
- Keep the current schema-gated fallback behavior: `DATABASE_URL` may be used only when the clean access-link schema probe passes.

Optional later cleanup:

- If local development should exercise Module 01 payments locally, migrate or reset the `dev/local` branch to the clean access-link/payment schema in a separate approved task.
- Even if local/dev is migrated, support lookup for Preview(staging) artifacts should still prefer explicit `SUPPORT_OPS_DATABASE_URL` to avoid cross-branch confusion.

## Baseline Status Implication

Module 01 staging user-channel baseline remains strong from the user perspective:

- real staging Email was owner-verified received and `/r/` opened the completed paid result.
- real staging LINE was owner-verified received and `/r/` opened the completed paid result.
- automated access-link/no-card/LINE staging QA passed in the previous baseline task.

However, the formal baseline remains **partial** until support lookup runs against Preview(staging). The blocker is not a product-flow failure; it is a local operator DB source issue:

- `SUPPORT_OPS_DATABASE_URL` is missing locally.
- `.env.local DATABASE_URL` is valid for `dev/local`, but not valid for Preview(staging) support lookup.

Recommended baseline next step:

1. Provide Preview(staging) `SUPPORT_OPS_DATABASE_URL` through a secure untracked local mechanism.
2. Rerun `qa:env:preflight -- support-ops-lookup`.
3. Run `ops:paid-result:lookup` against the known staging artifacts.
4. If sanitized lookup succeeds, upgrade Module 01 staging baseline to PASS.

## Production Freeze Check

`qa:production:payment-preflight -- --source vercel-production --mode dry-run` passed with:

- production public pages live.
- production checkout/fake-paid routes fail closed.
- canonical project link aligned.
- no runtime enable flags present in dry-run mode.

No production env, runtime flag, DB, payment, Email, or LINE state was changed.

## Tech Debt Review

New technical debt introduced: none.

Existing technical debt observed:

- `dev/local` branch is stale relative to current Module 01 payment/access-link schema.
- support lookup still requires a clean Preview(staging) operator DB source.
- recovery-named env vars remain intentionally retained compatibility.
- local/env source expectations need a short durable runbook so future tasks do not rediscover this model.

Opportunistic cleanup completed: none; task was read-only except documentation.

Deferred cleanup candidates:

- Add an operator runbook entry: `.env.local DATABASE_URL` is local/dev unless schema-probed clean; Preview(staging) support lookup uses `SUPPORT_OPS_DATABASE_URL`.
- Decide whether to migrate/reset `dev/local` for local Module 01 development.
- Add a non-secret branch-category preflight helper if support ops work continues to hit local/Preview confusion.

## Architecture Decisions

- Do not repoint `.env.local` in this task.
- Do not treat `.env.local DATABASE_URL` as Preview(staging).
- Keep support ops lookup source policy explicit: `SUPPORT_OPS_DATABASE_URL` first, schema-verified `DATABASE_URL` only when clean access-link tables exist.

## Blockers

- Support lookup against staging artifacts remains blocked until `SUPPORT_OPS_DATABASE_URL` points to Preview(staging), or another operator-approved clean Preview(staging) DB source is made available locally.

## Suggested Next Steps

1. Support Ops Preview DB URL Bootstrap v2: provide `SUPPORT_OPS_DATABASE_URL` through a secure untracked local source and run support lookup against the known staging artifacts.
2. If support lookup passes, mark Module 01 staging baseline PASS and ask owner acceptance before any production smoke retry.
3. Later: decide whether to migrate/reset `dev/local` for local payment/access-link development.
