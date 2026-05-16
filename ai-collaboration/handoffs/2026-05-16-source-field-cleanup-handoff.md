# Source Field Cleanup Handoff

## Date

2026-05-16

## Task

Clean the `source` field after Signal Extraction v1.1 so structured outputs do not contain local absolute file paths.

## Context

The improved v1.1 sample output quality is good, but `source` currently contains a local absolute path. For v1, `source` should be a stable identifier derived from the raw input file stem.

## Relevant Files

- `oradar/extractor.py`
- `prompts/extraction_prompt_v1.md`
- `README.md`
- `outputs/structured/sample_001.signal.json`
- `ai-collaboration/summaries/summary_log.md`

## Constraints

- Do not change schema semantics.
- Do not rename fields.
- Do not add metadata fields.
- Do not add product features.
- Do not change prompt v1.1 unless a small clarification is useful.

## Planned Work

1. Save this handoff.
2. Derive `source_id` from `raw_path.stem`.
3. Include `source_id` in prompt metadata.
4. Enforce final `signal["source"] = source_id` after model output and before validation/save.
5. Add a local smoke test for source cleanup without requiring a live API call.
6. Run compile and CLI help validation.
7. Attempt live Anthropic extraction only if `ANTHROPIC_API_KEY` is available.
8. Generate the required execution report.
9. Append `ai-collaboration/summaries/summary_log.md`.
10. End with the Codex completion summary.

## Uncertainties

- Live extraction depends on whether `ANTHROPIC_API_KEY` is available in the local environment.

