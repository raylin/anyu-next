# Handoff: Provider-review Public Copy Implementation v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Implement provider-review-ready public copy for ANYU Module 01 so NewebPay/藍新 application reviewers can clearly understand the product, price, delivery method, refund/re-delivery policy, privacy/trust handling, support contact, and service limitations.

This task turns the approved copy direction from the provider-review copy bundle into public-facing runtime copy.

Payment must remain disabled.

Do not implement checkout.

Do not implement payment integration.

Do not enable real payment.

Do not modify NewebPay/ECPay API code.

## Background

Payment Provider Application Prep + NewebPay Evaluation v0 completed.

Provider-review Storefront + Legal Copy Pass v0 completed.

Owner decisions:

```text
Applicant type: individual
Tax / invoice posture: no unified invoice for now
Payout account: personal bank account
Payment-provider application email: owner’s personal email, not committed to repo
Public support email: hello@anyu.tw
Public business/studio/company claim: do not claim company/studio/business registration
Refund policy: accepted
  - after full analysis is generated and delivered, generally no refund
  - system failure / non-delivery / duplicate payment can be re-delivered or refunded after verification
```

Important copy constraint:

```text
Public copy must not say “company”, “studio”, “商號”, “工作室”, or imply business registration unless owner later approves.
```

Public-facing copy can say:

```text
暗語 ANYU
本服務
我們
本服務目前以個人小規模測試方式提供
```

Public-facing copy should not expose owner’s personal email, personal phone, ID, bank, address, or private application details unless explicitly approved.

## Scope

Do:

1. Inspect current Module 01 paid/unlock/public copy.
2. Inspect current legal/privacy/terms pages.
3. Add or update provider-review-ready product description on public-facing pages.
4. Add or update refund/re-delivery policy.
5. Add or update payment delivery description.
6. Add or update privacy/trust copy.
7. Add or update service limitation/disclaimer copy.
8. Add or update support/contact copy using `hello@anyu.tw`.
9. Add conservative invoice/tax posture copy if appropriate.
10. Keep payment disabled and current beta/free fulfillment behavior intact.
11. Add/update tests for public copy.
12. Create review bundle, execution report, summary log.
13. Commit and push to `origin/staging`.

Do not:

- implement checkout
- implement NewebPay API
- implement ECPay API
- create payment DB schema
- create payment webhook
- enable real payment
- add payment button that charges money
- modify production payment behavior
- expose owner personal email
- expose owner personal phone/address unless explicitly approved
- claim company/studio/business registration
- claim invoice behavior not approved
- change LINE fulfillment behavior
- change paid generation behavior
- change prompt/schema/cache/DB
- start ads

## Copy Placement Requirements

Codex should decide the cleanest repo-consistent placement, but likely areas:

```text
Module 01 paid/unlock panel:
- product/service name
- current beta note/payment disabled note
- what full analysis includes
- delivery method
- short service limitation
- short privacy/trust line

Terms page:
- digital content delivery
- refund/re-delivery policy
- service limitation/disclaimer
- support contact
- invoice/tax posture copy if appropriate

Privacy page:
- input data usage
- do-not-paste-identifiers note
- retention cleanup language
- third-party marketing non-use
- support contact
```

Do not add redundant walls of legal text to the landing page. Use concise copy on product surfaces and fuller copy in terms/privacy.

## Required Public Product Copy

Draft/implement a public copy block similar to:

```text
曖昧溫度計完整分析

一次性查看｜NT$49

付款成功後，你會取得一份完整分析連結，可於網頁或 LINE 中查看。

完整分析包含：
- 你們目前的關係溫度與訊號整理
- 3 種可能狀態
- 可直接使用的回覆句與回覆策略
- 48 小時觀察建議
- 這份分析主要參考的線索摘要
- 可回看完整結果頁

此結果是根據你提供的文字內容整理出的溝通輔助，不是心理治療、諮商、命理判斷，也不保證任何關係結果。
```

Because payment is not enabled yet, public runtime should still clarify:

```text
目前內測中，這次不會真的收費。
```

or equivalent until real payment is enabled.

If both price and beta-free note appear together, avoid confusion:

```text
正式開放後，完整分析預計為一次性查看 NT$49；目前內測期間不會真的收費。
```

## Refund / Re-delivery Policy

Implement or draft in public terms:

```text
由於完整分析屬於付款後產生的數位內容，若系統已成功產生並交付完整分析，一般情況下不提供退款。

若付款成功後系統未能成功產生完整分析、連結無法開啟，或發生重複付款，請聯絡我們。經確認後，我們會協助重新產生、補發連結或辦理退款。

客服僅需付款時間、訂單資訊或錯誤狀況說明；不需要你提供原始對話內容。
```

