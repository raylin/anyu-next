# Module 01 Dual Theme v2 Riso Implementation v0 Review Bundle

Date: 2026-05-25

## 1. Summary

Implemented Theme B for Module 01 as a local Riso Editorial visual variant while preserving Theme A as the classic/control visual. The change is visual-only for the Module 01 funnel and does not change analyze, paid generation, LINE fulfillment, prompt/schema/cache/DB, payment/email/ads, or legal semantics.

## 2. Design Source Files Used

- `docs/design/anyu-v2/anyu-tokens-v2.css`
- `docs/design/anyu-v2/DESIGN_SYSTEM_v2.md`
- `docs/design/anyu-v2/MIGRATION_v1.1_to_v2.md`
- `docs/design/anyu-v2/handoff-v2.html`
- `docs/design/anyu-v2/ui-v2-atoms.jsx`
- `docs/design/anyu-v2/ui-v2-components.jsx`
- `docs/design/anyu-v2/screens-v2.jsx`

## 3. Theme Architecture

- Theme A remains the unwrapped default visual.
- Theme B is activated only inside Module 01 via `.anyu-v2` and `data-module-theme="riso"`.
- Theme state uses `module01_theme_variant` and `module01_theme_source` in localStorage.
- Assignment is client-first to avoid adding server-side cookies or global theme infrastructure.

## 4. Theme A Preservation

- Existing v1.1 `tokens.css` remains canonical and unchanged.
- Existing Module 01 copy, CTAs, API calls, payloads, validation rules, and result content remain unchanged.
- Theme A still renders as `classic` before hydration and when selected manually.

## 5. Theme B Surfaces Implemented

- Landing/input shell.
- Context chips.
- CTA buttons.
- Loading/status panel.
- Free result temperature card.
- Signal rows.
- Insight and quote cards.
- Paid preview cards.
- Contact/LINE fulfillment surface.
- Share preview.
- Unlocked result route shell and paid content cards.

## 6. v2 Fidelity Notes

- Implemented scoped riso paper background, halftone grain, thick ink borders, sharp radius, solid offset shadows, ultramarine accent, riso magenta accent2, vermilion shadow accents, Fraunces/Space Mono font treatment, numbered signal rows, and ghosted numeric treatments.
- Added Fraunces and Space Mono to the existing Google Fonts request instead of adding font files.
- The implementation adapts existing components rather than replacing product markup, so it prioritizes functional parity while applying the v2 visual primitives broadly.

## 7. A/B Assignment

- First Module 01 visit assigns `classic` or `riso` 50/50.
- Assignment persists in localStorage.
- Manual override wins over assignment.
- Client-first assignment can briefly show Theme A before hydration on first page load.

## 8. Manual Toggle

- Added a small visual toggle labeled `柔和 / 鮮明`.
- The toggle persists manual choice in localStorage.
- The toggle emits safe `theme_switch_clicked` metadata when event storage is available.

## 9. Event Metadata

Safe metadata added where practical:

- `themeVariant`
- `themeSource`

Events touched:

- `page_view`
- `input_started`
- `analysis_started`
- `analysis_failed`
- `share_card_clicked`
- `email_fallback_opened`
- `line_add_clicked`
- `theme_switch_clicked`

No raw input, result JSON, paid result JSON, LINE identifiers, tokens, codes, email, or secrets are included.

## 10. Tests Added

- Added module theme assignment/persistence/manual override unit tests.
- Updated event metadata tests for `theme_switch_clicked` and safe theme metadata.
- Updated result render test for theme wrapper/toggle presence.
- Updated Playwright smoke to cover manual toggle persistence.

## 11. Staging / Visual Review Notes

- Local route-level visual browser review was limited by the same local Playwright Chromium launch permission issue seen in prior tasks. The e2e command built successfully but failed before page assertions because Chromium could not launch under the local harness.
- Build confirms the Module 01 routes compile with the new theme layer.
- Production was not deployed.

## 12. Known Limitations

- Theme B is CSS-adapted onto current components instead of a full direct JSX port of every v2 screen.
- First-load assignment is client-first, so a brief Theme A pre-hydration state is possible.
- Temporary LIFF diagnostic mode from prior work remains in place until no longer needed.

## 13. Recommended Next Step

Run staging visual QA on mobile for both `柔和` and `鮮明`, then decide whether Theme B is ready for a low-traffic A/B readout or needs another fidelity pass against the v2 reference.
