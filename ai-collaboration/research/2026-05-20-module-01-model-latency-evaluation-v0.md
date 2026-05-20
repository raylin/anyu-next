# Module 01 Model Latency Evaluation v0

## 1. Summary

The current Module 01 baseline model is still `claude-sonnet-4-20250514`.

Measured result:

- direct provider path median latency was about `27.96s` across 5 synthetic inputs
- schema validation succeeded on all 5 baseline samples
- a faster Anthropic Haiku-class candidate was not available on the current account under the tested model names

Conclusion:

- current wait time looks primarily model-bound, not mainly caused by local validation/parsing overhead
- there is not enough evidence to switch models now because no accessible faster candidate passed the availability check
- the safest recommendation is to keep the current staging model for now and treat latency mitigation as a UX/runtime problem until an actually available faster model can be trialed

## 2. Baseline Model

- provider: `anthropic`
- baseline model: `claude-sonnet-4-20250514`
- env source: `apps/web/.env.local`
- no env values were changed in this task

## 3. Candidate Model(s)

Tested candidate probes:

- `claude-3-5-haiku-latest`
- `claude-3-5-haiku-20241022`

Result:

- both returned `not_found_error`
- no faster Anthropic candidate is currently confirmed as accessible on this account/config

## 4. Method

Two measurement paths were used:

1. Direct provider harness

- added `apps/web/scripts/evaluate-model-latency.mjs`
- uses the same prompt template and schema assets as production:
  - `apps/web/src/lib/ai/assets/product_result_prompt_v0.md`
  - `apps/web/src/lib/ai/assets/product_result_schema_v0.json`
- validates JSON with AJV
- records latency, parse/schema success, score, bucket, state label, persona, and a lightweight quality summary
- uses only synthetic inputs
- does not write to the app DB

2. Staging route/API spot checks

- used authenticated `vercel curl` against protected staging
- confirmed live analyze still succeeds on staging with synthetic input
- confirmed runtime result route, unlock intent, and contact submit still work
- synthetic staging test rows were created: yes
- branch/environment: staging / Vercel preview alias
- cleanup needed: no immediate cleanup required because only synthetic inputs were used

Important measurement note:

- non-interactive `vercel curl` shell timing was inconsistent for bulk latency capture and did not reliably surface the JSON body in scripted subprocess mode
- because of that, the direct provider harness is the trustworthy latency baseline
- staging timing observations are included only as directional evidence, not as the primary benchmark dataset

## 5. Synthetic Inputs

1. 他最近回訊息變慢，但還是會看我的限動。我不知道他是真的忙，還是已經沒那麼喜歡我了。
2. 我們前幾週每天聊天，但最近他變得很不主動。我問他週末要不要見面，他說再看看，之後就沒下文。
3. 他常常已讀不回，可是隔天又會突然丟一句很親密的話，讓我不知道要不要繼續投入。
4. 我傳了一段比較認真的訊息，他只回「哈哈真的」，但晚上還是有看我的限動。
5. 他說最近工作很忙，但我看到他還是會跟朋友出去。我不知道要不要再主動問一次。

## 6. Latency Results

### Baseline direct-provider results

| Sample | Model | Latency ms | JSON parse | AJV schema | Score | Bucket | State label |
| --- | --- | ---: | --- | --- | ---: | --- | --- |
| case_01 | claude-sonnet-4-20250514 | 29,394 | pass | pass | 52 | warm | 低頻保留 |
| case_02 | claude-sonnet-4-20250514 | 23,298 | pass | pass | 42 | cool | 主動性下降 |
| case_03 | claude-sonnet-4-20250514 | 27,957 | pass | pass | 58 | warm | 忽冷忽熱 |
| case_04 | claude-sonnet-4-20250514 | 28,468 | pass | pass | 52 | warm | 低溫保留 |
| case_05 | claude-sonnet-4-20250514 | 24,985 | pass | pass | 48 | cool | 訊號混雜 |

Summary:

- success rate: `5/5`
- median latency: `27,957 ms`
- observed range: `23,298–29,394 ms`

### Candidate availability probe results

| Candidate | Result |
| --- | --- |
| `claude-3-5-haiku-latest` | `not_found_error` |
| `claude-3-5-haiku-20241022` | `not_found_error` |

### Staging route timing notes

- authenticated live staging analyze still succeeds
- one earlier successful staging analyze in this repo workflow took roughly half a minute end-to-end before redirect JSON returned
- a later non-interactive shell-timed `vercel curl` sample reported `14.45s`, but that path did not reliably surface the response body and is treated as noisy CLI behavior rather than a clean benchmark

Practical takeaway:

- direct provider time alone is already high enough to explain the user’s wait-time concern
- the biggest latency driver appears to be the model call itself, not AJV parsing or UI rendering

## 7. Schema Validation Results

Baseline Sonnet:

- JSON parse success: `5/5`
- AJV/schema validation success: `5/5`
- provider/runtime parse failures: `0/5`

Candidate models:

- not evaluated for schema quality because both failed at model availability resolution

## 8. Quality Review

### Review criteria

- Traditional Chinese fluency
- warm / premium / gentle tone
- no SaaS-like or clinical drift
- no deterministic rejection/diagnosis
- useful observed signals
- score plausibility
- paid-result usefulness direction
- share-sentence resonance

### Baseline qualitative summary

Baseline Sonnet output was broadly usable.

Strengths:

- Traditional Chinese tone was natural
- outputs stayed gentle rather than clinical
- no explicit deterministic rejection language was detected by the heuristic guard
- state labels and persona naming remained product-usable
- share sentences were emotionally coherent

Weak points:

- some one-sentence reads skewed slightly blunter than ideal, especially when implying lower priority
- paid-result richness was not deeply reviewed in full raw form in this report because the evaluator stores summaries only
- several outputs feel more “correct and stable” than especially vivid or premium

Quality ratings:

- baseline overall: `pass`, with a mild `borderline` tone risk on a minority of samples
- candidate models: unavailable, so no quality pass/fail judgment

## 9. Runtime Bottleneck Notes

Most evidence points to model latency as the main bottleneck:

- direct provider median is already about `28s`
- schema parsing and AJV validation are trivial compared with that
- UI/client navigation is not likely the dominant factor

Possible remaining overhead sources:

- Vercel protected route overhead
- Neon writes and result persistence
- server cold start

But even if those were optimized, the baseline model call is still long enough to keep wait perception noticeable.

## 10. Cost / Risk Notes

- no faster candidate is currently proven available on this account
- switching staging blindly to an unverified model name would create outage risk rather than speed gain
- current baseline is schema-stable, which is valuable for launch readiness
- introducing a different provider or broader runtime change would be out of scope for this task

## 11. Recommendation

Recommendation:

`Keep current model for now and do not switch staging by default in this task.`

Rationale:

- baseline Sonnet is slow but stable
- no accessible Haiku-class candidate was found under the tested model names
- there is no evidence yet that a safe faster replacement is available on this account

Secondary recommendation:

- if the team wants to pursue speed, do it as a dedicated staging env trial only after confirming a valid faster model name/account entitlement
- otherwise invest in wait-state UX and/or runtime instrumentation before changing model behavior

## 12. Follow-up Task

`Module 01 Staging Model Switch Trial v0`

Only run that if:

- the exact faster model name is confirmed as available on the Anthropic account
- staging env can be changed safely
- the same synthetic regression set is rerun for schema/tone review
