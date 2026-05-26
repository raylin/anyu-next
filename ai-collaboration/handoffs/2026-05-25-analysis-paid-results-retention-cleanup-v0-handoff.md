# Handoff: Analysis Paid Results Retention Cleanup v0

Date: 2026-05-25

Project: anyu-next / 暗語 ANYU

## Objective

Add `analysis_paid_results` to the scheduled retention cleanup path now that Two-tier Phase 1 shadow paid-result rows are live in production.

This task should extend the existing retention cleanup logic, dry-run reporting, tests, docs, and live verification so the new retained paid-result content table is covered before broader traffic or ads.

This is an operations / privacy cleanup task.

Do not change analyze behavior.

Do not switch to free-only analyze.

Do not implement deferred paid generation.

Do not change LINE fulfillment behavior.

Do not implement payment, email delivery, ads, or growth work.

## Background

Two-tier Phase 1 Production Migration + Smoke v0 completed.

Current production state:

```text
Production 0005 migration: applied
analysis_requests.user_context_json: verified
analysis_paid_results: verified
fresh analyze: HTTP 200
shadow paid-result row: completed
result / unlock / unlocked / LIFF route checks: OK
```

New operational gap:

```text
analysis_paid_results is now a retained content table.
It currently is not included in scheduled retention cleanup.
```

Existing cleanup coverage:

```text
analysis_requests
analysis_results
```

Recommended next step:

```text
Add analysis_paid_results to scheduled retention cleanup before broader traffic or ads.
```

## Scope

Do:

1. Review existing scheduled retention cleanup implementation.
2. Add `analysis_paid_results` to cleanup coverage.
3. Decide whether to scrub in place or hard-delete.
4. Prefer behavior aligned with `analysis_results` unless schema requires otherwise.
5. Update dry-run output to include `analysis_paid_results`.
6. Add/update tests.
7. Update docs/runbook.
8. Run local validation.
9. Run staging dry-run verification if available.
10. Apply/verify production behavior using authorized dry-run only.
11. Do not perform destructive production cleanup unless explicitly safe and intended.
12. Create review bundle, execution report, summary log.
13. Commit and push to `origin/staging`.

Do not:

- change analyze route behavior
- change paid result generation behavior
- change LINE fulfillment behavior
- change prompt/schema/model/provider
- change payment/email/ads behavior
- start broader traffic
- dump paid_result_json
- expose raw result content

## Current Files To Inspect

Review:

```text
apps/web/src/app/api/cron/retention-cleanup/route.ts
apps/web/src/lib/runtime/retention-cleanup.ts
apps/web/src/tests/retention-cleanup.test.ts
apps/web/src/tests/retention-cleanup-route.test.ts
apps/web/src/lib/db/schema.ts
apps/web/drizzle/0005_two_tier_phase_1.sql
docs/operations/production-deployment-runbook.md
apps/web/README.md
```

Adjust paths based on repo state.

## Cleanup Policy

`analysis_paid_results` contains paid-result JSON / future deferred paid content.

Preferred cleanup approach:

```text
scrub in place if referenced downstream
or hard-delete only if no references and no product/debug need
```

Because `analysis_paid_results` references `analysis_results`, prefer in-place scrub unless code inspection shows hard-delete is safer.

Potential scrub behavior:

```text
paid_result_json = null
status = expired or scrubbed
error_code = null or retention_expired
updated_at = now()
```

or repo-consistent equivalent.

Keep identifiers if needed for aggregate/reference integrity.

Do not alter associated `analysis_results` behavior.

## Expiry Logic

Use `retention_expires_at` on `analysis_paid_results`.

Dry-run should report:

```text
analysis_paid_results_total
analysis_paid_results_with_retention
analysis_paid_results_overdue
analysis_paid_results_eligible_for_cleanup
```

Cleanup should only affect rows where:

```text
retention_expires_at is not null
retention_expires_at <= now()
paid_result_json is not already null / scrubbed
```

If status field should be considered:

```text
completed / failed / expired / scrubbed
```

Document final logic.

## Dry-run Output

Current dry-run should be extended to include `analysis_paid_results`.

Example response shape:

```json
{
  "dryRun": true,
  "analysisRequests": {},
  "analysisResults": {},
  "analysisPaidResults": {}
}
```

Use existing naming style if different.

Do not include raw row content.

## Tests

Add/update tests for:

```text
analysis_paid_results dry-run counts
analysis_paid_results overdue detection
analysis_paid_results cleanup scrubs/deletes only eligible rows
non-overdue analysis_paid_results untouched
already scrubbed analysis_paid_results untouched
analysis_requests cleanup behavior unchanged
analysis_results cleanup behavior unchanged
cron route dryRun includes analysisPaidResults
unauthorized route still returns 401
authorized dryRun does not mutate
authorized cleanup mutates only eligible paid rows
```

Do not include real paid result text. Use synthetic JSON fixtures.

## Live Verification

### Staging

If staging env/secret is available:

```text
GET /api/cron/retention-cleanup?dryRun=1
```

Verify:

```text
analysisPaidResults appears in dry-run
counts are aggregate only
no raw JSON
```

### Production

Use authorized dry-run only.

Verify:

```text
production dry-run includes analysisPaidResults
overdue count is reasonable
no raw JSON
unauthorized still 401 if checked
```

Do not perform destructive production cleanup unless:

```text
there are overdue rows
the route behavior is verified
and this task explicitly decides it is safe
```

Default: dry-run only.

## Event / Privacy Verification

Ensure reports/logs do not include:

```text
paid_result_json
full result JSON
raw input
provider output
email
LINE user ID
fulfillment code
unlock token
tokenized URL
DATABASE_URL
ANTHROPIC_API_KEY
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
```

Allowed:

```text
aggregate counts
table names
status counts
dry-run true/false
```

## Docs

Update:

```text
docs/operations/production-deployment-runbook.md
apps/web/README.md
```

Document:

```text
analysis_paid_results now covered by scheduled retention cleanup
dry-run includes analysisPaidResults
cleanup policy for paid result rows
authorized dry-run command
```

Do not write secrets.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-25-analysis-paid-results-retention-cleanup-v0-review-bundle.md
```

Required sections:

```markdown
# Analysis Paid Results Retention Cleanup v0 Review Bundle

Date: 2026-05-25

## 1. Summary

## 2. Existing Retention Coverage

## 3. analysis_paid_results Cleanup Policy

## 4. Dry-run Output Changes

## 5. Route / Runtime Changes

## 6. Tests Added

## 7. Staging Verification

## 8. Production Dry-run Verification

## 9. Event / Privacy Verification

## 10. Documentation Updates

## 11. Known Limitations

## 12. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-25-analysis-paid-results-retention-cleanup-v0-execution-report.md
```

Report structure:

```markdown
# Analysis Paid Results Retention Cleanup v0 Execution Report

## Summary

## Files Created

## Files Updated

## Cleanup Policy

## Runtime / Route Changes

## Tests Added

## Staging Verification

## Production Verification

## Event / Privacy Status

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
- cleanup coverage summary
- staging/production dry-run status
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
```

Playwright not required unless UI changes, which should not happen.

## Constraints

Do not implement:

```text
free-only analyze behavior switch
deferred paid generation
paid generation worker
LINE bind trigger changes
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
product prompt/schema semantics
provider/model defaults
legal semantics
LINE production behavior
design system direction
analyze/result/unlock behavior beyond retention cleanup internals
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
git commit -m "ops: clean retained paid results"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- cleanup policy
- dry-run output change
- tests added
- staging verification
- production dry-run verification
- event/privacy result
- validation results
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
