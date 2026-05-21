# Handoff: LINE Fulfillment Automation Architecture v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Design the architecture for an automated LINE fulfillment flow for Module 01 — 曖昧溫度計.

The goal is to close the paid-intent / LINE funnel gap before any ads or broader growth work.

This architecture should support an aggressive but controlled MVP:

```text
Mobile-first: LIFF-based automatic binding / fulfillment
Desktop and fallback: short-code matching through LINE OA message
```

This is an architecture / implementation-planning task only.

Do not implement code in this task.

Do not change app runtime, DB schema, UI, LINE settings, legal text, production env, or production behavior in this task.

## Background

Current state:

```text
Module 01 production low-key launch: GO
UI polish: sealed
Local Playwright smoke: passing
Result cache: live verified
Scheduled retention cleanup: live
Analyze request state / poll endpoint: live verified
LINE-first funnel: live, but currently notification-oriented
```

Current user concern:

```text
Growth/ads should not start while the LINE follow-up experience is weak.
If a user clicks unlock and joins LINE, they should receive value, ideally the complete analysis link.
```

User direction:

```text
Be more aggressive if risk is controllable.
Development cost is currently lower than wasted ads/funnel cost.
Explore short code + LIFF:
- short code for desktop/fallback
- LIFF for mobile-first conversion
```

Recommended direction:

```text
LINE Fulfillment Automation MVP:
- LIFF primary path for mobile users.
- Short code fallback for desktop / QR / non-LIFF / failed binding.
- Do not implement payment yet.
- Do not build full CRM, portal, rich menu, broadcast system, or membership platform.
```

## Scope

Do:

1. Review current LINE-first contact / unlock flow.
2. Review current `unlock_intents` schema and APIs.
3. Define the desired end-to-end fulfillment UX.
4. Define LIFF primary path.
5. Define short-code fallback path.
6. Define webhook behavior.
7. Define unlocked result route/token strategy.
8. Define DB schema changes.
9. Define env vars and LINE Console setup requirements.
10. Define privacy/security boundaries.
11. Define copy changes.
12. Define tests and production smoke plan.
13. Create architecture report, execution report, summary log.
14. Commit and push to `origin/staging`.

Do not:

- implement routes/components/schema
- add LINE SDK
- add webhook code
- change Vercel env
- change DB schema
- change production app
- change legal pages
- change payment behavior
- start ads
- send LINE messages
- call LINE API

## Current Flow To Review

Review relevant current files:

```text
apps/web/src/components/anyu/ContactCapture.tsx
apps/web/src/components/anyu/PaidPreviewCard.tsx
apps/web/src/components/modules/ai-temperature/AiTemperatureResult.tsx
apps/web/src/app/api/unlock-intent/route.ts
apps/web/src/lib/events/*
apps/web/src/lib/db/schema.ts
apps/web/src/content/legal.ts
docs/legal/ui-notices-v0.md
ai-collaboration/research/2026-05-20-line-funnel-strategy-v0.md
ai-collaboration/research/2026-05-20-line-funnel-ui-copy-implementation-plan-v0.md
ai-collaboration/research/2026-05-20-anyu-line-oa-setup-record-v0.md
```

Adjust paths based on actual repo.

## Desired Product Flow

### Current

```text
free result
→ unlock intent
→ LINE / Email fallback
→ opening notification
```

### Target MVP

```text
free result
→ unlock intent
→ user chooses LINE
→ mobile LIFF path or short-code fallback
→ system binds unlock intent
→ user receives / opens complete analysis link
```

Important:

```text
No real payment yet.
Still internal-test / fake-door compatible.
But user should receive a real “complete analysis” or unlocked result link.
```

## Fulfillment Paths

### Path A: Mobile-first LIFF

Goal:

```text
Fastest mobile conversion path.
```

Proposed flow:

```text
1. User clicks paid/unlock CTA.
2. App creates unlockIntent with resultId.
3. App shows LINE fulfillment panel:
   - primary CTA: 用 LINE 領取完整分析
4. CTA opens LIFF URL with unlockIntent token/code context.
5. LIFF app initializes.
6. User logs in / authorizes if needed.
7. LIFF obtains LINE user identity where available.
8. App calls backend bind endpoint.
9. Backend marks unlockIntent fulfilled/bound.
10. User is redirected to unlocked result page or shown link.
```

