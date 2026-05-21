# Handoff: Analyze Request State + Polling UX v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Introduce a request-state and polling-based analyze UX for Module 01 — 曖昧溫度計 — to improve long-wait resilience and perceived reliability.

This task should make analysis requests easier to recover from during refresh/retry/network interruption, while preserving the current result page, fake-door flow, LINE funnel, model strategy, prompt/schema semantics, and privacy boundaries.

This is a technical UX / reliability task.

Do not implement token streaming.

Do not switch model strategy.

Do not change prompt/schema semantics.

Do not change DB retention policy beyond fields required for request state.

Do not change legal semantics, LINE flow, auth, payment, portal, ads posture, or production launch posture.

## Background

Current state:

```text
Module 01 production low-key launch: live
UI polish: sealed
Local Playwright UI smoke: passing
Result cache + idempotent analyze: live verified
Scheduled retention cleanup: live
```

Known UX issue:

```text
Analyze latency is often around 25–30 seconds, mostly provider latency.
Current UX uses loading/skeleton/wait-state copy, but browser refresh or network interruption can still feel fragile.
```

Previously discussed technical UX path:

```text
1. Result Cache + Idempotent Analyze v0 — complete
2. Analyze Request State + Polling UX v0 — this task
3. Streaming / Progressive Result UX exploration — later, not now
```

This task implements request tracking and polling/recovery behavior, not true background workers or token streaming.

## Scope

Do:

1. Review existing analyze route, analysis_requests schema, result cache, and loading UX.
2. Add request status/state fields if needed.
3. Create or update API shape to support polling request status.
4. Update frontend analyze flow to submit once, then poll for completion.
5. Preserve existing loading panel and focus/scroll behavior.
6. Support refresh/retry recovery when requestId/resultId is known.
7. Ensure cache hits still short-circuit cleanly.
8. Add failure/expired states with friendly copy.
9. Add tests.
10. Update docs/runbook.
11. Run validation including local Playwright if UI flow changes.
12. Create review bundle, execution report, summary log.
13. Commit and push to `origin/staging`.

Do not:

- implement queue/worker infrastructure
- implement token streaming
- implement SSE/websocket
- switch to Haiku
- change provider/prompt/schema output
- change result content
- change paid/LINE/contact flow
- change legal pages
- change production launch status
- start ads

## Design Direction

The user should feel:

```text
I submitted once.
The app is still working.
If I refresh, I am not punished.
If the same input was already analyzed, I get the cached result.
If something fails, I get a clear friendly message.
```

Avoid:

```text
fake percentage progress
chat-like token streaming
overly technical request status
large UI redesign
```

## Request States

Recommended minimal states:

```text
created
validating
analyzing
validating_result
persisting
completed
failed
expired
```

Use fewer states if simpler and maintainable.

Must support at least:

```text
pending / processing
completed
failed
expired
```

## API Shape

Current analyze route likely returns a result directly.

Recommended v0 shape:

### Submit

```http
POST /api/modules/[moduleSlug]/analyze
```

Can return either:

```json
{
  "status": "completed",
  "resultId": "...",
  "resultPath": "...",
  "cacheHit": true
}
```

or:

```json
{
  "status": "processing",
  "requestId": "...",
  "pollUrl": "/api/modules/ambiguous-temperature/analyze/requests/..."
}
```

If current implementation cannot truly return before provider finishes, a transitional approach is acceptable:

```text
Submit still waits for provider, but persists request status and returns requestId/resultId for recovery.
```

However, the preferred goal is a polling-supported route.

### Poll

Add endpoint such as:

```http
GET /api/modules/[moduleSlug]/analyze/requests/[requestId]
```

Response:

```json
{
  "status": "processing",
  "elapsedMs": 12000,
  "phase": "analyzing"
}
```

or:

```json
{
  "status": "completed",
  "resultId": "...",
  "resultPath": "/m/ambiguous-temperature/result/..."
}
```

or:

```json
{
  "status": "failed",
  "errorCode": "provider_timeout",
  "message": "這段內容暫時沒有分析成功，請稍後再試一次。"
}
```

Do not expose raw input or provider output.

## Implementation Caution

Vercel serverless cannot keep arbitrary background work alive after response unless architecture supports it.

If true background execution is not currently possible, implement a safe intermediate version:

```text
- persist request status before provider call
- expose status endpoint
- frontend stores requestId
- cache hit/retry can recover result
- polling is ready for future async worker
```

But do not fake completed status if work is not actually async.

Codex should inspect current Next.js runtime constraints and choose the most honest maintainable v0.

## DB / Schema

Review current `analysis_requests` and `analysis_results`.

If needed, add fields:

```text
status
started_at
completed_at
failed_at
error_code
error_category
result_id
last_heartbeat_at
```

or use existing fields if already present.

If schema migration is needed:

- Add migration.
- Update tests.
- Document staging/production migration requirement.
- Do not run production migration unless this handoff explicitly includes it and it is safe.
- Because production is live, clearly document rollout requirement.

## Frontend UX

Preserve current UI tone.

Update landing/result flow as needed:

```text
submit analyze
blur textarea
scroll/focus loading region
show staged wait copy
poll status endpoint
navigate to result on completion
show friendly retry/error on failure
```

Recommended waiting copy can reuse current copy.

Do not add fake progress %.

If requestId is stored in session/local storage:

```text
store only requestId/resultId/moduleSlug
do not store raw input
clear after completion/failure/expiry
```

If input hash/cache handles retry, do not expose hash client-side.

## Cache Integration

Existing result cache is live verified.

Expected behavior:

```text
same input within cache window returns existing result immediately
cacheHit true remains safe
polling should not create duplicate provider calls for cache hit
```

Add tests to ensure polling/status changes do not break cache.

## Failure / Expiry

Define:

```text
request expired after a reasonable window, e.g. 5–10 minutes
failed if provider/schema validation fails
```

Friendly copy:

```text
這段內容暫時沒有分析成功，可以稍後再試一次。
```

Do not expose technical stack traces.

## Event / Privacy Metadata

Allowed metadata:

```text
requestId
resultId
status
phase
elapsedMs
cacheHit
errorCode
errorCategory
retryable
```

Forbidden:

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

## Tests

Add/update tests for:

```text
submit creates/updates request status
poll endpoint returns processing/completed/failed safely
completed status includes result route
failed status returns friendly error
expired request behavior
cache hit path remains immediate and safe
cache hit does not create duplicate request/result rows
client does not persist raw input
event metadata is privacy-safe
```

Update Playwright smoke only if user-visible flow changes and robust.

Run local Playwright:

```bash
cd apps/web && corepack pnpm test:e2e:local
```

if UI flow changed.

## Docs

Update:

```text
apps/web/README.md
docs/operations/production-deployment-runbook.md
```

Document:

```text
analyze request state behavior
poll endpoint
known limitation if not true background async
production migration requirement if any
how cache and polling interact
```

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-21-analyze-request-state-polling-ux-v0-review-bundle.md
```

Required sections:

```markdown
# Analyze Request State + Polling UX v0 Review Bundle

Date: 2026-05-21

## 1. Summary

## 2. Current Analyze Flow

## 3. Implemented Request States

## 4. API Changes

## 5. Frontend UX Changes

## 6. Cache Integration

## 7. Failure / Expiry Behavior

## 8. Privacy / Event Metadata

## 9. Schema / Migration Changes

## 10. Tests Added

## 11. Known Limitations

## 12. Validation Results

## 13. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-analyze-request-state-polling-ux-v0-execution-report.md
```

Report structure:

```markdown
# Analyze Request State + Polling UX v0 Execution Report

## Summary

## Files Created

## Files Updated

## Request State Implementation

## API Changes

## Frontend Changes

## Cache Integration

## Schema / Migration Changes

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
- request/polling behavior summary
- migration status
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

If UI flow changes, also run:

```bash
cd apps/web && corepack pnpm test:e2e:local
```

If schema/migration changes, run appropriate local migration/test commands and document production migration needs.

## Constraints

Do not implement:

```text
true queue/worker unless already available and low-risk
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

## Production Notes

Production is live.

If this task introduces DB migration:

```text
Do not assume production is updated.
Document migration requirement and recommended live verification.
```

Do not run production migration unless explicitly safe and approved by this task's execution plan.

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "feat: add analyze request polling state"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files/test artifacts/raw JSONL are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- request state behavior
- API changes
- frontend UX changes
- cache integration
- migration status
- tests added
- validation results
- Playwright result if run
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
