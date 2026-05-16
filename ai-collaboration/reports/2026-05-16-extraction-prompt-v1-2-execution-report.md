# Extraction Prompt v1.2 Execution Report

## Summary

Updated `prompts/extraction_prompt_v1.md` in place from v1.1 to v1.2. The cleanup focused on emotion normalization, scoring calibration, possible product role diversity, hook diversity, and stronger uncertainty preservation.

No extraction code, provider code, CLI behavior, schema semantics, source boundaries, or architecture were changed.

## Files Updated

- `prompts/extraction_prompt_v1.md`
- `outputs/structured/sample_002.signal.json`
- `outputs/structured/sample_003.signal.json`
- `outputs/structured/sample_010.signal.json`
- `ai-collaboration/handoffs/2026-05-16-extraction-prompt-v1-2-handoff.md`
- `ai-collaboration/reports/2026-05-16-extraction-prompt-v1-2-execution-report.md`
- `ai-collaboration/summaries/summary_log.md`

## Prompt Changes

- Renamed prompt heading to `Extraction Prompt v1.2`.
- Added emotion-label normalization guidance that discourages broad catch-all labels such as `關係失控感`, `焦慮`, `壓力`, `不安`, and `難過`.
- Added relationship-specific preferred emotion labels, including `已讀不回焦慮`, `忽冷忽熱焦慮`, `備胎焦慮`, `回訊落差焦慮`, and `對方優先級焦慮`.
- Added examples showing how broad emotion labels should become more specific.
- Expanded scoring calibration with field-specific guidance for `emotion_intensity`, `shareability_score`, `monetization_score`, and `retention_score`.
- Added explicit guidance to use `9-10` sparingly and avoid defaulting relationship samples into the same score band.
- Updated `possible_product` guidance to keep the schema unchanged while encouraging acquisition, monetization, and retention concept diversity.
- Updated `possible_hook` guidance to include curiosity, self-recognition, and action hooks.
- Added stronger uncertainty rules against claiming to know another person's hidden intent, including in `possible_hook` and `observed_patterns`.

## Why These Changes Matter

The v1 sample set showed strong extraction quality but weak prioritization signals because several values clustered around similar bands and some emotion labels were too broad for MVP selection. The v1.2 prompt should make future outputs easier to compare by producing more specific emotional signals, clearer actionability differences, and product ideas that map more directly to acquisition, monetization, and retention hypotheses.

## Validation Results

- `python3 -m compileall oradar` passed.
- Static prompt/schema check passed: output JSON keys still exactly match the required schema key order.
- JSON-only requirement is still present.
- User-facing values still default to Traditional Chinese.
- Prompt includes guidance for emotion normalization, scoring calibration, possible product role diversity, hook diversity, and uncertainty preservation.
- Live Anthropic extraction validation passed for samples 002, 003, and 010.

## Live Extraction Result

Live extraction was run with `ORADAR_PROVIDER=anthropic` for:

- `outputs/raw/sample_002.txt`
- `outputs/raw/sample_003.txt`
- `outputs/raw/sample_010.txt`

All three runs completed successfully and passed schema validation.

Final rerun highlights:

| Sample | Emotion | Emotion Intensity | Shareability | Monetization | Retention |
| --- | --- | ---: | ---: | ---: | ---: |
| `sample_002` | `已讀不回焦慮` | 9 | 10 | 9 | 9 |
| `sample_003` | `忽冷忽熱焦慮` | 8 | 9 | 9 | 9 |
| `sample_010` | `備胎焦慮` | 7 | 9 | 7 | 7 |

## Before / After Notes

- `關係失控感` previously appeared repeatedly in Sample Set v1, including `sample_003` and `sample_010`; the rerun samples now use more specific emotion labels.
- Monetization and retention scores show some improved separation, especially for `sample_010`.
- Shareability remains high across the rerun relationship samples. This may be reasonable for highly relatable Dcard-style relationship content, but future sample sets should continue monitoring whether the prompt overuses 9-10 shareability scores.
- `possible_product` outputs are more aligned with acquisition, monetization, and retention concepts, though the schema remains a plain string array.
- Hooks are less sensational overall, but live outputs still need human review for tone and uncertainty calibration before being treated as final market copy.

## Deviations From Handoff

- Live extraction was run because `ANTHROPIC_API_KEY` was available through the local `.env` file.
- Network access initially failed under sandbox restrictions and then succeeded after approval.
- The prompt received one additional uncertainty-tightening pass after live output showed hidden-intent wording in hooks and observed patterns.

## Remaining Uncertainties

- Whether shareability scoring will remain too high across broader sample categories is unresolved.
- Whether `9` monetization scores are too aggressive for some non-urgent relationship samples should be reviewed after a larger v1.2 sample pass.
- Human review is still needed to decide whether the v1.2 output tone is sufficiently Taiwan social-native without becoming too sensational.

## Readiness for Product Spec v0

Ready to proceed to Product Spec v0 with one caveat: use the v1.2 prompt as the current extraction baseline, but carry forward shareability and high-score calibration as review items rather than settled assumptions.
