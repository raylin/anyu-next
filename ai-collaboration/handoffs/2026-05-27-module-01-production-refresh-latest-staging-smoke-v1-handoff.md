# Handoff: Module 01 Production Refresh to Latest Staging + Operator Smoke v1

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Refresh production to the latest approved staging commit after the recent conversion/trust polish, unlocked paid-link pending-state fix, operator test mode, and funnel metrics report work. Then run a narrow production route/API smoke and operator-owned LINE/LIFF + short-code smoke.

This task updates production.

The user has approved low-key production activation, but ads/broader traffic remain blocked.

Do not start ads.

Do not launch broadly.

Do not enable real payment.

Do not implement email delivery.

Do not implement rich menu, broadcast, portal, or Module 02.

## Background

Earlier low-key production activation deployed:

```text
candidate commit: 7c891c9
deployment: dpl_9bsMSd6rQba3Fgbd1croUFid9AJD
alias: https://anyu.tw
```

That route/API smoke passed, but production operator LIFF and short-code smokes were still pending.

Since then, several staging commits were completed:

```text
d1ac8e9 — Module 01 Conversion Trust Copy Polish v0
5bbbff0 — Unlocked Paid Link Pending State Flicker Fix v0
64e9765 — Module 01 Operator Test Mode v0
092ba20 — Module 01 Funnel Metrics Report v0
```

Important updates to include in production:

```text
- free result copy preserves paid-result curiosity
- privacy copy is more concrete
- paid prompt includes lower-priority / unequal-investment possibility
- 48-hour paid teaser strengthened
- share label softened to「你現在的卡點」
- fulfilled paid links go directly to pending poller instead of flickering「取得完整連結」
- operatorTest metadata exists for future QA filtering
- module01:metrics CLI exists for future monitoring
```

## Current Recommended Production Candidate

Deploy latest approved staging commit.

Minimum candidate must include:

```text
5bbbff0 or newer
```

Prefer candidate includes:

```text
092ba20 or newer
```

If there are newer commits on `origin/staging`, Codex should inspect them and confirm they are approved/expected before deploying.

If uncertain, stop and ask.

## User Intervention Points

The user should intervene only at these moments.

### 1. LINE Console confirmation

Ask the user to confirm:

```text
Console:
endpoint yes/no
webhook URL yes/no
webhook enabled yes/no
webhook verify pass/fail
linked bot production yes/no
```

Expected:

```text
Production LIFF endpoint:
https://anyu.tw/line/fulfill

Production webhook URL:
https://anyu.tw/api/line/webhook

Webhook enabled:
On

Webhook verify:
Pass

LIFF linked bot:
production OA
```

### 2. Production mobile LIFF operator smoke

Ask the user to run with synthetic input only.

User reply format:

```text
Production LIFF: pass/fail
paid content completed: yes/no
theme carried through: yes/no
404/homepage/processing stuck/error: yes/no
```

Do not ask user to paste tokenized URLs, codes, LINE user IDs, paid content, raw messages, or screenshots with private values.

### 3. Production short-code operator smoke

User reply format:

```text
Production short-code: pass/fail
bot replied: yes/no
link opened: yes/no
paid content completed: yes/no
theme carried through: yes/no
error: yes/no
```

Do not ask user to paste short code, tokenized URL, LINE user ID, or raw message.

## Scope

Do:

1. Confirm latest approved staging commit to deploy.
2. Verify candidate includes latest required commits/features.
3. Run local validation.
4. Confirm production DB migrations 0001–0005 are present.
5. Confirm required production env presence without printing secrets.
6. Deploy latest approved staging commit to production.
7. Alias deployment to https://anyu.tw.
8. Verify route/API smoke.
9. Verify Module 01 production landing.
10. Verify Theme A/B render.
11. Verify 80-character input threshold.
12. Run synthetic production analyze.
13. Verify result route.
14. Verify unlock intent.
15. Verify LIFF URL shape.
16. Verify pending paid status endpoint / polling route.
17. Verify unlocked paid route.
18. Verify unlocked pending flicker is fixed route-level if possible.
19. Verify conversion/trust polish markers.
20. Ask user for real production LIFF smoke.
21. Ask user for real production short-code smoke.
22. Verify event/privacy safety.
23. Record activation result.
24. Create review bundle, execution report, summary log.
25. Commit and push to `origin/staging`.

