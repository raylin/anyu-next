# Execution Report Template

## Date

YYYY-MM-DD

## Completed Work

- List completed changes.

## Architecture Decisions

- List any decisions made.
- If no architecture decisions were made, state that explicitly.

## Blockers

- List blockers or state `None`.

## Uncertainties

- List unresolved questions.

## Suggested Next Steps

- List concrete next steps.

## Known Technical Debt

- Short summary of the most relevant current technical debt, or `None`.

## Tech Debt Review

### New Technical Debt Introduced

- List any new technical debt caused by the task, or `None`.

### Existing Technical Debt Observed

- List relevant pre-existing technical debt noticed during the task, or `None beyond previously documented items`.

### Opportunistic Cleanup Completed

- List any small, low-risk cleanup completed inside task scope, or `None`.

### Deferred Cleanup Candidates

- List larger cleanup items that should be deferred, or `None`.

### Recommended Follow-up

- List follow-up cleanup that would materially improve maintainability, extensibility, quality, or launch safety, or `None`.

## Git Commit

- Commit hash: `<hash or not created>`
- Commit message: `<type>: <short task summary>`
- If no commit was created, document the blocker.

## Staging Push

- Push status: `<pushed to origin/staging | skipped | failed>`
- Push command: `git push origin HEAD:staging`
- If push was skipped or failed, document the reason clearly.

## Final Response Requirement

After saving this report, appending `ai-collaboration/summaries/summary_log.md`, and creating the required git commit, end the final CLI response with:

```markdown
## Codex Completion Summary

Task:
<task name>

Report:
<report file path>

Summary Log:
<summary log path updated>

Commit:
<commit hash or blocker>

Staging Push:
<pushed to origin/staging or skipped / failed — reason>

Files Changed:
- <file 1>
- <file 2>
- <file 3>

What Changed:
- <key change 1>
- <key change 2>
- <key change 3>

Validation:
- <validation result 1>
- <validation result 2>

Tech Debt / Cleanup Notes:
- New technical debt introduced: <note or none>
- Existing technical debt observed: <note or none beyond previously documented items>
- Opportunistic cleanup completed: <note or none>
- Deferred cleanup candidates: <note or none>
- Recommended follow-up: <note or none>

Decisions Made:
- <execution-level decision 1>
- <execution-level decision 2>
- None

Uncertainties / Blockers:
- <uncertainty or blocker 1>
- <uncertainty or blocker 2>
- None

Recommended Next Step:
<recommended next step>

Needs ChatGPT Review:
Yes / No

Paste-Back Context:
<5-10 lines of context that allow ChatGPT Web to continue without reading the full repo>
```
