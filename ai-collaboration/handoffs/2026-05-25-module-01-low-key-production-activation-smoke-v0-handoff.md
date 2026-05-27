# Handoff: Module 01 Low-key Production Activation + Smoke v0

Date: 2026-05-25

Project: anyu-next / 暗語 ANYU

## Objective

Activate the latest Module 01 production build for low-key, low-volume beta usage only, then run a narrow production smoke covering free analyze, dual theme, LINE/LIFF fulfillment, short-code fulfillment, deferred paid generation, unlocked paid content, and event/privacy safety.

This task is production-changing.

The user has approved low-key production activation.

Do not start ads.

Do not launch broadly.

Do not enable real payment.

Do not implement email delivery.

Do not implement rich menu, broadcast, portal, or Module 02.

## Background

Production activation decision record completed.

Decision:

```text
Low-key production activation: GO
Ads / broader traffic: NO-GO
```

Decision commit:

```text
7c891c9
```

Latest relevant readiness facts:

```text
- Pre-production staging QA found no P0/P1 issues.
- Real mobile staging LIFF smoke passed.
- Real staging/test OA short-code smoke passed.
- Free-only analyze is implemented.
- Deferred paid generation is implemented.
- Pending paid-result UX polls and refreshes on completion.
- Theme A/B is implemented.
- Theme carryover works through LIFF/short-code/unlocked routes on staging.
- Input minimum is 80 visible characters.
- Analyze submit flicker is fixed.
- Likelihood labels are localized to Chinese.
```

Accepted risk:

```text
Webhook post-response paid generation uses Next after, not a durable queue.
This is acceptable for low-volume beta only.
Ads/broader traffic remain blocked until durable delivery/monitoring improves.
```

## Scope

Do:

1. Confirm latest approved staging commit for production deployment.
2. Confirm production DB migrations 0001–0005 are present.
3. Confirm production environment variables exist without printing secrets.
4. Confirm/update production LINE Console requirements if operator has already set them.
5. Deploy/promote latest approved staging-tested app code to production.
6. Alias deployment to https://anyu.tw.
7. Verify production route health.
8. Verify Module 01 landing loads.
9. Verify Theme A and Theme B render in production.
10. Verify input quality threshold.
11. Run synthetic production free analyze.
12. Verify analyze transition and result route.
13. Verify production unlock intent.
14. Verify production LIFF URL shape.
15. Run real production LIFF smoke with operator-owned LINE account if feasible.
16. Run real production OA short-code smoke with operator-owned LINE account if feasible.
17. Verify deferred paid generation completes.
18. Verify unlocked paid content renders.
19. Verify theme carryover through production LIFF/short-code.
20. Verify pending paid UX / polling behavior.
21. Verify event/privacy metadata safety.
22. Record all results with sanitized pass/fail only.
23. Create review bundle, execution report, summary log.
24. Commit and push to `origin/staging`.

Do not:

- start ads
- announce broadly
- enable real payment
- implement payment provider
- implement email delivery
- change prompt/schema/cache/DB
- change LINE logic
- change product behavior
- change legal copy
- run broad load tests
- use real private relationship input
- record tokens/codes/LINE IDs/tokenized URLs/secrets

## Production Candidate

Deploy latest approved staging commit.

Minimum candidate must include:

```text
7c891c9 or newer
```

Also verify it includes these important commits/features:

```text
free-only analyze
deferred paid generation
global LIFF bridge
LIFF URL path duplication fix
Theme A/B implementation
theme carryover fixes
input quality + pending paid UX polish
analyze transition flicker fix
```

Record:

```text
candidate commit
deployment ID
deployment URL
alias status
```

If exact deployed commit cannot be read from runtime, document verification method and consider this existing tech debt.

## Production Environment / Console Requirements

Verify presence only, do not print secrets:

```text
DATABASE_URL
ANTHROPIC_API_KEY or configured provider key
ANALYSIS_CACHE_HASH_SECRET
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
NEXT_PUBLIC_LINE_LIFF_ID
NEXT_PUBLIC_LINE_LIFF_URL
NEXT_PUBLIC_LINE_ADD_URL
RETENTION_CLEANUP_SECRET or CRON_SECRET if relevant
```

Expected production LIFF / OA values should already be configured from prior setup:

```text
Production LIFF ID: 2009959232-LhxoYMDV
Production OA add URL: https://lin.ee/oX0rbiTf
```

Production LINE Console should have:

```text
LIFF endpoint:
https://anyu.tw/line/fulfill

Webhook URL:
https://anyu.tw/api/line/webhook

Webhook enabled:
On

Webhook verification:
Pass

LIFF scopes:
profile, openid

Linked bot:
production OA
```

If console cannot be verified from Codex, document as operator check.

## Production DB Migration Verification

Verify production DB has required migrations/objects:

```text
0001 initial
0002 analyze_request_state
0003 line_fulfillment
0004 line_webhook_hardening
0005 two_tier_phase_1
```

Expected objects:

```text
analysis_requests.user_context_json
analysis_paid_results
line_webhook_events
line_webhook_rate_limits
unlock_intents fulfillment fields
```

Do not apply new migrations unless a required migration is missing and the migration has already been approved in previous work.

Do not print DATABASE_URL.

Do not dump rows.

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

## Smoke A — Production Route / Visual Basics

Verify:

```text
https://anyu.tw/m/ambiguous-temperature loads
Theme A / 柔和 can render
Theme B / 鮮明 can render
theme switch compact swatches appear where expected
theme switch hidden downstream where expected
input below 80 chars disables CTA
rich input enables CTA
```

