# Handoff: Module 01 Input Quality + Pending Paid UX Polish v0

Date: 2026-05-25

Project: anyu-next / 暗語 ANYU

## Objective

Address real tester feedback before production rollout.

This task should improve the quality floor of Module 01 analysis by encouraging richer user input, improve the pending paid-result waiting experience with clearer progress/polling, remove theme switch controls from downstream fulfillment/paid surfaces, and localize paid-result UI wording.

This is a product quality + UX polish task.

Do not change the two-tier architecture.

Do not change LINE fulfillment semantics beyond waiting/polling UI.

Do not change payment/email/ads.

Do not deploy production by default.

## Background

Recent state:

```text
- Free-only analyze is implemented.
- Deferred paid generation is implemented.
- LIFF and short-code staging flows passed.
- Dual theme A/B implementation exists.
- Theme carryover through LIFF/short-code/unlocked route exists.
- Theme switch compact swatches and visual fidelity pass are implemented.
```

Latest completed task:

```text
Module 01 Theme Carryover Bridge + Accent Direction Fix v0
Commit: 027b1eb
```

Tester feedback from the user’s wife:

```text
1. When the input text is short, complete analysis feels poor and repetitive.
2. The placeholder example may imply short input is enough.
3. The LINE/LIFF paid-result pending page feels static. Users need clearer indication that the result is still being generated.
4. Do not show theme switch everywhere. On transition/waiting/full paid content pages, the selected theme should apply but switch control should be hidden.
5. Possible-state likelihood labels show high / medium / low. These should be Traditional Chinese.
6. Paid result occasionally mixes English into Chinese, e.g.「他 genuinely 想認識你」. Avoid unnecessary English unless the user input includes it and it is contextually necessary.
```

## Scope

Do:

1. Raise / refine input quality thresholds.
2. Update the input quality indicator tiers and helper copy.
3. Replace the textarea placeholder with a longer, clearer example.
4. Add paid-result pending polling / auto-refresh behavior.
5. Add a more explicit animated waiting/progress UI for paid generation.
6. Hide theme switch on fulfillment/waiting/unlocked paid-content surfaces.
7. Preserve theme application on those surfaces even when switch is hidden.
8. Localize likelihood labels from high/medium/low to Traditional Chinese.
9. Strengthen paid generation prompt/runtime guidance to avoid unnecessary English mixing.
10. Add/update tests.
11. Run staging smoke if feasible.
12. Create review bundle, execution report, summary log.
13. Commit and push to `origin/staging`.

Do not:

- change backend generation architecture
- change LINE webhook semantics
- change LIFF bind semantics
- change paid-generation trigger timing
- change DB schema unless a tiny additive field is absolutely required
- implement payment
- implement email delivery
- start ads
- deploy production by default
- change legal semantics
- remove Theme A or Theme B
- remove theme carryover

## Part A — Input Quality Thresholds

### Problem

Short inputs can produce thin or repetitive paid results.

We need a higher quality floor without making the first step feel intimidating.

### Recommended baseline thresholds

Codex should inspect current thresholds and adjust accordingly.

Recommended starting proposal:

```text
0–39 visible chars:
  status: 太少了
  submit: disabled
  helper: 再補一點互動細節，暗語才不會只靠猜。

40–79 visible chars:
  status: 還差一點
  submit: disabled or strongly discouraged
  helper: 多寫一點對方怎麼回、多久回、最近有沒有變化。

80–139 visible chars:
  status: 可以分析
  submit: enabled
  helper: 已經可以分析；如果再補一點時間線或對方反應，結果會更穩。

140–239 visible chars:
  status: 更貼近了
  submit: enabled
  helper: 內容夠完整，能看出互動節奏與關係溫度。

240+ visible chars:
  status: 細節很夠
  submit: enabled
  helper: 很好，這樣完整分析比較能寫出具體下一步。
```

Preferred:

```text
hard minimum: 80 visible Chinese-ish characters
recommended: 140+
rich: 240+
```

If current UX would suffer from a hard 80-character minimum, Codex may choose a lower hard minimum such as 60, but must document the reason.

Use visible text length / CJK-aware length if current code already has such logic. Do not over-engineer NLP.

### Indicator behavior

