# Vercel Alias Target Proof Resolution v0 Handoff

## Task

Resolve the production runtime-window alias proof blocker so `qa:production:runtime-window` and `qa:module01:production-preflight` can safely prove whether `anyu.tw` and `www.anyu.tw` target the canonical Vercel project `anyu-next`.

## Shared Policy

Follow `AGENTS.md` and:

- `ai-collaboration/process/codex-operating-policy.md`
- `ai-collaboration/process/qa-validation-policy.md`
- `ai-collaboration/process/env-mirror-policy.md`
- `ai-collaboration/process/admin-ops-boundary.md`
- `ai-collaboration/process/production-gate-policy.md`
- `ai-collaboration/process/handoff-template.md`

## Scope

- Vercel alias inspection/proof helper.
- Runtime-window and production-preflight integration.
- Tests and docs/report/dashboard updates.
- No production runtime enablement.

## Hard Rules

- Do not enable production runtime or checkout.
- Do not run production payment.
- Do not send Email or LINE.
- Do not modify Vercel env values.
- Do not mutate DB data or apply migrations.
- Do not print Vercel auth tokens, env values, secret values, or value-derived metadata.
- Do not silently downgrade alias proof failure to warning.

## Validation Target

- `cd apps/web && corepack pnpm lint`
- targeted runtime-window / alias guard / production preflight tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status`
- `cd apps/web && corepack pnpm run qa:module01:production-preflight`

## Reporting

Report model/effort, timing fields, methods inspected, selected proof method, aliasGuardStatus, runtime-window result, production-preflight result, gates skipped and why, production untouched confirmation, and next task in mainline.