## Smoke B — Production Free Analyze

Verify:

```text
analyze request returns HTTP 200
free-only result renders
result page route returns 200
analyze transition does not flicker back to idle CTA
likelihood labels not relevant yet unless paid content generated
```

Record safe timing aggregate if available.

Do not record raw input or full result JSON.

## Smoke C — Production Unlock Intent / LIFF URL

Verify:

```text
unlock intent succeeds
LINE/LIFF panel appears
LIFF URL shape is:
https://liff.line.me/{LIFF_ID}?<context>
```

Must not be shaped like:

```text
https://liff.line.me/{LIFF_ID}/line/fulfill...
https://liff.line.me/{LIFF_ID}/m/...
```

Verify context includes safe theme hint if visible in shape checks, but do not record tokenized URL.

Do not record unlock token, fulfillment code, short code, or tokenized URL.

## Smoke D — Production LIFF Operator Smoke

If feasible with operator-owned LINE account:

```text
1. Start from production result page.
2. Use selected Theme B and optionally Theme A if time allows.
3. Click 用 LINE 領取完整分析.
4. Open production LIFF.
5. Complete LINE bind.
6. Verify no 404.
7. Verify no homepage drop.
8. Verify unlocked route reached.
9. Verify pending paid UX if generation still processing.
10. Verify paid content completes and renders.
11. Verify theme carries through.
12. Verify theme switch hidden downstream.
```

Record only sanitized pass/fail.

Do not record:

```text
LINE user ID
ID token
tokenized URL
unlock token
fulfillment token
short code
raw LINE message text
```

If manual LIFF smoke cannot be performed, document why and mark production activation partial.

## Smoke E — Production Short-code Operator Smoke

If feasible with operator-owned LINE account:

```text
1. Start from production result page.
2. Create unlock intent.
3. Get short code from UI.
4. Send short code to production OA.
5. Verify bot replies.
6. Verify returned link opens.
7. Verify unlocked route reached.
8. Verify pending paid UX if generation still processing.
9. Verify paid content completes and renders.
10. Verify theme carries through if started from known theme.
```

Record only sanitized pass/fail.

Do not record actual code or link.

If short-code smoke cannot be performed, document why and mark activation partial.

## Smoke F — Paid Content Quality

Verify paid content:

```text
renders completed paid result
possible-state likelihood labels show 高 / 中 / 低 or Chinese equivalent
no visible high / medium / low remains
no obvious awkward English mixing like genuinely/vibe/timing unless input includes English
provider source preferably provider, fallback not dominant
```

Do not record full paid content.

## Smoke G — Event / Privacy

Verify no report/log/doc contains:

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
```

Allowed:

```text
pass/fail
route names
status names
theme variant labels
safe aggregate timing
source provider/fallback as aggregate
error category
```

## No-go / Rollback Conditions

If any of the following occur, document and recommend rollback or block production activation:

```text
production landing fails
production analyze fails
production result route fails
unlock intent fails
LIFF URL malformed
LIFF bind fails or 404s
short-code bot does not reply
paid generation fails repeatedly
unlocked paid route fails
paid content does not render
theme carryover breaks badly
sensitive values appear in logs/reports
```

Rollback options:

```text
1. revert production deployment to previous stable deployment
2. disable full-analysis CTA temporarily
3. route users to safe pending/fallback message
4. force Theme A if Theme B breaks
5. use LIFF-only if short-code breaks
6. use short-code-only if LIFF breaks
```

## Post-activation Monitoring

If production activation smoke passes, define next task:

```text
Module 01 Low-key Production Monitoring v0
```

Monitoring window:

```text
first 24 hours or first small organic/known-user traffic window
```

Track aggregate only:

```text
free analyze success/failure
analyze latency
paid generation requested/completed/failed
provider vs fallback source
pending paid stuck
LIFF bind success/failure
short-code success/failure
unlocked paid views
themeVariant distribution
error categories
retention overdue counts
```

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-25-module-01-low-key-production-activation-smoke-v0-review-bundle.md
```

Required sections:

```markdown
# Module 01 Low-key Production Activation + Smoke v0 Review Bundle

Date: 2026-05-25

## 1. Summary

## 2. Production Candidate

## 3. Production Env / Console Checks

## 4. Production DB / Migration Checks

## 5. Route / Visual Smoke

## 6. Free Analyze Smoke

## 7. Unlock Intent / LIFF URL Smoke

## 8. Production LIFF Operator Smoke

## 9. Production Short-code Operator Smoke

## 10. Paid Content Quality Smoke

## 11. Theme Carryover Smoke

## 12. Event / Privacy Verification

## 13. Issues Found

## 14. Activation Result

## 15. Rollback / Follow-up

## 16. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-25-module-01-low-key-production-activation-smoke-v0-execution-report.md
```

Report structure:

```markdown
# Module 01 Low-key Production Activation + Smoke v0 Execution Report

## Summary

## Files Created

## Files Updated

## Production Deployment Status

## Production Smoke Results

## LIFF Result

## Short-code Result

## Paid Generation Result

## Theme Result

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
production deployment status
production smoke status
LIFF/short-code result
activation result
validation result
commit hash
staging push status
```

## Validation

Always run local validation before/after production work:

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
git commit -m "ops: activate module low-key production"
git rev-parse --short HEAD
git push origin HEAD:staging
```

If no repo files changed except if production action is recorded elsewhere, still update the required report/review bundle/summary log and commit.

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
production deployment status
candidate commit/deployment
DB/env/console checks
free analyze result
LIFF result
short-code result
paid generation result
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
