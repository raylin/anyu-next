# Handoff: Paid Generation Job Foundation Phase 2 — Enqueue / Status Integration v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Implement Phase 2 of the Paid Generation Job Foundation by feature-flagging paid_analysis job mirroring into the current direct paid generation lifecycle.

This task should connect `generation_jobs` to the existing deferred paid generation service and paid-result status route while preserving current behavior.

This is an implementation task, but it must be rollout-safe.

Default behavior must remain unchanged.

Do not enable production behavior by default.

Do not add processor/cron.

Do not make LINE enqueue-only.

Do not enable payment.

## Background

### Phase 1

Paid Generation Job Foundation Phase 1 — DB Schema + Repository Seams v0 completed.

Commit:

```text
ccf2d90
```

Added:

```text
- generation_jobs migration
- Drizzle schema
- repository helpers
- paid_analysis-only lifecycle states
- stable dedupe key
```

### Phase 1 staging verification

Paid Generation Job Foundation Phase 1 Staging Migration Verification v0 passed.

Commit:

```text
77bdac8
```

Verified:

```text
- 0006_generation_jobs.sql applied to staging only
- table/columns/defaults/indexes verified
- synthetic repo smoke passed and cleaned up
- normal runtime still wrote 0 rows to generation_jobs
- production migration remains pending
```

### Phase 2 plan

Paid Generation Job Foundation Phase 2 — Enqueue / Status Integration Plan v0 completed.

Commit:

```text
13802bb
```

Decision:

```text
Use Option B:
create/reuse paid_analysis job, mirror current direct generation lifecycle, and keep current user-facing behavior.

Feature flag:
ENABLE_PAID_GENERATION_JOBS=false by default.

Integration point:
requestDeferredPaidGeneration.

LINE/LIFF/short-code:
Do not switch to enqueue-only in Phase 2.
```

## Scope

Do:

1. Add feature flag for paid generation jobs.
2. When flag is enabled, create/reuse a paid_analysis job inside `requestDeferredPaidGeneration`.
3. Mirror current direct generation lifecycle into `generation_jobs`.
4. Preserve direct provider generation behavior.
5. Preserve current result storage in `analysis_paid_results`.
6. Update paid-result status route to optionally read job state when flag is enabled.
7. Keep external status mapping simple.
8. Fail open if job mirroring fails.
9. Add safe job events/metadata if appropriate.
10. Add/update tests.
11. Create review bundle, execution report, summary log.
12. Commit and push to `origin/staging`.

Do not:

- add processor endpoint
- add Vercel Cron
- make generation fully enqueue-only
- change LINE webhook behavior
- change LIFF bind behavior
- change short-code behavior
- change payment behavior
- enable NewebPay
- change prompt/schema semantics
- change pending UI copy unless necessary for existing mapping
- apply production migration
- deploy production

## Feature Flag

Add feature flag:

```text
ENABLE_PAID_GENERATION_JOBS
```

Default:

```text
false
```

Behavior:

```text
false:
  current runtime behavior unchanged.
  no generation_jobs reads/writes from runtime.

true:
  requestDeferredPaidGeneration mirrors current direct generation lifecycle into generation_jobs.
  status route may read generation_jobs state as secondary signal.
```

If repo has existing env/feature flag helpers, use them.

Do not expose flag value publicly.

## Fail-open Policy

Phase 2 must fail open.

If job mirroring fails:

```text
- continue existing paid generation path
- do not break user-facing paid generation
- record safe internal error category if current event system supports it
- do not expose raw error to user
```

Reason:

```text
generation_jobs is still observability/transition seam in Phase 2, not the source of delivery truth.
```

Do not fail closed until processor/cron exists and is proven.

## requestDeferredPaidGeneration Integration

Likely file:

```text
apps/web/src/lib/modules/paid-generation-service.ts
```

or current service-level helper.

When flag is enabled:

### Before generation

```text
1. Build dedupe key using current moduleSlug, analysisResultId, promptVersion, schemaVersion.
2. createOrReusePaidAnalysisJob.
3. If completed paid result already exists, mark/reconcile job completed if safe.
4. If generation needed, mark job processing.
```

### During generation

Continue current direct generation path.

Do not change provider behavior.

Do not change fallback behavior.

Do not change prompt/schema.

### On success

```text
- store paid result in analysis_paid_results as today
- mark job completed with output_ref_type=analysis_paid_result and output_ref_id
- include safe model/source metadata if available
```

### On retryable/output failure

Plan implementation should align with existing current retry/fallback behavior.

If current path recovers via retry/fallback and returns completed result:

```text
mark job completed with source provider/fallback
```

If current path ends in public failure:

```text
mark retry_scheduled or failed_final according to current error category
```

Since Phase 2 has no processor, avoid leaving user-facing flows waiting on retry_scheduled jobs that nobody processes.

Recommended:

```text
If the direct generation route returns failure to the user, mark failed_final.
Use retry_scheduled only if current runtime will actually retry synchronously or immediately.
```

Codex should inspect current retry behavior and document final choice.

## Status Route Integration

Likely file:

```text
apps/web/src/app/api/modules/[moduleSlug]/paid-result/status/route.ts
```

When feature flag is false:

```text
current behavior unchanged.
```

When feature flag is true:

Status priority:

```text
1. completed paid result exists → completed
2. generation job status processing → processing
3. generation job status queued/retry_scheduled → pending or processing-safe mapped status
4. generation job status failed_final → failed
5. bound/delivered/claimed intent but no job/result → pending/claimed_missing as today
6. no claim/request → missing/not_requested as today
```

External statuses must remain simple.

Allowed external statuses:

