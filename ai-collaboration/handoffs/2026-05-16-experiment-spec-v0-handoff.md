# Experiment Spec v0 Handoff

## Date

2026-05-16

## Task

Create Experiment Spec v0 for a `曖昧溫度計` fake-door test.

## Context

Product Spec v0 exists at `ai-collaboration/research/2026-05-16-product-spec-v0-ambiguous-relationship-temperature.md`.

The current MVP direction is:

```text
免費入口：曖昧溫度計
付費解鎖：下一句怎麼回
```

The experiment should validate whether users paste relationship context, understand the free temperature result, click a fake paid unlock for `下一句怎麼回`, and reveal which situation type has the strongest conversion signal.

## Relevant Files

- `ai-collaboration/research/2026-05-16-product-spec-v0-ambiguous-relationship-temperature.md`
- `ai-collaboration/research/2026-05-16-experiment-spec-v0-ambiguous-temperature-fake-door.md`
- `ai-collaboration/reports/2026-05-16-experiment-spec-v0-execution-report.md`
- `ai-collaboration/summaries/summary_log.md`

## Constraints

- Local-first
- Markdown-first
- No schema changes without approval
- Specification only
- Do not implement web app, backend, payment, UI, database, analytics SaaS, production code, product runtime prompt execution, or product result generation code
- Do not modify extraction prompt, research signal schema, provider code, CLI behavior, or sample outputs

## Planned Work

1. Save this handoff.
2. Create the required experiment spec markdown file.
3. Create the required execution report.
4. Append `ai-collaboration/summaries/summary_log.md`.
5. Validate required headings.
6. End with the required paste-back completion summary.

## Uncertainties

- Thresholds are directional because early sample sizes may be small.
- The technical skeleton should remain reusable without locking the final stack.
