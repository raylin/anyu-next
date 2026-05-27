# Handoff: Payment Provider Application Prep + NewebPay Evaluation v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Prepare ANYU for payment provider application, with NewebPay/藍新 as the preferred first application target and ECPay/綠界 as a backup reference.

This task should create the application readiness checklist, identify missing storefront/legal/refund/privacy copy, and prepare a product/payment integration planning note.

This is an application-prep and documentation task.

Do not implement payment integration.

Do not create real checkout.

Do not modify production payment behavior.

Do not submit secrets or credentials.

Do not start ads.

## Background

ANYU Module 01 is now in low-key production monitoring.

Current product status:

```text
- Module 01 low-key production is active/monitor.
- Production route/API smoke passed.
- Production short-code smoke passed.
- Production LIFF smoke passed.
- Payment is not enabled.
- Ads and broader traffic are blocked.
```

Business reason:

```text
Engineering progress has been fast, but payment provider review may become a timeline bottleneck.
The user wants to start the payment application process in parallel.
```

Preferred provider to prepare first:

```text
NewebPay / 藍新
```

Backup/comparison provider:

```text
ECPay / 綠界
```

## Key External Facts To Verify

Codex should verify from official/current sources before finalizing application notes:

```text
- NewebPay application flow / account type requirements.
- NewebPay review time estimates if published by official or partner docs.
- NewebPay API / MPG documentation availability.
- ECPay application preparation requirements as comparison only.
```

Use official sources where possible.

Do not rely on outdated blog posts unless clearly marked as secondary reference.

## Scope

Do:

1. Review current ANYU public pages and legal copy.
2. Identify what a payment provider reviewer will see.
3. Prepare NewebPay application readiness checklist.
4. Prepare ECPay comparison / backup notes.
5. Draft required storefront copy for digital product sales.
6. Draft refund policy recommendation.
7. Draft privacy/trust copy requirements for payment review.
8. Draft product/service description suitable for provider review.
9. Define first payment methods recommendation.
10. Define payment integration scope for future implementation.
11. Define payment-success → paid-generation flow at high level.
12. Create review bundle, execution report, summary log.
13. Commit and push to `origin/staging`.

Do not:

- implement NewebPay API
- implement ECPay API
- create checkout page
- add payment buttons
- enable real payment
- create payment DB migrations
- change LINE fulfillment
- change paid generation
- change production behavior
- commit credentials, merchant IDs, hashes, API keys, or secrets

## Recommended First Provider Direction

Expected recommendation unless Codex finds blockers:

```text
Apply to NewebPay first.
Keep ECPay as backup.
```

Rationale to evaluate:

```text
- ANYU is a digital content/service product.
- No logistics/physical shipping needed.
- First version likely needs simple one-time payments.
- NewebPay MPG/payment API should be sufficient for first payment flow.
- ECPay remains useful as backup, especially if NewebPay review stalls or if future ecosystem needs emerge.
```

## ANYU Product Description For Review

Draft a clear description that avoids risky claims.

Suggested description:

```text
暗語 ANYU 是一個情境分析工具。使用者貼上一段互動描述後，系統會根據文字內容整理關係訊號、可能狀態與下一步回覆建議。結果是溝通輔助與情境整理，不是心理治療、命理判斷、保證預測或關係結果承諾。
```

Payment product:

```text
曖昧溫度計完整分析
一次性數位內容
建議售價：NT$49
交付方式：付款成功後於網頁/LINE 提供完整分析連結
```

Include what buyer gets:

```text
- 關係溫度與訊號整理
- 3 種可能狀態
- 3 組回覆策略與可直接使用的句子
- 48 小時觀察策略
- 分析依據線索（未來版本）
- 可回看完整結果頁
```

Avoid claims:

```text
- 保證知道對方想法
- 保證挽回
- 保證準確
- 心理治療
- 諮商
- 命理保證
- 醫療/心理診斷
```

## Storefront / Sales Page Requirements

Payment provider reviewers will likely need a public page that clearly shows:

```text
1. Service/product name.
2. What is being sold.
3. Price.
4. Delivery method.
5. Refund/failed-generation handling.
6. Customer support contact.
7. Privacy policy.
8. Terms or service disclaimers.
9. No prohibited/misleading claims.
```

Codex should inspect current pages and identify gaps.

Potential needed pages/sections:

```text
/m/ambiguous-temperature
/legal/privacy
/legal/terms
/refund or refund section inside terms
/contact/support copy
```

## Refund Policy Draft Direction

This is a digital generated content product.

Recommended policy direction:

