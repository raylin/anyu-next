# Handoff: LINE Fulfillment Staging Deploy + Smoke v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Deploy and verify the LINE Fulfillment Automation MVP on staging only.

This task should deploy commit `58f9f94` or newer to staging, apply the staging DB migration `0003_line_fulfillment.sql`, then verify the LIFF fulfillment path, short-code fallback, unlocked result route, and privacy boundaries using the staging/test LINE OA configuration.

This is a staging deployment + smoke verification task.

Do not deploy to production.

Do not run production migration.

Do not change implementation unless a small staging-blocking bug is found.

Do not change model, prompt/schema semantics, legal semantics, payment, LINE production settings, ads posture, or production launch posture.

## Background

LINE Fulfillment Automation MVP v0 implementation completed.

Commit:

```text
58f9f94
```

What was implemented:

```text
- unlock_intents fulfillment fields and migration
- LIFF bridge / bind API
- LINE webhook short-code fallback
- unlocked result route
- fulfillment panel copy: 用 LINE 領取完整分析
- safe fulfillment events
- stricter event metadata guard
```

Validation completed in implementation pass:

```text
compileall passed
topic-ingestion unittest passed
apps/web lint passed
apps/web test passed
apps/web build passed
local Playwright passed
```

Live smoke was intentionally not run yet.

Required next step:

```text
Deploy 58f9f94 or newer to staging, apply apps/web/drizzle/0003_line_fulfillment.sql to staging DB, then run staging test OA smoke.
```

Important tech debt from implementation pass:

```text
- LIFF bind should later be hardened with server-side ID token verification.
- webhook rate limiting is not implemented.
- duplicate LINE event idempotency is not implemented.
```

For this staging smoke task, verify behavior first. Do not broaden into all hardening unless staging smoke reveals a blocker.

## Scope

Do:

1. Confirm staging/test LINE setup docs and env matrix.
2. Verify required staging env vars are present without printing values.
3. Deploy commit `58f9f94` or newer to staging.
4. Apply `apps/web/drizzle/0003_line_fulfillment.sql` to staging/preview DB.
5. Verify staging route freshness.
6. Verify unlock intent creates fulfillment fields.
7. Verify fulfillment panel copy and short-code fallback.
8. Verify unlocked route with valid token.
9. Verify invalid/expired token behavior if practical.
10. Verify LIFF fulfillment page loads.
11. Verify LIFF bind API behavior as far as possible.
12. Verify LINE webhook rejects invalid signature.
13. If test OA is ready, run real short-code webhook smoke.
14. Verify event/privacy metadata is safe.
15. Update setup docs/runbook only if needed.
16. Create review bundle, execution report, summary log.
17. Commit and push to `origin/staging`.

Do not:

- deploy production
- apply production migration
- change production env
- send messages through production OA
- start ads
- add real payment
- add email delivery
- add rich menu/broadcast/portal
- add new LLM generation
- change Module 01 prompt/schema semantics

## Required Staging Env

Verify presence only; do not print values:

```text
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
NEXT_PUBLIC_LINE_LIFF_ID
NEXT_PUBLIC_LINE_LIFF_URL
NEXT_PUBLIC_LINE_ADD_URL
```

Expected staging behavior:

```text
Preview/Staging env points to test OA + staging LIFF.
```

Read setup docs if present:

```text
ai-collaboration/research/line/line-oa-staging-setup.md
ai-collaboration/research/line/line-fulfillment-env-matrix.md
ai-collaboration/research/2026-05-21-line-fulfillment-automation-architecture-v0.md
ai-collaboration/research/2026-05-21-line-fulfillment-automation-mvp-v0-review-bundle.md
```

If docs are missing, document and continue with env verification.

## Migration

Migration file:

```text
apps/web/drizzle/0003_line_fulfillment.sql
```

Apply to staging/preview Neon branch only.

Do not apply to production.

Verify expected fulfillment columns exist on `unlock_intents`.

Do not dump rows.

## Staging Target

Use:

```text
https://staging.anyu.tw
```

Key routes:

```text
https://staging.anyu.tw/m/ambiguous-temperature
https://staging.anyu.tw/m/ambiguous-temperature/result/demo
https://staging.anyu.tw/m/ambiguous-temperature/line/fulfill
https://staging.anyu.tw/api/line/webhook
```

## Synthetic Input

Use only synthetic input:

```text
他最近說想再觀察看看，但又會主動分享日常。我不知道這是在慢慢靠近，還是在避免給答案。
```

Synthetic email if needed:

```text
anyu-line-fulfillment-staging@example.com
```

Do not use real private content or real contact values.

## Smoke Checklist

### 1. Deployment freshness

Verify staging serves commit `58f9f94` or newer.

If exact commit is not exposed, verify route/source markers:

```text
fulfillment panel copy
LIFF fulfill page route
unlock token route
webhook route
```

### 2. Fresh analyze + result

Run one synthetic analyze if needed.

