# Handoff: Paid Generation Job Foundation Plan v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Create an architecture plan for a narrow DB-backed paid generation job foundation.

The goal is to make paid analysis generation durable enough for future real payment, web checkout, LINE fulfillment, and retry/recovery needs, without prematurely building a general AI queue platform before Module 02 and future flows are known.

This is a planning task only.

Do not implement DB schema.

Do not implement queue/processor.

Do not change production behavior.

Do not change LINE behavior.

Do not change payment behavior.

Do not change prompt/schema behavior.

## Product / Architecture Context

Current Module 01 flow has evolved quickly:

```text
- free-only analyze
- deferred paid generation
- LINE/LIFF fulfillment
- short-code fallback
- pending paid polling
- evidenceSummary schema v3
- low-key production active/monitor
- payment provider application pending
```

Current durable concern:

```text
LINE webhook / short-code currently can trigger paid generation through best-effort background behavior.
This is acceptable for low-key beta, but not ideal for real payment or higher traffic.
```

Recent product direction:

```text
- Mobile can remain LINE-first.
- Desktop should not be forced through LINE.
- Payment success should be able to enqueue paid generation and redirect directly to web polling.
- LINE should become an optional retention/delivery channel, not the only path to full results.
- Short-code should gradually become fallback/recovery, not the main path.
```

Key design tension:

```text
Avoid over-generalizing into a full AI job system too early.
But also avoid coupling durable generation directly to analysis_paid_results, LINE webhook logic, or unlocked result UI.
```

Recommended middle point:

```text
Paid Generation Job Foundation
```

Implementation should eventually be narrow:

```text
Only paid_analysis job type in v1.
But schema/processor boundaries should not be hardcoded to Module 01 UI or LINE-specific delivery.
```

## Scope

Do:

1. Inspect current paid generation lifecycle.
2. Inspect `analysis_paid_results` and current repository helpers.
3. Inspect paid-result request/status routes.
4. Inspect LINE LIFF bind and short-code webhook triggers.
5. Inspect pending poller contract.
6. Inspect current metrics/events.
7. Propose narrow `generation_jobs` or equivalent DB-backed job foundation.
8. Compare expanding `analysis_paid_results` vs adding a separate jobs table.
9. Define v1 job lifecycle for `paid_analysis`.
10. Define trigger sources.
11. Define processor/cron architecture.
12. Define retry/backoff/fallback behavior.
13. Define polling/status API contract.
14. Define migration/implementation phases.
15. Define metrics and observability.
16. Define what must remain deferred.
17. Create research report, execution report, summary log.
18. Commit and push to `origin/staging`.

Do not:

- implement DB migration
- implement queue
- implement processor endpoint
- change paid generation runtime
- change LINE webhook
- change LIFF bind
- change payment flow
- change prompt/schema
- change production behavior
- introduce external queue vendor
- implement general job platform
- implement follow-up sessions
- implement payment packs

## Core Recommendation To Evaluate

Expected recommendation unless code inspection suggests otherwise:

```text
Add a separate generation_jobs table in a future implementation.
Use it narrowly for paid_analysis v1.
Keep analysis_paid_results as result storage, not job lifecycle storage.
```

Rationale:

```text
- Avoid coupling job lifecycle to result storage.
- Avoid coupling paid generation to LINE/webhook route flow.
- Enable future payment success → enqueue → polling.
- Enable web-only paid unlock without LINE.
- Keep short-code as fallback trigger, not core generation mechanism.
- Leave room for future module/job types without implementing them now.
```

## Compare Two Options

### Option A — Expand analysis_paid_results into job + result table

Pros:

```text
smaller migration
less new abstraction
fits current paid-only world
```

Cons:

```text
couples generation lifecycle to paid result storage
harder to support future job types
harder to reason about result retention vs job retries
harder to attach payment/entitlement/follow-up triggers cleanly
```

### Option B — Add generation_jobs table, keep analysis_paid_results result-only

Pros:

```text
clean separation
better for payment success and LINE triggers
future-friendly without fully generalizing
job lifecycle can be retained/observed separately
```

Cons:

```text
new table/repository/processor
slightly more architecture
must avoid overbuilding
```

Expected plan recommendation:

```text
Option B, but v1 only supports paid_analysis.
```

## Proposed Minimal Job Shape

Plan should propose a minimal schema.

Suggested:

```text
generation_jobs
- id
- job_type                  // v1 only paid_analysis
- status                    // queued | processing | retry_scheduled | completed | failed_final
- priority                  // simple int
- module_slug
- input_ref_type            // v1 analysis_result
- input_ref_id
- output_ref_type           // v1 analysis_paid_result
- output_ref_id nullable
- trigger_source            // web_unlock | line_bind | short_code | payment_success_future | operator
- entitlement_ref_id nullable
- attempt_count
- max_attempts
- next_run_at
- locked_at
- locked_by
- last_error_category
- last_error_code
- created_at
- updated_at
```

