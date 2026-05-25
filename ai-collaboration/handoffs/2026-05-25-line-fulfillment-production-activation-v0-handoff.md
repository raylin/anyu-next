# Handoff: LINE Fulfillment Production Activation v0

Date: 2026-05-25

Project: anyu-next / 暗語 ANYU

## Objective

Activate LINE Fulfillment Automation MVP on production after staging implementation, hardening, and mobile visual checks have passed.

This task should apply the necessary production DB migrations, refresh the production app deployment so production public LINE env is baked into the build, and run a narrow production smoke for the real OA / production LIFF fulfillment flow.

This is a production activation + smoke task.

Do not start ads.

Do not implement real payment.

Do not implement email delivery.

Do not change prompt/schema/paid result behavior.

Do not change landing/context UI.

Do not implement new features beyond production activation and verification.

## Background

Current status:

```text
Module 01 production low-key launch: GO
Paid result v2: staging reviewed and safety/value refined
Landing/title/context chips cleanup: staging/mobile manually accepted
LINE fulfillment MVP: implemented
LINE fulfillment staging short-code smoke: passed
LINE hardening route-level staging smoke: passed
LINE hardening manual/mobile follow-up: acceptable to proceed
Production fulfillment: not yet activated
```

Relevant recent commits:

```text
58f9f94 - LINE Fulfillment Automation MVP implementation
7d17a26 - LIFF ID Token Verification + Webhook Hardening
2dcbe16 - Hardening staging smoke
8474123 / d754dfb - Paid result safety/value refinement
583ad55 / 8533be1 / 974881f - title/context landing polish
```

Important production public env status from prior sync:

```text
Production public LINE env values are set:
- production LIFF ID: 2009959232-LhxoYMDV
- production OA add URL: https://lin.ee/oX0rbiTf

But production has not necessarily been redeployed after those NEXT_PUBLIC_* env updates.
```

Important production DB status:

```text
Production has 0001 and 0002 from earlier work.
Need to verify/apply:
- apps/web/drizzle/0003_line_fulfillment.sql
- apps/web/drizzle/0004_line_webhook_hardening.sql
```

## Scope

Do:

1. Confirm current production app/deployment freshness.
2. Verify production env presence without printing secret values.
3. Apply production DB migration 0003 if not already applied.
4. Apply production DB migration 0004 if not already applied.
5. Verify production DB schema objects.
6. Deploy/promote current approved app code to production.
7. Verify production app serves the current code and public LINE env.
8. Verify production unlock intent returns production LIFF URL and real OA add URL.
9. Run one production synthetic analyze or use an existing synthetic result if safe.
10. Verify production unlocked route works.
11. Verify production LIFF fulfill page loads with production LIFF config.
12. Verify production LIFF bind route rejects missing/invalid ID token.
13. Verify production webhook rejects invalid signature.
14. If safe and approved, run one real production OA short-code smoke using a synthetic result and the operator's own LINE account.
15. Verify event/privacy metadata.
16. Update production setup docs/runbook if needed.
17. Create review bundle, execution report, summary log.
18. Commit and push to `origin/staging`.

Do not:

- start ads
- enable real payment
- implement email delivery
- change LINE rich menu/broadcast/portal
- change prompt/schema/paid result
- change landing/context UI
- change model/provider
- run broad load tests
- use real private user input
- use real contact values except the operator's LINE account for the smoke, and do not record it
- print or commit secrets
- dump raw DB rows

## Required Production Env

Verify presence only; do not print values:

```text
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
NEXT_PUBLIC_LINE_LIFF_ID
NEXT_PUBLIC_LINE_LIFF_URL
NEXT_PUBLIC_LINE_ADD_URL
```

Expected production public values:

```text
NEXT_PUBLIC_LINE_LIFF_ID = 2009959232-LhxoYMDV
NEXT_PUBLIC_LINE_ADD_URL = https://lin.ee/oX0rbiTf
```

Do not print server secrets.

If required production env is missing:

```text
stop before production smoke
document missing env name only
do not continue activation
```

## LINE Console Production Prerequisites

Production OA / Messaging API should have:

```text
Webhook URL: https://anyu.tw/api/line/webhook
Webhook enabled: On
Webhook verified: Pass
```

Production LIFF should have:

```text
LIFF endpoint: https://anyu.tw/m/ambiguous-temperature/line/fulfill
Size: Full
Scopes: profile, openid
Add friend option: On Normal
Linked bot: production OA
```

If console verification is not done, document the blocker and do not claim end-to-end production fulfillment live.

## Production Migrations

Migration files:

```text
apps/web/drizzle/0003_line_fulfillment.sql
apps/web/drizzle/0004_line_webhook_hardening.sql
```

Apply to production Neon branch only if not already present.

Rules:

```text
- Verify schema before applying.
- Do not rerun destructively.
- Do not dump rows.
- Do not print DATABASE_URL.
- Document applied/already-present status.
```

Expected DB objects:

For 0003:

```text
unlock_intents fulfillment columns/indexes
```

For 0004:

```text
line_webhook_events
line_webhook_rate_limits
```

## Production Deployment

Deploy/promote current approved code to production.

Candidate should include at least:

```text
LINE fulfillment MVP
LIFF ID token hardening
paid result v2 safety/value refinement
landing/context cleanup
```

Record:

```text
deployment URL
deployment ID if available
candidate commit
alias to https://anyu.tw
```

Do not treat this as ads/broader launch approval. This is a fulfillment activation within current low-key launch posture.

## Production Smoke

