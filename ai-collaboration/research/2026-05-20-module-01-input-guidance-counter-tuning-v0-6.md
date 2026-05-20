# Module 01 Input Guidance Counter Tuning v0.6

## 1. Summary

This pass restored numeric progress for the first analyzable threshold without bringing back pressure-style “remaining characters” copy. The landing guidance now gives users one clear progress signal under `30` characters while keeping the softer v0.5 tone.

## 2. User Feedback Addressed

- kept the softer emotional tone from v0.5
- restored numeric progress before the first analyzable threshold
- avoided redundant guidance such as showing both `12 / 30` and `再補 18 個字`
- kept the existing indicator and threshold logic intact

## 3. Counter Behavior

- `<30`: shows a small mono progress label such as `12 / 30`
- `30–119`: no numeric progress shown by default, so the enabled CTA does not feel like a new quota
- `120–2000`: no counter shown
- `2000–4000`: no counter shown
- `>4000`: still shows the hard-limit counter such as `4120 / 4000`

## 4. Copy Changes

- kept the softened v0.5 labels:
  - `還差一點點`
  - `可以分析了`
  - `內容剛剛好`
  - `內容有點長`
  - `內容太長了`
- kept the warm short-input helper:
  - `多給一點互動脈絡，ANYU 才讀得出節奏。`
- kept duplicate remaining-count sentences out of the guidance layer

## 5. CTA Alignment

- `<30`: `再寫一點…`
- `30+`: `分析我的曖昧溫度`
- `>4000`: `內容太長了`
- CTA enable/disable behavior did not change

## 6. Files Changed

- `apps/web/src/components/anyu/InputCard.tsx`
- `apps/web/src/lib/modules/ai-temperature-ui.ts`
- `apps/web/src/tests/ai-temperature-ui.test.ts`

## 7. Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

## 8. Remaining UX Follow-ups

- a later human browser/device pass should confirm that the restored short-input counter feels helpful rather than busy
- if users still hesitate around the `30–119` band, a later pass can test a subtle `current / 120` quality cue without making it feel required

## 9. Recommended Next Step

`Module 01 Human Browser Funnel Pass v0`