Do not:

- start ads
- broad launch
- enable real payment
- change payment/email behavior
- implement durable queue
- implement new feature work
- change prompt/schema/cache/DB in this task
- change LINE fulfillment code unless a tiny smoke-blocking bug fix is explicitly necessary
- record raw private data

## Production Env / DB Checks

Verify production DB has required migrations/objects:

```text
0001 initial
0002 analyze_request_state
0003 line_fulfillment
0004 line_webhook_hardening
0005 two_tier_phase_1
analysis_paid_results
analysis_requests.user_context_json
line_webhook_events
line_webhook_rate_limits
unlock_intents fulfillment fields
```

Verify env presence only; do not print values:

```text
DATABASE_URL
ANTHROPIC_API_KEY or provider key
ANALYSIS_CACHE_HASH_SECRET
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
NEXT_PUBLIC_LINE_LIFF_ID
NEXT_PUBLIC_LINE_LIFF_URL
NEXT_PUBLIC_LINE_ADD_URL
RETENTION_CLEANUP_SECRET or CRON_SECRET if relevant
```

Expected production public values:

```text
LIFF ID: 2009959232-LhxoYMDV
OA add URL: https://lin.ee/oX0rbiTf
```

If OPERATOR_TEST_SECRET is configured, verify presence only and do not print it. If not configured, operator mode should remain disabled.

## Synthetic Input

Use synthetic-only input:

```text
我們上週末見面時聊得很自然，他也說下次可以再約。但這幾天訊息變慢，常常隔半天才回，雖然還是會看我的限動、偶爾傳生活小事。我不知道他是真的忙，還是熱度在變低。
```

Context:

```text
relationshipStage: 曖昧中
userGoal: 我該怎麼回
primaryPain: 回覆變慢
replyTone: 有界線但不冷
```

Do not use real private content.

## Smoke Checklist

### A. Route and visual basics

Verify:

```text
https://anyu.tw/m/ambiguous-temperature loads
Theme A renders
Theme B renders
compact theme switch appears where expected
theme switch hidden downstream
input below 80 chars disables CTA
valid input enables CTA
```

### B. Free analyze

Verify:

```text
analyze HTTP 200
free result renders
transition sequence does not flicker back to idle
result page HTTP 200
```

Expected sequence:

```text
分析我的曖昧溫度
→ 分析中
→ 正在打開結果⋯
→ 結果頁
```

### C. Unlock / LIFF URL

Verify:

```text
unlock intent succeeds
LIFF URL shape is https://liff.line.me/{LIFF_ID}?<context>
no /line/fulfill or /m/ after LIFF_ID
theme hint present if safely inspectable
```

Do not record tokenized URL.

### D. Deferred paid generation

Verify:

```text
paid generation requested/completed
paid status endpoint safe
pending paid UX can poll
unlocked paid route renders
provider source preferably provider
fallback not dominant
```

### E. Unlocked paid-link pending flicker fix

Verify route/state behavior:

```text
fulfilled or claimed pending unlocked link maps to pending/claimed_missing state
page shows 正在整理你的完整分析
page does not briefly show 取得完整連結
status endpoint returns pending for claimed fulfillment links with no paid row
```

Automated route/API check is enough unless user can observe manually.

### F. Content trust polish

Verify visible UI:

```text
privacy copy is concrete and avoids vague「盡量去識別化」
free result does not reveal too much paid-level conclusion
paid teaser C card stronger
possible state labels are 高 / 中 / 低
possible states include lower-priority / unequal-investment possibility when appropriate
no obvious genuinely/vibe/timing English mixing
share label says「你現在的卡點」or similarly softened
```

Do not record paid content verbatim.

### G. Operator LIFF smoke

Ask user to run operator-owned mobile production LIFF smoke.

Record only sanitized pass/fail.

### H. Operator short-code smoke

Ask user to run operator-owned production OA short-code smoke.

Record only sanitized pass/fail.

### I. Privacy

Ensure reports/logs/docs do not contain:

