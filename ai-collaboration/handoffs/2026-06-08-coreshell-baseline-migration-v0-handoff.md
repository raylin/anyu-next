# CoreShell Baseline Migration v0 Handoff

Shared policy:
Follow `AGENTS.md` and `ai-collaboration/process/*.md`.

Task started at: `2026-06-08T03:24:23Z`

## Goal

Implement a scoped CoreShell baseline for main ANYU site surfaces so Core routes have a neutral editorial park-entrance frame while Module 01 remains Riso-only and behavior is preserved.

## Scope

- CoreShell primitive / markers.
- Root homepage.
- Legal index and shared legal/privacy/refund/terms/disclaimer shell.
- Theme boundary regression tests.
- Report, dashboard, and summary documentation.

## Hard Rules

- No production runtime, payment, Email, LINE, Vercel env, DB mutation, Module 02, or provider logic changes.
- Do not redesign Module 01 flow surfaces in this task.
- Do not replace current product copy with archived design copy.
- CoreShell must not become Module 01 Riso-heavy.
- Preserve ModuleShell/Riso markers on Module 01 routes.

## Validation Plan

- `cd apps/web && corepack pnpm lint`
- targeted CoreShell/theme boundary tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm run qa:module01:ui`
- `cd apps/web && corepack pnpm run qa:module01:local`
- docs presence, dashboard HTML sanity, secret/private scan, `git diff --check`

