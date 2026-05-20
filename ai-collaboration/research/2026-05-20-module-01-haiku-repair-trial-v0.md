# Module 01 Haiku Repair Trial v0

Date: 2026-05-20

## 1. Summary

This trial evaluated whether Module 01 could safely move from the current Anthropic Sonnet baseline to a faster Haiku-class model by adding reliability guards instead of changing the prompt or schema.

Four strategies were tested against the same five synthetic inputs:

- `direct`
- `retry-on-invalid`
- `repair-on-invalid`
- `sonnet-fallback`

The current baseline model remained `claude-sonnet-4-20250514`. The Haiku candidate tested was `claude-haiku-4-5-20251001`.

The outcome is clear enough for a narrow decision:

- direct Haiku is still not safe enough
- repair-on-invalid is worse and should not be used
- retry-on-invalid is the most promising guard
- sonnet-fallback is directionally safe, but this run did not actually trigger fallback

## 2. Why This Trial Was Needed

The previous faster-model evaluation found that Haiku was materially faster and cheaper than Sonnet, but failed JSON integrity on `1/5` synthetic cases. That made it unsafe as a clean drop-in replacement.

This follow-up trial asked a narrower question:

Can a lightweight repair or retry strategy make Haiku reliable enough for a guarded staging trial without changing prompt content, schema contracts, or runtime architecture?

## 3. Strategies Tested

### A. `direct`

- one Haiku attempt
- no retry
- no repair
- no fallback

### B. `retry-on-invalid`

- one Haiku attempt
- if JSON parse or schema validation fails, retry Haiku once
- no repair prompt
- no Sonnet fallback

### C. `repair-on-invalid`

- one Haiku attempt
- if invalid, ask the same Haiku model to repair the output into valid schema-conforming JSON
- no retry
- no Sonnet fallback

### D. `sonnet-fallback`

- one Haiku attempt
- if invalid, retry Haiku once
- if still invalid, attempt Haiku repair
- if still invalid, fall back to `claude-sonnet-4-20250514`

## 4. Method

The evaluator reused the app’s current prompt/schema assets and AJV validation path. No prompt text, schema structure, model default, or staging env values were changed.

Evaluation inputs:

- the same five synthetic cases used in the prior latency/cost pass
- same output contract
- same AJV validation

Metrics captured:

- total latency
- primary model latency
- repair latency
- fallback latency
- JSON parse success
- schema validation success
- final success count
- token usage
- estimated cost
- quick qualitative review

## 5. Synthetic Inputs

The same five synthetic ambiguity cases were reused:

- `case_01`
- `case_02`
- `case_03`
- `case_04`
- `case_05`

This kept the comparison aligned with the prior Sonnet baseline and faster-model evaluation.

## 6. Latency Results

### Current Sonnet baseline from prior evaluation

- model: `claude-sonnet-4-20250514`
- success: `5/5`
- median latency: `27,096 ms`

### Strategy results

| Strategy | Final Success | Median Total Latency | Average Total Latency |
| --- | --- | ---: | ---: |
| direct | `4/5` | `18,887 ms` | `19,027.75 ms` |
| retry-on-invalid | `5/5` | `18,526 ms` | `18,610.2 ms` |
| repair-on-invalid | `3/5` | `20,308 ms` | `20,187 ms` |
| sonnet-fallback | `5/5` | `18,472 ms` | `18,054 ms` |

Observations:

- every Haiku-based strategy remained materially faster than the Sonnet baseline in this sample
- retry-on-invalid had the best practical balance of speed and reliability
- repair-on-invalid lost speed and still failed badly
- sonnet-fallback looked fastest in this run, but fallback never actually triggered

## 7. JSON / Schema Reliability Results

| Strategy | JSON / Schema Final Success | Notes |
| --- | --- | --- |
| direct | `4/5` | one parse failure remained |
| retry-on-invalid | `5/5` | all five completed validly |
| repair-on-invalid | `3/5` | two repair attempts still failed parse |
| sonnet-fallback | `5/5` | all five completed validly |

