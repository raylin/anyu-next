# Anthropic Provider Support Handoff

## Date

2026-05-16

## Task

Add Anthropic Claude API support to Signal Extraction v1.

## Context

Signal Extraction v1 currently uses the OpenAI Responses API. The human has Anthropic credits and wants to run early extraction tests with Claude. The core v1 behavior must remain `1 raw input file -> 1 structured signal JSON object`.

## Relevant Files

- `oradar/config.py`
- `oradar/extractor.py`
- `oradar/cli.py`
- `.env.example`
- `README.md`
- `ai-collaboration/summaries/summary_log.md`

## Constraints

- Keep the CLI command stable.
- Select provider through environment/config using `ORADAR_PROVIDER=openai|anthropic`.
- Support `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL`.
- Do not add scraping, batch processing, UI, dashboard, database, vector DB, clustering, automatic source collection, auth, cloud deployment, multi-signal extraction, or product idea generation.
- Do not change signal schema semantics, emotion taxonomy, or extraction prompt unless absolutely necessary.

## Planned Work

1. Save this handoff.
2. Add provider config fields.
3. Add a thin provider dispatch layer for OpenAI and Anthropic.
4. Keep `extractor.extract_signal(...)` interface stable.
5. Update `.env.example` and README.
6. Validate compile, CLI help, provider config error handling, and OpenAI compatibility.
7. Attempt Anthropic live validation only if `ANTHROPIC_API_KEY` is available.
8. Generate execution report.
9. Append `ai-collaboration/summaries/summary_log.md`.
10. End with Codex completion summary.

## Uncertainties

- Live Anthropic validation depends on whether `ANTHROPIC_API_KEY` is available in the local environment.

