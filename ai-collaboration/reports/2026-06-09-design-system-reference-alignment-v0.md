# Design System Reference Alignment v0

## Metadata

- task name: Design System Reference Alignment v0
- date: 2026-06-09
- report path: `ai-collaboration/reports/2026-06-09-design-system-reference-alignment-v0.md`
- commit: pending final commit
- branch / push status: pending
- model / effort: GPT-5 Codex, high effort
- taskStartedAt: 2026-06-09T13:57:04Z
- taskCompletedAt: 2026-06-09T13:59:45Z
- totalWallClockDuration: 2m41s
- humanWaitDuration: 0m
- netCodexWorkDuration: 2m41s

## Context

- why this task exists: owner clarified that the visual track must be design-system alignment, not isolated page patching or marker-only work.
- upstream blocker / mainline context: CoreShell v2 rebuilt static pages, but the next visual work needs shared token/component/layout alignment against the archived reference before more page-level polish.
- out-of-scope items: production runtime/payment, real Email/LINE, Vercel env, DB mutation, Module 02, payment/access-link/LIFF/Email behavior changes, provider logic, and stale reference copy.

## Scope

- what changed: aligned shared CoreShell and Module 01 Riso CSS primitives against the archived reference token/component model; added tests protecting the shared-layer alignment; updated dashboard and summary.
- what did not change: product copy, legal meaning, routes, payment logic, access-link logic, LIFF/LINE bind logic, Email save logic, and production state.

## Reference Files Used

- `ai-collaboration/design/theme-architecture-v0/anyu-tokens-v2.css`
  - authoritative v2 token contract for Riso radius, borders, offset shadows, typography, spacing, grain, and stripe primitives.
- `ai-collaboration/design/theme-architecture-v0/core-shell-screens.jsx`
  - CoreShell strategy: quiet layer, paper/grain, hairline rules, module color only as small swatches, no thick-ink offset cards.
- `ai-collaboration/design/theme-architecture-v0/ui-v2-atoms.jsx`
  - Riso atom language for page grain, wordmark, thick ink cards, offset shadows, stamps, and section rules.
- `ai-collaboration/design/theme-architecture-v0/pay-shell-atoms.jsx`
  - shared flow template model: shell primitives stay shared, module accent/motif reskins the flow.

## Current-to-Reference Mapping

| current token / component / primitive | reference equivalent | adopted direction |
| --- | --- | --- |
| CoreShell inherited app/module accent variables | Core `CORE_BG`, `CORE_INK`, `CORE_DIM`, `CORE_FAINT`, `CORE_HAIR` constants | added scoped `--anyu-core-*` variables so Core is neutral and does not borrow Module 01 accents |
| Core paper background generated ad hoc | CoreShell grain overlay and paper field | replaced Core background texture with `--anyu-core-paper-grain` matching reference dot rhythm |
| Core module preview used pink/purple Riso accents | module color appears only as small swatches in Core | neutralized preview card background and used `--anyu-core-module-ai-temperature` as a small left swatch / meter accent |
| Core cards / legal article | quiet Core hairline article sections | kept no generic white-card shell; codified Core hairline tokens for topbar, hero, legal nav, and article dividers |
| Module 01 Riso runtime token block | `anyu-tokens-v2.css` token contract | completed missing token parity: mono-lg tracking, label-sm, num-sm, gutter, max-content, stack spacing, border-thin, border-cta, stripe-loading |
| Riso save / LINE flow CSS | `ui-v2-atoms` and `pay-shell-atoms` thick ink cards / CTA language | preserved shared Riso flow primitives using heavy border, sharp radius, offset shadow, dark CTA, and status box grammar |

## Adopted Reference Patterns

- CoreShell now has explicit scoped reference tokens:
  - `--anyu-core-bg`
  - `--anyu-core-card`
  - `--anyu-core-surface`
  - `--anyu-core-ink`
  - `--anyu-core-dim`
  - `--anyu-core-faint`
  - `--anyu-core-hairline`
  - `--anyu-core-paper-grain`
- Core module preview no longer uses Module 01 Riso pink/purple gradients or offset shadows.
- Core static surfaces use quiet hairlines and paper texture as the baseline design-system grammar.
- Riso runtime CSS exposes missing v2 token names so shared flow components can depend on the reference contract instead of local fallbacks.
- Shared Riso flow/save primitives remain thick-ink, sharp-radius, offset-shadow components, not generic SaaS cards.

## Old Design-System Pieces Replaced / Removed

- Replaced CoreShell dependency on global `--anyu-accent` and `--anyu-accent2` for static background/motif accents.
- Replaced Core module preview pink/purple gradient treatment with a quiet Core card and small module swatch accent.
- Removed the design-system ambiguity where CoreShell looked partly like old Module 01 defaults because root tokens still default to `ai-temperature`.
- Removed the Riso token gap that forced shared flow CSS to rely on fallback or locally invented names.

## Missing Reference Components / States for Claude Design

