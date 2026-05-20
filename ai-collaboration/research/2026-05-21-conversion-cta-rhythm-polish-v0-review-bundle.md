# Conversion / CTA Rhythm Polish v0 Review Bundle

Date: 2026-05-21

## 1. Summary

Completed a narrow Module 01 result-page polish pass focused on conversion rhythm and action clarity. The result page now exposes the next useful action earlier, the share affordance reads more like a social action, the paid preview hierarchy is a little clearer, and the LINE-first panel repeats less explanatory copy.

## 2. Result CTA Rhythm Changes

- Added an inline transition card after the main insight block
- New copy:
  - `想知道下一句怎麼回？`
  - `解鎖 3 種不失控的回法，從主動推進、低壓試探到暫時拉開。`
- New CTA label:
  - `看下一句怎麼回`
- CTA reuses the existing unlock/contact flow instead of inventing a second path
- CTA scrolls toward the existing paid/contact area and passes `source: inline_result_cta` into the existing unlock path

## 3. Share Action Changes

- Kept the primary share button label as:
  - `分享這個結果`
- Updated the supporting line to:
  - `複製成 LINE / Threads 可以貼上的文字`
- Preserved current behavior:
  - `navigator.share` if available
  - clipboard fallback otherwise
- Existing success copy remains:
  - `已複製，可以貼到 LINE / Threads`

## 4. Paid Preview Hierarchy Changes

- Kept A as the visible open sample card
- Clarified B/C lock state with:
  - `⋯ 尚未解鎖`
- Softened the locked-text blur so it reads as locked content rather than loading
- Made the price relationship clearer with:
  - `一次性查看 · 無訂閱`
  - `一次性 · no subscription`
- Tightened the internal-test note so it avoids implying immediate real unlock

## 5. LINE Copy Compression

- Kept the current LINE-first title/body/CTA strategy intact
- Removed the extra `lineAddFriend` explanatory block when a LINE URL is available
- Kept the support line:
  - `你可以隨時封鎖官方帳號，或來信 hello@anyu.tw 要求刪除資料。`
- Kept Email fallback visible as:
  - `改用 Email 接收通知`

## 6. Event / Metrics Notes

- Preserved the existing `paid_unlock_clicked` event
- Extended the existing unlock request body with optional `source`
- Existing unlock event metadata now records:
  - `source: inline_result_cta`
  - or fallback `source: paid_preview`
- No raw input, contact values, full result JSON, or provider output were added

## 7. Files Changed

- `apps/web/src/components/modules/ai-temperature/AiTemperatureResult.tsx`
- `apps/web/src/components/anyu/PaidPreviewCard.tsx`
- `apps/web/src/components/anyu/ShareCardPreview.tsx`
- `apps/web/src/components/anyu/ContactCapture.tsx`
- `apps/web/src/lib/modules/ai-temperature-ui.ts`
- `apps/web/src/app/api/unlock-intent/route.ts`
- `apps/web/src/styles/globals.css`
- `apps/web/src/tests/ai-temperature-result.test.tsx`
- `apps/web/src/tests/contact-capture.test.tsx`
- `apps/web/src/tests/event-metadata.test.ts`

## 8. Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed
- live staging demo-result smoke passed after push
- `staging.anyu.tw` served the new inline CTA, updated share support copy, and revised paid-preview copy on the demo result surface

## 9. Remaining Conversion Backlog

- Human browser/device judgment for CTA rhythm and mobile reading flow
- Additional paywall/conversion rhythm refinement only if explicit approval is given
- Broader result/share polishing beyond this contained pass

## 10. Recommended Next Step

- `Conversion CTA Rhythm Staging QA v0`
