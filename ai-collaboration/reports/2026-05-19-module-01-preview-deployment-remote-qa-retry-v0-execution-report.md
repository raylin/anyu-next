# Module 01 Preview Deployment + Remote QA Retry v0 Execution Report

## Summary

The first preview deployment retry succeeded on Vercel, and authenticated remote route access was achieved using Vercel’s protected-preview bypass tooling.

Completed:

- Vercel CLI authentication
- project discovery
- corrected local project linkage
- preview deployment
- deployment metadata/log verification
- authenticated remote landing/demo/health checks
- authenticated remote analyze/events/contact runtime checks

Main finding:

- preview DB-backed write paths are failing remotely

## Files Created

- `ai-collaboration/handoffs/2026-05-19-module-01-preview-deployment-remote-qa-retry-v0-handoff.md`
- `ai-collaboration/research/2026-05-19-module-01-preview-deployment-qa-report.md`
- `ai-collaboration/reports/2026-05-19-module-01-preview-deployment-remote-qa-retry-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Environment Status

Local required env presence remained valid.

Preview Vercel env names confirmed:

- `DATABASE_URL`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`
- `ORADAR_PROVIDER`

Open gap:

- `NEXT_PUBLIC_APP_URL` was not listed in preview env output
- local code search showed it is not currently consumed in runtime code, but it should still be added for completeness

## Migration Status

No preview-specific migration execution was performed in this handoff.

The runtime/migration baseline was already green from the prior local live QA handoff.

## Local QA Status

No new local live QA run was needed for this handoff.

This retry focused on preview deployment and remote reachability.

## Preview Deployment Status

Preview deployment succeeded.

Deployment details:

- project: `studioanyu-1488s-projects/anyu-next`
- target: `preview`
- status: `READY`
- preview URL: `https://anyu-next-b5iov9p51-studioanyu-1488s-projects.vercel.app`
- inspector URL: `https://vercel.com/studioanyu-1488s-projects/anyu-next/3hghWaYAhPyMkNfhiyAgtdqT6zaU`

## DB Verification Status

Remote preview DB verification did not complete successfully.

Findings:

- landing/demo/health are reachable remotely
- preview analyze returned `analyze_failed`
- preview events returned `event_store_failed`
- preview contact returned `contact_store_failed`

Interpretation:

- preview access is working
- preview DB-backed write paths are failing

## Privacy Verification Status

No secret values were printed or committed.

Only synthetic preview QA payloads were used.

Full preview event/privacy verification remains pending until preview DB-backed writes succeed.

## Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed
- Vercel preview deployment reached `READY`
- Vercel build logs showed the expected Module 01 app and API routes
- authenticated preview landing route returned HTML
- authenticated preview demo result route returned HTML
- authenticated preview health route returned `200`

## Known Technical Debt

- preview QA is only partially automatable from this sandbox and currently relies on Vercel CLI bypass instead of a true browser session
- `NEXT_PUBLIC_APP_URL` still needs to be resolved correctly for preview env management
- preview DB verification still depends on fixing the remote write-path failure first

## Deviations From Handoff

- authenticated preview access was completed with Vercel CLI bypass rather than a browser session because that was the available authenticated path in this environment
- no preview migration run was attempted because the handoff shifted to diagnosing the remote write-path failure once deployment and protected access were confirmed

## Git Commit

- Pending during report creation. Final commit hash is included in the final completion summary after commit succeeds.

## Remaining Uncertainties

- why preview DB-backed writes fail despite preview env names being present
- whether preview protection should remain enabled for future automated QA
- whether preview DB is the same logical branch/database already exercised locally

## Recommended Next Step

`Module 01 Preview Runtime Failure Triage v0`
