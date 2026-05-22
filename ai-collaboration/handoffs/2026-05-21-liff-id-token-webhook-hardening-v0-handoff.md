# Handoff: LIFF ID Token Verification + Webhook Hardening v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Harden the LINE Fulfillment Automation MVP before production activation.

This task should close the most important security/reliability gaps found after staging smoke:

```text
- LIFF bind should verify LINE identity server-side instead of trusting client-provided userId.
- LINE webhook should be idempotent for duplicate event delivery.
- LINE webhook should have a basic abuse/rate guard.
- Fulfillment event metadata must not leak LINE userId, short code, unlock token, tokenized URL, raw message text, raw input, or secrets.
```

This is a targeted hardening task.

Do not activate production fulfillment.

Do not deploy or smoke production.

Do not add real payment, email delivery, rich menu, broadcast, portal, or new LLM generation.

## Background

LINE Fulfillment Automation MVP v0 implemented and validated locally.

Staging verification status:

```text
Route-level staging smoke: passed
Manual test OA short-code smoke: passed
Bot replied with complete-analysis unlocked URL: passed
Unlocked link opened and content was correct: passed
Production: not touched
```

Manual smoke was recorded in commit:

```text
8aef7d2
```

Implementation commit:

```text
58f9f94
```

Known deferred hardening from implementation:

```text
1. LIFF bind should be hardened with server-side ID token verification.
2. Webhook rate limiting is not implemented.
3. Duplicate LINE event idempotency is not implemented.
```

This task handles those hardening items before production activation.

## Scope

Do:

1. Review current LIFF bind API.
2. Add server-side LINE ID token verification or an equivalent safer verification path.
3. Stop trusting raw client-provided `liffUserId` as the sole identity proof.
4. Review current LINE webhook.
5. Add duplicate LINE event idempotency.
6. Add basic webhook abuse/rate guard.
7. Ensure invalid/expired/duplicate webhook events are safe and idempotent.
8. Strengthen fulfillment event metadata guard if needed.
9. Add tests.
10. Update docs/runbook/setup notes.
11. Run validation and local Playwright if UI contract changed.
12. Run staging route-level smoke where possible.
13. Create review bundle, execution report, summary log.
14. Commit and push to `origin/staging`.

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
- change UI except tiny copy/testability fix if absolutely required

## LINE ID Token Verification

### Current risk

If the LIFF bind API currently accepts:

```json
{
  "liffUserId": "..."
}
```

from the client without verifying the LINE-issued identity token server-side, it is too trusting.

### Required direction

Prefer server-side verification using LINE ID token.

Expected client sends:

```json
{
  "unlockIntentId": "...",
  "unlockToken": "...",
  "idToken": "..."
}
```

Server verifies ID token with LINE.

Verification should ensure:

```text
- token is valid
- token was issued for the expected LINE Login channel / LIFF app
- token contains a LINE user subject/userId
- unlockIntent/token pair is valid and unexpired
- the verified LINE user is what gets bound
```

Do not store display name/profile picture.

Store only:

```text
line_user_id
line_bound_at
fulfillment status/timestamps
```

If LINE ID token verification endpoint/client library is not already available, implement the simplest maintainable server-side verification compatible with current dependencies.

If verification cannot be implemented due to missing channel setup details, stop before production activation and document exact blocker.

## Env / Config

Use existing env matrix.

Likely required:

```text
NEXT_PUBLIC_LINE_LIFF_ID
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
```

ID token verification may also require LINE Login channel ID / client ID if not derivable.

If needed, add env var:

```text
LINE_LOGIN_CHANNEL_ID
```

or:

```text
LINE_LOGIN_CHANNEL_SECRET
```

Only if actually required by chosen verification method.

Rules:

```text
- Do not print secrets.
- Do not commit secrets.
- Public LIFF ID may be documented.
- Server-side verification must be env-driven.
```

## Webhook Idempotency

LINE may deliver duplicate webhook events or retries.

Implement idempotency for LINE webhook event processing.

Possible approaches:

### Option A: DB table

Create a small table:

```text
line_webhook_events
- event_id or dedupe_key
- event_type
- processed_at
- status
- created_at
```

### Option B: Extend unlock_intents delivery state

For short-code matching only, use existing fulfillment status to avoid duplicate link delivery.

Preferred:

```text
Use a small explicit idempotency table if webhook event IDs are available and schema cost is acceptable.
```

