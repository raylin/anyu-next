# Handoff: Module 01 Conversion Trust Copy Polish v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Apply a focused conversion/trust copy polish pass to Module 01 before broader production exposure.

This task should improve the free-to-paid value boundary, make privacy promises more concrete and aligned with actual retention behavior, make the paid teaser more compelling, ensure paid “possible states” includes a responsible low-investment possibility, and reduce over-sympathetic explanations for the other person.

This is a copy / prompt / render polish task.

Do not change two-tier architecture.

Do not change LINE fulfillment logic.

Do not change payment/email/ads.

Do not change DB schema unless absolutely necessary to align privacy copy with already-existing retention behavior.

Do not deploy production by default.

## Background

An external one-off review of the full experience gave useful conversion/trust feedback.

High-priority points:

```text
1. The free result may reveal too much of the core insight, making the NT$49 full analysis feel less necessary.
2. Privacy wording feels too soft if it says “盡量去識別化”; users may hesitate to paste real conversations.
3. Possible states need a more honest low-investment possibility, not only interpretations that excuse the other person.
```

Medium-priority points:

```text
4. C paid teaser card is weaker than A/B and needs a more compelling preview.
5. Default “他” / persona labels may feel too presumptive.
6. Future repurchase logic such as multi-pack can wait.
```

Low-priority points:

```text
7. Too many chips can later use progressive disclosure.
8. Waiting time perceived value can be tuned later.
9. Cold traffic may need a “what is this” explainer later.
```

Current product state:

```text
- Free-only analyze exists.
- Deferred paid generation exists.
- Pending paid UX polls and auto-refreshes.
- LIFF and short-code staging flows passed.
- Dual Theme A/B exists.
- Input minimum is 80 visible characters.
- Low-key production activation decision is GO, ads/broader traffic NO-GO.
```

This polish should happen before or alongside low-key production activation, because it affects conversion and trust.

## Scope

Do:

1. Review current free result copy / prompt / schema / display.
2. Reduce free result “complete conclusion” feeling.
3. Make free result more curiosity-preserving and open-ended.
4. Strengthen paid teaser C card.
5. Ensure possible states include a responsible low-investment / lower-priority possibility.
6. Avoid over-sympathetic framing that only explains the other person’s behavior kindly.
7. Make privacy wording more concrete and aligned with actual retention behavior.
8. Review/remove overly soft wording like “盡量去識別化” if present.
9. Consider small wording changes around persona label if it feels too invasive, but avoid a big result redesign.
10. Add/update tests.
11. Create review bundle, execution report, summary log.
12. Commit and push to `origin/staging`.

Do not:

- change two-tier generation architecture
- change free-only analyze behavior mechanics
- change paid generation trigger timing
- change LINE webhook / LIFF bind logic
- change payment/email/ads
- change DB schema unless strictly necessary
- implement multi-pack
- implement gender/pronoun selector in this task
- implement progressive chip disclosure in this task
- implement cold traffic explainer page in this task
- deploy production by default

## Part A — Free Result Value Boundary

### Problem

The free result may currently provide a complete-feeling insight, e.g. a strong conclusion like:

```text
為什麼付出越多越被視為理所當然
```

If the free result already explains the core problem fully, users may feel they already “got it” and have less reason to unlock the full analysis.

### Desired free result role

Free result should:

```text
help user feel seen
identify the rough pattern
show 2–3 signals
raise curiosity about multiple explanations
suggest a gentle next direction
```

Free result should not:

```text
deliver the deepest causal interpretation
fully explain the relationship dynamic
give all possible states
give copyable messages
give the 48-hour action plan
sound like the complete answer
```

### Copy direction

Move from definitive conclusion to open diagnostic frame.

Preferred style:

```text
這段互動裡，比較值得看的不是單一訊息，而是「他有沒有在你靠近時也往前一步」。

他現在的回應節奏，可能不是單一原因造成的。完整分析會把幾種可能拆開看，包含：他只是忙、他在保留，或他其實沒有把這段互動放在同樣優先的位置。
```

Alternative teaser:

```text
他這樣的回應節奏背後，可能有幾種不同解釋。真正關鍵是：他有沒有在你退一步時主動補上，而不是只接住你丟出去的球。
```

