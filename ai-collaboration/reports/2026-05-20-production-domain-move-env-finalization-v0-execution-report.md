# Production Domain Move Approval + Env Finalization v0 Execution Report

## Summary

Completed the approved public production-env finalization on `anyu-next`, created a healthy `anyu-next` production deployment, and verified that both `anyu.tw` and `www.anyu.tw` now serve that deployment. Production launch status still remains `No-Go` because `DATABASE_URL` target confirmation and the `www` to apex redirect policy are still incomplete.

## Files Created

- `ai-collaboration/handoffs/2026-05-20-production-domain-move-env-finalization-v0-handoff.md`
- `ai-collaboration/research/2026-05-20-production-domain-move-env-finalization-v0.md`
- `ai-collaboration/reports/2026-05-20-production-domain-move-env-finalization-v0-execution-report.md`

## Files Updated

- `ai-collaboration/decisions/2026-05-20-production-launch-decision-draft-v0.md`
- `docs/operations/production-deployment-runbook.md`
- `ai-collaboration/summaries/summary_log.md`

## Env Actions

Completed on `anyu-next` production:

- set/overrode `ANTHROPIC_MODEL`
- set/overrode `ORADAR_PROVIDER`
- set `MODEL_STRATEGY`
- set `NEXT_PUBLIC_APP_URL`
- set `ANALYSIS_SESSION_DAILY_LIMIT`
- set `ANALYSIS_IP_HOURLY_LIMIT`
- set `ANALYSIS_GLOBAL_DAILY_LIMIT`

Already present and retained:

- `NEXT_PUBLIC_LINE_ADD_URL`
- `DATABASE_URL`
- `ANTHROPIC_API_KEY`

## Domain Actions

Actions taken:

- created a fresh production deployment on `anyu-next`
- verified `anyu.tw` now points to that deployment
- verified `www.anyu.tw` now also points to that deployment

Not completed:

- `www.anyu.tw` redirect to apex was not configured in this pass

## Verification Results

- `anyu-next` fresh production deployment:
  - `https://anyu-next-m3accq1wv-studioanyu-1488s-projects.vercel.app`
  - status `READY`
- `https://anyu.tw`
  - serves the above `anyu-next` deployment
  - `HTTP 200`
- `https://www.anyu.tw`
  - serves the same `anyu-next` deployment
  - `HTTP 200`
  - no redirect to apex yet

## Decision Draft Updates

- recorded that apex production now serves `anyu-next`
- recorded that public production env names are now complete
- kept `No-Go`
- left DB target confirmation and `www` redirect as remaining blockers

## Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

## Known Technical Debt

- production DB linkage is still not positively confirmed through the current secret-handling path
- `www` canonicalization is still incomplete

## Tech Debt Review

### New Technical Debt Introduced

- none

### Existing Technical Debt Observed

- Vercel domain inspection still shows stale/mixed ownership metadata for `anyu.tw`
- production env secret confirmation remains operationally awkward without a safer verification path

### Opportunistic Cleanup Completed

- removed the most important production split by putting apex traffic onto the repo-aligned `anyu-next` project
- completed the non-secret production env policy set on `anyu-next`

### Deferred Cleanup Candidates

- explicit apex redirect enforcement for `www`
- a safer ops method for confirming the true `DATABASE_URL` target without ambiguity

### Recommended Follow-up

- run a short pass focused only on `www` redirect normalization and manual `DATABASE_URL` target confirmation

## Deviations From Handoff

- direct `DATABASE_URL` target confirmation was not achieved because the pulled production env file returned a blank value for that secret
- `www` aliasing completed as part of the new production deployment, but redirect behavior itself was not configured in this pass

## Git Commit

- committed after validation

## Staging Push

- pushed to `origin/staging`

## Remaining Uncertainties

- whether the `DATABASE_URL` secret currently targets the exact intended Neon production branch
- whether the stale Vercel domain-inspection output for `anyu.tw` will self-resolve or needs manual cleanup
- how the preferred `www -> apex` redirect should be enforced in final production ops

## Recommended Next Step

`Production Redirect + DB Target Confirmation v0`
