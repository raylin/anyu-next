# Handoff: Module 01 Faster Available Model Discovery + Cost Evaluation v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Discover which faster Claude models are actually available to the current Anthropic account/API key, evaluate latency and quality for Module 01, and estimate API cost per 1,000 analyses.

This task follows the staging timing verification result that Module 01 latency is provider-dominant.

Do not switch staging or production model defaults in this task.

Do not modify product prompt/schema.

Do not change runtime architecture except for small safe tooling needed for discovery/evaluation.

## Background

Module 01 Staging Timing Verification v0 found provider-dominant latency:

```text
Sample 1:
total 27,972ms
provider 24,688ms

Sample 2:
total 26,347ms
provider 23,931ms
```

Earlier model-latency evaluation tested two older Haiku-class names:

```text
claude-3-5-haiku-latest
claude-3-5-haiku-20241022
```

Both returned `not_found_error`.

Current Anthropic docs list newer model names such as:

```text
Claude Sonnet 4.6:
claude-sonnet-4-6

Claude Haiku 4.5:
claude-haiku-4-5-20251001
alias: claude-haiku-4-5
```

Official docs to reference:

```text
https://platform.claude.com/docs/en/about-claude/models/overview
https://platform.claude.com/docs/en/about-claude/pricing
```

The user also wants cost estimates per 1,000 analyses / traffic.

## Scope

Do:

1. Query the Anthropic Models API or otherwise confirm available model IDs for the current account.
2. Identify candidate faster models that are actually available.
3. Evaluate at least:
   - current baseline model
   - fastest available Haiku-class candidate, if available
   - optional newer Sonnet candidate if available
4. Measure latency on the same synthetic cases.
5. Record token usage:
   - input_tokens
   - output_tokens
   - cache_read_input_tokens, if any
   - cache_creation_input_tokens, if any
6. Estimate cost per 1,000 analyses using actual measured token usage where possible.
7. Compare:
   - latency
   - schema validation
   - Traditional Chinese tone
   - premium/gentle product quality
   - paid preview usefulness
   - cost per 1,000
8. Recommend:
   - keep current model
   - run staging model switch trial
   - implement prompt caching
   - reduce output token budget
   - defer model switch

Do not:

- permanently change env defaults
- switch staging model without explicit approval
- change prompt/schema content
- use real private content
- commit secrets
- commit raw provider outputs with sensitive content

## Required Model Discovery

Use the official Models API if possible.

Goal:

```text
List available Anthropic model IDs for current API key/account.
```

Document only model IDs and relevant capabilities/pricing class.

Do not print API key.

If the Models API call fails, document the failure and continue with known candidate names from docs.

Known current docs candidates to check:

```text
claude-sonnet-4-6
claude-haiku-4-5-20251001
claude-haiku-4-5
```

Baseline:

```text
current configured model, likely claude-sonnet-4-20250514
```

## Pricing Reference

Use official Anthropic pricing docs.

As of the current docs:

```text
Claude Opus 4.7:
$5 / input MTok
$25 / output MTok

Claude Sonnet 4.6:
$3 / input MTok
$15 / output MTok

Claude Haiku 4.5:
$1 / input MTok
$5 / output MTok
```

Also consider prompt caching:

```text
5-minute cache write: 1.25x base input price
1-hour cache write: 2x base input price
cache read: 0.1x base input price
```

Batch API has 50% discount, but it is likely not suitable for live interactive analysis unless future async flow is introduced.

## Synthetic Inputs

Use the same 5 synthetic cases from the earlier evaluation.

```text
1. 他最近回訊息變慢，但還是會看我的限動。我不知道他是真的忙，還是已經沒那麼喜歡我了。

2. 我們前幾週每天聊天，但最近他變得很不主動。我問他週末要不要見面，他說再看看，之後就沒下文。

3. 他常常已讀不回，可是隔天又會突然丟一句很親密的話，讓我不知道要不要繼續投入。

4. 我傳了一段比較認真的訊息，他只回「哈哈真的」，但晚上還是有看我的限動。

5. 他說最近工作很忙，但我看到他還是會跟朋友出去。我不知道要不要再主動問一次。
```

