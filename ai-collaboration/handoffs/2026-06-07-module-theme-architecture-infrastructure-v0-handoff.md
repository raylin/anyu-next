# Module Theme Architecture Infrastructure v0 Handoff

## Shared Policy

Follow `AGENTS.md` and `ai-collaboration/process/*.md`.

## Scope

Implement the first safe theme infrastructure slice:

- establish CoreShell / ModuleShell / theme resolver boundaries
- force Module 01 to Riso-only
- reduce visual tearing on owned Module 01 flow pages
- preserve payment/access-link behavior and current copy semantics

## Safety Boundaries

- No production runtime open.
- No production payment.
- No Email or LINE send.
- No Vercel env change.
- No DB mutation.
- No Module 02 implementation.
- No NewebPay provider logic change.
- No full visual redesign or archived-copy replacement.

## Implementation Notes

- Active classic/Riso A/B switching must be removed or neutralized.
- Legacy classic query/token hints may remain parse-compatible only if they resolve to Riso.
- Shared flow routes should use module theme when module context is known.
- Routes that cannot safely resolve module context should use Core fallback, not guessed private/token context.

## Validation Plan

- `cd apps/web && corepack pnpm lint`
- targeted theme/resolver/layout tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm run qa:module01:ui`
- `cd apps/web && corepack pnpm run qa:module01:local`
- extra: `qa:module01:mock-flow` and `qa:result-checkout:no-card` because flow shells were touched

## Recommended Next Task

Owner visual review of Module 01 flow, then Module 01 Riso Flow Surface Polish v0 or the next prioritized product/theme slice.
