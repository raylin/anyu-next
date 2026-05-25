# Handoff: Two-tier Free Analyze + Deferred Paid Generation v0 Implementation Plan

Date: 2026-05-25

Project: anyu-next / 暗語 ANYU

## Objective

Create a schema-aware implementation plan for moving Module 01 from synchronous free+paid generation to a two-tier model:

```text
Tier 1: free analyze generates fast free result first
Tier 2: paid result generates later only after unlock / LINE bind / future payment success
```

This task should inspect the current schema, prompt/schema assets, cache, analyze route, unlock intent, LINE fulfillment routes, and result rendering to propose a safe implementation plan.

This is a planning task only.

Do not implement code.

Do not change DB schema.

Do not change prompt/schema code.

Do not change LINE fulfillment behavior.

Do not deploy production.

Do not start ads or payment integration.

## Background

Two-tier Free/Paid Result + LINE Fulfillment Architecture v0 completed.

Key architecture decisions:

```text
- Current coupled free+paid generation causes 60–70s fresh analyze latency.
- Paid result generation is currently paid even for users who never unlock.
- Target architecture: free result first, paid result deferred.
- Phase 1 beta trigger: LINE bind / short-code match starts paid generation.
- Future paywall trigger: payment success starts paid generation.
- LINE should be owned-channel acquisition/retention infrastructure, not just delivery.
- First LINE friend free unlock is a promising growth lever.
```

Current production context:

```text
Module 01 low-key production: live
Paid result v2: implemented
LINE fulfillment MVP: production app/database activated route-level, real OA short-code smoke pending LINE console/manual path
Analyze hotfix: fresh analyze restored but still near timeout ceilings
```

Recommended next step from architecture:

```text
Run a schema-aware Phase 1 implementation planning task before any DB migration or code changes.
```

## Key Questions To Answer

This plan must answer:

```text
1. Should first-free unlock be per LINE user globally or per module?
2. Should Phase 1 paid generation trigger automatically after LINE bind/short-code match, or require an explicit claim action?
3. Should paid result live as nullable fields in analysis_results or in a separate analysis_paid_results table?
4. How should free cache and paid cache be split?
5. How should LINE fulfillment behave when paid result is pending?
6. What migrations are needed?
7. What routes/APIs change?
8. What tests are needed?
9. What rollout/staging/production gates are needed?
10. What can be safely implemented in one phase versus split?
```

## Scope

Do:

1. Inspect current DB schema and migrations.
2. Inspect current `analysis_results`, `analysis_requests`, `unlock_intents`, fulfillment fields.
3. Inspect current analyze route.
4. Inspect current result cache implementation.
5. Inspect current paid result schema/prompt assets.
6. Inspect current LINE fulfillment routes and unlocked route.
7. Propose concrete DB/schema plan.
8. Propose concrete API/route changes.
9. Propose prompt/schema split plan.
10. Propose cache split plan.
11. Propose LINE fulfillment pending/completed behavior.
12. Propose first LINE friend free unlock policy.
13. Propose failure/retry behavior.
14. Propose analytics/events.
15. Propose phased implementation sequence.
16. Create implementation plan report, execution report, summary log.
17. Commit and push to `origin/staging`.

Do not:

- implement migrations
- implement route/code changes
- implement prompt/schema changes
- change production
- run provider calls
- run migrations
- touch LINE Console/env
- start ads
- add payment integration

## Source Inputs

Read these docs/reports if present:

```text
ai-collaboration/research/2026-05-25-two-tier-free-paid-line-fulfillment-architecture-v0.md
ai-collaboration/reports/2026-05-25-two-tier-free-paid-line-fulfillment-architecture-v0-execution-report.md
ai-collaboration/reports/2026-05-25-analyze-timeout-diagnosis-hotfix-v0-execution-report.md
ai-collaboration/reports/2026-05-25-line-fulfillment-production-activation-v0-execution-report.md
ai-collaboration/reports/2026-05-21-paid-result-prompt-safety-value-refinement-v0-execution-report.md
```

Inspect implementation files as needed:

```text
apps/web/src/lib/db/schema.ts
apps/web/drizzle/*.sql
apps/web/src/app/api/modules/[moduleSlug]/analyze/route.ts
apps/web/src/app/api/unlock-intent/route.ts
apps/web/src/app/api/line/fulfillment/bind-liff/route.ts
apps/web/src/app/api/line/webhook/route.ts
apps/web/src/app/m/[moduleSlug]/unlock/[unlockToken]/page.tsx
apps/web/src/lib/ai/*
apps/web/src/lib/ai/assets/*
apps/web/src/lib/ai/result-cache.ts
apps/web/src/lib/modules/ai-temperature*
```