Avoid adding unused columns unless useful for immediate or near-term payment path.

Discuss whether to include now or defer:

```text
model_strategy
model_provider
model_name
prompt_version
schema_version
cost_estimate
token_usage
line_user_ref
payment_ref
```

Expected recommendation:

```text
Include prompt/schema/model metadata if already available cheaply and useful for debugging.
Defer complex cost accounting and multi-model routing.
```

## Job Status State Machine

Propose v1 statuses:

```text
queued
processing
retry_scheduled
completed
failed_final
```

State transitions:

```text
queued → processing → completed
queued → processing → retry_scheduled → queued
queued → processing → failed_final
processing → retry_scheduled
processing → failed_final
```

Avoid adding these unless needed:

```text
cancelled
expired
paused
dead_letter
scheduled
```

## Trigger Sources

Define trigger source semantics:

```text
web_unlock:
  User requests full analysis from web route before payment or beta/free unlock.

line_bind:
  User completes LIFF bind and can receive unlocked route.

short_code:
  User submits short-code to LINE OA; this should become fallback/recovery trigger.

payment_success_future:
  Future NewebPay payment success event creates entitlement and queues paid_analysis.

operator:
  Operator/test manually triggers job, marked operatorTest if applicable.
```

Important architectural decision:

```text
Generation should be triggered by entitlement/fulfillment state, not by LINE specifically.
```

## Desktop vs Mobile Flow

Plan should explicitly support:

### Mobile / LINE-first

```text
mobile result page
→ LINE / LIFF bind
→ enqueue paid_analysis job
→ redirect unlocked pending page
→ polling → completed paid content
```

### Desktop / web-first future payment

```text
desktop result page
→ web checkout
→ payment success verified server-side
→ enqueue paid_analysis job
→ redirect unlocked pending page
→ polling → completed paid content
```

### Short-code fallback

```text
desktop or failed LIFF
→ user sends short-code to OA
→ match unlock intent
→ enqueue paid_analysis job if not already queued/completed
→ reply pending link
```

This should make clear:

```text
LINE is a delivery/retention channel, not the only full-analysis path.
Short-code becomes fallback/recovery.
```

## Processor Architecture

Plan a processor but do not implement.

Recommended v1:

```text
/api/internal/jobs/process
```

Security:

```text
CRON_SECRET or INTERNAL_JOB_SECRET required
no public access
no raw job data in response
```

Behavior:

```text
claim due queued/retry_scheduled jobs
process max N jobs per run
only process job_type = paid_analysis in v1
set locked_at / locked_by
run provider generation
store result in analysis_paid_results
mark job completed and output_ref_id
schedule retry or failed_final
```

Cron:

```text
Vercel Cron every 1 or 5 minutes
```

Discuss low-latency trigger:

```text
request route can enqueue and optionally kick processor best-effort
pending page polling can remain passive
```

But the durable source is the persisted job, not the kick.

## Idempotency / Locking

Plan must address:

```text
- same unlockIntent should not create duplicate paid_generation jobs
- same analysisResult should not generate duplicate completed paid result unnecessarily
- repeated request route calls should reuse existing queued/processing/completed job
- processor must not double-claim same job
- stale processing lock should be recoverable
```

Suggested approach:

```text
unique key on job_type + input_ref_type + input_ref_id + trigger context if appropriate
or dedupe_key
```

Potential dedupe key:

```text
paid_analysis:{moduleSlug}:{analysisResultId}:{schemaVersion}:{promptVersion}
```

Need to consider:

```text
schema/prompt version rollover should allow new job if paid result needs regeneration
```

## Retry / Backoff

Recommended initial policy:

```text
maxAttempts = 3

attempt 1: immediate
attempt 2: +30s
attempt 3: +2m
failed_final after max attempts
```

Error category handling:

```text
output_validation: retry
provider_timeout: retry
provider_rate_limit: retry later
provider_auth_error: failed_final
input_invalid: failed_final
not_found: failed_final
unknown: retry once then failed_final
```

Fallback policy:

```text
provider fails after retry
→ controlled fallback only if quality acceptable and safe
→ source=fallback
→ job completed with fallback source
```

For future real payment:

```text
If fallback quality is not acceptable, failed_final should support safe support/refund/retry path.
```

## Pending Status API Contract

Plan should avoid exposing internal job complexity.

External status endpoint should return:

```json
{
  "status": "queued|processing|completed|failed",
  "retryAfterMs": 3000,
  "message": "safe user-facing copy"
}
```

Internal statuses map:

```text
queued → queued
retry_scheduled → queued
processing → processing
completed → completed
failed_final → failed
```

UI copy suggestions:

```text
queued: 正在排隊整理你的完整分析
processing: 正在整理你的完整分析
failed: 這次整理沒有成功，請稍後再試或聯絡客服
```

## Metrics / Observability

