# Handoff: Paid Generation Job Foundation Phase 2 Staging Flag Verification v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Verify the Phase 2 paid generation job mirroring implementation on staging with `ENABLE_PAID_GENERATION_JOBS` both disabled and enabled.

This task should confirm that:

1. With the flag disabled, staging behavior remains unchanged and normal flows do not write to `generation_jobs`.
2. With the flag enabled on staging only, paid generation mirrors lifecycle state into `generation_jobs` while preserving existing user-facing behavior and delivery truth in `analysis_paid_results`.

This is a staging verification task.

Do not apply production migration.

Do not enable production flag.

Do not deploy production.

Do not change runtime code unless a small staging-blocking bug fix is required.

## Background

Paid Generation Job Foundation Phase 2 — Enqueue / Status Integration v0 completed.

Commit:

```text
21c1907
```

What changed:

```text
- Added ENABLE_PAID_GENERATION_JOBS=false by default.
- When false, runtime does not read/write generation_jobs.
- When true, requestDeferredPaidGeneration mirrors lifecycle into generation_jobs:
  create/reuse → processing → completed / failed_final.
- Direct provider/fallback generation still runs as before.
- analysis_paid_results remains delivery truth.
- Status route may read job state only when flag is enabled.
- LINE/LIFF/short-code behavior is preserved.
- No processor/cron exists yet.
```

Current DB state:

```text
- Staging DB has 0006_generation_jobs applied and verified.
- Production DB does not have 0006 and must not be touched in this task.
```

## Scope

Do:

1. Confirm staging deployment includes commit `21c1907` or newer.
2. Verify staging `/api/health` build marker.
3. Run flag-off staging smoke.
4. Confirm `generation_jobs` row count stays unchanged during flag-off normal flows.
5. Enable `ENABLE_PAID_GENERATION_JOBS=true` on staging only.
6. Refresh/redeploy staging if needed.
7. Run flag-on synthetic paid generation smoke.
8. Verify expected `generation_jobs` row is created/reused.
9. Verify job transitions reach completed.
10. Verify `analysis_paid_results` still stores the delivered paid result.
11. Verify status route remains safe and simple.
12. Verify unlocked route renders.
13. Verify LINE/LIFF/short-code route-level regressions remain healthy.
14. Verify no sensitive values are recorded.
15. Create review bundle, execution report, summary log.
16. Commit and push to `origin/staging`.

Do not:

- apply production 0006 migration
- enable `ENABLE_PAID_GENERATION_JOBS` in production
- deploy production
- add processor endpoint
- add cron
- make LINE enqueue-only
- change payment behavior
- change prompt/schema
- change paid generation behavior
- expose job internals to clients
- record raw input, paid JSON, provider output, tokens, LINE IDs, or secrets

## Staging Flag-off Verification

With:

```text
ENABLE_PAID_GENERATION_JOBS=false
```

or unset.

Run staging checks:

```text
1. landing loads
2. synthetic analyze succeeds
3. result route loads
4. unlock intent succeeds
5. paid generation request succeeds
6. paid status route returns expected current status
7. unlocked route renders
8. LIFF bridge route returns 200
9. invalid LIFF bind rejects
10. invalid LINE webhook signature rejects
11. empty-events webhook returns 200 if applicable
```

Verify:

```text
generation_jobs row count remains unchanged after normal flows
```

Expected:

```text
No generation_jobs writes when flag is false.
Current user-facing behavior unchanged.
```

## Staging Flag-on Verification

Enable on staging only:

```text
ENABLE_PAID_GENERATION_JOBS=true
```

Do not enable in production.

After env change, refresh/redeploy staging if needed.

Run synthetic flow:

```text
1. fresh analyze with synthetic input
2. unlock intent
3. paid generation request
4. paid status polling
5. unlocked route
```

Verify generation_jobs:

```text
- one paid_analysis job created or reused
- dedupe key reuse works if repeated request is made
- status reaches completed after successful direct generation
- attempt_count increments according to Phase 1 semantics
- output_ref_type = analysis_paid_result
- output_ref_id points to completed result
- source is provider or fallback as safe aggregate
- no raw input / paid JSON / provider output / token / LINE ID is stored
```

