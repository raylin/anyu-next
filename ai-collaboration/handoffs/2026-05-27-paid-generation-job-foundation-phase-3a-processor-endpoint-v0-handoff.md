# Handoff: Paid Generation Job Foundation Phase 3A — Processor Endpoint + Claim Service v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Implement Phase 3A of the Paid Generation Job Foundation: a secret-gated internal processor endpoint and claim/stale-recovery service for `paid_analysis` generation jobs.

This task should allow staging/operator tests to process existing `generation_jobs` rows through a controlled internal endpoint, without changing normal user-facing request routes.

This is an implementation task, but it must preserve existing product behavior.

Do not switch request routes to enqueue-only.

Do not add Vercel Cron yet.

Do not enable production processor.

Do not change LINE / LIFF / short-code behavior.

Do not enable payment.

## Background

### Phase 1 — Schema + repo seams

Completed at:

```text
ccf2d90
```

Added:

```text
generation_jobs table
repo helpers
dedupe key
paid_analysis lifecycle statuses
```

### Phase 1 staging verification

Completed at:

```text
77bdac8
```

Verified staging `generation_jobs` schema and repo smoke.

### Phase 2 — Enqueue / status integration

Completed at:

```text
21c1907
```

Added:

```text
ENABLE_PAID_GENERATION_JOBS=false by default
job mirroring when flag enabled
status route safe mapping
direct generation still delivery path
```

### Phase 2 staging verification

Completed at:

```text
474678a
```

Verified:

```text
flag off: no generation_jobs writes
flag on: one paid_analysis job completed via direct generation mirror
```

### Phase 2 production migration gate

Completed at:

```text
bb0cc22
```

Verified:

```text
production has generation_jobs schema
production flag absent/disabled
production runtime unchanged
generation_jobs row count stayed 0 after smoke
```

### Phase 3 plan

Completed at:

```text
00836b0
```

Recommended:

```text
Phase 3A Option A:
processor exists but request route remains direct-generation.
Implement secret-gated POST /api/internal/jobs/process.
Use atomic FOR UPDATE SKIP LOCKED claim.
Recover stale locks inside each processor run.
Return aggregate-only response.
Do not make request route enqueue-only yet.
```

## Scope

Do:

1. Add processor feature flag if needed.
2. Add atomic claim helper for due `paid_analysis` jobs.
3. Add stale lock recovery helper.
4. Add processor service for `paid_analysis` jobs.
5. Add secret-gated internal processor endpoint.
6. Ensure processor response is aggregate-only.
7. Reuse or extract shared paid generation execution core carefully.
8. Preserve current request route behavior.
9. Add tests.
10. Run staging smoke if feasible.
11. Create review bundle, execution report, summary log.
12. Commit and push to `origin/staging`.

Do not:

- add Vercel Cron
- switch paid-result request route to enqueue-only
- change current request route user-facing behavior
- change LINE webhook behavior
- change LIFF bind behavior
- change short-code behavior
- change payment behavior
- enable production processor
- enable payment
- introduce external queue vendor
- build admin UI
- expose job internals to public clients

## Feature Flags / Secrets

### Processor execution flag

Add if useful:

```text
ENABLE_PAID_GENERATION_PROCESSOR
```

Default:

```text
false
```

Expected behavior:

```text
false:
  processor endpoint should reject or no-op safely, depending on final design.

true:
  processor endpoint can process due paid_analysis jobs when secret is valid.
```

If Codex believes the secret alone is sufficient, document why. Recommended: use both secret and optional flag for production safety.

### Secret

Use one of:

```text
INTERNAL_JOB_SECRET
CRON_SECRET
```

Decision required:

```text
Prefer INTERNAL_JOB_SECRET if introducing a dedicated processor secret is straightforward.
Use CRON_SECRET only if repo already standardizes on it.
```

Never print or commit secret values.

Endpoint must reject without valid secret.

## Processor Endpoint

Recommended route:

```text
POST /api/internal/jobs/process
```

Allowed request body:

```json
{
  "jobType": "paid_analysis",
  "limit": 1,
  "dryRun": false
}
```

V1 may keep body simpler.

Required constraints:

```text
- Only support jobType = paid_analysis.
- Enforce max limit, e.g. 1–3 jobs per run.
- Require secret.
- Return aggregate-only response.
- No raw job rows.
- No job IDs.
- No dedupe keys.
- No paid result JSON.
- No provider output.
```

