# Handoff: LINE Fulfillment Automation MVP v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Implement the first automated LINE fulfillment MVP for Module 01 — 曖昧溫度計.

This task should close the paid-intent / LINE funnel gap by allowing a user who clicks unlock to receive an unlocked result link through either:

```text
Mobile-first path: LIFF bind / fulfillment
Fallback path: short code sent to LINE OA
```

The implementation must be environment-configured:

```text
Preview/Staging env → test OA + staging LIFF
Production env → real OA + production LIFF
```

Do not hard-code staging or production LINE IDs / URLs in app code.

## Background

LINE Fulfillment Automation Architecture v0 completed.

Key architecture decisions:

```text
- LIFF is the mobile-primary path.
- Short code is the desktop/fallback path.
- Extend unlock_intents for MVP instead of adding a new fulfillment table.
- Use /m/ambiguous-temperature/unlock/[unlockToken] as canonical unlocked route.
- Use persisted result data; do not add a new LLM generation step.
- Email fallback remains capture-only until a separate email delivery task exists.
```

The user has filled the basic setup records and configured Vercel keys for production and staging.

Existing setup docs should be read if present:

```text
ai-collaboration/research/line/line-oa-staging-setup.md
ai-collaboration/research/line/line-oa-production-setup.md
ai-collaboration/research/line/line-fulfillment-env-matrix.md
ai-collaboration/research/2026-05-21-line-fulfillment-automation-architecture-v0.md
```

If paths differ, locate the latest LINE fulfillment setup / architecture docs.

## Scope

Do:

1. Read LINE setup records and env matrix.
2. Implement fulfillment fields for unlock intents.
3. Add migration for fulfillment fields.
4. Add token and short-code generation/validation helpers.
5. Add unlocked result route.
6. Add LIFF fulfillment page and bind API.
7. Add LINE webhook endpoint with signature verification.
8. Add short-code matching through LINE text messages.
9. Reply with unlocked result link through LINE Messaging API.
10. Update contact/fulfillment panel copy.
11. Add safe fulfillment events/metadata.
12. Add tests.
13. Update docs/runbook/setup records.
14. Run validation.
15. If staging env is ready, run staging test OA smoke.
16. If production env is ready and staging smoke passes, run narrow production smoke.
17. Create review bundle, execution report, summary log.
18. Commit and push to `origin/staging`.

Do not:

- implement real payment
- implement email delivery
- implement rich menu
- implement broadcast
- implement portal/account system
- implement new LLM generation
- implement LIFF membership/profile system
- store display names/profile pictures
- change Module 01 prompt/schema semantics
- change legal pages except docs/setup notes
- start ads

## Environment Configuration

Implementation must read config from env only:

```text
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
NEXT_PUBLIC_LINE_LIFF_ID
NEXT_PUBLIC_LINE_LIFF_URL
NEXT_PUBLIC_LINE_ADD_URL
```

Optional if needed:

```text
FULFILLMENT_TOKEN_SECRET
```

Rules:

```text
- Server-only secrets must never be exposed to client bundles.
- NEXT_PUBLIC_* values are public and environment-specific.
- Preview/Staging should use test OA / staging LIFF.
- Production should use real OA / production LIFF.
- Do not print secret values in reports/logs.
- If required env is missing, code/tests/docs should still complete, but live smoke should stop and document missing env.
```

## DB / Schema

Extend existing `unlock_intents` if that is still consistent with the architecture.

Recommended fields:

```text
fulfillment_code
fulfillment_token
fulfillment_status
fulfillment_channel
line_user_id
line_bound_at
fulfilled_at
fulfillment_expires_at
delivery_attempt_count
last_delivery_error
```

Suggested status values:

```text
pending
bound
delivered
expired
failed
```

Requirements:

```text
- fulfillment_code is short, user-facing, expires.
- fulfillment_token is high entropy, not guessable, used for unlocked route.
- line_user_id can be stored for fulfillment binding.
- Do not store LINE display name/profile image.
- Do not store arbitrary LINE message text.
```

Recommended expiration:

