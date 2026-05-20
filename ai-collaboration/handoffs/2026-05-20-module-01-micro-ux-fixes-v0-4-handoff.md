# Handoff: Module 01 Micro UX Fixes v0.4 — Input Guidance, Loading Focus, Share Affordance

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Apply a small micro-UX fix pass for Module 01 based on the latest human funnel feedback.

This task should improve:

1. input-length guidance without over-blocking users
2. focus/scroll behavior after CTA click so the user sees the loading state
3. share action affordance so it feels more like a real social/share button

This is a focused UX task.

Do not change model, prompt/schema, DB schema, provider architecture, auth, payment, portal, or legal pages.

## Background

After staging guard verification and contact/unlock regression, the user performed further UX review and reported:

1. The current minimum input length may be too rigid or unclear.
   - Enough context helps analysis quality.
   - The product should show an indicator or reminder that more context improves results.
   - Need to avoid users feeling blocked without guidance.

2. After clicking the analyze CTA, focus should automatically move/scroll to the next block, such as the loading state.
   - The user should immediately see that the app is working.
   - This matters especially on mobile where the keyboard and viewport can hide the loading state.

3. The current copy/share action feels insufficiently social or insufficiently button-like.
   - It can be improved later, but should be noted and optionally improved if small.

## Scope

Do:

- refine input-length UX
- add context-quality indicator / helper
- ensure CTA click scrolls/focuses to loading state
- improve loading container focus target accessibility
- lightly improve share action button affordance if safe
- add tests for helper logic where practical
- update docs/reports
- commit and push to `origin/staging`

Do not:

- change current Sonnet model default
- change prompt/schema content
- change DB schema
- add real share image generation
- add auth/payment/portal
- add LINE integration
- add legal pages in this task
- make major redesigns

## UX Decisions

### 1. Minimum Length / Input Guidance

Current hard minimum is 30 characters.

Keep server-side minimum at 30 for now as abuse/cost guard.

But improve the UX so users understand that more context gives a better result.

Recommended approach:

- Keep hard block for `<30` chars.
- Add context-quality indicator:
  - 0–29 chars: `再寫一點互動脈絡`
  - 30–119 chars: `可以分析，但多一點上下文會更準`
  - 120–2000 chars: `內容足夠，適合分析`
  - 2000–4000 chars: `內容有點長，建議保留最近幾段關鍵對話`
  - >4000 chars: `太長了，請縮短到最近幾段`

Suggested labels:

```text
再寫一點
可分析
剛剛好
有點長
太長了
```

Suggested helper copy:

```text
多貼一點前後文，ANYU 會更容易讀出節奏。
```

Important:

- Do not make the UI feel judgmental.
- Do not overpromise accuracy.
- Do not say “越長越準”.
- Prefer “多一點互動脈絡會更好”.

### 2. CTA Click → Focus / Scroll To Loading

After enabled CTA click:

- Immediately hide or reduce the keyboard if possible by blurring textarea.
- Set loading state.
- Scroll/focus to the loading state block.
- Loading container should have a ref and accessible focus target.

Implementation idea:

```ts
loadingRef.current?.scrollIntoView({
  behavior: "smooth",
  block: "center"
});
loadingRef.current?.focus({ preventScroll: true });
```

If focus is used, loading block should be:

```tsx
<div
  ref={loadingRef}
  tabIndex={-1}
  aria-live="polite"
  role="status"
>
```

Make sure this does not create odd focus outlines or layout jumps.

Acceptance:

- On mobile, after tapping analyze, user sees loading state without needing to scroll manually.
- Keyboard should not obscure the loading state.
- Screen reader users get a status update.

### 3. Share Action Affordance

The current share/copy action works but feels insufficiently social or insufficiently like a button.

For this pass, make a small affordance improvement only.

Possible improvements:

- Rename button to `分享這個結果`
- Secondary text: `複製成 LINE / Threads 可貼上的文字`
- Use a clearer button treatment, not subtle text-link.
- Add success state:
  - `已複製，可以貼到 LINE / Threads`
- If native share is available:
  - label can still be `分享這個結果`
  - fallback remains clipboard

Do not implement PNG share card in this task.

Do not add Instagram story flow yet.

## Files Likely To Update

Likely files:

```text
apps/web/src/components/modules/ai-temperature/AiTemperatureLanding.tsx
apps/web/src/components/modules/ai-temperature/AiTemperatureResult.tsx
apps/web/src/components/anyu/InputCard.tsx
apps/web/src/components/anyu/ShareCardPreview.tsx
apps/web/src/lib/modules/ai-temperature-ui.ts
apps/web/src/tests/ai-temperature-ui.test.ts
apps/web/src/styles/globals.css
```

Only update files actually needed.

## Testing

Add/update tests for:

- context quality helper
- CTA label behavior if affected
- input length helper states
- share text helper if affected

Avoid live provider tests.

## Required Output

Create:

```text
ai-collaboration/research/2026-05-20-module-01-micro-ux-fixes-v0-4.md
```

Required sections:

```markdown
# Module 01 Micro UX Fixes v0.4

## 1. Summary

## 2. Input Guidance Changes

## 3. Loading Focus / Scroll Changes

## 4. Share Action Affordance Changes

## 5. Accessibility Notes

## 6. Files Changed

## 7. Validation Results

## 8. Remaining UX Follow-ups

## 9. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-module-01-micro-ux-fixes-v0-4-execution-report.md
```

Report structure:

```markdown
# Module 01 Micro UX Fixes v0.4 Execution Report

## Summary

## Files Created

## Files Updated

## Input UX Changes

## Loading Focus Changes

## Share UX Changes

## Accessibility Notes

## Validation Results

## Known Technical Debt

## Deviations From Handoff

## Git Commit

## Staging Push

## Remaining Uncertainties

## Recommended Next Step
```

## Summary Log

Append to:

```text
ai-collaboration/summaries/summary_log.md
```

Include:

- date
- task completed
- input guidance summary
- loading focus summary
- share affordance summary
- validation result
- commit hash
- staging push status

## Validation

Always run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

If possible, smoke check staging/local:

```text
valid input → click CTA → loading state visible
```

## Constraints

Do not implement:

```text
auth
real payment
portal
share PNG / OG generation
email sending
LINE integration
advanced PII / NER
scheduled deletion job
model switch
major runtime rewrite
legal pages
```

Do not modify:

```text
product prompt/schema content
provider architecture
DB schema
legacy prototype behavior
Dcard scripts
design system v1.1 tokens unless necessary
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
raw private user content
raw DB row dumps
full provider raw output
real contact values
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "fix: improve module 01 micro UX"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if:

- validation failed
- unrelated uncommitted changes exist
- secrets are staged
- raw user content is staged
- report contains secrets or raw DB rows

If push is skipped or fails, report exact reason.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- input guidance changes
- loading focus/scroll behavior
- share button/affordance changes
- accessibility notes
- validation results
- report path
- commit hash
- staging push status
- exact next step

Then stop.
