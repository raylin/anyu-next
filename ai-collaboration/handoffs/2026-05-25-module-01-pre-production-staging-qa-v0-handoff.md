# Handoff: Module 01 Pre-production Staging QA v0

Date: 2026-05-25

Project: anyu-next / 暗語 ANYU

## Objective

Run a final pre-production staging QA pass for Module 01 after the recent two-tier, LINE fulfillment, dual-theme, input-quality, pending-paid UX, and submit-transition changes.

This task should consolidate staging verification before making a production activation decision.

This is a QA / documentation task.

Do not deploy production.

Do not change code unless a tiny QA-blocking issue is found.

Do not change product logic, prompt/schema/cache/DB, LINE semantics, payment/email/ads, or visual direction.

## Background

Recent completed work includes:

```text
- Two-tier free-only analyze
- Deferred paid generation service
- Provider paid generation reliability fix
- LINE bind trigger + short-code delivery
- Global LIFF bridge
- LIFF URL path duplication fix
- LIFF post-bind redirect fixes
- Real staging LIFF smoke pass
- Real staging/test OA short-code smoke pass
- Module 01 dual theme A/B implementation
- Theme fidelity + carryover
- Input quality threshold + richer placeholder
- Pending paid-result polling UX
- Likelihood labels localized to Chinese
- Paid prompt guidance against unnecessary English mixing
- Analyze submit transition flicker fix
```

Latest visual QA from user:

```text
Visuals look normal.
```

Latest analyze transition fix:

```text
Commit 9fc743a:
idle → analyzing → navigating → result page
CTA shows 正在打開結果⋯ and no longer flickers back to idle before navigation.
```

## Scope

Do:

1. Verify staging freshness.
2. Run Theme A full funnel smoke.
3. Run Theme B full funnel smoke.
4. Verify input threshold behavior.
5. Verify analyze transition state.
6. Verify free result render.
7. Verify paid-result pending polling.
8. Verify LIFF fulfillment path.
9. Verify short-code fulfillment path.
10. Verify downstream theme carryover and hidden switch.
11. Verify localized likelihood labels.
12. Scan paid content for obvious unnecessary English mixing.
13. Verify share card / CTA / theme switch visual fixes remain OK.
14. Verify safe event/privacy behavior at aggregate level.
15. Record pass/fail with sanitized details only.
16. Create review bundle, execution report, summary log.
17. Commit and push to `origin/staging`.

Do not:

- deploy production
- change production LINE Console
- run production smoke
- start ads
- implement payment/email
- change prompt/schema unless a tiny blocking copy fix is needed and documented
- expose raw input, paid result JSON, tokens, LINE IDs, short codes, URLs, provider output, or secrets

## QA Checklist

### 1. Staging Freshness

Verify staging is serving latest staging commit including:

```text
9fc743a or newer
```

Record:

```text
staging URL
freshness method
candidate commit if available
```

Do not require a production deployment.

### 2. Theme A Funnel Smoke

Use Theme A / 柔和.

Flow:

```text
landing
input quality checks
analyze
loading
navigating
result
unlock intent
LIFF or short-code fulfillment if practical
unlocked paid content
```

Verify:

```text
Theme A renders correctly
theme switch works before fulfillment
theme switch hidden downstream
theme carries through fulfillment/unlocked route
```

### 3. Theme B Funnel Smoke

Use Theme B / 鮮明 / Riso.

Flow:

```text
landing
input quality checks
analyze
loading
navigating
result
unlock intent
LIFF or short-code fulfillment if practical
unlocked paid content
```

Verify:

```text
Theme B renders correctly
Riso visual remains intact
theme switch works before fulfillment
theme switch hidden downstream
theme carries through fulfillment/unlocked route
```

### 4. Input Quality

Test short input below threshold.

Expected:

```text
CTA disabled
helper encourages adding more detail
no harsh/scolding copy
```

Test valid input at or above threshold.

Expected:

```text
CTA enabled
indicator shows appropriate tier
placeholder is longer and sets expectation for richer input
```

Recommended synthetic input:

```text
我們上週末見面時聊得很自然，他也說下次可以再約。但這幾天訊息變慢，常常隔半天才回，雖然還是會看我的限動、偶爾傳生活小事。我不知道他是真的忙，還是熱度在變低。
```

