# Handoff: Production 24–48h Monitoring Checkpoint v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Run the first 24–48h production monitoring checkpoint after the final low-key production launch decision.

This task should verify production stability, usage, errors, latency, cost exposure, LINE/email funnel activity, event/privacy boundaries, and manual retention cleanup readiness.

This is a monitoring / operations task.

Do not add new product features.

Do not turn on ads.

Do not enable real payment.

Do not switch models.

Do not change runtime, prompt/schema, DB schema, legal semantics, LINE flow, design system, auth, payment, or portal scope unless a critical production fix is required and explicitly documented.

## Background

Production Launch Decision Finalization v0 completed.

Final decision:

```text
GO for low-key production launch only
```

Approved scope:

```text
Module 01 only
No ads yet
No real payment
No model switch
LINE-first notification flow only
Email fallback retained
Manual retention cleanup every 24–48h accepted for this first low-key launch window
```

Production technical gate status:

```text
Production DB migration: complete
Required runtime tables: present
Production smoke: passed
Human production smoke: passed
Event/privacy smoke: passed
Domain apex: https://anyu.tw
www redirect: https://www.anyu.tw → https://anyu.tw
```

Final decision record:

```text
ai-collaboration/decisions/2026-05-20-production-launch-decision-final-v0.md
```

## Scope

Do:

1. Review production activity after launch.
2. Check production routes are still healthy.
3. Check event counts and funnel metrics.
4. Check analyze latency and failures.
5. Check provider/schema errors.
6. Check LINE CTA / Email fallback activity.
7. Check contact submissions if any.
8. Check API/cost exposure indicators.
9. Verify event/privacy boundaries remain safe.
10. Confirm manual retention cleanup status.
11. Document findings and recommendations.
12. Apply only tiny critical fixes if a clear production issue is found and it is safe.
13. Commit report and push to `origin/staging`.

Do not:

- start ads
- broaden public launch
- enable real payment
- switch to Haiku
- implement scheduled cleanup
- implement LINE API / LIFF / webhook
- add new UI polish
- make broad refactors
- print secrets
- dump raw DB rows

## Production URLs

Check:

```text
https://anyu.tw
https://anyu.tw/m/ambiguous-temperature
https://anyu.tw/m/ambiguous-temperature/result/demo
https://anyu.tw/privacy
https://anyu.tw/terms
https://anyu.tw/disclaimer
https://www.anyu.tw
```

Expected:

```text
anyu.tw routes load
www.anyu.tw redirects to https://anyu.tw
```

## Metrics To Review

Use production database / events if accessible.

Review counts for the monitoring window:

```text
page_view
input_started
analysis_started
analysis_completed
analysis_failed
paid_unlock_clicked
line_add_clicked
email_fallback_opened
contact_submitted
error_seen
share_card_clicked
```

Also review:

```text
daily analysis count
hourly analysis count
provider error count
schema validation failure count
median analyze latency
p95 analyze latency if available
LINE CTA click count
Email fallback open count
contact submissions count
```

Do not paste raw rows.

Report aggregate counts only.

## Cost / Abuse Guard Review

Check:

```text
ANALYSIS_SESSION_DAILY_LIMIT behavior if visible
ANALYSIS_IP_HOURLY_LIMIT behavior if visible
ANALYSIS_GLOBAL_DAILY_LIMIT behavior if visible
Claude/API usage rough count
unexpected traffic spikes
repeated errors from same session/IP hash if safely available
```

Do not expose IP addresses.

If traffic is unexpectedly high, recommend:

```text
lower ANALYSIS_GLOBAL_DAILY_LIMIT
pause public sharing
do not start ads
review logs
```

## Event / Privacy Verification

Verify production events do not contain:

```text
raw user input
email value
LINE ID
full normalized result JSON
provider raw output
DATABASE_URL
ANTHROPIC_API_KEY
```

Allowed metadata:

```text
event name
module_id
theme_slug
result_id
unlock_intent_id
contact_method
timing aggregates
error code/category
input length / guard category
```

If unsafe data is found:

1. Stop and document severity.
2. Recommend immediate cleanup and hotfix.
3. Do not paste unsafe content in report.

## Retention Cleanup Review

Because launch decision accepted manual retention cleanup for first low-key launch:

Verify/document:

```text
retention_expires_at exists on relevant rows
rows older than retention target exist? yes/no
manual cleanup run? yes/no
manual cleanup needed? yes/no
```

Do not implement scheduled cleanup in this task.

If manual cleanup has not been run yet, recommend:

```text
Run manual cleanup now or within 24–48h.
```

If volume is higher than expected, recommend:

```text
Scheduled Retention Cleanup v0 before broader traffic or ads.
```

## Production Health Check

Verify:

```text
/ loads or redirects appropriately
/m/ambiguous-temperature loads
demo result loads
legal routes load
LINE CTA still has https://lin.ee/S6dnbJO
www redirect works
```

Do not run many analyze calls.

If one synthetic analyze is needed to verify health, use:

```text
他最近回訊息變慢，但還是會看我的限動。我不知道他是真的忙，還是已經沒那麼喜歡我了。
```

Do not use real content.

## If Issues Are Found

Classify:

```text
critical production issue
provider/runtime issue
database issue
event/privacy issue
contact/LINE issue
legal route issue
redirect issue
latency issue
cost/abuse issue
```

Allowed tiny fixes:

```text
broken link
wrong copy typo
missing env doc
minor report/runbook correction
```

Do not make product changes unless critical.

If critical app fix is required, document and recommend a dedicated hotfix handoff.

## Required Report

Create:

```text
ai-collaboration/research/2026-05-20-production-24-48h-monitoring-checkpoint-v0.md
```

Required sections:

```markdown
# Production 24–48h Monitoring Checkpoint v0

Date: 2026-05-20

## 1. Summary

## 2. Monitoring Window

## 3. Production Route Health

## 4. Funnel Metrics

## 5. Analyze Latency / Error Metrics

## 6. LINE / Email Funnel Metrics

## 7. Cost / Abuse Guard Review

## 8. Event / Privacy Verification

## 9. Retention Cleanup Review

## 10. Issues Found

## 11. Fixes Applied

## 12. Current Launch Status

## 13. Recommendations

## 14. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-production-24-48h-monitoring-checkpoint-v0-execution-report.md
```

Report structure:

```markdown
# Production 24–48h Monitoring Checkpoint v0 Execution Report

## Summary

## Files Created

## Files Updated

## Production Health Status

## Metrics Reviewed

## Event / Privacy Status

## Retention Status

## Fixes Applied

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
- production health status
- event/privacy status
- retention status
- recommendation
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

If no code changed, still run validation.

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
scheduled deletion job
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
git commit -m "ops: record production monitoring checkpoint"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- monitoring window
- production health status
- funnel metrics summary
- latency/error summary
- event/privacy result
- retention cleanup status
- issues found
- current launch status
- validation results
- report path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
