# Admin Ops Boundary Cleanup v0 Handoff

## Date

2026-06-06

## Task

Deprecate or remove the legacy direct DB support lookup path so Admin API + `pnpm ops lookup-result` is the only active/recommended support lookup path.

## Scope

Cleanup active scripts/package entries/tests/docs/dashboard. No runtime behavior change, env changes, payment, Email, LINE, DB migrations, Admin UI, resend/mutation, or Module 02.

## Constraints

- Do not enable production runtime or checkout.
- Do not run payment.
- Do not send Email/LINE.
- Do not modify Vercel env or local env files.
- Do not change Admin API behavior unless docs/copy requires it.
- Do not commit secrets/private data.
- Prefer removing active direct DB lookup; if retained, it must be a non-querying deprecated stub.

## Planned Work

1. Inventory references to `support-paid-result-lookup`, `ops:paid-result:lookup`, `support-ops-lookup`, and `SUPPORT_OPS_DATABASE_URL`.
2. Remove or disable active direct DB lookup script/package references.
3. Update env preflight support-ops behavior if it only exists for direct DB lookup.
4. Update tests so legacy path cannot silently use DB env and Admin CLI remains the active path.
5. Update dashboard/report/summary with current ops command.
6. Run required validation and push to `origin/staging`.

## Validation

- `corepack pnpm --filter @anyu/admin-cli test`
- `corepack pnpm --filter @anyu/admin-cli typecheck`
- `cd apps/web && corepack pnpm lint`
- targeted module01/env/legacy support tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm run qa:module01:local`
- `cd apps/web && corepack pnpm run qa:module01:staging`
- `cd apps/web && corepack pnpm run qa:module01:production-preflight`
- docs presence, dashboard HTML sanity, secret/private scan, `git diff --check`