### Implementation

Codex should inspect where the free result insight is generated/rendered.

Possible places:

```text
product_result_prompt_free_v0.md
product_result_schema_free_v1.json
AiTemperatureResult.tsx
result display helpers
demo fixtures
tests
```

Adjust prompt/render copy so free result is less conclusive and more curiosity-preserving.

Do not make free result useless or too vague.

## Part B — Privacy Copy Specificity

### Problem

Soft privacy wording like:

```text
ANYU 會先盡量去識別化
```

feels too vague for users who paste real conversations.

### Requirement

Make privacy copy concrete and aligned with actual system behavior.

Codex must first inspect current retention/cleanup behavior and docs before changing copy.

Important:

```text
Do not promise “24 小時後自動刪除” unless the system actually does that.
Do not promise “分析完立即刪除” unless implemented.
```

### Preferred copy if exact retention window exists

If current retention policy is a concrete time window, use it:

```text
你貼上的內容只會保留在必要期間，並會在 {retention window} 後依系統規則自動清理。
```

or:

```text
分析資料會依系統保留規則自動清理；我們不會把你的原文用於公開展示或對外分享。
```

### Preferred copy if exact UI-safe window is not available

Use concrete behavioral promises without inventing a time:

```text
你不需要留下姓名或聯絡資料就能分析。
請不要貼姓名、電話、地址等能識別身份的資訊。
你貼上的內容只用於產生這次結果，不會公開展示，也不會提供給第三方行銷使用。
系統會依保留規則自動清理分析資料。
```

### Do not overpromise

Avoid:

```text
立即刪除
永久不保存
完全匿名
100% 無法識別
```

unless technically true.

### Surfaces to update

Search and update privacy copy in:

```text
input card privacy helper
analysis page helper
contact/LINE sheet privacy footer
unlock/result privacy footers
docs if user-facing copy is duplicated
```

## Part C — Possible States Honesty

### Problem

Paid possible states may all lean toward excusing the other person:

```text
工作壓力
價值觀改變
安於現狀
```

This can feel too forgiving / “鄉愿”.

### Requirement

Paid possible states should include a responsible low-investment possibility.

Add prompt guidance so one of the possible states can be:

```text
他可能沒有把這段互動放在同樣優先的位置
```

or:

```text
他對你的好感可能還在，但投入程度沒有跟上你的期待
```

or:

```text
他可能享受互動，但沒有準備投入更多
```

### Tone constraints

Do not write:

```text
他就是不在乎你
他在玩你
他根本沒心
```

Prefer:

```text
possible
watch for
low investment
priority mismatch
投入程度不對等
```

### Prompt guidance

Update paid prompt to require possible states to cover a balanced range when evidence supports it:

```text
At least one possible state should account for lower interest / lower priority / unequal investment when consistent with the input.
Do not explain every ambiguous behavior as stress, busyness, fear, or avoidant tenderness.
Do not over-protect the other person from responsibility.
```

This should not force a harsh state if the input strongly suggests mutual warmth, but it should make the model willing to include it.

## Part D — Paid Teaser C Card

### Problem

Paid preview C card / “48 小時觀察” is less compelling than A and B.

### Requirement

Make C card teaser more concrete and desirable.

Suggested copy options:

```text
看他是主動補位，還是只在你退後時才回頭。
```

or:

```text
用兩天觀察：他會不會主動補上，而不是只接住你丟出的球。
```

or:

```text
48 小時內，看他是自然靠近，還是只有在你提醒時才回應。
```

C card should preview a concrete observation strategy, not only a title.

Do not reveal the full paid plan.

## Part E — Persona Label Softening

### Problem

Labels like:

```text
MY PERSONA・付出型伴侶
```

may feel invasive or presumptive.

### Requirement

If this exact or similar label appears prominently, soften it.

Possible options:

```text
你現在比較容易卡在
想確認，又怕太用力
```

or:

```text
你現在的卡點
很想靠近，但不想把壓力丟出去
```

or remove the hard persona label while keeping the softer descriptive sentence.

Do not redesign the whole result page.