Verify:

```text
analyze succeeds
result page loads
paid/unlock section visible
```

### 3. Unlock intent fulfillment fields

Trigger unlock intent.

Verify response includes expected fulfillment-safe fields, such as:

```text
unlockIntentId
fulfillmentCode
fulfillmentExpiresAt
unlockToken or unlocked route reference if intended
liffUrl
lineAddUrl
```

Do not expose internal secrets.

### 4. Fulfillment panel

Verify:

```text
primary CTA says 用 LINE 領取完整分析
support copy says no real charge / complete analysis link
short-code fallback appears
Email fallback remains available and accurately capture-only if no email delivery
```

### 5. Unlocked route

Verify valid token:

```text
/m/ambiguous-temperature/unlock/[unlockToken]
```

Expected:

```text
loads persisted paid_result / unlocked content
does not call provider
does not expose raw input beyond existing safe result display
```

Verify invalid token if practical:

```text
safe invalid/expired state
no stack trace
```

### 6. LIFF fulfillment page

Verify route loads:

```text
/m/ambiguous-temperature/line/fulfill
```

If full LIFF runtime is unavailable in shell:

```text
verify page renders/fallback copy/source markers
document limitation
```

If browser/test OA is available:

```text
open staging LIFF URL
confirm LIFF page initializes or shows expected fallback
```

### 7. LIFF bind API

Verify route behavior:

```text
rejects invalid/missing token
accepts valid test payload if safe/mocked
returns unlocked URL
does not store display name/profile image
```

If server-side ID token verification is not implemented, document as known hardening item.

### 8. Webhook route

Verify:

```text
invalid signature is rejected
valid synthetic payload accepted if test signing helper exists
unsupported event/message types ignored safely
text short-code payload can match fulfillment code if route test is possible
```

Do not print LINE_CHANNEL_SECRET.

### 9. Real test OA short-code smoke

Only if test OA webhook is configured and safe.

Flow:

```text
1. Create staging unlock intent.
2. Join/open test OA.
3. Send short code.
4. Verify LINE bot replies with unlocked link.
5. Open link.
6. Verify unlocked route loads.
```

If this cannot be done from the shell, document exact pending manual action.

### 10. Event / privacy verification

Verify no event metadata/log/report contains:

```text
raw input
LINE message text
email
LINE display name
full result JSON
provider output
DATABASE_URL
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
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
fulfillment event names
```

## Known Hardening Items

Document but do not necessarily implement in this task unless blocking:

```text
LIFF server-side ID token verification
webhook rate limiting
duplicate LINE event idempotency
```

Recommended decision:

```text
If staging smoke passes but ID token verification is still missing, recommend a narrow hardening pass before production activation.
```

## Documentation Updates

Update if needed:

```text
apps/web/README.md
docs/operations/production-deployment-runbook.md
ai-collaboration/research/line/line-oa-staging-setup.md
ai-collaboration/research/line/line-fulfillment-env-matrix.md
```

Do not write secret values.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-21-line-fulfillment-staging-deploy-smoke-v0-review-bundle.md
```

Required sections:

```markdown
# LINE Fulfillment Staging Deploy + Smoke v0 Review Bundle

Date: 2026-05-21

## 1. Summary

## 2. Staging Deployment

## 3. Migration Status

## 4. Env / Setup Status

## 5. Unlock Intent Verification

## 6. Fulfillment Panel Verification

## 7. Unlocked Route Verification

## 8. LIFF Page / Bind Verification

## 9. Webhook Verification

## 10. Test OA Short-code Smoke

## 11. Event / Privacy Verification

## 12. Known Limitations

## 13. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-line-fulfillment-staging-deploy-smoke-v0-execution-report.md
```

Report structure:

```markdown
# LINE Fulfillment Staging Deploy + Smoke v0 Execution Report

## Summary

## Files Created

## Files Updated

## Staging Deployment Status

## Migration Status

## Env / Setup Status

## Smoke Results

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
- staging deploy status
- migration status
- smoke status
- known hardening items
- validation result
- commit hash
- staging push status

## Validation

Always run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
cd apps/web && corepack pnpm test:e2e:local
```

If no app code changed and these were just run in implementation, still run to confirm current head.

## Constraints

Do not implement:

```text
production activation
production migration
real payment
email delivery
rich menu
broadcast
portal/account system
new LLM generation
ads launch
model switch
queue/worker
SSE/websocket/token streaming
```

Do not modify:

```text
product prompt/schema semantics
provider/model defaults
legal semantics
production ops behavior beyond docs
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
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
real contact values
raw private user content
font files
screenshots / test artifacts / videos / traces
raw sourced JSONL
private batch generated outputs
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "ops: smoke line fulfillment staging"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files/test artifacts/raw JSONL are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- staging deployment status
- migration status
- env/setup status
- unlock intent result
- unlocked route result
- LIFF result
- webhook result
- test OA short-code smoke result
- event/privacy result
- validation results
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
