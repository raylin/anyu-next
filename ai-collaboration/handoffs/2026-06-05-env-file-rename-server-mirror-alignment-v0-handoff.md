# Env File Rename / Server Mirror Alignment v0 Handoff

## Date

2026-06-05

## Task

Align local server env mirror naming around `apps/web/.env.staging` and `apps/web/.env.production`, update script/preflight assumptions, and document the new boundary.

## Context

Admin Ops Boundary + Env Naming Plan v0 established that local ops CLI should be a pure Admin API client and must not read web app env mirror files. Owner manually prepared `apps/web/.env.staging` and `apps/web/.env.production`. `apps/web/.env.local` and `apps/web/.env` are no longer intended server mirror names.

## Scope

Env file naming cleanup, script/preflight references, tests, docs/dashboard alignment. No Admin API/CLI implementation.

## Constraints

- Do not implement Admin API.
- Do not implement CLI.
- Do not enable production runtime or checkout.
- Do not run payment.
- Do not send Email or LINE messages.
- Do not modify Vercel env values.
- Do not apply DB migrations.
- Do not print env values, lengths, prefixes, suffixes, hashes, or checksums.
- Do not commit env files or private data.

## Planned Work

1. Presence-only env file and git-ignore safety check.
2. Inspect env loaders/preflights/smoke scripts.
3. Update scripts to load explicit `.env.staging` / `.env.production` mirror files where appropriate.
4. Add guardrails/warnings for deprecated `.env.local` / `.env` mirror use.
5. Update tests.
6. Update report, summary, and dashboard.
7. Run required validation, commit, and push to `origin/staging`.

## Validation

- `cd apps/web && corepack pnpm lint`
- targeted env/preflight tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm run qa:access-link:smoke`
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`
- `cd apps/web && corepack pnpm run qa:production:payment-preflight -- --source vercel-production --mode dry-run`
- docs presence, dashboard sanity, secret scan, `git diff --check`
