# Handoff: Scheduled Retention Cleanup v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Implement a low-maintenance scheduled retention cleanup mechanism for Module 01 production data.

This task should replace the current manual 24–48h retention cleanup review for the highest-risk analysis tables with a safe scheduled cleanup path, while preserving the current legal wording and not expanding retention policy beyond the tables already covered by explicit retention timestamps.

Primary goals:

```text
- reduce manual operational burden
- improve privacy/trust posture before ads or broader traffic
- safely clean expired analysis data
- preserve aggregate/event privacy boundaries
- avoid deleting contact/funnel records without a separate policy decision
```

This is a retention/privacy operations task.

Do not change product UX.

Do not change model strategy.

Do not change prompt/schema semantics.

Do not change LINE flow, auth, payment, portal, or ads posture.

## Background

Current production status:

```text
Production low-key launch: GO
UI polish: sealed
Local Playwright UI smoke: passing
Result cache: live verified in staging and production
Retention review: passed, no overdue rows at the time
```

Existing retention finding:

```text
analysis_requests and analysis_results have retention_expires_at.
unlock_intents and contact_submissions do not currently carry retention_expires_at.
Event metadata privacy scans have passed.
Manual cleanup every 24–48h was accepted for low-key launch only.
```

ChatGPT recommendation:

```text
Before ads or broader public traffic, scheduled retention cleanup should be implemented or explicitly re-approved.
```

This task implements scheduled cleanup only for the tables with explicit retention timestamp coverage.

## Scope

Do:

1. Inspect current retention fields and cleanup requirements.
2. Implement a safe cleanup routine for expired analysis data.
3. Scope cleanup to `analysis_requests` and `analysis_results` unless current schema/policy clearly supports more.
4. Add an authenticated/scheduled endpoint or script suitable for Vercel Cron or manual trigger.
5. Add a cron configuration only if it is safe and consistent with the repo's deployment model.
6. Add dry-run or safe summary behavior if practical.
7. Add tests.
8. Update docs/runbook/legal notes only if wording needs alignment.
9. Create review bundle, execution report, summary log.
10. Commit and push to `origin/staging`.

Do not:

- delete contact_submissions
- delete unlock_intents
- delete events unless they contain unsafe data or policy explicitly supports it
- delete sessions unless clearly safe and scoped
- change legal promise from "24h goal" to hard automated guarantee
- expose raw rows in logs/reports
- change product runtime/model/prompt/schema
- add ads
- change payment/LINE flow

## Cleanup Policy

### Target tables for v0

Primary:

```text
analysis_requests
analysis_results
```

Reason:

```text
These tables have explicit retention_expires_at and may be associated with analysis input/result content.
```

### Non-target tables for v0

Do not clean these in this task unless only documenting policy:

```text
events
unlock_intents
contact_submissions
sessions
```

Reason:

```text
Their retention policy requires a separate Retention Policy Matrix decision.
```

### Expiration criteria

Clean records where:

```text
retention_expires_at < now()
```

Only operate on rows with explicit expired retention timestamp.

### Cleanup mode

Prefer privacy-preserving cleanup over broad destructive deletion if references matter.

Choose based on current schema:

Option A — Delete expired analysis rows if safe:

```text
delete from analysis_results where retention_expires_at < now()
delete from analysis_requests where retention_expires_at < now()
```

Option B — Null sensitive fields if references must remain:

```text
set redacted/raw/content fields to null
mark cleanup timestamp
preserve non-sensitive metadata
```

Codex should inspect schema and choose the safest minimal approach.

If unsure, implement a cleanup report/dry-run first and document deferred destructive cleanup.

## Scheduled Mechanism

Preferred low-maintenance options:

### Option A: Vercel Cron endpoint

Create endpoint such as:

```text
POST /api/internal/retention-cleanup
```

or:

```text
GET /api/cron/retention-cleanup
```

Requirements:

```text
requires CRON_SECRET or equivalent
only runs on server
returns aggregate counts only
does not expose raw data
```

Vercel config:

```json
{
  "crons": [
    {
      "path": "/api/cron/retention-cleanup",
      "schedule": "0 */12 * * *"
    }
  ]
}
```

or daily:

```text
0 17 * * *
```

Choose a conservative cadence.

### Option B: CLI script

Create script:

```text
apps/web/scripts/retention-cleanup.mjs
```

Run manually or via external scheduler.

Preferred if Vercel cron setup is uncertain.

### Recommendation

