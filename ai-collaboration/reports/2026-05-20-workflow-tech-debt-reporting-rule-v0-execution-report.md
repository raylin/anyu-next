# Workflow Tech Debt Reporting Rule v0 Execution Report

## Summary

Added an explicit workflow rule that every completed handoff must report tech debt and cleanup status in both the execution report and the final Codex completion summary.

## Files Updated

- `AGENTS.md`
- `WORKING_AGREEMENT.md`
- `README.md`
- `ai-collaboration/templates/handoff_template.md`
- `ai-collaboration/templates/execution_report_template.md`
- `ai-collaboration/handoffs/2026-05-20-workflow-tech-debt-reporting-rule-v0-handoff.md`
- `ai-collaboration/reports/2026-05-20-workflow-tech-debt-reporting-rule-v0-execution-report.md`
- `ai-collaboration/summaries/summary_log.md`

## Workflow Rule Added

Added a canonical `Tech Debt And Cleanup Policy` across the main workflow docs. The rule now requires small, low-risk cleanup to be considered when it is inside task scope, while prohibiting silent large refactors or architecture/runtime/data changes without explicit scope or approval.

## Template Updates

- Added a `Tech Debt Policy For This Task` section to the canonical handoff template.
- Added a structured `Tech Debt Review` block to the canonical execution report template.
- Clarified that `Known Technical Debt` remains the short summary and `Tech Debt Review` is the structured breakdown.

## Final Summary Format Updates

Updated the required paste-back completion summary format so every final response now includes a `Tech Debt / Cleanup Notes` section with:

- new technical debt introduced
- existing technical debt observed
- opportunistic cleanup completed
- deferred cleanup candidates
- recommended follow-up

## Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

## Known Technical Debt

- None introduced by this docs-only workflow update.

## Tech Debt Review

### New Technical Debt Introduced

- None.

### Existing Technical Debt Observed

- Workflow policy now exists in multiple canonical docs and templates, so future rule changes still require coordinated doc updates across those files.

### Opportunistic Cleanup Completed

- Aligned the workflow docs and canonical templates in the same pass so the new reporting rule is consistent across instructions, templates, and final summary format.

### Deferred Cleanup Candidates

- Consider a future single-source workflow spec if repeated workflow-rule duplication across docs becomes costly to maintain.

### Recommended Follow-up

- Apply the new tech-debt reporting section consistently in all future handoffs and execution reports.

## Deviations From Handoff

- None.

## Git Commit

- Pending at report-write time; final commit hash is reported in the final Codex Completion Summary.

## Staging Push

- Pending at report-write time; final staging push status is reported in the final Codex Completion Summary.

## Remaining Uncertainties

- None.

## Recommended Next Step

- Use the updated templates and completion-summary format on the next handoff to confirm the new workflow rule works cleanly in practice.