```text
missing
pending
processing
completed
failed
expired
```

Do not expose:

```text
job id
attempt count
internal status
locked_by
error code details
dedupe_key
```

## LINE / LIFF / Short-code Treatment

Do not intentionally change these behaviors in Phase 2:

```text
LINE webhook
short-code matching
LIFF bind
LIFF bridge
theme carryover
webhook signature validation
LIFF ID token validation
```

If these paths call `requestDeferredPaidGeneration`, they may get job mirroring automatically when flag is enabled. That is acceptable only if:

```text
- user-facing behavior remains unchanged
- errors fail open
- tests cover unchanged LINE route behavior
```

Do not make them enqueue-only.

That is Phase 4.

## Production Migration Gate

Production does not yet have `generation_jobs`.

Phase 2 runtime must be safe before production migration.

Rules:

```text
- ENABLE_PAID_GENERATION_JOBS=false by default.
- If production deploy happens before production migration, routes must not touch generation_jobs because flag is false.
- Before enabling the flag in production, apply and verify 0006_generation_jobs.sql in production.
```

Add docs/runbook note:

```text
Do not enable ENABLE_PAID_GENERATION_JOBS in production until production 0006 migration is applied and verified.
```

## Staging Behavior

Staging DB already has 0006 applied.

Recommended staging rollout:

```text
1. Deploy Phase 2 code to staging.
2. Keep flag false first; verify no runtime writes.
3. Enable flag in staging only.
4. Run synthetic paid generation.
5. Verify generation_jobs job lifecycle mirrors direct generation.
6. Verify user-facing behavior unchanged.
```

If environment flag management is out of scope for Codex shell, document manual step.

## Events / Metadata

Add events only if current event system makes it easy and safe.

Potential events:

```text
paid_generation_job_created
paid_generation_job_reused
paid_generation_job_processing
paid_generation_job_completed
paid_generation_job_failed_final
paid_generation_job_mirror_failed
```

Safe metadata only:

```text
jobType
status
triggerSource
schemaVersion
promptVersion
source provider/fallback/unknown
errorCategory
operatorTest
```

Do not include:

```text
raw input
paid_result_json
provider output
LINE user ID
unlock token
dedupe_key if it contains analysisResultId and is considered sensitive
tokenized URL
secrets
```

If event semantics feel too risky, skip new events and rely on DB rows/tests for Phase 2.

## Tests

Add/update tests for:

### Feature flag

```text
flag false keeps old behavior and does not call generation_jobs repo
flag true calls createOrReusePaidAnalysisJob
```

### requestDeferredPaidGeneration

```text
flag true creates/reuses job
flag true marks processing before direct generation
success marks completed with output ref
fallback success marks completed with fallback source
job mirror failure fails open and still returns current result
completed existing paid result short-circuits and reconciles job if safe
```

### Status route

```text
completed paid result wins over job state
processing job maps to processing
queued/retry_scheduled job maps to pending or processing-safe status
failed_final job maps to failed
claimed_missing behavior still works when no job/result
flag false preserves old status behavior
no job internals exposed
```

### LINE/LIFF regression

```text
invalid LIFF bind still rejects
invalid LINE webhook signature still rejects
empty events webhook still returns 200
short-code route behavior unchanged if covered
```

### Privacy

```text
no raw input/paid_result_json/token/LINE ID/dedupe key exposed in response/events
```

Use mocks/synthetic data only.

Do not call real provider in unit tests.

## Validation / Staging Smoke

Run normal validation.

If possible after staging deploy:

### Flag false

```text
- synthetic paid generation still works
- generation_jobs remains unchanged from normal flow
```

### Flag true on staging

```text
- synthetic paid generation works
- generation_jobs row created/reused
- status transitions queued/processing/completed reflected
- paid result still stored in analysis_paid_results
- unlocked route renders
- no LINE behavior regression
```

Do not enable in production.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-27-paid-generation-job-foundation-phase-2-enqueue-status-integration-v0-review-bundle.md
```

Required sections:

```markdown
# Paid Generation Job Foundation Phase 2 — Enqueue / Status Integration v0 Review Bundle

Date: 2026-05-27

## 1. Summary

## 2. Feature Flag Behavior

## 3. Request Route / Service Integration

## 4. Status Route Mapping

## 5. Fail-open Behavior

## 6. LINE / LIFF / Short-code Preservation

## 7. Production Migration Gate

## 8. Events / Metadata

## 9. Tests Added

## 10. Staging Verification

## 11. Known Limitations

## 12. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-27-paid-generation-job-foundation-phase-2-enqueue-status-integration-v0-execution-report.md
```

Report structure:

```markdown
# Paid Generation Job Foundation Phase 2 — Enqueue / Status Integration v0 Execution Report

## Summary

## Files Created

## Files Updated

## Feature Flag

## Service Integration

## Status Route Integration

## Fail-open / Rollback

## LINE / LIFF / Short-code Preservation

## Production Migration Gate

## Tests Added

## Staging Verification

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
Phase 2 integration summary
feature flag status
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

Do not enable flag in production.

Do not apply production migration in this task unless separately approved.

If code deploys to production with flag false, runtime should not access generation_jobs.

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
LINE behavior
LIFF behavior
payment behavior
prompt/schema semantics
legal semantics
event names unless adding explicitly safe new job events
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
git commit -m "feat: mirror paid generation jobs"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
feature flag behavior
service integration summary
status route mapping
fail-open behavior
LINE/LIFF preservation
production migration gate
tests added
staging verification
validation results
review bundle path
commit hash
staging push status
Tech Debt / Cleanup Notes
recommended next step
```

Then stop.
