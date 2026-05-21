# Handoff: Production App Refresh + Request-State Smoke v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Refresh the production app deployment so `https://anyu.tw` serves commit `1d9700d` or newer, then run a narrow production smoke for Analyze Request State + Polling UX v0.

This task should complete the production-side verification that was blocked because the production app was still serving stale code without the new poll endpoint.

This is a production deployment refresh + narrow smoke task.

Do not run DB migration again unless verification proves it was not actually applied.

Do not change app code.

Do not change UI, model strategy, prompt/schema semantics, LINE flow, legal semantics, auth, payment, portal, ads posture, or production launch posture.

## Background

Analyze Request State Migration + Live Verification v0 completed.

Status from previous pass:

```text
Staging DB migration: complete
Staging live verification: passed
Staging poll endpoint: passed
Staging cache-hit same resultId: passed
Staging result / unlock / Email fallback: passed
Staging privacy check: passed

Production DB migration: complete
Production app: stale, not serving commit 1d9700d+
Production poll endpoint: 404
Production analyze smoke: intentionally skipped
```

Migration already applied:

```text
apps/web/drizzle/0002_analyze_request_state.sql
```

Production DB branch:

```text
br-square-star-aosaqd0q
```

Known issue:

```text
https://anyu.tw returned app 404 for:
GET /api/modules/[moduleSlug]/analyze/requests/[requestId]
```

Interpretation:

```text
Production DB and app code are temporarily out of sync in an additive-safe direction.
DB has new fields, but production app does not yet serve the new request-state route.
```

Recommended next step:

```text
Deploy or promote commit 1d9700d or later through approved production workflow, then rerun production-only smoke.
```

## Scope

Do:

1. Confirm current production app deployment / commit freshness.
2. Confirm intended production candidate commit is `1d9700d` or newer.
3. Deploy/promote the approved current app code to production on anyu-next.
4. Verify `https://anyu.tw` now serves the refreshed app.
5. Verify poll endpoint route no longer returns generic app 404.
6. Run one narrow synthetic production fresh analyze.
7. Verify request state completed.
8. Verify poll endpoint completed response returns same resultId/resultPath.
9. Verify same-input cache hit returns same resultId and does not duplicate rows if safe to inspect.
10. Verify result page loads.
11. Verify unlock intent works.
12. Verify LINE-first panel / LINE URL / Email fallback still work.
13. Verify event/privacy metadata remains safe.
14. Update docs/runbook only if needed.
15. Create review bundle, execution report, summary log.
16. Commit and push to `origin/staging`.

Do not:

- run DB migration again unless absolutely necessary
- change source code
- change env except if required by deployment workflow and documented
- print secrets
- dump raw DB rows
- use real private input
- use real contact values
- run broad load tests
- change model strategy
- change prompt/schema
- change UI
- change LINE behavior
- start ads
- implement queue/worker/streaming

## Production Deployment Refresh

Use approved production workflow from:

```text
docs/operations/production-deployment-runbook.md
```

Requirements:

```text
- Do not treat this as a new broad launch approval.
- This is a production refresh to align app code with already-applied additive DB migration.
- Candidate commit must be 1d9700d or newer.
- Prefer current origin/staging head if it only contains approved docs/report changes after 1d9700d.
- Record final deployed URL and deployment ID if available.
```

If production branch/commit policy is ambiguous, stop and document instead of guessing.

## Production Verification

Use production:

```text
https://anyu.tw/m/ambiguous-temperature
```

Use synthetic input:

```text
對方說不是不想談未來，只是最近壓力很大。可是每次我想確認我們的關係方向，他又會把話題帶開，讓我不知道該不該繼續等。
```

Synthetic email if needed:

```text
anyu-request-state-production@example.com
```

Do not use real content.

## Smoke Checklist

### 1. App freshness

Verify:

```text
https://anyu.tw serves commit 1d9700d or newer
new request-state route exists
```

If exact commit cannot be exposed safely, verify using route/bundle/source markers.

### 2. Poll route existence