Architecture report should decide exact redirect strategy:

```text
Option A: LIFF redirects to /m/ambiguous-temperature/unlock/[unlockToken]
Option B: LIFF page itself confirms fulfillment and links back
Option C: backend sends LINE push message and LIFF opens web result
```

Prefer simplest robust path.

### Path B: Short-code fallback

Goal:

```text
Desktop / QR / non-LIFF / failed mobile binding fallback.
```

Proposed flow:

```text
1. User clicks unlock.
2. App generates a short fulfillment code.
3. User joins LINE OA.
4. LINE welcome/message asks user to paste short code.
5. User sends short code to OA.
6. /api/line/webhook receives message event.
7. Backend validates LINE signature.
8. Backend finds pending unlockIntent by code.
9. Backend binds lineUserId to unlockIntent.
10. Backend replies with complete analysis link.
```

Short code should:

```text
be short enough to type/paste
expire
be one-time or limited-use
not encode raw resultId
not be guessable enough for abuse
```

## Matching Strategy

Architecture should recommend final matching behavior.

Suggested:

```text
- unlockIntent gets both:
  - fulfillmentCode for short-code fallback
  - fulfillmentToken for unlocked web link
- LIFF path uses token context from URL and line identity.
- Short-code path uses message text code.
```

Avoid relying solely on LINE add-friend URL parameters unless confirmed reliable.

## Unlocked Result Route

Recommend route:

```text
/m/ambiguous-temperature/unlock/[unlockToken]
```

or equivalent.

Requirements:

```text
- token is not guessable
- token can expire
- route renders paid/unlocked content for associated result
- no raw input exposure
- handles expired/invalid token gracefully
- does not require auth in v0
```

Decide whether unlocked content is:

```text
A. currently hidden paid reply strategies from existing result
B. generated already but hidden in DB
C. needs new complete-analysis generation
```

Be explicit.

Preferred v0:

```text
Use already available result/premium preview data if present.
If full paid content is not yet generated, define minimal complete-analysis content that can be safely generated from existing result.
```

Do not implement in this task.

## DB / Schema Proposal

Review existing `unlock_intents`.

Recommend minimal fields, for example:

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

or a separate table:

```text
line_fulfillments
```

Pick the more maintainable option.

Guidance:

```text
If unlock_intents already owns this flow, extending it is likely simpler.
If LINE delivery needs separate audit/history, use a separate table.
```

Avoid storing unnecessary LINE profile info.

## Env Vars / LINE Setup

Identify required env vars.

Likely:

```text
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
NEXT_PUBLIC_LINE_LIFF_ID
NEXT_PUBLIC_LINE_LIFF_URL
NEXT_PUBLIC_LINE_ADD_URL
FULFILLMENT_TOKEN_SECRET or use existing app secret strategy
```

Clarify which are server-only vs public.

Line setup checklist:

```text
Create LINE Messaging API channel or confirm existing OA channel
Enable webhook
Set webhook URL
Verify webhook
Create LIFF app
Set LIFF endpoint URL
Configure scopes
Confirm mobile/desktop behavior
```

Do not perform setup in this task; document.

## Security Requirements

Must include:

```text
LINE webhook signature verification
server-only access token
no raw input in LINE messages
no secrets in logs/events
short-code expiry
token entropy
rate limit webhook attempts if practical
idempotent fulfillment
invalid/expired code safe response
```

LINE messages should not include sensitive raw user input.

## Privacy / Data Boundaries

Store only what is needed:

```text
line_user_id
unlockIntentId
resultId
fulfillment status/timestamps
```

Avoid:

```text
display name
profile picture URL
chat message content beyond code match
raw input
full result JSON in event metadata
```

If message text must be parsed, do not persist arbitrary message text.

## Copy Direction

Current copy is notification-oriented.

New copy should be fulfillment-oriented but still fake-door/internal-test safe.

Suggested primary CTA:

```text
用 LINE 領取完整分析
```

Support copy:

```text
目前內測中，這次不會真的收費。加入 LINE 後，我們會把完整分析連結送給你。
```

Fallback copy:

```text
如果沒有自動帶入，請把這組短碼貼給暗語 ANYU：
A7K2Q9
```

LINE welcome message:

