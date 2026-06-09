# Module 01 Paid-State Surfaces Reference Alignment v0 Handoff

Date: 2026-06-09

## Task

Align Module 01 paid-adjacent state surfaces to the Riso/reference visual system before real payment activation. Treat the work as shared paid-state primitive alignment first, then apply those primitives to ReturnURL, paid result, `/r`, pending, expired, invalid, and failure surfaces where safe.

## Shared Policy

Follow `AGENTS.md` and `ai-collaboration/process/*.md`.

This task-specific handoff only repeats high-risk rules that are directly relevant.

## Scope

- Module 01 paid-state route/component inventory.
- Shared Riso paid-state/status/card/CTA primitives.
- Visual alignment for ReturnURL/payment status, paid result, `/r` access-link states, and paid generation pending/error states.
- Tests protecting behavior, route boundaries, and safe output.
- Report/dashboard/summary updates.

## Do Not

- Do not run production runtime, production payment, real Email, real LINE, Vercel env sync, or DB mutation.
- Do not change NewebPay logic, entitlement/access-link resolver behavior, generation-job behavior, LIFF/provider logic, or payment runtime controls.
- Do not replace current copy meaning with stale reference copy.
- Do not create broad unrelated design-system abstractions.

## Task-Specific Requirements

1. Inventory paid-state routes/components and state variants.
2. Map current primitives to archived Riso reference equivalents.
3. Align shared paid-state primitives before route-specific styling.
4. Report missing reference states for Claude Design.
5. Preserve behavior and ModuleShell/Riso boundaries.

## Validation Selection

Run:

- `cd apps/web && corepack pnpm lint`
- targeted paid-state/access-link/return/result tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm run qa:module01:ui`
- `cd apps/web && corepack pnpm run qa:module01:local`
- `cd apps/web && corepack pnpm run qa:module01:mock-flow`

Skip:

- production/runtime/payment/channel checks: out of scope.
- staging channel sends: out of scope.

## Recommended Next Task

Owner visual review of paid-adjacent surfaces, then choose Claude Design gap generation, Module 01 Riso flow polish, or checkout/payment runtime activation preparation after visual state matrix is acceptable.