Before real analyze if possible, verify route shape does not return app-level 404.

A non-existent requestId may return:

```text
404 JSON not found
or safe application error
```

But it should not return the generic app page 404.

### 3. Fresh analyze

Submit synthetic input.

Expected:

```text
analyze succeeds
requestId is returned or recoverable
resultId/resultPath returned
request state is completed
```

### 4. Poll endpoint

Call:

```text
GET /api/modules/ambiguous-temperature/analyze/requests/[requestId]
```

Expected:

```json
{
  "status": "completed",
  "resultId": "...",
  "resultPath": "..."
}
```

or equivalent safe shape.

Must not include raw input/provider output.

### 5. Cache hit

Submit same synthetic input again.

Expected:

```text
cacheHit true
same resultId
provider skipped if inspectable
no duplicate request/result rows if safe to inspect
```

### 6. Result/funnel

Verify:

```text
result page loads
unlock intent succeeds
LINE-first panel appears
LINE CTA target remains https://lin.ee/S6dnbJO
Email fallback opens/submits synthetic email if tested
legal/footer links still present
```

Keep total provider calls minimal.

## Event / Privacy Verification

Verify no event/request metadata contains:

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

Allowed:

```text
requestId
resultId
status
phase
elapsedMs
cacheHit
errorCode/errorCategory
source
```

If unsafe data is found:

1. Stop.
2. Document severity without copying unsafe content.
3. Recommend hotfix.

## No Migration Unless Necessary

Production DB migration was already reported complete.

Do not rerun unless:

```text
schema verification fails
or required fields are missing
```

If rerun is necessary:

```text
document why
ensure idempotent/additive behavior
do not dump rows
```

## Documentation Updates

Update only if needed:

```text
apps/web/README.md
docs/operations/production-deployment-runbook.md
ai-collaboration/decisions/2026-05-20-production-launch-decision-final-v0.md
```

Potential note:

```text
Production app refresh completed after additive request-state migration.
Future production DB migrations should include a production app freshness precheck.
```

Do not rewrite large docs.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-21-production-app-refresh-request-state-smoke-v0-review-bundle.md
```

Required sections:

```markdown
# Production App Refresh + Request-State Smoke v0 Review Bundle

Date: 2026-05-21

## 1. Summary

## 2. Production App Refresh

## 3. Deployed Commit / Deployment

## 4. Poll Route Freshness Check

## 5. Fresh Analyze Verification

## 6. Poll Endpoint Verification

## 7. Cache Hit Verification

## 8. Result / Funnel Verification

## 9. Event / Privacy Verification

## 10. Documentation Updates

## 11. Known Limitations

## 12. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-production-app-refresh-request-state-smoke-v0-execution-report.md
```

Report structure:

```markdown
# Production App Refresh + Request-State Smoke v0 Execution Report

## Summary

## Files Created

## Files Updated

## Production Refresh Status

## Deployed Commit / Deployment

## Poll Route Status

## Fresh Analyze Status

## Poll Endpoint Status

## Cache Interaction Status

## Funnel Status

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
- production refresh status
- poll endpoint status
- cache interaction status
- funnel status
- privacy status
- validation result
- commit hash
- staging push status

## Validation

Always run local validation:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

Run local Playwright if app code changed or as a final guard:

```bash
cd apps/web && corepack pnpm test:e2e:local
```

If no app code changed and previous validation already passed, Playwright is optional but useful.

## Constraints

Do not implement:

```text
queue/worker
SSE
websocket
token streaming
ads launch
real payment
LINE API
LIFF
email sending
auth
portal
model switch
major UI redesign
image share / PNG / OG generation
```

Do not modify:

```text
product prompt/schema semantics
provider/model defaults
legal semantics
LINE funnel behavior
production ops behavior beyond docs
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
git commit -m "ops: refresh production request-state smoke"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files/test artifacts/raw JSONL are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- production refresh status
- deployed commit/deployment
- poll route status
- fresh analyze result
- poll endpoint result
- cache interaction result
- funnel result
- privacy/event result
- validation results
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
