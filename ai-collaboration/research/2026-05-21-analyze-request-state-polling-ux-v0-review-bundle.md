# Analyze Request State + Polling UX v0 Review Bundle

Date: 2026-05-21

## 1. Summary

Implemented request-state persistence and a privacy-safe analyze request status endpoint for Module 01. The live analyze route remains synchronous because the app does not currently have a queue, worker, SSE, websocket, or durable background execution layer.

This v0 makes request status inspectable, records completed/failed/expired states, preserves cache-hit behavior, and prepares the frontend for a future true async polling flow without changing model strategy, prompt/schema semantics, result content, LINE flow, payment, legal semantics, or production launch posture.

## 2. Current Analyze Flow

Current v0 flow:

1. User submits once from `/m/ambiguous-temperature`.
2. Client blurs the textarea, scrolls/focuses the existing loading region, and shows existing staged wait copy.
3. `POST /api/modules/ambiguous-temperature/analyze` validates input and checks cache.
4. Cache hits return immediately with `status: "completed"`, `resultId`, result route, and `cacheHit: true`.
5. Cache misses create an `analysis_requests` row, mark request phases, call the provider synchronously, persist the result, and return `status: "completed"` with `requestId` and `resultId`.
6. Client can handle future `status: "processing"` responses and poll the status endpoint, but the current server path does not return early before provider completion.

## 3. Implemented Request States

Added request-state support on `analysis_requests`:

- `created`
- `analyzing`
- `validating_result`
- `persisting`
- `completed`
- `failed`
- `expired`

The route currently uses the states above. `validating` is reserved for future async/server-side split flow if needed.

## 4. API Changes

Updated submit response:

- `POST /api/modules/[moduleSlug]/analyze`
- Success now includes `status: "completed"`.
- Fresh analyses include `requestId`.
- Cache hits remain immediate and do not create duplicate request/result rows.

Added poll/status endpoint:

- `GET /api/modules/[moduleSlug]/analyze/requests/[requestId]`

Status responses:

- `processing`: returns `phase`, `elapsedMs`, and `retryable: false`
- `completed`: returns `resultId`, result route, `elapsedMs`, and `retryable: false`
- `failed`: returns friendly error metadata without stack traces
- `expired`: marks old processing requests expired and returns friendly retry metadata

## 5. Frontend UX Changes

The landing flow preserves the existing loading panel, wait copy, focus, and scroll behavior.

Client-side changes:

- Handles both `completed` and future `processing` analyze responses.
- Polls the status endpoint when a processing response or valid recovery state is present.
- Stores only recovery metadata in localStorage: `moduleSlug`, `requestId`, `resultId`, `pollUrl`, and timestamp.
- Clears recovery metadata after completion, failure, expiry, or timeout.
- Shows friendly failure/timeout copy without exposing technical details.

## 6. Cache Integration

Cache behavior is preserved:

- Identical redacted input within the cache window returns the existing result immediately.
- Cache hits still skip provider calls.
- Cache hits still skip persisted request/rate-limit creation.
- Cache hit responses now include `status: "completed"` in addition to the existing result route fields.

## 7. Failure / Expiry Behavior

Failure behavior:

- Provider/runtime errors after request creation mark the request `failed`.
- Polling failed status returns a generic retryable message.
- Technical error codes/categories are constrained to safe metadata.

Expiry behavior:

- Processing requests older than 10 minutes are marked `expired` by the status endpoint.
- Expired status returns a friendly retryable message.

## 8. Privacy / Event Metadata

Allowed metadata used:

- `requestId`
- `resultId`
- `status`
- `phase`
- `elapsedMs`
- `cacheHit`
- `errorCode`
- `errorCategory`
- `retryable`

Not exposed through the poll endpoint or client recovery state:

- raw input
- redacted input text
- email
- LINE ID
- full result JSON
- provider raw output
- secrets or env values

## 9. Schema / Migration Changes

Added Drizzle migration:

- `apps/web/drizzle/0002_analyze_request_state.sql`

New `analysis_requests` columns:

- `status`
- `started_at`
- `completed_at`
- `failed_at`
- `error_code`
- `error_category`
- `result_id`
- `last_heartbeat_at`

Production rollout requirement:

- Apply the migration before deploying code that writes request-state fields.
- Existing rows are backfilled as `completed` during migration, then the default changes to `created` for new rows.

## 10. Tests Added

Added/updated tests for:

- cache hit remains immediate and skips provider/request creation
- cache miss records request state and completed state
- provider failure marks a persisted request failed
- poll endpoint returns safe processing status
- poll endpoint returns completed route without result JSON
- poll endpoint returns friendly failed metadata
- poll endpoint expires old processing requests

## 11. Known Limitations

- This is not true background async processing.
- `POST /analyze` still waits for the provider on cache misses.
- If the browser/network aborts before the server returns a `requestId`, the client cannot recover by request ID because no ID was delivered to the browser.
- The polling endpoint is ready for a future queue/worker or early-response design, but this handoff deliberately does not introduce that architecture.

## 12. Validation Results

All required validation passed:

- `python3 -m compileall oradar` passed
- `python3 -m compileall tools/topic-ingestion` passed
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed, 25 tests
- `corepack pnpm lint` passed
- `corepack pnpm test` passed, 22 files / 79 tests
- `corepack pnpm build` passed
- `corepack pnpm test:e2e:local` passed, 9 tests

## 13. Recommended Next Step

Deploy to staging after migration review and run a protected staging smoke that confirms:

- fresh analyze writes request status
- status endpoint returns completed for the synthetic request
- cache hit still short-circuits
- result page and LINE fake-door flow remain unchanged
