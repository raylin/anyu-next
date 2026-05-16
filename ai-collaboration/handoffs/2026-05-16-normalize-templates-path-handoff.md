# Normalize Collaboration Templates Path Handoff

## Date

2026-05-16

## Task

Normalize the collaboration templates path before implementing Signal Extraction v1.

## Context

The canonical templates directory should be `ai-collaboration/templates/`. The repository currently has templates under root `templates/`, which creates a path mismatch with the intended collaboration artifact layout.

## Relevant Files

- `AGENTS.md`
- `WORKING_AGREEMENT.md`
- `README.md`
- `templates/`
- `ai-collaboration/templates/`
- `ai-collaboration/summaries/summary_log.md`

## Constraints

- Workflow cleanup only.
- Do not implement Signal Extraction v1.
- Do not add scraping, UI, dashboard, database, vector DB, cloud infrastructure, auth, or product code.
- Do not modify signal schema, emotion taxonomy, extraction prompt, source boundaries, or product architecture.

## Planned Work

1. Save this handoff.
2. Create `ai-collaboration/templates/`.
3. Move/copy existing templates into the canonical directory.
4. Update relevant documentation references.
5. Leave root `templates/` deprecated if removal is risky.
6. Create the required execution report.
7. Append `ai-collaboration/summaries/summary_log.md`.
8. End with the Codex completion summary.

## Uncertainties

- Root `templates/` may still be referenced by historical reports and handoffs, so full deletion could reduce clarity for historical artifacts.

