# Minimal Experiment Analysis Report Handoff

## Date

2026-05-16

## Task

Add a minimal local analysis script for the `曖昧溫度計` fake-door prototype that reads local JSONL logs and writes a markdown experiment summary report.

## Context

Prototype path:

- `experiments/ambiguous_temperature_v0/`

Current local log files:

- `outputs/experiments/ambiguous_temperature_v0/events.jsonl`
- `outputs/experiments/ambiguous_temperature_v0/submissions.jsonl`
- `outputs/experiments/ambiguous_temperature_v0/contact_submissions.jsonl`

These log files are git-ignored.

The new analysis tool should:

- read local JSONL logs only
- tolerate missing files, empty files, and invalid JSON lines
- never call any provider or require API keys
- never print raw input text or contact values
- generate a readable markdown report at:
  - `outputs/experiments/ambiguous_temperature_v0/experiment_report.md`

This is a local reporting utility, not a production analytics system.

## Relevant Files

- `experiments/ambiguous_temperature_v0/event_log.py`
- `experiments/ambiguous_temperature_v0/product_runtime.py`
- `experiments/ambiguous_temperature_v0/README.md`
- `.gitignore`
- `outputs/experiments/ambiguous_temperature_v0/`

Expected new file:

- `experiments/ambiguous_temperature_v0/analyze_results.py`

Expected report output:

- `outputs/experiments/ambiguous_temperature_v0/experiment_report.md`

## Constraints

- Local-first.
- Markdown-first.
- Do not add analytics dependencies, database, dashboard, or SaaS.
- Do not change existing prototype logging behavior unless necessary.
- Do not commit real logs or generated experiment reports from `outputs/experiments/`.
- Do not expose raw input text or contact values in the report.
- If log schema gaps are found, document them instead of silently changing event behavior.

## Planned Work

1. Save this handoff.
2. Add a small analysis CLI under `experiments/ambiguous_temperature_v0/`.
3. Update the prototype README with analysis instructions and privacy notes.
4. Run validation and execute the new analysis script.
5. Create the required execution report.
6. Append `ai-collaboration/summaries/summary_log.md`.
7. Stage only the task files and create the required git commit.

## Uncertainties

- Whether current local logs are present and useful enough to exercise the script directly.
- Whether any event-schema gap will limit a requested metric and need explicit documentation.
