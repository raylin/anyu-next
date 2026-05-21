# Handoff: LINE Fulfillment Real Staging Test OA Smoke v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Run the real staging/test LINE OA smoke for LINE Fulfillment Automation MVP after public Preview/Staging LINE env values were corrected.

This task should verify the actual staging fulfillment flow using the test OA and staging LIFF, including unlock intent generation, unlocked route, LIFF page behavior, webhook verification, short-code matching, LINE bot reply, and privacy boundaries.

This is a staging smoke / verification task.

Do not deploy or modify production.

Do not apply production migration.

Do not change implementation unless a tiny staging-blocking bug is found and clearly documented.

Do not change model, prompt/schema semantics, legal semantics, payment, production LINE settings, ads posture, or production launch posture.

## Background

LINE Fulfillment Automation MVP v0 implementation completed.

Commit:

```text
58f9f94
```

LINE Fulfillment Staging Deploy + Smoke v0 completed with partial pass and env blocker.

The blocker was:

```text
staging /api/unlock-intent returned liffUrl: null
staging returned old production OA add URL
real test OA short-code smoke was not run
```

LINE Public Env Sync v0 then completed.

Current known state from env sync:

```text
Preview/Staging public LINE env now points to staging LIFF and test OA:
- staging LIFF ID: 2010157793-Q4JeeYv0
- test OA add URL: https://lin.ee/5uL4e9q

Production public LINE env is set but not redeployed:
- production LIFF ID: 2009959232-LhxoYMDV
- production OA add URL: https://lin.ee/oX0rbiTf

Staging /api/unlock-intent was verified live with:
- non-null liffUrl
- test OA lineAddUrl
```

Production was not redeployed or smoked.

Recommended next step:

```text
Run the real staging test-OA short-code smoke now that staging public LINE env is corrected.
```

## Scope

Do:

1. Confirm staging is serving the corrected public LINE env.
2. Confirm staging/test OA setup docs and env matrix.
3. Confirm staging DB has `0003_line_fulfillment.sql` applied.
4. Create a staging synthetic result/unlock intent.
5. Verify unlock intent response includes fulfillment code/token, liffUrl, and test OA lineAddUrl.
6. Verify unlocked route with token.
7. Verify LIFF fulfill page loads with staging LIFF config.
8. Verify bind API behavior as far as possible.
9. Verify webhook invalid signature rejection.
10. Verify webhook valid signed synthetic payload if feasible.
11. If test OA webhook is configured and safe, run real short-code smoke:
    - send fulfillment code to test OA
    - verify bot replies with unlocked link
    - open link and verify unlocked result
12. Verify fulfillment events/privacy metadata.
13. Update staging setup docs/env matrix if needed.
14. Create review bundle, execution report, summary log.
15. Commit and push to `origin/staging`.

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

## Required Staging / Test OA Setup

Read setup docs:

```text
ai-collaboration/research/line/line-oa-staging-setup.md
ai-collaboration/research/line/line-fulfillment-env-matrix.md
ai-collaboration/research/2026-05-21-line-fulfillment-automation-mvp-v0-review-bundle.md
ai-collaboration/research/2026-05-21-line-fulfillment-staging-deploy-smoke-v0-review-bundle.md
```

Expected staging values:

```text
NEXT_PUBLIC_LINE_LIFF_ID = 2010157793-Q4JeeYv0
NEXT_PUBLIC_LINE_LIFF_URL = staging LIFF URL
NEXT_PUBLIC_LINE_ADD_URL = https://lin.ee/5uL4e9q
```

Do not print server secrets:

```text
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
```

Only verify presence if needed.

## LINE Console Prerequisites

For real test OA smoke, the test OA Messaging API webhook should be:

```text
https://staging.anyu.tw/api/line/webhook
```

Expected:

```text
Webhook enabled: On
Webhook verified: Pass
```

If webhook verification is not complete, document the blocker and run route-level signed payload tests instead.

Do not change production OA webhook.

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

