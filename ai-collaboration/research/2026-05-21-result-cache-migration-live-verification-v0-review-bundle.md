# Result Cache Migration + Live Verification v0 Review Bundle

Date: 2026-05-21

## 1. Summary

Result cache migration and live verification are complete for both staging and production.

- `ANALYSIS_CACHE_HASH_SECRET` is now present in:
  - Preview (`staging`)
  - Production
- cache metadata migration is now applied on Neon branches:
  - `preview`
  - `production`
- staging miss → hit verification passed after:
  - setting the secret
  - refreshing the staging deployment
- production miss → hit verification passed after:
  - setting the secret
  - migrating the production branch
  - deploying the current cache-enabled app code to production

## 2. Environment Secret Status

- Preview (`staging`): present
- Production: present
- Secret value was never printed or copied into repo artifacts.

## 3. Migration Status

Migration equivalent to `apps/web/drizzle/0001_wooden_king_cobra.sql` is live on:

- Neon `preview` branch `br-fragrant-union-aoh4udf1`
- Neon `production` branch `br-square-star-aosaqd0q`

Verified on both branches:

- `analysis_requests.cache_key_version`
- `analysis_requests.cache_key_hash`
- `analysis_requests.model_strategy`
- `analysis_requests.primary_model`
- `analysis_requests_cache_idx`

## 4. Staging Verification

Target:

- `https://staging.anyu.tw`

Synthetic session used:

- `cache-staging-verify-20260521-b`

Observed sequence:

1. first call after refreshed deployment:
   - returned new `resultId` `076f7335-d001-415b-a73b-495e68379fdd`
   - `cacheHit: false`
2. second identical follow-up after the cache-backed row existed:
   - returned same `resultId`
   - `cacheHit: true`
   - `analysis_request_count` stayed `2`
   - `analysis_result_count` stayed `2`

Note:

- an earlier transitional staging session (`cache-staging-verify-20260521-a`) proved that setting the secret without a fresh deployment was not enough
- one request immediately after the staging redeploy still landed without cache metadata, so the decisive hit proof used the subsequent clean session `...-b`

## 5. Production Verification

Target:

- `https://anyu.tw`

Synthetic session used:

- `cache-prod-verify-20260521-b`

Observed sequence:

1. first call after production code deploy:
   - returned new `resultId` `b1eb5d08-6dfe-4ce1-80ae-206b07b141f2`
   - `cacheHit: false`
2. second identical call:
   - returned same `resultId`
   - `cacheHit: true`
   - `analysis_request_count` stayed `1`
   - `analysis_result_count` stayed `1`

Important production note:

- a simple production redeploy of the older live snapshot was not enough, because the older app code did not yet include the `cacheHit` response field
- production verification only became valid after deploying the current repo state to production

## 6. Cache Hit / Miss Evidence

Staging:

- miss result id: `076f7335-d001-415b-a73b-495e68379fdd`
- hit result id: same
- `analysis_completed` events:
  - `cacheHit false`: `2`
  - `cacheHit true`: `1`

Production:

- miss result id: `b1eb5d08-6dfe-4ce1-80ae-206b07b141f2`
- hit result id: same
- `analysis_completed` events:
  - `cacheHit false`: `1`
  - `cacheHit true`: `1`

## 7. Event / Privacy Verification

Safe metadata present and expected:

- `cacheHit`
- `cacheKeyVersion`
- `resultId`
- model/timing metadata already approved by prior runtime work

Forbidden metadata scan results for the verification sessions:

- raw input: `0`
- email: `0`
- LINE ID: `0`
- provider raw output: `0`
- `DATABASE_URL`: `0`
- `ANTHROPIC_API_KEY`: `0`
- `ANALYSIS_CACHE_HASH_SECRET`: `0`

## 8. Documentation Updates

Updated:

- `apps/web/README.md`
- `docs/operations/production-deployment-runbook.md`

Added operational clarification:

- after adding or changing `ANALYSIS_CACHE_HASH_SECRET`, a fresh deployment is required before live cache hits are expected

## 9. Remaining Limitations

- this remains a retry/idempotency cache, not a concurrency lock
- simultaneous identical misses can still race before the first cache-backed row exists
- staging required one extra verification turn because env + deployment freshness did not line up immediately

## 10. Recommended Next Step

- keep this cache behavior in place
- only pursue a later concurrency-control pass if duplicate simultaneous provider calls become materially costly
