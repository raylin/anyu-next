# Module Theme Architecture Infrastructure v0

## Metadata

- task: Module Theme Architecture Infrastructure v0
- taskStartedAt: 2026-06-07T16:48:51Z
- taskCompletedAt: 2026-06-07T17:00:40Z
- totalWallClockDuration: 11m49s
- humanWaitDuration: 0m
- netCodexWorkDuration: 11m49s
- model used: GPT-5 Codex
- reasoning/effort level used: high
- report path: `ai-collaboration/reports/2026-06-07-module-theme-architecture-infrastructure-v0.md`
- scope: theme architecture infrastructure and low-risk visual consistency improvements
- production/runtime/payment/Email/LINE: not run

## Current Theme Path Inventory

Before this change, Module 01 still had active classic/Riso runtime theme switching:

- `apps/web/src/lib/modules/module-theme.ts` defined `classic | riso`, random 50/50 assignment, localStorage persistence, manual override, query hints, and compact unlock-token suffixes.
- `apps/web/src/components/modules/ai-temperature/ModuleThemeFrame.tsx` read localStorage, rendered a user-facing theme toggle, and emitted `theme_switch_clicked`.
- `apps/web/src/app/layout.tsx` set `data-module="ai-temperature"` globally, so Core routes inherited a Module 01 marker.
- `AiTemperatureLanding` and `AiTemperatureResult` used the theme controller and passed switch handlers.
- Checkout-start, payment access, ReturnURL, unlock/paid result, and `/r` already used `ModuleThemeBoundary` in most states.
- `/line/recovery/bind` used the generic LINE bind bridge without a module shell page wrapper.
- Riso styling existed primarily through `.anyu-v2` in `apps/web/src/styles/globals.css`; classic styling was the implicit no-`.anyu-v2` path.

## Theme Registry / Resolver Result

Added a small theme registry:

- `apps/web/src/lib/modules/theme-registry.ts`
- `CORE_THEME`
- `AI_TEMPERATURE_RISO_THEME`
- `resolveThemeForModule(...)`

Resolver behavior:

- `ambiguous-temperature` resolves to `ai-temperature-riso`.
- `ai-temperature` resolves to `ai-temperature-riso`.
- the current Module 01 `ProductModuleConfig` resolves to `ai-temperature-riso`.
- unknown module input resolves to `CORE_THEME`.
- no remote config, A/B rollout, user-specific switching, or runtime percentage logic was added.

## CoreShell / ModuleShell Boundary Result

Implemented a small CoreShell primitive:

- `apps/web/src/components/anyu/CoreShell.tsx`
- emits `data-shell="core"` and `data-theme="core"`.

Updated root layout:

- removed global `data-module="ai-temperature"`.
- added root `data-theme="core"`.

Updated Module shell:

- `ModuleThemeShell` now emits:
  - `data-shell="module"`
  - `data-theme="ai-temperature-riso"`
  - `data-module-slug`
  - `data-module-id`
  - `data-module-theme="riso"`
- the shell always applies the Riso `.anyu-v2` class for Module 01.

Full homepage/legal CoreShell migration is intentionally deferred to avoid a broad redesign in this infrastructure slice.

## Module 01 Riso-Only Cutover Result

Active classic/Riso A/B switching was removed:

- no random assignment.
- no localStorage read/write controlling active theme.
- no manual override.
- no visible theme toggle.
- no active classic display path.
- old `themeVariant=classic` and `.c` token suffixes are compatibility-parsed only and resolve to Riso with `legacy_hint`.

Kept as historical/non-runtime compatibility:

- old storage key constants remain for tests/documenting ignored legacy state.
- `theme_switch_clicked` remains in event enum as historical analytics vocabulary.
- legacy query/source parsing remains so old LINE/fulfillment links do not break.

Tests now prove:

- Module 01 resolves Riso.
- unknown theme registry input resolves Core.
- old classic query/token hints resolve to Riso.
- rendered Module 01 result contains Riso/module shell markers.
- no theme toggle is rendered.

## Routes / Components Touched

