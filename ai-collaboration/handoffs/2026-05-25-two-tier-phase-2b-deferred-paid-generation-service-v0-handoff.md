# Handoff: Two-tier Phase 2B Deferred Paid Generation Service v0

Date: 2026-05-25

Project: anyu-next / 暗語 ANYU

## Objective

Implement the deferred paid-result generation service for Module 01 after Phase 2A free-only analyze compatibility.

This task should allow a paid result to be generated after a user expresses unlock intent, without reverting the initial analyze request back to full free+paid generation.

The goal is to establish the paid generation lifecycle and service path before wiring LINE bind / short-code delivery fully in Phase 3.

This is a behavior implementation task for paid generation, but it should remain controlled and staging-first.

Do not activate production.

Do not wire LINE webhook to trigger paid generation in this task unless explicitly low-risk and scoped as route-level only.

Do not implement real payment, email delivery, ads, or Module 02.

## Background

Two-tier Phase 2A Free-only Analyze Compatibility v0 completed.

Commit:

```text
f4f55ec
```

What changed:

```text
- Module 01 analyze now generates free-only results.
- product_result_prompt_free_v0.1 and product_result_schema_free_v1 added.
- Initial analyze no longer creates paid_result.
- Initial analyze no longer creates analysis_paid_results shadow row.
- Result page, unlock intent, unlocked route, and LIFF route tolerate missing paid content.
- Staging fresh analyze improved to about 20.7s from prior 60–70s.
- Cache hit about 1.5s.
- Production was not deployed.
```

Current gap:

```text
Paid result is not generated after unlock yet.
Unlocked route currently shows pending compatibility copy when paid content is missing.
LINE fulfillment can reach an unlocked route, but full paid content is not produced in the free-only path.
```

Recommended next step:

```text
Two-tier Phase 2B Deferred Paid Generation Service v0
```

Later phase:

```text
Two-tier Phase 3 LINE Bind Trigger + Delivery v0
```

## Scope

Do:

1. Review current free-only result shape and analysis result storage.
2. Review current analysis_paid_results table and paid-result repository helpers.
3. Implement a deferred paid-result generation service.
4. Add a route/API to request paid generation for an existing result/unlock intent.
5. Use existing original input/context/free result safely to generate paidResult v2.
6. Store generated paid result in analysis_paid_results.
7. Add paid generation status lifecycle.
8. Update unlocked route to render processing/completed/failed paid states.
9. Ensure duplicate paid-generation requests are idempotent.
10. Preserve initial analyze free-only behavior.
11. Add tests.
12. Run staging synthetic smoke.
13. Create review bundle, execution report, summary log.
14. Commit and push to `origin/staging`.

Do not:

- switch back to full free+paid analyze
- trigger paid generation from LINE webhook yet unless route-level test only
- make LINE webhook wait for provider generation
- implement real payment
- implement email delivery
- start ads
- implement Module 02
- change model/provider defaults unless a blocker is found and documented
- deploy production unless explicitly approved after staging

## Core Design

Desired Phase 2B flow:

```text
free analyze completed
→ result page shows free result + paid teaser
→ user clicks unlock
→ unlockIntent exists
→ paid generation can be requested for that result
→ analysis_paid_results status = processing
→ provider generates paidResult v2
→ semantic validation passes
→ analysis_paid_results status = completed
→ unlocked route shows paid result
```

If paid generation is still running:

```text
unlocked route shows processing/pending state
```

If paid generation fails:

```text
unlocked route shows safe retry/failure state
```

## Trigger Point For Phase 2B

Implement one safe trigger.

Preferred:

```text
POST /api/modules/[moduleSlug]/paid-result/request
```

or an equivalent route aligned with repo style.

It should accept:

```text
resultId
unlockIntentId or unlockToken if needed
```

It should:

```text
validate result exists
validate unlock intent/token relationship if provided
create or reuse analysis_paid_results row
start paid generation if no completed/processing row exists
return paid generation status
```

Alternative:

```text
extend /api/unlock-intent to optionally request paid generation
```

Preferred if lower-risk:

```text
separate route first, then Phase 3 can call it from LINE bind/webhook.
```

Codex should inspect existing route style and pick the least invasive option.

## Paid Generation Input

Paid generation should use:

```text
- original input or retained/redacted input available in analysis_requests / analysis_results
- user_context_json from analysis_requests
- free result summary/signals from current free result
- moduleSlug / module config
- paid prompt/schema versions
```

Important:

```text
Do not require a new user submission.
Do not use raw input if it has already been scrubbed/expired.
If required source material is unavailable, fail safely.
```

If current schema lacks enough source material, document exactly what is missing and implement the safest available approach.

## Prompt / Schema

Use existing paid result v2 prompt/schema if possible.

Do not change paid schema unless required.

Paid result should still include:

```text
3 possible states
3 signal deep dives
3 reply strategies
6 copyable messages
48-hour plan
summary card
```

Use current semantic validation and same-model retry behavior where available.

If prompt needs a new paid-only wrapper, add:

```text
product_result_prompt_paid_v0.1
```

but avoid unnecessary schema churn.

## Status Lifecycle

Use `analysis_paid_results.status`.

Recommended states:

```text
pending
processing
completed
failed
expired
```

Phase 2B route behavior:

```text
no row → create processing / start generation
processing row → return processing
completed row → return completed + unlocked route
failed row → allow retry if safe or return failed
expired row → return expired
```

Ensure idempotency:

```text
duplicate requests should not create multiple completed rows for the same analysis_result_id / prompt/schema version
```

Add unique/index logic if needed and safe.

