# Paste-Back Completion Summary Rule Handoff

## Date

2026-05-16

## Task

Update the collaboration workflow so every Codex task produces a repository report and a concise paste-back completion summary in the final CLI response.

## Context

ChatGPT Web handles strategy, review, and handoff. Codex CLI handles implementation, file changes, report generation, and final response. Because ChatGPT Web does not automatically share repository state with Codex CLI, each Codex task must end with a review-friendly summary that can be pasted back into ChatGPT Web.

## Relevant Files

- `AGENTS.md`
- `WORKING_AGREEMENT.md`
- `README.md`
- `templates/execution_report_template.md`
- `templates/handoff_template.md`
- `ai-collaboration/summaries/summary_log.md`

## Constraints

- Workflow update only.
- Do not implement Signal Extraction v1.
- Do not add scraping, UI, dashboard, database, vector DB, cloud infrastructure, auth, or production app code.
- Do not change signal schema, emotion taxonomy, extraction prompt, source boundaries, or product architecture.

## Planned Work

1. Save this handoff.
2. Add the paste-back completion summary requirement to operating docs.
3. Update templates where useful.
4. Generate the required execution report.
5. Append `ai-collaboration/summaries/summary_log.md`.
6. Use the new paste-back completion summary format in the final response.

## Uncertainties

- Requested template paths mention `ai-collaboration/templates/`, but the repository currently uses root `templates/`.