Plan new events:

```text
paid_generation_job_queued
paid_generation_job_claimed
paid_generation_job_completed
paid_generation_job_retry_scheduled
paid_generation_job_failed_final
paid_generation_job_stuck_recovered
```

Metrics:

```text
queued count
processing count
retry_scheduled count
failed_final count
completion rate
avg queued → completed time
attempt distribution
fallback rate
stuck processing jobs
```

Ensure operatorTest can propagate if trigger is operator.

## Retention

Plan should cover:

```text
generation_jobs retention
analysis_paid_results retention
failed job metadata retention
what is scrubbed vs preserved
```

Recommended:

```text
Do not store raw input in generation_jobs.
Only refs and safe categories.
Keep job rows for observability with safe metadata.
Scrub result content via existing analysis_paid_results retention.
```

## External Queue Upgrade Point

Plan should define when to upgrade from DB-backed jobs to managed queue.

Triggers:

```text
real payment volume increases
job volume exceeds cron comfort
need UI retry/dead-letter console
provider failures become support burden
multi-model routing becomes complex
multi-module background jobs grow
```

Candidates may include:

```text
Inngest
Trigger.dev
QStash
Cloud Tasks
Temporal-like workflow
```

Do not choose vendor now unless clearly recommended.

## Implementation Phases

Expected phases:

### Phase 0 — Plan

This task.

### Phase 1 — DB schema + repository

```text
generation_jobs migration
repo helpers
dedupe / claim functions
tests
no behavior switch
```

### Phase 2 — enqueue paid_analysis job

```text
paid-result request route creates/reuses job
status route understands job status
existing direct generation may remain as fallback during rollout
```

### Phase 3 — processor endpoint + cron

```text
secret-gated processor
process paid_analysis jobs
retry/backoff
events/metrics
```

### Phase 4 — LINE / short-code enqueue-only

```text
LINE triggers enqueue only
no best-effort direct generation after webhook
```

### Phase 5 — payment success integration

```text
NewebPay success creates entitlement and enqueues paid_analysis
web-only polling works
LINE optional
```

### Phase 6 — future follow-up / pack

```text
relationship session / entitlement system can reuse job foundation if appropriate
```

## What Not To Build Yet

Explicitly list:

```text
general AI job platform
multi-job dependency graph
admin retry console
external queue vendor
multi-model router
sessionized follow-up jobs
payment entitlement engine
relationship session memory
```

## Required Research Report

Create:

```text
ai-collaboration/research/2026-05-27-paid-generation-job-foundation-plan-v0.md
```

Required sections:

```markdown
# Paid Generation Job Foundation Plan v0

Date: 2026-05-27

## 1. Summary

## 2. Current Paid Generation Lifecycle

## 3. Why Not General Queue Yet

## 4. Why Not Couple To analysis_paid_results

## 5. Recommended Job Foundation Shape

## 6. Job State Machine

## 7. Trigger Sources

## 8. Desktop / Mobile / LINE Flow

## 9. Processor / Cron Architecture

## 10. Idempotency / Locking

## 11. Retry / Backoff / Fallback

## 12. Pending Status API Contract

## 13. Metrics / Observability

## 14. Retention / Privacy

## 15. External Queue Upgrade Point

## 16. Implementation Phases

## 17. What Not To Build Yet

## 18. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-27-paid-generation-job-foundation-plan-v0-execution-report.md
```

Report structure:

```markdown
# Paid Generation Job Foundation Plan v0 Execution Report

## Summary

## Files Created

## Files Updated

## Planning Decisions

## Recommended Architecture

## Implementation Phases

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

```text
date
task completed
job foundation recommendation
validation result
commit hash
staging push status
```

## Validation

Docs/planning only. Run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint
cd apps/web && corepack pnpm test
cd apps/web && corepack pnpm build
```

No Playwright required unless code changes, which should not happen.

## Constraints

Do not implement:

```text
DB migrations
job processor
cron
payment integration
checkout
external queue
admin dashboard
follow-up sessions
membership
new module
ads
```

Do not modify:

```text
app code
production behavior
LINE behavior
payment behavior
prompt/schema semantics
DB schema
legal semantics
event names
```

Do not commit:

```text
.env
.env.local
merchant IDs
payment API keys
HashKey
HashIV
provider keys
DATABASE_URL
ANTHROPIC_API_KEY
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
OPERATOR_TEST_SECRET
business registration documents
bank documents
identity documents
owner personal email
owner personal phone
private address
raw production exports
raw private user content
tokens/tokenized URLs/LINE IDs
paid_result_json dumps
raw provider output
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "docs: plan paid generation jobs"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
recommended architecture
why not general queue yet
why not couple to analysis_paid_results
job shape summary
trigger source summary
processor/retry/status recommendation
implementation phases
validation results
report path
commit hash
staging push status
Tech Debt / Cleanup Notes
recommended next step
```

Then stop.
