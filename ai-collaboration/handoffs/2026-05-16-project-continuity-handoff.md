# Project Continuity Handoff

## Date

2026-05-16

## Task

Persist the latest Opportunity Radar project handoff and preserve collaboration context before future implementation work.

## Context

Opportunity Radar is a local-first, AI-native qualitative market research engine for founder research. The project is still in Phase 1: Signal Extraction Foundation.

The system should detect and structure:

- emotional market signals
- recurring human anxieties
- monetizable behavioral patterns
- viral social dynamics
- AI-native MVP opportunities

The project is not collecting content for its own sake. It is extracting emotions, pain points, social behaviors, monetization signals, retention signals, and shareability patterns from noisy social content.

The strongest early AI consumer opportunity currently identified is relationship and conversation analysis because it has high emotional intensity, high frequency, high shareability, strong monetization potential, strong viral potential, and cultural compatibility with the Taiwan market.

Priority sources remain:

- Dcard
- Threads
- TikTok comments
- Reddit
- App reviews

Priority emotional categories include:

- relationship anxiety
- loneliness
- social pressure
- identity seeking
- productivity stress
- financial anxiety
- FOMO
- self-worth insecurity

## Collaboration Model

- ChatGPT owns strategy, architecture thinking, signal framework design, opportunity analysis, prompt design, product direction, and market interpretation.
- Codex owns implementation, local tooling, execution, repository organization, reporting, and workflow enforcement.
- Human owns judgment, prioritization, clarifications, uncertainty resolution, and strategic decisions.

Codex is not the architecture authority. Major architecture or schema decisions require human approval.

## Relevant Files

- `AGENTS.md`
- `README.md`
- `WORKING_AGREEMENT.md`
- `schemas/signal_schema_v1.json`
- `schemas/emotion_taxonomy_v1.md`
- `prompts/extraction_prompt_v1.md`
- `templates/handoff_template.md`
- `templates/execution_report_template.md`
- `summary_log.md`

## Constraints

- Keep the system local-first.
- Keep workflows markdown-first.
- Prefer Python, local CLI tools, JSON outputs, and local file storage.
- Do not introduce cloud infrastructure, auth, Kubernetes, vector databases, scraping infrastructure, UI, dashboards, or production SaaS architecture without explicit approval.
- Optimize for rapid iteration, AI-readable context persistence, and research velocity.
- Never silently change schemas.
- If uncertain, document the blocker and escalate.

## Planned Work

1. Save this handoff.
2. Make no schema or architecture changes.
3. Generate an execution report documenting the handoff persistence.
4. Append `summary_log.md`.

## Uncertainties

- No implementation request was made beyond the handoff itself.
- Future schema, taxonomy, scoring rubric, source collection, and extraction workflow changes still require human approval before implementation.