### 1. Public env verification

Verify staging `/api/unlock-intent` returns:

```text
liffUrl is non-null
lineAddUrl points to test OA https://lin.ee/5uL4e9q
no production OA URL appears in staging response
```

### 2. Fresh analyze + unlock

Run one synthetic analyze if needed.

Verify:

```text
analyze succeeds
result page loads
unlock intent succeeds
fulfillmentCode present
fulfillmentToken / unlockToken present
fulfillment expiration present
```

### 3. Fulfillment panel

Verify:

```text
primary CTA says 用 LINE 領取完整分析
support copy says no real charge / complete analysis link
short-code fallback appears
Email fallback remains available and capture-only
```

### 4. Unlocked route

Verify valid token route:

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

### 5. LIFF fulfill page

Verify:

```text
/m/ambiguous-temperature/line/fulfill
```

Expected:

```text
page loads
uses staging LIFF ID / URL
shows fallback instructions if LIFF runtime is unavailable
does not leak secrets
```

If full LIFF browser test is not available, document limitation.

### 6. Bind API

Verify:

```text
rejects invalid/missing token
accepts valid staged test payload if safe/mocked
returns unlocked URL for valid bind
does not store display name/profile image
```

Known limitation:

```text
server-side ID token verification may still be missing and should be hardening follow-up before production activation.
```

### 7. Webhook route-level tests

Verify:

```text
invalid signature rejected
valid signed synthetic payload accepted if helper exists
unsupported event/message types ignored safely
text short-code payload can match fulfillment code if route test is possible
```

Do not print `LINE_CHANNEL_SECRET`.

### 8. Real test OA short-code smoke

Only if test OA webhook is configured and safe.

Flow:

```text
1. Create staging unlock intent.
2. Join/open test OA via staging add URL.
3. Send the displayed short code to test OA.
4. Verify LINE bot replies with unlocked link.
5. Open link.
6. Verify unlocked route loads.
```

If shell cannot complete the human LINE messaging step, document exact manual step and result if user/operator performs it.

### 9. Event / privacy verification

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

Document but do not implement unless absolutely necessary for staging smoke:

```text
LIFF server-side ID token verification
webhook rate limiting
duplicate LINE event idempotency
```

Recommended decision:

```text
If staging real test OA smoke passes, run a narrow ID token verification / webhook hardening pass before production activation.
```

## Documentation Updates

Update if needed:

```text
ai-collaboration/research/line/line-oa-staging-setup.md
ai-collaboration/research/line/line-fulfillment-env-matrix.md
apps/web/README.md
docs/operations/production-deployment-runbook.md
```

Do not write secret values.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-21-line-fulfillment-real-staging-test-oa-smoke-v0-review-bundle.md
```

Required sections:

```markdown
# LINE Fulfillment Real Staging Test OA Smoke v0 Review Bundle

Date: 2026-05-21

## 1. Summary

## 2. Staging Env Verification

## 3. Migration Status

## 4. Unlock Intent Verification

## 5. Fulfillment Panel Verification

## 6. Unlocked Route Verification

## 7. LIFF Page / Bind Verification

## 8. Webhook Route Verification

## 9. Real Test OA Short-code Smoke

## 10. Event / Privacy Verification

## 11. Known Limitations

## 12. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-line-fulfillment-real-staging-test-oa-smoke-v0-execution-report.md
```

Report structure:

```markdown
# LINE Fulfillment Real Staging Test OA Smoke v0 Execution Report

## Summary

## Files Created

## Files Updated

## Staging Env Status

## Smoke Results

## Test OA Result

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
- staging env status
- smoke status
- test OA status
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

If no app code changed and these were recently run, still run to confirm current head.

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
git commit -m "ops: smoke real staging line fulfillment"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files/test artifacts/raw JSONL are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- staging env verification
- unlock intent result
- unlocked route result
- LIFF result
- bind API result
- webhook result
- real test OA short-code smoke result
- event/privacy result
- validation results
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
