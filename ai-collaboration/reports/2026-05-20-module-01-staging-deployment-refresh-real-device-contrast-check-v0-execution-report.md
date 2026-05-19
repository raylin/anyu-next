# Module 01 Staging Deployment Refresh + Real-Device Contrast Check v0 Execution Report

## Summary

Verified that `staging.anyu.tw` is now serving a newer Vercel deployment than the stale one noted in the previous handoff, and confirmed that the refreshed staging deployment still passes the Module 01 runtime path with synthetic input.

No code fix was required in this handoff.

## Files Created

- `ai-collaboration/handoffs/2026-05-20-module-01-staging-deployment-refresh-real-device-contrast-check-v0-handoff.md`
- `ai-collaboration/research/2026-05-20-module-01-staging-deployment-refresh-real-device-contrast-check-report.md`
- `ai-collaboration/reports/2026-05-20-module-01-staging-deployment-refresh-real-device-contrast-check-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Deployment Freshness Status

- `origin/staging` includes `cedd219`
- `staging.anyu.tw` now points to `anyu-next-5cd8bm1el-studioanyu-1488s-projects.vercel.app`
- this is newer than the stale deployment previously observed

## Alias / Domain Status

- staging alias is correct
- staging git alias is correct
- no production domain or alias changes were made

## Staging Smoke Status

Passed:

- landing
- demo result
- health endpoint
- live analyze with synthetic input
- runtime result route
- unlock intent
- contact submit

## Real-Device / Browser QA Status

- true real-device QA was not available in this shell environment
- completed an authenticated browser-style protected staging sweep via `vercel curl` plus live HTML/CSS-aware inspection

## Fixes Applied

- none

## Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

## Known Technical Debt

- final contrast/feel judgment still benefits from a literal human phone pass
- loading-state feel was inferred from the live route/API behavior rather than observed frame by frame in an interactive browser

## Deviations From Handoff

- used authenticated protected staging fetches and live route/API inspection instead of literal real-device interaction because a real phone/browser session was not available in this environment

## Git Commit

- pending at report-write time; final commit hash is recorded in the final Codex completion summary

## Staging Push

- pending at report-write time; final staging push status is recorded in the final Codex completion summary

## Remaining Uncertainties

- whether the human-perceived loading panel rhythm feels fully premium on a real phone
- whether the final contrast balance still wants tiny tuning after literal daylight-device viewing

## Recommended Next Step

`Module 01 Human Real-Phone QA Signoff v0`
