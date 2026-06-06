# Staging Admin CLI Lookup Smoke + Suite Integration v0 Handoff

## Date

2026-06-06

## Task

Clean root Admin CLI command wiring, run live Preview(staging) Admin CLI lookup smoke, integrate Admin CLI lookup into `qa:module01:staging`, and keep Production frozen/fail-closed.

## Scope

CLI packaging/wiring cleanup, staging live CLI smoke, Module 01 staging suite integration, tests, docs/report/summary/dashboard. No production runtime, payment, Email, LINE, Vercel env, DB, Neon, Admin UI, resend, mutation, or Module 02.

## Constraints

- CLI must not load `apps/web/.env.staging`, `.env.production`, `.env.local`, or `.env`.
- CLI must read only `ADMIN_API_TOKEN` from current process env.
- Any operator-side token sourcing for smoke must happen outside CLI implementation.
- Do not expose token value, length, prefix, suffix, hash, or checksum.
- Do not expose DB URLs, raw Email, LINE ID, encrypted recipient, hashes, raw tokens, tokenized URLs, provider payloads, source text, merchant order raw values, or provider message IDs.
- Do not set or change Production env.
- Do not run real Email/LINE channel command.

## Planned Work

1. Replace rough root command wiring with clean workspace package script/bin wiring.
2. Add Admin CLI lookup check to `qa:module01:staging` summary.
3. Add tests for root script wiring and staging suite `adminCliLookup` behavior.
4. Run live staging CLI pretty and JSON lookup with explicit shell `ADMIN_API_TOKEN` and safe result ID.
5. Verify missing-token, wrong-token, missing-env, and missing-id CLI failures.
6. Run required validation gates.
7. Document, commit, and push to `origin/staging`.

## Validation

- `corepack pnpm install/check` if lockfile changes
- `corepack pnpm --filter @anyu/admin-cli test`
- `corepack pnpm --filter @anyu/admin-cli typecheck`
- root command no-live error checks
- live staging CLI lookup, pretty and JSON
- `cd apps/web && corepack pnpm lint`
- targeted suite/CLI tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm run qa:module01:local`
- `cd apps/web && corepack pnpm run qa:module01:staging`
- `cd apps/web && corepack pnpm run qa:module01:production-preflight`
- docs presence, dashboard HTML sanity, secret/private scan, `git diff --check`
