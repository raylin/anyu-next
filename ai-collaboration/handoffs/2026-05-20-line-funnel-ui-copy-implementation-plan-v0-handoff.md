# Handoff: LINE Funnel UI Copy + Implementation Plan v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Translate the approved LINE Funnel Strategy v0 into concrete Module 01 UI copy, product behavior, and implementation milestones.

This task should define how the current generic contact capture should evolve into a LINE-first fake-door funnel while keeping Email as a secondary fallback.

This is a planning + copy specification task.

Do not implement LINE API.

Do not change the current app UI behavior yet unless explicitly scoped as documentation-only copy proposal.

Do not add LIFF, webhook, payment, auth, or email sending.

## Background

LINE Funnel Strategy v0 completed.

Current strategy decisions:

```text
LINE should be the primary v0 Taiwan retention and complete-analysis delivery channel.
Email remains as secondary fallback.
v0 delivery should be manual or semi-manual first.
LINE webhook / LIFF / advanced automation is deferred.
Cold ad traffic should go to the product first, not directly to LINE.
```

Current tech debt observed by Codex:

```text
The app still supports generic LINE/Email capture, but the product does not yet implement the intended LINE-first CTA hierarchy or fulfillment workflow.
```

Current Module 01 flow:

```text
Landing
→ analyze
→ result
→ paid preview / fake-door unlock
→ contact capture
```

Current contact capture supports Email / LINE ID style inputs.

Target direction:

```text
User clicks 解鎖下一句怎麼回 — NT$49
→ sees internal-test / no-charge explanation
→ primary CTA: 加入 LINE 領取完整分析
→ secondary option: 使用 Email 接收
```

## Scope

Do:

1. Define exact LINE-first UI copy for paid unlock/contact capture.
2. Define primary and secondary CTA hierarchy.
3. Define interim behavior before LINE OA URL is finalized.
4. Define required configuration such as `NEXT_PUBLIC_LINE_ADD_URL`.
5. Define event tracking needed for LINE CTA clicks.
6. Define fallback Email flow.
7. Define manual/semi-manual fulfillment workflow.
8. Define implementation milestones for the app.
9. Create strategy/spec document, execution report, summary log.
10. Commit and push to `origin/staging`.

Do not:

- implement app behavior
- change contact capture UI yet
- add LINE API
- add LIFF
- add webhook
- add email sending
- change legal semantics
- change runtime/model/DB/prompt/schema
- add payment

## Required Output

Create:

```text
ai-collaboration/research/2026-05-20-line-funnel-ui-copy-implementation-plan-v0.md
```

## Required Structure

```markdown
# LINE Funnel UI Copy + Implementation Plan v0

Date: 2026-05-20

## 1. Executive Summary

## 2. Current Contact Capture Gap

## 3. Target LINE-First Funnel

## 4. Paid Unlock Copy

## 5. Contact Capture Copy

## 6. Primary LINE CTA

## 7. Secondary Email Fallback

## 8. LINE OA URL / Configuration

## 9. Event Tracking Requirements

## 10. Manual / Semi-Manual Fulfillment Workflow

## 11. Privacy / Legal Copy Alignment

## 12. Error / Edge States

## 13. Implementation Milestones

## 14. What Not To Build Yet

## 15. Open Questions

## 16. Recommended Next Step
```

## Content Requirements

### 1. Executive Summary

State:

```text
Module 01 should move from generic contact capture to LINE-first conversion after paid-intent click.
The user should first see product value, then be invited to add LINE to receive the complete analysis.
Email remains a secondary fallback.
```

### 2. Current Contact Capture Gap

Document current gap:

```text
Current app still presents generic LINE/Email contact capture.
It does not yet make LINE clearly primary.
It does not yet track LINE add CTA separately.
It does not yet connect LINE add to manual fulfillment workflow.
```

### 3. Target LINE-First Funnel

Define target flow:

```text
Result page
→ paid preview
→ click 解鎖下一句怎麼回 — NT$49
→ contact/fulfillment panel opens
→ primary CTA: 加入 LINE 領取完整分析
→ secondary link/button: 改用 Email 接收
→ user action tracked
→ manual/semi-manual fulfillment
```

### 4. Paid Unlock Copy

Propose exact copy.

Tone:

```text
warm
premium
clear
not spammy
not hard-sell
no subscription feeling
```

Suggested copy:

```text
解鎖下一句怎麼回 — NT$49
給你 3 種不失控的回法：主動推進、低壓試探、暫時拉開。
```

Internal-test support copy:

```text
目前內測中，這次不會真的收費。
```

### 5. Contact Capture Copy

Propose panel copy:

Title:

```text
加入 LINE，領取完整分析
```

Body:

```text
我們會把這次結果整理成一次完整回覆策略，透過 LINE 傳給你。
也會低頻通知新的測驗；你可以隨時封鎖或要求刪除資料。
```

Secondary line:

```text
不想使用 LINE？也可以改用 Email 接收。
```

### 6. Primary LINE CTA

Define primary CTA:

```text
加入 LINE 領取完整分析
```