If payment disabled, phrase as future policy:

```text
正式付款開放後，將適用以下退款與補發原則：
...
```

Do not imply real payment is currently enabled.

## Privacy / Trust Copy

Implement or draft:

```text
你不需要留下姓名就能使用曖昧溫度計。請不要貼上姓名、電話、地址、帳號或其他能識別身份的資訊。

你提供的文字只會用於產生本次分析與必要的服務交付；不會公開展示，也不會提供給第三方作行銷用途。分析資料會依系統保留規則自動清理。
```

Avoid vague-only phrasing:

```text
我們會盡量去識別化
```

Do not promise:

```text
立即刪除
24 小時刪除
完全匿名
100% 無法識別
```

unless implemented.

## Service Limitation / Disclaimer

Implement or draft:

```text
暗語 ANYU 提供的是文字情境整理與溝通建議，不是心理治療、諮商、醫療診斷、法律建議或命理服務。分析結果不能保證對方真實想法，也不能保證任何關係結果。請把它當作一個幫助你整理線索與下一步選擇的參考。
```

Keep tone clear and not fear-inducing.

## Support / Contact Copy

Use public support email:

```text
hello@anyu.tw
```

Suggested copy:

```text
如果付款、連結或結果產生遇到問題，請來信 hello@anyu.tw，或透過官方 LINE 聯絡我們。請提供付款時間、必要的訂單資訊或錯誤狀況說明；不需要附上原始對話內容。
```

Do not commit or display owner’s personal application email.

## Invoice / Tax Posture Copy

Owner decision:

```text
Applicant type: individual
No unified invoice for now
```

Public copy should be conservative:

```text
本服務目前以個人小規模測試方式提供，暫未開立統一發票；若後續服務型態或法規要求調整，將依相關規定辦理。
```

This is product copy, not tax/legal advice.

Do not claim:

```text
永遠不開發票
免稅
不需申報
公司發票
工作室發票
```

## Applicant / Application Email Handling

Document internally:

```text
NewebPay application email may be the owner’s personal email.
Do not commit it to repo.
Public customer support email remains hello@anyu.tw.
```

Public runtime should not mention:

```text
owner personal email
personal bank account
private applicant details
identity documents
```

## Runtime Behavior Guardrails

Payment must remain disabled.

If a user reaches paid/unlock area, current behavior should remain:

```text
internal test / free beta / LINE fulfillment
```

Do not create a button that collects payment.

Do not add NewebPay form.

Do not add order creation.

Do not change unlock intent behavior except copy display if needed.

## Tests

Add/update tests for:

```text
product copy includes NT$49 as planned/future price while payment disabled
copy says internal/beta no real charge if applicable
refund/re-delivery policy appears in terms or approved location
privacy copy does not contain vague “盡量去識別化”
privacy copy does not promise unsupported deletion window
service limitation copy avoids therapy/counseling/guarantee claims
support email is hello@anyu.tw
public copy does not include owner personal email/phone/address
public copy does not claim company/studio/business registration
public copy does not imply checkout/payment is enabled
Module 01 paid/unlock flow still works
```

If tests are too brittle, keep them targeted to critical risk phrases.

## Staging QA

After deployment to staging:

```text
1. Module 01 page still loads.
2. Paid/unlock area clearly says payment is not currently charged.
3. Product/service description is visible enough for provider review if needed.
4. Terms/refund copy is accessible.
5. Privacy/trust copy is accessible.
6. Support email is hello@anyu.tw.
7. No personal applicant email is visible.
8. No checkout/payment is active.
```

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-27-provider-review-public-copy-implementation-v0-review-bundle.md
```

Required sections:

```markdown
# Provider-review Public Copy Implementation v0 Review Bundle

Date: 2026-05-27

## 1. Summary

## 2. Owner Decisions Applied

## 3. Public Product Copy

## 4. Refund / Re-delivery Copy

## 5. Privacy / Trust Copy

## 6. Service Limitation / Disclaimer Copy

## 7. Support / Contact Copy

## 8. Invoice / Tax Posture Copy

## 9. Runtime Pages Updated

## 10. Payment-disabled Verification

## 11. Tests Added

## 12. Remaining Owner Actions

## 13. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-27-provider-review-public-copy-implementation-v0-execution-report.md
```

Report structure:

```markdown
# Provider-review Public Copy Implementation v0 Execution Report

## Summary

## Files Created

## Files Updated

## Owner Decisions Applied

## Runtime Copy Changes

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
public copy implementation summary
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
git commit -m "copy: add provider review public copy"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
owner decisions applied
runtime pages updated
payment-disabled confirmation
copy changes summary
tests added
validation results
review bundle path
commit hash
staging push status
Tech Debt / Cleanup Notes
exact next step
```

Then stop.
