# Handoff: Two-tier Free/Paid Result + LINE Fulfillment Architecture v0

Date: 2026-05-25

Project: anyu-next / 暗語 ANYU

## Objective

Design the next architecture shift for Module 01: split free result generation from paid result generation, and integrate that two-tier model with LINE fulfillment and future paywall readiness.

This task should define how ANYU can move from:

```text
current: analyze generates free + paid result together
```

to:

```text
future: free result generates first, paid result generates only after unlock / LINE / payment intent
```

The goal is to reduce first-result latency and unnecessary paid-result generation cost, while preserving high-quality paid output for users who actually enter the unlock/fulfillment funnel.

This is an architecture / product systems planning task only.

Do not implement code.

Do not change prompt/schema code.

Do not change DB schema.

Do not change LINE fulfillment code.

Do not change production behavior.

Do not start ads or payment integration.

## Background

Current state:

```text
Module 01 production low-key launch: GO
Paid result v2: implemented and staging reviewed
Semantic validation: implemented
LINE fulfillment MVP: implemented
Staging short-code fulfillment: passed
Production app/database activation: partially complete
Webhook verification fix: complete
Analyze hotfix: production analyze restored but fresh analyze takes ~60–70s
```

Recent issue:

```text
Paid result v2 made unlocked value much better, but fresh analyze now often takes 60–70s.
Hotfix raised route/client timeout and made paid result concise, but analyze remains synchronous and close to timeout ceilings.
```

User strategic concern:

```text
Current flow generates paid result for every free analysis, even though actual paid/LINE extraction may be much lower, possibly under 5%.
This wastes provider cost and increases latency for free users.
```

User direction:

```text
Explore two-tier generation:
- free result first, faster and cheaper
- paid result generated only after unlock / LINE bind / payment intent
- LINE is not only delivery; it is future owned channel and acquisition channel
- mobile should maximize LINE friend conversion with LIFF/in-app support
- desktop should use QR/short-code fallback
- future paywall should insert between intent and paid generation
```

## Scope

Do:

1. Define two-tier free/paid generation target architecture.
2. Define current vs future flow.
3. Define free result content boundary.
4. Define paid result trigger timing.
5. Define LINE friend acquisition strategy before payment.
6. Define first LINE friend free-complete-analysis strategy.
7. Define mobile LIFF flow and desktop short-code flow.
8. Define future paywall insertion point.
9. Define DB/schema implications.
10. Define cache implications.
11. Define LINE fulfillment state changes.
12. Define payment-state implications without choosing a final provider.
13. Define failure/retry handling.
14. Define cost/latency model.
15. Define phased implementation roadmap.
16. Create architecture report, execution report, summary log.
17. Commit and push to `origin/staging`.

Do not:

- implement two-tier generation
- implement payment
- implement provider integration
- implement new LINE flow
- change current production behavior
- change prompt/schema code
- change DB schema
- deploy production
- run provider calls
- start ads

## Required Architecture Report

Create:

```text
ai-collaboration/research/2026-05-25-two-tier-free-paid-line-fulfillment-architecture-v0.md
```

Required sections:

```markdown
# Two-tier Free/Paid Result + LINE Fulfillment Architecture v0

Date: 2026-05-25

## 1. Summary

## 2. Current Problem

## 3. Current Flow

## 4. Target Two-tier Flow

## 5. Free Result Boundary

## 6. Paid Result Boundary

## 7. Trigger Points: Unlock, LINE, Payment

## 8. LINE Friend Acquisition Strategy

## 9. First LINE Friend Free Unlock Strategy

## 10. Mobile LIFF Flow

## 11. Desktop / QR / Short-code Flow

## 12. Future Paywall Flow

## 13. Data Model / Schema Implications

## 14. Cache Strategy

## 15. Fulfillment State Machine

## 16. Failure / Retry Handling

## 17. Cost / Latency Model

## 18. Security / Privacy Notes

## 19. Analytics / Metrics

## 20. Implementation Phases

## 21. What Not To Build Yet

## 22. Open Questions

## 23. Recommended Next Step
```

## Architecture Direction

### Current flow

Document current flow:

```text
user submits input + optional context
→ analyze route calls provider
→ provider generates free result + paid result
→ result persisted
→ free result shown with paid preview
→ user may or may not click unlock / LINE
```

Problems:

```text
- first response latency includes paid result generation
- paid result cost spent even when user never unlocks
- synchronous HTTP request is near timeout ceiling
- paid conversion/LINE extraction likely lower than paid generation rate
```

### Target two-tier flow

Recommended target:

```text
Tier 1:
user submits input + optional context
→ generate free result only
→ return result quickly
→ show free result + paid teaser

Tier 2:
user clicks unlock / LINE / payment intent
→ create or update unlockIntent
→ generate paid result if not already completed
→ deliver unlocked link via web/LINE
```