If LINE event payload lacks stable event ID in current handling, derive a safe dedupe key from non-sensitive stable fields:

```text
event type + timestamp + replyToken hash
```

Do not store raw message text.

### Behavior

On duplicate:

```text
return 200 safely
do not deliver duplicate message if already handled
do not mutate state repeatedly
```

Document any limitation.

## Webhook Abuse / Rate Guard

Add basic guard to avoid brute-force short-code attempts.

Options:

```text
- per LINE user short-code attempt count within time window
- per unlock code attempt count
- global webhook invalid-code counter
```

Keep v0 simple.

Suggested behavior:

```text
If a LINE user submits too many invalid codes in a short window, reply with a gentle cooldown message or ignore safely.
```

Do not overbuild.

Do not store raw message content.

If storage is needed, store aggregate attempt metadata only:

```text
line_user_id
attempt_count
window_start
last_attempt_at
```

If schema is too heavy, add in-memory best-effort guard and document serverless limitations. Prefer DB-backed if simple.

## Privacy / Event Metadata

Strengthen tests/guards so event metadata and reports never contain:

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

If LINE user ID must be stored in DB, ensure it is not emitted to event metadata.

## Staging Smoke

After implementation and migration if any, run staging route-level smoke.

Do not require human LINE app smoke unless route-level behavior changed substantially.

Verify:

```text
LIFF bind rejects missing/invalid ID token
LIFF bind accepts valid mocked/verified token if testable
webhook rejects invalid signature
webhook handles duplicate event idempotently
webhook invalid-code abuse guard works
short-code path still works in tests
unlocked route still works
event/privacy metadata safe
```

If real LINE ID token verification cannot be tested from shell, document manual staging test instructions.

## DB / Migration

If adding tables/fields for idempotency/rate guard:

```text
add migration
apply to staging only if live staging smoke requires it
do not apply production migration
document production migration requirement for later activation
```

Do not run production migration in this task.

## Tests

Add/update tests for:

```text
LIFF bind rejects client-only userId without verified token
LIFF bind verifies ID token or mocked verifier
LIFF bind binds verified LINE user only
invalid/expired unlock token rejected
webhook signature verification still works
duplicate webhook event returns safe 200 and does not double-deliver
invalid short-code attempts are rate limited or guarded
unsupported event types are ignored safely
event metadata excludes LINE userId/code/token/message text
unlocked route still works
existing local Playwright smoke still passes
```

## Docs

Update if needed:

```text
apps/web/README.md
docs/operations/production-deployment-runbook.md
ai-collaboration/research/line/line-fulfillment-env-matrix.md
ai-collaboration/research/line/line-oa-staging-setup.md
ai-collaboration/research/line/line-oa-production-setup.md
```

Document:

```text
new env vars if added
server-side ID token verification requirement
webhook idempotency behavior
webhook abuse guard behavior
production activation prerequisites
```

Do not write secret values.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-21-liff-id-token-webhook-hardening-v0-review-bundle.md
```

Required sections:

```markdown
# LIFF ID Token Verification + Webhook Hardening v0 Review Bundle

Date: 2026-05-21

## 1. Summary

## 2. LIFF Verification Design

## 3. Env / Config Changes

## 4. Webhook Idempotency

## 5. Webhook Abuse Guard

## 6. Privacy / Event Metadata

## 7. Schema / Migration Changes

## 8. Tests Added

## 9. Staging Verification

## 10. Production Activation Impact

## 11. Known Limitations

## 12. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-liff-id-token-webhook-hardening-v0-execution-report.md
```

Report structure:

```markdown
# LIFF ID Token Verification + Webhook Hardening v0 Execution Report

## Summary

## Files Created

## Files Updated

## LIFF Verification Changes

## Webhook Idempotency Changes

## Abuse Guard Changes

## Privacy / Event Metadata Changes

## Schema / Migration Changes

## Tests Added

## Validation Results

## Staging Verification

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
- hardening summary
- migration status
- validation result
- staging verification status
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

If schema/migration changed, run local migration/test commands as appropriate and document production migration requirement.

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
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "security: harden line fulfillment"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files/test artifacts/raw JSONL are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- LIFF verification summary
- webhook idempotency summary
- abuse guard summary
- privacy/event metadata summary
- schema/migration status
- tests added
- validation results
- staging verification status
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
