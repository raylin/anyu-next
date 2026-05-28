# Handoff: Paid Generation Job Foundation Phase 3 — Processor / Cron Plan v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Create an architecture plan for Phase 3 of the Paid Generation Job Foundation: a secret-gated processor endpoint and cron-driven job runner for `paid_analysis` generation jobs.

This phase should define how `generation_jobs` becomes a durable processing source for paid analysis, while keeping the implementation narrow and avoiding a premature general queue platform.

This is a planning task only.

Do not implement processor endpoint.

Do not implement cron.

Do not change runtime behavior.

Do not enable production `ENABLE_PAID_GENERATION_JOBS`.

Do not change LINE/LIFF/short-code behavior.

Do not enable payment.

## Background

### Phase 1

Paid Generation Job Foundation Phase 1 — DB Schema + Repository Seams v0 completed.

```text
Commit: ccf2d90
```

Added:

```text
- 0006_generation_jobs.sql
- generation_jobs schema
- paid_analysis repository helpers
- dedupe key
- status transition helpers
```

### Phase 1 staging verification

```text
Commit: 77bdac8
```

Verified:

```text
- 0006_generation_jobs.sql applied to staging
- table / columns / indexes / dedupe unique verified
- synthetic repo smoke passed
- normal staging runtime wrote 0 generation_jobs rows
```

### Phase 2

Paid Generation Job Foundation Phase 2 — Enqueue / Status Integration v0 completed.

```text
Commit: 21c1907
```

Added:

```text
- ENABLE_PAID_GENERATION_JOBS=false by default
- job mirroring inside requestDeferredPaidGeneration when enabled
- status route can safely map job states when enabled
- direct generation remains delivery path
- LINE/LIFF/short-code behavior preserved
```

### Phase 2 staging flag verification

```text
Commit: 474678a
```

Verified:

```text
- flag off: normal flow completed and generation_jobs stayed at 0
- flag on: one paid_analysis job reached completed
- attempt_count = 1
- output_ref present
- source provider
- one completed analysis_paid_results row
```

### Phase 2 production migration gate

```text
Commit: bb0cc22
```

Verified:

```text
- production 0006_generation_jobs.sql applied
- production schema/indexes verified
- ENABLE_PAID_GENERATION_JOBS absent/disabled
- production smoke passed
- production generation_jobs row count stayed 0
```

Current durable status:

```text
Phase 1 schema/repo: done
Phase 2 mirror integration: done behind disabled flag
Staging flag-on: verified
Production schema: ready
Production flag: disabled
Processor/cron: not designed or implemented
```

## Scope

Do:

1. Inspect current generation_jobs repository helpers.
2. Inspect requestDeferredPaidGeneration and paid generation internals.
3. Inspect paid status route and pending poller expectations.
4. Design processor endpoint.
5. Design cron schedule and invocation model.
6. Design claim/lock/stale recovery behavior.
7. Design retry/backoff/fallback behavior.
8. Design safe response payloads.
9. Design feature flag / rollout strategy.
10. Design metrics / observability.
11. Design staging verification plan.
12. Design production rollout plan.
13. Define what remains deferred.
14. Create research report, execution report, summary log.
15. Commit and push to `origin/staging`.

Do not:

- implement processor endpoint
- implement cron
- add new DB migration unless planning-only docs mention future need
- change runtime route behavior
- enable production job flag
- change LINE/LIFF/short-code behavior
- enable payment
- change prompt/schema semantics
- introduce external queue vendor
- build admin retry UI
- build general AI job platform

## Core Phase 3 Goal

Phase 3 should move from:

```text
request route directly generates paid result and mirrors job lifecycle
```

toward:

```text
request route creates/reuses paid_analysis job
processor claims due jobs and generates paid result
status route / pending poller observes job/result state
```

But rollout may be staged.

## Architecture Options To Compare

### Option A — Processor exists, request route still direct-generates

```text
- processor is added but not used for normal paid requests yet
- request route still direct-generates
- only manual/operator jobs use processor
```

Pros:

```text
low runtime risk
lets us test processor in isolation
```

Cons:

```text
does not materially improve durable user flow yet
```

### Option B — Request route enqueue + best-effort kick processor, with direct fallback

```text
- request route creates/reuses job
- returns pending immediately or optionally waits briefly
- kicks processor best-effort
- if processor fails or flag disabled, existing direct generation can still run
```

Pros:

```text
incremental durable transition
better UX possible
```

Cons:

```text
more complex state handling
```

### Option C — Full enqueue-only

```text
- request route only enqueues
- processor/cron is only generation path
```

Pros:

