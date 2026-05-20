# Handoff: Module 01 Input Guidance Indicator v0.5

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Refine the Module 01 input guidance UX so users understand whether they have provided enough context without feeling pressured by explicit “remaining character count” messaging.

This task should replace any overly task-like `x / 30 + 再補 N 個字` guidance with a softer context-health indicator.

This is a focused micro-UX task.

Do not change server-side validation thresholds.

Do not change model, prompt/schema, DB schema, provider architecture, auth, payment, portal, or design system source of truth.

## Background

Module 01 Micro UX Fixes v0.4 added richer input context guidance.

User feedback:

- Showing word count alone is not enough.
- But `12 / 30` plus `再補 18 個字，就可以分析` feels repetitive and a little pressure-inducing.
- Because the helper text is a warm reminder, the UI should not feel like a form-validation task.
- For `<30`, it should simply say something like `還差一點點`.
- In the future, a color/visual meter can indicate text health.

Current thresholds should remain:

```text
min length: 30 characters
soft ideal: around 120+ characters
soft long: 2000+ characters
hard max: 4000 characters
```

## UX Principle

This is an emotional insight product, not a tax form.

Use:

```text
soft status
gentle guidance
visual indicator
clear hard errors only when truly blocked
```

Avoid:

```text
還差 18 個字
12 / 30 as the main message
aggressive validation language
red error styling before real error
```

## Scope

Do:

1. Replace pressure-inducing input guidance copy.
2. Add or refine a soft context-health indicator.
3. Keep server-side min/max validation unchanged.
4. Keep CTA enabled/disabled logic unchanged unless label text needs alignment.
5. Show explicit counter only for hard max / too-long state if useful.
6. Add/update tests for guidance states.
7. Commit and push to `origin/staging`.

Do not:

- weaken abuse guard thresholds
- change server-side min length
- change hard max
- alter prompt/schema
- add analytics events
- add legal pages
- add model changes
- make major redesigns

## Required Guidance States

Implement guidance states like this.

### State 1: Empty / Too Short `< 30`

Status label:

```text
還差一點點
```

Helper copy:

```text
多給一點互動脈絡，ANYU 才讀得出節奏。
```

CTA label:

```text
再寫一點…
```

Do not show:

```text
12 / 30
再補 18 個字
```

A small subtle meter may show low progress visually, but no exact “remaining chars”.

### State 2: Short But Analyzable `30–119`

Status label:

```text
可以分析了
```

Helper copy:

```text
如果再多一點前後文，結果會更細。
```

CTA label:

```text
分析我的曖昧溫度
```

### State 3: Healthy `120–2000`

Status label:

```text
內容剛剛好
```

Helper copy:

```text
這段互動已經足夠讀出節奏。
```

CTA label:

```text
分析我的曖昧溫度
```

### State 4: Long But Allowed `2000–4000`

Status label:

```text
內容有點長
```

Helper copy:

```text
建議保留最近幾段關鍵對話就好。
```

CTA label:

```text
分析我的曖昧溫度
```

### State 5: Too Long `> 4000`

Status label:

```text
內容太長了
```

Helper copy:

```text
請刪到 4000 字以內，再送出分析。
```

CTA label:

```text
內容太長了
```

For this state only, showing an explicit counter is acceptable:

```text
4120 / 4000
```

because the user needs to understand the hard block.

## Context Health Indicator

Add a subtle visual indicator if practical.

Preferred simple version:

- 4-step horizontal meter or segmented dots
- states:
  - 還差一點
  - 可以分析
  - 剛剛好
  - 有點長
- true error state only for `>4000`

Design rules:

```text
use ANYU v1.1 tokens
do not use bright red unless >4000
do not look like a SaaS password-strength meter
do not make it visually louder than the input content
```

Possible visual:

```text
○ 還差一點
● 可以分析
● 剛剛好
○ 有點長
```

Or a soft bar:

```text
[short ---- ideal ---- long]
```

Keep it simple.

## Accessibility

Ensure the input guidance is accessible.

Requirements:

```text
guidance text should be readable
state changes should be announced politely if practical
no color-only meaning
status label + helper copy should communicate state
```

If using `aria-live`, use `polite`.

## Files Likely To Update

Likely files:

```text
apps/web/src/components/modules/ai-temperature/AiTemperatureLanding.tsx
apps/web/src/components/anyu/InputCard.tsx
apps/web/src/lib/modules/ai-temperature-ui.ts
apps/web/src/tests/ai-temperature-ui.test.ts
apps/web/src/styles/globals.css
```

Only update files actually needed.

## Testing

Add/update tests for:

```text
<30 returns status: 還差一點點
30–119 returns status: 可以分析了
120–2000 returns status: 內容剛剛好
2000–4000 returns status: 內容有點長
>4000 returns status: 內容太長了
too-short does not include “再補 N 個字”
too-long may include max counter if implemented
CTA labels remain aligned
```

Do not add live provider tests.

## Required Output

Create:

```text
ai-collaboration/research/2026-05-20-module-01-input-guidance-indicator-v0-5.md
```

Required sections:

```markdown
# Module 01 Input Guidance Indicator v0.5

## 1. Summary

## 2. User Feedback Addressed

## 3. Guidance State Changes

## 4. Context Health Indicator

## 5. CTA State Alignment

## 6. Accessibility Notes

## 7. Files Changed

## 8. Validation Results

## 9. Remaining UX Follow-ups

## 10. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-module-01-input-guidance-indicator-v0-5-execution-report.md
```

Report structure:

```markdown
# Module 01 Input Guidance Indicator v0.5 Execution Report

## Summary

## Files Created

## Files Updated

## Input Guidance Changes

## Indicator Changes

## CTA Alignment

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
- indicator summary
- validation result
- commit hash
- staging push status

## Validation

Always run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

If possible, smoke check:

```text
empty input
<30 input
30+ input
120+ input
>4000 input
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
server-side thresholds unless absolutely necessary
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
git commit -m "fix: soften module 01 input guidance"
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

- guidance state changes
- whether exact remaining-count copy was removed
- indicator added/updated
- CTA alignment
- validation results
- report path
- commit hash
- staging push status
- exact next step

Then stop.