## Free Result Boundary

Define free result as:

```text
fast
useful
emotionally resonant
not gutted
conversion-oriented
```

Free result should include:

```text
temperature score
core interpretation
3 signal cards
soft next-step teaser
paid teaser
```

Free result should not include:

```text
full 3-state analysis
6 copyable messages
full 48-hour action plan
summary card
```

This keeps value split clear:

```text
free = understand
paid = act
```

## Paid Result Boundary

Paid result should remain high quality and possibly longer than current concise hotfix if generated after unlock.

Paid result includes:

```text
3 possible states
3 signal deep dives
3 reply strategies
6–9 copyable messages
48-hour action plan
avoid list
soft insight
summary card
```

Paid generation can use same context chips.

Do not generate paid result for every free user.

## Trigger Points

Define possible paid generation trigger options:

### Option A: trigger on paid/unlock click

```text
user clicks unlock CTA
→ generate paid result
```

Pros:

```text
captures intent early
works during free beta / no real payment
```

Cons:

```text
still generates for users who click but do not pay in future
```

### Option B: trigger on LINE bind

```text
user completes LINE friend/bind
→ generate paid result
```

Pros:

```text
only generates for users who gave owned-channel value
aligns with first-free-LINE strategy
```

Cons:

```text
adds wait after LINE bind
```

### Option C: trigger on payment success

```text
payment webhook succeeds
→ generate paid result
```

Pros:

```text
best cost discipline for paid era
```

Cons:

```text
must handle paid generation delay/failure after payment
```

Recommended phased approach:

```text
Phase 1 no real payment: trigger paid generation after LINE bind / short-code match.
Phase 2 fake-door/payment-intent: trigger after payment intent or LINE friend depending experiment.
Phase 3 real payment: trigger after payment success.
```

## LINE Friend Acquisition Strategy

LINE should be treated as owned channel, not just delivery.

Design principle:

```text
Do not block free result behind LINE.
Do encourage LINE before paid result delivery.
```

Recommended touchpoints:

```text
- after free result: save/get full analysis via LINE
- paid teaser: use LINE to receive complete analysis
- waiting state: join LINE to be notified when complete
- future: reactivation for new modules
```

## First LINE Friend Free Unlock Strategy

Explore:

```text
First LINE friend = one free complete analysis
```

Recommended rationale:

```text
- LINE friend value may exceed one NT$49 unlock in early stage
- gives users a real value exchange
- reduces friction before real paywall
- improves trust before future paid modules
```

Minimum tracking:

```text
line_user_id
first_free_fulfillment_used_at
free_unlock_source
```

Avoid full account system.

Open question:

```text
Should first-free be per LINE user, per device/session, or per result?
```

Recommendation:

```text
Per verified LINE user, once.
```

## Mobile LIFF Flow

Mobile-first flow should maximize LINE friend conversion.

Recommended mobile flow:

```text
free result
→ 用 LINE 領取完整分析
→ open LIFF
→ bind LINE user
→ if first free unlock eligible:
     generate paid result
     show/generate pending state
     send link when ready
   else:
     show paywall/payment flow or paid intent state
```

Mobile UX notes:

```text
- use LINE in-app browser friendly copy
- detect LIFF availability
- fall back to short code if LIFF fails
- avoid forcing desktop-like QR flow on mobile
```

## Desktop / QR / Short-code Flow

Desktop flow:

```text
free result
→ show QR/add URL
→ show short code
→ user sends code to OA on phone
→ bind LINE user
→ trigger paid generation / fulfillment
```

Desktop should make short code feel intentional, not broken.

## Future Paywall Flow

Preferred future paywall:

```text
free result
→ paid teaser
→ checkout NT$49
→ payment success webhook
→ paid generation starts
→ web waiting/polling + optional LINE notification
→ unlocked result
```

LINE can be optional before payment:

```text
- save result
- receive paid result notification
- first-friend free unlock
```

Payment should not depend on LINE identity.

LINE delivery should be a convenience/retention layer.

## Data Model / Schema Implications

Propose future fields.

### analysis_results

Potential fields:

```text
free_result_json
paid_result_json nullable
paid_result_status: not_requested / queued / processing / completed / failed
paid_result_requested_at
paid_result_started_at
paid_result_completed_at
paid_result_error_code
paid_result_prompt_version
paid_result_schema_version
```

Alternative:

```text
separate analysis_paid_results table
```

Recommend whichever fits current schema best after inspection.

### unlock_intents

Potential additions or use existing:

```text
unlock_reason: line_first_free / payment / beta_free / operator_test
payment_status: not_started / pending / paid / failed / refunded
paid_generation_status
fulfillment_status
line_user_id
first_free_eligible
```

### payment_records later

Future table:

```text
payment_records
- provider
- provider_payment_id
- checkout_session_id
- amount
- currency
- status
- paid_at
- refunded_at
- result_id
- unlock_intent_id
```

