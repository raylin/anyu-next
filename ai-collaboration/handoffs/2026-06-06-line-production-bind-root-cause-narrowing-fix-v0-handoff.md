# LINE Production Bind Root-Cause Narrowing + Fix v0 Handoff

## Task

Narrow and fix the production LINE bind failure using the diagnostics foundation, without another production smoke or owner trial-and-error.

## Shared Policy

Follow:

- `AGENTS.md`
- `ai-collaboration/process/codex-operating-policy.md`
- `ai-collaboration/process/qa-validation-policy.md`
- `ai-collaboration/process/env-mirror-policy.md`
- `ai-collaboration/process/admin-ops-boundary.md`
- `ai-collaboration/process/production-gate-policy.md`

## Timing

- taskStartedAt: `2026-06-06T16:52:16Z`
- taskCompletedAt: pending
- totalWallClockDuration: pending
- humanWaitDuration: pending
- netCodexWorkDuration: pending

## Scope

- Gather safe production failure context from existing artifacts.
- Use Admin API/CLI diagnostics if a production result ID is available.
- Compare staging vs production LINE/LIFF config categories without printing secrets.
- Inspect and test bind bridge state handling.
- Implement a targeted code/config fix only after narrowing the root cause.
- Validate with targeted tests, mock-flow, UI, local, and staging only if deployed behavior requires it.

## Do Not

- Do not enable production runtime or checkout.
- Do not run production payment.
- Do not send production Email or LINE.
- Do not ask owner to retry production LINE as a diagnostic step.
- Do not mutate production data or Vercel env without explicit approval.
- Do not expose raw LINE identity, idToken, raw bind state, tokens, encrypted recipient, hashes, or tokenized URLs.
- Do not implement theme UI or Module 02.
- Do not use ad hoc heredoc scripts.

## Validation Plan

- targeted LINE/LIFF tests
- `cd apps/web && corepack pnpm run qa:module01:mock-flow`
- `cd apps/web && corepack pnpm run qa:module01:ui`
- `cd apps/web && corepack pnpm run qa:module01:local`
- `qa:module01:staging` only if deployed route/client behavior must be verified
- `qa:module01:production-preflight` only if production/env/preflight behavior changes

## Mainline Next Task

Production Runtime Window + Vercel Alias Guard v0 if the code/config fix is validated.
