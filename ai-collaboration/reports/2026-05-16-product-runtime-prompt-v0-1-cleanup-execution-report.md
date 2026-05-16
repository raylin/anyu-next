# Product Runtime Prompt v0.1 Cleanup Execution Report

## Summary

Completed the Product Runtime Prompt v0.1 cleanup for `曖昧溫度計`, refreshed the three live generated product samples, updated the review bundle, and added the completed-handoff git commit rule to collaboration workflow docs and templates.

The product result schema was not changed.

## Files Updated

- `prompts/product_result_prompt_v0.md`
- `AGENTS.md`
- `WORKING_AGREEMENT.md`
- `README.md`
- `ai-collaboration/templates/handoff_template.md`
- `ai-collaboration/templates/execution_report_template.md`
- `ai-collaboration/handoffs/2026-05-16-product-runtime-prompt-v0-1-cleanup-handoff.md`
- `ai-collaboration/research/2026-05-16-product-result-v0-review-bundle.md`
- `outputs/product_samples/generated/product_sample_001.result.json`
- `outputs/product_samples/generated/product_sample_002.result.json`
- `outputs/product_samples/generated/product_sample_003.result.json`
- `ai-collaboration/reports/2026-05-16-product-runtime-prompt-v0-1-cleanup-execution-report.md`
- `ai-collaboration/summaries/summary_log.md`

## Prompt Changes

- Renamed the prompt heading to Product Result Prompt v0.1 while keeping the file path unchanged.
- Added temperature calibration rules that define the score as observable interaction warmth rather than relationship safety, romantic success probability, or certainty of romantic interest.
- Added score bands for `已讀不回`, `忽冷忽熱`, `回訊變慢但看限動`, stable proactive interaction, highly mutual interaction, and rare 90+ cases.
- Added identity-safe share-card rules and safer persona/sentence examples.
- Added explicit share-card language to avoid, including publicly embarrassing or too-revealing wording.
- Made `personal_pattern_candidate.should_store` default to `false`.
- Added stricter evidence requirements for `should_store: true`, including at least two concrete evidence points supporting the same reusable pattern.
- Added non-diagnostic wording constraints for personal pattern candidates.
- Tuned paid preview guidance toward immediate action value.
- Tuned paid result guidance toward a smart-friend tone instead of a consultant-report tone.
- Strengthened final self-check guidance for forbidden substrings and conservative pattern storage.

## Workflow Rule Changes

- Added the mandatory rule: after every completed handoff, Codex must create a git commit containing the completed changes.
- Added commit requirements:
  - run relevant validation before committing
  - include the handoff, report, summary log, and changed project files
  - use a clear `<type>: <short task summary>` commit message
  - mention the commit hash in the final Codex Completion Summary
  - document blockers if commit creation fails
  - avoid silently including unrelated uncommitted changes
- Updated the paste-back completion summary template to include a `Commit:` field.
- Updated the done definition to include a git commit.

## Generation / Validation Results

Live Anthropic generation was available and was run.

Commands used:

```bash
python3 scripts/generate_product_sample.py outputs/product_samples/raw/product_sample_001.txt
python3 scripts/generate_product_sample.py outputs/product_samples/raw/product_sample_002.txt
python3 scripts/generate_product_sample.py outputs/product_samples/raw/product_sample_003.txt
```

The handoff-provided commands included `--situation-type`, but the current generator does not support that argument. The script derives `situation_type` from each raw sample file, so the current CLI invocation was used.

Requested validation:

```bash
python3 -m compileall oradar
python3 -m py_compile scripts/generate_product_sample.py
python3 -m json.tool schemas/product_result_schema_v0.json
```

Results:

- `python3 -m compileall oradar` passed.
- `python3 -m py_compile scripts/generate_product_sample.py` passed.
- `schemas/product_result_schema_v0.json` remains valid JSON.
- All three generated outputs passed the generator's schema validation.
- Additional structured validation confirmed all three generated outputs validate against `schemas/product_result_schema_v0.json`.
- Share cards do not include full raw conversation text.
- Share-card wording is identity-safe.
- Personal pattern candidates are non-diagnostic and avoid the disallowed terms.
- `should_store` is no longer blindly true for all samples; all three regenerated samples use `false`.
- Temperature spread improved from `35, 35, 42` to `35, 52, 52`.

## Before / After Notes

Temperature score spread:

- Before: `35, 35, 42`
- After: `35, 52, 52`

Share-card tone:

- Before: included wording that could feel exposing or humiliating.
- After: uses safer public-share language such as `你不是想太多，只是你太會看見細節。`

Personal pattern candidate policy:

- Before: `should_store` was `true` for all three samples.
- After: `should_store` is `false` for all three samples, while candidate observations remain available for review.

Paid preview action value:

- Before: could feel like a promise of more analysis.
- After: emphasizes what not to do now, stable reply options, and how to test investment without lowering oneself.

Paid result tone:

- Before: some copy read like a formal consultant report.
- After: generated copy reads closer to a smart friend explaining interaction patterns.

## Git Commit

Planned commit message:

```text
prompt: calibrate product runtime output v0.1
```

Commit hash is created after this report and the summary log are staged. The final CLI completion summary will include the actual commit hash.

## Deviations From Handoff

- Used the generator's current CLI without `--situation-type` because that argument is not supported by `scripts/generate_product_sample.py`.
- The first post-cleanup rerun still produced `should_store: true` for all samples and one forbidden substring in a share card. The prompt was tightened and the samples were rerun successfully.
- The final commit hash cannot be embedded inside this report before the commit is created without changing the commit hash. The final CLI response is the authoritative location for the actual hash.

## Remaining Uncertainties

- `product_sample_002` and `product_sample_003` both scored 52. The overall spread improved, but ChatGPT should review whether these two cases should be more differentiated.
- Share-card persona variety may still be narrow because `微訊號觀察家` appears in two samples.
- All three personal pattern candidates remain `medium` confidence. ChatGPT should review whether v0.1 should push more one-off samples to `low`.

## Recommended Next Step

Have ChatGPT review the v0.1 review bundle and decide whether the remaining score tie, share-card persona reuse, and medium-confidence pattern candidates are acceptable before moving to fake-door prototype implementation.