```text
raw input
redacted input text
full result JSON
paid_result_json
provider output
LINE user ID
LINE display name
ID token
LINE message text
fulfillment code
short code
unlock token
tokenized URL
email
DATABASE_URL
ANTHROPIC_API_KEY
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
OPERATOR_TEST_SECRET
```

Allowed:

```text
pass/fail
route names
status names
theme labels classic/riso if needed
safe timing aggregates
source provider/fallback as aggregate
error category
```

## Activation Result

Classify final result:

```text
PASS:
  production refreshed to latest approved staging
  route/API smoke passed
  operator LIFF smoke passed
  operator short-code smoke passed
  event/privacy safe

PARTIAL:
  route/API smoke passed but one or both operator smokes pending

FAIL:
  production route/API or operator critical flow fails
```

## Rollback Conditions

Recommend rollback if:

```text
production analyze fails
result route fails
unlock intent fails
LIFF URL malformed
production LIFF smoke fails with 404/homepage drop
short-code bot does not reply
paid generation repeatedly fails
unlocked paid route fails
unlocked pending link flicker returns
theme carryover breaks badly
sensitive values appear in reports/logs
```

Rollback options:

```text
revert Vercel deployment to previous stable
temporarily disable LINE full-analysis CTA
force Theme A if Theme B breaks
use LIFF-only if short-code breaks
use short-code-only if LIFF breaks
```

## Metrics After Smoke

If production operator smokes pass, recommended next task:

```text
Module 01 Low-key Production Monitoring v0
```

Use the CLI added by Module 01 Funnel Metrics Report v0:

```bash
cd apps/web
corepack pnpm module01:metrics --last 24h
```

Only run metrics after confirming intended DATABASE_URL target.

Operator traffic should be excluded by default.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-27-module-01-production-refresh-latest-staging-smoke-v1-review-bundle.md
```

Required sections:

```markdown
# Module 01 Production Refresh to Latest Staging + Smoke v1 Review Bundle

Date: 2026-05-27

## 1. Summary

## 2. Production Candidate

## 3. Env / DB / Console Checks

## 4. Route / Visual Smoke

## 5. Free Analyze Smoke

## 6. Unlock / LIFF URL Smoke

## 7. Deferred Paid Generation Smoke

## 8. Unlocked Pending Flicker Fix Verification

## 9. Content Trust Polish Verification

## 10. Production LIFF Operator Smoke

## 11. Production Short-code Operator Smoke

## 12. Event / Privacy Verification

## 13. Activation Result

## 14. Issues / Rollback

## 15. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-27-module-01-production-refresh-latest-staging-smoke-v1-execution-report.md
```

Report structure:

```markdown
# Module 01 Production Refresh to Latest Staging + Smoke v1 Execution Report

## Summary

## Files Created

## Files Updated

## Production Deployment Status

## Production Smoke Results

## Content Trust Polish Status

## Unlocked Pending Flicker Status

## LIFF Result

## Short-code Result

## Paid Generation Result

## Theme Result

## Event / Privacy Result

## Activation Result

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
candidate commit/deployment
production refresh status
operator smoke status
activation result
validation result
commit hash
staging push status
```

## Validation

Always run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint
cd apps/web && corepack pnpm test
cd apps/web && corepack pnpm build
```

If code changes are made:

```bash
cd apps/web && corepack pnpm test:e2e:local
```

If Playwright is blocked by known Chromium/MachPort issue, record honestly.

## Constraints

Do not implement:

```text
ads launch
payment provider integration
real payment
email delivery
rich menu
broadcast
portal/account system
durable queue
model switch
SSE/websocket/token streaming
Module 02
```

Do not modify:

```text
app behavior unless tiny smoke-blocking bug fix is explicitly necessary
prompt/schema/cache/DB
LINE fulfillment logic
legal semantics
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
OPERATOR_TEST_SECRET
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
git commit -m "ops: refresh module production smoke"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
production refresh status
candidate commit/deployment
DB/env/console checks
free analyze result
LIFF result
short-code result
paid generation result
unlocked pending flicker result
content trust polish status
theme carryover result
event/privacy result
activation result
validation results
review bundle path
commit hash
staging push status
Tech Debt / Cleanup Notes
exact next step
```

Then stop.