```text
clean target
```

Cons:

```text
too risky before processor has production history
```

Expected recommendation:

```text
Phase 3 should implement processor in isolation first, then Phase 3B or Phase 4 can switch request route to enqueue + kick.
Do not jump to full enqueue-only immediately.
```

Codex should verify against existing code and recommend.

## Processor Endpoint Design

Recommended endpoint:

```text
POST /api/internal/jobs/process
```

or repo-consistent route.

Security:

```text
- require CRON_SECRET or INTERNAL_JOB_SECRET
- reject without secret
- do not accept arbitrary job payload
- do not expose raw job rows
- do not expose raw errors
```

Request body optional:

```json
{
  "jobType": "paid_analysis",
  "limit": 3,
  "dryRun": false
}
```

But keep v1 simple.

Recommended v1 behavior:

```text
- only process job_type = paid_analysis
- claim due jobs with status queued or retry_scheduled and next_run_at <= now()
- process max N jobs per run
- return aggregate counts only
```

Safe response:

```json
{
  "ok": true,
  "processed": 1,
  "completed": 1,
  "retryScheduled": 0,
  "failedFinal": 0,
  "skipped": 0
}
```

Do not return:

```text
job IDs
dedupe keys
raw errors
raw input
paid result JSON
provider output
tokens
LINE IDs
secrets
```

## Claim / Lock Design

Plan must define atomic claim behavior.

Requirements:

```text
- only one worker claims a job
- queued/retry_scheduled jobs due now can be claimed
- set status=processing
- increment attempt_count
- set locked_at
- set locked_by
- respect maxAttempts
```

Potential approach:

```text
SQL update ... where id in (
  select id from generation_jobs
  where job_type='paid_analysis'
    and status in ('queued', 'retry_scheduled')
    and next_run_at <= now()
  order by priority desc, next_run_at asc, created_at asc
  limit N
  for update skip locked
)
returning *
```

Codex should adapt to Neon/Postgres/Drizzle capabilities.

## Stale Lock Recovery

Plan should define recovery.

A job is stale if:

```text
status = processing
locked_at < now() - processingTimeout
```

Suggested timeout:

```text
5–10 minutes
```

Recovery behavior:

```text
if attempt_count < max_attempts:
  set status=retry_scheduled
  set next_run_at=now()
  clear lock
  set last_error_category='stale_lock_recovered'
else:
  set status=failed_final
  clear lock
```

Question to answer:

```text
Should stale recovery be inside processor each run, or separate endpoint/cron?
```

Expected recommendation:

```text
Processor should recover stale jobs before claiming due jobs.
```

## Paid Analysis Processing Flow

For each claimed paid_analysis job:

```text
1. Resolve input_ref_type/input_ref_id.
2. Load analysis result/request context required for paid generation.
3. Check if completed analysis_paid_results already exists for current prompt/schema.
4. If completed result exists:
   - mark job completed with output_ref
   - do not regenerate.
5. If no completed result:
   - run existing paid generation provider path.
   - store paid result in analysis_paid_results.
   - mark job completed with output_ref and source.
6. On retryable failure:
   - mark retry_scheduled with backoff.
7. On final failure:
   - mark failed_final.
```

No raw input/provider output should be returned or logged.

## Retry / Backoff Policy

Recommended:

```text
maxAttempts = 3

attempt 1: immediate
attempt 2: +30 seconds
attempt 3: +2 minutes
failed_final after max attempts
```

But for provider rate limit:

```text
retry after 2–5 minutes
```

Error categories:

```text
output_validation: retryable
provider_timeout: retryable
provider_rate_limit: retryable_longer
provider_auth_error: failed_final
input_invalid: failed_final
not_found: failed_final
unknown: retry once then failed_final
```

Plan should align with current error categories.

## Fallback Policy

Important product question.

For current free/beta:

```text
fallback can be used after provider/retry if current fallback quality is acceptable.
```

For future real payment:

```text
fallback after payment should be explicitly approved.
If fallback is too generic, failed_final may be better with support/retry/refund path.
```

Phase 3 plan should recommend:

```text
Keep existing fallback behavior for beta.
Before real payment, define paid fallback/support policy.
```

## Request Route Integration Strategy

Do not implement in this task, but plan future sequence.

Possible rollout:

### Phase 3A

```text
processor endpoint exists
manual/operator processing only
request route behavior unchanged
```

### Phase 3B

```text
request route creates/reuses job
kicks processor best-effort
may still direct-generate if flag says compatibility mode
```

### Phase 4

```text
LINE/LIFF/short-code become enqueue-only
processor/cron handles generation
```

