# Result Cache Migration + Live Verification v0 Execution Report

## Summary

Completed live result-cache activation and verification work for both staging and production.

- added `ANALYSIS_CACHE_HASH_SECRET` to:
  - Preview (`staging`)
  - Production
- applied the cache metadata migration directly to Neon `preview` and `production`
- verified staging miss → hit behavior
- verified production miss → hit behavior
- confirmed event metadata stayed privacy-safe
- documented one important ops rule learned during the pass: secret changes required a fresh deployment before cache hits became live

## Files Created

- `ai-collaboration/handoffs/2026-05-21-result-cache-migration-live-verification-v0-handoff.md`
- `ai-collaboration/research/2026-05-21-result-cache-migration-live-verification-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-21-result-cache-migration-live-verification-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`
- `apps/web/README.md`
- `docs/operations/production-deployment-runbook.md`

## Secret Status

- preview / staging: `ANALYSIS_CACHE_HASH_SECRET` present
- production: `ANALYSIS_CACHE_HASH_SECRET` present
- secret value was generated and stored without printing it

## Migration Status

Applied directly on Neon:

- preview branch `br-fragrant-union-aoh4udf1`
- production branch `br-square-star-aosaqd0q`

Verified schema now includes:

- `cache_key_version`
- `cache_key_hash`
- `model_strategy`
- `primary_model`
- `analysis_requests_cache_idx`

## Staging Cache Verification

Staging target:

- `https://staging.anyu.tw`

Important observed sequence:

1. before deployment refresh:
   - identical repeated requests still produced a second miss
   - this confirmed that secret presence in Vercel env alone was not enough
2. after staging redeploy:
   - one transitional request still landed without cache metadata
   - the next clean synthetic session (`cache-staging-verify-20260521-b`) produced the usable proof
3. final proof:
   - first call: `cacheHit false`
   - second identical call: `cacheHit true`
   - same `resultId`
   - request/result row counts unchanged on hit

## Production Cache Verification

Production target:

- `https://anyu.tw`

Important observed sequence:

1. after only env + DB migration:
   - production analyze response still lacked the new `cacheHit` field
   - this proved the live production app code did not yet include commit `16bd1b6`
2. action taken:
   - deployed the current repo state to production via Vercel
3. final proof:
   - first call on fresh session `cache-prod-verify-20260521-b`: `cacheHit false`
   - second identical call: `cacheHit true`
   - same `resultId`
   - no additional `analysis_requests` / `analysis_results` row on hit

## Event / Privacy Status

Verified for the staging and production verification sessions:

- `cacheHit` and `cacheKeyVersion` appeared in approved `analysis_completed` metadata
- no event metadata matched:
  - raw input
  - email
  - LINE ID
  - provider raw output
  - `DATABASE_URL`
  - `ANTHROPIC_API_KEY`
  - `ANALYSIS_CACHE_HASH_SECRET`

## Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed
- local Playwright was not run because no UI behavior changed

## Known Technical Debt

- simultaneous identical misses can still race before the first cache-backed row is written
- Vercel env changes remain operationally incomplete until a fresh deployment is also done

## Tech Debt Review

### New Technical Debt Introduced

- none

### Existing Technical Debt Observed

- no concurrency locking exists for identical simultaneous misses
- live ops still require careful coordination between:
  - env secret presence
  - Neon schema state
  - actual deployed app code

### Opportunistic Cleanup Completed

- documented the need to redeploy after changing `ANALYSIS_CACHE_HASH_SECRET`
- corrected the production mismatch by deploying the actual cache-enabled code, not just redeploying the older production snapshot

### Deferred Cleanup Candidates

- a later concurrency-control pass if duplicate simultaneous provider calls become a real cost issue
- a later tighter ops checklist if more env-backed runtime features are added

### Recommended Follow-up

- no immediate code follow-up is required
- only pursue cache-concurrency hardening if real duplicate misses become materially costly

## Deviations From Handoff

- production verification required a fresh code deployment of the current cache-enabled app because the live production app was still serving older code
- this was a necessary operational step to verify the feature in production at all

## Git Commit

- pending at report-write time

## Staging Push

- pending at report-write time

## Remaining Uncertainties

- none blocking the verified miss → hit cache behavior
- concurrency race behavior remains intentionally unresolved in v0

## Recommended Next Step

- treat result-cache activation as complete
- keep monitoring only if future traffic suggests duplicate simultaneous analyze calls are materially costly
