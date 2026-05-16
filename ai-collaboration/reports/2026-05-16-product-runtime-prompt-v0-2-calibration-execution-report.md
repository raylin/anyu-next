# Product Runtime Prompt v0.2 Calibration Execution Report

## Summary

Calibrated `prompts/product_result_prompt_v0.md` in place to v0.2 and reran the 30-sample synthetic product evaluation.

Primary results:

- temperature range widened from `25-55` to `35-62`
- outputs above `60` increased from `0` to `2`
- share-card persona diversity improved from `21` unique personas to `25`
- `微訊號觀察家` dropped from `8` uses to `1`
- `personal_pattern_candidate.should_store=true` dropped from `2` to `0`

## Files Updated

- `prompts/product_result_prompt_v0.md`
- `scripts/run_product_eval.py`
- `outputs/product_eval/generated/eval_001.result.json` through `eval_030.result.json`
- `outputs/product_eval/generated/eval_generation_summary.json`
- `ai-collaboration/research/2026-05-16-product-validation-calibration-v0-review-bundle.md`
- `ai-collaboration/handoffs/2026-05-16-product-runtime-prompt-v0-2-calibration-handoff.md`
- `ai-collaboration/summaries/summary_log.md`

## Prompt Changes

Applied v0.2 calibration guidance without renaming the prompt file.

Changes made:

- clarified that `temperature_score` measures observable interaction warmth only
- added stronger score bands from `0-20` through `91-100`
- added scenario-specific calibration examples for all three situation types
- explicitly stated that unstable does not always mean cold
- expanded share-card persona guidance into multiple persona families
- added explicit anti-repetition guidance for share-card personas
- changed personal-pattern policy from default-false to hard-rule-false for `should_store`
- strengthened reply-strategy instructions so each string should include a concrete example with quoted Traditional Chinese text

## Evaluation Rerun Results

Rerun command:

```bash
python3 scripts/run_product_eval.py
```

Live generation:

- performed: `yes`
- provider: `anthropic`
- model: `claude-sonnet-4-20250514`
- generated outputs: `30/30`

Operational note:

- the live runner completed the file rewrites but did not return a clean terminal footer
- the final summary JSON was rebuilt locally from the generated result files to preserve the rerun metrics deterministically

## Temperature Calibration Results

Before:

- range: `25-55`
- average: `44.2`
- above `60`: `0`

After:

- range: `35-62`
- average: `48.8`
- above `60`: `2`

By situation type after rerun:

- `已讀不回`: min `35`, max `52`, avg `39.4`, above `60`: `0`
- `忽冷忽熱`: min `52`, max `62`, avg `58.2`, above `60`: `2`
- `回訊變慢但看限動`: min `42`, max `52`, avg `48.8`, above `60`: `0`

Assessment:

- the key v0.2 target was met for `忽冷忽熱`
- the range is still conservative overall
- the lower end may now be slightly too warm for some `已讀不回` cases

## Share-Card Persona Results

Before:

- unique personas: `21`
- top repetition: `微訊號觀察家=8`, `溫差觀察員=3`

After:

- unique personas: `25`
- top repetition: `限動雷達型=4`, `溫差敏感觀察者=3`
- `微訊號觀察家=1`

Assessment:

- persona diversity improved materially
- the old repetition problem is fixed
- no raw conversation text leaked into share cards
- share-card tone remained identity-safe under the heuristic scan

## Personal Pattern Candidate Results

Before:

- `should_store=true`: `2`
- confidence distribution: `medium=30`

After:

- `should_store=true`: `0`
- confidence distribution: `medium=30`

Assessment:

- the v0 hard-stop storage rule now holds
- the remaining issue is confidence monotony; the runtime still does not meaningfully use `low`

## Paid Strategy Usability Results

Strict format check:

- outputs where all three strategy strings contained quoted example formatting: `18/30`

Representative stronger examples:

- `eval_004` low-pressure strategy includes a direct example sentence
- `eval_011` low-pressure strategy includes a natural “有空再聊” example
- `eval_014` preview and reply strategy align to the night/day temperature scenario
- `eval_026` includes scenario-specific testing language around low-cost interaction

Remaining issue:

- `12` outputs still miss the stricter `可以這樣回：「...」` formatting in at least one strategy string
- this is now the main remaining prompt-compliance gap

## Risky Language Scan

Results:

- forbidden deterministic/toxic phrase findings: `0`
- raw conversation text in `share_card`: `0`
- `should_store=true`: `0`

Additional review note:

- no hard-risky phrases were found
- one state label family (`依賴性溫差`) suggests the prompt may still need tighter wording constraints around sticky interpersonal labels

## Validation Results

Commands run:

```bash
python3 -m compileall oradar
python3 -m py_compile experiments/ambiguous_temperature_v0/*.py
python3 -m py_compile scripts/generate_product_sample.py
python3 -m py_compile scripts/run_product_eval.py
python3 scripts/run_product_eval.py
```

Additional validation:

- `outputs/product_eval/raw/eval_manifest.json` parses as valid JSON
- `outputs/product_eval/generated/eval_generation_summary.json` parses as valid JSON
- all 30 generated outputs pass a local structural schema-contract validation against `schemas/product_result_schema_v0.json`

## Known Technical Debt

None introduced.

The only remaining quality issue is prompt behavior, not implementation debt.

## Deviations From Handoff

- `scripts/run_product_eval.py` was updated to produce richer evaluation summary data needed for the before/after bundle. This stayed within the dev-only evaluation scope.
- the live eval runner session did not exit cleanly after generation, so the summary file was reconstructed locally from the generated outputs.
- no schema, prototype flow, provider behavior, or Dcard collection logic was changed.

## Git Commit

Planned commit message:

```text
prompt: calibrate product runtime output v0.2
```

The final CLI completion summary includes the actual commit hash after commit creation.

## Remaining Uncertainties

- whether the warmed-up `已讀不回` band is now slightly too generous
- whether `18/30` strict reply-strategy example compliance is good enough for the next phase
- whether `confidence` should remain all-`medium` or be recalibrated toward more `low`

## Recommended Next Step

Have ChatGPT review the v0.2 bundle before any Dcard calibration work.

If the review agrees that the core v0.2 issues are fixed, do at most one more small prompt pass for:

- stricter reply-strategy formatting
- more meaningful `low` confidence usage
- an explicit ban on labels like `依賴性溫差`