Suggested response:

```json
{
  "ok": true,
  "dryRun": false,
  "processed": 1,
  "completed": 1,
  "retryScheduled": 0,
  "failedFinal": 0,
  "staleRecovered": 0,
  "skipped": 0
}
```

For unauthorized:

```text
401
```

For disabled:

```text
404 or 403 or 200 no-op
```

Recommended:

```text
403 when processor feature flag is disabled.
```

Do not leak whether a secret was close/wrong.

## Claim Helper

Add to generation job repo/service.

Requirements:

```text
- claim queued/retry_scheduled jobs due now.
- only job_type = paid_analysis.
- status in queued or retry_scheduled.
- next_run_at <= now().
- order by priority desc, next_run_at asc, created_at asc.
- limit N.
- atomically set status=processing.
- set locked_at=now().
- set locked_by to safe worker id.
- increment attempt_count.
- return claimed jobs to processor.
```

Use Postgres locking if possible:

```sql
FOR UPDATE SKIP LOCKED
```

If Drizzle makes this hard, use safe parameterized SQL.

Do not create raw SQL with untrusted strings.

## Stale Lock Recovery

Add helper:

```text
recoverStaleGenerationJobs
```

Recommended behavior:

```text
Find processing jobs with locked_at older than timeout.
For each:
  if attempt_count < max_attempts:
    status = retry_scheduled
    next_run_at = now()
    last_error_category = stale_lock_recovered
    clear locked_at / locked_by
  else:
    status = failed_final
    last_error_category = stale_lock_failed_final
    clear locked_at / locked_by
```

Suggested timeout:

```text
10 minutes
```

Processor should run stale recovery before claiming new jobs.

Response should include aggregate staleRecovered count.

## Paid Analysis Processing

Processor should process each claimed job:

```text
1. Resolve input_ref_type = analysis_result.
2. Load analysis result and required request/context.
3. If completed paid result already exists for current prompt/schema:
   - mark job completed with existing output_ref.
   - do not call provider.
4. Otherwise call shared paid generation execution core.
5. Store completed result in analysis_paid_results.
6. Mark job completed.
7. On retryable failure, mark retry_scheduled.
8. On final failure, mark failed_final.
```

## Shared Paid Generation Execution Core

Current paid generation is embedded in requestDeferredPaidGeneration.

Phase 3A may need a shared function so both:

```text
requestDeferredPaidGeneration
processor service
```

can invoke the same provider/fallback generation logic without duplicating code.

Important constraints:

```text
- Do not change requestDeferredPaidGeneration behavior.
- Extract only if safe.
- Preserve existing tests.
- Preserve current provider/fallback behavior.
- Preserve existing semantic validation.
- Preserve evidenceSummary schema v3 behavior.
```

Potential helper:

```text
generateAndStoreDeferredPaidResult(...)
```

or repo-consistent name.

If extraction is too risky, processor may call an internal service path, but avoid HTTP-calling public routes.

## Retry / Backoff

Initial policy:

```text
maxAttempts = 3

attempt 1: immediate
attempt 2: +30 seconds
attempt 3: +2 minutes
failed_final after max attempts
```

Error categories:

```text
output_validation: retryable
provider_timeout: retryable
provider_rate_limit: retryable with longer backoff
provider_auth_error: failed_final
input_invalid: failed_final
not_found: failed_final
unknown: retry once then failed_final
```

If existing error categories differ, map safely.

For Phase 3A, if uncertainty is high:

```text
unknown -> retry once, then failed_final
```

## Fallback Policy

Preserve current fallback behavior for beta.

If current generation path completes via fallback:

```text
mark job completed with source=fallback
```

Do not change product/support policy for real payment in this task.

Document:

```text
Fallback-after-payment policy remains a future owner decision.
```

## Dry Run

Optional but recommended.

Dry run should:

```text
- recover stale? probably no
- list aggregate due counts without claiming
- return counts only
```

If dry-run adds complexity, defer and document.

## Events / Metrics

Add safe internal events if current event system supports them easily:

```text
paid_generation_job_processor_run
paid_generation_job_completed
paid_generation_job_retry_scheduled
paid_generation_job_failed_final
paid_generation_job_stale_recovered
```

