# Opportunity Radar

Opportunity Radar is a local-first, AI-native founder research system for detecting emotional market signals and turning them into structured, AI-readable research artifacts.

The project is exploratory and research-oriented. It is not a production SaaS app.

## Purpose

Opportunity Radar is intended to become an AI-native qualitative market research engine focused on:

- emotional signals
- recurring anxieties
- monetizable behaviors
- viral social patterns
- retention and shareability clues

The goal is to support iterative MVP discovery by transforming messy emotional and social content into structured signals.

## Architecture Philosophy

This repository favors simple, inspectable, local files.

Current defaults:

- markdown-first collaboration memory
- local-first storage and execution
- JSON Schema for extraction contracts
- plain folders for raw and structured outputs
- no cloud infrastructure
- no auth
- no vector database
- no dashboards or scraping until explicitly requested

Avoid overengineering. Add automation only when repeated manual work becomes costly.

## Collaboration Workflow

The operating model is:

- ChatGPT: strategy, specification, review
- Codex: execution, repository changes, reporting
- Human: clarification, judgment, architecture approval

Codex acts as an implementation agent. Architecture decisions require human approval.

## Repository Layout

```text
ai-collaboration/
  handoffs/
  reports/
  summaries/
  decisions/
  research/
  templates/
prompts/
schemas/
sources/
extractors/
outputs/
  raw/
  structured/
```

Collaboration templates live under `ai-collaboration/templates/`. The root-level `templates/` directory is deprecated.

## Local Development Workflow

For every task:

1. Save a handoff in `ai-collaboration/handoffs/`.
2. Make the requested repository changes.
3. Generate an execution report in `ai-collaboration/reports/`.
4. Append `ai-collaboration/summaries/summary_log.md`.
5. End the final CLI response with a paste-back completion summary.
6. Escalate unresolved questions.

No scraping, UI, dashboards, cloud services, databases, or auth should be added unless explicitly requested and approved.

The paste-back completion summary is a concise review packet intended to be copied into ChatGPT Web. The repository remains the source of truth.

## Signal Extraction Foundation

The initial extraction foundation includes:

- `schemas/signal_schema_v1.json`
- `schemas/emotion_taxonomy_v1.md`
- `prompts/extraction_prompt_v1.md`

The system extracts emotions, pain points, behavioral patterns, monetization signals, retention likelihood, and shareability potential.

Signal Extraction v1 uses:

```text
1 raw input file -> 1 structured signal JSON object
```

Multiple signal records per raw input are out of scope for v1.

Allowed v1 source types:

- `manual_paste`
- `dcard_manual`
- `reddit_manual`

Scoring fields use integer values from 0 to 10 and are qualitative, directional estimates.

## Signal Extraction v1 CLI

Run the local extractor with:

```bash
python3 -m oradar.cli extract outputs/raw/sample_001.txt --source-type dcard_manual
```

If the package is installed in editable mode, the equivalent console command is:

```bash
oradar extract outputs/raw/sample_001.txt --source-type dcard_manual
```

The CLI reads one raw text file, loads `prompts/extraction_prompt_v1.md`, calls the OpenAI API, validates the returned JSON against `schemas/signal_schema_v1.json`, and writes one structured output file under `outputs/structured/`.

The structured output `source` field is a clean identifier derived from the raw input filename stem. For example, `outputs/raw/sample_001.txt` becomes `"source": "sample_001"`.

Set `OPENAI_API_KEY` in the environment or a local `.env` file. See `.env.example`.

Provider selection is controlled by `ORADAR_PROVIDER`.

OpenAI:

```bash
ORADAR_PROVIDER=openai python3 -m oradar.cli extract outputs/raw/sample_001.txt --source-type dcard_manual
```

Anthropic:

```bash
ORADAR_PROVIDER=anthropic python3 -m oradar.cli extract outputs/raw/sample_001.txt --source-type dcard_manual
```

Supported provider environment variables:

- `ORADAR_PROVIDER=openai|anthropic`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`

## Future Roadmap

Likely future phases:

1. Collect manually selected research examples into `outputs/raw/`.
2. Run prompt-based extraction into `outputs/structured/`.
3. Review extracted signals for schema gaps.
4. Add lightweight local extractors only after the manual workflow stabilizes.
5. Build synthesis reports from structured outputs.

Scraping, UI, dashboards, databases, and external infrastructure are intentionally out of scope until approved.
