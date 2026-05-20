# Handoff: Legal Baseline Content Draft v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Create first-draft legal/trust content for 暗語 ANYU / Module 01 before implementing legal pages.

This is a content drafting and review task only.

Do not implement routes yet.

Do not add footer links yet.

Do not change app behavior.

The goal is to produce reviewable drafts for:

1. Privacy Policy
2. Terms of Service / 使用規則
3. Disclaimer / 免責聲明
4. UI short notices
5. LINE funnel disclosure
6. Persona / insight graph consent wording

These drafts should reflect the current actual product behavior and planned v0 launch direction.

## Background

Module 01 — 曖昧溫度計 — is approaching launch-candidate status.

Current product flow:

```text
User visits /m/ambiguous-temperature
→ inputs relationship / ambiguous interaction text
→ AI analyzes relationship temperature
→ result page
→ paid-preview fake-door for 下一句怎麼回
→ contact capture
```

Current v0 status:

```text
No required auth
No real payment yet
Fake-door / internal-test unlock
Contact capture currently supports email / LINE ID style inputs
Future preference is LINE funnel first, email secondary
No production LINE Messaging API implementation yet
No production payment yet
No Personal Insight Graph yet
```

Important strategic direction:

```text
LINE funnel should become primary for v0 conversion / retention in Taiwan.
Email can remain a secondary option.
User prefers one-person-company / side-project friendly fixed-cost operations.
```

Privacy / risk context:

- Users may paste relationship conversations.
- Inputs may contain names, phone numbers, LINE IDs, emails, addresses, or private emotional details.
- The product provides behavioral suggestions like “下一句怎麼回”.
- The product is positioned as fun / insight-oriented, not professional counseling.
- Future product vision may include Personal Insight Graph / persona learning, but v0 should be conservative.

## Scope

Draft legal/trust content only.

Do:

- create legal markdown drafts under `docs/legal/`
- create review bundle under `ai-collaboration/research/`
- update summary log
- create execution report
- commit and push to `origin/staging`

Do not:

- implement Next.js legal routes
- add footer links
- wire LINE API
- change contact capture
- change privacy logic
- change DB schema
- change app behavior
- claim legal finality

## Important Disclaimer

These drafts are not legal advice and should be reviewed by a qualified professional before broad public launch.

The drafts should be practical and user-facing, not overly legalistic.

Use Traditional Chinese as the primary language.

Keep tone:

```text
clear
warm
transparent
not scary
not overpromising
```

Avoid:

```text
absolute privacy guarantees
legalese-heavy walls of text
fake claims about deletion/automation that are not implemented yet
```

## Files To Create

Create:

```text
docs/legal/privacy-policy-v0.md
docs/legal/terms-of-service-v0.md
docs/legal/disclaimer-v0.md
docs/legal/ui-notices-v0.md
docs/legal/line-funnel-disclosure-v0.md
docs/legal/persona-insight-consent-v0.md
```

Create review bundle:

```text
ai-collaboration/research/2026-05-20-legal-baseline-content-review-v0.md
```

Create execution report:

```text
ai-collaboration/reports/2026-05-20-legal-baseline-content-draft-v0-execution-report.md
```

Append summary log:

```text
ai-collaboration/summaries/summary_log.md
```

## Privacy Policy Draft Requirements

File:

```text
docs/legal/privacy-policy-v0.md
```

Must include:

```markdown
# 暗語 ANYU 隱私權政策 v0

## 1. 我們是誰

## 2. 我們會收集哪些資料

## 3. 我們為什麼使用這些資料

## 4. 我們如何處理你貼上的文字

## 5. 分析結果與事件紀錄

## 6. LINE / Email 聯絡資料

## 7. 第三方服務

## 8. 資料保存期間

## 9. Persona / Insight Graph 的未來使用

## 10. 你的選擇與刪除要求

## 11. 未成年人

## 12. 政策更新

## 13. 聯絡我們
```

### Privacy content guidance

#### 1. We collect

Mention current/planned categories:

```text
- 使用者輸入的文字內容
- 系統產生的分析結果
- 匿名 session / device-like identifier
- 操作事件，例如 page_view、analysis_completed、paid_unlock_clicked、contact_submitted
- 聯絡資料，例如 LINE ID / LINE official account interaction / Email
- 技術資訊，例如 browser / timestamp / IP-derived rate-limit information if used
```

