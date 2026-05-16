# Product Runtime Prompt + Schema v0 Execution Report

## Summary

Created the first Product Runtime Track foundation for `曖昧溫度計`: a product result prompt, product result schema, three raw product samples, generated product result JSON outputs, a dev-only generation script, and a review bundle.

The Research Signal Track was not modified.

## Files Created

- `ai-collaboration/handoffs/2026-05-16-product-runtime-prompt-schema-v0-handoff.md`
- `prompts/product_result_prompt_v0.md`
- `schemas/product_result_schema_v0.json`
- `outputs/product_samples/raw/product_sample_001.txt`
- `outputs/product_samples/raw/product_sample_002.txt`
- `outputs/product_samples/raw/product_sample_003.txt`
- `outputs/product_samples/generated/.gitkeep`
- `outputs/product_samples/generated/product_sample_001.result.json`
- `outputs/product_samples/generated/product_sample_002.result.json`
- `outputs/product_samples/generated/product_sample_003.result.json`
- `scripts/generate_product_sample.py`
- `ai-collaboration/research/2026-05-16-product-result-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-16-product-runtime-prompt-schema-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Product Runtime Schema

Created `schemas/product_result_schema_v0.json`.

Top-level structure:

- `free_result`
- `insight_layer`
- `paid_preview`
- `paid_result`
- `share_card`
- `personal_pattern_candidate`
- `metadata`

The schema is separate from `schemas/signal_schema_v1.json` and is intended for user-facing product runtime results, not market research extraction.

## Product Runtime Prompt

Created `prompts/product_result_prompt_v0.md`.

The prompt instructs the model to:

- return valid JSON only
- conform to `schemas/product_result_schema_v0.json`
- use Traditional Chinese for user-facing values
- keep tone lightweight, emotionally resonant, and Taiwan social-native
- include free result, insight layer, paid preview, paid result, share card, personal pattern candidate, and metadata
- generate three reply strategies: `主動推進`, `低壓試探`, and `暫時拉開`
- avoid deterministic claims, therapy framing, diagnosis, hidden-intent claims, cruel language, and sensational wording
- keep raw conversation text out of `share_card`

## Insight Layer

Added `insight_layer` as a required product result section. It provides lightweight psychology-informed resonance without academic or diagnostic framing.

The live outputs show this section can produce useful product flavor, such as:

- `模糊訊號放大`
- `親密後的距離調整`
- `低成本互動訊號`

## Personal Pattern Candidate

Added `personal_pattern_candidate` as a required section for future personalization and possible Personal Insight Graph use.

The section is explicitly framed as a candidate observation, not a diagnosis or permanent trait. Live outputs used `confidence: "medium"` for all three samples and `should_store: true`.

This should be reviewed because v0 may need a more conservative default for storage.

## Generation / Validation Results

Validation completed:

- `python3 -m compileall oradar` passed.
- `python3 -m py_compile scripts/generate_product_sample.py` passed.
- `schemas/product_result_schema_v0.json` parsed as valid JSON.
- Static prompt checks passed for JSON-only instruction, Traditional Chinese default, `insight_layer`, `personal_pattern_candidate`, reply strategies, uncertainty, and share-card privacy guidance.
- Schema includes all required top-level sections.

Live generation:

- Live Anthropic generation was performed using `scripts/generate_product_sample.py`.
- Generated outputs:
  - `outputs/product_samples/generated/product_sample_001.result.json`
  - `outputs/product_samples/generated/product_sample_002.result.json`
  - `outputs/product_samples/generated/product_sample_003.result.json`
- All generated outputs parsed as JSON and passed product schema validation in the dev-only script.
- Final generated outputs passed checks for:
  - no full raw conversation text in `share_card`
  - uncertainty-preserving language present
  - `personal_pattern_candidate` avoids diagnosis
  - forbidden overclaiming substrings absent from generated outputs

## Review Bundle

Created `ai-collaboration/research/2026-05-16-product-result-v0-review-bundle.md`.

The bundle includes:

- schema summary
- prompt summary
- sample input summaries
- generated output summaries
- observed quality notes
- issues for ChatGPT review
- full generated JSON for all three samples

## Deviations From Handoff

- Added `scripts/generate_product_sample.py` as a clearly separated dev-only script because live product runtime generation was feasible without changing the main CLI or provider behavior.
- The product prompt received several calibration passes after live outputs drifted into overclaiming or authority-heavy language.
- Generated outputs were regenerated after prompt tightening; no manual edits were made to generated JSON.

## Remaining Uncertainties

- Whether `personal_pattern_candidate.should_store` should default to `true` or be more conservative remains unresolved.
- Temperature scores clustered between 35 and 42 for the three uncertain/negative samples; scoring spread may need future calibration.
- Share-card personas and card sentences need human review for tone and privacy comfort.
- Future implementation may need automated post-generation checks, not only prompt instructions.

## Recommended Next Step

Review the product runtime prompt, schema, and generated outputs in ChatGPT Web. Decide whether to adjust `personal_pattern_candidate` storage policy, temperature scoring spread, and share-card tone before building the fake-door prototype.
