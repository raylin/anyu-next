# Handoff: Paid Generation Job Foundation Phase 1 — DB Schema + Repository Seams v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Implement Phase 1 of the Paid Generation Job Foundation by adding additive DB schema and repository seams for future durable paid_analysis jobs.

This phase must not switch runtime behavior.

The goal is to prepare a clean durable job foundation while keeping current low-key production behavior unchanged.

This is an implementation task, but additive only.

Do not change LINE behavior.

Do not change LIFF bind behavior.

Do not change paid-result request route behavior.

Do not change paid-result status route behavior.

Do not enable processor/cron.

Do not enable payment.

Do not deploy production by default.

## Background

Paid Generation Job Foundation Plan v0 completed.

Decision:

```text
- Use separate generation_jobs table.
- v1 only supports paid_analysis jobs.
- Keep analysis_paid_results as result storage, not job lifecycle storage.
- Use DB-backed jobs first, not external queue/vendor.
- Do not build a general AI job platform yet.
```

Current debt from plan:

```text
- paid generation state is currently coupled to analysis_paid_results.
- LINE short-code uses best-effort background generation.
- LIFF bind can still invoke provider generation during bind completion.
```

Phase 1 goal:

```text
Add the future job foundation without changing current behavior.
```

This mirrors prior safe rollout style:

```text
additive schema + repo seams first
verify staging DB / tests
switch behavior only in later phases
```

## Scope

Do:

1. Add additive migration for `generation_jobs`.
2. Add Drizzle/schema definitions.
3. Add TypeScript types/constants for job statuses, job type, trigger source, ref types.
4. Add repository helpers for paid_analysis job lifecycle.
5. Add tests for schema/repository behavior.
6. Add docs/review bundle/report/summary log.
7. Push to `origin/staging`.

Do not:

- enqueue jobs from runtime routes
- change existing paid generation runtime behavior
- change LIFF bind behavior
- change LINE webhook behavior
- change short-code behavior
- change paid result status API behavior
- change pending poller behavior
- add processor endpoint
- add cron
- add external queue vendor
- add payment integration
- change DB retention jobs unless only documenting future behavior
- deploy production unless separately approved

## Schema Requirements

Add migration, likely:

```text
apps/web/drizzle/0006_generation_jobs.sql
```

or next available migration number.

Add table:

```text
generation_jobs
```

Recommended columns:

```text
id uuid primary key default gen_random_uuid()
job_type text not null
status text not null
priority integer not null default 50

module_slug text not null

input_ref_type text not null
input_ref_id uuid not null

output_ref_type text null
output_ref_id uuid null

trigger_source text not null

dedupe_key text not null unique

entitlement_ref_id uuid null

attempt_count integer not null default 0
max_attempts integer not null default 3

next_run_at timestamptz not null default now()
locked_at timestamptz null
locked_by text null

last_error_category text null
last_error_code text null
last_error_at timestamptz null

model_provider text null
model_name text null
prompt_version text null
schema_version text null
source text null

operator_test boolean not null default false

created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Codex may adjust column types to match repo conventions.

### Required indexes

Add indexes for processor future:

```text
(status, next_run_at)
(job_type, status, next_run_at)
(input_ref_type, input_ref_id)
(output_ref_type, output_ref_id)
(module_slug, created_at)
(trigger_source, created_at)
```

Unique:

```text
dedupe_key unique
```

### Allowed values

Define constants/enums in TypeScript.

#### Job type

v1 only:

```text
paid_analysis
```

Do not implement other job types.

#### Status

```text
queued
processing
retry_scheduled
completed
failed_final
```

#### Trigger source

```text
web_unlock
line_bind
short_code
payment_success_future
operator
```

#### Ref types

```text
analysis_result
analysis_paid_result
```

Optional future ref types should not be implemented unless needed.

## Dedupe Key

Implement dedupe key builder.

Recommended shape:

```text
paid_analysis:{moduleSlug}:{analysisResultId}:{promptVersion}:{schemaVersion}
```

Reason:

```text
- avoids duplicate generation for same analysis result and current paid schema/prompt
- allows future regeneration when prompt/schema version changes
```

If current code uses theme_slug/module_id conventions rather than moduleSlug alone, align with repo conventions and document final shape.

Do not include:

```text
raw user input
tokens
LINE IDs
payment IDs unless future required
```

## Repository Helpers

Create repo module, likely:

```text
apps/web/src/lib/db/generation-jobs.ts
```

or repo-consistent path.

Required helpers:

```ts
buildPaidAnalysisJobDedupeKey(args)

createOrReusePaidAnalysisJob(args)

getGenerationJobById(id)

getGenerationJobByDedupeKey(dedupeKey)

markGenerationJobProcessing(args)

markGenerationJobCompleted(args)

markGenerationJobRetryScheduled(args)

markGenerationJobFailedFinal(args)

