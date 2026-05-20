# Module 01 Input Guidance + Indicator v0.5

## 1. Summary

This pass softened the landing input guidance without weakening the server guard. The input card now frames short or long input as context quality rather than a quota problem, and it adds a subtle four-step health indicator instead of louder SaaS-style progress UI.

## 2. Guidance Copy Changes

- kept the hard server-side minimum at `30`
- kept the soft long band at `2000+`
- kept the hard max at `4000`
- replaced more mechanical guidance with softer product-language states:
  - `還差一點點`
  - `可以分析了`
  - `內容剛剛好`
  - `內容有點長`
  - `內容太長了`
- removed remaining-count pressure from normal states
- only kept explicit count display for the true over-limit state as `current / 4000`

## 3. CTA Alignment

- short input CTA now reads `再寫一點…`
- valid input CTA still reads `分析我的曖昧溫度`
- over-limit CTA now reads `內容太長了`
- CTA enable/disable behavior did not change beyond matching the new labels

## 4. Indicator Treatment

- added a four-dot context-health indicator under the guidance copy
- indicator is purely visual and `aria-hidden`
- active-dot count increases by state:
  - `too_short`: 1
  - `can_analyze`: 2
  - `ideal`: 3
  - `long` and `too_long`: 4
- styling stays within the current ANYU token palette and avoids loud dashboard/progress-meter framing

## 5. Accessibility Notes

- guidance block remains `aria-live="polite"`
- the indicator is decorative only and does not add noisy screen-reader output
- the softer copy avoids shaming or task-like “finish the quota” language

## 6. Files Changed

- `apps/web/src/components/anyu/InputCard.tsx`
- `apps/web/src/lib/modules/ai-temperature-ui.ts`
- `apps/web/src/styles/globals.css`
- `apps/web/src/tests/ai-temperature-ui.test.ts`

## 7. Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

## 8. Remaining Notes

- the indicator is intentionally subtle, so final perceived clarity still benefits from a true human browser/device pass
- this pass did not change runtime validation, abuse guard thresholds, provider behavior, or event shape

## 9. Recommended Next Step

`Module 01 Human Browser Funnel Pass v0`
