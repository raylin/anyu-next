# Handoff: Provider-review Storefront + Legal Copy Pass v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Prepare provider-review-ready storefront, refund, support, privacy/trust, and service-disclaimer copy for ANYU Module 01「曖昧溫度計」so the owner can submit a NewebPay/藍新 payment application with clearer public-facing materials.

This task should turn the Payment Provider Application Prep + NewebPay Evaluation v0 plan into concrete copy drafts and a gap checklist.

This is a copy / legal-readiness / storefront-readiness task.

Do not implement payment integration.

Do not create checkout.

Do not enable real payment.

Do not modify production runtime legal pages unless explicitly approved.

Do not submit payment provider application.

Do not commit secrets or applicant private documents.

## Background

Payment Provider Application Prep + NewebPay Evaluation v0 completed.

Recommendation:

```text
- Apply to NewebPay first.
- Keep ECPay as backup.
- Current blockers are storefront/legal/refund/support copy and owner applicant/tax/invoice decisions, not payment code.
```

Current product status:

```text
- Module 01 low-key production is active/monitor.
- Production LIFF smoke passed.
- Production short-code smoke passed.
- Payment is not enabled.
- Ads and broader traffic are blocked.
```

Current product/payment concept:

```text
Product: 曖昧溫度計完整分析
Suggested price: NT$49
Type: one-time digital content/service
Delivery: web unlocked result page and/or LINE link after payment success
Not therapy, not counseling, not fortune-telling guarantee, not relationship outcome guarantee
```

Recent product evolution:

```text
- paid result now includes possible states, reply strategies, 48-hour plan, and evidenceSummary cards in schema v3
- evidenceSummary is model-generated summary cards, not raw quotes
```

## Scope

Do:

1. Inspect current public Module 01 page copy.
2. Inspect current legal/privacy/terms copy if present.
3. Draft provider-facing product/service description.
4. Draft storefront-ready product section copy.
5. Draft NT$49 full analysis content list.
6. Draft delivery method language.
7. Draft refund/re-delivery policy.
8. Draft support/contact copy.
9. Draft privacy/trust language aligned with actual retention behavior.
10. Draft service limitation / disclaimer language.
11. Identify missing owner decisions and application documents.
12. Identify which copy should later go into product page vs terms/privacy.
13. Create review bundle, execution report, summary log.
14. Commit and push to `origin/staging`.

Do not:

- implement payment code
- add payment buttons
- create checkout route
- create payment DB schema
- modify production legal pages unless explicitly asked
- submit to NewebPay
- add merchant IDs/API keys/HashKey/HashIV
- claim a retention window that is not implemented
- claim instant deletion unless implemented
- claim psychological counseling/therapy
- claim guaranteed relationship prediction
- run ads

## Owner Decisions Needed

Codex should list these clearly as owner actions.

### Applicant / business posture

Owner must decide:

```text
- Applicant type: individual / company / business registration / studio
- Bank payout account type
- Tax/invoice posture
- Customer support email or LINE OA as formal contact
- Whether public pages should list applicant/company details
```

Do not invent owner identity, tax status, business number, bank info, address, phone, or company name.

### Invoice / receipt posture

Draft copy should avoid claiming invoice behavior unless owner confirms.

Possible placeholder:

```text
發票或收據相關資訊將依實際申請主體與金流/稅務設定辦理。
```

But do not put uncertain placeholder into production copy unless approved.

## Provider-facing Product Description

Draft a concise description for payment provider review.

Recommended base:

```text
暗語 ANYU 是一個情境分析工具。使用者貼上一段互動描述後，系統會根據文字內容整理關係訊號、可能狀態與下一步回覆建議。結果是溝通輔助與情境整理，不是心理治療、命理判斷、保證預測或關係結果承諾。
```

Payment product:

```text
曖昧溫度計完整分析
一次性數位內容
建議售價：NT$49
付款成功後，使用者可於網頁或 LINE 連結查看完整分析。
```

Include deliverables:

```text
- 關係溫度與訊號整理
- 3 種可能狀態
- 回覆策略與可直接使用的句子
- 48 小時觀察策略
- 分析依據線索
- 可回看完整結果頁
```

Avoid:

```text
- 保證知道對方想法
- 保證挽回
- 保證成功
- 心理治療
- 諮商
- 命理保證
- 醫療/心理診斷
```

## Storefront Product Copy

Draft copy suitable for a public product page or product section.

Required components:

```text
1. Product name
2. Price
3. What users get
4. Delivery method
5. Refund/re-delivery handling
6. Privacy/trust note
7. Service limitation note
8. Support contact
```

Suggested structure:

```markdown
## 曖昧溫度計完整分析

一次性查看｜NT$49

付款成功後，你會取得一份完整分析連結，可於網頁或 LINE 中查看。

完整分析包含：
- 你們目前的關係溫度與訊號整理
- 3 種可能狀態
- 可直接使用的回覆句與回覆策略
- 48 小時觀察建議
- 這份分析主要參考的線索摘要

此結果是根據你提供的文字內容整理出的溝通輔助，不是心理治療、諮商、命理判斷，也不保證任何關係結果。
```

