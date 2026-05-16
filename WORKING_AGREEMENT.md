# Working Agreement

## Roles

- Human: final judgment, clarification, architecture approval
- ChatGPT: strategy, specification, review
- Codex: execution, repository updates, reports, summaries

Codex should not act as the product strategist or final architecture authority.

## Operating Principles

- Keep the repository local-first.
- Keep project memory markdown-first.
- Preserve context in durable files.
- Prefer explicit logs over hidden state.
- Optimize for fast iteration and clear handoffs.
- Avoid production-grade infrastructure until the research workflow proves it needs it.

## Task Protocol

For every future task:

1. Write a handoff first.
2. Execute the change.
3. Write an execution report.
4. Append the summary log.
5. Escalate uncertainty.

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
- `summary_log.md` is appended
- unresolved questions are visible
- the next agent can continue from repository context alone

