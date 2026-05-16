# Product Validation Calibration v0 Review Bundle

## 1. Overview

This bundle updates the 30-sample synthetic evaluation after calibrating `prompts/product_result_prompt_v0.md` to v0.2.

Scope:

- same 30 synthetic Traditional Chinese inputs
- live product-runtime generation through `oradar/product_runtime.py`
- no Dcard collection
- no prototype-flow changes

Primary v0.2 goals:

1. widen `temperature_score` usage
2. reduce share-card persona repetition
3. force `personal_pattern_candidate.should_store=false` in v0
4. improve reply-strategy concreteness where possible without schema changes

## 2. Evaluation Set Summary

Synthetic input count:

- `30`

Situation-type distribution:

- `已讀不回`: `10`
- `忽冷忽熱`: `10`
- `回訊變慢但看限動`: `10`

Paths:

- raw inputs: `outputs/product_eval/raw/eval_001.txt` to `eval_030.txt`
- manifest: `outputs/product_eval/raw/eval_manifest.json`
- generated outputs: `outputs/product_eval/generated/`
- generation summary: `outputs/product_eval/generated/eval_generation_summary.json`

## 3. Generation Status

Live generation performed:

- `yes`

Provider/model:

- provider: `anthropic`
- model: `claude-sonnet-4-20250514`

Generation totals:

- manifest count: `30`
- generated outputs: `30`
- failures: `0`

Note:

- the live runner rewrote all 30 outputs successfully
- the long-running CLI session did not return its final footer cleanly, so the summary JSON was rebuilt locally from the generated result files

## 4. Temperature Score Distribution

### Before v0.2

- range: `25-55`
- average: `44.2`
- outputs above `60`: `0`
- buckets:
  - `0-20`: `0`
  - `21-40`: `10`
  - `41-60`: `20`
  - `61-75`: `0`
  - `76-90`: `0`
  - `91-100`: `0`

### After v0.2

- range: `35-62`
- average: `48.8`
- outputs above `60`: `2`
- buckets:
  - `0-20`: `0`
  - `21-40`: `6`
  - `41-60`: `22`
  - `61-75`: `2`
  - `76-90`: `0`
  - `91-100`: `0`

### Interpretation

- the range widened upward from `55` to `62`
- low-end overcompression improved slightly, but the coldest band also moved up from `25` to `35`
- `忽冷忽熱` now reaches above `60`, which was the intended direction
- the distribution is still conservative overall; warm-but-unstable cases improved, but the `76+` range is still unused

## 5. State Label Distribution

Top repeated state labels after v0.2:

| State Label | Count |
| --- | ---: |
| `低溫保留` | 4 |
| `忽冷忽熱` | 4 |
| `降溫觀望` | 3 |
| `忽冷忽熱循環` | 2 |

Single-use labels now include:

- `主動性下降`
- `投入後急降溫`
- `低溫迴避`
- `溫度明顯降低`
- `主動性懸掛中`
- `已讀後暫停`
- `夜晚加溫白天降溫`
- `聊天熱，行動冷`
- `依賴性溫差`
- `回應節奏改變`
- `回應節奏降溫`
- `低成本互動保留`
- `低成本保持`
- `低成本保留`
- `訊號混雜`
- `低成本互動期`
- `慢熱觀望`

Interpretation:

- label variety improved versus the earlier `降溫觀望` concentration
- one label, `依賴性溫差`, is still too close to language the product should avoid and should be reviewed

## 6. Situation Type Breakdown

### Before v0.2

| Situation Type | Min | Max | Avg | Above 60 |
| --- | ---: | ---: | ---: | ---: |
| `已讀不回` | 25 | 42 | 33.1 | 0 |
| `忽冷忽熱` | 52 | 55 | 52.3 | 0 |
| `回訊變慢但看限動` | 35 | 52 | 47.1 | 0 |

### After v0.2

| Situation Type | Min | Max | Avg | Above 60 |
| --- | ---: | ---: | ---: | ---: |
| `已讀不回` | 35 | 52 | 39.4 | 0 |
| `忽冷忽熱` | 52 | 62 | 58.2 | 2 |
| `回訊變慢但看限動` | 42 | 52 | 48.8 | 0 |

Interpretation:

- `忽冷忽熱` gained meaningful upward spread, which was the main calibration target
- `已讀不回` warmed up as a category; that avoids overpunishing uncertainty, but some cases may now be slightly too mild
- `回訊變慢但看限動` stayed in the intended low-to-medium band

## 7. Paid Preview Quality Notes

What improved:

- paid previews still emphasize immediate action value instead of “more analysis”
- several previews now feel more scenario-specific

Representative stronger examples:

- `eval_004`: `解鎖後你會看到：現在最不該做的一件事、三種不失控回法，以及怎麼測對方投入度但不把自己放低。`
- `eval_014`: `解鎖後你會看到：現在最不該做的一件事、三種回應夜晚訊息的方法，以及怎麼測試他的白天投入度但不讓自己顯得太主動。`
- `eval_026`: `他用按讚維持存在感，但不主動開話題，這背後有三種不同的可能。解鎖後你會知道怎麼測試他的投入度，而不會把自己放得太低。`

Remaining issue:

- a subset still falls back to the same generic preview template, so preview specificity is better but not consistently differentiated

## 8. Insight Layer Quality Notes

What worked:

- insight layers still feel closer to a smart friend than a textbook
- they remain emotionally legible without becoming academic
- the better outputs explain why the user feels stuck, not just what the other person did