Do not use real/private content.

## Measurement Requirements

For each model and sample, record:

```text
model
sample id
latency_ms
success/failure
error type if failed
JSON parse success
AJV/schema validation success
input_tokens
output_tokens
cache_read_input_tokens if any
cache_creation_input_tokens if any
estimated_cost_usd
score
score_bucket
state_label
persona
paid preview count
quality_rating: pass / borderline / fail
notes
```

Do not include full raw provider output in public reports.

Use sanitized summaries only.

## Cost Calculation

Use:

```text
cost_per_request =
(input_tokens / 1_000_000 * input_price_per_mtok)
+ (output_tokens / 1_000_000 * output_price_per_mtok)
+ cache-related costs if applicable
```

Then:

```text
cost_per_1000 = cost_per_request * 1000
```

If actual token usage is unavailable for a model, estimate using measured baseline token counts.

Include three cost scenarios if useful:

```text
low
typical
high
```

But prefer actual measured usage.

## Quality Criteria

Evaluate:

```text
Traditional Chinese fluency
warm / premium / gentle tone
not SaaS-like
not clinical therapy
not PUA
no deterministic rejection/diagnosis
observed signals usefulness
score calibration
paid preview concreteness
share text emotional resonance
schema stability
```

## Tooling

Reuse or extend:

```text
apps/web/scripts/evaluate-model-latency.mjs
```

Add cost output if it does not already exist.

Do not require DATABASE_URL for direct provider evaluation.

Do not commit `.env.local`.

If a script change is made, make sure it is safe and documented.

## Required Output

Create:

```text
ai-collaboration/research/2026-05-20-module-01-faster-model-discovery-cost-evaluation-v0.md
```

Required sections:

```markdown
# Module 01 Faster Model Discovery + Cost Evaluation v0

## 1. Summary

## 2. Source Docs Referenced

## 3. Available Models Found

## 4. Models Evaluated

## 5. Method

## 6. Latency Results

## 7. Token Usage Results

## 8. Cost Per 1,000 Analyses

## 9. Schema Validation Results

## 10. Quality Review

## 11. Prompt Caching / Batch Notes

## 12. Recommendation

## 13. Proposed Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-module-01-faster-model-discovery-cost-evaluation-v0-execution-report.md
```

Report structure:

```markdown
# Module 01 Faster Model Discovery + Cost Evaluation v0 Execution Report

## Summary

## Files Created

## Files Updated

## Models Discovered

## Models Evaluated

## Latency Summary

## Cost Summary

## Recommendation

## Validation Results

## Known Technical Debt

## Deviations From Handoff

## Git Commit

## Staging Push

## Remaining Uncertainties

## Recommended Next Step
```

## Summary Log

Append to:

```text
ai-collaboration/summaries/summary_log.md
```

Include:

- date
- task completed
- available faster model result
- cost per 1,000 summary
- recommendation
- report path
- validation result
- commit hash
- staging push status

## Validation

Always run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

If scripts changed, ensure they run against at least one configured model.

## Constraints

Do not implement:

```text
auth
real payment
portal
share PNG / OG generation
email sending
LINE integration
advanced PII
scheduled deletion job
model switch
major runtime rewrite
```

Do not modify:

```text
product prompt/schema content
DB schema
provider architecture except tiny evaluator tooling
legacy prototype behavior
Dcard scripts
design system v1.1
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
raw private user content
raw DB row dumps
full provider raw output
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "chore: evaluate faster models and cost"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if:

- validation failed
- unrelated uncommitted changes exist
- secrets are staged
- raw user content is staged
- report contains secrets or raw DB rows

If push is skipped or fails, report exact reason.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- source docs referenced
- available models found
- models evaluated
- latency summary
- cost per 1,000 summary
- schema validation summary
- quality summary
- recommendation
- whether any model/env was changed
- report path
- validation results
- commit hash
- staging push status
- exact next step

Then stop.
