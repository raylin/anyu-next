# Font Migration Phase 2: Editorial Reading v0 Review Bundle

Date: 2026-05-21

## 1. Summary

Completed the second narrow ANYU font migration phase by adding selective Newsreader-based editorial reading typography to long-form Module 01 result surfaces only. This pass adds explicit Newsreader loading in the app layout, introduces `--anyu-font-reading` plus `.t-reading` and `.t-reading-lg` in the canonical/app token files, and applies the reading class only to selected long-form result copy. LXGW WenKai was not introduced.

## 2. Source Guidance Used

- `docs/design-system/reference/ui-polish-v1.1/FONT_MIGRATION_v1.1.md`

Applied only Phase 2 guidance:

- load Newsreader
- add `--anyu-font-reading`
- add `.t-reading` and `.t-reading-lg`
- use only on selected editorial reading surfaces
- do not widen into global body replacement
- keep LXGW WenKai deferred

## 3. Font Loading Changes

- Extended the existing Google Fonts loader in `apps/web/src/app/layout.tsx`
- Added `Newsreader` alongside the already-loaded `Instrument Serif`
- Did not add `LXGW WenKai`
- No font files were added to the repo

## 4. Token Changes

Updated:

- `docs/design-system/tokens-v1.1.css`
- `apps/web/src/styles/tokens.css`

Added:

```css
--anyu-font-reading: "Newsreader", "Noto Serif TC", serif;
```

Added utilities:

```css
.t-reading { font: 400 16px/1.75 var(--anyu-font-reading); font-variation-settings: "opsz" 16; color: var(--anyu-ink); }
.t-reading-lg { font: 400 18px/1.7 var(--anyu-font-reading); font-variation-settings: "opsz" 18; color: var(--anyu-ink); }
```

## 5. Surfaces Changed

Selective editorial reading styling now applies to:

- result insight long-form paragraph
- result reassurance paragraph
- paid-preview visible sample reply paragraph

## 6. Surfaces Explicitly Not Changed

- quote typography
- global body typography
- Chinese headings
- legal pages
- buttons
- inline CTA labels
- share action labels
- contact / LINE / Email surfaces
- inputs
- general UI body copy
- loading, auth, payment, schema, DB, legal semantics, LINE behavior

## 7. Guardrail Test Coverage

Added/updated tests to verify:

- canonical and app token files both include `--anyu-font-reading`
- `.t-reading` and `.t-reading-lg` exist in both token files
- app layout loads both `Instrument Serif` and `Newsreader`
- app layout still does not include `LXGW WenKai`
- only selected long-form result surfaces receive `t-reading`
- key CTA/share/subtle-note surfaces do not accidentally receive `t-reading`

## 8. Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed
- route smoke for `/m/ambiguous-temperature` and `/m/ambiguous-temperature/result/demo` was not run in this shell session

## 9. Remaining Font Migration Phases

- Phase 3: Chinese quote / italic adoption with `LXGW WenKai`

Phase 3 remains deferred.

## 10. Recommended Next Step

- `Font Migration Phase 2 Staging QA v0`
