# Handoff: Paid Generation Job Foundation Phase 2 — Enqueue / Status Integration Plan v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Create a Phase 2 implementation plan for integrating `generation_jobs` into the paid generation request/status lifecycle.

This task should define how paid-result requests will enqueue or reuse `paid_analysis` jobs, how status routes will expose safe user-facing states, and how the existing direct generation path can be transitioned without breaking current low-key production behavior.

This is a planning task only.

Do not implement runtime changes.

Do not write to `generation_jobs` from live routes.

Do not change LINE / LIFF / short-code behavior.

Do not change paid generation runtime.

Do not apply production migration.

Do not enable processor / cron.

Do not enable payment.

## Background

### Phase 1 plan

Paid Generation Job Foundation Plan v0 recommended:

```text
- Add a separate generation_jobs table.
- v1 only supports paid_analysis.
- Keep analysis_paid_results as result storage.
- Avoid over-generalizing into a full AI job system.
- Avoid coupling job lifecycle to analysis_paid_results or LINE flow.
```

### Phase 1 implementation

Paid Generation Job Foundation Phase 1 — DB Schema + Repository Seams v0 completed.

Commit:

```text
ccf2d90
```

Added:

```text
- 0006_generation_jobs.sql
- Drizzle schema
- generation-jobs repository seam
- paid_analysis lifecycle helpers
- dedupe key:
  paid_analysis:{moduleSlug}:{analysisResultId}:{promptVersion}:{schemaVersion}
```

### Phase 1 staging verification

Paid Generation Job Foundation Phase 1 Staging Migration Verification v0 passed.

Commit:

```text
77bdac8
```

Verified:

```text
- 0006_generation_jobs.sql applied to staging only.
- generation_jobs table/columns/defaults/indexes verified.
- synthetic repo smoke passed and cleaned up.
- staging runtime regressions passed.
- normal runtime generation_jobs row count remained 0.
- production migration is still pending.
```

## Current Durable Debt

Current runtime still has these known limitations:

```text
- paid generation runtime still uses analysis_paid_results lifecycle state.
- LINE short-code path still uses best-effort/background generation.
- LIFF bind can still invoke provider generation during bind completion.
- production migration for generation_jobs has not been applied.
```

## Phase 2 Planning Goal

Plan a safe incremental transition where:

```text
paid-result request route creates/reuses a paid_analysis generation job
paid-status route can read job/result state
pending UI can show queued/processing/completed/failed safely
existing direct generation remains available during rollout
processor/cron remains Phase 3
LINE enqueue-only remains Phase 4
payment success enqueue remains Phase 5
```

The plan should avoid a big-bang switch.

## Scope

Do:

1. Inspect current paid-result request route.
2. Inspect paid-status route.
3. Inspect unlocked route pending states.
4. Inspect PaidResultPendingPoller.
5. Inspect LINE LIFF bind paid generation trigger.
6. Inspect LINE webhook short-code trigger.
7. Inspect generation_jobs repository seam.
8. Design Phase 2 enqueue/status integration.
9. Decide whether Phase 2 should be shadow-only, dual-write, or behavior-switch.
10. Define route state mapping.
11. Define idempotency/reuse behavior.
12. Define migration gating.
13. Define rollback strategy.
14. Define Phase 2 tests.
15. Create research report, execution report, summary log.
16. Commit and push to `origin/staging`.

Do not:

- implement Phase 2
- import generation_jobs repo into runtime routes
- apply production migration
- add processor endpoint
- add cron
- change user-facing behavior
- change LINE webhook/LIFF behavior
- change payment behavior
- change prompts/schema
- change DB schema
- start ads

## Core Questions To Answer

### 1. What should Phase 2 actually switch?

Compare these rollout modes.

#### Option A — Shadow enqueue only

```text
paid-result request route continues direct generation
also best-effort creates/reuses a generation_jobs row
status route remains mostly unchanged
```

Pros:

