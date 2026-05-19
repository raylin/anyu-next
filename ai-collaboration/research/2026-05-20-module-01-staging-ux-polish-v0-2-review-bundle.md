# Module 01 Staging UX Polish v0.2 Review Bundle

## 1. Summary

Executed a small readability-focused staging polish pass for Module 01.

This pass specifically addressed:

- chip/button contrast
- observed-signal card readability
- loading-state visibility
- redundant landing brand subtitle copy

No model, provider, prompt, schema, or DB changes were made.

## 2. User Feedback Addressed

Addressed directly:

- unselected chips looked too pale
- signal cards were too washed out on mobile
- loading message changed, but did not stand out enough visually
- `by 暗語 ANYU` was redundant below the hero copy

## 3. Button / Chip Contrast Changes

Changes made:

- strengthened inactive chip border contrast
- moved inactive chips to a warmer, more visible surface
- kept inactive chip text near `var(--anyu-ink)` instead of a pale tone
- increased active chip border/fill separation
- kept CTA stronger than chips with deeper shadow/weight
- left disabled CTA visibly softer without making it resemble inactive chips

Expected result:

- chips are legible without zooming on 360px/390px widths
- inactive chips no longer read as disabled
- CTA still feels like the clear primary action

## 4. Observed Signal Card Readability Changes

Changes made:

- strengthened signal-card border contrast
- changed signal-card background from a very pale flat wash to a warmer layered surface
- explicitly kept signal labels in dark ink
- kept notes in muted dark rather than pale text
- preserved score/accent hierarchy
- added a subtle premium shadow/inset treatment without turning them into hard metric cards

Expected result:

- `主動度`, `即時性`, `情緒投入`, and their note lines are easier to read on mobile
- cards stay premium rather than dashboard-like

## 5. Loading Message Visibility Changes

Changes made:

- removed plain inline loading text treatment
- added a distinct loading status panel
- added a small accent pulse dot
- added a mono `分析中` label above the rotating message
- preserved reduced-motion respect by disabling the pulse under `prefers-reduced-motion`

Rotating messages remain:

- `正在讀取互動裡的微訊號…`
- `整理關係溫度中…`
- `生成一份不急著下結論的分析…`
- `快好了，正在把結果整理成可以理解的方向…`

Expected result:

- users can now notice that the loading message is changing
- the wait should feel more intentional and less like static helper text

## 6. Subtitle / Brand Copy Changes

Changes made:

- removed `by 暗語 ANYU` from the landing hero area
- kept the quieter top-right/upper-right brand presence from v0.1

Expected result:

- cleaner hero copy
- slightly less first-screen competition on mobile

## 7. Files Changed

- `apps/web/src/components/modules/ai-temperature/AiTemperatureLanding.tsx`
- `apps/web/src/components/anyu/InputCard.tsx`
- `apps/web/src/styles/globals.css`

## 8. Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

## 9. Remaining Polish Candidates

- confirm real-device perception of the new chip contrast in bright ambient light
- confirm whether loading panel should sit slightly closer to the CTA on very short screens
- review whether result-page share/action buttons also need a stronger secondary-state treatment

## 10. Production Launch Readiness Impact

Positive:

- readability is stronger on the most reported weak surfaces
- loading changes are more visibly intentional
- landing hero is cleaner and slightly tighter

Still unchanged:

- model latency itself
- runtime architecture
- share-card PNG / richer sharing

## 11. Issues For ChatGPT Review

- Is chip contrast now strong enough, or should inactive chips move one step further toward `var(--anyu-surface)` + darker border?
- Should the loading panel eventually gain a tiny progress rail, or stay text-led?
- Do result-page share controls need a separate contrast pass after this v0.2 polish?