Adjust paths based on actual repo.

## Recommended Policy Defaults

Use these as starting defaults; validate against schema/code.

### First-free unlock scope

Preferred recommendation unless schema inspection argues otherwise:

```text
Per verified LINE user per module once.
```

Rationale:

```text
- More generous than global once.
- Supports future module family.
- Still prevents unlimited free full analyses for the same module.
```

### Phase 1 trigger

Preferred recommendation:

```text
Paid generation starts automatically after LINE bind / short-code match if paid result is not already completed.
```

Rationale:

```text
- Reduces friction.
- LINE friend has already provided owned-channel value.
- Fits current free beta / no real payment state.
```

### Future payment trigger

Preferred future behavior:

```text
Payment success webhook triggers paid generation.
```

Do not implement now.

## Data Model Decision

Evaluate two options.

### Option A: nullable paid fields on `analysis_results`

Possible fields:

```text
free_result_json
paid_result_json nullable
paid_result_status
paid_result_requested_at
paid_result_started_at
paid_result_completed_at
paid_result_failed_at
paid_result_error_code
paid_result_prompt_version
paid_result_schema_version
```

Pros:

```text
simpler
fewer joins
fits current result page
```

Cons:

```text
analysis_results grows
free/paid lifecycle mixed
future multi-paid variants harder
```

### Option B: separate `analysis_paid_results` table

Possible table:

```text
analysis_paid_results
- id
- analysis_result_id
- module_slug
- paid_result_json
- status
- requested_by_unlock_intent_id
- requested_reason
- prompt_version
- schema_version
- model
- started_at
- completed_at
- failed_at
- error_code
- retry_count
- retention_expires_at
```

Pros:

```text
clean lifecycle separation
supports retries/history
easier future paid variants
cleaner retention policy
```

Cons:

```text
more implementation work
more joins
more migration complexity
```

The plan should recommend one.

Given future payment/fulfillment direction, prefer Option B if not too costly.

## Free Result Schema

Plan how to split current result schema.

Free result should include:

```text
temperature score
core interpretation
signal cards
soft next step
paid teaser
share summary
```

Free result should not require paid result.

The plan should identify whether current schema can be split into:

```text
freeResult
paidResult
```

or if current result shape needs compatibility adapter.

## Paid Result Generation

Define paid generation input.

Recommended inputs:

```text
original normalized input / redacted input
userContext
free result summary/signals
moduleSlug
prompt/schema versions
```

Paid generation should not require a second raw user submission.

The plan should decide whether to store enough safe normalized input to generate paid later, or whether existing retained request/result records are sufficient.

Important privacy question:

```text
If raw input is scrubbed by retention before paid generation, paid generation should fail safely or no longer be available.
```

## Cache Strategy

Propose:

```text
free cache key = normalized input + userContext + freePromptVersion + freeSchemaVersion + model
paid cache key = normalized input + userContext + paidPromptVersion + paidSchemaVersion + model
```

or:

```text
paid result tied to free result ID and generated once per result.
```

Need to answer:

```text
Should two different users with identical input/context share paid cache?
```

Recommendation likely:

```text
Use existing privacy-safe hash cache for free result.
For paid result, reuse if same cache key and retention-valid, but be careful with unlock/user-specific fulfillment state.
```

## LINE Fulfillment Behavior

Current fulfillment assumes paid result exists.

Two-tier behavior should support:

```text
LINE bound + paidResult completed → send unlocked link immediately
LINE bound + paidResult missing → start paid generation and reply "正在整理"
paidResult completed later → send link
paidResult failed → send safe failure/retry message or show web fallback
```

Define exact v0 behavior.

Suggested LINE pending reply:

```text
收到，我正在整理你的完整分析。大約需要 30–60 秒，完成後會把連結傳給你。
```

If worker/async delivery is not yet available, plan the smallest viable method.

## Async / Worker Consideration

Two-tier paid generation likely still needs background work.

Evaluate options:

```text
A. Generate paid result synchronously during LINE webhook response
B. Generate paid result synchronously after LIFF bind, then return link
C. Queue/background job
D. Web polling page after unlock
```

