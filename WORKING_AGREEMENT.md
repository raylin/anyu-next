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
5. End with a paste-back completion summary in the final CLI response.
6. Escalate uncertainty.

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
- final CLI response includes the paste-back completion summary
- unresolved questions are visible
- the next agent can continue from repository context alone

Root-level `summary_log.md` is deprecated and should not receive new entries.
