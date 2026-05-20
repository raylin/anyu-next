# Handoff: Module 01 Input Guidance Counter Tuning v0.6

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Tune Module 01 input guidance so the user can clearly see progress toward the first analyzable threshold without duplicated or pressure-inducing copy.

This is a very small UX tuning task.

Do not change server-side validation thresholds.

Do not change model, prompt/schema, DB schema, provider architecture, auth, payment, portal, or design system source of truth.

## Background

Module 01 Input Guidance Indicator v0.5 softened guidance copy and removed pressure-style remaining-character text.

User feedback after v0.5:

- The softer tone is directionally right.
- However, before the first analyzable threshold, users still need to know how close they are.
- Showing numeric progress is useful.
- The previous issue was not the number itself; it was duplicated messaging:
  - `12 / 30`
  - `再補 18 個字，就可以分析`
- Keep one clear signal, not both.

Current desired behavior:

```text
Before 30 chars:
show numeric progress such as `12 / 30`
helper text should be warm and non-redundant, e.g. `還差一點點`

Do not also say:
`再補 18 個字，就可以分析`
```

## Scope

Do:

1. Restore / keep numeric progress for the `<30` threshold.
2. Avoid duplicate remaining-character helper copy.
3. Keep soft status labels from v0.5.
4. Keep the context-health indicator if it still works.
5. Keep server-side thresholds unchanged.
6. Update tests.
7. Commit and push to `origin/staging`.

Do not:

- change validation thresholds
- change abuse guard behavior
- change prompt/schema
- change model/runtime
- add new features
- make major layout/design changes

## UX Rules

### State 1: Empty / Too Short `< 30`

Show a small numeric progress indicator:

```text
12 / 30
```

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
再補 18 個字，就可以分析
```

Do not show both a numeric count and a calculated remaining-count sentence.

The numeric progress itself is enough.

### State 2: Short But Analyzable `30–119`

Optional counter may switch to the next quality target if useful:

```text
48 / 120
```

or hide exact counter if it feels too busy.

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

Important:

- Since CTA is already enabled, numeric counter should not feel like another required quota.
- If shown, present it as context-quality progress, not a requirement.

### State 3: Healthy `120–2000`

Status label:

```text
內容剛剛好
```

Helper copy:

```text
這段互動已經足夠讀出節奏。
```

Counter can be hidden or shown subtly.

### State 4: Long But Allowed `2000–4000`

Status label:

```text
內容有點長
```

Helper copy:

```text
建議保留最近幾段關鍵對話就好。
```

Counter can show current / 4000 if useful, but keep it non-alarming.

### State 5: Too Long `>4000`

Show explicit counter:

```text
4120 / 4000
```

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

This is the only state where hard-limit counter should be prominent.

## Recommended Display Pattern

For `<30`:

```text
12 / 30
還差一點點
多給一點互動脈絡，ANYU 才讀得出節奏。
```

But visually:

- `12 / 30` should be a small mono progress label.
- `還差一點點` should be the human-friendly state.
- Helper copy should be secondary.
- Avoid making all three equally loud.

If layout feels too dense, keep:

```text
12 / 30 · 還差一點點
```

and put helper copy below.

## Files Likely To Update

Likely files:

```text
apps/web/src/components/anyu/InputCard.tsx
apps/web/src/lib/modules/ai-temperature-ui.ts
apps/web/src/tests/ai-temperature-ui.test.ts
apps/web/src/styles/globals.css
```

Only edit files actually needed.

## Testing

Update tests for:

```text
<30 state includes progress like 12 / 30
<30 state does not include “再補 N 個字”
<30 state still uses 還差一點點
30+ state still enables CTA
>4000 state still shows hard max counter
server-side thresholds unchanged
```

## Required Output

Create:

```text
ai-collaboration/research/2026-05-20-module-01-input-guidance-counter-tuning-v0-6.md
```

Required sections:

```markdown
# Module 01 Input Guidance Counter Tuning v0.6

## 1. Summary

## 2. User Feedback Addressed

## 3. Counter Behavior

## 4. Copy Changes

## 5. CTA Alignment

## 6. Files Changed

## 7. Validation Results

## 8. Remaining UX Follow-ups

## 9. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-module-01-input-guidance-counter-tuning-v0-6-execution-report.md
```

Report structure:

```markdown
# Module 01 Input Guidance Counter Tuning v0.6 Execution Report

## Summary

## Files Created

## Files Updated

## Counter Changes

## Copy Changes

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
- input counter tuning summary
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
<30 input displays numeric progress and soft copy
30+ input enables CTA
>4000 input displays hard max state
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
server-side thresholds
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
git commit -m "fix: tune module 01 input guidance counter"
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

- counter behavior changed
- duplicate remaining-count copy removed
- CTA alignment
- validation results
- report path
- commit hash
- staging push status
- exact next step

Then stop.