Update the current indicator/dot meter to communicate quality tiers, not just binary readiness.

Suggested labels:

```text
太少了
還差一點
可以分析
更貼近了
細節很夠
```

Goal:

```text
Encourage richer input without making it feel like homework.
```

### Submit behavior

Below hard minimum:

```text
disable analyze CTA
show short helper text
```

At or above hard minimum:

```text
enable analyze CTA
keep positive guidance for richer input
```

Do not make context chips required.

## Part B — Placeholder Example

### Problem

Current placeholder is too short and may imply that a tiny description is enough.

### Requirement

Replace placeholder with a longer, concrete example that sets expectation for richer input.

Preferred placeholder:

```text
例如：我們上週末見面時聊得很自然，他也說下次可以再約。但這幾天訊息變慢，常常隔半天才回，雖然還是會看我的限動、偶爾傳生活小事。我不知道他是真的忙，還是熱度在變低。
```

Optional shorter variant if textarea feels too crowded:

```text
例如：我們上週末見面聊得很好，他說下次可以再約。但這幾天回訊變慢，常隔半天才回，卻還是會看限動、偶爾傳生活小事。我不知道他是真的忙，還是熱度在變低。
```

The placeholder should imply:

```text
relationship stage
recent interaction
change over time
specific signal
user confusion
```

Do not include names, phone numbers, addresses, or private identifiers.

## Part C — Pending Paid Generation UX / Polling

### Problem

After LINE/LIFF fulfillment, pending paid-result page feels static. Users may not realize the complete analysis is still generating.

### Requirement

When paid result is processing/missing-but-requested:

```text
show a clear waiting state
animate progress gently
poll for completion
auto-transition when completed
```

### UX copy

Suggested processing title:

```text
正在整理你的完整分析
```

Suggested body:

```text
我們正在把免費結果延伸成完整回覆策略，通常需要 30–60 秒。
```

Suggested progress steps:

```text
讀取你的互動線索
整理對方可能的狀態
產生可以直接使用的回覆句
完成 48 小時觀察策略
```

The UI should not ask users to manually refresh.

### Polling behavior

Preferred:

```text
poll a safe paid-result status endpoint every 2–4 seconds
when status becomes completed, refresh/redirect to unlocked route
when failed, show safe retry/failure state
stop polling after timeout, e.g. 90–120 seconds
```

If no status endpoint exists, add a safe one.

Status endpoint must not return:

```text
paid_result_json
raw input
provider output
tokens
LINE user ID
```

Allowed response:

```text
status: missing | processing | completed | failed | expired
retryable: boolean
safe error category
```

If adding endpoint is too much, the unlocked page can poll/refresh itself, but a status endpoint is cleaner.

### Animation

Allowed:

```text
progress bar
step indicator
dot pulse
riso stripe animation
moon stamp motion
```

Do not use misleading exact percentages unless backed by real progress.

Use “working” animation, not fake precision.

## Part D — Hide Theme Switch on Downstream Surfaces

### Problem

Theme switch appears on pages where user should not be changing style anymore; it feels intrusive.

### Requirement

Hide theme switch on:

```text
/line/fulfill
/m/[moduleSlug]/line/fulfill
paid generation waiting / processing state
unlocked paid content route
contact / fulfillment transition surfaces after theme selection
```

Keep theme applied.

Do not remove theme switch from:

```text
landing
input/result page where user can still evaluate/change visual preference
possibly free result page before fulfillment
```

User assumption:

```text
If user wanted to adjust theme, they likely did it before entering fulfillment.
```

Theme carryover must still work.

## Part E — Localize Likelihood Labels

### Problem

Paid result possible-state likelihood labels currently display:

```text
high
medium
low
```

### Required display mapping

```text
high → 高
medium → 中
low → 低
```

Optional more natural labels:

```text
high → 可能性高
medium → 可能性中
low → 可能性低
```

Recommended UI label:

```text
高 / 中 / 低
```

with surrounding copy making it clear.

Do not change schema enum if unnecessary; render-layer mapping is enough.

Tests should ensure no visible `high`, `medium`, `low` appears in paid content UI.

## Part F — Avoid Unnecessary Chinese/English Mixing

### Problem

Paid result sometimes includes mixed English like:

