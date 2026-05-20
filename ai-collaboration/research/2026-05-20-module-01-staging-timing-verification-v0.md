# Module 01 Staging Timing Verification v0

## 1. Summary

Staging timing verification passed. Two synthetic staging analyze flows completed successfully, both wrote safe timing metadata to the `analysis_completed` event, and the latency pattern is clearly provider-dominant rather than DB/runtime-dominant or cold-start-dominant.

## 2. Deployment Freshness

- `origin/staging` head at verification time: `3ea687f`
- `corepack pnpm dlx vercel inspect https://staging.anyu.tw` resolved staging to:
  - `https://anyu-next-828a4cmkd-studioanyu-1488s-projects.vercel.app`
  - target: `preview`
  - status: `Ready`
  - created: `2026-05-20 09:17:54 +0800`
- The live landing bundle also contained the new strings introduced in the wait-state instrumentation pass, confirming staging is serving commit `3ea687f` or newer.

## 3. Method

- authenticated protected-preview access via `corepack pnpm dlx vercel curl`
- live staging route fetches for landing, demo result, and real runtime result
- two synthetic analyze POST requests against staging
- Neon preview branch event/result verification using read-only SQL through the Neon MCP tools

## 4. Synthetic Inputs

Primary sample:

- `他最近回訊息變慢，但還是會看我的限動。我不知道他是真的忙，還是已經沒那麼喜歡我了。`

Second sample:

- `我們前幾週每天聊天，但最近他變得很不主動。我問他週末要不要見面，他說再看看，之後就沒下文。`

## 5. Staging Analyze Result

- landing route loaded successfully
- first synthetic analyze succeeded and returned a real `resultId`
- runtime result route for that `resultId` loaded successfully
- demo result route still loaded successfully
- second synthetic analyze also succeeded

Observed runtime result shell still included:

- temperature card
- observed signals
- insight copy
- share preview
- paid preview

## 6. Timing Metadata Found

The corresponding `analysis_completed` event metadata contained these keys:

- `resultId`
- `privacyFlags`
- `timingMs`

Inside `timingMs`, the live staging rows contained:

- `totalLatencyMs`
- `providerLatencyMs`
- `schemaValidationLatencyMs`
- `analysisResultWriteLatencyMs`
- `analysisRequestWriteLatencyMs`

## 7. Phase Timing Summary

Sample A:

- total latency: `27,972 ms`
- provider latency: `24,688 ms`
- schema validation latency: `83 ms`
- analysis request write latency: `2,024 ms`
- analysis result write latency: `704 ms`
- non-provider remainder: about `3,284 ms`

Sample B:

- total latency: `26,347 ms`
- provider latency: `23,931 ms`
- schema validation latency: `0 ms`
- analysis request write latency: `1,331 ms`
- analysis result write latency: `637 ms`
- non-provider remainder: about `2,416 ms`

## 8. Privacy Verification

Privacy verification passed.

Confirmed on the live `analysis_completed` event row:

- metadata keys were limited to `privacyFlags`, `resultId`, and `timingMs`
- no raw input key was present
- no `text`, `input`, or `conversation` key was present
- no email or LINE contact key was present
- no normalized result payload key was present
- no provider raw output key was present

Additional notes:

- only synthetic content was used in this verification pass
- no secrets were printed into the reports
- raw DB row dumps are not included in the report

## 9. Wait-State UX Verification

Direct frame-by-frame observation of the loading panel was not available from this shell environment, so wait-state verification used the next-best live check:

- the deployed landing JavaScript bundle contains the new elapsed-time wait-state messages
- the same bundle contains the `65_000ms` timeout constant

Confirmed live strings:

- `讀著你貼上的對話⋯`
- `訊號比較細，我們還在整理節奏與回應落差⋯`
- `這次讀得比較久，請再等一下；結果還在生成中。`
- `這次真的有點慢。你可以繼續等，或稍後重新試一次。`

So the new wait-state UX is live on staging, even though it was not observed interactively in a real browser session here.

## 10. Latency Source Classification

Classification: `provider-dominant`

Reasoning:

- Sample A provider share: about `88.3%` of total latency
- Sample B provider share: about `90.8%` of total latency
- A second request remained in the same overall latency band, so this does not look primarily like first-request cold-start overhead
- DB/runtime phases are measurable but much smaller than provider time

## 11. Issues Found

- No instrumentation bug was found.
- `vercel curl` requires URL-first argument order; the first attempt used the wrong order and did not reach the analyze route.
- Interactive browser observation of the loading-state transition is still not available from this shell environment.

## 12. Fixes Applied

- None in app code.
- Only the verification command usage was corrected during the task.

## 13. Recommendation

Keep the current model/runtime instrumentation as-is and treat the current latency profile as primarily model/provider time. If the wait still feels too long in human QA, the next improvement should focus on either:

- a confirmed faster available model trial, or
- richer trust-building wait-state UX

not DB/runtime refactoring.

## 14. Recommended Next Step

`Module 01 Faster Available Model Discovery Or Trial v0`
