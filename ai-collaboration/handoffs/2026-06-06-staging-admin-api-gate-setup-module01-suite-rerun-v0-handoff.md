# Staging Admin API Gate Setup + Module01 Suite Rerun v0 Handoff

## Date

2026-06-06

## Task

Configure Preview(staging) `ADMIN_API_TOKEN`, redeploy staging, verify Admin API auth/lookup smoke, rerun Module 01 suite, and keep Production frozen/fail-closed.

## Scope

Preview(staging) Admin API token setup, staging redeploy, safe staging result ID generation, Module 01 suite rerun, small suite policy fix if needed, docs/report/summary/dashboard. No production env changes.

## Constraints

- Do not modify Production env or set Production `ADMIN_API_TOKEN`.
- Do not enable production runtime or checkout.
- Do not run production payment.
- Do not send production Email or LINE.
- Do not print generated token value, length, prefix, suffix, hash, or checksum.
- Do not commit secrets or private data.
- Do not implement CLI, Admin UI, or Module 02.

## Planned Work

1. Check and patch Module 01 suite status policy so default skipped channel checks do not prevent staging pass.
2. Generate a strong Preview(staging) admin token and set only Vercel Preview `ADMIN_API_TOKEN`.
3. Redeploy Preview(staging) from the canonical project/source.
4. Generate a safe staging result ID via staging analyze flow without printing private content or tokenized URLs.
5. Run Admin API no-token / wrong-token / valid-token checks through `qa:module01:staging`.
6. Run required regression validation and production preflight.
7. Document results, commit, and push to `origin/staging`.

## Validation

- `cd apps/web && corepack pnpm lint`
- targeted Admin API / validation suite tests if code changed
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm run qa:module01:local`
- `cd apps/web && corepack pnpm run qa:module01:staging`
- `cd apps/web && corepack pnpm run qa:module01:production-preflight`
- docs presence, dashboard HTML sanity, secret/private scan, `git diff --check`
