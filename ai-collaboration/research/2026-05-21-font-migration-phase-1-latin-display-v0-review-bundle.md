# Font Migration Phase 1: Latin Display v0 Review Bundle

Date: 2026-05-21

## 1. Summary

Completed the first narrow ANYU font migration phase by replacing active Latin display usage from Cormorant Garamond to Instrument Serif. This pass adds explicit Instrument Serif loading in the app layout, updates the canonical/app Latin display token, removes Cormorant from active app code and current source-of-truth docs, and leaves later font phases deferred.

## 2. Source Guidance Used

- `docs/design-system/reference/ui-polish-v1.1/FONT_MIGRATION_v1.1.md`

Applied only Phase 1 guidance:

- load Instrument Serif
- update `--anyu-font-latin`
- remove active Cormorant usage
- keep Newsreader and LXGW WenKai deferred

## 3. Font Loading Changes

- Added explicit Google Fonts loading in `apps/web/src/app/layout.tsx`:
  - preconnect to `fonts.googleapis.com`
  - preconnect to `fonts.gstatic.com`
  - stylesheet for `Instrument Serif: ital@0;1`
- No other font families were introduced in app loading.
- No font files were added to the repo.

## 4. Token Changes

Updated:

- `docs/design-system/tokens-v1.1.css`
- `apps/web/src/styles/tokens.css`

Changed:

```css
--anyu-font-latin: "Cormorant Garamond", "Noto Serif TC", serif;
```

to:

```css
--anyu-font-latin: "Instrument Serif", "Noto Serif TC", serif;
```

## 5. Code Search Results

Active app/source-of-truth search after changes:

- `Instrument Serif` found in:
  - app layout font loader
  - canonical tokens
  - app tokens
  - current design-system/app READMEs
  - current v1.1 design-system doc
- `Cormorant Garamond` no longer appears in:
  - `apps/web/src/`
  - `apps/web/src/styles/tokens.css`
  - `docs/design-system/tokens-v1.1.css`
  - `docs/design-system/README.md`
  - `apps/web/README.md`
  - `docs/design-system/anyu-design-system-v1.1.md`

Expected remaining Cormorant references are only in:

- historical docs
- reference-only design bundles

## 6. Surfaces Affected

Via existing token usage, the migration affects:

- `ANYU` wordmark Latin display
- large temperature numerals
- share-card numeric display
- paywall price numerals
- small Latin italic accent surfaces that already use `--anyu-font-latin`

## 7. Surfaces Not Changed

- Chinese body typography
- Chinese headings
- quote/body font strategy beyond current active Phase 1 token swap
- Newsreader long-reading typography
- LXGW WenKai quote typography
- layout, spacing, runtime, model, schema, DB, legal, LINE, payment, auth, portal, production ops

## 8. Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed
- lightweight staging route checks:
  - `https://staging.anyu.tw/m/ambiguous-temperature` returned `200`
  - `https://staging.anyu.tw/m/ambiguous-temperature/result/demo` returned `200`

## 9. Remaining Font Migration Phases

- Phase 2: reading/body adoption with Newsreader
- Phase 3: Chinese quote/italic adoption with LXGW WenKai

Both remain deferred.

## 10. Recommended Next Step

- `Font Migration Phase 1 Staging QA v0`
