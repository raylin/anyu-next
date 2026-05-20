# Font Migration Phase 3: Kai Quote v0 Review Bundle

Date: 2026-05-21

## 1. Summary

Completed the third narrow ANYU font migration phase by adding selective `LXGW WenKai` typography for short quote / whisper surfaces only. This pass adds external `LXGW WenKai` loading in the app layout, introduces `--anyu-font-kai` plus `.t-kai` and `.t-kai-quote` in the canonical/app token files, updates `.t-quote` to the kai token, and applies the kai treatment only to the main result hook quote and the share-card quote.

## 2. Source Guidance Used

- `docs/design-system/reference/ui-polish-v1.1/FONT_MIGRATION_v1.1.md`

Applied only Phase 3 guidance:

- add external `LXGW WenKai` stylesheet loading
- add `--anyu-font-kai`
- add `.t-kai` and `.t-kai-quote`
- move quote-like surfaces to kai
- do not use kai globally

## 3. Font Loading Changes

- Kept the existing `Instrument Serif` + `Newsreader` Google Fonts loader in `apps/web/src/app/layout.tsx`
- Added:
  - `https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/style.css`
- Did not add any other font families beyond the approved Phase 3 scope
- No font files were added to the repo

## 4. Token / Utility Changes

Updated:

- `docs/design-system/tokens-v1.1.css`
- `apps/web/src/styles/tokens.css`

Added:

```css
--anyu-font-kai: "LXGW WenKai", "Kaiti TC", "STKaiti", "Noto Serif TC", serif;
```

Added utilities:

```css
.t-kai { font: 400 17px/1.85 var(--anyu-font-kai); letter-spacing: 0.5px; color: var(--anyu-ink); }
.t-kai-quote { font: 400 17px/1.85 var(--anyu-font-kai); letter-spacing: 0.6px; color: var(--anyu-ink); }
```

Updated utility:

```css
.t-quote { font: 400 var(--anyu-type-quote-size)/var(--anyu-type-quote-lh) var(--anyu-font-kai); letter-spacing: 0.5px; color: var(--anyu-ink); }
```

## 5. Surfaces Updated

Selective kai typography now applies to:

- result hook quote (`anyu-lead-quote t-quote`)
- share/persona quote (`anyu-share-quote t-kai-quote`)

## 6. Surfaces Not Changed

- insight long-form paragraphs
- reassurance long-form text
- paid-preview sample reply
- buttons / CTAs
- contact / LINE / Email panel typography
- legal pages
- headings
- temperature score / signal rows
- general UI/body text
- runtime, model, schema, DB, legal semantics, LINE behavior

## 7. Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed
- route smoke for `/m/ambiguous-temperature` and `/m/ambiguous-temperature/result/demo` was not run in this shell session

## 8. Remaining Typography Follow-ups

- Human/browser verification for the subjective “whisper-like” feel of the kai quote on real devices
- Keep long-form Newsreader and short-quote kai separation under staging QA before any wider typography change

## 9. Recommended Next Step

- `Font Migration Phase 3 Staging QA v0`
