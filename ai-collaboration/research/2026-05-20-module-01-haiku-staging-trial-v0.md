# Module 01 Haiku Staging Trial v0

## 1. Summary

A guarded Haiku strategy was implemented for Module 01 and deployed to staging as a preview-only trial configuration:

- primary: `claude-haiku-4-5-20251001`
- retry once on invalid JSON/schema
- fallback: `claude-sonnet-4-20250514`

The code path worked for one confirmed live staging analyze sample. That sample persisted successfully to the Neon preview branch, validated through AJV, and recorded the expected safe strategy metadata on `analysis_completed`.

However, the full 5-sample protected-preview staging run did not complete. Repeated automated POST requests from this shell environment were intercepted by Vercel’s browser security checkpoint before the app route executed. Because of that, the trial did not meet the handoff’s required sample count and cannot be treated as a full staging pass.

Staging was reverted to `MODEL_STRATEGY=sonnet_default` at the end of this task. Production was not changed.

## 2. Strategy Tested

Runtime strategy name:

- `haiku_retry_sonnet_fallback`

Behavior implemented:

1. call Haiku primary
2. if invalid JSON/schema, retry Haiku once
3. if still invalid, fall back to Sonnet
4. if fallback fails, return the existing friendly analyze error

The runtime does not expose model names to the user.

## 3. Configuration

Preview branch `staging` was configured temporarily with:

- `MODEL_STRATEGY=haiku_retry_sonnet_fallback`
- `ANTHROPIC_FAST_MODEL=claude-haiku-4-5-20251001`
- `ANTHROPIC_FALLBACK_MODEL=claude-sonnet-4-20250514`

Existing preview envs remained in place:

- `ANTHROPIC_MODEL`
- `ANTHROPIC_API_KEY`
- `ORADAR_PROVIDER`
- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`

After the partial trial:

- `MODEL_STRATEGY` on preview branch `staging` was reverted to `sonnet_default`

The branch-scoped fast/fallback model vars remain present but inactive while staging uses the default strategy.

## 4. Method

Local work:

- added env-driven strategy support without changing prompt/schema content
- validated locally with compileall, lint, test, and build

Staging work:

- deployed a preview build with the guarded strategy code
- aliased `staging.anyu.tw` to that deployment
- attempted a 5-sample synthetic analyze run through protected preview
- verified the one confirmed successful sample directly in the Neon preview branch

Because protected-preview automation became unstable for repeated POST requests, the final staging assessment is based on:

- one confirmed live analyze request
- direct Neon preview-branch verification
- strategy metadata inspection
- privacy/event inspection

## 5. Synthetic Inputs

Intended staging trial set:

1. 他最近回訊息變慢，但還是會看我的限動。我不知道他是真的忙，還是已經沒那麼喜歡我了。
2. 我們前幾週每天聊天，但最近他變得很不主動。我問他週末要不要見面，他說再看看，之後就沒下文。
3. 他常常已讀不回，可是隔天又會突然丟一句很親密的話，讓我不知道要不要繼續投入。
4. 我傳了一段比較認真的訊息，他只回「哈哈真的」，但晚上還是有看我的限動。
5. 他說最近工作很忙，但我看到他還是會跟朋友出去。我不知道要不要再主動問一次。

Confirmed live sample that completed:

- sample equivalent to input `1`

## 6. Staging Trial Results

Confirmed live sample:

| Sample | Status | Result Route | Final Model | Retry Count | Fallback Used | Quality |
| --- | --- | --- | --- | ---: | --- | --- |
| `case_01` equivalent | success | app write path confirmed via DB; route redirect returned | `claude-haiku-4-5-20251001` | `0` | `false` | pass |

Attempted additional automated protected-preview POSTs:

- blocked by Vercel security checkpoint before route execution

Therefore:

- confirmed live sample count: `1`
- intended sample count: `5`
- full trial status: incomplete

## 7. Retry / Fallback Behavior

Confirmed live sample metadata:

- `modelStrategy`: `haiku_retry_sonnet_fallback`
- `primaryModel`: `claude-haiku-4-5-20251001`
- `finalModel`: `claude-haiku-4-5-20251001`
- `retryCount`: `0`
- `fallbackUsed`: `false`
- `schemaValidationPassed`: `true`

No retry or fallback was exercised in the one confirmed live sample.

## 8. Latency Results

Confirmed live sample from staging event metadata:

- `totalLatencyMs`: `21,606`
- `providerLatencyMs`: `18,178`
- `analysisRequestWriteLatencyMs`: `1,996`
- `analysisResultWriteLatencyMs`: `967`

Comparison to current Sonnet baseline:

- Sonnet baseline median from prior evaluation: `27,096 ms`
- confirmed Haiku staging sample total latency: `21,606 ms`

Directional read:

- the guarded Haiku path can be faster in the live route
- sample size is too small for a real staging latency conclusion

## 9. Cost Estimate

Directional estimate only.

Because the one confirmed live sample:

- used Haiku as final model
- did not retry
- did not fall back

its effective cost profile should be close to the prior guarded-Haiku evaluator estimate:

- about `$14.495 / 1,000` analyses

This remains meaningfully below the Sonnet baseline estimate:

- about `$37.37 / 1,000`

But the blended staging cost is not proven because:

- no retry path fired
- no fallback path fired
- no full 5-sample staging set completed

## 10. Schema Validation Results

Confirmed live sample:

- final schema validation: pass
- event metadata recorded `schemaValidationPassed: true`

The runtime strategy code preserves the existing AJV validator and only changes model-attempt selection.

## 11. Quality Review

Safe quality fields pulled from the confirmed live result:

- one-sentence read was fluent Traditional Chinese
- insight explanation stayed warm and observational
- paid preview remained concrete
- share sentence remained emotionally resonant

No forbidden phrases were found in the reviewed fields:

- no deterministic rejection claim
- no diagnosis language
- no PUA framing
- no “100%” certainty framing

Quality status for the one confirmed sample:

- `pass`

## 12. Privacy / Event Verification

Confirmed on the Neon preview branch for the live sample:

- `analysis_requests.raw_input_redacted` existed
- `analysis_requests.retention_expires_at` existed
- `analysis_results.retention_expires_at` existed
- `events.metadata_json` did not include raw input text
- `events.metadata_json` did not include contact values
- `analysis_completed` event included only safe strategy/timing metadata

Observed `analysis_completed.metadata_json` fields:

- `resultId`
- `timingMs`
- `finalModel`
- `retryCount`
- `fallbackUsed`
- `primaryModel`
- `privacyFlags`
- `modelStrategy`
- `schemaValidationPassed`

## 13. Recommendation

Do not move this guarded Haiku strategy toward production consideration yet.

Reason:

- the code path works
- one live staging sample succeeded cleanly
- but the required 5-sample protected-preview trial did not complete

The blocker is not prompt/schema or DB integrity. The blocker is staging automation reliability through Vercel’s protected-preview checkpoint from this shell environment.

Recommended stance now:

- keep production unchanged
- keep staging on `sonnet_default` for normal use
- preserve the guarded Haiku code path for a later controlled retry

## 14. Proposed Next Step

`Module 01 Haiku Authenticated Browser Trial v0`

That next pass should:

- use an authenticated interactive browser session instead of shell-only protected-preview calls
- run the intended 5-sample set
- verify result routes visually
- verify retry/fallback occurrence if any
- decide whether the guarded strategy is good enough for a broader staging soak