Use the simplest maintainable option aligned with current deployment.

If Vercel Cron is available and low-risk, implement it with a secret. Otherwise implement script + documented manual command.

## Security

If using endpoint, require secret:

```text
RETENTION_CLEANUP_SECRET
```

or:

```text
CRON_SECRET
```

Rules:

```text
Do not print the secret.
Do not commit .env.
Production requires secret configured.
Preview/staging can use separate secret.
If secret is absent, endpoint must refuse cleanup.
```

Endpoint should return:

```json
{
  "ok": true,
  "dryRun": false,
  "analysisRequestsDeleted": 0,
  "analysisResultsDeleted": 0
}
```

or equivalent aggregate counts only.

## Dry Run

If practical, support:

```text
?dryRun=1
```

or a script flag:

```bash
corepack pnpm retention:cleanup -- --dry-run
```

Dry run should report counts without deleting.

## Event / Logging

Do not log raw rows.

Allowed logs:

```text
startedAt
finishedAt
durationMs
dryRun
table counts
error category
```

If adding an event, keep it internal/safe:

```text
retention_cleanup_completed
```

But do not expand event taxonomy unless already simple.

A report/log record is optional. Do not overbuild.

## Tests

Add tests for:

```text
expired analysis_requests are cleaned or redacted
expired analysis_results are cleaned or redacted
non-expired rows are retained
rows with null retention_expires_at are ignored
endpoint/script refuses without secret if endpoint-based
dry run does not mutate data
response/log contains only aggregate counts
contact_submissions / unlock_intents are untouched
```

If DB integration tests are complex, use unit tests with mocked DB helpers.

## Docs

Update:

```text
apps/web/README.md
docs/operations/production-deployment-runbook.md
ai-collaboration/decisions/2026-05-20-production-launch-decision-final-v0.md
```

Document:

```text
scheduled cleanup scope
cadence
required secret/env var
dry run command if available
what is not cleaned yet
broader traffic readiness impact
```

Do not change public legal wording to hard automated promise unless legal text is separately reviewed.

Public privacy text may remain:

```text
24 小時目標
```

## Production Notes

Production is live.

If this task adds DB schema changes:

```text
document migration requirement
do not run production migration unless explicitly approved
```

If no schema change is needed and endpoint/script is deployed via normal app deployment:

```text
document required env secret and verification steps
```

Do not assume production cron is active until verified.

## Verification

After implementation, verify locally:

```text
dry run works
cleanup with test data works in tests
secret guard works
no raw data in output
```

If staging/live verification is safe:

```text
call dry-run endpoint on staging
verify unauthorized request fails
verify authorized dry run returns aggregate counts
```

Do not delete live data unless explicitly intended and safe.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-21-scheduled-retention-cleanup-v0-review-bundle.md
```

Required sections:

```markdown
# Scheduled Retention Cleanup v0 Review Bundle

Date: 2026-05-21

## 1. Summary

## 2. Cleanup Scope

## 3. Cleanup Mechanism

## 4. Security / Secret Guard

## 5. Dry Run Behavior

## 6. Tests Added

## 7. Documentation Updates

## 8. Production / Staging Activation Notes

## 9. Known Limitations

## 10. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-scheduled-retention-cleanup-v0-execution-report.md
```

Report structure:

```markdown
# Scheduled Retention Cleanup v0 Execution Report

## Summary

## Files Created

## Files Updated

## Cleanup Scope Implemented

## Scheduled Mechanism

## Security / Secret Handling

## Tests Added

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
- cleanup scope
- scheduled mechanism
- validation result
- commit hash
- staging push status

## Validation

Always run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

If Playwright is unaffected, no need to run local UI smoke unless UI changed.

If endpoint is added, run local/route tests as appropriate.

## Constraints

Do not implement:

```text
ads launch
real payment
LINE API
LIFF
email sending
auth
portal
model switch
async polling
streaming
major UI redesign
image share / PNG / OG generation
```

Do not modify:

```text
product prompt/schema semantics
provider/model defaults
legal semantics beyond docs note
LINE funnel behavior
production ops behavior beyond cleanup docs
general UI
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
RETENTION_CLEANUP_SECRET
CRON_SECRET
real contact values
raw private user content
font files
screenshots / test artifacts / videos / traces
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "feat: add scheduled retention cleanup"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files/test artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- cleanup scope
- scheduled mechanism
- secret/env requirements
- dry run behavior
- tests added
- validation results
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
