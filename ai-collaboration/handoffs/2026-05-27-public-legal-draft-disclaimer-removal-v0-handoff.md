# Handoff: Public Legal Draft Disclaimer Removal v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Remove public-facing “v0 draft / not final legal version / not legal advice / should be reviewed by professionals” language from ANYU’s privacy, terms, and disclaimer pages before payment provider review.

Replace it with formal but conservative service-document copy suitable for a live low-key beta service and future payment provider review.

This is a legal-copy polish task.

Do not implement payment.

Do not enable checkout.

Do not change product behavior.

Do not claim lawyer review.

Do not overpromise privacy, refund, deletion, or invoice behavior.

## Background

Current public legal pages reportedly contain copy like:

```text
這份文件是 v0 內測階段的基礎草稿，不是最終法律版本，也不是法律意見。正式公開前，仍建議由合格專業人士審閱。
```

This is acceptable for internal docs, but not ideal for public pages before NewebPay/藍新 review.

Why it should be removed from public pages:

```text
- It makes the service look not ready for payment review.
- It suggests terms/privacy/refund boundaries are unfinished.
- It may reduce user trust.
- It conflicts with the goal of provider-review-ready storefront/legal copy.
```

Payment provider review should see public pages that are:

```text
usable
clear
conservative
consistent with the product page
free of “draft” framing
not overclaiming
```

## Scope

Do:

1. Search public runtime legal/privacy/terms/disclaimer copy for draft-language.
2. Remove public-facing phrases like:
   - v0
   - 內測草稿
   - 基礎草稿
   - 不是最終法律版本
   - 不是法律意見
   - 正式公開前建議專業人士審閱
3. Replace with formal document-introduction copy.
4. Preserve conservative limitations and update-language.
5. Verify refund/privacy/invoice/support/payment-disabled copy still appears.
6. Add/update tests for public legal copy.
7. Create review bundle, execution report, summary log.
8. Commit and push to `origin/staging`.

Do not:

- remove internal documentation notes if they are clearly internal-only
- claim legal professional review
- claim final lawyer-approved legal terms
- promise 24-hour deletion unless implemented
- promise immediate deletion unless implemented
- promise complete anonymity
- promise universal refunds
- claim company/studio/business registration
- expose owner personal email/phone/address
- enable payment
- implement checkout
- change LINE or paid generation behavior

## Replacement Copy Direction

### Privacy page intro

Replace draft disclaimer with something like:

```text
本政策說明暗語 ANYU 如何處理你在使用本服務時提供的文字內容與服務使用資訊。使用本服務前，請先閱讀並了解相關內容。
```

Optional update clause:

```text
若服務內容、付款方式或法規要求有所調整，我們可能更新本政策，並以網站公告版本為準。
```

### Terms page intro

Replace draft disclaimer with something like:

```text
本條款說明使用暗語 ANYU 服務時的基本規則、服務交付方式與雙方權利義務。使用本服務前，請先閱讀並確認你了解相關內容。
```

Optional update clause:

```text
若服務內容、付款方式或法規要求有所調整，我們可能更新本條款，並以網站公告版本為準。
```

### Disclaimer page intro

Replace draft disclaimer with something like:

```text
本聲明說明暗語 ANYU 的服務適用範圍與限制。暗語 ANYU 提供的是文字情境整理與溝通建議，不是心理治療、諮商、醫療診斷、法律建議或命理服務。
```

Optional update clause:

```text
若服務內容或法規要求有所調整，我們可能更新本聲明，並以網站公告版本為準。
```

## Refund / Digital Content Copy Check

Ensure public terms/refund copy remains clear.

Recommended copy:

```text
正式付款開放後，若完整分析已成功產生並交付，因屬依使用者提供內容產生的數位服務，原則上不提供取消或退款。

若付款成功後系統未能產生完整分析、連結無法開啟，或發生重複付款，請聯絡我們協助補發或退款。
```

Important:

```text
If payment is still disabled, frame this as future policy / formal payment after launch.
```

Payment-disabled copy should remain visible where relevant:

