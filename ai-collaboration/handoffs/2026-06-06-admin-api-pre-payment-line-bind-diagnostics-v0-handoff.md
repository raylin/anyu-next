# Admin API Pre-Payment LINE Bind Diagnostics v0 Handoff

## Task

Add a safe Admin API + Admin CLI path to inspect pre-payment LINE bind diagnostic attempts by `resultId`.

## Shared Policy

Follow:

- `AGENTS.md`
- `ai-collaboration/process/codex-operating-policy.md`
- `ai-collaboration/process/qa-validation-policy.md`
- `ai-collaboration/process/env-mirror-policy.md`
- `ai-collaboration/process/admin-ops-boundary.md`
- `ai-collaboration/process/production-gate-policy.md`

## Timing

- taskStartedAt: `2026-06-06T16:29:11Z`
- taskCompletedAt: pending
- totalWallClockDuration: pending
- humanWaitDuration: pending
- netCodexWorkDuration: pending

## Scope

- Persist/query sanitized LINE bind diagnostic attempts by `resultId`.
- Add a read-only Admin API endpoint for diagnostics.
- Add an Admin CLI command for diagnostics lookup.
- Add targeted tests and structured documentation.

## Do Not

- Do not enable production runtime or checkout.
- Do not run production payment.
- Do not send Email or LINE.
- Do not modify Vercel env or local env mirror files.
- Do not mutate production data.
- Do not expose raw LINE identity, idToken, bind state, tokens, encrypted recipient, hashes, provider payloads, or tokenized URLs.
- Do not implement theme UI or Module 02.

## Validation Plan

- `cd apps/web && corepack pnpm lint`
- targeted LINE diagnostics / Admin API / CLI tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `corepack pnpm --filter @anyu/admin-cli test`
- `corepack pnpm --filter @anyu/admin-cli typecheck`
- `cd apps/web && corepack pnpm run qa:module01:mock-flow`
- `cd apps/web && corepack pnpm run qa:module01:ui`
- `cd apps/web && corepack pnpm run qa:module01:local`

## Expected Skips

- Skip `qa:module01:staging` unless migration/deployed endpoint verification is required.
- Skip `qa:module01:production-preflight` unless production schema/env/preflight behavior changes.
- Do not run `qa:module01:staging:channels`.

## Mainline Next Task

LINE production bind fix with targeted/mock/UI/staging validation, using the new diagnostics.
