# Anthropic Provider Support Execution Report

## Summary

Added Anthropic Claude provider support to Signal Extraction v1 while preserving the existing CLI behavior and core v1 boundary:

```text
1 raw input file -> 1 structured signal JSON object
```

Provider selection now comes from:

```text
ORADAR_PROVIDER=openai|anthropic
```

No scraping, batch processing, UI, dashboard, database, vector DB, clustering, automatic source collection, authentication, cloud deployment, multi-signal extraction, or product idea generation was added.

## Files Created

- `oradar/providers.py`
- `ai-collaboration/handoffs/2026-05-16-anthropic-provider-support-handoff.md`
- `ai-collaboration/reports/2026-05-16-anthropic-provider-support-execution-report.md`

## Files Updated

- `oradar/config.py`
- `oradar/extractor.py`
- `oradar/cli.py`
- `.env.example`
- `README.md`
- `ai-collaboration/summaries/summary_log.md`

## Provider Design

The extractor interface remains stable:

```text
cli.py -> extractor.extract_signal(...) -> provider dispatch -> parse JSON -> validate schema -> save output
```

`oradar/providers.py` now contains a thin provider dispatch layer:

- `call_provider(...)`
- `call_openai_responses_api(...)`
- `call_anthropic_messages_api(...)`

`oradar/extractor.py` still owns the extraction flow:

- read raw file
- build prompt
- call selected provider
- parse one JSON object
- validate against `schemas/signal_schema_v1.json`
- save output locally

Provider-specific HTTP request logic is isolated in `oradar/providers.py`.

## Configuration Changes

Updated `.env.example` to include:

```text
ORADAR_PROVIDER=openai

OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini

ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

Defaults:

- `ORADAR_PROVIDER=openai`
- `OPENAI_MODEL=gpt-4.1-mini`
- `ANTHROPIC_MODEL=claude-sonnet-4-20250514`

The existing OpenAI environment variables remain supported.

## Validation Results

Passed:

```bash
python3 -m compileall oradar
```

Result:

```text
Listing 'oradar'...
```

Passed:

```bash
python3 -m oradar.cli --help
```

Result: CLI help rendered successfully.

Passed provider config smoke test:

```bash
python3 -c 'from oradar.config import load_config; c=load_config(); print(c.provider, c.openai_model, c.anthropic_model)'
```

Result:

```text
openai gpt-4.1-mini claude-sonnet-4-20250514
```

Passed unsupported provider validation:

```bash
ORADAR_PROVIDER=invalid python3 -m oradar.cli extract outputs/raw/sample_001.txt --source-type dcard_manual
```

Result:

```text
Extraction failed: Unsupported provider `invalid`. Allowed: anthropic, openai
```

## OpenAI Compatibility

The existing OpenAI path remains supported through:

```text
ORADAR_PROVIDER=openai
OPENAI_API_KEY
OPENAI_MODEL
```

OpenAI missing-key behavior was validated:

```bash
ORADAR_PROVIDER=openai python3 -m oradar.cli extract outputs/raw/sample_001.txt --source-type dcard_manual
```

Result:

```text
Extraction failed: OPENAI_API_KEY is not set. Add it to the environment or local .env file.
```

No output JSON was saved.

## Anthropic Validation

Anthropic support uses the Messages API:

```text
POST https://api.anthropic.com/v1/messages
```

The request sends:

- `model`
- `max_tokens`
- one user message containing the extraction prompt and JSON-only instruction
- `anthropic-version: 2023-06-01`

The endpoint shape was checked against Anthropic's official Messages API documentation:

- https://docs.anthropic.com/en/api/messages-examples
- https://platform.claude.com/docs/en/api/cli/messages/create

Live Anthropic validation was not performed because `ANTHROPIC_API_KEY` is not set in the local environment.

Anthropic missing-key behavior was validated:

```bash
ORADAR_PROVIDER=anthropic python3 -m oradar.cli extract outputs/raw/sample_001.txt --source-type dcard_manual
```

Result:

```text
Extraction failed: ANTHROPIC_API_KEY is not set. Add it to the environment or local .env file.
```

No output JSON was saved.

## Deviations From Handoff

- No provider package or SDK dependency was added. The implementation continues using Python standard library HTTP calls to keep v1 dependency-free.
- No prompt changes were needed for Claude compatibility.
- No schema, taxonomy, source boundary, or product architecture changes were made.

## Remaining Uncertainties

- Live Claude extraction output quality needs review after `ANTHROPIC_API_KEY` is configured.
- The default Anthropic model may need adjustment if the account does not have access to `claude-sonnet-4-20250514`.
- Score calibration still needs review against real extracted examples.

## Recommended Next Step

Set `ANTHROPIC_API_KEY` locally and run:

```bash
ORADAR_PROVIDER=anthropic python3 -m oradar.cli extract outputs/raw/sample_001.txt --source-type dcard_manual
```

Expected output path after successful live extraction:

```text
outputs/structured/sample_001.signal.json
```

Then review the saved JSON for schema fit, Claude extraction quality, scoring consistency, and usefulness for founder research.