- missing component/state: CoreShell homepage product/module preview for a live single-module commercial service.
  - current route/surface: `/` product preview and service/price/delivery/refund blocks.
  - why reference is insufficient: reference shows module directory cards, not a production payment-ready service landing with legal/commercial requirements.
  - proposed Claude Design request: provide a CoreShell commercial module-entry/static storefront pattern preserving current service facts and legal links.
- missing component/state: Module 01 paid-generation queued / long-processing state.
  - current route/surface: ReturnURL waiting, paid result pending, and access-link return pending states.
  - why reference is insufficient: reference has ReturnURL waiting and paid result examples, but not measured long-queue copy/status variants after Gate 1 processor findings.
  - proposed Claude Design request: provide Riso states for paid queued, processor delayed, safe refresh, and support escalation.
- missing component/state: owner-approved real channel runner plan UI.
  - current route/surface: not user-facing yet; QA-only staging channels runner.
  - why reference is insufficient: reference covers Email/LINE save surfaces, not QA/operator channel-runner confirmation surfaces.
  - proposed Claude Design request: likely not needed unless it becomes a product/operator UI.
- missing component/state: strict expired/invalid/recovery edge cases for `/r`.
  - current route/surface: `/r` expired, invalid, pending, completed return.
  - why reference is insufficient: reference has an expired-link screen, but not all current access-link resolver states and support options.
  - proposed Claude Design request: complete Riso access-link state matrix.

## Tests / Gates Run

- `cd apps/web && corepack pnpm test src/tests/design-system-reference-alignment.test.ts src/tests/core-shell-boundary.test.tsx src/tests/homepage-provider-review-content.test.tsx src/tests/legal-content.test.ts src/tests/module-theme.test.ts`: pass, 5 files / 21 tests.
- `cd apps/web && corepack pnpm lint`: pass.
- `cd apps/web && corepack pnpm test`: pass, 106 files / 719 tests.
- `cd apps/web && corepack pnpm build`: pass.
- `cd apps/web && corepack pnpm run qa:module01:ui`: pass, 5 Playwright tests.
- `cd apps/web && corepack pnpm run qa:module01:local`: pass, `gateStatus=pass`, `requiredChecksStatus=pass`.
- `cd apps/web && corepack pnpm run qa:module01:mock-flow`: pass, 18 files / 152 tests.

## Screenshot Artifacts

- `/private/tmp/anyu-design-system-home-v0.png`
- `/private/tmp/anyu-design-system-privacy-v0.png`
- `/private/tmp/anyu-design-system-refund-v0.png`
- `/private/tmp/anyu-design-system-terms-v0.png`

## Validation

- commands run: lint, targeted design-system/CoreShell/legal/theme tests, full tests, build, `qa:module01:ui`, `qa:module01:local`, `qa:module01:mock-flow`, screenshot capture.
- gateStatus: pass
- commandExitCode: 0
- requiredChecksStatus: pass
- optionalChecksStatus: skipped
- targetDeployCommit: not_applicable
- deployedCommitAtGateStart: not_applicable
- deployedCommitAtGateEnd: not_applicable
- freshnessStatus: not_applicable
- gates skipped and why: production/staging/channel/payment gates are out of scope; no deployed integration behavior changed.

## Safety

- production runtime enabled: no
- payment run: no
- Email sent: no
- LINE sent: no
- Vercel env changed: no
- DB mutated: no
- secrets/private data exposed: no

## Result

- result: pass
- first failure category: not_applicable
- blocker status: not_applicable

## Tech Debt / Cleanup Notes

- new technical debt introduced: none known.
- existing technical debt observed: CoreShell still needs owner visual review against high-fidelity reference; Module 01 ReturnURL/paid result/`/r`/expired surfaces still need reference-aligned system pass.
- opportunistic cleanup completed: CoreShell module preview no longer borrows Module 01 accent/gradient treatment; Riso token parity improved.
- deferred cleanup candidates: consider extracting Core/Riso primitives into smaller CSS files after the visual system stabilizes; avoid doing this before owner review to reduce churn.

## Decisions Made

- Treat the archived reference as design-system spec material for visuals, not merely inspirational reference.
- Fix shared token/component mismatches before more page-specific polish.
- Keep Core quiet and neutral; keep Module 01 Riso loud and accent-heavy.
- Tests protect structure and reference-token adoption, but visual acceptance remains owner review.

## Uncertainties / Blockers

- None blocking this scoped pass.
- Owner review is still required to decide whether the visible CoreShell and Module 01 flow surfaces are close enough to the reference.

## Recommended Next Step

Owner visual review against the archived reference, then choose the next targeted visual-system slice: CoreShell storefront pattern, Module 01 ReturnURL/paid result/`/r` state matrix, or Module 01 checkout/save surface refinement using owner comparison screenshots.

## Paste-Back Context

Design System Reference Alignment v0 moved the visual track from page patching toward shared design-system alignment. CoreShell now has scoped neutral Core tokens and no longer borrows Module 01 accents for its static module preview; Riso runtime CSS now exposes missing v2 reference tokens for shared flow primitives. Product flow/copy/routes/payment/access-link/LINE/Email logic were not changed, and visual acceptance remains owner review against the archived reference.
