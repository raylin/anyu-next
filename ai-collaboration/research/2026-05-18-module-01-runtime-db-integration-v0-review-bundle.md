# Module 01 Runtime + DB Integration v0 Review Bundle

## 1. Summary

Module 01 now has a real server-side integration path inside `apps/web`:

- landing submit posts to `/api/modules/ambiguous-temperature/analyze`
- server-side prompt assembly and provider routing are in place
- model output is parsed and validated against `schemas/product_result_schema_v0.json`
- normalized result records are designed to be persisted as the UI source of truth
- result pages support DB-backed loading for real result IDs and keep `/result/demo` for internal review
- fake-door unlock intent and contact capture now have API routes and UI wiring

This is still v0 scope:

- no auth
- no payment
- no email or LINE delivery
- no share PNG / OG generation
- no scheduled retention cleanup job

## 2. Routes Implemented

- `/m/ambiguous-temperature`
- `/m/ambiguous-temperature/result/demo`
- `/m/[moduleSlug]/result/[resultId]`
- `/api/modules/[moduleSlug]/analyze`
- `/api/events`
- `/api/unlock-intent`
- `/api/contact`

## 3. Database Tables

Drizzle schema now covers:

- `sessions`
- `events`
- `analysis_requests`
- `analysis_results`
- `unlock_intents`
- `contact_submissions`

The `analysis_results.normalized_result_json` field is the intended UI-facing source of truth. Raw provider output is optional and nullable.

## 4. Analyze Flow

Landing submit now performs:

1. client-side input threshold check
2. POST to `/api/modules/ambiguous-temperature/analyze`
3. server-side module resolution
4. basic redaction of obvious email / phone / handle-like text
5. request record creation
6. provider call
7. JSON parse + schema validation
8. normalized result persistence
9. `input_submitted` and `analysis_completed` event persistence
10. JSON response with `resultId` and `redirectTo`

If provider or DB configuration is missing, the route returns a friendly config error instead of crashing the app.

## 5. Result Loading

`/m/[moduleSlug]/result/[resultId]` now branches as follows:

- `demo` renders the internal static review result
- other IDs attempt DB-backed loading
- missing DB config shows a friendly unavailable state
- missing records show a friendly not-found state

Stored results are re-validated before being mapped into the UI view model.

## 6. Event Tracking

`/api/events` persists allowlisted events only:

- `page_view`
- `input_started`
- `input_submitted`
- `analysis_completed`
- `paid_unlock_clicked`
- `contact_submitted`
- `share_card_clicked`
- `error_seen`

Basic metadata guards reject suspicious keys like `text`, `rawText`, `input`, and `conversation`.

## 7. Unlock Intent / Contact Capture

Result page fake-door flow now works like this:

1. user clicks the paid CTA
2. runtime mode calls `/api/unlock-intent`
3. contact capture UI is revealed
4. form submits to `/api/contact`
5. confirmation or friendly error is shown inline

In `demo` mode, the same UI path is preserved without persistence.

## 8. Privacy Handling

Current v0 privacy handling includes:

- basic redaction helper for email / phone / handle-like patterns
- raw text excluded from event payloads
- redacted input stored separately from event records
- retention fields present on request/result records
- contact data stored separately from analysis result JSON

This is intentionally basic. It should be treated as first-pass redaction, not advanced PII detection.

## 9. Provider Integration

Provider wrapper behavior:

- Anthropic first when `ORADAR_PROVIDER=anthropic` and `ANTHROPIC_API_KEY` exists
- lightweight OpenAI fallback path available if configured
- server-only helper with friendly error translation
- no live provider tests in CI

Prompt loading stays server-side and reads `prompts/product_result_prompt_v0.md` from the repo root.

## 10. What Is Still Deferred

- real payment
- auth
- email sending
- LINE automation
- share PNG / OG rendering
- deletion scheduler for retention expiry
- advanced PII detection
- production migration execution against a live database

## 11. Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed
- local GET smoke checks for `/m/ambiguous-temperature` and `/m/ambiguous-temperature/result/demo` returned `200 OK`
- live analyze flow was not executed end-to-end because this workspace does not currently expose `DATABASE_URL` or provider API keys

## 12. Issues For ChatGPT Review

- Should `provider_raw_json` be kept at all in v0, or removed until retention policy is fully implemented?
- Should `page_view` and other passive events be added from the client in the next step, or wait until a broader analytics pass?
- Should the result page reveal contact capture only after unlock intent, or should a passive fallback contact block remain visible on error paths?
