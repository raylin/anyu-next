# Extraction Prompt v1.2 Handoff

## Date

2026-05-16

## Task

Improve `prompts/extraction_prompt_v1.md` in place as Extraction Prompt v1.2, focused on emotion normalization, scoring calibration, product role diversity, hook diversity, and uncertainty preservation.

## Context

Sample Set v1 produced 10 validated structured signals with generally strong quality, but review found repeated broad emotion labels, clustered monetization/shareability/retention scores, and product ideas that could better support MVP selection.

The prompt should be updated only. No extraction code, provider code, CLI behavior, schema semantics, source boundaries, architecture, scraping, UI, dashboard, database, vector DB, batch processing, multi-signal extraction, or product idea generation module should be added.

## Relevant Files

- `prompts/extraction_prompt_v1.md`
- `schemas/signal_schema_v1.json`
- `outputs/raw/sample_002.txt`
- `outputs/raw/sample_003.txt`
- `outputs/raw/sample_010.txt`
- `ai-collaboration/reports/2026-05-16-extraction-prompt-v1-2-execution-report.md`
- `ai-collaboration/summaries/summary_log.md`

## Constraints

- Local-first
- Markdown-first
- No schema changes without approval
- Preserve Signal Extraction v1 boundary: one raw input file produces one structured signal JSON object
- Keep JSON keys unchanged and matching `schemas/signal_schema_v1.json`
- Keep `possible_product` as an array of plain strings
- Keep JSON-only output requirement

## Planned Work

1. Save this handoff.
2. Update the extraction prompt in place as v1.2.
3. Validate schema-key coverage, JSON-only requirement, Traditional Chinese default, emotion/scoring/product/hook/uncertainty guidance.
4. Run `python3 -m compileall oradar`.
5. If `ANTHROPIC_API_KEY` is available, rerun representative samples 002, 003, and 010 with Anthropic.
6. Generate the required execution report.
7. Append `ai-collaboration/summaries/summary_log.md`.
8. End with the required paste-back completion summary.

## Uncertainties

- Live extraction depends on `ANTHROPIC_API_KEY` and network access.
- Whether score differentiation improves enough can only be judged from live extraction outputs.
