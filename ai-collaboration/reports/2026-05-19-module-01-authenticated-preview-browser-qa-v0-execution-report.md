# Module 01 Authenticated Preview Browser QA v0 Execution Report

## Summary

Authenticated preview QA was executed against the protected Vercel preview deployment using Vercel’s authenticated preview-bypass path.

Result:

- preview access succeeded
- preview build succeeded
- preview landing/demo/health checks succeeded
- preview DB-backed write paths failed

## Files Created

- `ai-collaboration/handoffs/2026-05-19-module-01-authenticated-preview-browser-qa-v0-handoff.md`
- `ai-collaboration/research/2026-05-19-module-01-authenticated-preview-browser-qa-report.md`
- `ai-collaboration/reports/2026-05-19-module-01-authenticated-preview-browser-qa-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Access / SSO Status

- direct unauthenticated HTTP access remained blocked by Vercel SSO
- authenticated protected-preview access succeeded via Vercel CLI bypass

## Preview Env Status

Confirmed preview env names:

- `DATABASE_URL`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`
- `ORADAR_PROVIDER`

Not confirmed:

- `NEXT_PUBLIC_APP_URL`

## Migration Status

Preview migration status remains unconfirmed in this handoff.

The preview deployment itself succeeded, but remote write failures indicate the preview runtime environment still needs investigation.

## Browser QA Status

Authenticated preview QA findings:

- landing route returned HTML successfully
- demo result route returned HTML successfully
- health endpoint returned success
- analyze returned `analyze_failed`
- full result/unlock/contact browser flow did not complete because no real preview result was generated

## DB Verification Status

Remote preview DB verification did not pass.

Evidence:

- `/api/events` returned `event_store_failed`
- `/api/contact` returned `contact_store_failed`

Interpretation:

- preview DB-backed writes are failing

## Privacy Verification Status

Verified:

- no secrets were printed
- only synthetic payloads were used

Still pending:

- remote DB row inspection after preview writes succeed
- remote event metadata privacy verification after preview writes succeed

## Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed
- Vercel preview deployment reached `READY`

## Fixes Applied

- authenticated Vercel CLI on this machine
- corrected Vercel local project linking to match the configured Root Directory
- no application/runtime code changes were made

## Known Technical Debt

- preview QA from this environment relies on authenticated Vercel CLI bypass instead of a true browser session
- preview env management for `NEXT_PUBLIC_APP_URL` is incomplete
- preview DB/runtime divergence from local is unresolved

## Deviations From Handoff

- used authenticated Vercel CLI bypass instead of a browser session because that was the available authenticated path in this environment
- preview DB verification could not be completed because preview write-paths failed before records could be trusted

## Git Commit

- Pending during report creation. Final commit hash is included in the final completion summary after commit succeeds.

## Remaining Uncertainties

- root cause of preview DB-backed write failures
- whether preview DB target matches the intended preview Neon branch
- whether `NEXT_PUBLIC_APP_URL` omission has any indirect effect in preview

## Recommended Next Step

`Module 01 Preview Runtime Failure Triage v0`