Button behavior for future implementation:

```text
href = NEXT_PUBLIC_LINE_ADD_URL
target = _blank or same tab depending UX decision
event = line_add_clicked
metadata:
  module_id
  theme_slug
  result_id if available
  unlock_intent_id if available
  source = contact_capture
```

If LINE URL not configured:

```text
Show disabled/fallback copy:
LINE 連結尚未設定，請改用 Email 接收。
```

or keep current form until configured.

### 7. Secondary Email Fallback

Email should remain secondary.

Copy:

```text
改用 Email 接收
```

Email panel copy:

```text
留下 Email，我們會用這個信箱送你一次完整分析。
不寄日常電子報；未來若有新測驗通知，會先取得你的同意。
```

Clarify whether Email submit still uses existing `/api/contact`.

### 8. LINE OA URL / Configuration

Define required env:

```text
NEXT_PUBLIC_LINE_ADD_URL=
```

Optional future:

```text
LINE_CHANNEL_ID=
LINE_CHANNEL_SECRET=
LINE_MESSAGING_ACCESS_TOKEN=
```

But v0 implementation only needs add-friend URL.

Do not require LINE API for first version.

### 9. Event Tracking Requirements

Define events:

```text
paid_unlock_clicked
line_add_clicked
email_fallback_opened
email_contact_submitted
contact_submitted
```

If event taxonomy should not expand yet, map to existing events:

```text
paid_unlock_clicked
contact_submitted with contactMethod = line_click / email
```

Important privacy rule:

```text
Do not store LINE ID or Email in events.
Only store method, source, and anonymous IDs.
```

Recommended metadata:

```text
module_id
theme_slug
experiment_id
result_id
unlock_intent_id
contact_method
source
```

### 10. Manual / Semi-Manual Fulfillment Workflow

Define v0 manual workflow:

```text
1. User clicks LINE add CTA.
2. User adds LINE OA.
3. User sees welcome message.
4. User replies keyword such as 完整分析, or clicks rich menu.
5. Operator checks latest unlock/contact records manually.
6. Operator sends complete analysis manually/semi-manually.
```

If no direct LINE user mapping yet:

```text
Ask user to paste a short code from the result page.
```

Suggested code:

```text
ANYU-XXXX
```

Do not implement code generation yet unless future task scopes it.

### 11. Privacy / Legal Copy Alignment

Align with existing legal pages:

- `/privacy`
- `/terms`
- `/disclaimer`

Include:

```text
加入 LINE 後，我們會用於傳送完整分析、內測通知與新測驗提醒。
你可以隨時封鎖官方帳號或透過 hello@anyu.tw 要求刪除資料。
```

Do not claim automation that does not exist.

### 12. Error / Edge States

Define:

```text
LINE URL missing
popup blocked
user does not want LINE
Email invalid
contact API fails
unlockIntent missing
```

Friendly copy examples:

LINE URL missing:

```text
LINE 連結暫時還沒準備好，你可以先用 Email 接收。
```

Email fallback failure:

```text
目前表單暫時無法送出，請稍後再試一次。
```

### 13. Implementation Milestones

#### Milestone A: LINE-first Contact UI v0

```text
primary LINE CTA
secondary Email fallback
NEXT_PUBLIC_LINE_ADD_URL
line_add_clicked event
no LINE API
```

#### Milestone B: LINE OA Setup v0

```text
create OA
welcome message
rich menu
privacy links
manual fulfillment workflow
```

#### Milestone C: Fulfillment Code v0

```text
short code shown after unlock
user sends code in LINE
operator maps code to result/unlockIntent
```

#### Milestone D: Automation Later

```text
LIFF / webhook
automatic result lookup
LINE message delivery
```

### 14. What Not To Build Yet

Do not build:

```text
LINE Messaging API automation
LIFF
webhooks
CRM segmentation
daily push
full account system
paid membership
referral system
```

### 15. Open Questions

Include:

```text
What is the final LINE OA add-friend URL?
Should Email fallback be shown immediately or behind a small text link?
Should users send a short code in LINE for manual matching?
Should LINE CTA open in new tab or same tab on mobile?
How many manual complete-analysis deliveries per day are acceptable?
Should the v0 fake-door still allow Email-only users?
```

### 16. Recommended Next Step

Recommend one of:

```text
LINE Funnel Contact UI Implementation v0
```

or if LINE OA not ready:

```text
LINE OA Setup Checklist v0
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-line-funnel-ui-copy-implementation-plan-v0-execution-report.md
```

Report structure:

```markdown
# LINE Funnel UI Copy + Implementation Plan v0 Execution Report

## Summary

## Files Created

## Files Updated

## Strategy Translation

## UI Copy Decisions

## Event / Metrics Decisions

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
- plan path
- LINE-first UI decision
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
git commit -m "docs: plan line-first contact funnel"
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

- plan path
- primary LINE CTA recommendation
- secondary Email fallback recommendation
- env/config needed
- event tracking recommendation
- implementation milestones
- validation results
- commit hash

Then stop.
