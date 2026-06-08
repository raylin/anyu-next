# CoreShell Static Pages Reference Implementation v1

## Metadata

- task name: CoreShell Static Pages Reference Implementation v1
- date: 2026-06-08
- report path: `ai-collaboration/reports/2026-06-08-coreshell-static-pages-reference-implementation-v1.md`
- commit: 3ee7d06
- branch / push status: pushed to `origin/staging`
- model / effort: GPT-5 Codex, high effort
- taskStartedAt: 2026-06-08T03:40:38Z
- taskCompletedAt: 2026-06-08T03:47:01Z
- totalWallClockDuration: 6m23s
- humanWaitDuration: 0m
- netCodexWorkDuration: 6m23s

## Context

- why this task exists: CoreShell Baseline Migration v0 passed but owner review found the homepage and legal/static pages were still visually almost unchanged.
- owner direction: static pages can be less conservative; use archived CoreShell/static reference layout as implementation base while keeping current copy/legal text/routes as source-of-truth.
- out-of-scope items: production runtime/payment, real Email/LINE, Vercel env, DB mutation, Module 02, Module 01 flow surfaces, payment/access-link/LIFF/Email logic, stale reference copy, and pixel-perfect matching.

## Reference Files Used

- `ai-collaboration/design/theme-architecture-v0/core-shell-screens.jsx`
  - used for CoreShell static page layout direction: top wordmark/nav, large editorial hero, hairline rules, module card/index-card grammar, neutral legal article surface, and footer rhythm.
- `ai-collaboration/design/theme-architecture-v0/THEME_ARCHITECTURE_MEMO.md`
  - used for the CoreShell vs ModuleShell intensity boundary: Core is quiet/hairline/neutral; Module worlds are louder/immersive.
- `ai-collaboration/design/theme-architecture-v0/README.md`
  - used for source-of-truth rules: archived visual reference only; current product/legal copy remains authoritative.

## Reference Mapping

| reference surface | current route | implementation target |
| --- | --- | --- |
| `CoreHomepage` quiet editorial entrance | `/` | visible CoreShell homepage with top wordmark/nav, large editorial hero, quiet module/product card, Details section divider, support card, and Core footer marker |
| `CoreLegal` neutral readable policy page | `/privacy`, `/refund`, `/terms`, `/disclaimer` | shared legal detail pages with Core topbar, legal hero, metadata block, pill-style legal nav, designed article card, section dividers, and footer marker |
| `CoreLegal` / static legal index style | `/legal` | legal index with Core topbar, legal hero, article/nav card, and current legal links |
| reference header/footer/brand treatment | homepage + legal/static pages | `data-core-header`, `data-core-footer`, Wordmark topbar, quiet Core nav links |
| reference editorial typography/spacing | homepage + legal/static pages | larger Core hero title, more air, hairline dividers, neutral cards, no Module 01 thick Riso treatment |

## Reference Text Intentionally Not Copied

- Core reference demo copy such as generic AI-native headline, module gallery copy, 30-day retention assumptions, and older legal examples were not copied.
- Current homepage product, price, delivery, refund, support, and legal copy remain source-of-truth.
- Current legal/privacy/refund/terms/disclaimer content and links remain source-of-truth.

## Pages Changed

- `/`
  - migrated from mostly storefront card stack to a visibly editorial CoreShell static page structure.
  - current CTA links preserved:
    - `/m/ambiguous-temperature`
    - `/refund`
    - `/legal`
- `/legal`
  - changed into Core static legal index with header/hero/article markers.
- `/privacy`, `/refund`, `/terms`, `/disclaimer`
  - inherit the new shared `LegalPageShell` article layout.

## Visible Layout Changes Made

- Added Core static structural markers:
  - `data-core-static-page`
  - `data-core-hero`
  - `data-core-module-card`
  - `data-core-article`
  - `data-core-header`
  - `data-core-footer`
- Homepage:
  - top Wordmark/nav is separated by a hairline rule.
  - hero uses a larger editorial headline scale and more air.
  - product preview becomes a quiet Core module card with subtle motif texture, not a generic card stack.
  - service details are grouped under a hairline section head.
  - support block uses a Core article/card treatment.
- Legal/static pages:
  - top nav uses Core links back to service intro and Module 01.
  - legal hero is separated from article body.
  - sections are inside a designed article card with dividers.
  - legal nav remains intact but is framed as Core article/navigation.

## Current Copy Preserved

- Homepage product/service/pricing/delivery/refund/support copy preserved.
- `product preview` label restored after targeted tests caught an accidental copy change.
- Legal page content, headings, sections, version dates, contact email, and legal links preserved.
- No stale archived product/legal copy was introduced.

## Behavior Preserved

- Module entry link remains `/m/ambiguous-temperature`.
- Refund/legal/privacy/terms/disclaimer routes remain unchanged.
- Legal footer links remain unchanged.
- Module 01 routes still use ModuleShell/Riso markers.
- No payment/access-link/LINE/LIFF/Email/provider/runtime behavior was changed.

## Tests / Gates Run

- `cd apps/web && corepack pnpm test src/tests/core-shell-boundary.test.tsx src/tests/homepage-provider-review-content.test.tsx src/tests/legal-content.test.ts src/tests/module-theme.test.ts`: pass, 4 files / 18 tests.
- `cd apps/web && corepack pnpm lint`: pass.
- `cd apps/web && corepack pnpm test`: pass, 105 files / 716 tests.
- `cd apps/web && corepack pnpm build`: pass.
- `cd apps/web && corepack pnpm run qa:module01:ui`:
  - sandbox attempt failed at Chromium launch due macOS Mach port permission.
  - escalated rerun passed, 5 Playwright tests.
- `cd apps/web && corepack pnpm run qa:module01:local`: pass, `gateStatus=pass`, `requiredChecksStatus=pass`.
- skipped:
  - `qa:module01:mock-flow`: not run because Module 01 flow/payment/access-link behavior was not touched.
  - `qa:result-checkout:no-card`: not run because payment/access-link rendering was not touched.
  - staging / production gates: not applicable; no deployed/runtime changes.

## Screenshot / Local Review Artifacts

- Generated from built local app on port 3100 using Playwright CLI:
  - `/private/tmp/anyu-coreshell-home-v1.png`
  - `/private/tmp/anyu-coreshell-privacy-v1.png`
  - `/private/tmp/anyu-coreshell-refund-v1.png`
- Visual spot-check confirmed the new static Core layout is visible on homepage and legal/static pages.
- These artifacts are local review aids only and are not committed.

## Production Safety

- Production runtime was not opened.
- No production payment was run.
- No real Email or LINE send occurred.
- No Vercel env was modified.
- No DB data was mutated.
- No provider, LIFF, Email save, payment, or access-link logic was changed.

## Remaining Visual Gaps

- Owner holistic visual review is still required for:
  - CoreShell homepage/legal pages.
  - Module 01 landing/input/result.
  - checkout save.
  - LINE bind.
  - ReturnURL.
  - paid result.
  - `/r`.
  - expired / invalid / pending states.
- CoreShell is visibly closer to the reference now, but it is still not a final visual polish pass.

## First Failure Category

- none.

## Next Recommendation

Owner holistic visual review comparing:

1. homepage
2. legal/privacy/refund
3. Module 01 landing/input/result
4. checkout save
5. LINE bind
6. ReturnURL
7. paid result
8. `/r`

Then continue with targeted visual defect fixes.
