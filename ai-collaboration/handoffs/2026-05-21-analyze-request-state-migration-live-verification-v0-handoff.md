# Handoff: Analyze Request State Migration + Live Verification v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Apply and verify the Analyze Request State + Polling UX v0 migration in live target environments.

This task should apply `apps/web/drizzle/0002_analyze_request_state.sql`, then verify staging and production behavior for:

```text
fresh analyze completion
poll endpoint completed response
cache-hit short-circuit
result page load
unlock / LINE / Email fallback flow
privacy-safe event/request metadata
```

This is a migration + live verification task.

Do not change request-state implementation unless a small blocking bug is found.

Do not change UI, model strategy, prompt/schema semantics, LINE flow, legal semantics, auth, payment, portal, ads posture, or production launch posture.

## Background

Analyze Request State + Polling UX v0 completed.

Commit:

```text
1d9700d
```

What changed:

```text
- Added analysis_requests status fields via apps/web/drizzle/0002_analyze_request_state.sql.
- Added safe GET /api/modules/[moduleSlug]/analyze/requests/[requestId] endpoint.
- Updated analyze route to record phase/completed/failed states.
- Added client recovery metadata that stores only request/result IDs and timestamps.
- Preserved cache behavior.
- Kept implementation intentionally synchronous for cache misses; no fake background worker.
```

Important current limitation:

```text
POST /analyze still waits for provider completion on cache misses.
The poll endpoint is for completed/failed/expired recovery and future async readiness, not true background processing yet.
```

Recommended next step from review:

```text
Run staging migration and smoke, then production migration and narrow smoke only if staging passes.
```

## Scope

Do:

1. Apply migration `0002_analyze_request_state.sql` to staging/preview DB.
2. Verify staging schema fields exist.
3. Verify staging fresh analyze path writes completed request state.
4. Verify staging poll endpoint returns completed response.
5. Verify staging cache hit short-circuit still works.
6. Verify staging result page and unlock/LINE/Email flow.
7. If staging passes, apply migration to production DB.
8. Verify production fresh analyze path.
9. Verify production poll endpoint completed response.
10. Verify production cache-hit short-circuit.
11. Verify production result page and unlock/LINE/Email flow.
12. Verify event/privacy metadata remains safe.
13. Update docs/runbook if needed.
14. Create review bundle, execution report, summary log.
15. Commit and push to `origin/staging`.

Do not:

- print DATABASE_URL
- print provider keys
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

## Migration

Migration file:

```text
apps/web/drizzle/0002_analyze_request_state.sql
```

### Staging / Preview

Apply migration to staging DB first.

Verify expected fields/indexes exist.

### Production

Only apply production migration after staging migration and staging smoke pass.

Production is live low-key, so keep migration disciplined.

Do not run destructive SQL.

Do not dump rows.

## Staging Verification

Use staging:

```text
https://staging.anyu.tw/m/ambiguous-temperature
```

Use synthetic input:

```text
他最近說想再觀察看看，但又會主動分享日常。我不知道這是在慢慢靠近，還是在避免給答案。
```

Verification flow:

```text
1. Fresh analyze:
   - submit synthetic input
   - expect success
   - capture requestId if returned/stored
   - capture resultId/resultPath
   - verify request state completed if inspectable
   - verify no raw input leaked into event metadata

2. Poll endpoint:
   - GET /api/modules/ambiguous-temperature/analyze/requests/[requestId]
   - expect completed
   - expect same resultId/resultPath
   - no raw input/provider output in response

3. Cache hit:
   - submit same input again
   - expect cacheHit true
   - expect same resultId if within cache window
   - verify provider was skipped if inspectable
   - verify request/result row counts stable if safe to inspect

4. Funnel:
   - result page loads
   - unlock intent works
   - LINE-first panel appears
   - LINE CTA target remains https://lin.ee/S6dnbJO
   - Email fallback works with synthetic email if tested
```

Synthetic email if needed:

```text
anyu-request-state-staging@example.com
```

Do not use real contact values.

## Production Verification

Only after staging passes.

Use production:

```text
https://anyu.tw/m/ambiguous-temperature
```

Use distinct synthetic input:

```text
對方說不是不想談未來，只是現在壓力很大，但每次我想確認關係方向，他又會把話題帶開。
```

Same verification flow:

```text
fresh analyze
poll endpoint completed response
cache hit same input
result page
unlock / LINE / Email fallback
privacy-safe metadata
```

Synthetic email if needed:

```text
anyu-request-state-production@example.com
```

Keep provider calls minimal.

## Poll Endpoint Requirements

Poll response must not expose:

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

Allowed response data:

```text
status
phase
elapsedMs
resultId
resultPath
errorCode
retryable
```

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

## Cache Interaction

Existing result cache is live verified.

Expected:

```text
cache miss fresh input: normal provider path, completed request state
cache hit same input: short-circuit, same resultId/resultPath, no provider call
```

Request state should not break cache hit behavior.

## Documentation Updates

Update if needed:

```text
apps/web/README.md
docs/operations/production-deployment-runbook.md
```

Document:

```text
0002 migration applied status
poll endpoint verification
known synchronous v0 limitation
future queue/worker optionality
```

Do not rewrite large docs.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-21-analyze-request-state-migration-live-verification-v0-review-bundle.md
```

Required sections:

```markdown
# Analyze Request State Migration + Live Verification v0 Review Bundle

Date: 2026-05-21

## 1. Summary

## 2. Migration Status

## 3. Staging Verification

## 4. Production Verification

## 5. Poll Endpoint Verification

## 6. Cache Interaction Verification

## 7. Funnel Verification

## 8. Event / Privacy Verification

## 9. Documentation Updates

## 10. Known Limitations

## 11. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-analyze-request-state-migration-live-verification-v0-execution-report.md
```

Report structure:

```markdown
# Analyze Request State Migration + Live Verification v0 Execution Report

## Summary

## Files Created

## Files Updated

## Migration Status

## Staging Verification

## Production Verification

## Poll Endpoint Status

## Cache Interaction Status

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
- migration status
- staging verification status
- production verification status
- poll endpoint status
- cache interaction status
- privacy status
- validation result
- commit hash
- staging push status

## Validation

Always run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

Run local Playwright if UI flow changed since previous validation or as a final guard:

```bash
cd apps/web && corepack pnpm test:e2e:local
```

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
git commit -m "ops: verify analyze request state live"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files/test artifacts/raw JSONL are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- migration status
- staging verification
- production verification
- poll endpoint result
- cache interaction result
- privacy/event result
- validation results
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
