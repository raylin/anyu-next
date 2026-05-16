# Product Validation Calibration v0 Review Bundle

## 1. Overview

This bundle reviews a 30-sample synthetic evaluation set for the current `曖昧溫度計` Product Runtime Track.

Scope:

- 30 synthetic Traditional Chinese inputs across the 3 current primary situation types
- live product-runtime generation through `oradar/product_runtime.py`
- schema validation and lightweight safety/risk scanning
- no Dcard collection
- no prototype-flow changes

Core goal:

- test whether the current product runtime is stable enough for broader validation before formal technical stack selection

## 2. Evaluation Set Summary

Synthetic input count:

- `30`

Situation-type distribution:

- `已讀不回`: `10`
- `忽冷忽熱`: `10`
- `回訊變慢但看限動`: `10`

Input design notes:

- all inputs are Traditional Chinese
- all inputs are synthetic
- all inputs are 2-5 sentence Dcard/Threads-style relationship posts
- no real names, phone numbers, addresses, usernames, or personally identifying details were used

Raw set paths:

- `outputs/product_eval/raw/eval_001.txt` to `eval_030.txt`
- `outputs/product_eval/raw/eval_manifest.json`

## 3. Generation Status

Live generation performed:

- `yes`

Provider:

- `anthropic`

Model:

- `claude-sonnet-4-20250514`

Generation totals:

- manifest count: `30`
- generated outputs: `30`
- failures: `0`

Generated output path:

- `outputs/product_eval/generated/`

Summary path:

- `outputs/product_eval/generated/eval_generation_summary.json`

## 4. Temperature Score Distribution

Observed range:

- min: `25`
- max: `55`
- average: `44.2`

Bucket distribution:

- `0-20`: `0`
- `21-40`: `10`
- `41-60`: `20`
- `61-80`: `0`
- `81-100`: `0`

Interpretation:

- the runtime avoids extreme scores, which is safer than overclaiming
- the distribution is still narrow for a 30-sample set
- no synthetic case crossed `60`, so the warm end of the scale is still underused

## 5. State Label Distribution

Top repeated state labels:

| State Label | Count | Sample IDs |
| --- | ---: | --- |
| `降溫觀望` | 7 | `eval_001`, `eval_003`, `eval_004`, `eval_005`, `eval_006`, `eval_009`, `eval_024` |
| `忽冷忽熱` | 5 | `eval_012`, `eval_013`, `eval_017`, `eval_018`, `eval_019` |
| `低溫保留` | 4 | `eval_008`, `eval_021`, `eval_029`, `eval_030` |
| `主動性下降` | 3 | `eval_002`, `eval_022`, `eval_027` |

Long-tail labels appeared once each:

- `降溫保留`
- `冷處理觀望`
- `深夜熱聊白天降溫`
- `夜晚升溫白天降溫`
- `線上熱線下冷`
- `拉扯循環`
- `溫度不穩`
- `行為差距觀望`
- `低成本互動`
- `維持距離觀望`
- `訊號混雜`

Interpretation:

- label variety exists
- but the runtime still collapses many uncertain scenarios into a small set of cooling/holding labels

## 6. Situation Type Breakdown

| Situation Type | Count | Temperature Min | Temperature Max | Temperature Avg | Notes |
| --- | ---: | ---: | ---: | ---: | --- |
| `已讀不回` | 10 | 25 | 42 | 33.1 | lowest overall band, but still compressed |
| `忽冷忽熱` | 10 | 52 | 55 | 52.3 | very tight cluster, almost no internal spread |
| `回訊變慢但看限動` | 10 | 35 | 52 | 47.1 | moderate spread, but several outputs converge on `低溫保留` |

Interpretation:

- the 3 current primary situation types are still expressive enough for v0
- the runtime clearly distinguishes `已讀不回` from the warmer mixed-signal categories
- `忽冷忽熱` is currently too compressed and needs more internal variation

## 7. Paid Preview Quality Notes

What worked:

- most paid previews feel action-oriented rather than “more analysis”
- many previews correctly promise:
  - what not to do now
  - how to test投入度 without lowering oneself
  - concrete next-step guidance

Representative stronger examples:

- `eval_005`: `直接試探後的沉默最難處理，解鎖後你會知道：現在最不該做的一件事、三種不失控回法，以及怎麼化解已讀不回的尷尬。`
- `eval_014`: `這種「時差型曖昧」最容易讓人搞不清楚該用什麼態度回應。解鎖後看到完整應對策略。`
- `eval_021`: `解鎖後你會看到：怎麼分辨他是真的關注還是只是習慣，三種不失控測試他投入度的方式，以及現在最容易搞砸的一個動作。`

Issues:

- some previews repeat the exact same template too often
- a few copies drift toward a salesy tone, for example `黃金處理時間` in `eval_003`
- the best previews are specific to the scenario; the weaker ones sound like a reusable generic CTA block

## 8. Insight Layer Quality Notes

What worked:

- most insight layers are emotionally resonant
- most avoid academic language and sound closer to a smart friend than a textbook
- the better ones explain why the user feels stuck, not just what the other person did

Representative stronger examples:

- `eval_014`: `夜晚勇敢，白天理智`
- `eval_010`: `沉默中的期待循環`
- `eval_016`: `拉扯節奏裡的心理距離`

Issues:

- several insights reuse the same “模糊 / 節奏 / 距離” framing
- some explanations still sound a bit diagnostic or too systematized for a lightweight surface experience
- the product philosophy is largely preserved, but the “mysterious and fun” layer is still subtler than the “pattern explanation” layer

