# Handoff: LINE Funnel Contact UI Implementation v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Implement the v0 LINE-first contact funnel UI for Module 01 — 曖昧溫度計 — based on the approved LINE funnel strategy and user-provided LINE OA setup information.

This task should update the paid unlock/contact capture surface so LINE becomes the primary action, while Email remains a secondary fallback.

This task should not implement LINE Messaging API, LIFF, webhook automation, email sending, real payment, auth, or portal.

## Background

LINE Funnel Strategy v0 and LINE Funnel UI Copy + Implementation Plan v0 are complete.

User provided current LINE OA setup decisions:

```text
LINE OA 名稱：暗語 ANYU
顯示名稱：暗語 ANYU｜關係微訊號
狀態訊息：把說不清的互動，翻譯成一點方向。
LINE OA add-friend URL：https://lin.ee/S6dnbJO
QR code URL：https://qr-official.line.me/gs/M_403ttnun_GW.png?oat_content=qr
手機開啟方式：same tab
桌機開啟方式：same tab
Welcome message：A
Rich menu：v0 先不用
完整分析交付：v0 暫不交付；未來若做則自動化
短碼：v0 不做
Email fallback：保留但低調
```

Pending LINE OA backend settings, not blocking app implementation:

```text
Profile image：待回填，建議 ANYU logo / 月相 mark
背景圖：待回填，建議先不放，或 ANYU cream/gold
類別：待回填，依 LINE 後台可選項決定
```

Important product decision:

Because v0 will not actually deliver complete analysis yet, the primary CTA should not promise immediate delivery.

Use:

```text
加入 LINE，收到完整分析開放通知
```

Not:

```text
加入 LINE 領取完整分析
```

## Scope

Do:

1. Add/configure LINE-first contact capture UI.
2. Use `NEXT_PUBLIC_LINE_ADD_URL` as the primary LINE add-friend URL.
3. Default to `https://lin.ee/S6dnbJO` only if explicitly safe, or document env setup if app policy avoids hardcoded public URLs.
4. Make LINE the visually primary CTA after paid unlock.
5. Keep Email as a secondary fallback.
6. Track safe events for LINE CTA click and Email fallback open/submit if current event system supports it.
7. Keep current unlock intent and contact APIs working.
8. Do not claim complete analysis is delivered immediately.
9. Update legal/trust copy if needed to stay consistent.
10. Add/update tests.
11. Commit and push to `origin/staging`.

Do not:

- implement LINE API
- implement LIFF
- implement webhook
- implement email sending
- implement real payment
- implement short code
- implement manual delivery tooling
- change model/runtime/prompt/schema
- change DB schema unless absolutely necessary
- change legal semantics beyond copy alignment
- change design system source of truth

## Required UX Direction

### Paid Unlock Click

Current flow:

```text
User clicks 解鎖下一句怎麼回 — NT$49
→ contact capture opens
```

Target v0:

```text
User clicks 解鎖下一句怎麼回 — NT$49
→ LINE-first contact panel opens
→ primary CTA: 加入 LINE，收到完整分析開放通知
→ secondary option: 改用 Email 接收通知
```

### Main Panel Copy

Title:

```text
加入 LINE，收到完整分析開放通知
```

Body:

```text
目前內測中，這次不會真的收費。
加入後，我們會優先通知你完整分析與新測驗開放。
```

Support line:

```text
你可以隨時封鎖官方帳號，或來信 hello@anyu.tw 要求刪除資料。
```

### Primary LINE CTA

Button label:

```text
加入 LINE
```

or stronger:

```text
加入 LINE，收到開放通知
```

Recommended:

```text
加入 LINE，收到開放通知
```

Behavior:

```text
window.location.href = NEXT_PUBLIC_LINE_ADD_URL
```

Same-tab behavior is preferred for mobile and desktop per user decision.

If `NEXT_PUBLIC_LINE_ADD_URL` is missing:

```text
LINE 連結暫時還沒準備好，請先改用 Email 接收通知。
```

And show Email fallback.

### Secondary Email Fallback

Link/button label:

```text
改用 Email 接收通知
```

Email panel copy:

```text
留下 Email，我們會在完整分析開放或新測驗上線時通知你。
不寄日常電子報，也不分享給第三方。
```

Keep it visually secondary.

Do not make Email equal to LINE in visual hierarchy.

## Event Tracking

If current event taxonomy supports new events, add:

```text
line_add_clicked
email_fallback_opened
email_contact_submitted
```

