# Handoff: Paid Generation Job Foundation Phase 1 Staging Migration Verification v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Apply and verify the additive `0006_generation_jobs.sql` migration on staging, then run safe staging regression checks to confirm existing Module 01 flows remain unaffected.

This is a staging migration verification task.

Do not apply production migration.

Do not switch runtime behavior to use `generation_jobs`.

Do not change paid generation runtime.

Do not change LINE / LIFF / short-code behavior.

Do not enable processor / cron.

Do not enable payment.

## Background

Paid Generation Job Foundation Phase 1 — DB Schema + Repository Seams v0 completed.

Commit:

```text
ccf2d90
```

What was added:

```text
- apps/web/drizzle/0006_generation_jobs.sql
- Drizzle schema for generation_jobs
- generation-jobs repository seam
- paid_analysis-only job lifecycle helpers
- dedupe key:
  paid_analysis:{moduleSlug}:{analysisResultId}:{promptVersion}:{schemaVersion}
- tests for allowed values, dedupe, lifecycle transitions, due-job listing, privacy-safe fixtures
```

Important:

```text
No runtime route imports or writes generation_jobs in Phase 1.
Existing production/staging behavior should remain unchanged.
```

Next gate:

```text
Verify 0006_generation_jobs.sql on staging before considering production migration or Phase 2 enqueue/status integration.
```

## Scope

Do:

1. Confirm staging branch/deployment freshness includes commit `ccf2d90` or newer.
2. Apply `0006_generation_jobs.sql` to staging DB only.
3. Verify `generation_jobs` table exists.
4. Verify expected columns exist.
5. Verify allowed/default column behavior if practical.
6. Verify indexes and unique constraint exist.
7. Run safe repository-level smoke if feasible.
8. Run staging route/API regression checks for existing Module 01 behavior.
9. Confirm no runtime writes to `generation_jobs` occur from normal flows.
10. Record sanitized schema verification results.
11. Create review bundle, execution report, summary log.
12. Commit and push to `origin/staging`.

Do not:

- apply migration to production
- deploy production
- change runtime behavior
- import generation job repo in production routes
- enqueue jobs
- add processor endpoint
- add cron
- change LINE / LIFF / short-code semantics
- change paid-generation route behavior
- change paid-status route behavior
- change prompt/schema/cache
- expose DB URLs or secrets
- dump table rows containing user-related data

## Staging Migration Requirements

Apply only:

```text
apps/web/drizzle/0006_generation_jobs.sql
```

to staging / preview DB.

Do not apply to production.

Verify existing migrations remain present:

```text
0001 initial
0002 analyze_request_state
0003 line_fulfillment
0004 line_webhook_hardening
0005 two_tier_phase_1
0006 generation_jobs
```

If staging DB already has 0006, verify idempotently and document.

## Schema Verification

Verify table:

```text
generation_jobs
```

Expected columns include, adjusting for repo conventions:

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

Verify useful indexes, if migration defines them:

```text
(status, next_run_at)
(job_type, status, next_run_at)
(input_ref_type, input_ref_id)
(output_ref_type, output_ref_id)
(module_slug, created_at)
(trigger_source, created_at)
```

Record only structural facts.

Do not dump user rows.

## Repository Smoke

If safe and easy, run a staging-safe repo smoke using synthetic UUIDs or a transaction that rolls back.

Preferred:

```text
- create synthetic paid_analysis job
- createOrReuse returns same row for duplicate dedupe key
- markProcessing updates status/attempt_count/lock fields
- markRetryScheduled updates status/nextRunAt/error category
- markFailedFinal updates status/error category
```

If writing synthetic staging rows is undesirable, skip live repo writes and document that unit tests cover repository lifecycle.

If any synthetic row is written, ensure it contains no raw input, no tokens, no LINE IDs, no paid JSON, and mark it clearly synthetic/operator if schema allows.

Do not use real user data.

## Runtime Regression Checks

Because runtime should be unchanged, run safe staging checks:

```text
1. landing loads.
2. input threshold route/UI still works if route-level check is available.
3. synthetic fresh analyze returns 200.
4. result route returns 200.
5. unlock intent route returns 200.
6. paid-result request route still works under current behavior.
7. paid-status route returns current expected states.
8. unlocked route renders.
9. LIFF bridge route returns 200.
10. invalid LIFF bind still rejects.
11. invalid LINE webhook signature still rejects.
12. empty LINE webhook verification still returns 200 if applicable.
```

Do not run real LINE client unless requested.

Do not record tokenized URLs, short codes, LINE IDs, raw input, paid JSON, provider output, or secrets.

## Confirm No Runtime Writes

After normal staging route/API checks, verify:

```text
generation_jobs has no unexpected normal-flow rows
```

If synthetic repo smoke inserted rows, distinguish synthetic rows from runtime rows.

Expected:

```text
No normal runtime writes to generation_jobs in Phase 1.
```

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
```

Allowed:

```text
table exists
column names
index/constraint names
sanitized pass/fail
row counts if aggregate-only and not user identifying
synthetic row count if used
```

## Issue Severity

Classify findings:

```text
P0:
  migration breaks staging runtime
  sensitive data appears in reports
  generation_jobs unexpectedly receives normal runtime writes

P1:
  missing required indexes/constraints
  repo helpers fail against live staging schema
  staging paid/analyze/LINE route regression

P2:
  naming/doc mismatch
  non-blocking index improvement
```

If P0 appears, stop and recommend rollback or migration fix before any production consideration.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-27-paid-generation-job-foundation-phase-1-staging-migration-verification-v0-review-bundle.md
```

Required sections:

```markdown
# Paid Generation Job Foundation Phase 1 Staging Migration Verification v0 Review Bundle

Date: 2026-05-27

## 1. Summary

## 2. Staging Freshness

## 3. Migration Application

## 4. Schema Verification

## 5. Index / Constraint Verification

## 6. Repository Smoke

## 7. Runtime Regression Checks

## 8. Runtime Write Verification

## 9. Privacy / Data Safety

## 10. Issues Found

## 11. Production Migration Recommendation

## 12. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-27-paid-generation-job-foundation-phase-1-staging-migration-verification-v0-execution-report.md
```

Report structure:

```markdown
# Paid Generation Job Foundation Phase 1 Staging Migration Verification v0 Execution Report

## Summary

## Files Created

## Files Updated

## Migration Status

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
staging migration status
runtime regression status
production migration recommendation
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

Do not apply production migration in this task.

If staging verification passes, recommended next step should be one of:

```text
- Production migration gate for 0006_generation_jobs.sql, if Phase 2 implementation is imminent.
- Phase 2 enqueue/status integration plan, if more design review is needed.
```

Given generation_jobs is unused at runtime, production migration can be deferred until just before Phase 2 unless owner explicitly approves.

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
git commit -m "ops: verify generation jobs staging migration"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
staging migration status
schema/index verification
repo smoke status
runtime regression status
runtime write verification
production migration recommendation
validation results
review bundle path
commit hash
staging push status
Tech Debt / Cleanup Notes
recommended next step
```

Then stop.