```text
歡迎來到暗語 ANYU。
請貼上剛剛頁面上的短碼，我會把完整分析連結送給你。
```

LINE success reply:

```text
收到，這是你的完整分析連結：
{url}
```

Invalid code reply:

```text
我找不到這組短碼。請回到剛剛的結果頁重新產生一次，或改用 Email 接收。
```

Refine tone if needed.

## Email Fallback

Decide whether Email fallback also receives unlocked link.

Recommended:

```text
Yes. Email fallback should be aligned with the same fulfillment promise if implementation cost is manageable.
```

But if email sending is not implemented, document as:

```text
Email fallback remains capture-only until email delivery is explicitly implemented.
```

Do not implement email sending in this architecture task.

## Event / Metrics

Recommend safe events:

```text
fulfillment_liff_opened
fulfillment_liff_bound
fulfillment_code_shown
fulfillment_code_matched
fulfillment_link_delivered
fulfillment_failed
line_webhook_received
```

Metadata allowed:

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

## Testing Plan

Define tests for implementation phase:

```text
unit: code generation/expiry
unit: token generation/validation
unit: webhook signature verification
unit: code matching
unit: invalid/expired code
route: LIFF bind endpoint
route: webhook message event
route: unlocked result token
component: fulfillment panel copy
Playwright: unlock panel shows LIFF CTA + short code fallback
```

No implementation now.

## Production Smoke Plan

Define future smoke:

```text
staging:
- create result/unlock intent
- LIFF path test if LINE test channel available
- webhook signature test
- short code message test using LINE test user or mocked route
- unlocked route loads
- no raw input in events

production:
- one synthetic result
- one test LINE account
- one code match
- link delivery
- privacy event scan
```

## Risk Assessment

Include risk table:

```markdown
| Risk | Severity | Mitigation |
|---|---|---|
| LINE user cannot be matched | Medium | short-code fallback |
| LIFF desktop behavior inconsistent | Medium | desktop short-code path |
| webhook spoofing | High | signature verification |
| token guessing | High | high entropy token + expiry |
| raw content in LINE | Medium | send only link, not raw analysis text |
| user expects payment delivery | Medium | internal-test copy + no real charge |
```

## Required Architecture Report

Create:

```text
ai-collaboration/research/2026-05-21-line-fulfillment-automation-architecture-v0.md
```

Required sections:

```markdown
# LINE Fulfillment Automation Architecture v0

Date: 2026-05-21

## 1. Summary

## 2. Current Funnel Gap

## 3. Target MVP Flow

## 4. Mobile LIFF Path

## 5. Short-code Fallback Path

## 6. Matching Strategy

## 7. Unlocked Result Route

## 8. DB / Schema Proposal

## 9. API Routes Proposal

## 10. LINE Console / Env Requirements

## 11. Copy Direction

## 12. Email Fallback Decision

## 13. Security / Privacy Boundaries

## 14. Event / Metrics Plan

## 15. Testing Plan

## 16. Production Smoke Plan

## 17. Risk Assessment

## 18. Implementation Scope Recommendation

## 19. What Not To Build Yet

## 20. Open Questions

## 21. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-line-fulfillment-automation-architecture-v0-execution-report.md
```

Report structure:

```markdown
# LINE Fulfillment Automation Architecture v0 Execution Report

## Summary

## Files Created

## Files Updated

## Architecture Decisions

## Required Env / LINE Setup

## Implementation Recommendation

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
- architecture path
- key decision: LIFF + short-code dual path
- validation result
- commit hash
- staging push status

## Validation

Run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

This is planning/docs only, but validation should still pass.

No need to run Playwright unless app code changes, which should not happen.

## Constraints

Do not implement:

```text
LINE webhook
LIFF app
DB schema migration
unlock route
email sending
ads launch
real payment
auth
portal
model switch
queue/worker
SSE
websocket
token streaming
UI changes
```

Do not modify:

```text
active production app code
product prompt/schema semantics
provider/model defaults
legal semantics
LINE funnel behavior
production ops behavior beyond docs/planning
design system direction
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
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
git commit -m "docs: plan line fulfillment automation"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files/test artifacts/raw JSONL are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- architecture path
- LIFF path summary
- short-code fallback summary
- DB/schema recommendation
- route/env recommendations
- security/privacy notes
- implementation recommendation
- validation results
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
