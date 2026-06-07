# QA Foundation Follow-up v2 Handoff

## Shared Policy

Follow `AGENTS.md` and `ai-collaboration/process/*.md`.

## Task

Clean up QA/testing/tooling debt after Gate 1 acceptance without production runtime, payment, real Email/LINE sends, Vercel env changes, DB mutation, theme UI, or Module 02 work.

## Initial Inventory / Acceptance Plan

- `qa:module01:staging:channels`: fix now as a guarded plan/dry-run runner; real sends remain deferred until owner-approved staging recipients and channel runner scope are explicitly defined.
- Playwright Module 01 UI harness: fix now by adding actual checkout route-shape coverage while keeping provider/backend mocked.
- no-card wait: fix now by making Admin API result lookup the primary readiness wait after fake-paid; keep tokenized `/r` path only for final render verification.
- one-time ops credential migration helper: document lifecycle now as owner-approved one-time helper outside normal `pnpm ops`; keep with tests.
- event / diagnostic retention: document lifecycle now; do not add deletion job in this task.
- inactive delivery runtime config keys: no code action needed; document that keys remain inactive until sender code reads them.
- legacy module ReturnURL route: review and document as compatibility-only unless a small safe redirect cleanup is obvious.
- stale dashboard/process references: update only active QA debt/status; do not rewrite historical reports broadly.

## Validation Plan

- `cd apps/web && corepack pnpm lint`
- targeted QA/channel/no-card/Playwright/runtime-config tests
- `cd apps/web && corepack pnpm test`
- `corepack pnpm --filter @anyu/admin-cli test`
- `corepack pnpm --filter @anyu/admin-cli typecheck`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm run qa:module01:ui`
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`
- `cd apps/web && corepack pnpm run qa:module01:staging:channels` expected `owner_approval_required`
- `cd apps/web && corepack pnpm run qa:module01:mock-flow`
- `cd apps/web && corepack pnpm run qa:module01:local`

## Safety Notes

- No production runtime open.
- No production payment.
- No real Email/LINE sends.
- No Vercel env or DB mutation.
- No direct DB fallback for QA/Admin token issues.
