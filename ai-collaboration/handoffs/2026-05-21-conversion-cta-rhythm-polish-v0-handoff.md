# Handoff: Conversion / CTA Rhythm Polish v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Apply a narrow conversion and CTA rhythm polish pass to Module 01 — 曖昧溫度計 — after the P0 visual-system alignment work.

This task should improve result-page action rhythm, share action affordance, paid-preview hierarchy, and LINE panel copy clarity without changing the core product flow.

This is a small UI/copy polish task.

Do not change runtime, model, prompt/schema, DB schema, legal semantics, LINE API, auth, payment, portal, production ops behavior, or font migration Phase 2/3.

## Background

Recent UI system work completed and passed human review:

```text
Brand Mark Selective UI Rollout v0: passed
Font Migration Phase 1: Latin Display v0: passed
P0 visual-system alignment: broadly complete
Production low-key launch: live and acceptable
```

Remaining P1 polish from the consolidated UI backlog:

```text
Result Page CTA Rhythm
Share Action Affordance
Paid Preview Hierarchy Polish
LINE Funnel Copy Compression
```

User confirmed:

```text
目前看起來有整理都更好一些
```

Goal:

```text
Make the result page feel more action-oriented without making it pushy or SaaS-like.
```

## Scope

Do:

1. Improve result-page CTA rhythm.
2. Make share action feel more social and button-like.
3. Lightly improve paid-preview hierarchy.
4. Compress LINE panel copy to reduce repetition.
5. Keep current fake-door / LINE-first notification flow intact.
6. Keep Email fallback intact.
7. Add/update tests.
8. Create review bundle and execution report.
9. Commit and push to `origin/staging`.

Do not:

- add real payment
- change fake-door backend behavior
- change LINE API / LIFF / webhook
- change contact API behavior
- change model/runtime/prompt/schema/DB
- change legal semantics
- add font Phase 2/3
- redesign the full result page
- add sticky CTA unless clearly low-risk and well-contained
- change production launch status

## Design Principles

Maintain ANYU tone:

```text
warm
premium
gentle
not pushy
not SaaS-like
not hard-sell
not too cute
```

Primary product question:

```text
After receiving the free result, does the user clearly know the next useful action?
```

## Item 1: Result Page CTA Rhythm

Current issue:

```text
Result page is rich, but the main paid/LINE path may appear late after several content blocks.
```

Goal:

```text
Expose the “next step” earlier without interrupting result reading.
```

Recommended approach:

Add a subtle inline transition CTA after the main insight / before deeper paid preview, or improve existing transition copy if already present.

Suggested copy:

```text
想知道下一句怎麼回？
解鎖 3 種不失控的回法，從主動推進、低壓試探到暫時拉開。
```

CTA label:

```text
看下一句怎麼回
```

Important:

- This should scroll to or reveal the existing paid preview/contact area.
- Do not duplicate paid intent tracking in a confusing way.
- If this button maps to the same unlock action, keep event metadata source distinct if possible:
  - `source: inline_result_cta`
- If adding an extra CTA feels too broad, instead strengthen the existing paid-preview entry copy.

Do not create a sticky bottom CTA in this pass unless implementation is trivial and does not crowd mobile.

## Item 2: Share Action Affordance

Current issue:

```text
Share action works, but can feel not social enough or not button-like enough.
```

Goal:

```text
Make sharing feel like a natural social action for LINE / Threads while keeping it secondary to paid/LINE conversion.
```

Recommended updates:

Button label:

```text
分享這個結果
```

Supporting copy:

```text
複製成 LINE / Threads 可以貼上的文字
```

Success copy:

```text
已複製，可以貼到 LINE / Threads
```

Optional alternate label if current copy is too plain:

```text
分享到 LINE / Threads
```

But avoid claiming native integration if it only copies text.

Behavior should remain:

```text
navigator.share if available
clipboard fallback
```

Do not implement image share / PNG / OG generation in this task.

## Item 3: Paid Preview Hierarchy

Current issue:

```text
Paid preview is structurally correct, but B/C locked cards may not be obvious enough as locked content.
```

Goal:

```text
Make A/B/C preview hierarchy clearer without redesigning paywall.
```

Recommended changes:

- Keep A card as the visible sample.
- Make B/C locked state clearer with subtle `⋯ 尚未解鎖` or a small AnyuMark hint.
- Avoid heavy blur that looks like loading.
- Make `NT$49` and “一次性 / no subscription” relationship clear.

