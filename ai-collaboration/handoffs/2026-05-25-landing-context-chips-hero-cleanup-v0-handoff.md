# Handoff: Landing Context Chips + Hero Cleanup v0

Date: 2026-05-25

Project: anyu-next / 暗語 ANYU

## Objective

Clean up Module 01 landing hero and optional context chips after the title hierarchy polish and paid result context-input upgrade.

This task should reduce repeated title text, remove redundant/AI-forward hero description, clarify context chip semantics, reduce overlap between chip groups, and optionally make the context section collapsible/expandable if it can be done safely.

This is a focused landing/input UX and copy polish task.

It can include P0, P1, and P2 cleanup together if implementation remains low risk.

Do not change paid result prompt/schema.

Do not change cache behavior.

Do not change LINE fulfillment.

Do not activate production.

Do not change legal/payment/email/ads behavior.

## Background

Recent changes:

```text
- Landing / Share Title Hierarchy Polish v0 made 曖昧溫度計 the primary title and 他是真的忙，還是其實在冷掉？ the subtitle.
- Paid Result Prompt/Schema Upgrade v0 added optional context chips:
  - relationshipStage
  - userGoal
  - primaryPain
  - replyTone
- Paid Result Prompt Safety / Value Refinement v0 made paid result v2 more robust.
```

User observed after manual screenshot review:

```text
1. The hero line 「貼上對話或描述情境，AI 幫你讀出關係溫度，與下一句怎麼回。」 is redundant because the input card already says similar things.
2. Avoid emphasizing AI because it can make users think they can just ask a generic AI themselves.
3. 曖昧溫度計 appears too many times:
   - top-left small label
   - MODULE · 01 · 曖昧溫度計
   - large H1
4. Suggested hierarchy:
   - keep only the large H1 曖昧溫度計
   - eyebrow should be MODULE · 01 only
   - remove top-left small 曖昧溫度計, or replace/lean on existing brand logo/mark if needed
5. 「情境」 and 「最卡的點」 chip groups overlap heavily.
6. 「回覆語氣」 is ambiguous: users may not know whether it means ANYU's tone or the tone of their reply to the other person.
7. 「直接但不逼」 feels under-polished; prefer a warmer phrase such as 「坦白但不施壓」.
8. Optional context chips may be too visually long; consider making them collapsible as 「讓結果更貼近你（選填）」.
```

ChatGPT recommended:

```text
P0:
- remove redundant hero description
- remove repeated 曖昧溫度計 instances
- rename 回覆語氣
- replace 直接但不逼

P1:
- reduce/merge overlapping chip groups
- remove or refactor 情境 group

P2:
- optionally make context chips collapsible/expandable
```

User approved combining P0/P1/P2 in one handoff to speed manual verification.

## Scope

Do:

1. Clean up hero copy.
2. Remove redundant repeated 曖昧溫度計 instances.
3. Adjust eyebrow to `MODULE · 01` only.
4. Remove the hero description line mentioning AI.
5. Review top-left module label and remove it if redundant.
6. Keep right-side ANYU brand/wordmark intact.
7. Refactor context chip taxonomy to reduce overlap.
8. Remove or merge the 「情境」 group if it duplicates primaryPain / textarea.
9. Rename reply tone group to clearly mean user-to-other-person reply tone.
10. Replace 「直接但不逼」 with a more polished phrase.
11. Optionally make context chips collapsible/expandable if low risk.
12. Preserve context payload field names and API contract unless a change is strictly necessary.
13. Add/update tests.
14. Run validation including Playwright.
15. Create review bundle, execution report, summary log.
16. Commit and push to `origin/staging`.

Do not:

- change paidResult prompt/schema/cache versions
- change analyze result schema
- change LINE fulfillment / webhook / LIFF
- change production env
- activate production
- change real payment/email/ads
- introduce new design tokens or fonts
- redesign the full page
- implement Module 02

## Target Surfaces

Review and update as applicable:

```text
apps/web/src/content/modules/ai-temperature.ts
apps/web/src/components/modules/ai-temperature/AiTemperatureLanding.tsx
apps/web/src/lib/modules/ai-temperature-ui.ts
apps/web/src/lib/modules/ai-temperature-context.ts
apps/web/e2e/module-01-smoke.spec.ts
apps/web/src/tests/*
```

Adjust paths based on actual repo.

## P0 Hero Cleanup

### Current issue

Hero area repeats module name too much and includes redundant AI-forward support sentence.

### Desired hero hierarchy

Use:

```text
MODULE · 01
曖昧溫度計
他是真的忙，還是其實在冷掉？
```

Remove from hero area:

```text
貼上對話或描述情境，AI 幫你讀出關係溫度，與下一句怎麼回。
```

Rationale:

```text
- input card already explains what to paste
- avoid over-emphasizing AI
- product should feel like ANYU's structured insight system, not generic AI Q&A
```

### Top-left small label

If current top-left label says:

```text
曖昧溫度計
```

Remove it.

If layout feels too empty, do not add new text. Prefer preserving existing right-side ANYU wordmark/mark and whitespace.

Do not introduce a new decorative mark unless already available and low-risk.

### Eyebrow

Change:

```text
MODULE · 01 · 曖昧溫度計
```

to:

```text
MODULE · 01
```

Keep visual rhythm.

## P1 Context Chip Taxonomy Cleanup

### Current issue

The current 「情境」 group overlaps with 「最卡的點」 and the textarea.

Example overlaps:

```text
情境: 已讀不回 / 忽冷忽熱 / 回訊變慢但看限動
最卡的點: 已讀不回 / 忽冷忽熱 / 有互動但不約 / 怕自己太主動
```

### Recommended cleanup

Prefer removing the 「情境」 group entirely.

Keep these groups:

```text
目前關係
你現在想要
最卡的點
你想回給對方的語氣
```

Reason:

```text
- textarea already captures the situation
- primaryPain captures the most relevant blocker
- fewer groups makes optional context feel lighter
```

If removing 「情境」 creates technical mismatch, map old field to primaryPain or safely deprecate it without breaking payload validation.

### Preserve internal context fields

Prefer preserving current context field names:

```text
relationshipStage
userGoal
primaryPain
replyTone
```

Do not add a new arbitrary text context field.

Do not break cache key behavior.

If removing an existing field, update cache tests carefully.

## P0/P1 Reply Tone Copy

### Group label

Current:

```text
回覆語氣 · 可選
```

Change to:

```text
你想回給對方的語氣 · 可選
```

or if layout needs shorter text:

```text
想用哪種語氣回對方 · 可選
```

Prefer:

```text
你想回給對方的語氣 · 可選
```

because it is clearest.

### Option copy

Replace:

```text
直接但不逼
```

with:

```text
坦白但不施壓
```

Alternative if spacing requires shorter:

```text
清楚但不施壓
```

Prefer:

```text
坦白但不施壓
```

### Existing tone options should remain warm

Example final replyTone options:

```text
有界線但不冷
輕鬆像聊天
自然一點
低壓試探
坦白但不施壓
不確定 / 跳過
```

Do not make language manipulative or tactical in a cold way.

## P2 Optional Context Collapse

If low risk, make the optional context chips section collapsible/expandable.

Recommended collapsed header:

```text
讓結果更貼近你（選填）
```

Helper copy:

```text
這些只會當作分析偏好，不會取代你貼上的互動內容。
```

Behavior:

```text
- default collapsed if no context selected
- expand when clicked
- remain expanded if user selects any chip
- selections still included in analyze payload
- accessible button semantics
```

If implementation complexity is higher than expected, skip collapse and document as deferred.

Do not hide currently selected values in a confusing way.

## UI / Visual Guidance

Keep:

```text
warm / gentle / premium
current typography
current cards and spacing language
current ANYU brand treatment
```

Avoid:

```text
more decorative clutter
more repeated labels
over-SaaS language
overly technical AI wording
```

The result should feel cleaner and faster to scan.

## Tests

Add/update tests for:

```text
hero h1 is 曖昧溫度計
hero subtitle is 他是真的忙，還是其實在冷掉？
hero does not include the redundant AI-forward description
eyebrow is MODULE · 01 only
reply tone label clarifies 對方
reply tone option uses 坦白但不施壓
removed/refactored 情境 group does not break context payload
context chips still submit valid allowed values
optional context collapse behavior if implemented
local Playwright landing flow still passes
```

Avoid overly brittle full-page snapshots.

## Staging / Visual Review

If staging deploys after push, verify:

```text
/m/ambiguous-temperature
/m/ambiguous-temperature/result/demo
```

Visual checks:

```text
no repeated 曖昧溫度計 except intended H1/title contexts
hero does not feel empty
input card still clearly explains what to do
context section is lighter
chips do not overflow on mobile
paid result/context analyze flow still works
```

Do not touch production.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-25-landing-context-chips-hero-cleanup-v0-review-bundle.md
```

Required sections:

```markdown
# Landing Context Chips + Hero Cleanup v0 Review Bundle

Date: 2026-05-25

## 1. Summary

## 2. User Feedback Addressed

## 3. Hero Cleanup

## 4. Title Repetition Reduction

## 5. Context Chip Taxonomy Changes

## 6. Reply Tone Copy Changes

## 7. Optional Context Collapse

## 8. Tests Updated

## 9. Validation Results

## 10. Staging / Visual Notes

## 11. Known Limitations

## 12. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-25-landing-context-chips-hero-cleanup-v0-execution-report.md
```

Report structure:

```markdown
# Landing Context Chips + Hero Cleanup v0 Execution Report

## Summary

## Files Created

## Files Updated

## Hero / Copy Changes

## Context Chip Changes

## UI Behavior Changes

## Tests Updated

## Validation Results

## Staging / Visual Notes

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
- hero cleanup summary
- context chip cleanup summary
- validation result
- commit hash
- staging push status

## Validation

Run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
cd apps/web && corepack pnpm test:e2e:local
```

Run Playwright because landing/input UI changes.

## Constraints

Do not implement:

```text
paidResult prompt/schema/cache changes
LINE production activation
production migration
real payment
email delivery
rich menu
broadcast
portal/account system
new second-call LLM generation
ads launch
model switch
queue/worker
SSE/websocket/token streaming
Module 02
```

Do not modify:

```text
legal semantics
LINE production behavior
production ops behavior
paid result schema/prompt
design system tokens unless tiny spacing fix is required
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
LINE_LOGIN_CHANNEL_SECRET
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
real contact values
raw private user content
font files
screenshots / test artifacts / videos / traces
raw sourced JSONL
private batch generated outputs
codes/tokens/tokenized URLs/LINE user IDs
full raw provider output
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "copy: clean landing context chips"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- hero cleanup summary
- repeated title reduction
- context chip changes
- optional collapse status
- tests updated
- validation results
- staging/visual notes
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