This is medium priority; if it risks too much layout churn, document as deferred.

## Part F — Language / Code-switching

This was already partially addressed in a prior task.

Re-check paid prompt and semantic guidance.

Ensure guidance includes:

```text
Use natural Traditional Chinese.
Avoid unnecessary English code-switching.
Do not use English words like genuinely, vibe, timing, maybe, check-in unless the user’s input contains English and it is contextually necessary.
```

Do not hard-fail all Latin text because allowed terms include:

```text
LINE
ANYU
NT$49
URL/domain
module labels
user-provided English
```

Add/adjust tests if appropriate.

## Tests

Add/update tests for:

```text
free result prompt discourages complete paid-level conclusion
free result teaser is open-ended / curiosity-preserving
paid prompt includes lower-priority / unequal-investment possible-state guidance
paid teaser C card includes concrete preview text
privacy copy does not contain vague "盡量去識別化" if currently present
privacy copy does not promise unsupported deletion window
likelihood labels remain Chinese
paid prompt discourages unnecessary English mixing
persona label softened or deferred with documented reason
Theme A/B still render
analyze / paid generation / LINE routes still pass existing tests
```

If tests are string-based, keep them robust enough for future copy refinement.

## Staging QA

After deploy to staging, verify:

```text
1. Free result feels useful but not complete.
2. Paid teaser has stronger C card.
3. Privacy helper is concrete and not overpromising.
4. Paid possible states include a responsible low-investment possibility when synthetic input supports it.
5. Paid content does not obviously over-explain the other person’s behavior.
6. Paid content avoids awkward English mixing.
7. Theme A/B unchanged visually except intended copy.
8. LINE/LIFF fulfillment still works.
```

Use synthetic input only.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-27-module-01-conversion-trust-copy-polish-v0-review-bundle.md
```

Required sections:

```markdown
# Module 01 Conversion Trust Copy Polish v0 Review Bundle

Date: 2026-05-27

## 1. Summary

## 2. External Feedback Addressed

## 3. Free/Paid Boundary Changes

## 4. Privacy Copy Changes

## 5. Possible States Honesty

## 6. Paid Teaser Card Changes

## 7. Persona Label Treatment

## 8. Language / Code-switching Guidance

## 9. Tests Added

## 10. Staging QA Notes

## 11. Known Limitations

## 12. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-27-module-01-conversion-trust-copy-polish-v0-execution-report.md
```

Report structure:

```markdown
# Module 01 Conversion Trust Copy Polish v0 Execution Report

## Summary

## Files Created

## Files Updated

## Free/Paid Boundary Changes

## Privacy Copy Changes

## Possible States Changes

## Paid Teaser Changes

## Persona Label Changes

## Language Guidance Changes

## Tests Added

## Validation Results

## Staging / QA Notes

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
conversion/trust polish summary
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

## Production Gate

Default:

```text
staging only
```

Do not deploy production unless explicitly approved after staging QA.

## Constraints

Do not implement:

```text
payment provider integration
ads launch
real payment
email delivery
rich menu
broadcast
portal/account system
durable queue
model switch
SSE/websocket/token streaming
Module 02
gender/pronoun selector
multi-pack
progressive chip disclosure
cold traffic explainer page
```

Do not modify:

```text
two-tier architecture
free analyze mechanics
paid generation trigger timing
LINE webhook semantics
LIFF bind semantics
DB schema unless absolutely necessary
legal semantics beyond user-facing privacy copy aligned with actual behavior
production behavior
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
ANTHROPIC_API_KEY
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
LINE_LOGIN_CHANNEL_SECRET
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
real contact values
raw private user content
font files
screenshots / test artifacts / videos / traces unless explicitly intended and safe
raw sourced JSONL
private batch generated outputs
codes/tokens/tokenized URLs/LINE user IDs
full raw provider output
paid_result_json dumps
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "copy: refine module conversion trust"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
free/paid boundary changes
privacy copy changes
possible states honesty changes
paid teaser C card changes
persona label decision
language-mixing guidance
tests added
validation results
staging/QA notes
review bundle path
commit hash
staging push status
Tech Debt / Cleanup Notes
exact next step
```

Then stop.
