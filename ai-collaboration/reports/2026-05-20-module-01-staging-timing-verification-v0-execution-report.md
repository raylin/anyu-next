# Module 01 Staging Timing Verification v0 Execution Report

## Summary

Verified the live staging timing instrumentation with two successful synthetic analyze flows. Safe timing metadata was present on the resulting `analysis_completed` events, privacy checks passed, and the latency profile was clearly provider-dominant.

## Files Created

- `ai-collaboration/handoffs/2026-05-20-module-01-staging-timing-verification-v0-handoff.md`
- `ai-collaboration/research/2026-05-20-module-01-staging-timing-verification-v0.md`
- `ai-collaboration/reports/2026-05-20-module-01-staging-timing-verification-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Deployment Status

- `origin/staging` head verified at `3ea687f`
- staging alias resolved to `https://anyu-next-828a4cmkd-studioanyu-1488s-projects.vercel.app`
- deployment status was `Ready`
- live landing bundle contained the wait-state strings introduced in the instrumentation pass

## Staging Analyze Status

- landing route loaded
- demo result route loaded
- two synthetic analyze requests succeeded
- runtime result route loaded successfully from the returned `resultId`

## Timing Metadata Status

- live `analysis_completed` event rows contained:
  - `resultId`
  - `privacyFlags`
  - `timingMs`
- `timingMs` included:
  - `totalLatencyMs`
  - `providerLatencyMs`
  - `schemaValidationLatencyMs`
  - `analysisResultWriteLatencyMs`
  - `analysisRequestWriteLatencyMs`

## Privacy Verification Status

- raw user input not present in event metadata
- contact values not present in event metadata
- no normalized result payload in event metadata
- no provider raw output in event metadata
- synthetic input only was used

## Latency Classification

- classification: `provider-dominant`
- provider share was about `88–91%` of total latency across two staging samples
- cold-start-only explanation is unlikely because the second request stayed in the same latency band

## Fixes Applied

- No app code fix was required.
- Corrected the verification command usage after an initial wrong `vercel curl` argument order.

## Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

## Known Technical Debt

- The shell environment still cannot show the loading state changing interactively in a real protected browser session.
- The current instrumentation is sufficient for attribution, but not for historical percentile tracking.

## Deviations From Handoff

- No app code changes were needed, so this remained a verification-only handoff.
- Wait-state UX was verified by deployed bundle contents rather than literal interactive frame-by-frame observation.

## Git Commit

- Pending at report-write time; final commit hash is reported in the final Codex Completion Summary.

## Staging Push

- Pending at report-write time; final push status is reported in the final Codex Completion Summary.

## Remaining Uncertainties

- Human perception of the slow-wait UX still benefits from a true phone/browser pass.
- Any future latency reduction now depends more on model availability than on the current app runtime path.

## Recommended Next Step

`Module 01 Faster Available Model Discovery Or Trial v0`
