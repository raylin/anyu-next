# ANYU Design System Implementation Review Bundle

## 1. Source Files

- Design system markdown: `ai-collaboration/research/design/2026-05-18-anyu-design-system-v1.md`
- Design tokens: `experiments/ambiguous_temperature_v0/static/tokens.css`
- Prototype module: `experiments/ambiguous_temperature_v0/`

## 2. Design System Summary

- Fusion direction applied: `C 溫柔洞察 + A 月相 / 光暈 + B share card 自信感`
- Brand hierarchy now reads as `暗語 ANYU` mother brand plus `module · 01 · 曖昧溫度計`
- Visual tone moved away from dashboard styling and toward a soft, premium, mobile-first relationship module

## 3. Tokens Imported

- `styles.css` now imports `tokens.css` instead of duplicating color and type values
- active module uses `data-module="ai-temperature"`
- key token families used in implementation:
  - base surfaces: `--anyu-bg`, `--anyu-surface`, `--anyu-card`
  - ink and support text: `--anyu-ink`, `--anyu-dim`, `--anyu-faint`, `--anyu-line`
  - module accents: `--anyu-accent`, `--anyu-accent2`, `--anyu-rose`
  - type: `--anyu-font-serif`, `--anyu-font-sans`, `--anyu-font-latin`, `--anyu-font-mono`
  - radius and shadow: `--anyu-radius-*`, `--anyu-shadow-*`

## 4. Landing Page Implementation

- Added root module setup with `<html lang="zh-Hant" data-module="ai-temperature">`
- Added ANYU wordmark navbar and module label
- Reworked hero into serif headline plus softer subheadline
- Replaced the visible situation `<select>` UI with chip controls while preserving the underlying form field and event behavior
- Restyled textarea into a premium card with token-based border, shadow, focus ring, and helper copy
- Added privacy copy:
  - `請不要貼姓名 / 電話 / 地址`
  - `原型展示以分析後 24 小時內刪除為目標`

## 5. Result Page Implementation

- Reordered and styled the result surface to match the design system:
  1. temperature signature card
  2. one-sentence read card
  3. observed signals block
  4. insight layer card
  5. share actions
  6. share card preview
  7. paid preview card
  8. contact capture card
- Added animated temperature bar driven by existing `temperature_score`
- Preserved generated API fields and mapped them directly into the refreshed cards

## 6. Share Card Implementation

- Added a 4:5 in-app preview with:
  - `暗語 ANYU` wordmark
  - persona name
  - emotional quote
  - temperature label and state label
  - `anyu.app` placeholder footer
- Preview excludes raw conversation text, names, handles, price, and deterministic rejection copy
- The preview remains a UI-only card; no PNG generation was added

## 7. Paid CTA Implementation

- Paid area now carries:
  - `ONE-TIME · NO SUB`
  - `解鎖下一句怎麼回 — NT$49`
  - `給你 3 種不失控的回法：主動推進、低壓試探、暫時拉開。`
- Preserved existing fake-door click behavior by wiring both the header CTA and paid card CTA to the current unlock flow

## 8. Contact Capture Implementation

- Kept the existing inline contact capture flow
- Updated copy and styling to align with the design system:
  - `目前內測中`
  - `這次不會真的收費。`
  - `留下 LINE 或 Email，我們會送你一次完整分析。`
  - `不寄電子報 · 不分享第三方 · 隨時可刪除`

## 9. Mobile / Accessibility Notes

- Mobile-first container remains capped near `480px`
- Minimum interactive height is preserved at roughly `44px+` for chips and buttons
- Focus-visible styling remains present
- `prefers-reduced-motion` reduces transitions and disables the temperature bar animation
- Added explicit `[hidden] { display: none !important; }` so the hidden result and contact sections behave correctly

## 10. Deviations From Design System

- The contact capture remains an inline card instead of a bottom sheet to preserve the current fake-door flow and keep implementation scope visual-only
- The privacy copy uses prototype-intent phrasing for 24-hour deletion because server-side deletion enforcement is not implemented yet
- The result page uses the existing observed signal list instead of a fixed three-dimension signal model because the current schema does not expose those dimensions

## 11. Not Implemented Yet

- real share-card image generation
- real payment
- bottom-sheet contact capture
- backend PII redaction
- guaranteed 24-hour deletion enforcement
- portal or multi-module navigation
- dark mode toggle

## 12. Issues For ChatGPT Review

1. Should the top-level `暗語 ANYU` hook stay minimal on the first module page, or should the brand voice appear more strongly above the fold?
2. Should the share preview become the main share trigger area, or should the smaller explicit share button remain primary?
3. Is the current inline contact capture acceptable for v0, or should the design direction force a bottom-sheet interaction before broader testing?
