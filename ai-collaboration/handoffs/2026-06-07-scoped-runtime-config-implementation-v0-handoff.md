# Scoped Runtime Config Implementation v0 Handoff

## Task

Implement Scoped Runtime Config v0.

## Shared Policy References

- `AGENTS.md`
- `ai-collaboration/process/codex-operating-policy.md`
- `ai-collaboration/process/qa-validation-policy.md`
- `ai-collaboration/process/env-mirror-policy.md`
- `ai-collaboration/process/admin-ops-boundary.md`
- `ai-collaboration/process/production-gate-policy.md`
- `ai-collaboration/process/handoff-template.md`
- `ai-collaboration/process/report-template.md`

## Scope

- Add DB-backed runtime config values and audit events.
- Add registry-first runtime config resolver.
- Add Admin API read/write routes.
- Add `pnpm ops config` CLI commands.
- Migrate Module 01 payment runtime gating away from frequent Vercel env toggles.
- Update runtime-window and production preflight helpers to use scoped runtime config.
- Clean up replaced runtime flag references where safe.
- Add tests, docs, report, summary, dashboard updates.

## Hard Rules

- Do not run production payment.
- Do not send Email or LINE.
- Do not enable ads or non-card payment methods.
- Do not store secrets in runtime config.
- Do not expose secrets, env values, hashes, checksums, connection strings, or tokenized URLs.
- Do not commit env files.
- Do not leave two competing primary runtime gates.

## Validation Plan

- `cd apps/web && corepack pnpm lint`
- targeted runtime-config/Admin API/CLI/preflight tests
- `cd apps/web && corepack pnpm test`
- `corepack pnpm --filter @anyu/admin-cli test`
- `corepack pnpm --filter @anyu/admin-cli typecheck`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status`
- `cd apps/web && corepack pnpm run qa:module01:production-preflight`
- `cd apps/web && corepack pnpm run qa:module01:mock-flow`
- `cd apps/web && corepack pnpm run qa:module01:ui`
- `cd apps/web && corepack pnpm run qa:module01:local`

## Report

Create `ai-collaboration/reports/2026-06-07-scoped-runtime-config-implementation-v0.md` using the canonical report template.
