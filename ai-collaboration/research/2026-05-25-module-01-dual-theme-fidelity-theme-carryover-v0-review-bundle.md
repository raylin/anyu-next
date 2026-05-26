# Module 01 Dual Theme Fidelity + Theme Carryover v0 Review Bundle

Date: 2026-05-25

## 1. Summary

Completed a focused follow-up pass for Module 01 dual-theme fidelity and theme continuity. Theme A and Theme B remain behaviorally equivalent; changes are limited to visual presentation, compact theme switching, and safe theme carryover through fulfillment/unlocked URLs.

## 2. User Feedback Addressed

- Reduced Theme B temperature/quote accent intrusion so decorative accents stay at the card edge.
- Added shared spacing between share card and share CTA.
- Kept share card width aligned with other major result containers.
- Kept share CTA on the shared dark primary direction.
- Simplified the visible theme switch into two small swatches with accessible labels only.
- Added theme carryover through unlock intent creation, LIFF context, LIFF bind redirect, short-code reply links, and unlocked route restoration.

## 3. Visual Fixes

- Theme B quote-card accent now renders as a right-edge stripe instead of a text-overlapping glyph.
- Theme B editorial background blobs remain subtle and decorative behind content.
- Theme B temperature card remains on a light/white card surface.
- Theme B share card remains on a clean white card surface without internal grain/pattern.
- Paid preview featured card keeps a dark body, white text, and magenta lower-note/accent treatment.

## 4. Shared UI Fixes

- Share card width alignment is handled through the shared `.anyu-share-preview` constraint.
- Share CTA spacing is handled through shared `.anyu-share-actions` margin rhythm.
- Share CTA style is handled through the shared `.anyu-share-action-primary` selector, not a theme-specific one-off.

## 5. Theme Switch Simplification

- Replaced visible `柔和 / 鮮明` text and `manual/a/b` source label with two compact swatches.
- Kept accessible labels: `切換為柔和主題` and `切換為鮮明主題`.
- Manual override behavior and `theme_switch_clicked` tracking remain unchanged.

## 6. Theme Carryover Design

- No DB migration was introduced.
- New unlock tokens generated after this pass include a compact URL-safe suffix: `.c` for classic, `.r` for riso.
- Generated LIFF URLs and unlocked paths also include safe query hints: `themeVariant` and `themeSource`.
- Legacy tokens without a suffix fall back to existing localStorage/A-B/default behavior.

## 7. Fulfillment / Unlocked Route Theme Restoration

- Result page sends current `themeVariant` and `themeSource` to `/api/unlock-intent`.
- `/api/unlock-intent` encodes the selected theme into the unlock token and LIFF URL context.
- LIFF bridge parses direct query and `liff.state` theme hints and passes them to bind.
- LIFF bind response returns an unlocked path with theme hints.
- Short-code webhook recovers the theme from the stored fulfillment token suffix and includes theme hints in the reply URL.
- Unlocked route restores initial theme from query hints first, then token suffix, then client fallback.

## 8. Event Metadata

Safe metadata added where relevant:

- `themeVariant`
- `themeSource`
- `themeCarryoverSource`

No raw input, LINE IDs, short codes, unlock tokens, tokenized URLs, provider output, paid result JSON, emails, or secrets are recorded.

## 9. Tests Added

- Theme helper tests for query hints and token suffix recovery.
- LINE URL/context tests for LIFF and unlocked URL theme carryover.
- LIFF bind route test for themed unlocked redirect and safe metadata.
- Short-code webhook test for themed unlocked link recovery.
- Result render test confirming the compact switch has accessible labels without visible theme/source words.
- CSS contract coverage for share spacing and edge accent behavior.

## 10. Staging / Visual QA Notes

- Production was not deployed.
- Staging visual QA is still recommended after push for both themes and for web → LIFF → unlocked plus short-code → unlocked flows.
- Local Playwright may remain blocked by the known Chromium MachPort permission issue.

## 11. Known Limitations

- Theme carryover is URL/token-context based, not a persisted DB column. This avoids migration risk but means legacy pre-existing tokens without the suffix rely on client fallback.
- The compact token suffix is visible in tokenized URLs; it carries only non-sensitive visual variant information, not user data.
- No screenshot-based visual regression suite exists yet.

## 12. Recommended Next Step

Deploy/refresh staging, then verify Theme B through normal result unlock, mobile LIFF bind, and short-code reply links without recording tokenized URLs.