```text
- If payment succeeds but the system fails to generate or deliver the full analysis, user may request refund or re-delivery.
- If full analysis has already been generated and accessed, refunds are generally not available except service error cases.
- Duplicate payment can be refunded after verification.
- User can contact support via email or LINE OA.
```

Draft wording should be clear, not overly harsh.

Do not finalize legal text as legal advice. Mark as product-policy draft for review.

## Privacy / Data Policy Requirements

Because users paste relationship content, privacy/trust matters.

Application-facing privacy copy should cover:

```text
- Users should not paste names, phone numbers, addresses, or identifiable data.
- Input is used to generate the requested analysis.
- Raw content is not used for public display.
- Data follows retention cleanup policy.
- Support contact for deletion/request questions.
```

Do not promise:

```text
- immediate deletion
- 24-hour deletion
- complete anonymity
```

unless implemented.

Codex should verify current retention copy and align.

## First Payment Method Recommendation

Prepare recommendation for first payment method set.

Likely v0:

```text
- Credit card first
- ATM / WebATM optional
- Supermarket code optional later
```

Reasoning:

```text
- NT$49 is small.
- Card or mobile-friendly payment is important.
- Too many payment methods add support/refund complexity.
```

Codex should verify NewebPay supported methods from official docs and recommend a minimal first set.

## Future Payment Integration Plan

Planning only. Define later implementation shape:

```text
1. User clicks unlock.
2. Create payment intent/order linked to analysis_result_id / unlock_intent_id.
3. Redirect to NewebPay checkout.
4. Receive return URL and notify/webhook.
5. Verify payment server-side.
6. Mark entitlement/payment successful.
7. Trigger paid generation or unlock existing paid result.
8. Deliver unlocked route and/or LINE message.
9. Handle failed/cancelled/duplicate payment.
10. Handle refund/re-delivery.
```

Do not implement now.

## Application Readiness Checklist

Create a checklist:

```text
Business/account info:
- applicant type
- company/individual info
- bank account
- contact email/phone
- tax/receipt/invoice implications if applicable

Website/product:
- public product URL
- product/service description
- price
- delivery method
- refund policy
- privacy policy
- terms/disclaimer
- support contact

Technical:
- production domain
- SSL
- return URL
- notify/webhook URL plan
- test environment plan
- order ID strategy
- payment verification strategy
```

## Required Research Report

Create:

```text
ai-collaboration/research/2026-05-27-payment-provider-application-prep-newebpay-v0.md
```

Required sections:

```markdown
# Payment Provider Application Prep + NewebPay Evaluation v0

Date: 2026-05-27

## 1. Summary

## 2. Provider Recommendation

## 3. NewebPay Application Notes

## 4. ECPay Backup Comparison

## 5. ANYU Product Description for Review

## 6. Storefront / Sales Page Readiness

## 7. Refund Policy Draft

## 8. Privacy / Trust Copy Requirements

## 9. First Payment Method Recommendation

## 10. Future Payment Integration Flow

## 11. Application Checklist

## 12. Missing Items / Owner Actions

## 13. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-27-payment-provider-application-prep-newebpay-v0-execution-report.md
```

Report structure:

```markdown
# Payment Provider Application Prep + NewebPay Evaluation v0 Execution Report

## Summary

## Files Created

## Files Updated

## Recommendation

## Application Readiness

## Missing Items

## Draft Copy Created

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

```text
date
task completed
provider recommendation
application readiness summary
validation result
commit hash
staging push status
```

## Validation

Docs/planning only. Run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint
cd apps/web && corepack pnpm test
cd apps/web && corepack pnpm build
```

No Playwright required unless code changes, which should not happen.

## Constraints

Do not implement:

```text
NewebPay integration
ECPay integration
checkout page
payment DB schema
payment webhook
real payment
email delivery
ads launch
rich menu
broadcast
portal/account system
Module 02
```

Do not modify:

```text
production behavior
LINE behavior
paid generation behavior
prompt/schema/cache/DB
legal copy unless explicitly marked as draft docs
```

Do not commit:

```text
.env
.env.local
merchant IDs
payment API keys
HashKey
HashIV
TradeSha
provider keys
DATABASE_URL
ANTHROPIC_API_KEY
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
real contact values unless already public/support
raw private user content
tokens/tokenized URLs/LINE IDs
paid_result_json dumps
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "docs: prepare payment provider application"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
provider recommendation
NewebPay readiness
ECPay backup notes
missing owner actions
draft copy paths
validation results
report path
commit hash
staging push status
Tech Debt / Cleanup Notes
exact next step
```

Then stop.