Codex may improve copy but must keep claims conservative.

## Refund / Re-delivery Policy Draft

Draft a payment-provider-review-ready refund policy.

Recommended policy:

```text
由於完整分析屬於付款後產生的數位內容，若系統已成功產生並交付完整分析，一般情況下不提供退款。

若付款成功後系統未能成功產生完整分析、連結無法開啟，或發生重複付款，請聯絡我們。經確認後，我們會協助重新產生、補發連結或辦理退款。
```

Add support channel:

```text
請透過 hello@anyu.tw 或官方 LINE 聯絡我們，並提供付款時間與可識別訂單的必要資訊。
```

Do not ask users to send private relationship content for refund support.

Clarify:

```text
客服僅需付款/訂單資訊，不需要你提供原始對話內容。
```

## Privacy / Trust Copy

Draft concise, concrete trust copy.

Must align with existing retention system.

Recommended copy:

```text
你不需要留下姓名就能使用曖昧溫度計。請不要貼上姓名、電話、地址、帳號或其他能識別身份的資訊。

你提供的文字只會用於產生本次分析與必要的服務交付；不會公開展示，也不會提供給第三方作行銷用途。分析資料會依系統保留規則自動清理。
```

If retention window is not explicitly guaranteed by implementation, do not mention exact hours/days.

Do not use vague-only wording like:

```text
我們會盡量去識別化
```

Better:

```text
請不要貼可識別身份資訊；系統僅將你提供的文字用於本次分析與服務交付，並依保留規則清理。
```

## Service Limitation / Disclaimer

Draft gentle but clear limitation text.

Suggested:

```text
暗語 ANYU 提供的是文字情境整理與溝通建議，不是心理治療、諮商、醫療診斷、法律建議或命理服務。分析結果不能保證對方真實想法，也不能保證任何關係結果。請把它當作一個幫助你整理線索與下一步選擇的參考。
```

Avoid fear-inducing legalese, but be clear enough for provider review.

## Support / Contact Copy

Draft support copy.

Current likely support email:

```text
hello@anyu.tw
```

Codex should verify from current repo if support email differs.

Recommended:

```text
如果付款、連結或結果產生遇到問題，請來信 hello@anyu.tw，或透過官方 LINE 聯絡我們。請提供付款時間、訂單資訊或錯誤畫面描述；不需要附上原始對話內容。
```

Do not include private personal phone/address unless owner explicitly provides public business info.

## Page Placement Recommendation

Codex should recommend where each copy belongs.

Possible mapping:

```text
Module 01 product page / paid teaser:
- product name
- price
- what is included
- delivery method
- short privacy note
- limitation note

Terms page:
- refund/re-delivery policy
- digital content delivery terms
- service limitation
- support contact

Privacy page:
- input data usage
- retention cleanup
- do-not-paste-identifiers note
- third-party marketing non-use
```

Do not update runtime pages in this task unless owner explicitly asks.

## Provider Application Checklist

Create owner-facing checklist:

```text
Before applying to NewebPay:
- Applicant type chosen
- Applicant/business documents ready
- Bank payout account ready
- Support email confirmed
- Public product page URL available
- Privacy page available
- Terms/refund policy available
- Product price visible
- Delivery method visible
- No risky claims on product page
- Domain SSL working
- Future return/notify URLs planned
```

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-27-provider-review-storefront-legal-copy-pass-v0-review-bundle.md
```

Required sections:

```markdown
# Provider-review Storefront + Legal Copy Pass v0 Review Bundle

Date: 2026-05-27

## 1. Summary

## 2. Current Public Page / Legal Readiness

## 3. Provider-facing Product Description

## 4. Storefront Product Copy Draft

## 5. Refund / Re-delivery Policy Draft

## 6. Privacy / Trust Copy Draft

## 7. Service Limitation / Disclaimer Draft

## 8. Support / Contact Copy Draft

## 9. Page Placement Recommendation

## 10. Owner Decisions Needed

## 11. Application Checklist

## 12. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-27-provider-review-storefront-legal-copy-pass-v0-execution-report.md
```

Report structure:

```markdown
# Provider-review Storefront + Legal Copy Pass v0 Execution Report

## Summary

## Files Created

## Files Updated

## Copy Drafts Created

## Current Gaps

## Owner Decisions Needed

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
storefront/legal readiness summary
validation result
commit hash
staging push status
```

## Validation

Docs/copy only. Run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint
cd apps/web && corepack pnpm test
cd apps/web && corepack pnpm build
```

No Playwright required unless code changes.

## Constraints

Do not implement:

```text
payment provider integration
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
runtime public pages unless explicitly requested
LINE behavior
paid generation behavior
prompt/schema/cache/DB
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
business registration documents
bank documents
identity documents
real private contact values unless already public/support
raw private user content
tokens/tokenized URLs/LINE IDs
paid_result_json dumps
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "docs: draft provider review storefront copy"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
copy drafts created
current gaps
owner decisions needed
application checklist summary
validation results
review bundle path
commit hash
staging push status
Tech Debt / Cleanup Notes
exact next step
```

Then stop.
