# Module 01 Micro UX Fixes v0.4

## 1. Summary

This pass tightened three small UX surfaces without changing runtime or schema behavior:

- richer input-length guidance with clearer context-quality states
- automatic scroll/focus to the loading state after analyze CTA click
- clearer share affordance with a real share-style button and supporting copy

## 2. Input Guidance Changes

- kept the hard server-side minimum at `30` characters
- kept the hard max at `4000`
- introduced explicit context-quality bands in the shared helper layer:
  - `再寫一點`
  - `可分析`
  - `剛剛好`
  - `有點長`
  - `太長了`
- added calmer detail copy so users understand that more context helps, without making accuracy promises
- kept the free/share note separate so guidance is about input quality, not pricing or screenshotting

## 3. Loading Focus / Scroll Changes

- the landing component now keeps refs to:
  - the textarea
  - the loading/status panel
- after a valid CTA submit:
  - textarea is blurred first to help collapse the mobile keyboard
  - loading state is set
  - the loading panel is scrolled into view and focused
- the loading container is now an accessible focus target with:
  - `tabIndex={-1}`
  - `role="status"`
  - `aria-live="polite"`

## 4. Share Action Affordance Changes

- replaced the more passive share copy with a stronger primary action:
  - `分享這個結果`
- added clearer secondary text:
  - `複製成 LINE / Threads 可貼上的文字`
- kept the existing native share / clipboard behavior underneath
- kept the success feedback message path intact

## 5. Accessibility Notes

- loading status is now a proper focusable live region
- CTA submit path now helps move user attention to the active work state
- no extra judgmental language was introduced into the guidance states
- share action remains a real button, not a subtle text-link

## 6. Files Changed

- `apps/web/src/components/modules/ai-temperature/AiTemperatureLanding.tsx`
- `apps/web/src/components/anyu/InputCard.tsx`
- `apps/web/src/components/anyu/ShareCardPreview.tsx`
- `apps/web/src/lib/modules/ai-temperature-ui.ts`
- `apps/web/src/styles/globals.css`
- `apps/web/src/tests/ai-temperature-ui.test.ts`

## 7. Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

## 8. Remaining UX Follow-ups

- real mobile/device confirmation is still useful for keyboard collapse + scroll feel
- share affordance is better, but not yet a full social distribution flow
- a future pass could expose the guidance state visually in an even more compact badge-only treatment if needed

## 9. Recommended Next Step

`Module 01 Human Browser Funnel Pass v0`
