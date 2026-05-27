# Handoff: Legal / Provider-review Public Page QA v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Run a focused staging QA pass for public legal/provider-review pages after removing public draft disclaimers and adding provider-review copy.

This task should verify that ANYU’s public pages are suitable for NewebPay/藍新 application review while payment remains disabled.

This is a QA / documentation task.

Do not change runtime code unless a tiny QA-blocking copy issue is found.

Do not enable payment.

Do not add checkout.

Do not implement NewebPay/ECPay integration.

Do not modify owner private information.

## Background

Recent completed tasks:

```text
Provider-review Public Copy Implementation v0
Public Legal Draft Disclaimer Removal v0
```

Current intended public state:

```text
- Public legal pages no longer say v0 / draft / not final / not legal advice.
- Product/payment copy explains planned NT$49 full analysis while beta currently has no real charge.
- Refund/re-delivery policy is present.
- Privacy/trust copy is present.
- Service limitation/disclaimer copy is present.
- Invoice/tax posture is conservative.
- Payment remains disabled.
- Checkout is not implemented.
- Owner personal email/phone/address are not exposed.
- No company/studio/business registration is claimed.
```

Owner decisions currently applied:

```text
Applicant type: individual
Tax/invoice posture: currently no unified invoice
Payout account: personal account
Public support email: hello@anyu.tw
Payment application email: owner personal email, not public and not committed
Refund policy: generated/delivered digital content generally non-refundable; system failure/non-delivery/duplicate payment can be re-delivered or refunded after verification
```

## Scope

Do:

1. Verify staging deployment includes latest legal/public copy commits.
2. QA `/privacy`.
3. QA `/terms`.
4. QA `/disclaimer`.
5. QA `/legal`.
6. QA `/m/ambiguous-temperature` provider-review/payment-related visible copy.
7. Confirm payment remains disabled.
8. Confirm no checkout/provider integration is visible.
9. Confirm no owner private details are exposed.
10. Confirm no business/studio/company claims appear.
11. Record sanitized QA results.
12. Create review bundle, execution report, summary log.
13. Commit and push to `origin/staging`.

Do not:

- enable real payment
- add checkout
- add payment buttons
- add NewebPay/ECPay code
- modify production
- publish owner personal email
- publish owner personal phone
- publish private address
- claim company/studio/business registration
- change LINE behavior
- change paid generation behavior
- change prompt/schema/cache/DB

## Pages To Check

QA these staging routes:

```text
/privacy
/terms
/disclaimer
/legal
/m/ambiguous-temperature
```

If route names differ, locate current public equivalents.

## Required Checks

### 1. Draft language removed

Confirm none of these appear publicly:

```text
v0
內測草稿
基礎草稿
不是最終法律版本
不是法律意見
正式公開前建議專業人士審閱
```

Internal docs may still contain historical notes; this QA is for runtime public pages only.

### 2. Product/payment copy clarity

On Module 01 page / paid preview area, verify copy says:

```text
- formal full analysis is planned as one-time NT$49
- current beta/internal test does not actually charge
- delivery is via web or LINE link
- full analysis includes clear deliverables
```

Must not imply payment is currently enabled.

### 3. Refund / re-delivery policy

Confirm public terms or product surfaces include:

```text
- digital generated content policy
- generated and delivered full analysis generally non-refundable after formal payment launch
- system failure / non-delivery / duplicate payment can be re-delivered or refunded after verification
- support contact
```

Must not promise universal refunds.

### 4. Privacy / trust copy

Confirm privacy copy includes:

```text
- user should not paste names, phone numbers, addresses, accounts, or identifiable data
- input is used to generate requested analysis and necessary service delivery
- content is not publicly displayed
- content is not provided to third parties for marketing
- analysis data follows retention cleanup rules
```

Confirm it does not include unsupported promises:

```text
立即刪除
24 小時刪除
完全匿名
100% 無法識別
```

Confirm it avoids vague-only phrasing:

```text
盡量去識別化
```

### 5. Service limitation / disclaimer

Confirm public disclaimer/terms say the service is not:

```text
psychological therapy
counseling
medical diagnosis
legal advice
fortune-telling guarantee
relationship outcome guarantee
```

But wording should still feel readable and not fear-inducing.

### 6. Invoice / tax posture

Confirm copy is conservative:

```text
本服務目前以個人小規模測試方式提供，暫未開立統一發票；若後續服務型態、營運規模或法規要求調整，將依相關規定辦理。
```

or equivalent.

Must not claim:

```text
永遠不開發票
免稅
不需申報
公司發票
工作室發票
```

### 7. Support / contact

Confirm public support contact is:

```text
hello@anyu.tw
```

Confirm no owner personal email/phone/address is visible unless explicitly approved. It is not currently approved.

### 8. Applicant/business claims

Confirm pages do not say:

```text
公司
工作室
商號
有限公司
股份有限公司
business registration
```

unless referring generically and not claiming ANYU has such status.

### 9. Payment disabled

Confirm:

```text
- no checkout page
- no real payment button
- no NewebPay redirect
- no ECPay redirect
- no form that collects card data
- no claim that payment is currently enabled
```

### 10. Visual/readability sanity

Confirm legal/provider-review copy is readable:

```text
- not overly dense
- headings make sense
- product/refund/privacy/support information can be found
- mobile layout is usable
```

## Issue Severity

Classify findings:

```text
P0:
  payment accidentally enabled
  owner private data exposed
  checkout/provider integration visible
  legal pages still show draft/non-final warning
  dangerous privacy/refund overpromise

P1:
  provider-review required info missing
  refund/privacy/support copy unclear
  business/studio/company claim appears incorrectly

P2:
  wording/readability polish
  layout spacing issues
```

If P0 or P1 is found, recommend a follow-up fix before payment provider submission.

If only P2/no issues, recommend proceeding to NewebPay Application Submission Checklist v0.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-27-legal-provider-review-public-page-qa-v0-review-bundle.md
```

Required sections:

```markdown
# Legal / Provider-review Public Page QA v0 Review Bundle

Date: 2026-05-27

## 1. Summary

## 2. Staging Freshness

## 3. Pages Checked

## 4. Draft Language Removal

## 5. Product / Payment Copy QA

## 6. Refund / Re-delivery QA

## 7. Privacy / Trust QA

## 8. Service Limitation QA

## 9. Invoice / Tax Posture QA

## 10. Support / Contact QA

## 11. Payment-disabled Verification

## 12. Issues Found

## 13. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-27-legal-provider-review-public-page-qa-v0-execution-report.md
```

Report structure:

```markdown
# Legal / Provider-review Public Page QA v0 Execution Report

## Summary

## Files Created

## Files Updated

## QA Results

## Pages Checked

## Payment-disabled Status

## Issues Found

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
public legal/provider QA status
payment-disabled status
validation result
commit hash
staging push status
```

## Validation

If no code changes:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint
cd apps/web && corepack pnpm test
cd apps/web && corepack pnpm build
```

If code changes are made, also run:

```bash
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
production behavior unless explicitly approved
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
git commit -m "docs: record provider legal qa"
git rev-parse --short HEAD
git push origin HEAD:staging
```

If no files need changing except docs/report, still commit the QA report.

Do not push if validation failed or secrets/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
pages checked
QA status
P0/P1/P2 issues
payment-disabled confirmation
validation results
review bundle path
commit hash
staging push status
Tech Debt / Cleanup Notes
exact next step
```

Then stop.
