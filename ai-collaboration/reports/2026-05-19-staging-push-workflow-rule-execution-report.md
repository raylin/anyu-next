# Staging Push Workflow Rule Execution Report

## Summary

Updated the repo workflow documentation so completed handoffs now require both a git commit and a push to `origin/staging` when validation and safety checks pass.

## Files Updated

- `AGENTS.md`
- `WORKING_AGREEMENT.md`
- `README.md`
- `ai-collaboration/templates/handoff_template.md`
- `ai-collaboration/templates/execution_report_template.md`

## Workflow Rule Added

Added a staging push rule that requires:

1. validation
2. `git status --short` check
3. staging safety review
4. git commit
5. `git push origin HEAD:staging`

Also documented the conditions where push must be skipped.

## Safety Rules Added

Documented that Codex must not push if:

- validation failed
- unrelated uncommitted changes exist
- secrets or `.env` files are staged
- raw user data or sensitive logs are staged
- current branch state is unclear
- `staging` does not exist and the user has not approved creating it
- remote push fails

## Final Response Format Updated

Updated the required completion summary format to include:

- `Commit:`
- `Staging Push:`

with either a success line or a clear skipped/failed reason.

## Validation Results

- `python3 -m compileall oradar` passed
- `corepack pnpm lint` passed
- `corepack pnpm test` passed
- `corepack pnpm build` passed

## Git Commit

- Pending during report creation. Final commit hash is included in the final completion summary after commit succeeds.

## Staging Push

- Pending during report creation. Push will be attempted after commit if branch/access safety checks pass.

## Remaining Uncertainties

- Whether `origin/staging` already exists has not been confirmed at report-write time.
- Whether remote push access is available from this environment has not been confirmed at report-write time.

## Recommended Next Step

Use the new workflow rule on the next real product handoff and verify that `git push origin HEAD:staging` updates the expected staging deployment.