If expanding event taxonomy is too broad, use existing event with safe metadata:

```text
contact_submitted with contactMethod = line_click / email
paid_unlock_clicked already exists
```

Preferred v0 event additions if low-risk:

```text
line_add_clicked
email_fallback_opened
```

Allowed event metadata:

```text
module_id
theme_slug
experiment_id
result_id
unlock_intent_id
contact_method
source
anonymous_session_id
```

Forbidden:

```text
raw input
email address
LINE ID
full result JSON
provider raw output
```

## Contact API Behavior

Do not require LINE ID input for LINE primary CTA.

For LINE primary CTA:

```text
record line_add_clicked event if possible
do not call /api/contact with a fake LINE ID
do not store LINE ID unless user provides it explicitly
```

For Email fallback:

```text
existing /api/contact can still be used
contact method should be email
```

If current ContactCapture requires one of email/lineId, adapt UI so email fallback still satisfies existing API.

Do not break current API compatibility.

## Configuration

Add to `apps/web/.env.example` if not present:

```text
NEXT_PUBLIC_LINE_ADD_URL=https://lin.ee/S6dnbJO
```

If repo policy avoids real URLs in `.env.example`, use:

```text
NEXT_PUBLIC_LINE_ADD_URL=
```

and document actual value in strategy docs.

Preferred for v0:

```text
NEXT_PUBLIC_LINE_ADD_URL=https://lin.ee/S6dnbJO
```

because it is a public add-friend URL, not a secret.

Also update `apps/web/README.md` with this env var.

## Legal / Privacy Alignment

Ensure UI copy aligns with current legal pages.

Do not claim:

```text
we will send complete analysis immediately
automatic LINE delivery
LINE API automation
payment completed
```

Allowed:

```text
內測通知
完整分析開放通知
新測驗通知
可封鎖或要求刪除
```

## Files Likely To Update

Likely files:

```text
apps/web/src/components/anyu/ContactCapture.tsx
apps/web/src/components/modules/ai-temperature/AiTemperatureResult.tsx
apps/web/src/app/api/events/route.ts
apps/web/src/lib/events/types.ts
apps/web/src/tests/event-metadata.test.ts
apps/web/src/tests/contact-validation.test.ts
apps/web/.env.example
apps/web/README.md
```

Only update files that are necessary.

## Tests

Add/update tests for:

```text
LINE add URL config helper if added
ContactCapture shows LINE primary copy
Email fallback copy is secondary
line_add_clicked event metadata excludes contact values
Email fallback still validates email
Missing LINE URL shows fallback copy
```

Avoid live LINE/API tests.

## Required Output

Create:

```text
ai-collaboration/research/2026-05-20-line-funnel-contact-ui-implementation-v0-review-bundle.md
```

Required sections:

```markdown
# LINE Funnel Contact UI Implementation v0 Review Bundle

## 1. Summary

## 2. LINE OA Inputs Used

## 3. Pending LINE OA Settings

## 4. UI Changes

## 5. Primary LINE CTA

## 6. Email Fallback

## 7. Event Tracking

## 8. Legal / Privacy Alignment

## 9. Validation Results

## 10. Remaining Follow-ups

## 11. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-line-funnel-contact-ui-implementation-v0-execution-report.md
```

Report structure:

```markdown
# LINE Funnel Contact UI Implementation v0 Execution Report

## Summary

## Files Created

## Files Updated

## LINE CTA Changes

## Email Fallback Changes

## Event Tracking Changes

## Config Changes

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
- LINE contact UI summary
- LINE URL configured
- email fallback status
- validation result
- commit hash
- staging push status

## Validation

Always run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

If possible, staging smoke:

```text
result page → paid unlock → LINE-first panel appears
LINE CTA href is https://lin.ee/S6dnbJO
Email fallback opens/submits
```

## Constraints

Do not implement:

```text
LINE Messaging API
LIFF
webhook
email sending
auth
payment
portal
share PNG / OG generation
advanced PII / NER
scheduled deletion job
model switch
```

Do not modify:

```text
product prompt/schema content
provider architecture
DB schema unless unavoidable
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
real contact values
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "feat: implement line-first contact funnel"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if:

- validation failed
- unrelated uncommitted changes exist
- secrets are staged
- raw private user content is staged
- report contains secrets or raw DB rows

If push is skipped or fails, report exact reason.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- LINE CTA implemented
- LINE URL used
- Email fallback behavior
- event tracking behavior
- pending LINE OA settings
- validation results
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
