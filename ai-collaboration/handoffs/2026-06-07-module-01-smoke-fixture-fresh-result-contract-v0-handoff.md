# Module 01 Smoke Fixture Fresh Result Contract v0 Handoff

## Task

Update Module 01 smoke fixture foundation so production smoke can create a fresh result each run without ad hoc input generation.

## Shared Policy References

- `AGENTS.md`
- `ai-collaboration/process/codex-operating-policy.md`
- `ai-collaboration/process/qa-validation-policy.md`
- `ai-collaboration/process/admin-ops-boundary.md`
- `ai-collaboration/process/production-gate-policy.md`
- `ai-collaboration/process/handoff-template.md`
- `ai-collaboration/process/report-template.md`

## Scope

- Inspect analyze cache behavior.
- Add tracked fresh fixture contract with `smokeRunId`.
- Update `qa:module01:smoke-fixture` summary and artifacts.
- Add tests proving fresh fixture changes cache-relevant input.
- Update production smoke process docs.

## Do Not

- Do not enable production runtime.
- Do not run production payment.
- Do not send Email or LINE.
- Do not mutate production data.
- Do not delete DB rows to bypass cache.
- Do not invent ad hoc request bodies.

## Validation

- `cd apps/web && corepack pnpm lint`
- targeted fixture/cache/smoke-fixture tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm run qa:module01:smoke-fixture -- --json`
- `cd apps/web && corepack pnpm run qa:module01:mock-flow`
- `cd apps/web && corepack pnpm run qa:module01:ui`
- `cd apps/web && corepack pnpm run qa:module01:local`

## Recommended Next Task

Controlled Production Payment Smoke Retry with Scoped Runtime Config v2.
