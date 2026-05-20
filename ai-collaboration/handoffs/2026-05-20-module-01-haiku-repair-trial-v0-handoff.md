# Handoff: Module 01 Haiku Repair Trial v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Evaluate whether `claude-haiku-4-5-20251001` can become a viable Module 01 staging candidate when protected by JSON repair / retry / fallback logic.

This task follows the Faster Available Model Discovery + Cost Evaluation v0 result:

- Haiku 4.5 is available on the current Anthropic account.
- Haiku 4.5 is materially faster and cheaper than the current Sonnet baseline.
- Haiku 4.5 had a 1/5 JSON integrity failure, so it is not a clean drop-in replacement yet.

This task should test reliability strategies.

Do not switch staging or production model defaults in this task.

Do not modify the product prompt/schema content unless a tiny repair-only wrapper is needed and clearly documented.

Do not change DB schema.

## Background

Model/cost evaluation result:

```text
Current baseline:
claude-sonnet-4-20250514
median latency: 27,096 ms
schema: 5/5
estimated cost: about $37.37 / 1,000 analyses

Sonnet 4.6:
claude-sonnet-4-6
median latency: 36,151 ms
schema: 5/5
estimated cost: about $43.226 / 1,000 analyses
decision: not suitable for this use case

Haiku 4.5:
claude-haiku-4-5-20251001
median latency: 20,174 ms
estimated cost: about $14.867 / 1,000 analyses
issue: JSON integrity failed on 1/5 synthetic cases
decision: promising but not safe as clean drop-in
```

Business implication:

If Haiku can be made reliable with retry/repair/fallback, it may reduce cost per 1,000 analyses by roughly 50–60% and improve latency.

## Scope

Do:

1. Extend the evaluator harness to test Haiku reliability strategies.
2. Test Haiku-only baseline again if needed.
3. Test at least one repair/retry strategy.
4. Optionally test Haiku primary + Sonnet fallback strategy.
5. Measure:
   - latency
   - schema validation
   - JSON integrity
   - token usage
   - estimated cost
   - quality
6. Recommend whether to run a staging model switch trial.
7. Commit tooling/report changes and push to `origin/staging`.

Do not:

- change staging/production env model defaults
- switch live API route to Haiku
- change DB schema
- add auth/payment/portal/share PNG
- use real private user content
- commit secrets
- commit raw provider output with sensitive content

## Strategies To Evaluate

Use the existing evaluator script:

```text
apps/web/scripts/evaluate-model-latency.mjs
```

Extend it if needed.

### Strategy A: Haiku direct

Model:

```text
claude-haiku-4-5-20251001
```

Purpose:

- Reconfirm baseline Haiku failure rate and speed.

### Strategy B: Haiku retry once with same prompt

If JSON parse or AJV validation fails:

```text
retry once with same model and same prompt
```

Purpose:

- See whether failure is stochastic and can be solved by one retry.

### Strategy C: Haiku repair prompt

If JSON parse fails but output is close to JSON:

```text
call Haiku again with a repair-only instruction:
"Return only valid JSON matching the required schema. Do not add explanation. Repair the previous output into valid JSON."
```

Important:

- Do not include raw private user content.
- Use only synthetic output in evaluator context.
- Keep repair prompt local to evaluator or future runtime utility; do not alter the main product prompt.

Purpose:

- Test whether cheap repair can recover malformed JSON.

### Strategy D: Haiku primary + Sonnet fallback

If Haiku fails after repair/retry:

```text
fallback to claude-sonnet-4-20250514
```

Purpose:

- Estimate production-safe blended latency and blended cost.

This is evaluation only. Do not enable in staging route yet.

## Synthetic Inputs

Use the same 5 synthetic cases:

```text
1. 他最近回訊息變慢，但還是會看我的限動。我不知道他是真的忙，還是已經沒那麼喜歡我了。

2. 我們前幾週每天聊天，但最近他變得很不主動。我問他週末要不要見面，他說再看看，之後就沒下文。

3. 他常常已讀不回，可是隔天又會突然丟一句很親密的話，讓我不知道要不要繼續投入。

4. 我傳了一段比較認真的訊息，他只回「哈哈真的」，但晚上還是有看我的限動。

5. 他說最近工作很忙，但我看到他還是會跟朋友出去。我不知道要不要再主動問一次。
```

