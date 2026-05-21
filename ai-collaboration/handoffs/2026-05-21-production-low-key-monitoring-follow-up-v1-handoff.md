# Handoff: Production Low-Key Monitoring Follow-up v1

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Run a focused production monitoring follow-up after the recent production infrastructure upgrades:

```text
Result cache + idempotent analyze
Scheduled retention cleanup
Analyze request state + poll endpoint
Production app refresh + request-state smoke
```

This task should verify that the low-key production launch remains healthy after these changes and that core metrics, privacy boundaries, cache behavior, request-state behavior, cleanup status, and funnel activity are still acceptable.

This is an operations / monitoring task.

Do not add features.

Do not change UI.

Do not start ads.

Do not change runtime, model, prompt/schema, DB schema, legal semantics, LINE flow, auth, payment, portal, or production launch posture.

## Background

Current production state:

```text
Production low-key launch: GO
UI polish: sealed
Local Playwright UI smoke: complete
Result cache: live verified
Scheduled retention cleanup: live
Analyze request state / poll endpoint: staging + production verified
LINE-first funnel: live
Email fallback: live
Legal/trust pages: live
```

Recent production changes that should now be monitored together:

```text
1. Result Cache + Idempotent Analyze v0
   - cacheHit true/false metadata
   - same-input retry returns same resultId
   - ANALYSIS_CACHE_HASH_SECRET configured

2. Scheduled Retention Cleanup v0
   - /api/cron/retention-cleanup
   - bearer-secret guarded
   - dryRun=1
   - daily Vercel Cron
   - analysis_requests / analysis_results scrubbing

3. Analyze Request State + Polling UX v0
   - analysis_requests status fields
   - poll endpoint
   - completed/failed/expired recovery behavior
   - still synchronous on cache misses

4. Production App Refresh + Request-State Smoke v0
   - production app refreshed to request-state code
   - production smoke passed
```

Recommended next step from prior review:

```text
Production Low-Key Monitoring Follow-up v1
```

## Scope

Do:

1. Review production route health.
2. Review analyze counts and success/failure rates.
3. Review request-state statuses.
4. Review cache hit/miss behavior.
5. Review analyze latency.
6. Review provider error/schema failure counts.
7. Review retention cleanup status and dry-run counts.
8. Review LINE / Email funnel metrics.
9. Review event/privacy metadata boundaries.
10. Review abuse/cost guard indicators.
11. Document findings and recommendations.
12. Apply only tiny docs/report updates if needed.
13. Commit report and push to `origin/staging`.

Do not:

- implement code changes
- run broad load tests
- run many analyze calls
- use real private input
- use real contact values
- change env
- change DB schema
- change production deploy
- start ads
- change production launch decision
- widen retention cleanup scope

## Monitoring Window

Use an appropriate window since the last production refresh.

Suggested:

```text
from the production app refresh timestamp / latest production smoke
to current time
```

If exact timestamp is hard to determine, use:

```text
last 24 hours
```

Document the chosen window.

## Production Health Checks

Check:

```text
https://anyu.tw
https://anyu.tw/m/ambiguous-temperature
https://anyu.tw/m/ambiguous-temperature/result/demo
https://anyu.tw/privacy
https://anyu.tw/terms
https://anyu.tw/disclaimer
https://anyu.tw/legal
https://www.anyu.tw
```

Expected:

```text
apex routes load
www redirects to apex
legal routes return 200
```

## Analyze / Request-State Metrics

Review production aggregates only.

Metrics:

```text
analysis_requests total in window
analysis_results total in window
completed request count
failed request count
expired request count
processing/stuck request count
request status distribution
median analyze latency
p95 analyze latency if available
provider latency median if available
schema validation failure count
provider error count
```

Do not paste raw rows.

If stuck processing rows exist:

```text
classify as possible issue
document request age/count only
do not dump raw input
```

## Cache Metrics

Review:

```text
cacheHit true count
cacheHit false count
cache hit ratio
same-input retry behavior if inspectable
duplicate request/result row indicators
cache disabled/missing secret indicators if any
```

Do not expose cache keys or input hashes.

Allowed:

```text
aggregate counts
ratios
resultId only if synthetic smoke and already safe
```

## Retention Cleanup Status