- `apps/web/src/lib/modules/theme-registry.ts`
- `apps/web/src/lib/modules/module-theme.ts`
- `apps/web/src/components/modules/ai-temperature/ModuleThemeFrame.tsx`
- `apps/web/src/components/modules/ai-temperature/AiTemperatureLanding.tsx`
- `apps/web/src/components/modules/ai-temperature/AiTemperatureResult.tsx`
- `apps/web/src/components/anyu/CoreShell.tsx`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/line/recovery/bind/page.tsx`
- `apps/web/src/lib/line/liff-context.ts`
- `apps/web/src/styles/globals.css`
- related Vitest and Playwright tests

## Routes / Components Deferred

- full homepage CoreShell migration.
- legal/refund/privacy/terms/disclaimer CoreShell migration.
- perfect archived-design visual recreation.
- strict legacy module ReturnURL redirect cleanup.
- Module 02 Radar theme pack.
- deeper internal rename of recovery/access-link legacy engineering names.

## Behavior Preservation

Payment/access-link business logic was not changed:

- checkout-start logic unchanged.
- Email save route/action unchanged.
- LINE bind API/LIFF token logic unchanged.
- NewebPay checkout/NotifyURL/ReturnURL provider logic unchanged.
- paid result and `/r` resolver logic unchanged.
- no report-body delivery promise introduced.
- no no-charge/internal-test copy revived.
- no token/private output introduced.

## Visual Tearing Reduced

Yes, for the first infrastructure slice:

- landing and result now use deterministic Riso shell rather than initial classic/default state.
- checkout-start, ReturnURL, payment access, unlock/paid result, and `/r` continue through module boundaries but now resolve Riso-only.
- LINE recovery bind page is now wrapped in the Module 01 Riso shell.
- root document no longer marks Core routes as Module 01.
- obsolete theme toggle CSS was removed.

This is not a full visual polish pass. Detailed Riso spacing, texture, hierarchy, and CoreShell refinement remain owner-review follow-up work.

## Tech Debt Removed

- removed active Module 01 random A/B theme assignment.
- removed active manual theme switching UI.
- removed toggle-specific CSS.
- removed root-level Module 01 marker from all pages.
- normalized legacy classic hints to Riso compatibility.

## Remaining Visual Refinement Backlog

- Module 01 Riso Flow Surface Polish v0:
  - checkout-start hierarchy and spacing.
  - Email save and LINE bind visual polish.
  - ReturnURL waiting/status polish.
  - paid result and `/r` completed/expired/pending polish.
- Core Shell alignment:
  - homepage.
  - legal/refund/privacy pages.
  - global nav/footer/brand frame.
- Optional legacy route cleanup:
  - `/m/[moduleSlug]/payment/return` compatibility route review.

## Validation

- `cd apps/web && corepack pnpm lint`: pass.
- targeted theme/resolver/layout tests: pass through Vitest run, 104 files / 713 tests.
- `cd apps/web && corepack pnpm test`: pass, 104 files / 713 tests.
- `cd apps/web && corepack pnpm build`: pass.
- `cd apps/web && corepack pnpm run qa:module01:ui`: pass, 5 Playwright tests.
- `cd apps/web && corepack pnpm run qa:module01:local`: pass, `gateStatus=pass`.
- `cd apps/web && corepack pnpm run qa:module01:mock-flow`: pass.
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`: pass.
- docs presence check: pass.
- dashboard HTML sanity: pass.
- secret/private scan: pass; broad scan matched only historical safety terminology in summary log, value-shaped secret scan had no matches.
- `git diff --check`: pass.

## Gates Skipped

- production runtime/payment: skipped by task scope.
- real Email/LINE: skipped by task scope.
- staging real channel sends: skipped by task scope.
- full `qa:module01:staging`: skipped because this slice did not require deployed integration proof; local, UI, mock-flow, and staging-safe no-card QA covered the touched behavior boundaries.

## Production / Safety Confirmation

- production runtime was not opened.
- no production payment was run.
- no Email or LINE was sent.
- no Vercel env was changed.
- no DB data was mutated.
- no Module 02 implementation occurred.
- no NewebPay provider logic changed.

## First Failure Category

- none

## Recommended Next Task

Owner visual review of Module 01 flow, then either:

- Module 01 Riso Flow Surface Polish v0, or
- next prioritized product/theme slice.
