# Production Deployment Runbook v0 Execution Report

## Summary

Created a manual production deployment runbook, a production launch decision template, and a small workflow clarification so production promotion is explicitly treated as a separate, human-approved process rather than a normal outcome of the staging workflow.

## Files Created

- `docs/operations/README.md`
- `docs/operations/production-deployment-runbook.md`
- `ai-collaboration/templates/production_launch_decision_template.md`
- `ai-collaboration/handoffs/2026-05-20-production-deployment-runbook-v0-handoff.md`
- `ai-collaboration/reports/2026-05-20-production-deployment-runbook-v0-execution-report.md`

## Files Updated

- `README.md`
- `WORKING_AGREEMENT.md`
- `AGENTS.md`
- `ai-collaboration/summaries/summary_log.md`

## Workflow Clarification

- staging push remains part of the normal completed-handoff workflow
- production deployment is now explicitly documented as never automatic
- production requires explicit human approval and a separate launch decision record

## Runbook Coverage

The runbook now covers:

- environment separation
- approval gates
- production env checklist
- Neon production DB checklist
- Drizzle migration checklist
- Vercel deployment checklist
- domain / DNS checklist
- `NEXT_PUBLIC_*` rebuild rule
- Module 01 smoke test
- legal / trust checks
- LINE funnel checks
- abuse guard / cost cap checks
- retention cleanup SOP
- rollback plan
- post-launch monitoring

## Decision Template Coverage

The launch decision template captures:

- approved commit and branch
- human approval
- env readiness
- DB readiness
- QA summary
- legal / trust readiness
- LINE / contact readiness
- abuse / cost settings
- known risks accepted
- rollback owner and method

## Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

## Known Technical Debt

- Production branch strategy is still partly open, so the runbook intentionally describes `main or approved production commit` rather than pretending a single immutable branch policy already exists.

## Tech Debt Review

### New Technical Debt Introduced

- None.

### Existing Technical Debt Observed

- Operational guidance is now spread across workflow docs plus the dedicated runbook, so future production-process changes still require disciplined doc sync.

### Opportunistic Cleanup Completed

- Added a dedicated `docs/operations/` home so production guidance is not buried only inside collaboration artifacts.
- Clarified production-manual-only workflow in the main repo docs to reduce ambiguity.

### Deferred Cleanup Candidates

- A future operations index may want separate runbooks for staging env sync, retention cleanup logging, or rollback drills if launch operations become more frequent.

### Recommended Follow-up

- Fill out a real Production Launch Decision Draft before any production domain promotion is attempted.

## Deviations From Handoff

- None.

## Git Commit

- Pending at report-write time; final commit hash is reported in the final Codex Completion Summary.

## Staging Push

- Pending at report-write time; final staging push status is reported in the final Codex Completion Summary.

## Remaining Uncertainties

- The long-term production branch strategy is still an open operational choice.
- `www.anyu.tw` redirect policy should still be confirmed before production launch.

## Recommended Next Step

- `Production Launch Decision Draft v0`
