# Product Validation Calibration v0 Handoff

## Date

2026-05-16

## Task

Create a Product Validation Calibration v0 package for `曖昧溫度計`, including a 30-sample synthetic evaluation set, a dev-only eval runner, a compact review bundle, and Dcard calibration preparation files.

## Context

Current approved direction:

- free entry: `曖昧溫度計`
- paid unlock: `下一句怎麼回`

Current product/runtime assets already exist:

- `prompts/product_result_prompt_v0.md`
- `schemas/product_result_schema_v0.json`
- `oradar/product_runtime.py`
- local fake-door prototype
- local JSONL logging
- minimal experiment analysis report

This task should validate whether the product runtime is stable enough across a wider synthetic set before formal technical stack selection.

This task must not:

- implement Dcard collection
- change fake-door prototype behavior
- change provider behavior
- make final technical stack decisions
- change research extraction prompt/schema

## Relevant Files

- `prompts/product_result_prompt_v0.md`
- `schemas/product_result_schema_v0.json`
- `oradar/product_runtime.py`
- `scripts/generate_product_sample.py`
- `experiments/ambiguous_temperature_v0/`

Expected new or updated areas:

- `outputs/product_eval/raw/`
- `outputs/product_eval/generated/`
- `scripts/run_product_eval.py`
- `ai-collaboration/research/2026-05-16-product-validation-calibration-v0-review-bundle.md`
- `ai-collaboration/research/dcard_calibration/`
- `ai-collaboration/reports/2026-05-16-product-validation-calibration-v0-execution-report.md`

## Constraints

- Local-first.
- Markdown-first.
- Do not implement scraping, login automation, anti-bot bypass, dashboard, database, analytics SaaS, real payment, prototype UI changes, or formal stack selection.
- Do not change the product prompt or schema unless absolutely necessary; document issues instead.
- Do not change extraction prompt/schema.
- Generated synthetic outputs may be committed if useful for review.
- Do not commit local user experiment logs or contact submissions.

## Planned Work

1. Save this handoff.
2. Create 30 synthetic eval inputs and the eval manifest.
3. Add a dev-only eval runner that reuses `oradar/product_runtime.py`.
4. Run live generation for the 30 samples if Anthropic generation is available.
5. Validate generated outputs and summarize quality/risk issues.
6. Create the product validation calibration review bundle.
7. Add Dcard calibration template, schema, and README without collecting data.
8. Run validation.
9. Create the execution report.
10. Append `ai-collaboration/summaries/summary_log.md`.
11. Stage only the task files and create the required git commit.

## Uncertainties

- Whether live Anthropic generation will succeed for all 30 samples in one pass.
- Whether generated outputs will expose enough diversity to meaningfully answer the repetition/distribution questions.
- Whether any prompt-quality issue discovered during evaluation will need reruns rather than simple reporting.
