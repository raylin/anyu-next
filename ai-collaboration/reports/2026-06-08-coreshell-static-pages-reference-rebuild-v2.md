# CoreShell Static Pages Reference Rebuild v2

## Metadata

- task name: CoreShell Static Pages Reference Rebuild v2
- date: 2026-06-08
- report path: `ai-collaboration/reports/2026-06-08-coreshell-static-pages-reference-rebuild-v2.md`
- commit: pending final commit
- branch / push status: pending
- model / effort: GPT-5 Codex, high effort
- taskStartedAt: 2026-06-08T04:01:00Z
- taskCompletedAt: 2026-06-08T04:05:09Z
- totalWallClockDuration: 4m09s
- humanWaitDuration: 0m
- netCodexWorkDuration: 4m09s

## Context

- why this task exists: v1 passed tests but owner visual review found homepage/legal/static pages were still far from the archived CoreShell reference and still felt too close to the prior layout.
- owner direction: rebuild the static page visual layout more aggressively; preserve current copy/routes/legal meaning; do not preserve the existing visual structure just because it exists.
- out-of-scope items: production runtime/payment, real Email/LINE, Vercel env, DB mutation, Module 02, Module 01 payment/access-link/LINE/Email/LIFF logic, provider logic, stale reference text, and broad design system overbuild.

## Reference Files Used

- `ai-collaboration/design/theme-architecture-v0/core-shell-screens.jsx`
  - primary source for Core homepage/legal static layout: compact top nav, paper texture, large serif headline, legal metadata rhythm, hairline dividers, numbered legal sections, and neutral module index/card grammar.
- `ai-collaboration/design/theme-architecture-v0/THEME_ARCHITECTURE_MEMO.md`
  - used for the CoreShell style boundary: Core uses hairline rules, air, neutral ink/paper; Module worlds use louder Riso treatment.
- `ai-collaboration/design/theme-architecture-v0/README.md`
  - used for source-of-truth boundaries: design archive is visual reference only, current app copy and PM decisions control semantics.

## Reference-First Mapping

| reference element | current route/component | required rebuild | result |
| --- | --- | --- | --- |
| mobile policy/legal page | `LegalPageShell` for `/privacy`, `/refund`, `/terms`, `/disclaimer` | mobile-first editorial article layout, no generic white card shell | legal article now renders directly on paper with numbered section rhythm and dividers |
| top nav / wordmark row | `/`, `/legal`, shared legal shell | compact CoreShell wordmark/nav row with subtle dividers | topbar uses `data-core-header`, Core nav links, Wordmark, and hairline separator |
| paper / texture background | `CoreShell` static CSS | reference-like paper/dot texture in CoreShell scope | CoreShell pseudo texture added; scoped to CoreShell so Module 01 Riso is not overwritten |
| headline / metadata / eyebrow hierarchy | legal title/intro blocks | large serif title, small label/eyebrow, metadata line | legal hero now has label/title/intro/meta with larger headline and dividers |
| numbered legal sections | legal content blocks | numbered section rhythm with dividers, not generic card sections | `data-core-section="legal"` sections use CSS counters and horizontal rules |
| homepage / Core entrance | `/` homepage | neutral editorial park-entrance layout using same CoreShell tokens | homepage no longer uses generic `Card`; it has editorial hero, module preview article, section dividers, and Core support block |

## Reference Text Not Copied

- Did not copy reference demo legal text, module-gallery copy, old retention assumptions, old privacy examples, or any stale product copy.
- Current homepage product/service/pricing/refund/support copy remains source-of-truth.
- Current legal/privacy/refund/terms/disclaimer content, links, version dates, and contact details remain source-of-truth.

## Pages Rebuilt

- `/`
  - removed generic `Card` component use from Core static homepage.
  - converted product preview to a Core module preview article.
  - converted service/price/delivery/refund/support blocks to Core static article sections.
  - preserved CTA routes and copy.
- `/legal`
  - uses Core topbar, Core legal hero, Core article/nav block, and Core footer.