### 5. Analyze Submit Transition

Expected sequence:

```text
分析我的曖昧溫度
→ 分析中
→ 正在打開結果⋯
→ 結果頁
```

Must not happen:

```text
分析中
→ idle 分析按鈕
→ 結果頁
```

### 6. Free Result

Verify:

```text
free-only analyze completes
result renders free content
paid preview remains locked/teaser
share card works
```

### 7. Pending Paid UX

From unlock/LINE route, verify when paid result is not ready:

```text
waiting page clearly says result is being prepared
progress/animation visible
polling runs safely
completion auto-refreshes or transitions to paid content
no manual refresh required
```

### 8. LIFF Path

Use real mobile staging LIFF if possible.

Verify:

```text
LIFF opens without 404
does not drop to homepage
bind succeeds
unlocked route reached
paid content renders
theme carries through
theme switch hidden downstream
```

Do not record tokenized URL, LINE ID, ID token, or raw runtime values.

### 9. Short-code Path

Use staging/test OA if possible.

Verify:

```text
short-code paste receives bot reply
returned link opens
unlocked route reached
paid content renders
theme carries through if started from known theme
theme switch hidden downstream
```

Do not record actual code or tokenized link.

### 10. Paid Content Quality

Verify:

```text
likelihood labels are 高 / 中 / 低 or similarly Chinese
no visible high / medium / low remains
paid content does not obviously contain awkward English mixing
no examples like 他 genuinely 想認識你 unless user input had English
```

### 11. Share / Visual Sanity

Verify:

```text
share card width aligns with major cards
share CTA margin/style normal
share card whitespace acceptable
Theme B background shapes appear as intended
quote/insight accent does not overlap text
theme switch compact swatches only
no visible manual / AB / theme names
```

### 12. Event / Privacy

Verify no logs/reports/docs contain:

```text
raw input
full result JSON
paid_result_json
provider output
LINE user ID
ID token
fulfillment code
unlock token
tokenized URL
email
DATABASE_URL
ANTHROPIC_API_KEY
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
```

Allowed:

```text
pass/fail
route names
theme variant labels classic/riso if needed
aggregate status
safe timing aggregates
```

## Issue Severity

Classify findings:

```text
P0: blocks analyze/LINE/unlock/pays content or exposes sensitive data
P1: production-blocking UX or visual regression
P2: polish, can defer after low-key production
```

If any P0 appears:

```text
stop and recommend fix before production decision
```

If P1 appears:

```text
document and recommend whether to fix before production
```

If only P2 appears:

```text
production activation decision may proceed
```

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-25-module-01-pre-production-staging-qa-v0-review-bundle.md
```

Required sections:

```markdown
# Module 01 Pre-production Staging QA v0 Review Bundle

Date: 2026-05-25

## 1. Summary

## 2. Staging Freshness

## 3. Theme A Funnel QA

## 4. Theme B Funnel QA

## 5. Input Quality QA

## 6. Analyze Transition QA

## 7. Free Result QA

## 8. Pending Paid UX QA

## 9. LIFF Fulfillment QA

## 10. Short-code Fulfillment QA

## 11. Paid Content Quality QA

## 12. Share / Visual QA

## 13. Event / Privacy QA

## 14. Issues Found

## 15. Production Readiness Recommendation

## 16. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-25-module-01-pre-production-staging-qa-v0-execution-report.md
```

Report structure:

```markdown
# Module 01 Pre-production Staging QA v0 Execution Report

## Summary

## Files Created

## Files Updated

## QA Results

## Theme A Result

## Theme B Result

## Fulfillment Result

## Content Quality Result

## Visual Result

## Event / Privacy Result

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
QA status
production readiness recommendation
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
production deployment
production migration
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
free analyze behavior
paid generation behavior
LINE webhook semantics
LIFF bind semantics
prompt/schema/cache/DB
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
git commit -m "docs: record module preproduction qa"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
QA status
Theme A result
Theme B result
LIFF result
short-code result
input quality result
pending paid UX result
visual result
content quality result
P0/P1/P2 issues
production readiness recommendation
validation results
review bundle path
commit hash
staging push status
Tech Debt / Cleanup Notes
exact next step
```

Then stop.
