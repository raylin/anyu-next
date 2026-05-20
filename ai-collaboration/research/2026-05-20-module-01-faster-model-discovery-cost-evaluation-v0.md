# Module 01 Faster Model Discovery + Cost Evaluation v0

## 1. Summary

The current Anthropic account does have newer faster models available. The most relevant findings are:

- `claude-haiku-4-5-20251001` is available and materially faster/cheaper than the current baseline, but it failed JSON integrity on 1 of 5 synthetic cases.
- `claude-sonnet-4-6` is available, but it is slower and more expensive than the current baseline `claude-sonnet-4-20250514`.
- The safest current recommendation is still to keep the existing staging model for now and only run a separate staging model-switch trial if we decide the Haiku reliability tradeoff is acceptable.

## 2. Source Docs Referenced

- Anthropic Models Overview: https://platform.claude.com/docs/en/about-claude/models/overview
- Anthropic Pricing: https://platform.claude.com/docs/en/about-claude/pricing

Relevant official doc points used here:

- models overview lists:
  - `claude-sonnet-4-6`
  - `claude-haiku-4-5-20251001`
  - alias `claude-haiku-4-5`
- pricing page lists:
  - Sonnet 4.6: `$3 / input MTok`, `$15 / output MTok`
  - Haiku 4.5: `$1 / input MTok`, `$5 / output MTok`
  - prompt caching rates: 5m write `1.25x`, 1h write `2x`, cache read `0.1x` of base input pricing

## 3. Available Models Found

Account-visible Anthropic Models API results included:

- `claude-opus-4-7`
- `claude-sonnet-4-6`
- `claude-opus-4-6`
- `claude-opus-4-5-20251101`
- `claude-haiku-4-5-20251001`
- `claude-sonnet-4-5-20250929`
- `claude-opus-4-1-20250805`
- `claude-opus-4-20250514`
- `claude-sonnet-4-20250514`

Important note:

- the docs mention alias `claude-haiku-4-5`
- the account-visible Models API list returned the pinned dated ID `claude-haiku-4-5-20251001`
- evaluation used the dated ID that the account explicitly exposed

## 4. Models Evaluated

- baseline: `claude-sonnet-4-20250514`
- newer Sonnet candidate: `claude-sonnet-4-6`
- fastest available Haiku candidate: `claude-haiku-4-5-20251001`

## 5. Method

- reused `apps/web/scripts/evaluate-model-latency.mjs`
- added:
  - Anthropic Models API discovery
  - live token-usage capture
  - per-request cost estimation
- evaluated the same 5 synthetic Module 01 cases for each model
- validated:
  - JSON parse
  - AJV/schema success
  - quality heuristics

No runtime env defaults, staging model settings, prompt text, or schema content were changed.

## 6. Latency Results

### Current baseline: `claude-sonnet-4-20250514`

- success: `5/5`
- median latency: `27,096 ms`
- average latency: `26,562.8 ms`

### Newer Sonnet: `claude-sonnet-4-6`

- success: `5/5`
- median latency: `36,151 ms`
- average latency: `36,651 ms`

### Faster Haiku: `claude-haiku-4-5-20251001`

- success: `4/5`
- median latency: `20,174 ms`
- average latency across successful cases: `19,559.25 ms`
- one failed case: JSON parse failure due to truncated / unterminated JSON output

### Practical comparison

- Haiku 4.5 is about `6.9s` faster than the current baseline on median latency
- Sonnet 4.6 is about `9.1s` slower than the current baseline on median latency

## 7. Token Usage Results

Average successful token usage:

### `claude-sonnet-4-20250514`

- input tokens: `5,108.8`
- output tokens: `1,469.6`
- cache read input tokens: `0`
- cache creation input tokens: `0`

### `claude-sonnet-4-6`

- input tokens: `5,106.8`
- output tokens: `1,860.4`
- cache read input tokens: `0`
- cache creation input tokens: `0`

### `claude-haiku-4-5-20251001`

- input tokens: `5,109.75`
- output tokens: `1,951.5`
- cache read input tokens: `0`
- cache creation input tokens: `0`

Interpretation:

- input token load is almost identical across all three models because the prompt structure is unchanged
- Haiku and Sonnet 4.6 both tended to produce longer outputs than the current baseline

## 8. Cost Per 1,000 Analyses

Using measured average tokens and official Anthropic pricing:

### `claude-sonnet-4-20250514`

- average cost per request: `$0.03737`
- estimated cost per 1,000 analyses: `$37.37`

### `claude-sonnet-4-6`

- average cost per request: `$0.043226`
- estimated cost per 1,000 analyses: `$43.226`

### `claude-haiku-4-5-20251001`

- average cost per request: `$0.014867`
- estimated cost per 1,000 analyses: `$14.867`

### Cost interpretation

- Haiku 4.5 is about `60%` cheaper than the current baseline
- Sonnet 4.6 is about `15.7%` more expensive than the current baseline

## 9. Schema Validation Results

- `claude-sonnet-4-20250514`: `5/5` JSON parse success, `5/5` AJV/schema success
- `claude-sonnet-4-6`: `5/5` JSON parse success, `5/5` AJV/schema success
- `claude-haiku-4-5-20251001`: `4/5` JSON parse success, `4/5` AJV/schema success, `1/5` failed with unterminated JSON

This is the main reason not to switch immediately to Haiku for live staging traffic yet.

## 10. Quality Review

### `claude-sonnet-4-20250514`

- quality counts: `4 pass`, `1 borderline`, `0 fail`
- overall tone: warm, premium, and stable
- paid preview shape: reliable
- strongest advantage: schema stability and consistent product voice

### `claude-sonnet-4-6`

- quality counts: `4 pass`, `1 borderline`, `0 fail`
- tone: still premium and gentle
- downside: slower and pricier than the current baseline without a clear quality gain

### `claude-haiku-4-5-20251001`

- quality counts across successful outputs: `4 pass`, `0 borderline`, `0 fail`
- tone on successful cases: acceptable, not obviously SaaS-like, and still emotionally usable
- downside: one hard JSON-integrity failure

### Practical quality conclusion

- Haiku 4.5 is promising on cost and speed
- Haiku 4.5 is not yet reliable enough to replace the baseline without a guarded staging switch trial or stronger JSON-repair/output constraints
- Sonnet 4.6 does not currently justify switching because it is slower and more expensive while offering no clear product-quality win

## 11. Prompt Caching / Batch Notes

Prompt caching is worth considering later because the prompt body is large and mostly static.

High-level impact:

- current average input tokens are about `5.1k` per request
- no cache read/write tokens were observed because caching is not implemented in this evaluator path
- if the large static prompt region becomes cacheable, the input-cost component could drop significantly on repeated analyses

However:

- output tokens remain a large share of total cost
- prompt caching does not solve the provider-dominant latency problem by itself
- Batch API discounts are not a fit for the current interactive UX

## 12. Recommendation

Recommendation:

- keep the current default model for now
- do not switch staging or production defaults in this task
- do not move to Sonnet 4.6
- consider a separate guarded staging switch trial for Haiku 4.5 only if we are willing to accept or mitigate JSON stability risk

Most defensible next options:

1. keep current Sonnet baseline and improve UX further
2. run a controlled staging trial of `claude-haiku-4-5-20251001` with extra parse/retry safeguards
3. investigate lightweight output-repair / retry behavior before any Haiku switch

## 13. Proposed Next Step

`Module 01 Haiku Staging Trial Decision v0`