Do not overclaim exact data if uncertain. Use “可能”.

#### 2. Raw input handling

Draft conservative wording:

```text
你貼上的原始文字只用於產生當次分析、改善系統安全與除錯。
我們會盡量避免在事件紀錄中保存原始文字。
原始文字可能會經過去識別化處理，例如移除 email、電話、帳號、連結等資訊。
```

If current implementation stores `raw_input_redacted`, say:

```text
我們可能保存去識別化後的輸入內容，用於短期除錯、結果重載與品質改善。
```

Do not say “we never store any text” if the DB stores redacted input.

#### 3. Retention

Use cautious wording:

```text
v0 內測期間，我們會盡量將原始或可識別內容保存時間降到最低。
我們的目標是讓原始輸入或去識別化輸入在分析後 24 小時內刪除或進一步去識別化。
在自動刪除機制完成前，我們可能以人工或批次方式清理。
```

Do not overclaim that scheduled cleanup already exists if not implemented.

#### 4. Model/provider

Mention:

```text
我們會使用第三方 AI 服務供應商處理輸入內容，例如 Anthropic Claude，未來也可能使用其他模型供應商。
```

Avoid listing unimplemented providers as active unless phrased as future.

#### 5. LINE

Mention future/likely behavior:

```text
如果你加入我們的 LINE 官方帳號或透過 LINE 留下聯絡方式，我們可能使用 LINE 提供完整分析、內測通知、新測驗通知與客服回覆。
你可以隨時封鎖官方帳號或要求刪除資料。
```

#### 6. Persona / insight graph

Important conservative wording:

```text
v0 階段，我們不會在未取得你明確同意的情況下，將你的多次分析結果建立成長期個人化檔案。
未來若推出 Personal Insight Graph 或類似個人化功能，會在使用前提供明確說明與選擇。
```

## Terms Draft Requirements

File:

```text
docs/legal/terms-of-service-v0.md
```

Must include:

```markdown
# 暗語 ANYU 使用條款 v0

## 1. 服務內容

## 2. 使用者責任

## 3. 禁止使用方式

## 4. AI 生成內容的限制

## 5. 內測與付費功能

## 6. 服務可用性

## 7. 智慧財產權

## 8. 帳號與聯絡資料

## 9. 終止或限制使用

## 10. 條款更新

## 11. 聯絡我們
```

### Terms content guidance

Include prohibited uses:

```text
- 騷擾、威脅、跟蹤、操控或傷害他人
- 輸入他人的高度敏感個資
- 用於違法、詐騙、仇恨、暴力或惡意目的
- 嘗試繞過系統限制、prompt injection、取得系統提示或大量自動化請求
- 攻擊、干擾或造成服務成本異常增加
```

Mention:

```text
我們可以限制、暫停或拒絕異常使用。
```

## Disclaimer Draft Requirements

File:

```text
docs/legal/disclaimer-v0.md
```

Must include:

```markdown
# 暗語 ANYU 免責聲明 v0

## 1. 不是專業建議

## 2. AI 分析可能不完整或不準確

## 3. 不應作為重大決策唯一依據

## 4. 關係安全與危機情境

## 5. 使用者自行判斷與承擔

## 6. 付費/內測內容限制
```

### Disclaimer wording

Must include something close to:

```text
ANYU 的分析僅供自我理解、娛樂與關係觀察參考，不構成心理諮商、醫療、法律或其他專業建議。分析結果由 AI 根據你提供的文字生成，可能不完整或不準確，不應作為重大關係決策、風險判斷或安全判斷的唯一依據。
```

Include crisis wording:

```text
如果你正在面臨暴力、騷擾、自傷、他傷、重大心理壓力或人身安全風險，請立即尋求可信任的人、專業機構或當地緊急協助。ANYU 不提供危機處理服務。
```

## UI Short Notices Draft Requirements

File:

```text
docs/legal/ui-notices-v0.md
```

Include short copy blocks for placement in app.

Required sections:

```markdown
# 暗語 ANYU UI Short Notices v0

## 1. Input Helper

## 2. CTA Consent Note

## 3. Result Page Disclaimer

## 4. Paid Unlock / Internal Test Note

## 5. Contact Capture Note

## 6. LINE Add Friend Note

## 7. Footer Links
```