listDueGenerationJobs(args) // optional but useful for Phase 2
```

### createOrReusePaidAnalysisJob

Input should include:

```text
moduleSlug
analysisResultId
triggerSource
priority optional
promptVersion
schemaVersion
operatorTest optional
modelProvider optional
modelName optional
```

Behavior:

```text
- create queued job if dedupe_key does not exist
- return existing job if dedupe_key exists
- do not create duplicate jobs
```

No provider generation.

No result creation.

No runtime route usage in this phase except tests.

### markProcessing

Future processor helper.

Should:

```text
- set status=processing
- increment attempt_count or set started attempt behavior clearly
- set locked_at
- set locked_by
- update updated_at
```

Be careful with attempt_count semantics. Choose one:

```text
Option A: increment attempt_count when marking processing
Option B: increment only when attempt fails
```

Expected recommendation:

```text
increment attempt_count when claim/processing begins
```

Document.

### markCompleted

Should:

```text
- set status=completed
- set output_ref_type=analysis_paid_result
- set output_ref_id
- clear locked fields if appropriate
- set source/model metadata if provided
```

### markRetryScheduled

Should:

```text
- set status=retry_scheduled
- set next_run_at
- set last_error_category/code/time
- clear lock fields
```

### markFailedFinal

Should:

```text
- set status=failed_final
- set last_error_category/code/time
- clear lock fields
```

## Privacy / Data Safety

generation_jobs must not store:

```text
raw input
redacted input
paid_result_json
provider output
LINE user ID
LINE display name
ID token
LINE message text
fulfillment code
short code
unlock token
tokenized URL
email
DATABASE_URL
ANTHROPIC_API_KEY
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
OPERATOR_TEST_SECRET
NewebPay secrets
```

Store only refs and safe categories.

## Behavior Preservation

This Phase 1 must not alter current runtime behavior.

After merge:

```text
- existing paid generation still works the same
- LIFF bind still works the same
- short-code still works the same
- pending poller still works the same
- payment remains disabled
- no processor runs
- generation_jobs table may exist but no production runtime writes unless explicitly added in a future phase
```

If Codex adds a shadow write for fresh paid generation, it must be explicitly justified and caught best-effort; default recommendation is **no runtime writes in Phase 1**.

## Tests

Add tests for:

```text
dedupe key builder is stable and contains no raw input
createOrReusePaidAnalysisJob creates one queued job
createOrReusePaidAnalysisJob reuses existing job on duplicate dedupe key
markProcessing sets processing and lock fields
markProcessing increments attempt_count according to chosen semantics
markCompleted links analysis_paid_result output ref
markRetryScheduled sets retry_scheduled and next_run_at/error category
markFailedFinal sets failed_final and error category
listDueGenerationJobs returns queued/retry_scheduled due jobs if implemented
privacy guard: no forbidden fields in serialized job fixture
allowed values are enforced or validated
```

Use synthetic fixture IDs only.

Do not call provider.

Do not use real DB data.

## Migration / Live Verification

Do not apply production migration in this task unless explicitly approved.

Recommended follow-up after implementation:

```text
Paid Generation Job Foundation Phase 1 Staging Migration Verification v0
```

For this task:

```text
- create migration
- tests pass
- push to staging branch
```

If repo CI/deploy applies migrations automatically in staging, document expected behavior.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-27-paid-generation-job-foundation-phase-1-schema-repo-v0-review-bundle.md
```

Required sections:

```markdown
# Paid Generation Job Foundation Phase 1 — DB Schema + Repository Seams v0 Review Bundle

Date: 2026-05-27

## 1. Summary

## 2. Migration / Schema

## 3. Constants / Allowed Values

## 4. Dedupe Key

## 5. Repository Helpers

## 6. Privacy / Data Safety

## 7. Behavior Preservation

## 8. Tests Added

## 9. Migration / Deployment Notes

## 10. Known Limitations

## 11. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-27-paid-generation-job-foundation-phase-1-schema-repo-v0-execution-report.md
```

Report structure:

```markdown
# Paid Generation Job Foundation Phase 1 — DB Schema + Repository Seams v0 Execution Report

## Summary

## Files Created

## Files Updated

## Schema Changes

## Repository Helpers

## Behavior Preservation

## Tests Added

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
schema/repo seam summary
behavior preservation status
validation result
commit hash
staging push status
```

## Validation

Run full validation:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint
cd apps/web && corepack pnpm test
cd apps/web && corepack pnpm build
cd apps/web && corepack pnpm test:e2e:local
```

If Playwright is blocked by known Chromium/MachPort issue, record honestly.

## Production Gate

Default:

```text
staging branch only
```

Do not apply production migration.

Do not deploy production.

Production rollout requires separate approval after staging migration verification.

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
runtime paid generation behavior
LINE behavior
LIFF behavior
payment behavior
prompt/schema semantics
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
git commit -m "feat: add paid generation job schema"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
migration/schema summary
repository helper summary
dedupe key behavior
behavior preservation status
tests added
validation results
review bundle path
commit hash
staging push status
Tech Debt / Cleanup Notes
recommended next step
```

Then stop.
