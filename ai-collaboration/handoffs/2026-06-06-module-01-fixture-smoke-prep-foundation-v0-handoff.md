# Module 01 Fixture + Smoke Prep Foundation v0 Handoff

Date: 2026-06-07

## Task

Create a reusable Module 01 fixture and smoke-prep foundation so future local/mock/staging/production smoke flows use validated fixtures instead of ad hoc synthetic input.

## Shared Policy References

Follow:

- `AGENTS.md`
- `ai-collaboration/process/codex-operating-policy.md`
- `ai-collaboration/process/qa-validation-policy.md`
- `ai-collaboration/process/env-mirror-policy.md`
- `ai-collaboration/process/admin-ops-boundary.md`
- `ai-collaboration/process/production-gate-policy.md`

## Scope

- Inventory existing Module 01 synthetic input and checkout fixtures.
- Add shared typed Module 01 fixtures under `apps/web/src/tests/fixtures/module01/`.
- Add a smoke-prep helper command that emits sanitized `.qa` artifacts.
- Migrate prioritized QA paths to shared fixtures.
- Update tests and process docs so production smoke uses tracked validated fixtures.

## Do Not

- Do not enable production runtime or checkout.
- Do not run production payment.
- Do not send production Email or LINE.
- Do not modify Vercel env.
- Do not mutate DB data or apply migrations.
- Do not implement LINE/LIFF fixes, theme UI, or Module 02.
- Do not commit secrets/private data or env files.
- Do not add ad hoc dynamic scripts or heredoc snippets.

## Validation Plan

- `cd apps/web && corepack pnpm lint`
- targeted fixture / QA helper tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm run qa:module01:mock-flow`
- `cd apps/web && corepack pnpm run qa:module01:ui`
- `cd apps/web && corepack pnpm run qa:module01:local`

Staging and production-preflight should be skipped unless this task changes deployed or production/preflight behavior.

## Timing

- taskStartedAt: `2026-06-06T16:03:33Z`