Important:

```text
LINE webhook response should not block too long.
If paid generation takes 60s, responding inside webhook may fail or feel bad.
```

The plan should recommend a reliable approach.

Likely recommendation:

```text
Phase 1A: Web/LIFF bind can start paid generation with web waiting/polling.
Phase 1B: LINE short-code path replies pending immediately, queue/processes paid generation, then pushes link.
```

If queue service is required, evaluate minimally but do not choose vendor unless necessary.

## API / Route Plan

Define future routes/actions.

Possible new/updated routes:

```text
POST /api/modules/[moduleSlug]/analyze/free
POST /api/modules/[moduleSlug]/paid-result/request
GET /api/modules/[moduleSlug]/paid-result/[paidResultId]/status
POST /api/line/fulfillment/bind-liff
POST /api/line/webhook
GET /m/[moduleSlug]/unlock/[unlockToken]
```

Or adapt existing routes if better.

The plan should propose names compatible with current code style.

## Failure / Retry

Plan handling for:

```text
free generation failure
paid generation failure
semantic validation failure
provider timeout
LINE delivery failure
duplicate unlock request
duplicate LINE webhook event
expired unlock token
retention expiry before paid generation
```

Recommend:

```text
one safe retry for paid generation eventually
manual/operator fallback later if paid user affected
```

Do not implement now.

## Analytics / Events

Plan safe events:

```text
free_analysis_started
free_analysis_completed
free_analysis_failed
paid_generation_requested
paid_generation_started
paid_generation_completed
paid_generation_failed
first_line_free_unlock_used
paid_delivery_pending
paid_delivery_completed
```

Metadata must not include raw input, full result JSON, LINE IDs, tokens, codes, emails, or secrets.

## Retention / Cleanup

Plan retention implications for:

```text
analysis_paid_results
line_webhook_events
line_webhook_rate_limits
unlock_intents
payment_records later
```

Do not implement cleanup now.

## Implementation Phases

Break into phases.

Recommended:

### Phase 1: Schema + service planning implementation

```text
add paid_result_status / separate table
separate free vs paid generation services
no behavior switch yet
```

### Phase 2: Free-first analyze

```text
analyze returns free result only
paid teaser remains
cache split begins
```

### Phase 3: Deferred paid generation on LINE bind

```text
LINE bind triggers paid generation
pending reply/link behavior
unlocked route handles pending/completed
```

### Phase 4: First LINE friend free unlock

```text
eligibility tracking per LINE user per module
```

### Phase 5: Paywall

```text
payment provider integration
payment success triggers paid generation
```

If Codex thinks phases can be safely combined, recommend a combined MVP and explain why.

## Required Implementation Plan Report

Create:

```text
ai-collaboration/research/2026-05-25-two-tier-free-analyze-deferred-paid-generation-v0-implementation-plan.md
```

Required sections:

```markdown
# Two-tier Free Analyze + Deferred Paid Generation v0 Implementation Plan

Date: 2026-05-25

## 1. Summary

## 2. Current Code / Schema Findings

## 3. Recommended Data Model

## 4. Free Result Schema Plan

## 5. Paid Result Schema / Storage Plan

## 6. Cache Split Plan

## 7. Analyze Route Changes

## 8. Paid Generation Trigger Plan

## 9. LINE Fulfillment Changes

## 10. First LINE Friend Free Unlock Policy

## 11. Async / Worker Recommendation

## 12. Failure / Retry Plan

## 13. Events / Analytics Plan

## 14. Retention / Cleanup Implications

## 15. Implementation Phases

## 16. Migration Plan

## 17. Testing Plan

## 18. Rollout / Staging / Production Plan

## 19. Risk Assessment

## 20. Open Questions

## 21. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-25-two-tier-free-analyze-deferred-paid-generation-v0-implementation-plan-execution-report.md
```

Report structure:

```markdown
# Two-tier Free Analyze + Deferred Paid Generation v0 Implementation Plan Execution Report

## Summary

## Files Created

## Files Updated

## Schema Findings

## Architecture Recommendation

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
- implementation plan path
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

Docs/planning only; no Playwright needed unless code changes.

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
git commit -m "docs: plan deferred paid generation"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- implementation plan path
- data model recommendation
- free/paid split recommendation
- cache split recommendation
- LINE fulfillment changes
- async/worker recommendation
- implementation phases
- validation results
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
