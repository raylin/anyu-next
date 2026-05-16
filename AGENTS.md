# Opportunity Radar Agent Operating Rules

## Project Purpose

Opportunity Radar is a local-first, AI-native qualitative market research engine for founder research.

The repository exists to help detect emotional market signals, structure them into AI-readable schemas, and support iterative MVP discovery. It focuses on:

- emotional signals
- recurring anxieties
- monetizable behaviors
- viral social patterns
- retention and shareability clues

This is an exploratory research system, not a production SaaS app.

## Collaboration Workflow

The collaboration model is:

- ChatGPT: strategy, specification, review
- Codex: execution, repository changes, reporting
- Human: clarification, judgment, architecture approval

Codex must behave as an implementation agent. Codex is not the product strategist and not the architecture authority.

Architecture decisions require human approval before implementation.

## Mandatory Execution Workflow

For every future task, Codex must:

1. Save a handoff first in `ai-collaboration/handoffs/`.
2. Execute the requested changes.
3. Generate an execution report in `ai-collaboration/reports/`.
4. Append `summary_log.md`.
5. Escalate uncertainties instead of guessing.
6. Never silently change schemas.

## Execution Constraints

Codex must:

- keep workflows markdown-first
- keep architecture local-first
- optimize for rapid iteration
- optimize for AI-readable context persistence
- prefer simple files, folders, and explicit logs over hidden state
- preserve research context and rationale

Codex must not introduce:

- cloud infrastructure
- authentication systems
- vector databases
- Kubernetes
- microservices
- unnecessary abstractions
- scraping, UI, dashboards, or app code unless explicitly requested later

## Architecture Philosophy

Opportunity Radar should remain boring, inspectable, and easy to modify.

Default choices:

- Markdown for operating memory, handoffs, reports, decisions, and research notes
- JSON Schema for structured extraction contracts
- Plain files for raw and structured outputs
- Small scripts only when repeated manual work becomes costly
- Local execution before any external service

Avoid abstractions until repeated use proves they are necessary.

## Markdown-First Rule

Project knowledge must be saved in markdown whenever possible.

Use markdown for:

- handoffs
- execution reports
- research notes
- decision logs
- summaries
- prompt documentation
- operating agreements

Use structured data formats only where structure is the artifact, such as JSON schemas or extracted signal JSON.

## Local-First Rule

All workflows should run locally by default and store artifacts in this repository.

Do not add external services, hosted databases, cloud queues, background workers, or managed AI infrastructure without explicit human approval.

## Reporting Requirements

Every execution report must include:

- completed work
- architecture decisions
- blockers
- uncertainties
- suggested next steps

Reports should be concise, factual, and written for the next human or AI collaborator.

## Summary Logging Requirements

After every task, append `summary_log.md` with:

- date
- completed changes
- learnings
- unresolved questions

The summary log is persistent agent memory. It should preserve enough context for a future agent to continue without re-discovering the repository history.

## Research Logging System

Research artifacts should be saved under `ai-collaboration/research/` unless they are raw or structured extraction outputs.

Use:

- `sources/` for source descriptions, source lists, or source-specific notes
- `outputs/raw/` for raw captured inputs
- `outputs/structured/` for extracted signal JSON
- `ai-collaboration/research/` for synthesis notes and observations

Do not collect content for its own sake. Extract signals.

## Signal Extraction Foundation

Opportunity Radar is not primarily collecting content. It extracts:

- emotions
- pain points
- behavioral patterns
- monetization signals
- retention likelihood
- shareability potential

The canonical initial schema is `schemas/signal_schema_v1.json`.

The initial emotion taxonomy is `schemas/emotion_taxonomy_v1.md`.

The initial extraction prompt is `prompts/extraction_prompt_v1.md`.

## Schema Change Policy

Schemas are contracts.

Codex must not silently modify schemas. Any schema change requires:

1. a human-approved reason
2. a decision log entry in `ai-collaboration/decisions/`
3. a version change or explicit migration note
4. an execution report calling out the change

When uncertain whether a change is schema-level or implementation-level, escalate before editing.

## Escalation Rules

Escalate to the human when:

- architecture direction is unclear
- schema fields, scoring scales, or required values may change
- research collection boundaries are unclear
- a task would introduce cloud infrastructure or persistent services
- a task would add scraping, UI, dashboards, auth, or databases
- the requested implementation conflicts with these operating rules

Escalation should be concise and include the decision needed.