```text
fulfillment_code: 30 minutes
unlockToken / fulfillment token: 24 hours
```

If implementation chooses different windows, document why.

## Routes / APIs

### 1. Unlock intent API

Update existing:

```text
POST /api/unlock-intent
```

or equivalent.

Should return enough public data for fulfillment panel:

```json
{
  "unlockIntentId": "...",
  "fulfillmentCode": "A7K2Q9",
  "fulfillmentExpiresAt": "...",
  "unlockToken": "...",
  "liffUrl": "https://liff.line.me/...",
  "lineAddUrl": "https://lin.ee/..."
}
```

Only return unlockToken if safe and intended.

Avoid exposing internal secrets.

### 2. Unlocked result route

Add:

```text
/m/ambiguous-temperature/unlock/[unlockToken]
```

Requirements:

```text
- validates token
- checks expiry
- loads associated persisted result
- renders unlocked/complete analysis view
- handles invalid/expired token gracefully
- does not require auth
- does not expose raw input beyond existing safe result behavior
```

Content:

```text
Use persisted result data and existing paid/preview result structure.
Do not call provider.
Do not generate a new result.
```

### 3. LIFF fulfillment page

Add:

```text
/m/ambiguous-temperature/line/fulfill
```

or equivalent.

Responsibilities:

```text
- load LIFF SDK
- call liff.init with env LIFF ID
- obtain LINE identity where available
- bind unlock intent via backend
- redirect/show unlocked link
- fall back to short code if LIFF fails
```

Do not store raw input in localStorage/sessionStorage.

### 4. LIFF bind API

Add:

```text
POST /api/line/fulfillment/bind-liff
```

Expected body:

```json
{
  "unlockIntentId": "...",
  "unlockToken": "...",
  "liffUserId": "..."
}
```

If using ID token instead of client-provided userId, document and validate.

Requirements:

```text
- verify token/intent relationship
- bind line_user_id
- mark fulfillment status
- return unlocked URL
- safe error for expired/invalid token
```

### 5. LINE webhook

Add:

```text
POST /api/line/webhook
```

Requirements:

```text
- verify LINE signature using LINE_CHANNEL_SECRET
- reject invalid signature
- support follow event with welcome/short-code instruction
- support text message event for short-code matching
- ignore unsupported message types safely
- do not persist arbitrary message text
- reply with unlocked link when code matches
- return safe invalid-code copy when needed
```

LINE reply should use `LINE_CHANNEL_ACCESS_TOKEN`.

## LINE Message Copy

### Fulfillment panel

Primary CTA:

```text
用 LINE 領取完整分析
```

Support copy:

```text
目前內測中，這次不會真的收費。加入 LINE 後，我們會把完整分析連結送給你。
```

Fallback:

```text
如果沒有自動帶入，請把這組短碼貼給暗語 ANYU：
{code}
```

### LINE welcome

```text
歡迎來到暗語 ANYU。
請貼上剛剛頁面上的短碼，我會把完整分析連結送給你。
```

### LINE success reply

```text
收到，這是你的完整分析連結：
{url}
```

### Invalid code

```text
我找不到這組短碼。請回到剛剛的結果頁重新產生一次，或改用 Email 接收。
```

Tone can be lightly refined but should remain warm and clear.

## Email Fallback

Keep Email fallback capture-only in this task.

Do not add email sending.

Copy should not imply Email instantly delivers unlocked result unless it does.

If needed, keep Email copy as secondary fallback / notification.

## Security / Privacy

Must implement:

```text
LINE webhook signature verification
server-only channel access token
short-code expiry
high entropy unlock token
idempotent fulfillment
safe invalid/expired code responses
no raw input in LINE messages
no raw input/provider output in event metadata
no LINE display name/profile storage
```

Avoid:

```text
persisting arbitrary LINE message content
exposing secrets in logs
sending full raw analysis text through LINE
```

Send link, not raw analysis content.

## Events / Metrics

Add safe events if event system supports it:

```text
fulfillment_liff_opened
fulfillment_liff_bound
fulfillment_code_shown
fulfillment_code_matched
fulfillment_link_delivered
fulfillment_failed
line_webhook_received
```

