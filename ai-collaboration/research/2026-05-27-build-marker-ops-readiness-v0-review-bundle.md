# Build Marker Ops Readiness v0 Review Bundle

## 1. Summary

Added a safe runtime build marker to the existing web health endpoint so staging and production freshness checks no longer depend only on deployment logs or manual candidate tracking.

## 2. Runtime Marker

The existing `GET /api/health` route now returns the previous health fields plus allowlisted build metadata:

- `app`
- `environment`
- `gitCommit`
- `gitBranch`
- `buildTime`
- `deploymentProvider`
- `versionSource`

The route keeps `ok: true` and `service: anyu-next-web` for compatibility.

## 3. Safety Boundary

The marker reads only explicit allowlisted env fields:

- `VERCEL`
- `VERCEL_ENV`
- `VERCEL_GIT_COMMIT_SHA`
- `VERCEL_GIT_COMMIT_REF`
- `ANYU_BUILD_TIME`
- `NODE_ENV`

It does not enumerate environment variables and does not expose database URLs, provider keys, LINE credentials, retention secrets, cache secrets, tokens, or raw content.

## 4. Fallback Behavior

Missing or invalid runtime metadata resolves to `unknown` instead of failing the health endpoint. This keeps the marker useful locally and prevents unsafe passthrough of malformed env values.

## 5. Ops Documentation

Updated production deployment and Module 01 metrics docs to use `/api/health` as safe deployment freshness context. If marker values are unknown, operators should fall back to Vercel deployment ID plus behavioral smoke evidence.

## 6. Tests Added

Tests cover:

- health route returns marker fields
- Vercel metadata normalization
- missing env fallback
- invalid values are sanitized
- forbidden secret-like keys are not present

## 7. Known Limitations

`buildTime` is available only if `ANYU_BUILD_TIME` is configured at build/deploy time. Vercel commit SHA/ref should still provide the primary freshness marker on hosted deployments.

## 8. Recommended Next Step

On the next staging or production refresh, record `/api/health` marker values in the relevant smoke report and compare `gitCommit` with the approved candidate.