### Phase 5

```text
payment success creates entitlement and queues job
web checkout can redirect directly to pending poller
```

Plan should recommend exact next implementation step.

## Status Route / Pending Poller

When processor is active, status route should map:

```text
completed paid result exists → completed
job processing → processing
job queued/retry_scheduled → pending
job failed_final → failed
claimed intent but no job/result → pending
missing/no claim → missing
```

Pending poller should not expose internal job details.

## Cron Design

Vercel Cron recommendation:

```text
frequency: every 1 minute initially, or every 5 minutes if cost control preferred
max jobs per run: 1–3 initially
timeout: stay within route maxDuration
```

Low traffic recommendation:

```text
every 1 minute with max 1–2 jobs per run
```

Cost controls:

```text
- max jobs per run
- max attempts
- global provider limits
- paid_generation job source metrics
```

## Manual Operator Trigger

Plan whether to allow operator trigger.

Possible:

```text
POST /api/internal/jobs/process
```

with secret.

Use cases:

```text
- smoke testing
- recovering stuck jobs
- before cron enabled
```

Response aggregate-only.

## Metrics / Observability

Add or plan safe events:

```text
paid_generation_job_processor_run
paid_generation_job_claimed
paid_generation_job_completed
paid_generation_job_retry_scheduled
paid_generation_job_failed_final
paid_generation_job_stale_recovered
```

Metrics report should eventually include:

```text
queued count
processing count
retry_scheduled count
failed_final count
avg queue wait
avg processing duration
attempt distribution
fallback rate
stale recovery count
```

Do not add sessionized metrics here.

## Feature Flags

Plan flags:

```text
ENABLE_PAID_GENERATION_JOBS
ENABLE_PAID_GENERATION_PROCESSOR
ENABLE_PAID_GENERATION_ENQUEUE_ONLY
```

But avoid too many flags if possible.

Expected recommendation:

```text
Keep existing ENABLE_PAID_GENERATION_JOBS for job mirroring/status.
Add ENABLE_PAID_GENERATION_PROCESSOR for processor endpoint behavior if needed.
Do not add enqueue-only flag until request route switch phase.
```

## Production Safety

Processor should not run in production until:

```text
- production 0006 migration applied (already true after gate)
- processor endpoint tested on staging
- cron secret configured
- route/API smoke passes
- staging synthetic job run completes from provider
- fallback/failure behavior documented
```

Production rollout steps later:

```text
1. deploy processor code
2. keep cron disabled
3. manually trigger one safe operator job if needed
4. enable cron with max 1 job/run
5. monitor
```

## What Not To Build Yet

Explicitly defer:

```text
external queue vendor
admin retry console
manual retry UI
relationship session jobs
payment entitlement engine
multi-model router
general AI job platform
sessionized metrics
```

## Required Research Report

Create:

```text
ai-collaboration/research/2026-05-27-paid-generation-job-foundation-phase-3-processor-cron-plan-v0.md
```

Required sections:

```markdown
# Paid Generation Job Foundation Phase 3 — Processor / Cron Plan v0

Date: 2026-05-27

## 1. Summary

## 2. Current State

## 3. Processor Rollout Options

## 4. Recommended Phase 3 Scope

## 5. Processor Endpoint Design

## 6. Claim / Lock Design

## 7. Stale Lock Recovery

## 8. Paid Analysis Processing Flow

## 9. Retry / Backoff / Fallback

## 10. Request Route Integration Strategy

## 11. Status Route / Pending Poller Contract

## 12. Cron / Operator Trigger Design

## 13. Metrics / Observability

## 14. Feature Flags

## 15. Production Safety

## 16. What Not To Build Yet

## 17. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-27-paid-generation-job-foundation-phase-3-processor-cron-plan-v0-execution-report.md
```

Report structure:

```markdown
# Paid Generation Job Foundation Phase 3 — Processor / Cron Plan v0 Execution Report

## Summary

## Files Created

## Files Updated

## Planning Decisions

## Recommended Phase 3 Scope

## Processor / Cron Recommendation

## Production Safety Notes

## Validation Results

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
Phase 3 processor recommendation
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

No Playwright required unless code changes.

## Constraints

Do not implement:

```text
processor endpoint
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
LIFF behavior
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
dedupe keys in reports if they contain IDs
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "docs: plan paid job processor"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
recommended Phase 3 scope
processor endpoint recommendation
cron recommendation
claim/lock/stale recovery recommendation
retry/fallback recommendation
production safety recommendation
validation results
report path
commit hash
staging push status
Tech Debt / Cleanup Notes
recommended next step
```

Then stop.
