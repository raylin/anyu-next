# Product Runtime Prompt + Schema v0 Handoff

## Date

2026-05-16

## Task

Create the first product runtime prompt and product result schema for `曖昧溫度計`, plus sample inputs, optional generated sample outputs, a review bundle, and execution report.

## Context

The project now has two separate prompt/schema tracks:

- Research Signal Track:
  - `prompts/extraction_prompt_v1.md`
  - `schemas/signal_schema_v1.json`
  - Purpose: market research / opportunity detection
- Product Runtime Track:
  - `prompts/product_result_prompt_v0.md`
  - `schemas/product_result_schema_v0.json`
  - Purpose: user-facing `曖昧溫度計` product results

The product philosophy is `Fun Surface + Insight Layer + Personal Pattern Candidate`.

## Relevant Files

- `prompts/product_result_prompt_v0.md`
- `schemas/product_result_schema_v0.json`
- `outputs/product_samples/raw/product_sample_001.txt`
- `outputs/product_samples/raw/product_sample_002.txt`
- `outputs/product_samples/raw/product_sample_003.txt`
- `outputs/product_samples/generated/`
- `scripts/generate_product_sample.py`
- `ai-collaboration/research/2026-05-16-product-result-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-16-product-runtime-prompt-schema-v0-execution-report.md`
- `ai-collaboration/summaries/summary_log.md`

## Constraints

- Local-first
- Markdown-first
- No schema changes to the research signal schema
- Do not modify `prompts/extraction_prompt_v1.md`
- Do not modify `schemas/signal_schema_v1.json`
- Do not modify research extraction outputs
- Do not modify provider behavior or existing CLI behavior unless absolutely necessary
- Do not add web app, backend, real payment, fake-door UI, database, analytics SaaS, scraping, product launch code, login, dashboard, OCR, or screenshot upload

## Planned Work

1. Save this handoff.
2. Create the product runtime prompt.
3. Create the product result schema.
4. Create product sample directories and raw inputs.
5. Add a clearly separated dev-only generation script if it stays small.
6. Generate product sample outputs if Anthropic is available.
7. Validate schema, prompt requirements, generated outputs, and compile checks.
8. Create review bundle.
9. Create execution report.
10. Append `ai-collaboration/summaries/summary_log.md`.
11. End with the required paste-back completion summary.

## Uncertainties

- Live generation depends on `ANTHROPIC_API_KEY` and network access.
- Product result quality requires ChatGPT/human review before use in any prototype.
- The product result schema is a v0 product runtime contract, not a replacement for the research signal schema.
