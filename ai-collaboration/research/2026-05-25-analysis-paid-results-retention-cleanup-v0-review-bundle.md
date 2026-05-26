# Analysis Paid Results Retention Cleanup v0 Review Bundle

Date: 2026-05-26

## 1. Summary

`analysis_paid_results` is now covered by the scheduled retention cleanup path. The cleanup policy is in-place scrubbing: expired rows keep identifiers and references, while retained paid-result content is removed.

## 2. Existing Retention Coverage

Before this task, scheduled cleanup covered:

- `analysis_requests`
- `analysis_results`

After this task, scheduled cleanup also covers:

- `analysis_paid_results`

## 3. analysis_paid_results Cleanup Policy

Policy: scrub in place.

Eligible rows:

- `retention_expires_at` is present.
- `retention_expires_at` is before cleanup time.
- `paid_result_json` is not already null.

Mutation for eligible rows:

- `paid_result_json = NULL`
- `status = 'expired'`
- `error_code = 'retention_expired'`
- `updated_at = cleanup time`

Identifiers and `analysis_result_id` references are preserved for aggregate/reference integrity.

## 4. Dry-run Output Changes

Dry-run output now includes aggregate `analysisPaidResults` counts:

- `total`
- `withRetention`
- `overdue`
- `eligibleForCleanup`
- `scrubbed`

Dry-run sets `scrubbed` to `0` and does not mutate rows.

## 5. Route / Runtime Changes

- Extended `runScheduledRetentionCleanup` to count `analysis_paid_results`.
- Extended non-dry-run cleanup to scrub eligible paid-result rows.
- Existing request/result cleanup behavior is unchanged.
- Cron route returns the extended summary through the existing authorized endpoint.

## 6. Tests Added

- Dry-run aggregate counts now include `analysisPaidResults`.
- Non-dry-run cleanup reports paid-result scrub count.
- Already scrubbed paid-result rows are not mutated.
- Cron dry-run response includes `analysisPaidResults`.
- Existing unauthorized-route coverage remains.

## 7. Staging Verification

- Staging deployment refreshed: `dpl_wmQpvL15rP6yYen9VD2Ase19FbPm`.
- `https://staging.anyu.tw` points to the refreshed deployment.
- Staging unauthorized route check returned HTTP 401.
- Authorized staging dry-run was not available because the pulled preview env did not expose a usable cleanup secret.
- Safe Neon aggregate check on staging reported `analysis_paid_results` total `2`, with retention `2`, overdue `0`, eligible for cleanup `0`.

## 8. Production Dry-run Verification

- Production deployment refreshed: `dpl_8wAC5ZnKjba5c8RCdB8tVwmtnYsr`.
- `https://anyu.tw` points to the refreshed deployment.
- Production unauthorized route check returned HTTP 401.
- Authorized production route dry-run was blocked because the local Vercel env pull did not provide a usable cleanup secret value.
- Safe Neon aggregate check on production reported `analysis_paid_results` total `1`, with retention `1`, overdue `0`, eligible for cleanup `0`.
- No destructive production cleanup was run.

Follow-up on 2026-05-26:

- Production `CRON_SECRET` is listed as configured in Vercel, but production env pull still returned no usable cleanup secret value.
- Unauthorized production route check remained HTTP 401.
- Authorized production route dry-run was not run because no direct usable cleanup secret was available through the approved local secure tooling path.
- Fallback direct Neon aggregate check reported `analysisRequests` eligible `1`, `analysisResults` eligible `6`, and `analysisPaidResults` total `1` / with retention `1` / overdue `0` / eligible `0`.
- No destructive cleanup was run.

## 9. Event / Privacy Verification

- Reports and dry-run checks use aggregate counts only.
- No raw input, provider output, full result JSON, `paid_result_json`, contact values, LINE user IDs, fulfillment codes, unlock tokens, tokenized URLs, or secrets are included.

## 10. Documentation Updates

- Updated `docs/operations/production-deployment-runbook.md`.
- Updated `apps/web/README.md`.
- Documented `analysis_paid_results` coverage, dry-run output, and scrub-in-place policy.

## 11. Known Limitations

- Authorized live route dry-run could not be completed without access to the cleanup secret.
- The deployed route was verified for unauthorized protection, and DB aggregates were verified directly through Neon.
- The exact authorized route response still needs to be captured by an operator with direct cleanup-secret access.

## 12. Recommended Next Step

Run one authorized production dry-run from an environment that can access `RETENTION_CLEANUP_SECRET` or `CRON_SECRET`, then record the aggregate response in the ops log.
