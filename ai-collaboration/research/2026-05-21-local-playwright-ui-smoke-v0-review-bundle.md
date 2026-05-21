# Local Playwright UI Smoke v0 Review Bundle

Date: 2026-05-21

## 1. Summary

Added a local-only Playwright smoke layer for Module 01. The new tests cover landing/input guidance, demo result UI contracts, inline CTA reveal, LINE-first contact flow, Email fallback affordances, landing footer legal links, and the standalone legal routes. The suite runs against a local production-like server and stays independent from provider calls, DB state, CI, and the default Vitest path.

## 2. Test Strategy

- run Playwright locally only
- build the app first with a deterministic local LINE env value
- start a local production-like server on `127.0.0.1:3001`
- use demo route interactions for result/contact flows so tests do not depend on analyze provider calls or DB-backed unlock/contact APIs
- keep assertions contract-level rather than visual-snapshot based
- run Chromium only with a fixed mobile viewport

## 3. Scripts Added

Added to `apps/web/package.json`:

- `playwright:install`
- `build:e2e`
- `test:e2e:local`
- `test:e2e:ui`
- `verify:ui`
- `start:test`

## 4. Routes Covered

- `/m/ambiguous-temperature`
- `/m/ambiguous-temperature/result/demo`
- `/privacy`
- `/terms`
- `/disclaimer`
- `/legal`

Also covered indirectly through footer link checks:

- landing footer legal links to `/privacy`, `/terms`, `/disclaimer`

## 5. UI Contracts Covered

- landing hero / brand / textarea visible
- CTA starts disabled with `0 / 30` guidance
- valid 30+ input enables analyze CTA
- privacy helper and inline de-identification reminder visible
- chips remain selectable
- demo result shows:
  - temperature card
  - signals
  - insight block
  - inline CTA
  - share affordance
  - paid preview hierarchy
  - soft ending line
- inline CTA reveals exactly one contact-notification panel on demo route
- paid CTA reveals LINE-first panel
- LINE CTA target remains `https://lin.ee/S6dnbJO`
- Email fallback opens, accepts synthetic email input, and can demo-submit
- legal route headings and support email remain visible

## 6. What Is Not Covered

- live analyze provider success path
- runtime result generation from local provider-backed analyze
- DB-backed unlock intent / contact submit success path
- loading-state animation timing and scroll/focus feel
- visual/pixel snapshot comparison
- wide-layout or desktop screenshot review

## 7. Local-Only Policy

- Playwright is not wired into `pnpm test`
- Playwright is not wired into CI
- no workflow or hook was added to make Playwright mandatory
- browser binaries live in the existing gitignored local cache `.playwright-browsers/`
- generated Playwright artifacts remain gitignored

## 8. Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed
- `cd apps/web && corepack pnpm test:e2e:local` passed

## 9. Remaining Test Backlog

- optional local smoke for real runtime analyze if a stable mock or safe local provider path is introduced later
- optional desktop/wide-route Playwright coverage if layout work resumes
- optional loading-state behavioral check if future technical work touches analyze timing or scroll/focus behavior

## 10. Recommended Next Step

- `Technical UX Work Resumption v0`
