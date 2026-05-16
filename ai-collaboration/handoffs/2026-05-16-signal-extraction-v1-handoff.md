# Signal Extraction v1 Handoff

## Date

2026-05-16

## Task

Implement the first functional version of Signal Extraction.

## Context

Opportunity Radar is ready for its first feature implementation. Signal Extraction v1 should transform one raw text input file into one validated structured signal JSON file.

## Relevant Files

- `schemas/signal_schema_v1.json`
- `prompts/extraction_prompt_v1.md`
- `outputs/raw/`
- `outputs/structured/`
- `ai-collaboration/summaries/summary_log.md`

## Constraints

- Keep scope narrow.
- Implement `1 raw input file -> 1 structured signal JSON object`.
- Allowed source types are `manual_paste`, `dcard_manual`, and `reddit_manual`.
- Do not implement scraping, batch processing, UI, dashboard, database, vector DB, auth, cloud deployment, automatic source collection, or multi-signal extraction.
- Do not make major schema changes.
- Do not commit real API keys.

## Planned Work

1. Create a small Python CLI package.
2. Load the v1 prompt and schema from repository files.
3. Call the OpenAI API when `OPENAI_API_KEY` is available.
4. Validate JSON output against `schemas/signal_schema_v1.json`.
5. Save one structured output JSON under `outputs/structured/`.
6. Add a synthetic sample raw input.
7. Run compile validation and sample CLI validation as far as the local environment allows.
8. Generate the execution report.
9. Append `ai-collaboration/summaries/summary_log.md`.
10. End with the Codex completion summary.

## Uncertainties

- Live OpenAI validation depends on whether `OPENAI_API_KEY` is available in the local environment.