Check:

```text
cron endpoint exists
unauthorized request fails
authorized dryRun=1 returns aggregate counts
production dry-run eligible counts
last Vercel Cron run if available
analysis_requests overdue count
analysis_results overdue count
```

Do not run destructive cleanup manually unless explicitly intended and safe.

If dry-run reports overdue rows:

```text
determine whether scheduled cron should clear them on next run
document counts only
recommend manual authorized run only if necessary
```

## Funnel Metrics

Review aggregate counts:

```text
paid_unlock_clicked
line_add_clicked
email_fallback_opened
contact_submitted
share_card_clicked
```

Also:

```text
LINE CTA target remains https://lin.ee/S6dnbJO
Email fallback remains functional if a synthetic check is needed
```

Do not use real contact values.

## Event / Privacy Verification

Verify sampled/aggregate metadata does not contain:

```text
raw input
redacted input text
email
LINE ID
full result JSON
provider raw output
DATABASE_URL
ANTHROPIC_API_KEY
ANALYSIS_CACHE_HASH_SECRET
RETENTION_CLEANUP_SECRET
```

Allowed metadata:

```text
requestId
resultId
status
phase
elapsedMs
cacheHit
errorCode/errorCategory
source
moduleSlug
timing aggregates
contact_method
```

If unsafe data is found:

1. Stop.
2. Document severity without copying unsafe content.
3. Recommend hotfix/cleanup.

## Abuse / Cost Guard Review

Review aggregate indicators:

```text
daily analyze count
hourly analyze count if available
global daily limit pressure
session/IP limit pressure if aggregate-safe
provider call count
cache avoided calls estimate if available
unexpected spikes
```

Do not expose IPs or user identifiers.

## Optional Synthetic Smoke

Only if current production health cannot be verified from existing data.

Use one synthetic input:

```text
對方最近會主動分享生活，但每次我問到關係方向，他都說再看看。我想知道這是慢慢靠近，還是在避開答案。
```

If used, verify:

```text
fresh analyze or cache hit
poll endpoint completed
result page
unlock intent
LINE target
Email fallback with synthetic email if needed
```

Synthetic email:

```text
anyu-monitoring-v1@example.com
```

Keep provider calls minimal.

## Required Report

Create:

```text
ai-collaboration/research/2026-05-21-production-low-key-monitoring-follow-up-v1.md
```

Required sections:

```markdown
# Production Low-Key Monitoring Follow-up v1

Date: 2026-05-21

## 1. Summary

## 2. Monitoring Window

## 3. Production Route Health

## 4. Analyze / Request-State Metrics

## 5. Cache Metrics

## 6. Retention Cleanup Status

## 7. Funnel Metrics

## 8. Event / Privacy Verification

## 9. Abuse / Cost Guard Review

## 10. Issues Found

## 11. Fixes Applied

## 12. Current Launch Status

## 13. Recommendations

## 14. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-production-low-key-monitoring-follow-up-v1-execution-report.md
```

Report structure:

```markdown
# Production Low-Key Monitoring Follow-up v1 Execution Report

## Summary

## Files Created

## Files Updated

## Monitoring Window

## Production Health Status

## Request-State / Cache Status

## Retention Status

## Funnel Status

## Event / Privacy Status

## Abuse / Cost Status

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
- monitoring window
- health status
- request-state/cache status
- retention status
- funnel status
- privacy status
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

No need to run Playwright unless app code changes, which should not happen.

## Constraints

Do not implement:

```text
new features
code changes unless tiny docs/report only
ads launch
real payment
LINE API
LIFF
email sending
auth
portal
model switch
queue/worker
SSE
websocket
token streaming
major UI redesign
image share / PNG / OG generation
```

Do not modify:

```text
product prompt/schema semantics
provider/model defaults
legal semantics
LINE funnel behavior
production ops behavior beyond docs/report
design system direction
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
real contact values
raw private user content
font files
screenshots / test artifacts / videos / traces
raw sourced JSONL
private batch generated outputs
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "ops: monitor low-key production v1"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files/test artifacts/raw JSONL are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- monitoring window
- production health
- request-state/cache status
- retention cleanup status
- funnel status
- event/privacy result
- abuse/cost status
- validation results
- report path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
