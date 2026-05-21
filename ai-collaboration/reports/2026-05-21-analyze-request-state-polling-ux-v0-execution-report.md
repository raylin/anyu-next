# Analyze Request State + Polling UX v0 Execution Report

## Summary

Implemented request-state persistence and a privacy-safe status endpoint for Module 01 analyze requests. The implementation is an honest synchronous v0: it records request phases and supports status polling/recovery metadata, but it does not introduce a queue, worker, streaming, SSE, websocket, or model/prompt/schema changes.

## Files Created

- `ai-collaboration/handoffs/2026-05-21-analyze-request-state-polling-ux-v0-handoff.md`
- `ai-collaboration/research/2026-05-21-analyze-request-state-polling-ux-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-21-analyze-request-state-polling-ux-v0-execution-report.md`
- `apps/web/drizzle/0002_analyze_request_state.sql`
- `apps/web/drizzle/meta/0002_snapshot.json`
- `apps/web/src/app/api/modules/[moduleSlug]/analyze/requests/[requestId]/route.ts`
- `apps/web/src/tests/analyze-request-status-route.test.ts`

## Files Updated

- `apps/web/src/app/api/modules/[moduleSlug]/analyze/route.ts`
- `apps/web/src/components/modules/ai-temperature/AiTemperatureLanding.tsx`
- `apps/web/src/lib/ai/types.ts`
- `apps/web/src/lib/db/runtime.ts`
- `apps/web/src/lib/db/schema.ts`
- `apps/web/src/lib/modules/ai-temperature-ui.ts`
- `apps/web/src/tests/analyze-route-cache.test.ts`
- `apps/web/drizzle/meta/_journal.json`
- `apps/web/README.md`
- `docs/operations/production-deployment-runbook.md`
- `ai-collaboration/summaries/summary_log.md`

## Request State Implementation

Added `analysis_requests` status fields and runtime helpers to create, update, and fetch request status safely. Fresh analyze requests now move through `created`, `analyzing`, `validating_result`, `persisting`, and `completed`; provider/runtime failures after request creation are marked `failed`; old processing requests can be marked `expired` by the status endpoint.

## API Changes

Updated `POST /api/modules/[moduleSlug]/analyze` to include `status: "completed"` in successful responses and `requestId` for fresh analyses.

Added `GET /api/modules/[moduleSlug]/analyze/requests/[requestId]` to return privacy-safe status metadata for processing, completed, failed, and expired requests.

## Frontend Changes

Updated the landing analyze flow to:

- preserve existing loading panel and wait-state copy
- handle future `processing` submit responses
- poll the request status endpoint when needed
- store only safe recovery metadata in localStorage
- clear recovery metadata after completion/failure/expiry/timeout
- show friendly retry/failure copy

## Cache Integration

Cache hits still short-circuit before persisted rate-limit checks, provider calls, request creation, or result creation. Cache-hit response shape now includes `status: "completed"`.

## Schema / Migration Changes

Added `apps/web/drizzle/0002_analyze_request_state.sql`.

Migration adds:

- `status`
- `started_at`
- `completed_at`
- `failed_at`
- `error_code`
- `error_category`
- `result_id`
- `last_heartbeat_at`
- `analysis_requests_status_idx`

Production migration is required before deploying code that writes these columns.

## Tests Added

Added/updated route tests covering:

- request status creation/completion on cache miss
- failure status update when provider generation fails
- cache hit remains immediate
- poll endpoint processing/completed/failed/expired responses
- poll endpoint privacy safety around raw/result payload exposure

## Validation Results

All required validation passed:

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed, 25 tests
- `corepack pnpm lint` passed
- `corepack pnpm test` passed, 22 files / 79 tests
- `corepack pnpm build` passed
- `corepack pnpm test:e2e:local` passed, 9 tests

## Known Technical Debt

The request-state implementation is intentionally transitional. It prepares for polling but does not yet create true durable async analysis because the app has no worker/queue architecture.

## Tech Debt Review

### New Technical Debt Introduced

None beyond the explicit transitional limitation that polling is ready before true async execution exists.

### Existing Technical Debt Observed

Provider latency remains the dominant perceived-wait issue. The current serverless route still waits for provider completion on cache misses.

### Opportunistic Cleanup Completed

Normalized Drizzle migration metadata after generating the schema snapshot so the repo has a single `0002` request-state migration.

### Deferred Cleanup Candidates

- Evaluate a queue/worker or durable async route only if product usage justifies the added architecture.
- Add a dedicated client interaction test for recovery storage if the project later adds browser-unit testing beyond Playwright.

### Recommended Follow-up

After staging migration, run a protected staging smoke that verifies fresh analyze status completion, poll endpoint response, cache-hit short-circuit behavior, and unchanged result/LINE flow.

## Deviations From Handoff

Implemented the safe intermediate version rather than true early-return async processing because Vercel serverless cannot keep arbitrary background work alive after returning a response without additional architecture.

## Git Commit

Pending at report-write time.

## Staging Push

Pending at report-write time.

## Remaining Uncertainties

- Whether a future true async worker/queue is worth the complexity versus continued synchronous provider waits.
- Whether staging should expose request status in any internal QA tooling, or keep it API-only.

## Recommended Next Step

Run staging migration and protected staging smoke after this commit is pushed to `origin/staging`.