```text
lowest risk
lets us observe job rows before processor exists
```

Cons:

```text
job lifecycle not meaningful without processor
dual state can confuse
could create rows with no consumer
```

#### Option B — Enqueue + direct generation compatibility

```text
paid-result request route creates/reuses job
then still performs direct provider generation synchronously/as today
marks job completed/failed accordingly
status route can read both job and result
```

Pros:

```text
job rows reflect real generation lifecycle
no processor required yet
preserves current UX
good bridge to Phase 3
```

Cons:

```text
route still does generation work
some lifecycle coupling remains
```

#### Option C — Full enqueue, no direct generation

```text
paid-result request route only enqueues
status route polls queued/processing
processor required
```

Pros:

```text
clean target architecture
```

Cons:

```text
too risky before Phase 3 processor/cron exists
```

Expected recommendation:

```text
Option B for Phase 2:
create/reuse job and mirror direct generation lifecycle into generation_jobs,
while preserving current user-facing behavior.
```

If Codex recommends differently, explain why.

## Proposed Phase 2 Behavior

Expected plan:

```text
paid-result request route:
  1. Validate unlock/analysis context as today.
  2. Check completed current paid result as today.
  3. Create/reuse paid_analysis job using dedupe key.
  4. If completed paid result already exists, mark/reconcile job completed if safe.
  5. If generation is needed, mark job processing.
  6. Run current paid generation path as today.
  7. Store result in analysis_paid_results as today.
  8. Mark job completed with output_ref.
  9. If generation fails, mark retry_scheduled or failed_final according to existing error category, but preserve current public error handling.
```

Important:

```text
Do not change provider generation behavior.
Do not change prompt/schema.
Do not change pending UI behavior except optional richer status mapping if safe.
```

## Status Route Mapping

Plan how `/api/modules/[moduleSlug]/paid-result/status` should combine:

```text
analysis_paid_results
generation_jobs
unlock_intent state
```

Priority order expected:

```text
1. completed paid result exists → completed
2. job status processing → processing
3. job status queued/retry_scheduled → queued or processing-safe copy
4. job status failed_final → failed
5. claimed/bound/delivered intent but no job/result → pending/claimed_missing
6. no claim/request → missing/not_requested
```

External status should remain simple:

```json
{
  "status": "missing|pending|processing|completed|failed|expired",
  "retryAfterMs": 3000
}
```

Avoid exposing internal job statuses directly unless mapped.

## Pending UI Contract

Plan should keep the UI simple.

Suggested mapping:

```text
queued/retry_scheduled:
  正在排隊整理你的完整分析

processing:
  正在整理你的完整分析

completed:
  refresh / show result

failed_final:
  這次整理沒有成功，請稍後再試或聯絡客服
```

Do not add complex job debug UI.

Do not show internal attempt count to normal users.

## LINE / LIFF / Short-code Phase 2 Treatment

Phase 2 should likely not make LINE enqueue-only yet.

Plan should define:

```text
- LIFF bind may continue current behavior, but if it triggers direct generation it should create/mirror a job in Phase 2 if route is touched.
- Short-code webhook may continue current best-effort pending link behavior.
- Full LINE enqueue-only conversion is Phase 4 after processor/cron.
```

Expected recommendation:

```text
Phase 2 focuses on paid-result request/status route.
Do not change LINE webhook/LIFF generation semantics yet unless they already call the same paid generation service and job mirroring can be centralized safely.
```

## Idempotency / Reuse

Plan required behavior:

```text
- repeated paid-result requests reuse same generation job via dedupe_key
- completed paid result short-circuits generation
- job completed can be reconciled with existing completed result
- failed/retry_scheduled handling must not create duplicate jobs
- prompt/schema version changes produce new dedupe_key
```

## Production Migration Gate

Phase 2 implementation will require production to have `generation_jobs`.

Plan should decide sequencing:

Expected:

```text
1. Before Phase 2 implementation goes to production, apply 0006_generation_jobs.sql to production.
2. Verify production schema.
3. Deploy Phase 2 runtime only after production migration passes.
```

For staging:

```text
0006 already applied and verified.
```

## Rollback Strategy

If Phase 2 behavior causes issues:

```text
- feature flag or code path should allow falling back to existing direct generation without reading/writing generation_jobs.
- generation_jobs rows are additive and can be ignored.
- completed paid results remain in analysis_paid_results.
```

Plan should consider whether to add a flag:

```text
ENABLE_GENERATION_JOBS=false by default
```

or whether Phase 2 will be always-on after migration.

Expected recommendation:

```text
Use an env flag for Phase 2 rollout if implementation complexity remains small.
```

Possible flag:

```text
ENABLE_PAID_GENERATION_JOBS
```

Default:

```text
false until explicitly enabled
```

But avoid too many flags if unnecessary.

## Metrics / Events

Plan events for Phase 2:

```text
paid_generation_job_created
paid_generation_job_reused
paid_generation_job_processing
paid_generation_job_completed
paid_generation_job_retry_scheduled
paid_generation_job_failed_final
```

Keep event metadata safe:

```text
jobType
status
triggerSource
operatorTest
schemaVersion
promptVersion
source provider/fallback
errorCategory
```

Never include job id if considered sensitive? Codex should decide. Generally internal UUID may be okay in logs but avoid user-facing reports.

Do not include raw input, paid JSON, tokens, LINE IDs.

## Tests To Plan

Future Phase 2 implementation tests should cover:

```text
paid-result request creates job when feature enabled
duplicate request reuses job
completed paid result marks/reuses job and does not regenerate
successful direct generation marks job completed
output validation failure marks retry_scheduled or failed_final according to policy
status route maps queued/processing/retry_scheduled/completed/failed safely
missing generation_jobs table / feature disabled path preserves old behavior if flag used
LINE/LIFF existing behavior unchanged
no raw input/paid_json/tokens in job/event metadata
```

## What Not To Do In Phase 2

Explicitly keep deferred:

```text
processor endpoint
Vercel Cron
enqueue-only LINE webhook
enqueue-only LIFF bind
payment success enqueue
external queue vendor
admin retry console
manual retry UI
sessionized metrics
```

## Required Research Report

Create:

```text
ai-collaboration/research/2026-05-27-paid-generation-job-foundation-phase-2-enqueue-status-plan-v0.md
```

Required sections:

```markdown
# Paid Generation Job Foundation Phase 2 — Enqueue / Status Integration Plan v0

Date: 2026-05-27

## 1. Summary

## 2. Current Runtime Lifecycle

## 3. Rollout Mode Options

## 4. Recommended Phase 2 Behavior

## 5. Request Route Integration

## 6. Status Route Mapping

## 7. Pending UI Contract

## 8. LINE / LIFF / Short-code Treatment

## 9. Idempotency / Reuse

## 10. Production Migration Gate

## 11. Rollback / Feature Flag Strategy

## 12. Metrics / Events

## 13. Tests For Future Implementation

## 14. What Not To Do In Phase 2

## 15. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-27-paid-generation-job-foundation-phase-2-enqueue-status-plan-v0-execution-report.md
```

Report structure:

```markdown
# Paid Generation Job Foundation Phase 2 — Enqueue / Status Integration Plan v0 Execution Report

## Summary

## Files Created

## Files Updated

## Planning Decisions

## Recommended Phase 2 Scope

## Migration / Rollback Notes

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
Phase 2 recommendation
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
runtime job writes
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
git commit -m "docs: plan paid job integration"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
recommended rollout mode
request/status route recommendation
LINE/LIFF/short-code treatment
production migration gate
rollback/feature flag recommendation
metrics/events recommendation
validation results
report path
commit hash
staging push status
Tech Debt / Cleanup Notes
recommended next step
```

Then stop.