Representative stronger examples:

- `eval_004`: `投入節奏的微妙平衡`
- `eval_014`: `夜晚與白天的兩個版本`
- `eval_026`: `低成本互動的曖昧地帶`

Remaining issue:

- some titles and explanations still over-index on repeated framing around `節奏`, `溫差`, and `低成本互動`

## 9. Share Card Quality Notes

### Before v0.2

- unique personas: `21`
- top repeated personas:
  - `微訊號觀察家`: `8`
  - `溫差觀察員`: `3`

### After v0.2

- unique personas: `25`
- top repeated personas:
  - `限動雷達型`: `4`
  - `溫差敏感觀察者`: `3`
  - `微訊號觀察家`: `1`

Representative stronger examples:

- `eval_004`: `節奏敏感觀察員` / `你感覺到的不是拒絕，而是節奏突然不對拍了。`
- `eval_014`: `時差溫度觀察員` / `有些人的溫暖有營業時間，你不是想太多，是真的有溫差。`
- `eval_026`: `低成本訊號觀察員` / `你感受到的不是冷漠，而是他用最安全的距離在關注你。`

Interpretation:

- persona diversity clearly improved
- `微訊號觀察家` is no longer overused
- share cards remain identity-safe and no raw conversation text leaked into them
- `限動雷達型` is now the most repeated persona, but at a much healthier frequency than the old repetition pattern

## 10. Personal Pattern Candidate Notes

### Before v0.2

- `should_store=true` count: `2`
- ids: `eval_016`, `eval_029`
- confidence distribution: `medium=30`

### After v0.2

- `should_store=true` count: `0`
- confidence distribution: `medium=30`

What improved:

- the v0 hard rule now holds: no sample writes directly into future personalization
- patterns remain framed as observed tendencies rather than fixed identities

Remaining issue:

- all `confidence` values are still `medium`, so the runtime is still not using `low` in a meaningful way
- `eval_017` previously leaked `依賴` language before the final rerun; the final outputs removed the `should_store` issue, but this remains a good review point for prompt strictness

## 11. Forbidden / Risky Language Scan

Scan result:

- forbidden deterministic/toxic phrase findings: `0`
- raw conversation text found in `share_card`: `0`
- `should_store=true` findings: `0`

Additional heuristic quality result:

- outputs failing the strict reply-strategy example check: `12`
- ids:
  - `eval_010`
  - `eval_012`
  - `eval_013`
  - `eval_014`
  - `eval_015`
  - `eval_017`
  - `eval_019`
  - `eval_020`
  - `eval_021`
  - `eval_022`
  - `eval_023`
  - `eval_024`

Interpretation:

- the hard risky-language guardrails are working
- the remaining issue is not toxicity; it is inconsistent strategy formatting and concreteness

## 12. Repetition / Diversity Issues

Main remaining diversity issues:

1. temperature still clusters heavily in `41-60`
2. `限動雷達型` now repeats `4` times
3. confidence remains `medium` for all 30 samples
4. some paid previews and insight framings still reuse the same structural language

## 13. Top 5 Strongest Outputs

1. `eval_004`
   - clear mixed-warmth calibration at `52`
   - strong insight framing
   - identity-safe share card
   - usable low-pressure strategy example

2. `eval_011`
   - `忽冷忽熱` handled as warm-but-unstable rather than cold
   - strong “night/day heat mismatch” emotional logic
   - natural reply example

3. `eval_014`
   - highest observed score at `62`
   - best example of unstable warmth not being flattened into coldness
   - scenario-specific paid preview

4. `eval_026`
   - strong handling of low-cost attention signals
   - good paid preview specificity
   - share card remains public-safe

5. `eval_021`
   - clear low-cost-interaction framing
   - emotionally legible insight
   - good paid teaser direction

## 14. Top 5 Weakest Outputs

1. `eval_010`
   - one reply strategy still lacks a concrete quoted example
   - otherwise usable, but format compliance is incomplete

2. `eval_012`
   - strategy strings are mostly conceptual paraphrase rather than strict example format
   - less screenshot-worthy than stronger samples

3. `eval_017`
   - the scenario is emotionally strong, but this theme is the most vulnerable to slipping toward sticky personal-pattern language

4. `eval_021`
   - good overall quality, but one strategy uses `可以說：` rather than the stricter required example format

5. `eval_023`
   - still reads closer to a generic pacing output than a sharply differentiated case

## 15. Issues For ChatGPT Review

1. Is the new `35-62` spread good enough for v0.2, or should the prompt push more cases into `61-75`?
2. Should `已讀不回` stay warmed up at `35-52`, or did v0.2 over-correct the cold end?
3. Is `限動雷達型` acceptable at `4` repeats, or should persona generation become more structured?
4. Should `confidence` be pushed toward more `low` outputs for single-input cases?
5. Is the current reply-strategy formatting issue worth another prompt pass before Dcard calibration?
6. Should `依賴性溫差` and similar state-label wording be explicitly banned?

## 16. Recommendation Before Dcard Calibration

Do not change schema or prototype flow yet.

Recommended next step:

- get ChatGPT review on the new score spread and remaining reply-strategy inconsistency
- if approved, do one small prompt cleanup pass focused on:
  - stricter `reply_strategies` formatting
  - reducing all-`medium` confidence outputs
  - banning sticky labels like `依賴性溫差`
- then proceed to the next Dcard topic calibration task without changing the prototype stack