Optional: run 10 total samples if evaluator time/cost is acceptable by duplicating with slight synthetic variations.

Do not use real/private content.

## Measurement Requirements

For each strategy and sample, record:

```text
strategy
model sequence used
sample id
total_latency_ms
primary_model_latency_ms
repair_latency_ms if any
fallback_latency_ms if any
success/failure
JSON parse success
AJV/schema validation success
input_tokens
output_tokens
repair tokens if any
fallback tokens if any
estimated_cost_usd
estimated_cost_per_1000
score
score_bucket
state_label
persona
paid preview count
quality_rating: pass / borderline / fail
notes
```

Do not paste full raw provider output into reports.

## Acceptance Criteria For Haiku Candidate

Haiku strategy can be recommended for staging switch trial only if:

```text
schema/AJV success >= 95% after retry/repair/fallback
quality pass or borderline acceptable on all tested samples
median latency materially below current Sonnet baseline
estimated blended cost < $25 / 1,000 analyses
no forbidden deterministic/toxic/PUA/clinical language
paid preview remains concrete and useful
```

If only 5 samples are used:

- 5/5 final success is required.
- Any failure means do not recommend switch yet.

## Quality Review Criteria

Evaluate output quality for:

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

Use simple rating:

```text
pass
borderline
fail
```

## Cost Calculation

Use actual token usage where available.

Report:

```text
cost per request
cost per 1,000 analyses
blended cost if repair/fallback occurs
```

Compare to:

```text
Sonnet baseline: about $37.37 / 1,000
Haiku direct previous estimate: about $14.867 / 1,000
```

## Tooling Notes

If extending evaluator script, keep it narrow:

```text
apps/web/scripts/evaluate-model-latency.mjs
```

Suggested new CLI options:

```bash
node scripts/evaluate-model-latency.mjs --model claude-haiku-4-5-20251001 --strategy direct
node scripts/evaluate-model-latency.mjs --model claude-haiku-4-5-20251001 --strategy retry-on-invalid
node scripts/evaluate-model-latency.mjs --model claude-haiku-4-5-20251001 --strategy repair-on-invalid
node scripts/evaluate-model-latency.mjs --model claude-haiku-4-5-20251001 --strategy sonnet-fallback
```

Actual option names can differ; document them.

Do not require DATABASE_URL for direct provider evaluation.

Do not commit `.env.local`.

## Required Output

Create:

```text
ai-collaboration/research/2026-05-20-module-01-haiku-repair-trial-v0.md
```

Required sections:

```markdown
# Module 01 Haiku Repair Trial v0

## 1. Summary

## 2. Why This Trial Was Needed

## 3. Strategies Tested

## 4. Method

## 5. Synthetic Inputs

## 6. Latency Results

## 7. JSON / Schema Reliability Results

## 8. Quality Review

## 9. Cost Results

## 10. Blended Fallback Estimate

## 11. Recommendation

## 12. Proposed Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-module-01-haiku-repair-trial-v0-execution-report.md
```

Report structure:

```markdown
# Module 01 Haiku Repair Trial v0 Execution Report

## Summary

## Files Created

## Files Updated

## Strategies Tested

## Results Summary

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
- strategies tested
- final reliability result
- cost/latency recommendation
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

If evaluator script changes, run at least one smoke command successfully.

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
production model switch
staging model switch
major runtime rewrite
```

Do not modify:

```text
product prompt/schema content
DB schema
provider architecture outside evaluator/repair trial helper
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
git commit -m "chore: evaluate haiku repair strategy"
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

- strategies tested
- final JSON/schema reliability
- latency summary
- cost summary
- quality summary
- recommendation
- whether any model/env/runtime default was changed
- report path
- validation results
- commit hash
- staging push status
- exact next step

Then stop.
