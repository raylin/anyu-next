# Module 01 Release Validation Suite v0 Handoff

## Date

2026-06-06

## Task

Implement reusable Module 01 validation suite commands that consolidate local, Preview(staging), and Production preflight checks and emit clear PASS / PARTIAL / BLOCKED summaries.

## Scope

QA orchestration scripts, package scripts, coverage summary output, tests, report, summary, and dashboard updates. No product behavior changes.

## Constraints

- Do not enable production runtime or checkout.
- Do not run production payment.
- Do not send production Email or LINE.
- Do not send real staging Email or LINE by default.
- Do not modify Vercel env.
- Do not apply DB migrations.
- Do not implement Admin CLI or Admin UI.
- Do not implement Module 02.
- Do not commit secrets or private data.

## Planned Work

1. Inspect existing QA command/script conventions.
2. Add Module 01 suite orchestration script(s) and package scripts:
   - `qa:module01:local`
   - `qa:module01:staging`
   - `qa:module01:production-preflight`
   - optional `qa:module01:release` if low-risk
3. Emit sanitized JSON summary files under `apps/web/.qa/`.
4. Include Admin API staging smoke as an optional/partial staging check when `ADMIN_API_TOKEN` and a safe result ID are available.
5. Add targeted tests for status aggregation and summary behavior.
6. Run required validation and QA suite commands.
7. Create execution report, update summary/dashboard, commit, and push.

## Validation

- `cd apps/web && corepack pnpm lint`
- targeted QA suite tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm run qa:module01:local`
- `cd apps/web && corepack pnpm run qa:module01:staging`
- `cd apps/web && corepack pnpm run qa:module01:production-preflight`
- `cd apps/web && corepack pnpm run qa:module01:release` if implemented
