# CoreShell Baseline Migration v0

## Metadata

- task name: CoreShell Baseline Migration v0
- date: 2026-06-08
- report path: `ai-collaboration/reports/2026-06-08-coreshell-baseline-migration-v0.md`
- commit: b12b35d
- branch / push status: pushed to `origin/staging`
- model / effort: GPT-5 Codex, high effort
- taskStartedAt: 2026-06-08T03:24:23Z
- taskCompletedAt: 2026-06-08T03:30:19Z
- totalWallClockDuration: 5m56s
- humanWaitDuration: 0m
- netCodexWorkDuration: 5m56s

## Context

- why this task exists: Gate 1 is accepted and Module 01 is Riso-only, so the main ANYU site needs a neutral editorial CoreShell baseline before broader visual review.
- owner direction: implement CoreShell first; do not treat this as final visual polish; preserve current app copy/flow and avoid Module 01 flow rewrite.
- out-of-scope items: production runtime/payment, Email/LINE sends, Vercel env, DB mutation, Module 02, checkout/save UI redesign, LIFF/payment/access-link logic, archived-copy replacement, and pixel-perfect reference matching.

## Core Route Inventory

| route / surface | current state before task | action | risk |
| --- | --- | --- | --- |
| `/` homepage | hand-rolled `main.anyu-shell anyu-storefront-shell`; product copy already source-of-truth | migrated to `CoreShell` with storefront class preserved | low; static route only |
| `/legal` legal index | hand-rolled `main.anyu-shell anyu-legal-shell` | migrated to `CoreShell` with legal class preserved | low; static route only |
| `/privacy`, `/refund`, `/terms`, `/disclaimer` | shared `LegalPageShell` hand-rolled `main.anyu-shell anyu-legal-shell` | migrated shared legal shell to `CoreShell` | low; content unchanged |
| `/m/[moduleSlug]` Module 01 landing | Module-owned surface using Module 01 landing shell internals | deferred; must remain ModuleShell/Riso | medium if changed; not touched |
| checkout / LINE bind / ReturnURL / paid result / `/r` | Module-owned or context-resolved shared flow surfaces | deferred; not CoreShell targets for this slice | high if changed; not touched |
| unknown shared fallback routes | no new route fallback added | deferred until a concrete route needs fallback behavior | low |

## CoreShell Implementation Result

- `CoreShell` now emits stable markers:
  - `data-shell="core"`
  - `data-core-shell="true"`
  - `data-theme="core"`
  - `data-theme-owner="core"`
- `/`, `/legal`, and the shared legal page shell now use `CoreShell` instead of hand-rolled `main.anyu-shell` wrappers.
- The CSS baseline adds a quiet Core treatment:
  - warm paper field remains based on existing tokens.
  - subtle top brand rule.
  - neutral Core card border/background/shadow refinement.
  - no Riso-heavy thick ink borders or Module 01 accent shadows.
- No broad component library was introduced.

## Routes / Components Changed

- `apps/web/src/components/anyu/CoreShell.tsx`
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/legal/page.tsx`
- `apps/web/src/components/anyu/LegalPageShell.tsx`
- `apps/web/src/styles/globals.css`
- `apps/web/src/tests/homepage-provider-review-content.test.tsx`
- `apps/web/src/tests/core-shell-boundary.test.tsx`

## ModuleShell Boundary Preservation

- Module 01 Riso runtime behavior was not changed.
- `ModuleThemeShell` still emits:
  - `data-shell="module"`
  - `data-theme="ai-temperature-riso"`
  - `data-module-theme="riso"`
- New tests assert Core routes do not emit module shell markers and Module 01 shell does not emit CoreShell markers.
- No classic/Riso A/B machinery was reintroduced.

## Behavior Preservation

- Homepage product, price, delivery, refund, and support copy remain unchanged.
- Legal/privacy/refund/terms/disclaimer content remains unchanged.
- No payment, access-link, LINE, LIFF, Email, provider, runtime config, or DB code was changed.
- No stale internal-test/no-charge copy was introduced.
- No token/private values are rendered by the new tests or docs.

## Visual Baseline Summary

- Core routes now have a consistent neutral editorial shell marker and a shared Core visual frame.
- The main site should feel less like a generic standalone page while remaining quieter than Module 01 Riso.
- Module 01 remains the expressive module world and is intentionally not absorbed into CoreShell.
- This is a baseline only; owner holistic visual review remains the acceptance checkpoint for polish.

## Routes Deferred

- Module 01 landing/input/result surfaces.
- checkout save section.
- LINE bind surfaces beyond the already fixed transition route.
- ReturnURL / provider return waiting.
- paid result.
- `/r` access-link return.
- expired / invalid / pending states.
- Any unknown shared fallback route that requires module-context recovery.

## Validation

- `cd apps/web && corepack pnpm test src/tests/core-shell-boundary.test.tsx src/tests/homepage-provider-review-content.test.tsx src/tests/module-theme.test.ts`: pass, 3 files / 11 tests.
- `cd apps/web && corepack pnpm lint`: pass.
- `cd apps/web && corepack pnpm test`: pass, 105 files / 716 tests.
- `cd apps/web && corepack pnpm build`: pass.
- `cd apps/web && corepack pnpm run qa:module01:ui`: first attempt failed because sandboxed Chromium could not register macOS Mach port; same command rerun with escalation passed, 5 Playwright tests.
- `cd apps/web && corepack pnpm run qa:module01:local`: pass, `gateStatus=pass`, `requiredChecksStatus=pass`.
- skipped:
  - `qa:module01:mock-flow`: not run because Module 01 payment/access-link behavior and shared module flow logic were not touched.
  - `qa:result-checkout:no-card`: not run because checkout/access-link behavior was not touched.
  - staging / production gates: not applicable; no deployed behavior or production runtime touched.

## Production Safety

- Production runtime was not opened.
- No production payment was run.
- No real Email or LINE send occurred.
- No Vercel env was modified.
- No DB data was mutated.
- No provider logic was changed.

## Remaining Visual Review Backlog

- Owner holistic review of CoreShell baseline.
- Module 01 Riso Visual Alignment v2 using owner screenshots.
- ReturnURL / paid result / `/r` / expired / invalid / pending Riso surfaces.
- Repeated / Concurrency Paid-Generation Benchmark v0 if soft-public readiness becomes higher priority.

## First Failure Category

- none.

## Next Recommendation

Owner holistic visual review. Then choose between:

1. Module 01 Riso Visual Alignment v2 using owner screenshots.
2. ReturnURL / paid result / `/r` Riso surfaces.
3. Repeated / Concurrency Paid-Generation Benchmark v0 for soft-public readiness.