```text
目前內測期間不會真的收費。
```

## Invoice / Tax Copy Check

Owner decision:

```text
Applicant type: individual.
No unified invoice for now.
```

Public copy should remain conservative:

```text
本服務目前以個人小規模測試方式提供，暫未開立統一發票；若後續服務型態、營運規模或法規要求調整，將依相關規定辦理。
```

Do not claim:

```text
永遠不開發票
免稅
不需申報
公司發票
工作室發票
```

## Privacy Copy Check

Ensure privacy copy still says:

```text
- Do not paste names, phone numbers, addresses, accounts, or identifying information.
- User-provided text is used only to generate the requested analysis and necessary service delivery.
- Raw content is not publicly displayed.
- Raw content is not provided to third parties for marketing.
- Analysis data follows retention cleanup rules.
```

Avoid vague-only wording:

```text
盡量去識別化
```

Avoid unsupported promises:

```text
立即刪除
24 小時刪除
完全匿名
100% 無法識別
```

## Support Copy Check

Public support should remain:

```text
hello@anyu.tw
```

Do not expose:

```text
owner personal email
owner personal phone
private address
bank account
identity document info
```

If provider review later requires public phone/address, that should be a separate owner-approved task.

## Tests

Add/update tests for:

```text
privacy page does not contain v0/draft/legal-advice warning
terms page does not contain v0/draft/legal-advice warning
disclaimer page does not contain v0/draft/legal-advice warning
privacy intro is formal and service-ready
terms intro is formal and service-ready
disclaimer intro is formal and service-ready
payment-disabled copy remains if payment not enabled
refund/re-delivery policy remains present
privacy copy does not contain unsupported deletion promises
invoice copy does not claim company/studio/business registration
support email remains hello@anyu.tw
owner personal email/phone/address not present
no checkout/payment button introduced
```

If tests are string-based, make them targeted to critical risk phrases.

## Staging QA

After staging deployment:

```text
1. Visit /privacy.
2. Visit /terms.
3. Visit /disclaimer or equivalent page if present.
4. Confirm no public draft/legal-advice warning appears.
5. Confirm documents still feel clear and conservative.
6. Confirm refund/privacy/support/invoice copy remains accessible.
7. Confirm no payment/checkout is enabled.
8. Confirm no owner private contact info is exposed.
```

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-27-public-legal-draft-disclaimer-removal-v0-review-bundle.md
```

Required sections:

```markdown
# Public Legal Draft Disclaimer Removal v0 Review Bundle

Date: 2026-05-27

## 1. Summary

## 2. Draft Language Removed

## 3. Replacement Intro Copy

## 4. Privacy Copy Check

## 5. Refund / Delivery Copy Check

## 6. Invoice / Tax Copy Check

## 7. Support / Contact Copy Check

## 8. Payment-disabled Verification

## 9. Tests Added

## 10. Staging QA Notes

## 11. Remaining Owner Actions

## 12. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-27-public-legal-draft-disclaimer-removal-v0-execution-report.md
```

Report structure:

```markdown
# Public Legal Draft Disclaimer Removal v0 Execution Report

## Summary

## Files Created

## Files Updated

## Copy Changes

## Public Legal Readiness

## Payment-disabled Status

## Tests Added

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
legal public-copy readiness summary
payment-disabled confirmation
validation result
commit hash
staging push status
```

## Validation

Run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint
cd apps/web && corepack pnpm test
cd apps/web && corepack pnpm build
cd apps/web && corepack pnpm test:e2e:local
```

If Playwright is blocked by known Chromium/MachPort issue, record honestly.

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
LINE behavior
paid generation behavior
prompt/schema/cache/DB
payment behavior
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
owner personal email
owner personal phone
private address
raw private user content
tokens/tokenized URLs/LINE IDs
paid_result_json dumps
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "copy: formalize public legal copy"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
draft language removed
replacement copy summary
pages updated
payment-disabled confirmation
tests added
validation results
review bundle path
commit hash
staging push status
Tech Debt / Cleanup Notes
exact next step
```

Then stop.