If schema already has no uniqueness constraint, document and handle in repository helper.

## Synchronous vs Async In Phase 2B

This task may implement paid generation synchronously from the paid-generation request route if simpler, but must document limitations.

Preferred if feasible:

```text
request route starts generation and waits only in web context, not LINE webhook context
```

Do not make LINE webhook wait 60s.

If true background execution is not available:

```text
Phase 2B can generate synchronously from a web/unlock route to prove service and storage.
Phase 3 should decide queue/background delivery for LINE.
```

This is acceptable as an intermediate step.

## Unlocked Route Behavior

Update:

```text
/m/ambiguous-temperature/unlock/[unlockToken]
```

to support:

```text
paid result completed → render paid content
paid result processing → render processing state
paid result missing/not requested → render pending/claim state
paid result failed → render safe failure/retry state
old full ProductResult with embedded paid_result → render legacy paid content
```

If route can trigger generation is tempting, avoid doing so unless explicitly low-risk. Prefer explicit request API.

## UI / Client Behavior

Minimal UI changes allowed.

Possible behavior:

```text
after unlock intent creation, call paid generation request route
then show "完整分析正在整理中"
poll paid result status or rely on unlocked route refresh
```

If adding polling is too much, keep Phase 2B route-level and unlocked route compatibility, and document Phase 3/2C UI follow-up.

Do not redesign landing/result page.

## Cache Behavior

Paid generation should not pollute free cache.

Recommended:

```text
free result cache remains free-only
paid result uses analysis_paid_results and/or paid cache key
```

If reusing provider cache helpers:

```text
include paidPromptVersion / paidSchemaVersion / userContext / model
```

Do not cause initial analyze to wait for paid generation.

## Retention

analysis_paid_results retention cleanup is now implemented.

Ensure new paid rows set:

```text
retention_expires_at
```

consistent with policy.

If not set, document and fix if low risk.

## Failure / Retry

Support safe retry behavior.

Minimum:

```text
if paid generation fails, status = failed, error_code safe category
duplicate request may retry if failed and retry_count below limit
```

Do not expose provider raw output.

Recommended retry:

```text
one same-model retry for output_validation if existing utility supports it
```

Do not overbuild.

## Event / Privacy Metadata

Add safe events if aligned with existing system:

```text
paid_generation_requested
paid_generation_started
paid_generation_completed
paid_generation_failed
```

Allowed metadata:

```text
resultId
unlockIntentId
status
errorCategory
retryCount
elapsedMs
```

Forbidden:

```text
raw input
redacted input text
full result JSON
paid_result_json
provider raw output
email
LINE user ID
fulfillment code
unlock token
tokenized URL
DATABASE_URL
ANTHROPIC_API_KEY
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
ANALYSIS_CACHE_HASH_SECRET
RETENTION_CLEANUP_SECRET
```

## Staging Smoke

Use staging synthetic input/result.

Flow:

```text
1. Run free-only analyze.
2. Confirm first result returns quickly.
3. Create unlock intent.
4. Request paid generation.
5. Verify analysis_paid_results status processing/completed.
6. Open unlocked route.
7. Verify paid content renders when completed.
8. Repeat paid generation request and verify idempotency/cache/completed reuse.
9. Verify privacy metadata.
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

## Tests

Add/update tests for:

```text
paid generation request creates analysis_paid_results row
paid generation stores completed paidResult v2
paid generation uses user_context_json
paid generation handles missing context
paid generation fails safely if source material missing
duplicate request is idempotent
completed paid result is reused
failed paid result can retry or returns safe failed state
unlocked route renders processing state
unlocked route renders completed paid result from analysis_paid_results
legacy embedded paid_result still renders
initial analyze remains free-only and does not create paid row
event metadata safe
retention_expires_at set for paid result rows
```

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-25-two-tier-phase-2b-deferred-paid-generation-service-v0-review-bundle.md
```

Required sections:

```markdown
# Two-tier Phase 2B Deferred Paid Generation Service v0 Review Bundle

Date: 2026-05-25

## 1. Summary

## 2. Paid Generation Service

## 3. API / Route Changes

## 4. analysis_paid_results Lifecycle

## 5. Paid Generation Input Sources

## 6. Unlocked Route States

## 7. Idempotency / Retry

## 8. Cache / Retention

## 9. Event / Privacy Metadata

## 10. Tests Added

## 11. Staging Smoke

## 12. Known Limitations

## 13. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-25-two-tier-phase-2b-deferred-paid-generation-service-v0-execution-report.md
```

Report structure:

```markdown
# Two-tier Phase 2B Deferred Paid Generation Service v0 Execution Report

## Summary

## Files Created

## Files Updated

## Paid Generation Service

## Route / API Changes

## Unlocked Route Changes

## Idempotency / Retry

## Tests Added

## Staging Smoke

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
- paid generation service summary
- staging smoke status
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
cd apps/web && corepack pnpm test:e2e:local
```

Run Playwright because unlock/result behavior changes.

## Production Gate

Default:

```text
staging only
```

Do not deploy production unless explicitly approved after staging smoke.

## Constraints

Do not implement:

```text
LINE bind trigger generation
LINE webhook paid generation
payment provider integration
ads launch
real payment
email delivery
rich menu
broadcast
portal/account system
model switch
SSE/websocket/token streaming
Module 02
```

Do not modify:

```text
legal semantics
LINE production behavior
design system direction
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
screenshots / test artifacts / videos / traces
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
git commit -m "feat: add deferred paid generation service"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- paid generation service summary
- route/API changes
- unlocked route state behavior
- idempotency/retry behavior
- staging smoke result
- validation results
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