- `/privacy`, `/refund`, `/terms`, `/disclaimer`
  - use rebuilt `LegalPageShell` with Core topbar, legal hero, legal nav, numbered article sections, and footer.

## CoreShell Token / Style Changes

- Added scoped paper dot texture via `CoreShell` pseudo-element.
- Replaced the v1 colored top bar with a quieter ink/accent hairline.
- Removed Core static dependency on `.anyu-card` generic white-card style.
- Rebuilt legal article from card container to transparent paper article with numbered sections and dividers.
- Reduced desktop centered-card feel by narrowing legal readable width and removing enclosing card background/shadow.
- Preserved Core/Module token separation; Module 01 `.anyu-v2` Riso styles remain untouched.

## ModuleShell Boundary Preservation

- Module 01 routes still use ModuleShell/Riso markers.
- CoreShell static tests assert Module 01 shell keeps:
  - `data-shell="module"`
  - `data-theme="ai-temperature-riso"`
  - `data-module-theme="riso"`
- Core static routes assert no generic `anyu-card` shell and no ModuleShell marker.
- No classic/Riso A/B path was reintroduced.

## Tests / Gates Run

- `cd apps/web && corepack pnpm test src/tests/core-shell-boundary.test.tsx src/tests/homepage-provider-review-content.test.tsx src/tests/legal-content.test.ts src/tests/module-theme.test.ts`: pass, 4 files / 18 tests.
- `cd apps/web && corepack pnpm lint`: pass.
- `cd apps/web && corepack pnpm test`: pass, 105 files / 716 tests.
- `cd apps/web && corepack pnpm build`: pass.
- `cd apps/web && corepack pnpm run qa:module01:ui`: pass, 5 Playwright tests.
- `cd apps/web && corepack pnpm run qa:module01:local`: pass, `gateStatus=pass`, `requiredChecksStatus=pass`.
- skipped:
  - `qa:module01:mock-flow`: not run because Module 01 flow/payment/access-link behavior was not touched.
  - `qa:result-checkout:no-card`: not run because payment/access-link rendering was not touched.
  - staging / production gates: not applicable; no deployed/runtime changes.

## Screenshot / Review Artifacts

- Generated from the built local app on port 3100:
  - `/private/tmp/anyu-coreshell-home-v2.png`
  - `/private/tmp/anyu-coreshell-privacy-v2.png`
  - `/private/tmp/anyu-coreshell-refund-v2.png`
  - `/private/tmp/anyu-coreshell-terms-v2.png`
- Screenshots are local review artifacts and are not committed.

## Visual Result Summary

- Homepage is visibly rebuilt toward the CoreShell reference:
  - larger editorial hero.
  - compact topbar.
  - paper texture.
  - module preview as a Core module article instead of a generic card component.
  - section dividers and transparent paper blocks.
- Legal/static pages are visibly rebuilt toward the reference:
  - no enclosing generic white article card.
  - compact topbar and metadata hero.
  - numbered legal sections.
  - clean horizontal dividers.
  - mobile-first readable width.

## Current Copy Preserved

- Current homepage copy, product labels, links, price, refund/support copy preserved.
- Current legal page content and meaning preserved.
- Targeted tests caught and continue to protect source-of-truth homepage/legal copy.

## Production Safety

- Production runtime was not opened.
- No production payment was run.
- No real Email or LINE send occurred.
- No Vercel env was modified.
- No DB data was mutated.
- No provider, LIFF, Email save, payment, or access-link logic was changed.

## Remaining Visual Gaps

- Owner visual review still required.
- CoreShell may still need spacing/texture/typography tuning after owner screenshot comparison.
- Module 01 landing/input/result, checkout save, LINE bind, ReturnURL, paid result, `/r`, expired/invalid/pending states remain separate targeted visual work.

## First Failure Category

- none.

## Next Recommendation

Owner visual review with screenshots, then targeted visual defect fixes across CoreShell and Module 01 flow.