If duplicate request is safe to run:

```text
repeat paid generation request
verify same job reused, not duplicated
```

Do not record dedupe key if it contains internal IDs.

## Status Route Verification

With flag enabled, verify status route mapping:

```text
completed paid result exists → external status completed
job processing → external processing if observable
job queued/retry_scheduled → external pending/processing-safe if observable
job failed_final → external failed if safe to simulate in unit tests only
claimed_missing fallback still works
```

For live staging, completed path may be enough.

Ensure response does not expose:

```text
job id
dedupe key
attempt count
locked_at
locked_by
last_error_code
internal status
```

## LINE / LIFF / Short-code Regression

Do not run real LINE client unless explicitly needed.

Run route/API regressions:

```text
- LIFF bridge route 200
- invalid LIFF bind rejects
- invalid LINE webhook signature rejects
- empty-events webhook verification 200
- short-code webhook route behavior unchanged if synthetic route check exists
```

If these paths call requestDeferredPaidGeneration and flag is enabled, ensure any job mirror failure is fail-open and does not affect responses.

## Privacy / Data Safety

Reports must not include:

```text
DATABASE_URL
raw input
redacted input text
full result JSON
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
ANTHROPIC_API_KEY
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
OPERATOR_TEST_SECRET
NewebPay secrets
dedupe key if it includes internal IDs
job ID if avoidable
```

Allowed:

```text
pass/fail
route names
external statuses
safe status counts
safe row counts
job type paid_analysis
safe source provider/fallback
safe error category
```

## Issue Severity

Classify findings:

```text
P0:
  flag false writes to generation_jobs
  flag on breaks paid generation
  status route exposes internals/secrets
  sensitive values recorded
  LINE/LIFF route regression

P1:
  duplicate request creates duplicate jobs
  job completed without paid result delivery truth
  status mapping inconsistent
  job mirror failure does not fail open

P2:
  documentation mismatch
  non-blocking row count/reporting issue
```

P0 blocks Phase 2 rollout.

P1 should be fixed before production migration/flag consideration.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-27-paid-generation-job-foundation-phase-2-staging-flag-verification-v0-review-bundle.md
```

Required sections:

```markdown
# Paid Generation Job Foundation Phase 2 Staging Flag Verification v0 Review Bundle

Date: 2026-05-27

## 1. Summary

## 2. Staging Freshness

## 3. Flag-off Verification

## 4. Flag-on Verification

## 5. Job Lifecycle Verification

## 6. Status Route Verification

## 7. LINE / LIFF / Short-code Regression

## 8. Privacy / Data Safety

## 9. Issues Found

## 10. Production Readiness Recommendation

## 11. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-27-paid-generation-job-foundation-phase-2-staging-flag-verification-v0-execution-report.md
```

Report structure:

```markdown
# Paid Generation Job Foundation Phase 2 Staging Flag Verification v0 Execution Report

## Summary

## Files Created

## Files Updated

## Staging Deployment / Flag Status

## Flag-off Result

## Flag-on Result

## Job Lifecycle Result

## Status Route Result

## Regression Result

## Privacy / Data Safety Result

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
flag-off result
flag-on result
job lifecycle summary
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
```

If code changes are made, also run:

```bash
cd apps/web && corepack pnpm test:e2e:local
```

If Playwright is blocked by known Chromium/MachPort issue, record honestly.

## Production Gate

Do not apply production migration.

Do not enable production flag.

If staging flag-on verification passes, recommended next step should be:

```text
Paid Generation Job Foundation Phase 2 Production Migration Gate v0
```

or:

```text
Phase 3 Processor / Cron Plan v0
```

depending on owner approval.

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
runtime behavior beyond staging env flag verification
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
dedupe keys in reports if they contain IDs
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "ops: verify paid job flag on staging"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
flag-off result
flag-on result
job lifecycle result
status route result
LINE/LIFF regression result
privacy result
production recommendation
validation results
review bundle path
commit hash
staging push status
Tech Debt / Cleanup Notes
recommended next step
```

Then stop.
