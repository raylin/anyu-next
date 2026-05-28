# Handoff: Paid Generation Job Foundation Phase 2 Production Migration Gate v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Apply and verify the additive `0006_generation_jobs.sql` migration on production so production schema is ready for future paid generation job rollout.

This task must keep `ENABLE_PAID_GENERATION_JOBS` disabled/absent in production.

This is a production DB migration gate, not a runtime behavior switch.

Do not enable paid generation jobs in production.

Do not change runtime behavior.

Do not add processor/cron.

Do not enable payment.

Do not start ads.

## Background

Paid Generation Job Foundation Phase 1 added schema/repository seams.

Commit:

```text
ccf2d90
```

Phase 1 staging migration verification passed.

Commit:

```text
77bdac8
```

Phase 2 enqueue/status integration was implemented behind a disabled-by-default flag.

Commit:

```text
21c1907
```

Phase 2 staging flag verification passed.

Commit:

```text
474678a
```

Staging verification confirmed:

```text
- flag off: normal flow completed and generation_jobs stayed at 0
- flag on: one paid_analysis job reached completed
- attempt_count = 1
- output_ref present
- source provider
- one completed analysis_paid_results row
- status route exposed only external completed, no internals
```

Current production state:

```text
- production 0006_generation_jobs.sql is not applied yet
- production does not have ENABLE_PAID_GENERATION_JOBS
- production behavior remains current direct generation behavior
```

Goal of this task:

```text
Make production schema ready while keeping behavior unchanged.
```

## Scope

Do:

1. Confirm approved migration file.
2. Confirm production candidate/deployment health before migration.
3. Confirm production `ENABLE_PAID_GENERATION_JOBS` is absent or false.
4. Apply `0006_generation_jobs.sql` to production DB only.
5. Verify `generation_jobs` table exists in production.
6. Verify expected columns/defaults/indexes/unique dedupe constraint.
7. Verify production runtime still works with flag disabled.
8. Verify normal production route/API smoke does not write generation_jobs.
9. Record sanitized migration result.
10. Create review bundle, execution report, summary log.
11. Commit and push docs to `origin/staging`.

Do not:

- enable `ENABLE_PAID_GENERATION_JOBS` in production
- add production env flag
- run flag-on production test
- change runtime code
- add processor endpoint
- add cron
- make LINE enqueue-only
- enable payment
- add checkout
- start ads
- record secrets, DB URLs, raw data, tokens, LINE IDs, paid JSON, or provider output

## Production Migration Requirements

Apply only:

```text
apps/web/drizzle/0006_generation_jobs.sql
```

to production DB.

Do not reapply prior migrations unless checking migration history.

Verify production has previous required migrations:

```text
0001 initial
0002 analyze_request_state
0003 line_fulfillment
0004 line_webhook_hardening
0005 two_tier_phase_1
0006 generation_jobs
```

If production already has 0006, do not apply again; verify existing schema and document.

## Production Flag Gate

Before and after migration, verify production env:

```text
ENABLE_PAID_GENERATION_JOBS is absent or false
```

Expected:

```text
production flag disabled
runtime must not read/write generation_jobs
```

If production flag is true, stop before migration/smoke and ask owner for explicit approval to disable it.

Do not print all env values.

Do not print secrets.

## Schema Verification

Verify production table:

```text
generation_jobs
```

Expected columns include:

```text
id
job_type
status
priority
module_slug
input_ref_type
input_ref_id
output_ref_type
output_ref_id
trigger_source
dedupe_key
entitlement_ref_id
attempt_count
max_attempts
next_run_at
locked_at
locked_by
last_error_category
last_error_code
last_error_at
model_provider
model_name
prompt_version
schema_version
source
operator_test
created_at
updated_at
```

Verify unique constraint:

```text
dedupe_key unique
```

Verify expected indexes:

```text
(status, next_run_at)
(job_type, status, next_run_at)
(input_ref_type, input_ref_id)
(output_ref_type, output_ref_id)
(module_slug, created_at)
(trigger_source, created_at)
```

Record structural pass/fail only.

