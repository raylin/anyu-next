# Handoff Template

## Date

YYYY-MM-DD

## Task

Briefly state the requested task.

## Context

What the next agent needs to know before acting.

## Relevant Files

- `path/to/file`

## Constraints

- Local-first
- Markdown-first
- No schema changes without approval
- No cloud infrastructure, auth, vector DB, scraping, UI, or dashboards unless explicitly approved

## Planned Work

1. Save this handoff.
2. Execute the requested change.
3. Generate an execution report.
4. Append `ai-collaboration/summaries/summary_log.md`.
5. Run relevant validation.
6. Create a git commit containing the completed handoff changes.
7. Push the completed commit to `origin/staging` unless a documented safety blocker prevents it.
8. End the final CLI response with a paste-back completion summary that includes the commit hash and staging push status.

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

## Uncertainties

- List any open questions or assumptions.
