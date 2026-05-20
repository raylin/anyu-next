# Handoff: Production Retention Cleanup Review v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Run a focused production retention cleanup review after the first low-key production launch monitoring checkpoint.

This task should verify that retention timestamps are present, identify whether any production rows are overdue for cleanup, perform safe manual cleanup only if needed and explicitly safe, and document the current retention status.

This is an operations / privacy-boundary review task.

Do not implement scheduled cleanup in this task.

Do not change DB schema.

Do not change app behavior, runtime, model, prompt/schema, legal semantics, LINE flow, design system, auth, payment, or portal scope.

## Background

Production Launch Decision Finalization v0 approved:

```text
GO for low-key production launch only
No ads yet
No real payment
No model switch
LINE-first notification flow only
Email fallback retained
Manual retention cleanup every 24–48h accepted for this first low-key launch window
```

Production 24–48h Monitoring Checkpoint v0 completed.

Monitoring results:

```text
Production health: good
Completed analyses: 2
Analysis failures: 0
Paid unlock clicks: 2
LINE clicks: 1
Contact submissions: 1
Median total analyze latency: 30,458 ms
Median provider latency: 27,454 ms
Event/privacy checks: passed
Overdue retained rows: 0
No production fix required
```

Current rationale:

```text
No immediate retention issue was found, but production now has real data flow.
Manual retention cleanup SOP should be reviewed and documented once before broader traffic or ads.
```

## Scope

Do:

1. Review production retention timestamps.
2. Check for overdue retained rows.
3. Verify what data is eligible for manual cleanup.
4. If overdue rows exist and cleanup is safe, perform limited manual cleanup.
5. If no overdue rows exist, document that no cleanup was required.
6. Verify event/privacy boundaries remain safe.
7. Update the production runbook and/or final launch decision only if needed.
8. Create report and execution report.
9. Append summary log.
10. Commit and push to `origin/staging`.

Do not:

- implement scheduled cleanup
- add cron
- add queue
- alter schema
- delete contact submissions unless explicitly scoped
- delete events unless policy explicitly says to
- dump raw DB rows
- print secrets
- use real private content in reports
- change product behavior
- turn on ads

## Production Tables To Review

Focus on:

```text
analysis_requests
analysis_results
events
contact_submissions
unlock_intents
sessions
```

Primary cleanup concern:

```text
analysis_requests
analysis_results
```

because they may contain raw or redacted user input / AI results and should respect retention boundaries.

## Retention Review Requirements

Check:

```text
analysis_requests has retention_expires_at
analysis_results has retention_expires_at
rows with retention_expires_at < now()
rows with null retention_expires_at if unexpected
oldest retained row age
count of rows eligible for cleanup
```

Do not paste row contents.

Allowed report data:

```text
table name
row count
overdue count
oldest retention timestamp
cleanup action yes/no
```

Forbidden report data:

```text
raw user input
redacted input content
AI result JSON
email
LINE ID
full event metadata
DATABASE_URL
provider keys
```

## Manual Cleanup Policy

For this low-key launch window, manual cleanup is acceptable.

If overdue rows exist, cleanup should prefer:

```text
remove or null out raw/redacted input fields if schema supports it
delete expired analysis request/result rows only if safe and does not break required references
```

Do not delete contact submissions unless explicitly required.

Do not delete events unless they contain unsafe data or policy requires it.

If unsure, do not delete; document recommended cleanup action.

## Suggested Safe Query Approach

Use read-only queries first.

Examples:

```sql
select count(*) from analysis_requests;
select count(*) from analysis_requests where retention_expires_at < now();
select min(retention_expires_at), max(retention_expires_at) from analysis_requests;

select count(*) from analysis_results;
select count(*) from analysis_results where retention_expires_at < now();
select min(retention_expires_at), max(retention_expires_at) from analysis_results;
```

Do not output raw rows.

If cleanup is performed, document exact safe action in aggregate form only.

## Event / Privacy Verification

Spot-check event metadata safely.

Verify event metadata does not contain:

```text
raw user input
email
LINE ID
full normalized result JSON
provider raw output
DATABASE_URL
ANTHROPIC_API_KEY
```

Allowed:

```text
event names
counts
metadata keys
timing aggregates
error codes
result_id / unlock_intent_id
contact_method
```

If unsafe data is found:

1. Stop and document severity without copying unsafe content.
2. Recommend immediate hotfix/cleanup task.
3. Do not paste the unsafe value in reports.

## Runbook Update

Review:

```text
docs/operations/production-deployment-runbook.md
```

If needed, add a concise note:

```text
During low-key launch, manual retention cleanup review should run every 24–48h.
Before paid ads or broader launch, scheduled retention cleanup should be implemented or explicitly re-approved.
```

Do not rewrite the runbook.

## Launch Decision Update

Review:

```text
ai-collaboration/decisions/2026-05-20-production-launch-decision-final-v0.md
```

If needed, add a short note or leave unchanged if already clear.

Do not alter the final GO decision unless retention review finds a critical issue.

## Required Report

Create:

```text
ai-collaboration/research/2026-05-20-production-retention-cleanup-review-v0.md
```

Required sections:

```markdown
# Production Retention Cleanup Review v0

Date: 2026-05-20

## 1. Summary

## 2. Review Window

## 3. Tables Reviewed

## 4. Retention Timestamp Status

## 5. Overdue Row Counts

## 6. Cleanup Action Taken

## 7. Event / Privacy Verification

## 8. Runbook / Decision Updates

## 9. Issues Found

## 10. Remaining Limitations

## 11. Current Launch Status

## 12. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-production-retention-cleanup-review-v0-execution-report.md
```

Report structure:

```markdown
# Production Retention Cleanup Review v0 Execution Report

## Summary

## Files Created

## Files Updated

## Retention Review Status

## Cleanup Status

## Event / Privacy Status

## Runbook / Decision Updates

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
- overdue row status
- cleanup action
- event/privacy status
- current launch status
- validation result
- commit hash
- staging push status

## Validation

Always run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

Docs/ops task, but validation should still pass.

## Constraints

Do not implement:

```text
scheduled deletion job
ads launch
real payment
LINE API
LIFF
email sending
auth
portal
model switch
major runtime rewrite
UI polish
```

Do not modify:

```text
product prompt/schema
DB schema
provider/model
legal semantics
design system
LINE funnel behavior
general app UI
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
real contact values
raw private user content
raw DB rows
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "ops: review production retention cleanup"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- tables reviewed
- overdue row counts
- cleanup action taken or not needed
- event/privacy result
- current launch status
- validation results
- report path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
