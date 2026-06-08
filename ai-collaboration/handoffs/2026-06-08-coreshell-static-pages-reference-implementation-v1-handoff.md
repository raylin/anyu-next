# CoreShell Static Pages Reference Implementation v1 Handoff

Shared policy:
Follow `AGENTS.md` and `ai-collaboration/process/*.md`.

Task started at: `2026-06-08T03:40:38Z`

## Goal

Make homepage and legal/static pages visibly closer to the archived CoreShell reference layout while preserving current copy, links, routes, and all Module 01/payment behavior.

## Reference Source

- `ai-collaboration/design/theme-architecture-v0/core-shell-screens.jsx`
- `ai-collaboration/design/theme-architecture-v0/THEME_ARCHITECTURE_MEMO.md`
- `ai-collaboration/design/theme-architecture-v0/README.md`

## Scope

- Homepage/root page.
- Legal index and shared legal/privacy/refund/terms/disclaimer shell.
- Small CoreShell/static-page structure and CSS.
- Route-level tests for visible CoreShell markers and ModuleShell boundary.

## Hard Rules

- Current app copy/legal text/links/routes remain source-of-truth.
- Do not touch Module 01 flow surfaces except boundary tests.
- No production runtime/payment, real Email/LINE, Vercel env, DB mutation, provider logic, LIFF logic, or payment/access-link behavior changes.
- Do not copy stale archived reference copy.
- Do not claim completion if changes are marker-only.

## Validation Plan

- `cd apps/web && corepack pnpm lint`
- targeted CoreShell/static route tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm run qa:module01:ui`
- `cd apps/web && corepack pnpm run qa:module01:local`
- docs presence, dashboard HTML sanity, secret/private scan, `git diff --check`