Safe metadata only:

```text
jobType
status
source provider/fallback/unknown
errorCategory
attemptBucket
operatorTest
```

Do not include:

```text
job id
dedupe key
analysis result id
raw input
paid result JSON
provider output
LINE ID
tokens
```

If event integration risks churn, skip events and rely on aggregate endpoint response + DB.

## Staging Verification

After implementation:

### Flag/secret disabled

```text
POST /api/internal/jobs/process without secret -> 401
with secret but processor flag disabled -> 403 or documented safe response
```

### Flag/secret enabled on staging only

Use synthetic job row.

Flow:

```text
1. Create queued paid_analysis job with synthetic/real staging analysis result from synthetic analyze.
2. POST processor with valid secret.
3. Verify job claimed and completed.
4. Verify analysis_paid_results completed.
5. Verify endpoint response aggregate-only.
6. Verify status route sees completed paid result.
7. Verify unlocked route renders.
```

Do not run production processor.

Do not enable production flag.

## Production Safety

Production should remain:

```text
ENABLE_PAID_GENERATION_PROCESSOR absent/false
ENABLE_PAID_GENERATION_JOBS absent/false unless separately approved
```

Endpoint may exist in production code but must reject if secret missing/flag disabled.

Do not add Vercel Cron in this task.

## Tests

Add/update tests:

### Endpoint security

```text
missing secret -> 401
invalid secret -> 401
valid secret but processor disabled -> 403/no-op
valid secret and enabled -> aggregate response
response does not expose job ids/dedupe/raw data
```

### Claim helper

```text
claims queued due jobs
claims retry_scheduled due jobs
does not claim future next_run_at
does not claim completed/failed_final
increments attempt_count
sets locked_at/locked_by
respects limit
```

### Stale recovery

```text
processing stale job below max attempts -> retry_scheduled
processing stale job at max attempts -> failed_final
non-stale processing job unaffected
```

### Processor flow

```text
completed paid result already exists -> job completed without provider call
successful provider generation -> result stored and job completed
fallback generation -> job completed with fallback source
retryable failure -> retry_scheduled or failed_final per attempt count
final failure -> failed_final
```

### Privacy

```text
endpoint response excludes job id/dedupe key/raw input/paid JSON/tokens/LINE IDs
events/metadata exclude forbidden fields if events added
```

Use synthetic data only.

Do not call real provider in unit tests.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-27-paid-generation-job-foundation-phase-3a-processor-endpoint-v0-review-bundle.md
```

Required sections:

```markdown
# Paid Generation Job Foundation Phase 3A — Processor Endpoint + Claim Service v0 Review Bundle

Date: 2026-05-27

## 1. Summary

## 2. Processor Endpoint

## 3. Security / Secret Handling

## 4. Claim / Lock Helper

## 5. Stale Recovery

## 6. Paid Analysis Processing

## 7. Retry / Backoff / Fallback

## 8. Events / Metrics

## 9. Staging Verification

## 10. Production Safety

## 11. Tests Added

## 12. Known Limitations

## 13. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-27-paid-generation-job-foundation-phase-3a-processor-endpoint-v0-execution-report.md
```

Report structure:

```markdown
# Paid Generation Job Foundation Phase 3A — Processor Endpoint + Claim Service v0 Execution Report

## Summary

## Files Created

## Files Updated

## Processor Endpoint

## Claim / Stale Recovery

## Paid Analysis Processing

## Security / Privacy

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
processor endpoint summary
staging verification summary
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

Do not enable production processor.

Do not add cron.

Do not run production processor.

Production endpoint must remain inaccessible/inactive without secret and flag.

## Constraints

Do not implement:

```text
Vercel Cron
request route enqueue-only
LINE enqueue-only
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
user-facing product behavior
LINE behavior
LIFF behavior
payment behavior
prompt/schema semantics
legal semantics
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
CRON_SECRET
INTERNAL_JOB_SECRET
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
job IDs in reports if avoidable
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "feat: add paid job processor"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
processor endpoint summary
secret/flag behavior
claim/stale recovery summary
paid processing summary
staging verification
production safety
tests added
validation results
review bundle path
commit hash
staging push status
Tech Debt / Cleanup Notes
recommended next step
```

Then stop.
