# Prototype Skeleton v0 Handoff

## Date

2026-05-16

## Task

Build a local-first prototype skeleton for the `曖昧溫度計` fake-door experiment, with reusable product runtime generation, local JSONL logging, privacy-safe defaults, documentation, validation, and a final git commit.

## Context

Approved direction:

- Free entry: `曖昧溫度計`
- Paid unlock: `下一句怎麼回`

Required fake-door flow:

1. User enters text.
2. User selects situation type.
3. Product runtime generates free result.
4. User sees free result, insight layer, share card, and paid preview.
5. User sees fake paid CTA: `解鎖下一句怎麼回 — NT$49`.
6. User clicks fake paid CTA.
7. Contact capture is shown.
8. Events and submissions are logged locally as JSONL.

This is a local prototype, not a production app or final stack decision. The implementation should stay small but clean, keep prompts and schema separate from UI, reuse existing Anthropic runtime logic where appropriate, and avoid unnecessary framework complexity.

## Relevant Files

- `prompts/product_result_prompt_v0.md`
- `schemas/product_result_schema_v0.json`
- `scripts/generate_product_sample.py`
- `oradar/config.py`
- `oradar/providers.py`
- `.gitignore`
- `ai-collaboration/research/2026-05-16-experiment-spec-v0-ambiguous-temperature-fake-door.md`
- `ai-collaboration/research/2026-05-16-product-spec-v0-ambiguous-relationship-temperature.md`

Expected new prototype area:

- `experiments/ambiguous_temperature_v0/`

Expected local output area:

- `outputs/experiments/ambiguous_temperature_v0/`

## Constraints

- Local-first.
- Markdown-first.
- No schema changes without approval.
- Do not modify `prompts/extraction_prompt_v1.md`.
- Do not modify `schemas/signal_schema_v1.json`.
- Do not implement real payment, login, database, analytics SaaS, screenshot upload, OCR, dashboard, admin panel, or subscription flow.
- Do not commit real event logs, submissions, or contact submissions.
- Avoid duplicating product runtime prompt loading and provider-call logic where reuse is practical.
- If a shortcut introduces technical debt, document it explicitly.

## Planned Work

1. Save this handoff.
2. Inspect the existing runtime helpers and ignore rules.
3. Extract or centralize reusable product runtime generation logic.
4. Build the local prototype skeleton under `experiments/ambiguous_temperature_v0/`.
5. Add local JSONL event, submission, and contact logging with ignored output files.
6. Document how to run the prototype and its limitations.
7. Run validation and a local smoke test.
8. Create the execution report.
9. Append `ai-collaboration/summaries/summary_log.md`.
10. Create the required git commit and report the commit hash in the final completion summary.

## Uncertainties

- Whether live Anthropic generation can be smoke-tested end-to-end in the local prototype environment.
- Whether a single-file HTTP server plus small modules is sufficient without adding an extra dependency.
- Whether the prototype should support only Anthropic-backed runtime generation in practice, even if config allows more than one provider.
