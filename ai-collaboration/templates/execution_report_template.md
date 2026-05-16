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

## Git Commit

- Commit hash: `<hash or not created>`
- Commit message: `<type>: <short task summary>`
- If no commit was created, document the blocker.

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
