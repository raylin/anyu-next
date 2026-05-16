# Product Runtime Prompt v0.2 Calibration Handoff

## Date

2026-05-16

## Task

Calibrate `prompts/product_result_prompt_v0.md` in place to v0.2 based on the 30-sample Product Validation Calibration v0 results, rerun the 30-sample evaluation, and update the review bundle and execution artifacts.

## Context

Previous calibration package commit:

- `f10d036`

Key issues reported from the 30-sample synthetic eval:

1. `temperature_score` is too compressed:
   - observed range `25-55`
   - no outputs above `60`
   - `忽冷忽熱` especially clustered
2. Share-card persona diversity is weak:
   - `微訊號觀察家` repeated `8` times
3. `personal_pattern_candidate.should_store` still became `true` in:
   - `eval_016`
   - `eval_029`

This task should improve those issues before semi-automated Dcard topic calibration.

## Relevant Files

- `prompts/product_result_prompt_v0.md`
- `scripts/run_product_eval.py`
- `outputs/product_eval/raw/eval_manifest.json`
- `outputs/product_eval/raw/eval_001.txt` through `eval_030.txt`
- `outputs/product_eval/generated/`
- `ai-collaboration/research/2026-05-16-product-validation-calibration-v0-review-bundle.md`

## Constraints

- Do not rename the prompt file.
- Do not modify `schemas/product_result_schema_v0.json`.
- Do not modify `prompts/extraction_prompt_v1.md`.
- Do not modify `schemas/signal_schema_v1.json`.
- Do not modify `oradar/product_runtime.py`.
- Do not change fake-door prototype behavior.
- Do not collect Dcard data.
- If schema changes seem necessary, document the recommendation instead of silently changing them.

## Planned Work

1. Save this handoff.
2. Update `prompts/product_result_prompt_v0.md` in place to v0.2 behavior.
3. If useful, extend the eval runner summary so the rerun is easier to compare.
4. Rerun the 30-sample product eval with the existing manifest/raw inputs.
5. Validate outputs and compute before/after comparisons.
6. Update the product validation review bundle.
7. Create the execution report.
8. Append `ai-collaboration/summaries/summary_log.md`.
9. Create the required git commit and report the hash in the final completion summary.

## Uncertainties

- Whether the rerun will widen scores enough without overcorrecting.
- Whether the current schema-freeform `reply_strategies` strings can be improved enough through prompt guidance alone.
- Whether any remaining repetition will be more visible in state labels or share personas after the prompt update.
