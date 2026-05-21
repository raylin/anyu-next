# Result Cache + Idempotent Analyze v0 Review Bundle

Date: 2026-05-21

## Scope

Implemented a privacy-safe, 24-hour result reuse path for Module 01 analyze requests so identical redacted input can return the existing result instead of calling the provider again.

## What Landed

- Added request-side cache metadata columns in `analysis_requests`:
  - `cache_key_version`
  - `cache_key_hash`
  - `model_strategy`
  - `primary_model`
- Added Drizzle migration `apps/web/drizzle/0001_wooden_king_cobra.sql`.
- Added `buildAnalyzeCacheKey()` with:
  - whitespace/unicode normalization
  - HMAC-SHA256 hashing
  - production-safe secret requirement via `ANALYSIS_CACHE_HASH_SECRET`
  - non-production fallback secret for local/test only
- Added DB lookup helper to reuse only unexpired, non-deleted results.
- Updated the analyze route so:
  - cache hit returns the original `resultId` and route
  - cache hit skips provider work
  - cache miss preserves the existing request/result persistence flow
  - event metadata remains safe and now includes `cacheHit`

## Cache Match Boundary

Cache reuse only happens when all of the following still match:

- module slug
- normalized redacted input
- situation
- prompt version
- schema version
- model strategy
- provider
- primary model

## Privacy / Safety Notes

- Hashing is built from redacted input, not raw input.
- No raw input, email, LINE ID, full provider response, or secret values were added to event metadata.
- Expired rows are not reused.
- Production cache reuse is disabled if `ANALYSIS_CACHE_HASH_SECRET` is missing.

## Validation Added

- cache-key normalization / invalidation tests
- analyze-route cache hit test
- analyze-route cache miss test
- event metadata guard still accepts the new safe cache fields

## Known v0 Limitations

- identical simultaneous requests can still race and both miss the cache before the first result is written
- no unique cache constraint or lock was added in this pass
- production needs migration `0001_wooden_king_cobra.sql` before the cache metadata exists there

## Recommended Follow-Up

- if duplicate simultaneous requests become a real cost issue, add a later concurrency-control pass with either a lightweight request lock or a stricter cache uniqueness strategy