Do not dump rows.

## Production Route/API Regression

Run safe synthetic production smoke after migration with flag disabled.

Minimum checks:

```text
1. GET https://anyu.tw/api/health and record safe build marker.
2. Landing route loads.
3. Synthetic analyze succeeds.
4. Result route loads.
5. Unlock intent succeeds.
6. Paid generation request works under current behavior.
7. Paid status route returns expected external status.
8. Unlocked route renders.
9. LIFF bridge route returns 200.
10. Invalid LIFF bind rejects.
11. Invalid LINE webhook signature rejects.
12. Empty-events webhook returns 200 if applicable.
```

Do not run real LINE client unless owner requests.

Do not record tokenized URLs, short codes, LINE IDs, raw input, paid JSON, provider output, or secrets.

## Runtime Write Verification

After normal production smoke, verify:

```text
generation_jobs row count remains 0
```

or unchanged if there were preexisting non-runtime/synthetic rows.

Expected:

```text
No normal production runtime writes to generation_jobs while flag is disabled.
```

If any row appears, classify as P0 unless explained by explicitly controlled synthetic repo smoke. This task should not create synthetic production rows unless absolutely necessary.

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
dedupe keys if they include internal IDs
job IDs if avoidable
```

Allowed:

```text
table exists
column/index/constraint pass/fail
aggregate row counts
safe build marker
external route statuses
safe provider/fallback aggregate if needed
```

## Issue Severity

Classify findings:

```text
P0:
  production migration fails partially
  production runtime breaks
  production flag accidentally enabled
  generation_jobs receives writes while flag disabled
  sensitive values recorded

P1:
  missing required index/constraint
  route/API regression
  health marker mismatch or unknown when expected

P2:
  docs mismatch
  non-blocking verification gap
```

P0 requires stop/rollback recommendation.

## Rollback / Recovery

If migration fails:

```text
- stop
- do not continue smoke if DB state uncertain
- document exact safe failure category
- recommend DB rollback only with owner approval
```

If runtime breaks:

```text
- revert deployment if caused by code
- migration is additive, so rollback may not be necessary
- keep flag disabled
```

If generation_jobs receives writes unexpectedly:

```text
- confirm production flag state
- stop and diagnose before further rollout
```

## Production Recommendation After Pass

If migration and smoke pass:

```text
production schema ready
ENABLE_PAID_GENERATION_JOBS remains disabled
runtime behavior unchanged
Phase 2 production flag enablement remains a separate approval
```

Recommended next step after pass:

```text
Phase 3 Processor / Cron Plan v0
```

or:

```text
Phase 2 Production Flag-On Smoke v0
```

But only after owner chooses.

Given no processor exists yet, recommended default:

```text
Plan Phase 3 before enabling production flag.
```

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-27-paid-generation-job-foundation-phase-2-production-migration-gate-v0-review-bundle.md
```

Required sections:

```markdown
# Paid Generation Job Foundation Phase 2 Production Migration Gate v0 Review Bundle

Date: 2026-05-27

## 1. Summary

## 2. Pre-migration Production State

## 3. Production Flag Gate

## 4. Migration Application

## 5. Schema / Index / Constraint Verification

## 6. Production Route/API Regression

## 7. Runtime Write Verification

## 8. Privacy / Data Safety

## 9. Issues Found

## 10. Production Recommendation

## 11. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-27-paid-generation-job-foundation-phase-2-production-migration-gate-v0-execution-report.md
```

Report structure:

```markdown
# Paid Generation Job Foundation Phase 2 Production Migration Gate v0 Execution Report

## Summary

## Files Created

## Files Updated

## Production Migration Status

## Production Flag Status

## Schema Verification

## Runtime Regression Result

## Runtime Write Verification

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
production migration status
flag status
runtime regression status
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
dedupe keys in reports if they contain IDs
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "ops: apply generation jobs production migration"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
production migration status
flag status
schema/index verification
runtime regression status
runtime write verification
production recommendation
validation results
review bundle path
commit hash
staging push status
Tech Debt / Cleanup Notes
recommended next step
```

Then stop.