Use production:

```text
https://anyu.tw
```

Synthetic input:

```text
他最近回訊息變慢，但還是會看我的限動，也偶爾傳一些生活小事。我不知道他是真的忙，還是其實已經沒那麼想靠近了。
```

Context:

```text
relationshipStage: 曖昧中
userGoal: 我該怎麼回
primaryPain: 回覆變慢
replyTone: 有界線但不冷
```

Do not use real private input.

### 1. Public env verification

Verify `/api/unlock-intent` or unlock flow returns:

```text
liffUrl non-null
lineAddUrl points to production OA https://lin.ee/oX0rbiTf
no staging/test OA URL appears in production response
```

### 2. Analyze + paid result

Verify:

```text
analyze succeeds
paid result v2 generated or cached correctly
result page loads
paid preview visible
```

### 3. Unlock intent

Verify:

```text
unlock intent succeeds
fulfillmentCode present
unlockToken / unlocked route present
fulfillment expiration present
```

Do not report code/token.

### 4. Unlocked route

Verify:

```text
/m/ambiguous-temperature/unlock/[unlockToken]
```

Expected:

```text
loads persisted paidResult v2
does not call provider
shows richer unlocked content
no raw input beyond existing safe result display
```

Do not report tokenized URL.

### 5. LIFF fulfill page

Verify:

```text
/m/ambiguous-temperature/line/fulfill
```

Expected:

```text
page loads
uses production LIFF ID / URL
shows fallback instructions if LIFF runtime unavailable
does not leak secrets
```

### 6. LIFF bind hardening

Verify route-level:

```text
missing idToken rejected
invalid idToken rejected
client-only liffUserId rejected
```

If live LIFF in-app ID token smoke is practical, run it. If not, document pending manual check.

### 7. Webhook route

Verify:

```text
invalid signature rejected
```

Do not print `LINE_CHANNEL_SECRET`.

### 8. Real production OA short-code smoke

Only if production webhook is configured and operator approves.

Flow:

```text
1. Create a fresh production unlock intent with synthetic result.
2. Open/join production OA via production add URL.
3. Send displayed short code to production OA.
4. Verify bot replies with unlocked link.
5. Open link and confirm unlocked content.
```

Do not include the code, token, tokenized URL, LINE user ID, or message text in reports.

If not run, document exact reason and keep activation as partial.

### 9. Event / privacy verification

Verify no event metadata/log/report contains:

```text
LINE user ID
LINE display name
LINE message text
fulfillment code
unlock token
tokenized URL
raw input
redacted input text
email
full result JSON
provider output
DATABASE_URL
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
LINE_LOGIN_CHANNEL_SECRET
ANALYSIS_CACHE_HASH_SECRET
RETENTION_CLEANUP_SECRET
```

Allowed:

```text
unlockIntentId
resultId
channel
status
errorCode
elapsedMs
dedupeStatus
rateLimited true/false
safe event names
```

## Retention / Cleanup Note

0004 introduces:

```text
line_webhook_events
line_webhook_rate_limits
```

For this task:

```text
Do not implement retention cleanup.
Document that cleanup/retention for these rows is a deferred candidate if volume grows.
```

## Documentation Updates

Update if needed:

```text
ai-collaboration/research/line/line-oa-production-setup.md
ai-collaboration/research/line/line-fulfillment-env-matrix.md
docs/operations/production-deployment-runbook.md
apps/web/README.md
```

Do not write secret values.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-25-line-fulfillment-production-activation-v0-review-bundle.md
```

Required sections:

```markdown
# LINE Fulfillment Production Activation v0 Review Bundle

Date: 2026-05-25

## 1. Summary

## 2. Production Env Status

## 3. Production Migration Status

## 4. Production Deployment

## 5. Public Env Verification

## 6. Analyze / Paid Result Verification

## 7. Unlock Intent Verification

## 8. Unlocked Route Verification

## 9. LIFF Page / Bind Verification

## 10. Webhook Verification

## 11. Real Production OA Short-code Smoke

## 12. Event / Privacy Verification

## 13. Known Limitations

## 14. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-25-line-fulfillment-production-activation-v0-execution-report.md
```

Report structure:

```markdown
# LINE Fulfillment Production Activation v0 Execution Report

## Summary

## Files Created

## Files Updated

## Production Env Status

## Migration Status

## Deployment Status

## Smoke Results

## Production OA Result

## Event / Privacy Status

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

- date
- task completed
- production activation status
- migration status
- smoke status
- production OA status
- validation result
- commit hash
- staging push status

## Validation

Always run local validation:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
cd apps/web && corepack pnpm test:e2e:local
```

Do not skip validation.

## Constraints

Do not implement:

```text
real payment
email delivery
rich menu
broadcast
portal/account system
new second-call LLM generation
ads launch
model switch
queue/worker
SSE/websocket/token streaming
Module 02
new paid result schema changes
landing/context UI changes
```

Do not modify:

```text
product prompt/schema semantics
provider/model defaults
legal semantics
design system direction
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
LINE_LOGIN_CHANNEL_SECRET
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
real contact values
raw private user content
font files
screenshots / test artifacts / videos / traces
raw sourced JSONL
private batch generated outputs
codes/tokens/tokenized URLs/LINE user IDs
full raw provider output
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "ops: activate line fulfillment production"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- production env status
- migration status
- deployment status
- analyze/paid result result
- unlock intent result
- unlocked route result
- LIFF/webhook result
- real production OA smoke result
- event/privacy result
- validation results
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
