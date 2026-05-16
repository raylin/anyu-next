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
prompts/
schemas/
sources/
extractors/
outputs/
  raw/
  structured/
templates/
```

## Local Development Workflow

For every task:

1. Save a handoff in `ai-collaboration/handoffs/`.
2. Make the requested repository changes.
3. Generate an execution report in `ai-collaboration/reports/`.
4. Append `summary_log.md`.
5. Escalate unresolved questions.

No scraping, UI, dashboards, cloud services, databases, or auth should be added unless explicitly requested and approved.

## Signal Extraction Foundation

The initial extraction foundation includes:

- `schemas/signal_schema_v1.json`
- `schemas/emotion_taxonomy_v1.md`
- `prompts/extraction_prompt_v1.md`

The system extracts emotions, pain points, behavioral patterns, monetization signals, retention likelihood, and shareability potential.

## Future Roadmap

Likely future phases:

1. Collect manually selected research examples into `outputs/raw/`.
2. Run prompt-based extraction into `outputs/structured/`.
3. Review extracted signals for schema gaps.
4. Add lightweight local extractors only after the manual workflow stabilizes.
5. Build synthesis reports from structured outputs.

Scraping, UI, dashboards, databases, and external infrastructure are intentionally out of scope until approved.

