# CoreShell Static Pages Reference Rebuild v2 Handoff

Shared policy:
Follow `AGENTS.md` and `ai-collaboration/process/*.md`.

Task started at: `2026-06-08T04:01:00Z`

## Goal

Rebuild CoreShell static pages toward the archived CoreShell reference instead of preserving the v1 visual structure.

## Scope

- Homepage/root static layout.
- Legal/privacy/refund/terms/disclaimer shared static layout.
- CoreShell static-page CSS/tokens.
- Tests for CoreShell static markers and ModuleShell boundary.

## Reference

- `ai-collaboration/design/theme-architecture-v0/core-shell-screens.jsx`
- `ai-collaboration/design/theme-architecture-v0/THEME_ARCHITECTURE_MEMO.md`
- `ai-collaboration/design/theme-architecture-v0/README.md`

## Hard Rules

- Current copy, legal meaning, links, and routes remain source-of-truth.
- Do not touch Module 01 payment/access-link/LINE/Email/LIFF logic.
- No production runtime/payment, real Email/LINE, Vercel env, DB mutation, provider logic, or Module 02.
- Do not copy stale reference legal/product text.

## Validation Plan

- `cd apps/web && corepack pnpm lint`
- targeted CoreShell/static tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm run qa:module01:ui`
- `cd apps/web && corepack pnpm run qa:module01:local`
- screenshots for homepage/privacy/refund/terms if local browser tooling works

