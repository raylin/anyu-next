# Module 01 Reference-Aligned Riso Save + LINE Bind Surfaces v1 Handoff

Date: 2026-06-08

## Task

Rework Module 01 checkout save and LINE bind surfaces so they visibly move closer to the accepted archived Riso reference while preserving current behavior and copy semantics.

## Shared Policy

Follow `AGENTS.md` and `ai-collaboration/process/*.md`.

This task-specific handoff only repeats high-risk rules that are directly relevant.

## Scope

- LINE bind loading/success/fallback visual structure.
- Checkout LINE save option and Email fallback/save option visual structure.
- Shared Riso save card, CTA, badge, and status primitives.
- Structural/style-marker tests and local UI QA.

## Do Not

- Do not run production runtime, production payment, real Email, or real LINE.
- Do not modify Vercel env or DB data.
- Do not change payment/access-link, Email save, or LIFF bind business logic.
- Do not copy stale archive product copy into the app.
- Do not add theme A/B logic.

## Acceptance Notes

- Tests passing is not enough if the result only changes colors/classes.
- The implementation must visibly align more closely with the reference card shape, CTA language, offset shadows, spacing, and hierarchy.
- Current app copy/flow remains source-of-truth.

## Validation Selection

Run:

- `cd apps/web && corepack pnpm lint`
- targeted LINE/checkout/theme tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm run qa:module01:ui`
- `cd apps/web && corepack pnpm run qa:module01:local`
- `cd apps/web && corepack pnpm run qa:module01:mock-flow`
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`

Skip:

- production runtime/payment and real Email/LINE because the task is local visual/layout implementation.
- staging real channels because no real sends are allowed.

## Reporting Requirements

Report:

- visual spec mapping before implementation
- why v0 was insufficient
- surfaces changed
- components/primitives/classes reused or added
- behavior preserved
- tests/gates run
- remaining visual gaps for owner review
- production untouched confirmation

## Recommended Next Task

Owner visual review on staging, then choose ReturnURL / paid result / `/r` / expired Riso alignment or CoreShell migration.