Do not implement now.

## Cache Strategy

Two caches or layered cache:

```text
free_result cache:
  input + context + freePromptVersion + freeSchemaVersion + model

paid_result cache:
  resultId or normalized input + context + paidPromptVersion + paidSchemaVersion + model
```

Important:

```text
Free result cache hit should not require paid result exists.
Paid result can be generated later and cached separately.
```

Open question:

```text
Should paid result reuse free result interpretation as input?
```

Likely yes:

```text
paid generation should receive free result summary + original normalized input + context
```

This may improve coherence while keeping paid generation separate.

## Fulfillment State Machine

Define state machine.

Suggested:

```text
unlockIntent:
  created
  line_binding_pending
  line_bound
  payment_pending
  paid_generation_pending
  paid_generation_processing
  paid_ready
  delivered
  failed
  expired
```

Keep implementation simpler if possible.

Key cases:

```text
LINE bound + paid ready → send link immediately
LINE bound + paid pending → reply "正在整理" and send link later
payment paid + no LINE → web polling page
payment paid + LINE bound → send when ready
paid generation failed → safe failure / retry / manual fallback
```

## Failure / Retry Handling

Must handle:

```text
free generation fails
LINE bind succeeds but paid generation fails
payment succeeds but paid generation fails
LINE delivery fails
user loses page
user repeats same unlock
```

Recommended v0:

```text
one safe provider retry for paid generation later
if still fails, show "收到，我們稍後補送" and keep operator/manual fallback possible
```

Do not implement yet.

## Cost / Latency Model

Compare current vs two-tier.

Example model:

```text
100 free analyses
5 unlock/LINE intents
2 real payments later
```

Current:

```text
100 full free+paid generations
```

Two-tier beta:

```text
100 free generations
5 paid generations after LINE/unlock
```

Two-tier paid:

```text
100 free generations
2 paid generations after payment success
```

Expected benefits:

```text
first result latency down
provider cost down
paid result can stay high quality
browser timeout risk reduced
```

## Security / Privacy Notes

Two-tier must preserve:

```text
no raw input in LINE messages
no raw provider output in events
tokens not logged
LINE user ID not in event metadata
paid result not generated for expired/invalid intents
payment webhook verification when introduced
```

## Analytics / Metrics

Track:

```text
free analyze started/completed/failed
free result latency
unlock clicked
LINE bind started/completed
first-free unlock used
paid generation started/completed/failed
paid generation latency
paid delivered
paid opened
payment started/succeeded/failed later
```

Avoid raw content.

## Implementation Phases

Recommend phases:

### Phase 1: Two-tier beta without real payment

```text
free result generated first
paid result generated only after LINE bind/unlock
LINE sends link when paid result ready
no real payment
```

### Phase 2: First LINE friend free unlock

```text
per-line-user first free paid result
basic eligibility tracking
```

May be combined with Phase 1 if low risk.

### Phase 3: Future paywall

```text
payment provider integration
payment success triggers paid generation
LINE/web delivery
```

### Phase 4: Growth readiness

```text
ads
A/B free vs LINE-first CTA
payment conversion
retention/re-activation
```

## Payment Provider Placeholder

Do not choose final provider in this task.

Mention candidates for future evaluation:

```text
NewebPay
ECPay
LINE Pay
```

Recommend separate:

```text
Payment Provider Evaluation v0
```

## What Not To Build Yet

Do not build:

```text
real payment
payment provider integration
full account system
portal
LINE broadcast automation
rich menu
long-term personal insight graph
Module 02 implementation
complex queue platform unless required
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-25-two-tier-free-paid-line-fulfillment-architecture-v0-execution-report.md
```

Report structure:

```markdown
# Two-tier Free/Paid Result + LINE Fulfillment Architecture v0 Execution Report

## Summary

## Files Created

## Files Updated

## Architecture Decisions

## Recommended Flow

## Data / Cache Implications

## LINE / Fulfillment Implications

## Paywall Implications

## Cost / Latency Assessment

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
- key recommendation
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

Docs/planning only; no Playwright needed unless app code changes.

## Constraints

Do not implement:

```text
two-tier generation
payment provider integration
DB schema changes
LINE code changes
prompt/schema changes
production deploy
ads launch
real payment
email delivery
rich menu
broadcast
portal/account system
new second-call LLM generation
model switch
queue/worker
SSE/websocket/token streaming
Module 02
```

Do not modify:

```text
active production app code
product prompt/schema semantics
provider/model defaults
legal semantics
LINE production behavior
production ops behavior
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
git commit -m "docs: plan two-tier fulfillment architecture"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- architecture path
- recommended two-tier flow
- LINE friend acquisition strategy
- first LINE friend free unlock recommendation
- future paywall flow
- cost/latency assessment
- implementation phases
- validation results
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