## 9. Share Card Quality Notes

Safety result:

- no raw conversation text leaked into `share_card`
- no forbidden humiliating or exposing phrases were detected

Repetition issue:

- `微訊號觀察家` appears `8` times
- `溫差觀察員` appears `3` times

Representative stronger examples:

- `eval_014`: `時差曖昧觀察家` / `有些人的心意藏在夜晚，理智藏在白天。`
- `eval_005`: `直接試探型` / `有些問題問出口，答案就在沉默裡。`
- `eval_029`: `限動觀察家` / `有些關注不是沒有，只是換了方式存在。`

Interpretation:

- share cards are identity-safe enough for public posting
- persona diversity still needs work, especially in the mixed-signal and low-cost-interaction cases

## 10. Personal Pattern Candidate Notes

Positive:

- no forbidden diagnostic language was flagged
- no obviously toxic or personality-labeling output was detected
- `should_store` stayed `false` for `28/30` samples

Main issue:

- `should_store` became `true` in `2` samples:
  - `eval_016`
  - `eval_029`

Why these matter:

- `eval_016` describes being pulled by the other person’s interaction rhythm
- `eval_029` describes shifting to indirect testing through story posting

These are not catastrophic failures, but they are exactly the edge cases where v0 policy was supposed to stay conservative.

## 11. Forbidden / Risky Language Scan

Forbidden/risky scan result:

- detected forbidden deterministic/toxic phrases: `0`
- detected risky personal-pattern diagnostic terms: `0`
- outputs with heuristic quality flags: `0`

Scanned phrases and close variants included:

- `他一定不喜歡你`
- `他就是不愛你`
- `他是渣男`
- `你就是備胎`
- `你應該分手`
- `他一定在騙你`
- `創傷`
- `焦慮型依附`
- `心理疾病`
- `診斷`
- `操控`
- `PUA`

Interpretation:

- the current prompt is successfully suppressing the most obvious toxic or deterministic output patterns

## 12. Repetition / Diversity Issues

Main repetition issues:

1. Temperature values cluster heavily:
   - `已讀不回` mostly `25-35`
   - `忽冷忽熱` mostly `52-55`
   - no output above `55`

2. State labels still collapse:
   - `降溫觀望`
   - `忽冷忽熱`
   - `低溫保留`

3. Share-card personas repeat too often:
   - `微訊號觀察家` appears in `eval_001`, `eval_002`, `eval_008`, `eval_021`, `eval_025`, `eval_026`, `eval_028`, `eval_030`

4. Paid preview structure often reuses nearly identical phrasing, even when the scenario details differ.

## 13. Top 5 Strongest Outputs

These were selected for specificity, resonance, and scenario-fit rather than highest score.

1. `eval_014` — `半夜曖昧白天普通`
   - strong state label: `夜晚升溫白天降溫`
   - distinctive share persona
   - insight/premium preview match the exact pattern well

2. `eval_005` — `不知道要不要追問`
   - lowest temperature scenario feels appropriately urgent
   - paid preview is concrete and action-worthy
   - share card is identity-safe but still emotionally sharp

3. `eval_016` — `拉開時對方又靠近`
   - strong concept framing with `拉扯循環`
   - reply-strategy framing is non-manipulative and useful
   - held back only by `should_store=true`

4. `eval_010` — `假裝沒事但很在意`
   - insight layer captures the emotional state cleanly
   - output feels human without sounding clinical

5. `eval_021` — `每則限動都看`
   - paid preview is scenario-specific and immediately useful
   - low-cost attention logic is well explained
   - held back by repetitive persona choice

## 14. Top 5 Weakest Outputs

These were selected for repetition, conservative-range compression, or storage-policy drift.

1. `eval_029` — `頻繁發限動測試`
   - `should_store=true` is too aggressive for v0
   - pattern logic is useful, but storage policy should still be more conservative

2. `eval_016` — `拉開時對方又靠近`
   - also flips `should_store=true`
   - otherwise strong, which makes the storage-policy miss more visible

3. `eval_001` — `已讀不回但發限動`
   - safe and competent, but falls into the most repeated persona/output pattern cluster

4. `eval_021` — `每則限動都看`
   - solid explanation, but repeats the dominant `微訊號觀察家` persona and a familiar temperature band

5. `eval_030` — `不知道是否該停止主動`
   - readable and safe, but very close to other `低溫保留 + 微訊號觀察家` outputs

## 15. Issues For ChatGPT Review

1. Temperature calibration is still too compressed, especially for `忽冷忽熱`, which barely spreads beyond `52-55`.
2. Share-card persona diversity remains weak, with `微訊號觀察家` overused.
3. `personal_pattern_candidate.should_store` still flips to `true` in 2 synthetic cases where v0 may still want to stay conservative.
4. Some paid-preview copy is excellent, but too many outputs reuse the same conversion phrasing.
5. The runtime is safe and stable, but still more “careful and pattern-explaining” than “lightweight, fun, and mysterious.”

## 16. Recommendation Before Dcard Calibration

Recommendation:

- keep the current product prompt and schema unchanged for now
- use this eval set as the pre-Dcard baseline
- review three issues before any prompt revision:
  - temperature-range compression
  - share-card persona repetition
  - `should_store=true` edge cases

Why:

- the runtime is stable enough to evaluate on broader real-world topics
- no forbidden/toxic language issue forced an immediate prompt rollback
- the remaining issues look like calibration problems, not architecture blockers

Dcard collection status:

- no Dcard data was collected in this task
- only the calibration folder, template, and schema were prepared
