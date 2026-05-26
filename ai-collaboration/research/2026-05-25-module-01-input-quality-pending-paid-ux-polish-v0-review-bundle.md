# Module 01 Input Quality + Pending Paid UX Polish v0 Review Bundle

Date: 2026-05-25

## 1. Summary

This pass addresses tester feedback before production rollout by raising the Module 01 input quality floor, making the paid-result waiting state feel active and self-updating, hiding downstream theme switch controls while preserving selected theme styling, localizing paid-result likelihood labels, and strengthening paid-generation style guidance against unnecessary Chinese/English mixing.

## 2. Tester Feedback Addressed

- Short input could produce thin or repetitive complete analysis.
- The old textarea placeholder implied very short input was enough.
- The paid-result pending page felt static and asked users to refresh.
- Theme switch controls were too visible on fulfillment and paid-content surfaces.
- Paid likelihood labels displayed schema enums such as `high`, `medium`, and `low`.
- Paid output occasionally mixed unnecessary English into otherwise Chinese copy.

## 3. Input Threshold / Indicator Changes

- Hard minimum changed to 80 visible non-space characters.
- Recommended tier starts at 140 visible characters.
- Rich tier starts at 240 visible characters.
- Indicator labels now use five quality tiers:
  - 太少了
  - 還差一點
  - 可以分析
  - 更貼近了
  - 細節很夠
- Context chips remain optional.

## 4. Placeholder Update

The textarea placeholder now models a richer input with relationship stage, recent interaction, change over time, concrete signals, and user confusion. It does not include names, phone numbers, addresses, or private identifiers.

## 5. Pending Paid Generation UX

- Pending unlock pages now show an explicit waiting card titled `正在整理你的完整分析`.
- The copy explains that complete analysis usually takes 30-60 seconds.
- The page includes animated progress and four non-precise working steps.
- The UI no longer asks users to manually refresh while normal polling is active.

## 6. Polling / Auto-transition Behavior

- Added a privacy-safe paid-result status endpoint.
- The pending unlock page polls every 3 seconds.
- When status becomes `completed`, the page refreshes to render paid content.
- Failed and expired states show safe messages without exposing raw result data, tokens, LINE IDs, or provider output.

## 7. Theme Switch Visibility Changes

- The theme switch is hidden on `/line/fulfill`.
- The theme switch is hidden on `/m/[moduleSlug]/line/fulfill`.
- The theme switch is hidden on unlocked paid-content and pending paid-result surfaces.
- Carried theme styling still applies through the existing theme boundary.

## 8. Likelihood Localization

- Render-layer mapping now displays likelihood as:
  - `high` -> `高`
  - `medium` -> `中`
  - `low` -> `低`
- The schema enum was not changed.

## 9. Chinese-only Style Guidance

- The paid-result prompt now explicitly asks for natural Traditional Chinese.
- It discourages unnecessary code-switching and common English terms such as `genuinely`, `vibe`, `timing`, `signal`, `maybe`, and `check-in`.
- It provides Chinese alternatives such as `真的`, `感覺`, `節奏`, `訊號`, `可能`, and `關心`.

## 10. Tests Added

- Input readiness and quality-tier tests.
- Rich placeholder source test.
- Pending paid UX and polling source/CSS tests.
- Paid status endpoint tests.
- Bridge theme switch hidden tests.
- Likelihood localization helper tests.
- Paid prompt language guidance tests.
- Updated e2e smoke expectations for the new threshold and label.

## 11. Staging QA Notes

Staging QA was not run manually in this execution. Required manual checks:

- Short input below 80 visible characters disables the CTA.
- Richer input enables the CTA.
- LINE/LIFF fulfillment pending page shows active waiting UI and updates when complete.
- Theme switch is hidden on bridge/pending/unlocked surfaces while selected theme remains applied.
- Paid likelihood labels render as `高` / `中` / `低`.
- Paid result copy should be scanned for unnecessary English mixing.

## 12. Known Limitations

- The paid-generation prompt version was not bumped to avoid breaking existing completed paid-result lookup by prompt version.
- The status endpoint receives the unlock token in the request body because the unlocked route is token-addressed; it never returns the token.
- Local Playwright may remain blocked by the known Chromium/MachPort permission issue.

## 13. Recommended Next Step

Run staging manual QA for the complete LINE/LIFF pending-to-completed flow with both Theme A and Theme B selected before production rollout.

