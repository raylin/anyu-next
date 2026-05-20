# Handoff: LINE Funnel Strategy v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Create the v0 LINE funnel strategy for 暗語 ANYU / Module 01 before production launch.

This task should define how LINE should be used as the primary low-friction retention and delivery channel in Taiwan, while keeping Email as a secondary fallback.

This is a strategy/documentation task only.

Do not implement LINE Messaging API.

Do not change contact capture behavior yet.

Do not add payment.

Do not change runtime/model/prompt/schema/DB behavior.

## Background

The user prefers a one-person-company / side-project friendly launch model:

- fixed-cost / capped-cost operations
- low maintenance
- minimal manual social media burden
- paid ads can be used in small capped tests
- LINE funnel should be prioritized over email in Taiwan
- Email can remain secondary, but is less preferred due to deliverability/API overhead
- LINE add-friend friction is likely acceptable in Taiwan
- LINE should support conversion, complete-analysis delivery, retention, and future module updates

Current Module 01 flow:

```text
Landing
→ analyze
→ result
→ paid preview / fake-door unlock
→ contact capture
```

Current contact capture supports Email / LINE ID style inputs.

Future desired direction:

```text
Click paid unlock
→ primary CTA: 加入 LINE 領取完整分析
→ LINE OA becomes the main retention/delivery channel
→ Email remains backup option
```

## Scope

Do:

1. Define LINE funnel strategy for v0.
2. Define where LINE appears in the Module 01 funnel.
3. Define LINE OA minimum setup.
4. Define LINE rich menu / welcome message / auto-reply expectations.
5. Define whether Email remains and how.
6. Define conversion metrics.
7. Define low-maintenance operation model.
8. Define cost/usage guardrails for LINE messaging.
9. Define future implementation tasks.
10. Create strategy doc, execution report, summary log.
11. Commit and push to `origin/staging`.

Do not:

- implement LINE API
- create LINE OA assets in code
- change app contact capture yet
- implement LIFF
- implement webhooks
- implement email sending
- change legal pages unless small docs references are needed
- change payment/fake-door behavior
- change production deployment config

## Required Output

Create:

```text
ai-collaboration/research/2026-05-20-line-funnel-strategy-v0.md
```

## Required Structure

```markdown
# LINE Funnel Strategy v0

Date: 2026-05-20

## 1. Executive Summary

## 2. Why LINE First

## 3. Role Of Email

## 4. v0 Funnel Design

## 5. Module 01 Touchpoints

## 6. LINE Official Account Minimum Setup

## 7. Welcome Message Draft

## 8. Rich Menu Draft

## 9. Complete Analysis Delivery Model

## 10. Retention / Revisit Loop

## 11. Ad Traffic Integration

## 12. Cost And Message Guardrails

## 13. Privacy / Consent Requirements

## 14. Metrics

## 15. Operational Workflow For One-Person Company

## 16. What Not To Build Yet

## 17. Implementation Milestones

## 18. Open Questions

## 19. Recommended Next Step
```

## Content Requirements

### 1. Executive Summary

State:

```text
LINE should become the primary v0 retention and complete-analysis delivery channel for Taiwan.
Email remains a secondary fallback.
v0 should avoid heavy community management and use LINE mainly as a conversion/retention funnel.
```

### 2. Why LINE First

Explain:

```text
- low add-friend friction in Taiwan
- stronger re-contact than email
- better for new module notifications
- better for internal-test delivery
- avoids email deliverability complexity
- fits one-person-company operation
```

### 3. Role Of Email

Email should be:

```text
secondary fallback
optional
not the primary conversion path
used only when user does not want LINE
```

Do not remove Email entirely.

### 4. v0 Funnel Design

Propose flow:

```text
User sees result
→ clicks 解鎖下一句怎麼回 — NT$49
→ sees internal-test explanation
→ primary CTA: 加入 LINE 領取完整分析
→ secondary option: 使用 Email 接收
```

Important copy direction:

```text
目前內測中，這次不會真的收費。
加入 LINE 後，我們會送你一次完整分析，也會低頻通知新測驗。
你可以隨時封鎖或要求刪除資料。
```

### 5. Module 01 Touchpoints

Define where LINE appears:

```text
paid preview card
contact capture area
post-submit confirmation
footer/legal if needed
future result follow-up
```

Do not put LINE too early on landing. The user should first see value.

### 6. LINE OA Minimum Setup

Define minimum non-code setup:

```text
LINE Official Account name: 暗語 ANYU
Profile image: ANYU mark
Greeting message
Rich menu
Privacy link
測曖昧溫度 link
Contact/support note
```

Do not require daily posting.

### 7. Welcome Message Draft

Create 2–3 draft welcome messages in Traditional Chinese.

Tone:

```text
warm
premium
not spammy
not hard-sell
not too cute
```

Example direction:

```text
歡迎來到暗語 ANYU。
我們會把那些說不清的互動，翻譯成一點方向。
如果你是從曖昧溫度計來的，請回覆「完整分析」或點下方連結領取。
```

### 8. Rich Menu Draft

Suggest 3–4 buttons:

```text
測曖昧溫度
領取完整分析
最新測驗
隱私與刪除資料
```

Keep it low-maintenance.

### 9. Complete Analysis Delivery Model

Define v0 options:

#### Option A: Manual / semi-manual delivery

```text
lowest complexity
good for beta
user adds LINE
operator sends complete analysis manually or semi-manually
```

#### Option B: Link-based delivery

```text
resultId / unlockIntentId generates a secure-ish link
LINE message directs user back to result
```

#### Option C: LIFF / webhook automation

```text
future, not v0 unless needed
```

Recommendation:

```text
v0: manual or semi-manual delivery first
v1: link-based delivery
v2: LIFF/webhook
```

### 10. Retention / Revisit Loop

Define low-frequency retention:

```text
3-day follow-up: 後來有新的互動嗎？
new module notification: once per new module
weekly/biweekly digest only if useful
no daily push
```

### 11. Ad Traffic Integration

Define ad funnel:

```text
Meta/IG ad
→ Module 01 landing
→ analyze
→ result
→ paid-intent click
→ LINE add
```

Do not route cold ad traffic directly to LINE.

LINE is downstream conversion/retention, not initial cold acquisition.

### 12. Cost And Message Guardrails

Mention:

```text
LINE push/broadcast should be low frequency.
Avoid mass push until there is clear value.
Use reply/greeting/manual messages where possible.
Track LINE add count from paid intent.
Do not over-message.
```

If exact LINE pricing is unknown, do not invent numbers.

### 13. Privacy / Consent Requirements

Align with legal drafts:

```text
tell users why they are joining LINE
explain what messages they may receive
provide privacy/deletion contact: hello@anyu.tw
do not sell LINE data
allow blocking/unsubscribe
Email backup option
```

### 14. Metrics

Define:

```text
result_view → paid_unlock_clicked
paid_unlock_clicked → LINE add click
LINE add click → actual LINE friend/add confirmation if measurable
LINE add → complete analysis delivered
LINE add → new module return
LINE unsubscribe/block if available
```

If actual LINE add confirmation is not available initially, use proxy:

```text
LINE CTA click
```

### 15. One-Person Operation Workflow

Define:

```text
daily check LINE inbox
send promised complete analyses
tag beta users
export minimal metrics
no daily content obligation
one new module notification only when useful
```

### 16. What Not To Build Yet

Do not build yet:

```text
LINE webhook automation
LIFF app
advanced CRM segmentation
daily push content calendar
full account system
paid membership
complex referral system
```

### 17. Implementation Milestones

Suggest:

#### Milestone A: LINE Funnel Copy + UI Plan

```text
update contact capture copy
primary LINE CTA
secondary Email option
legal copy alignment
```

#### Milestone B: LINE OA Setup

```text
create OA
profile image
welcome message
rich menu
privacy links
```

#### Milestone C: LINE Funnel App Implementation

```text
add LINE add-friend link
track LINE CTA click
contact capture fallback
resultId context
```

#### Milestone D: Post-launch Retention

```text
manual delivery
3-day follow-up
new module notification
```

### 18. Open Questions

Include:

```text
What is the final LINE OA add-friend URL?
Should LINE add be required for complete analysis, or allow Email fallback equally?
Should user need to send a keyword after adding LINE?
How to connect resultId/unlockIntentId to LINE user manually in v0?
How much manual response volume is acceptable?
```

### 19. Recommended Next Step

Recommend:

```text
LINE Funnel UI Copy + Implementation Plan v0
```

or if still before implementation:

```text
Production Deployment Runbook v0
```

Choose based on whether user wants LINE in v0 public launch.

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-line-funnel-strategy-v0-execution-report.md
```

Report structure:

```markdown
# LINE Funnel Strategy v0 Execution Report

## Summary

## Files Created

## Files Updated

## Strategy Decisions Captured

## LINE / Email Role

## Metrics Captured

## Implementation Milestones

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
- LINE funnel strategy path
- LINE/Email decision
- recommended next step
- validation result
- commit hash
- staging push status

## Validation

Always run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

This is docs-only, but validation should still pass.

## Constraints

Do not implement:

```text
LINE API
LIFF
webhook
email sending
auth
payment
portal
new UI behavior
runtime changes
```

Do not modify:

```text
product prompt/schema
DB schema
provider/model
legal semantics unless only cross-reference
design system
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
real contact values
raw private user content
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "docs: define line funnel strategy"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if:

- validation failed
- unrelated uncommitted changes exist
- secrets are staged
- raw user content is staged

If push is skipped or fails, report exact reason.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- LINE funnel strategy path
- LINE/Email role decision
- v0 funnel recommendation
- metrics
- implementation milestones
- validation results
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