Allowed metadata:

```text
unlockIntentId
resultId
channel
status
errorCode
elapsedMs
```

Forbidden:

```text
raw input
LINE message text
email
LINE display name
full result JSON
provider output
secrets
```

## Tests

Add/update tests for:

```text
fulfillment code generation and expiry
unlock token generation and validation
unlock intent API returns fulfillment fields
unlocked route accepts valid token
unlocked route rejects expired/invalid token
LIFF bind route validates intent/token
LINE webhook signature verification
LINE webhook rejects invalid signature
LINE webhook matches short code
LINE webhook ignores unsupported message type
LINE webhook replies invalid-code safely
ContactCapture / fulfillment panel copy
event metadata safety
```

Update local Playwright if UI flow changes:

```text
unlock panel shows LIFF CTA
short code fallback appears
Email fallback still available
LINE CTA config remains env-driven
```

## Live Verification Gates

### Gate A: Code + tests

Always required:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
cd apps/web && corepack pnpm test:e2e:local
```

### Gate B: Staging smoke

Only if staging/test OA env is configured.

Use test OA / staging LIFF.

Verify:

```text
staging result page
unlock creates fulfillment code/token
fulfillment panel shows LIFF CTA + short code
LIFF page loads
webhook route rejects bad signature
webhook route accepts valid test payload if possible
short-code path replies/link generation if test OA can be used
unlocked route loads
no raw input in events
```

### Gate C: Production smoke

Only after staging smoke passes and production env is configured.

Use real OA with synthetic result.

Verify:

```text
production unlock creates fulfillment code/token
production LIFF / short code smoke
LINE reply delivers unlocked link
unlocked route loads
privacy event scan passes
```

Keep production smoke minimal.

If live LINE smoke cannot be completed, document exact missing setup.

## Docs Updates

Update:

```text
apps/web/README.md
docs/operations/production-deployment-runbook.md
ai-collaboration/research/line/line-fulfillment-env-matrix.md
ai-collaboration/research/line/line-oa-staging-setup.md
ai-collaboration/research/line/line-oa-production-setup.md
```

Only update setup docs if files exist.

Document:

```text
required env vars
LINE Console setup
LIFF primary path
short-code fallback
smoke checklist
known limitations
```

Do not write secret values.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-21-line-fulfillment-automation-mvp-v0-review-bundle.md
```

Required sections:

```markdown
# LINE Fulfillment Automation MVP v0 Review Bundle

Date: 2026-05-21

## 1. Summary

## 2. Architecture Used

## 3. Schema / Migration Changes

## 4. Routes / APIs Added

## 5. LIFF Path

## 6. Short-code Fallback Path

## 7. Unlocked Result Route

## 8. Copy Changes

## 9. Security / Privacy

## 10. Events / Metrics

## 11. Tests Added

## 12. Staging Smoke

## 13. Production Smoke

## 14. Known Limitations

## 15. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-line-fulfillment-automation-mvp-v0-execution-report.md
```

Report structure:

```markdown
# LINE Fulfillment Automation MVP v0 Execution Report

## Summary

## Files Created

## Files Updated

## Schema / Migration Changes

## Routes / APIs

## UI / Copy Changes

## LINE / LIFF Integration

## Security / Privacy

## Tests Added

## Validation Results

## Staging Smoke

## Production Smoke

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
- fulfillment path summary
- validation result
- staging smoke status
- production smoke status
- commit hash
- staging push status

## Constraints

Do not implement:

```text
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

## Production Notes

If this task adds DB migration:

```text
Document migration requirement.
Do not assume production is updated.
Apply staging first, then production only after staging smoke if execution plan includes live activation.
```

If production smoke requires LINE Console actions:

```text
Document exact pending action and stop before claiming production fulfillment is live.
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "feat: add line fulfillment automation"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files/test artifacts/raw JSONL are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- schema/migration summary
- LIFF path summary
- short-code fallback summary
- unlocked route summary
- security/privacy summary
- tests added
- validation results
- staging smoke status
- production smoke status
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
