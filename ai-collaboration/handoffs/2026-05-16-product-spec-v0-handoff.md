# Product Spec v0 Handoff

## Date

2026-05-16

## Task

Create the first product specification document for `曖昧溫度計` based on Sample Set v1 findings and the v1.2 prompt rerun notes.

## Context

Opportunity Radar has completed Signal Extraction v1, Anthropic provider support, prompt improvements through v1.2, source field cleanup, Sample Set v1, and review bundle generation.

Sample Set v1 points to a strong MVP direction:

```text
免費入口：曖昧溫度計
付費解鎖：下一句怎麼回
```

The product should be positioned as an AI ambiguous relationship interaction interpretation tool, not therapy, fortune telling, or a generic chatbot.

## Relevant Files

- `ai-collaboration/research/2026-05-16-sample-set-v1-review-bundle.md`
- `ai-collaboration/reports/2026-05-16-extraction-prompt-v1-2-execution-report.md`
- `ai-collaboration/research/2026-05-16-product-spec-v0-ambiguous-relationship-temperature.md`
- `ai-collaboration/reports/2026-05-16-product-spec-v0-execution-report.md`
- `ai-collaboration/summaries/summary_log.md`

## Constraints

- Local-first
- Markdown-first
- No schema changes without approval
- Do not implement a web app, backend, payment, runtime prompt, UI, database, scraping, or production code
- Do not modify extraction prompt, schema, taxonomy, provider code, or CLI behavior
- Product spec only

## Planned Work

1. Save this handoff.
2. Draft the required product spec markdown document.
3. Create the required execution report.
4. Append `ai-collaboration/summaries/summary_log.md`.
5. Validate that required spec/report sections exist.
6. End with the required paste-back completion summary.

## Uncertainties

- Pricing and paywall details are hypotheses and should be reviewed by ChatGPT/human before implementation.
- The exact scoring formula and result schema are draft product concepts, not implementation contracts.
