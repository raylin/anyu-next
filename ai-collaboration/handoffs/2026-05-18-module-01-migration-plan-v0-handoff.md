# Handoff

## Date

2026-05-18

## Task

Create a migration plan for moving Module 01 — `曖昧溫度計` — from the legacy local prototype into the new production Next.js app foundation under `apps/web`, without implementing the migration yet.

## Context

The repo foundation and README alignment tasks are complete. The production app skeleton exists in `apps/web/`, while the legacy validation prototype remains under `experiments/ambiguous_temperature_v0/`. The goal of this task is to identify what should be reused, rewritten, deferred, or explicitly not migrated before implementation begins.

## Relevant Files

- `experiments/ambiguous_temperature_v0/app.py`
- `experiments/ambiguous_temperature_v0/product_runtime.py`
- `experiments/ambiguous_temperature_v0/event_log.py`
- `experiments/ambiguous_temperature_v0/contact_capture.py`
- `experiments/ambiguous_temperature_v0/templates/index.html`
- `experiments/ambiguous_temperature_v0/static/app.js`
- `experiments/ambiguous_temperature_v0/static/styles.css`
- `experiments/ambiguous_temperature_v0/static/tokens.css`
- `oradar/product_runtime.py`
- `oradar/providers.py`
- `prompts/product_result_prompt_v0.md`
- `schemas/product_result_schema_v0.json`
- `apps/web/src/`

## Constraints

- Planning/documentation only
- No implementation
- No app behavior changes
- No prompt/schema/token modifications
- No legacy prototype behavior changes
- No DB or API behavior changes

## Planned Work

1. Save this handoff.
2. Inspect the legacy prototype, shared runtime, and current `apps/web` skeleton.
3. Create `ai-collaboration/research/2026-05-18-module-01-migration-plan-v0.md`.
4. Create `ai-collaboration/reports/2026-05-18-module-01-migration-plan-v0-execution-report.md`.
5. Append `ai-collaboration/summaries/summary_log.md`.
6. Run the required validation commands.
7. Create a git commit containing the completed planning artifacts.
8. End the final CLI response with a paste-back completion summary that includes the commit hash.

## Uncertainties

- The plan can recommend a target database/event/privacy model, but schema implementation is out of scope for this task.
- Some routing and storage questions remain intentionally open for ChatGPT/human review before implementation.