Suggested locked hint:

```text
⋯ 尚未解鎖
```

or:

```text
開放後可查看
```

Choose copy consistent with current fake-door/LINE notification flow.

Because v0 currently does not charge or deliver complete analysis immediately, avoid language that implies actual immediate unlock if not true.

Preferred CTA copy remains aligned with current strategy:

```text
解鎖下一句怎麼回 — NT$49
```

with clear note:

```text
目前內測中，這次不會真的收費。
```

## Item 4: LINE Panel Copy Compression

Current issue:

```text
Paid block and LINE panel may repeat internal-test / no-real-charge / opening-notification messaging.
```

Goal:

```text
Keep LINE action clear and reduce repeated explanatory text.
```

Recommended LINE panel copy:

Title:

```text
加入 LINE，收到完整分析開放通知
```

Body:

```text
目前內測中，這次不會真的收費。加入後，我們會優先通知你完整分析與新測驗開放。
```

Support line:

```text
你可以隨時封鎖官方帳號，或來信 hello@anyu.tw 要求刪除資料。
```

Primary button:

```text
加入 LINE，收到開放通知
```

Secondary:

```text
改用 Email 接收通知
```

If current copy already matches this, only reduce duplication.

Do not claim immediate complete-analysis delivery.

## Event / Metrics

Preserve existing events.

If new inline CTA is added, track safely:

```text
paid_unlock_clicked
metadata.source = inline_result_cta
```

or if event taxonomy supports it:

```text
result_inline_cta_clicked
```

Prefer not to expand event taxonomy unless already simple.

Privacy rules:

```text
No raw input
No email
No LINE ID
No full result JSON
No provider output
```

## Files Likely To Update

Likely files:

```text
apps/web/src/components/modules/ai-temperature/AiTemperatureResult.tsx
apps/web/src/components/anyu/PaidPreviewCard.tsx
apps/web/src/components/anyu/ShareCardPreview.tsx
apps/web/src/components/anyu/ContactCapture.tsx
apps/web/src/lib/modules/ai-temperature-ui.ts
apps/web/src/styles/globals.css
apps/web/src/tests/ai-temperature-ui.test.ts
apps/web/src/tests/contact-capture.test.tsx
apps/web/src/tests/event-metadata.test.ts
```

Only update what is necessary.

## Tests

Add/update tests for:

```text
inline result CTA copy if added
share action label/success copy
locked paid preview hint
LINE panel compressed copy
Email fallback still available
event metadata source if new CTA added
```

Avoid brittle visual snapshots.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-21-conversion-cta-rhythm-polish-v0-review-bundle.md
```

Required sections:

```markdown
# Conversion / CTA Rhythm Polish v0 Review Bundle

Date: 2026-05-21

## 1. Summary

## 2. Result CTA Rhythm Changes

## 3. Share Action Changes

## 4. Paid Preview Hierarchy Changes

## 5. LINE Copy Compression

## 6. Event / Metrics Notes

## 7. Files Changed

## 8. Validation Results

## 9. Remaining Conversion Backlog

## 10. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-conversion-cta-rhythm-polish-v0-execution-report.md
```

Report structure:

```markdown
# Conversion / CTA Rhythm Polish v0 Execution Report

## Summary

## Files Created

## Files Updated

## CTA Rhythm Changes

## Share Changes

## Paid Preview Changes

## LINE Copy Changes

## Event / Metrics Changes

## Validation Results

## Known Technical Debt

## Tech Debt Review

### New Technical Debt Introduced

### Existing Technical Debt Observed

### Opportunistic Cleanup Completed

### Deferred Cleanup Candidates

### Recommended Follow-up

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
- polish summary
- validation result
- commit hash
- staging push status

## Validation

Always run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

If UI changed, validate after changes.

If possible, smoke check:

```text
/m/ambiguous-temperature/result/demo
```

## Constraints

Do not implement:

```text
font migration phase 2
font migration phase 3
ads launch
real payment
LINE API
LIFF
email sending
auth
portal
scheduled deletion job
model switch
major runtime rewrite
image share / PNG / OG generation
```

Do not modify:

```text
product prompt/schema
DB schema
provider/model
legal semantics
LINE funnel behavior beyond copy compression
production ops behavior
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
real contact values
raw private user content
font files
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "design: polish result conversion rhythm"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- CTA rhythm changes
- share action changes
- paid preview changes
- LINE copy changes
- validation results
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
