# Handoff: LINE Fulfillment Hardening Staging Smoke v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Run staging-only smoke verification for the hardened LINE Fulfillment Automation MVP after `LIFF ID Token Verification + Webhook Hardening v0`.

This task should verify that staging is serving commit `7d17a26` or newer, that the staging DB has `0004_line_webhook_hardening.sql`, and that the hardened LIFF bind / LINE webhook behavior works without touching production.

This is a staging smoke / verification task.

Do not deploy or migrate production.

Do not change implementation unless a tiny staging-blocking bug is found and clearly documented.

Do not start ads.

Do not change payment, email delivery, rich menu, broadcast, portal, model strategy, prompt/schema semantics, legal semantics, or production launch posture.

## Background

`LIFF ID Token Verification + Webhook Hardening v0` completed.

Commit:

```text
7d17a26
```

What changed:

```text
- LIFF bind now verifies LINE ID token server-side.
- Client-only liffUserId is rejected.
- Webhook dedupe uses DB-backed line_webhook_events.
- Invalid-code rate guard uses DB-backed line_webhook_rate_limits.
- Event metadata guard rejects LINE IDs, codes, tokens, tokenized URLs, raw text, provider output, and secret-like keys.
- Migration apps/web/drizzle/0004_line_webhook_hardening.sql was added.
- Staging Neon branch already has the new tables.
- Production was not touched.
```

Previous staging fulfillment smoke status:

```text
Route-level staging smoke: passed
Manual test OA short-code smoke: passed
Bot replied with complete-analysis unlocked URL: passed
Unlocked link opened and content was correct: passed
```

Current required follow-up:

```text
Wait for staging deployment from 7d17a26, then verify hardened routes on staging.
```

## Scope

Do:

1. Confirm staging is serving `7d17a26` or newer.
2. Confirm staging DB has `0004_line_webhook_hardening.sql` objects.
3. Verify fulfillment public env remains staging/test OA.
4. Verify LIFF bind rejects missing/invalid ID token.
5. Verify LIFF bind valid-token behavior as far as possible.
6. Verify webhook rejects invalid signature.
7. Verify webhook duplicate event idempotency.
8. Verify invalid-code rate guard.
9. Verify short-code fulfillment still works in route-level tests.
10. If manual test OA smoke is practical, run one fresh short-code smoke.
11. Verify unlocked route still works.
12. Verify event/privacy metadata remains safe.
13. Update staging setup docs if needed.
14. Create review bundle, execution report, summary log.
15. Commit and push to `origin/staging`.

Do not:

- deploy production
- apply production migration
- change production env
- send production OA messages
- start ads
- add real payment
- add email delivery
- add rich menu/broadcast/portal
- add new LLM generation
- change Module 01 prompt/schema semantics
- change UI except tiny staging-blocking fix if necessary

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
https://staging.anyu.tw/api/line/fulfillment/bind-liff
https://staging.anyu.tw/api/line/webhook
```

Expected staging public env:

```text
NEXT_PUBLIC_LINE_LIFF_ID = 2010157793-Q4JeeYv0
NEXT_PUBLIC_LINE_ADD_URL = https://lin.ee/5uL4e9q
```

Do not print server secrets.

## Migration Verification

Migration:

```text
apps/web/drizzle/0004_line_webhook_hardening.sql
```

Expected staging DB objects include:

```text
line_webhook_events
line_webhook_rate_limits
```

Verify structure without dumping rows or secrets.

Do not apply production migration.

## Smoke Checklist

### 1. Deployment freshness

Verify staging serves `7d17a26` or newer.

If exact commit is not exposed, verify via route/source markers:

```text
LIFF bind requires idToken
webhook hardening route behavior
line_webhook_events / rate-limit behavior
```

### 2. Existing fulfillment still works

Create or reuse a staging synthetic result/unlock intent.

Verify:

```text
unlock intent succeeds
fulfillmentCode present
unlockToken / unlocked route present
liffUrl non-null and staging LIFF
lineAddUrl is test OA
unlocked route loads
```

Synthetic input if needed:

```text
他最近說想再觀察看看，但又會主動分享日常。我不知道這是在慢慢靠近，還是在避免給答案。
```

### 3. LIFF bind hardening

Verify:

```text
missing idToken is rejected
invalid idToken is rejected
client-only liffUserId is rejected
valid token path is testable if live LIFF runtime or mock verifier exists
```

If valid live LIFF token cannot be tested from shell, document limitation and provide manual test steps.

### 4. Webhook signature

Verify:

```text
invalid signature rejected
valid signed synthetic payload accepted if helper exists
```

Do not print `LINE_CHANNEL_SECRET`.

### 5. Webhook duplicate idempotency

Use a synthetic signed webhook payload if possible.

Verify:

```text
first delivery processes normally
duplicate delivery returns safe 200
duplicate does not deliver/send link twice
duplicate does not mutate fulfillment repeatedly
line_webhook_events records aggregate status if inspectable
```

If live duplicate test is not possible, verify through route/unit tests and document limitation.

### 6. Invalid-code rate guard

Use route-level synthetic payload if possible.

Verify:

```text
multiple invalid code attempts trigger guard/cooldown behavior
no raw message text is persisted
only aggregate attempt metadata is stored
safe response copy
```

### 7. Manual test OA smoke, if practical

If staging webhook is verified and human LINE app test is practical:

```text
1. Create a fresh unlock intent.
2. Send the displayed short code to the test OA.
3. Verify bot replies with unlocked link.
4. Open link and confirm unlocked content.
5. Optionally send the same code/event again and verify no duplicate harmful behavior.
```

Do not include code/token/link/user ID in reports.

If not practical, document pending manual action.

### 8. Privacy/event metadata

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
ANALYSIS_CACHE_HASH_SECRET
RETENTION_CLEANUP_SECRET
```

Allowed metadata:

```text
unlockIntentId
resultId
channel
status
errorCode
elapsedMs
dedupeStatus
rateLimited true/false
```

## Known Limitations To Track

Document current status of:

```text
recoverable unlock token storage
webhook dedupe/rate-limit row retention cleanup
valid live LIFF ID token testing availability
production migration/activation pending
```

Do not solve non-blocking items unless tiny and explicitly in scope.

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
ai-collaboration/research/2026-05-21-line-fulfillment-hardening-staging-smoke-v0-review-bundle.md
```

Required sections:

```markdown
# LINE Fulfillment Hardening Staging Smoke v0 Review Bundle

Date: 2026-05-21

## 1. Summary

## 2. Staging Deployment Freshness

## 3. Migration Status

## 4. Public Env Verification

## 5. Existing Fulfillment Verification

## 6. LIFF Bind Hardening Verification

## 7. Webhook Signature Verification

## 8. Webhook Idempotency Verification

## 9. Invalid-code Rate Guard Verification

## 10. Manual Test OA Smoke

## 11. Event / Privacy Verification

## 12. Known Limitations

## 13. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-line-fulfillment-hardening-staging-smoke-v0-execution-report.md
```

Report structure:

```markdown
# LINE Fulfillment Hardening Staging Smoke v0 Execution Report

## Summary

## Files Created

## Files Updated

## Staging Freshness Status

## Migration Status

## Smoke Results

## LIFF Verification Status

## Webhook Hardening Status

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
- staging hardening smoke status
- migration status
- LIFF verification status
- webhook hardening status
- manual test OA status
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

Do not skip validation.

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
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "ops: smoke line hardening staging"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files/test artifacts/raw JSONL/codes/tokens are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- staging freshness status
- migration status
- public env status
- fulfillment smoke result
- LIFF hardening result
- webhook idempotency result
- rate guard result
- manual test OA smoke result
- event/privacy result
- validation results
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