Suggested short notices:

### Input helper

```text
請不要貼姓名、電話、地址或其他能識別身份的資訊。分析僅供關係觀察與自我理解參考。
```

### CTA consent

```text
送出後，我們會依隱私權政策處理你提供的文字；系統會盡量先做去識別化。
```

### Result disclaimer

```text
這不是判決，也不是心理諮商；它只是幫你多看一眼互動裡的訊號。
```

### Paid fake-door note

```text
目前內測中，這次不會真的收費。
```

### Contact note

```text
留下 LINE 或 Email 後，我們只會用於傳送完整分析、內測通知與新測驗提醒。
```

### Footer links

```text
隱私權政策｜使用條款｜免責聲明
```

## LINE Funnel Disclosure Requirements

File:

```text
docs/legal/line-funnel-disclosure-v0.md
```

Must include:

```markdown
# LINE Funnel Disclosure v0

## 1. 為什麼使用 LINE

## 2. 加入 LINE 後我們可能取得什麼

## 3. 我們會怎麼使用 LINE

## 4. 我們不會怎麼使用 LINE

## 5. Email 作為備用選項

## 6. 取消與刪除
```

Content guidance:

```text
LINE 是主要的內測通知與完整分析交付管道。
Email 是備用選項。
我們不會高頻推播。
我們不會把 LINE 資料出售給第三方。
使用者可封鎖 LINE 官方帳號或要求刪除資料。
```

Do not claim LINE API is already implemented if it is not.

Phrase as planned/when available.

## Persona / Insight Consent Requirements

File:

```text
docs/legal/persona-insight-consent-v0.md
```

Must include:

```markdown
# Persona / Insight Consent v0

## 1. 未來可能的個人化洞察

## 2. v0 階段預設

## 3. 明確同意才保存長期洞察

## 4. 使用者可以刪除或停止

## 5. 建議 UI 文案
```

Suggested consent copy:

```text
我同意 ANYU 將我的分析結果去識別化後，用於建立未來的個人化洞察，讓後續測驗更貼近我的互動模式。
```

Suggested non-consent default:

```text
不同意也可以使用本次分析；我們不會因此影響你的結果。
```

## Review Bundle Requirements

Create:

```text
ai-collaboration/research/2026-05-20-legal-baseline-content-review-v0.md
```

Required sections:

```markdown
# Legal Baseline Content Review v0

## 1. Summary

## 2. Files Created

## 3. Privacy Policy Summary

## 4. Terms Summary

## 5. Disclaimer Summary

## 6. LINE Funnel Disclosure Summary

## 7. Persona / Insight Consent Summary

## 8. UI Notices Summary

## 9. Open Questions For User Review

## 10. Implementation Readiness

## 11. Recommended Next Step
```

Open questions should include:

```text
- Should original/redacted input retention be described as 24h goal or fixed promise?
- Should LINE be primary channel wording now, or staged as future?
- Should persona/insight consent be opt-in only at v0?
- Should fake-door paid wording say no real charge everywhere?
- What contact email or form should be listed for deletion requests?
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-legal-baseline-content-draft-v0-execution-report.md
```

Report structure:

```markdown
# Legal Baseline Content Draft v0 Execution Report

## Summary

## Files Created

## Files Updated

## Privacy Draft

## Terms Draft

## Disclaimer Draft

## UI Notices Draft

## LINE Disclosure Draft

## Persona Consent Draft

## Validation Results

## Known Limitations

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
- legal draft files
- review bundle path
- validation result
- commit hash
- staging push status

## Validation

Always run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

This task should not change app code, but validation should still pass.

## Constraints

Do not implement:

```text
legal routes
footer links
LINE API
email sending
payment
auth
portal
new runtime behavior
```

Do not modify:

```text
product prompt/schema content
DB schema
provider architecture
legacy prototype behavior
Dcard scripts
design system v1.1
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
git commit -m "docs: draft legal baseline content"
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

- legal draft files created
- privacy/terms/disclaimer summary
- LINE disclosure summary
- persona consent summary
- open questions for review
- validation results
- commit hash
- staging push status
- exact next step

Then stop.
