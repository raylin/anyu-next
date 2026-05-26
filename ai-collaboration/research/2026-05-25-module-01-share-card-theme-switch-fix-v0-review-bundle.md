# Module 01 Share Card + Theme Switch Fix v0 Review Bundle

## 1. Summary

This pass fixes the remaining shared share-card layout/composition issues and removes visible theme-switch labels from the Module 01 theme control. The changes are visual-only and preserve all existing Module 01 product behavior.

## 2. User QA Findings Addressed

- Share-card width and margin were still visually misaligned with other major cards on desktop.
- Share CTA styling needed to come from the shared button path rather than one-off share-card button styling.
- The share card had too much unused vertical space in the middle.
- The theme switch still exposed visible label/debug text instead of behaving like a compact visual UI control.

## 3. Shared Share Card Fixes

- The share preview wrapper now stretches to the shared parent card/container width.
- The share shell now uses an explicit grid structure with top, centered content, and footer rows.
- The old fixed `aspect-ratio` dependency was replaced with responsive minimum height constraints to reduce dead space while preserving a poster-like composition.
- Mobile keeps a smaller safe minimum height.

## 4. Share CTA Fixes

- The share CTA now uses the shared `Button` component.
- Share-specific CSS now only controls layout width and border override; the shared button path controls the main button treatment.
- CTA spacing remains outside the poster surface so it no longer visually sticks to the bottom of the share card.

## 5. Theme Switch Fixes

- The theme switch remains two compact swatches.
- The visible wrapper label was changed from the old visual-style label to a neutral accessibility label.
- The swatches keep the required accessible labels for switching to each theme.
- No visible theme names, experiment labels, `MANUAL`, or `A/B` wording are rendered.

## 6. Theme A / Theme B Status

- Theme A remains the default/control visual.
- Theme B remains the Riso Editorial variant.
- Both themes use the same share-card structure and CTA path.
- Theme assignment, manual override, and carryover behavior were not changed.

## 7. Product Behavior Status

- Analyze behavior was not changed.
- Paid generation was not changed.
- LINE fulfillment was not changed.
- Prompt/schema/cache/DB behavior was not changed.
- Event metadata semantics were not changed.

## 8. Tests Added / Updated

- Updated result render tests to assert the compact theme switch and shared `Button` class path.
- Updated CSS contract tests for share-card stretching, grid composition, responsive minimum height, and shared action styling.
- Updated Playwright smoke expectations so hidden/debug theme wording remains absent.

## 9. Visual Review Notes

- Desktop alignment is now controlled through the shared share-preview wrapper.
- The centered share-card body gives the persona/quote area stronger presence without introducing new private content.
- Final visual QA should still be done on staging with real screenshots.

## 10. Known Limitations

- This pass does not add new screenshot automation.
- Local Playwright may remain blocked by the known Chromium/MachPort permission issue.

## 11. Recommended Next Step

Run staging screenshot QA for both Theme A and Theme B share/result surfaces, then decide whether a small final visual tune is needed.

