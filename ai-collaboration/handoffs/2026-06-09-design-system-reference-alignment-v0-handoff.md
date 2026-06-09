# Design System Reference Alignment v0 Handoff

Date: 2026-06-09

## Task

Continue the visual track as design-system alignment, not page-by-page polish. Compare current ANYU Core/Riso shared tokens, CSS primitives, and layout patterns against the archived reference design system, adopt clear reference patterns at the shared layer, and document remaining missing reference states.

## Shared Policy

Follow `AGENTS.md` and `ai-collaboration/process/*.md`.

This task-specific handoff only repeats high-risk rules that are directly relevant.

## Scope

- CoreShell and Module 01 Riso shared visual primitives / token mapping.
- Static/Core page and shared Riso flow CSS structure only where it follows from shared primitives.
- Tests protecting structure, behavior boundaries, and no classic/Riso reintroduction.
- Report/dashboard/summary updates.

## Do Not

- Do not run production runtime, payment, Email, LINE, Vercel env sync, or DB mutation.
- Do not change product flow, copy semantics, routes, payment/access-link logic, LIFF bind logic, or Email save logic.
- Do not implement Module 02.
- Do not claim visual completion from markers/tests alone; owner review against the reference remains required.

## Task-Specific Requirements

1. Map current tokens/components/layout primitives to reference equivalents.
2. Adopt clear reference patterns in shared Core/Riso primitives where safe.
3. List old visual-system pieces replaced or removed.
4. List missing reference components/states and concrete Claude Design questions.
5. Preserve current behavior and route boundaries.

## Validation Selection

Run:

- `cd apps/web && corepack pnpm lint`
- targeted CoreShell / theme boundary tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm run qa:module01:ui`
- `cd apps/web && corepack pnpm run qa:module01:local`

Skip:

- production/runtime/payment/channel checks: out of scope.
- full staging gates: no deployed integration behavior changed.

## Recommended Next Task

Owner visual review against the reference, then targeted CoreShell/Module 01 visual defect fixes or additional reference component requests.
