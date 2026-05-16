# Product Validation Calibration v0 Execution Report

## Summary

Created a Product Validation Calibration v0 package for `曖昧溫度計`.

Completed work:

- built a 30-sample synthetic evaluation set
- added a dev-only eval runner
- ran live Anthropic-backed generation for all 30 samples
- generated a compact review bundle
- prepared the Dcard calibration folder, README, template, and schema

No Dcard data was collected.

## Files Created

- `ai-collaboration/handoffs/2026-05-16-product-validation-calibration-v0-handoff.md`
- `outputs/product_eval/raw/eval_001.txt` through `eval_030.txt`
- `outputs/product_eval/raw/eval_manifest.json`
- `outputs/product_eval/generated/eval_001.result.json` through `eval_030.result.json`
- `outputs/product_eval/generated/eval_generation_summary.json`
- `scripts/run_product_eval.py`
- `ai-collaboration/research/2026-05-16-product-validation-calibration-v0-review-bundle.md`
- `ai-collaboration/research/dcard_calibration/README.md`
- `ai-collaboration/research/dcard_calibration/dcard_topic_calibration_template.md`
- `ai-collaboration/research/dcard_calibration/dcard_topic_calibration_schema.json`
- `ai-collaboration/reports/2026-05-16-product-validation-calibration-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Synthetic Evaluation Set

Created `30` synthetic Traditional Chinese inputs under:

- `outputs/product_eval/raw/`

Distribution:

- `已讀不回`: `10`
- `忽冷忽熱`: `10`
- `回訊變慢但看限動`: `10`

Each sample:

- is 2-5 sentences
- avoids real personal data
- is designed to feel like a Dcard/Threads-style relationship post

Manifest:

- `outputs/product_eval/raw/eval_manifest.json`

## Generation Results

Generation script:

- `scripts/run_product_eval.py`

Command run:

```bash
python3 scripts/run_product_eval.py
```

Provider/model used:

- provider: `anthropic`
- model: `claude-sonnet-4-20250514`

Results:

- manifest count: `30`
- generated outputs: `30`
- failures: `0`
- generation summary:
  - `outputs/product_eval/generated/eval_generation_summary.json`

## Product Runtime Quality Checks

Checks covered:

- JSON parse and schema validation
- `temperature_score` integer presence and summary distribution
- non-empty `state_label`
- `paid_preview.price == NT$49`
- required reply strategies present
- no raw conversation text in `share_card`
- heuristic share-card identity-safety scan
- heuristic non-diagnostic personal-pattern scan
- `should_store` review
- forbidden/risky language scan

Observed highlights:

- live generation succeeded for all 30 samples
- risky deterministic/toxic phrase scan returned `0` findings
- `should_store` stayed `false` for `28/30` outputs
- `should_store` became `true` for:
  - `eval_016`
  - `eval_029`
- temperature range remained narrow:
  - min `25`
  - max `55`
  - no outputs above `60`
- strongest repetition issue:
  - share persona `微訊號觀察家` appeared `8` times

## Dcard Calibration Preparation

Created:

- `ai-collaboration/research/dcard_calibration/README.md`
- `ai-collaboration/research/dcard_calibration/dcard_topic_calibration_template.md`
- `ai-collaboration/research/dcard_calibration/dcard_topic_calibration_schema.json`

This task did not:

- scrape Dcard
- collect Dcard URLs in bulk
- bypass login or anti-bot protections
- store raw Dcard post collections

## Validation Results

Validation commands run:

```bash
python3 -m compileall oradar
python3 -m py_compile experiments/ambiguous_temperature_v0/*.py
python3 -m py_compile scripts/generate_product_sample.py
python3 -m py_compile scripts/run_product_eval.py
python3 -m json.tool outputs/product_eval/raw/eval_manifest.json
python3 -m json.tool ai-collaboration/research/dcard_calibration/dcard_topic_calibration_schema.json
python3 scripts/run_product_eval.py
```

Results:

- all compile checks passed
- manifest JSON is valid
- Dcard calibration schema JSON is valid
- all 30 generated product outputs were written successfully
- local user experiment logs and contact submissions were not staged for commit

## Known Technical Debt

None.

## Deviations From Handoff

- Live generation initially failed in the sandbox due network/DNS restrictions; rerunning the eval runner with escalation succeeded.
- The review bundle focuses on summary tables, representative examples, and detected issues rather than embedding all 30 full JSON outputs.
- Final commit hash is reported in the final CLI completion summary because a commit cannot contain its own final hash without changing that hash.

## Git Commit

Planned commit message:

```text
test: add product validation calibration set v0
```

The final CLI completion summary will include the actual commit hash after commit creation.

## Remaining Uncertainties

- The runtime is stable enough for evaluation, but it is not yet clear whether score compression is a prompt problem or a natural consequence of the current three situation-type buckets.
- `should_store=true` on `eval_016` and `eval_029` may or may not be acceptable depending on how conservative the team wants v0 memory behavior to be.
- The synthetic set validates breadth better than realism; Dcard calibration is still needed to compare these patterns against live public topic structures.

## Recommended Next Step

Have ChatGPT review the calibration bundle, especially the narrow temperature spread, repeated share personas, and `should_store` edge cases, before deciding whether to revise the prompt or proceed directly into Dcard topic calibration.
