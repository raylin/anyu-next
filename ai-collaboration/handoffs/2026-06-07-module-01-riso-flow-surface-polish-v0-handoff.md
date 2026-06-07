# Module 01 Riso Flow Surface Polish v0 Handoff

Date: 2026-06-07

## Task

Polish the first set of Module 01 owned Riso flow surfaces after Theme Architecture Infrastructure v0: LINE bind loading/success/fallback states and the checkout-start save gate.

## Shared Policy

Follow `AGENTS.md` and `ai-collaboration/process/*.md`.

This task-specific handoff only repeats high-risk rules that are directly relevant.

## Completed Scope

- Added scoped Riso flow/save markers and styles for LINE bind and checkout save surfaces.
- Removed nested generic shell markup from the LINE recovery bind bridge; it now relies on the Module shell wrapper.
- Aligned LINE and Email save options around a shared Riso save-card/CTA/status visual language.
- Preserved current copy semantics, payment gating, Email save action, and LINE LIFF/bind logic.

## Do Not

- Do not run production runtime, production payment, real Email, or real LINE from this handoff.
- Do not treat archived design copy as source-of-truth.
- Do not change payment/access-link business logic during visual review follow-up.

## Owner Review Focus

- Review staging Module 01 checkout-start on mobile and desktop.
- Review `/line/recovery/bind` loading/fallback/success visual language when reachable in staging/mobile LINE context.
- Check whether LINE and Email save options now feel like one system.
- Identify visual polish only: spacing, accent strength, card weight, CTA hierarchy, and status presentation.

## Validation Run

- `cd apps/web && corepack pnpm lint`: pass.
- targeted LINE bind / checkout-start tests: pass.
- `cd apps/web && corepack pnpm test`: pass.
- `cd apps/web && corepack pnpm build`: pass.
- `cd apps/web && corepack pnpm run qa:module01:ui`: pass.
- `cd apps/web && corepack pnpm run qa:module01:local`: pass.
- `cd apps/web && corepack pnpm run qa:module01:mock-flow`: pass.
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`: pass.

## Recommended Next Task

Owner visual review on staging, then choose between more Riso visual polish, CoreShell migration, or Repeated / Concurrency Paid-Generation Benchmark v0.
