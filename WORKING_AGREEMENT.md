# Working Agreement

## Roles

- Human: final judgment, clarification, architecture approval
- ChatGPT: strategy, specification, review
- Codex: execution, repository updates, reports, summaries

Codex should not act as the product strategist or final architecture authority.

## Operating Principles

- Keep the repository local-first.
- Keep project memory markdown-first.
- Keep collaboration templates in `ai-collaboration/templates/`.
- Preserve context in durable files.
- Prefer explicit logs over hidden state.
- Optimize for fast iteration and clear handoffs.
- Avoid production-grade infrastructure until the research workflow proves it needs it.

## Task Protocol

For every future task:

1. Write a handoff first.
2. Execute the change.
3. Write an execution report.
4. Append `ai-collaboration/summaries/summary_log.md`.
5. Create a git commit containing the completed handoff changes.
6. Push the completed commit to `origin/staging` when validation and safety checks pass.
7. End with a paste-back completion summary in the final CLI response.
8. Escalate uncertainty.

After every completed handoff, Codex must create a git commit containing the completed changes.

## Git Commit And Staging Push Rule

Every completed handoff should end with:

1. Run required validation.
2. Confirm `git status --short`.
3. Ensure no secrets, `.env`, raw user data, or unrelated changes are staged.
4. Commit task changes with a clear message.
5. Push the completed commit to the `staging` branch:

   ```bash
   git push origin HEAD:staging
   ```

6. Include both commit hash and push status in the final Codex Completion Summary.

If push is skipped or fails, report the reason clearly and do not claim staging was updated.

Commit requirements:

- Run relevant validation before committing.
- Include the handoff, report, summary log, and changed project files in the commit.
- Use a clear commit message in the format `<type>: <short task summary>`.
- Mention the commit hash in the final Codex Completion Summary.
- Push the completed commit to `origin/staging` unless blocked by validation failure, unrelated uncommitted changes, secrets risk, unclear branch state, missing remote access, missing `staging` branch without approval to create it, or explicit user instruction not to push.
- Never use `git push --force` unless the user explicitly requests it.
- If a git commit cannot be created, document the reason under blockers.
- If pre-existing unrelated uncommitted changes are present, do not silently include them; ask for human guidance before committing.

## Paste-Back Completion Summary

Every final Codex CLI response must include:

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

## Escalation

Escalate before:

- changing schemas
- introducing new architecture
- adding external services
- adding scraping
- adding UI or dashboards
- changing research collection boundaries

## Done Definition

A task is complete when:

- requested files or changes are present
- reports are written
- `ai-collaboration/summaries/summary_log.md` is appended
- a git commit contains the completed handoff changes
- the completed commit is pushed to `origin/staging` unless a documented safety blocker prevents it
- final CLI response includes the paste-back completion summary
- unresolved questions are visible
- the next agent can continue from repository context alone

Root-level `summary_log.md` is deprecated and should not receive new entries.
