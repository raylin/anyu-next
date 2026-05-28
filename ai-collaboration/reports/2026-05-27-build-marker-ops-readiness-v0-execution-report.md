# Build Marker Ops Readiness v0 Execution Report

## Summary

Added a safe build/version marker to the existing `/api/health` route and documented how operators should use it during deployment, smoke, and metrics review.

## Completed Work

- Saved the handoff under `ai-collaboration/handoffs/`.
- Added a runtime build marker helper with allowlisted env reads and sanitization.
- Extended `/api/health` with safe deployment metadata while preserving the existing health payload compatibility field.
- Added unit tests for marker shape, env mapping, unknown fallback, and secret-key exclusion.
- Updated production deployment and Module 01 metrics runbooks with runtime marker usage guidance.
- Created the review bundle for handoff continuity.

## Architecture Decisions

- Reused `/api/health` instead of creating a second marker endpoint to keep ops checks simple.
- Preserved the existing `service: anyu-next-web` field for compatibility.
- Returned `unknown` for unavailable or invalid metadata instead of failing health checks.
- Used Vercel env metadata as the primary version source and avoided environment enumeration.

## Validation Results

- `python3 -m compileall oradar` passed.
- `python3 -m compileall tools/topic-ingestion` passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed: 25 tests.
- `cd apps/web && corepack pnpm lint` passed.
- `cd apps/web && corepack pnpm test` passed: 31 files, 209 tests.
- `cd apps/web && corepack pnpm build` passed.
- `cd apps/web && corepack pnpm test:e2e:local` passed: 11 Playwright tests.

## Safety / Privacy

No secrets, tokenized URLs, raw input, provider output, paid result JSON, LINE identifiers, or full environment dumps are recorded. The marker exposes only explicitly allowlisted deployment fields.

## Blockers

None at implementation time.

## Uncertainties

- Hosted deployments may not provide `ANYU_BUILD_TIME` unless explicitly configured.
- Vercel commit env availability should be confirmed during the next staging or production smoke.

## Tech Debt Review

### New Technical Debt Introduced

None.

### Existing Technical Debt Observed

Deployment freshness previously relied on external Vercel state and smoke behavior rather than an app-level runtime marker.

### Opportunistic Cleanup Completed

The health route test now verifies safe metadata boundaries instead of only exact static payload equality.

### Deferred Cleanup Candidates

Consider adding a deploy-time `ANYU_BUILD_TIME` env injection if operators need timestamp freshness in addition to commit/ref freshness.

### Recommended Follow-up

Record `/api/health` marker values in the next staging refresh or production smoke report.

## Git Commit

Pending commit at report update time.

## Staging Push

Pending push to `origin/staging` at report update time.