Important caveat:

- in the `retry-on-invalid` run, no actual retry path was triggered
- in the `sonnet-fallback` run, neither repair nor Sonnet fallback was triggered

That means:

- `retry-on-invalid` shows a clean `5/5` run, but not an exercised recovery path
- `sonnet-fallback` shows a clean `5/5` run, but not an exercised blended fallback path

By contrast, `repair-on-invalid` did exercise its recovery path and performed poorly.

## 8. Quality Review

### Sonnet baseline from prior evaluation

- `4` pass
- `1` borderline

### This trial

| Strategy | Pass | Borderline | Fail |
| --- | ---: | ---: | ---: |
| direct | `4` | `0` | `0` among successful outputs |
| retry-on-invalid | `5` | `0` | `0` |
| repair-on-invalid | `3` | `0` | `0` among successful outputs |
| sonnet-fallback | `5` | `0` | `0` |

Quality takeaways:

- successful Haiku outputs remained broadly usable for Module 01
- tone and Traditional Chinese were acceptable in the successful cases
- the main risk is structural reliability, not obviously qualitative collapse
- repair-on-invalid does not meaningfully improve quality and makes reliability worse

## 9. Cost Results

### Current Sonnet baseline from prior evaluation

- estimated cost per 1,000 analyses: `$37.37`

### Strategy results

| Strategy | Estimated Cost / 1,000 Analyses |
| --- | ---: |
| direct | `$14.499` |
| retry-on-invalid | `$14.495` |
| repair-on-invalid | `$15.215` |
| sonnet-fallback | `$14.346` |

Interpretation:

- all Haiku strategies remain dramatically cheaper than the Sonnet baseline
- repair-on-invalid is the least attractive guard because it increases cost without fixing reliability
- retry-on-invalid preserves the strongest cost advantage while meeting the trial’s final-success target in this sample

## 10. Blended Fallback Estimate

`sonnet-fallback` is still only a directional estimate in this run.

Why:

- no sample actually escalated to Sonnet
- no sample in that run even triggered the repair stage

So the observed `$14.346 / 1,000` is not a stressed blended fallback cost. It is effectively another clean Haiku-only run under the fallback-capable strategy wrapper.

Practical reading:

- the strategy shape is operationally safe
- the actual worst-case or mixed-case cost/latency profile is still unproven

## 11. Recommendation

### Direct recommendation

Do not switch Module 01 directly to raw Haiku.

Do not use `repair-on-invalid`.

If a staging Haiku trial is pursued, the safest narrow guard to try first is:

- `retry-on-invalid`

Optionally, a second-stage guarded trial can add:

- Sonnet fallback after retry failure

### Acceptance against handoff criteria

The handoff asked whether any repair/retry strategy can meet:

- `5/5` final success
- acceptable quality on all
- materially lower median latency than Sonnet baseline
- blended cost below `$25 / 1,000`

`retry-on-invalid` meets those criteria in this specific five-case run:

- success: `5/5`
- quality: acceptable on all five
- median latency: `18,526 ms` vs Sonnet `27,096 ms`
- estimated cost: `$14.495 / 1,000`

But the confidence level is still limited because the retry path did not actually fire in this run.

### Practical recommendation

Recommended decision:

- do not change staging default yet
- approve a tightly scoped Haiku staging trial only if it uses a retry guard, not repair
- treat Sonnet fallback as a secondary safety option, but not yet a proven blended strategy

## 12. Proposed Next Step

`Module 01 Haiku Staging Trial v0`

Scope of that trial should be narrow:

- feature-flag or env-only model switch in staging
- one automatic Haiku retry on invalid output
- no repair prompt path
- optional Sonnet fallback only if explicitly desired
- staging-only QA focused on:
  - real route success rate
  - latency perception
  - event timing shape
  - schema success rate
  - tone quality on live synthetic/manual test cases
