# Extraction Prompt v1.1 Handoff

## Date

2026-05-16

## Task

Improve the Signal Extraction prompt so extracted signals become more useful for Taiwan-market AI consumer product discovery.

## Context

Signal Extraction v1 produced valid JSON, but the first live output was too generic. The output should better support MVP discovery, product angle selection, monetization analysis, viral hook generation, and Taiwan consumer market interpretation.

## Relevant Files

- `prompts/extraction_prompt_v1.md`
- `schemas/signal_schema_v1.json`
- `schemas/emotion_taxonomy_v1.md`
- `ai-collaboration/reports/2026-05-16-signal-extraction-v1-execution-report.md`
- `ai-collaboration/reports/2026-05-16-anthropic-provider-support-execution-report.md`
- `ai-collaboration/summaries/summary_log.md`

## Constraints

- Update the extraction prompt only, plus required handoff, report, and summary log.
- Do not change extraction code, provider code, CLI behavior, schema semantics, source boundaries, or architecture.
- Do not add scraping, UI, dashboard, database, vector DB, batch processing, multi-signal extraction, or product idea generation module.

## Planned Work

1. Save this handoff.
2. Review the current prompt, schema, taxonomy, latest extraction reports, and summary log.
3. Update `prompts/extraction_prompt_v1.md` in place as a v1.1 improvement.
4. Confirm JSON keys still match the existing schema.
5. Run `python3 -m compileall oradar`.
6. Attempt live Claude validation only if `ANTHROPIC_API_KEY` is available.
7. Generate the required execution report.
8. Append `ai-collaboration/summaries/summary_log.md`.
9. End with the Codex completion summary.

## Uncertainties

- Live Claude validation depends on whether `ANTHROPIC_API_KEY` is available in the local environment.

