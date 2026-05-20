# Handoff: Workflow Tech Debt Reporting Rule v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Update the collaboration workflow so every completed Codex handoff includes explicit tech debt review and cleanup notes.

This task should make the workflow align with the current engineering preference:

- Do not leave obvious technical debt just to save Codex effort.
- Prefer maintainability, extensibility, and quality.
- Avoid over-design.
- Small, low-risk cleanup can be completed opportunistically.
- Larger refactors or architecture/data/runtime changes must be reported first.
- Every final completion summary and execution report should list tech debt status and cleanup candidates.

This is a workflow documentation task only.

Do not change product behavior.

Do not modify app runtime.

Do not modify prompts, schemas, DB, model, legal content, or design system.

## Background

The user clarified a new collaboration preference:

```text
Codex does most implementation work, so engineering decisions should not optimize primarily for avoiding implementation effort.
The project should prioritize maintainability, extensibility, and quality.
Do not over-design, but it is acceptable to use slightly higher-quality architecture and to fix small technical debt opportunistically.
Codex should list, record, and report tech debt after each handoff so future cleanup tasks can be based on those notes.
```

Current workflow already includes:

- handoff-first execution
- execution report
- summary log append
- paste-back completion summary
- git commit
- push to `origin/staging` when safe

This task adds explicit tech debt reporting to that workflow.

## Required Workflow Rule

Add a rule:

```text
Every completed handoff must include a Tech Debt Review section in the execution report and a Tech Debt / Cleanup Notes section in the final Codex Completion Summary.
```

The rule should say:

```text
Codex may fix small, obvious, low-risk technical debt opportunistically when it is inside the task scope and does not broaden product behavior.
Codex must not silently perform large refactors, DB/schema changes, runtime architecture changes, provider/model changes, or major UI redesigns without explicit handoff scope or user approval.
If larger cleanup is discovered, Codex should document it as a deferred cleanup candidate.
```

## Small Opportunistic Cleanup Definition

Allowed opportunistic cleanup examples:

```text
- remove dead comments
- fix obvious typo
- remove unused import
- consolidate duplicate helper within same touched file
- improve naming in touched code if low-risk
- add missing test for helper being touched
- update stale README sentence in touched area
- fix small accessibility attribute issue
- align copy/docs with current behavior
```

Not allowed without explicit scope:

```text
- DB schema redesign
- provider/model routing change
- auth/payment architecture
- moving major folders
- rewriting component system
- changing product prompt/schema semantics
- changing privacy/data retention behavior
- switching analytics/event strategy
- large design-system rewrite
- changing production/staging deployment model
```

## Files To Update

Update workflow docs where relevant:

```text
AGENTS.md
WORKING_AGREEMENT.md
README.md
ai-collaboration/templates/handoff_template.md
ai-collaboration/templates/execution_report_template.md
```

If some files do not exist or already contain equivalent rules, document that.

Append summary log:

```text
ai-collaboration/summaries/summary_log.md
```

Create required handoff/report as usual.

## Required Content To Add

Add a section like:

```markdown
## Tech Debt And Cleanup Policy

Codex should not leave obvious technical debt just to reduce implementation effort.

For each handoff:

1. Fix small, obvious, low-risk technical debt when it is inside the task scope.
2. Do not broaden product behavior or architecture without explicit approval.
3. Document new technical debt introduced by the task.
4. Document existing technical debt observed during the task.
5. Document opportunistic cleanup completed.
6. Document deferred cleanup candidates.
7. Recommend follow-up cleanup only when it materially improves maintainability, extensibility, quality, or launch safety.

Small cleanup is encouraged.
Over-design is not.
Silent large refactors are not allowed.
```

## Execution Report Template Update

Update the canonical execution report template to include:

```markdown
## Tech Debt Review

### New Technical Debt Introduced

### Existing Technical Debt Observed

### Opportunistic Cleanup Completed

### Deferred Cleanup Candidates

### Recommended Follow-up
```

Also ensure existing sections like `Known Technical Debt` remain compatible.

If both exist, clarify:

```text
Known Technical Debt can remain as a short summary.
Tech Debt Review is the structured section.
```

## Final Completion Summary Format Update

Update the required final response / paste-back summary format to include:

```text
Tech Debt / Cleanup Notes:

- New technical debt introduced:
- Existing technical debt observed:
- Opportunistic cleanup completed:
- Deferred cleanup candidates:
- Recommended follow-up:
```

If none:

```text
Tech Debt / Cleanup Notes:
- New technical debt introduced: none
- Existing technical debt observed: none beyond previously documented items
- Opportunistic cleanup completed: none
- Deferred cleanup candidates: none
- Recommended follow-up: none
```

## Handoff Template Update

Update handoff template to include optional instruction:

```markdown
## Tech Debt Policy For This Task

Small, obvious, low-risk cleanup inside this task scope is allowed.
Do not perform large refactors or architecture/data/runtime changes unless explicitly requested.
Record all tech debt notes in the execution report and final completion summary.
```

## Required Report

Create:

```text
ai-collaboration/reports/2026-05-20-workflow-tech-debt-reporting-rule-v0-execution-report.md
```

Report structure:

```markdown
# Workflow Tech Debt Reporting Rule v0 Execution Report

## Summary

## Files Updated

## Workflow Rule Added

## Template Updates

## Final Summary Format Updates

## Validation Results

## Known Technical Debt

## Tech Debt Review

### New Technical Debt Introduced

### Existing Technical Debt Observed

### Opportunistic Cleanup Completed

### Deferred Cleanup Candidates

### Recommended Follow-up

## Deviations From Handoff

## Git Commit

## Staging Push

## Remaining Uncertainties

## Recommended Next Step
```

## Summary Log

Append to:

```text
ai-collaboration/summaries/summary_log.md
```

Include:

- date
- task completed
- tech debt reporting rule added
- files updated
- validation result
- commit hash
- staging push status

## Validation

Run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

This is docs-only, but still run validation because workflow docs affect future deployment behavior.

## Constraints

Documentation/workflow only.

Do not modify:

```text
product runtime
app behavior
legal content semantics
design system tokens
product prompt/schema
DB schema
provider/model settings
Dcard scripts
deployment config
```

Do not implement:

```text
new feature
new cleanup task
large refactor
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
raw private user content
raw DB row dumps
real contact values
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "docs: add tech debt reporting workflow rule"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if:

- validation failed
- unrelated uncommitted changes exist
- secrets are staged
- raw user content is staged

If push is skipped or fails, report exact reason.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- workflow rule added
- files updated
- template updates
- validation results
- commit hash
- staging push status
- Tech Debt / Cleanup Notes section
- exact next step

Then stop.