```text
他 genuinely 想認識你
```

Unless the user’s original text includes English and it is relevant, output should be natural Traditional Chinese.

### Required behavior

Strengthen paid generation prompt / style guidance:

```text
Use natural Traditional Chinese.
Avoid unnecessary English words or code-switching.
Do not write words like genuinely, vibe, timing, signal, maybe, check-in unless quoting or directly reflecting user-provided English.
Use Chinese equivalents.
```

Suggested replacements:

```text
genuinely → 真心地 / 真的
vibe → 氣氛 / 感覺
timing → 時機 / 節奏
signal → 訊號
maybe → 可能
check-in → 關心 / 確認
```

### Validation approach

Do not hard-reject all Latin text, because allowed terms include:

```text
LINE
ANYU
NT$49
URL/domain
module labels
user-provided English
```

Instead:

```text
prompt guidance
small semantic warning/check for common unnecessary English terms if safe
tests using mocked provider output
```

If implementing runtime check, keep it conservative and avoid false failures.

## Functional Equivalence

This task must preserve:

```text
same analyze flow
same paid generation flow
same LINE fulfillment behavior
same theme assignment/carryover semantics
same data payloads except input threshold and theme/status UI metadata
same legal/privacy meaning
```

## Tests

Add/update tests for:

```text
input below hard minimum disables analyze CTA
input at threshold enables analyze CTA
indicator labels change by tier
placeholder is longer and richer
pending paid state renders progress/waiting copy
pending paid state starts polling/status check
completed status triggers refresh/transition behavior if testable
failed status renders safe failure state
theme switch hidden on bridge/waiting/unlocked paid surfaces
theme still applied on bridge/waiting/unlocked paid surfaces
likelihood labels render in Chinese
high/medium/low do not appear visibly in paid result UI
paid prompt discourages unnecessary English mixing
common mixed-English terms are discouraged or mapped if runtime helper exists
legacy results still render
Theme A and Theme B still render
LINE/LIFF routes still pass existing tests
```

## Staging QA

Manual staging checks:

```text
1. Try short input below threshold → CTA disabled / helper explains.
2. Try richer input → CTA enabled.
3. Confirm placeholder is longer and clear.
4. Run free analyze.
5. Trigger LINE/LIFF fulfillment.
6. Confirm waiting page has animation/progress and does not ask user to refresh manually.
7. Confirm completion auto-updates or route refreshes to paid content.
8. Confirm theme switch is hidden on waiting/unlocked paid pages.
9. Confirm selected theme still carries through.
10. Confirm paid possible-state labels are Chinese.
11. Scan paid text for awkward English mixing.
```

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-25-module-01-input-quality-pending-paid-ux-polish-v0-review-bundle.md
```

Required sections:

```markdown
# Module 01 Input Quality + Pending Paid UX Polish v0 Review Bundle

Date: 2026-05-25

## 1. Summary

## 2. Tester Feedback Addressed

## 3. Input Threshold / Indicator Changes

## 4. Placeholder Update

## 5. Pending Paid Generation UX

## 6. Polling / Auto-transition Behavior

## 7. Theme Switch Visibility Changes

## 8. Likelihood Localization

## 9. Chinese-only Style Guidance

## 10. Tests Added

## 11. Staging QA Notes

## 12. Known Limitations

## 13. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-25-module-01-input-quality-pending-paid-ux-polish-v0-execution-report.md
```

Report structure:

```markdown
# Module 01 Input Quality + Pending Paid UX Polish v0 Execution Report

## Summary

## Files Created

## Files Updated

## Input Quality Changes

## Placeholder Changes

## Pending Paid UX Changes

## Polling / Status Changes

## Theme Switch Visibility

## Localization / Language Changes

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
input threshold summary
pending paid UX summary
language/localization summary
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
model switch
SSE/websocket/token streaming
Module 02
```

Do not modify:

```text
core two-tier architecture
LINE webhook semantics
LIFF bind semantics
paid generation trigger timing
DB schema unless necessary for safe status endpoint
legal semantics
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
git commit -m "feat: improve input quality and paid waiting ux"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
input threshold changes
placeholder changes
pending/polling UX changes
theme switch visibility changes
likelihood localization
language-mixing prevention
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
