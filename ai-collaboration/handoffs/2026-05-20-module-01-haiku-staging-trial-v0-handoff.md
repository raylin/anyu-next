# Handoff: Module 01 Haiku Staging Trial v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Run a guarded Haiku staging trial for Module 01 — 曖昧溫度計 — using Haiku 4.5 as the primary model with invalid-output retry and Sonnet fallback.

This task should validate whether a faster/lower-cost model strategy can work in the real staging route, not only in the offline evaluator.

This is a staging-only model strategy trial.

Do not change production model settings.

Do not change product prompt/schema content.

Do not change DB schema.

## Background

Module 01 Haiku Repair Trial v0 completed.

Results:

```text
Current Sonnet baseline:
claude-sonnet-4-20250514
median latency: 27.1s
estimated cost: about $37.37 / 1,000 analyses
schema: 5/5

Haiku 4.5 direct:
claude-haiku-4-5-20251001
direct reliability: 4/5
unsafe as clean drop-in

Haiku retry-on-invalid:
5/5 in the trial
median latency: 18.526s
estimated cost: about $14.495 / 1,000 analyses
but retry path did not actually trigger in the five-case run

Repair-on-invalid:
3/5
not recommended

Sonnet fallback:
5/5
fallback did not actually trigger in the five-case run
```

Recommendation from ChatGPT review:

```text
Do not switch directly to Haiku.
Run a staging-only guarded strategy:
Haiku primary
→ retry once on invalid JSON/schema
→ fallback to Sonnet if still invalid
```

## Scope

Do:

1. Add a staging-configurable model strategy for Module 01.
2. Support Haiku primary + retry-on-invalid + Sonnet fallback.
3. Keep current production default unchanged.
4. Configure staging to trial the guarded Haiku strategy only if safe and explicitly documented.
5. Run 5–10 synthetic staging analyze flows.
6. Verify:
   - latency
   - schema validation
   - fallback/retry metadata
   - result quality
   - DB persistence
   - event/privacy safety
7. Document results and recommendation.
8. Commit and push to `origin/staging`.

Do not:

- change production env/model
- remove Sonnet baseline support
- change prompt/schema content
- change DB schema
- add auth/payment/portal/share PNG
- use real private user content
- commit secrets
- dump raw DB rows

## Desired Strategy

Runtime strategy name:

```text
haiku_retry_sonnet_fallback
```

Behavior:

```text
1. Call primary model:
   claude-haiku-4-5-20251001

2. If output parses and AJV schema validation passes:
   use result

3. If JSON parse or AJV validation fails:
   retry once with the same Haiku model and same product prompt/input

4. If retry still fails:
   fallback to Sonnet:
   claude-sonnet-4-20250514

5. If fallback fails:
   return friendly analyze error
```

Do not use the repair-on-invalid strategy for staging runtime because the trial showed it was worse.

## Configuration

Prefer environment-variable strategy so production remains safe.

Suggested env vars:

```text
ANTHROPIC_MODEL=claude-sonnet-4-20250514
ANTHROPIC_FAST_MODEL=claude-haiku-4-5-20251001
ANTHROPIC_FALLBACK_MODEL=claude-sonnet-4-20250514
MODEL_STRATEGY=sonnet_default | haiku_retry_sonnet_fallback
```

Staging can use:

```text
MODEL_STRATEGY=haiku_retry_sonnet_fallback
ANTHROPIC_FAST_MODEL=claude-haiku-4-5-20251001
ANTHROPIC_FALLBACK_MODEL=claude-sonnet-4-20250514
```

Production should remain:

```text
MODEL_STRATEGY=sonnet_default
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

If env names differ, document actual names.

Do not commit `.env` files.

If changing Vercel staging env requires user action, document exact steps and do not fake completion.

## Runtime Metadata

Record safe model strategy metadata in `analysis_completed` event metadata or analysis result metadata.

Allowed fields:

```text
modelStrategy
primaryModel
finalModel
retryCount
fallbackUsed
providerLatencyMs
totalLatencyMs
schemaValidationPassed
```

Do not store:

```text
raw input
full provider output
full normalized result JSON in events
API keys
DATABASE_URL
contact values
```

## UI / Error Behavior

Do not expose model names to users.

If Haiku retry/fallback occurs, user should not see technical details.

If all attempts fail, show friendly message:

```text
分析暫時失敗，請晚點再試一次。
```

Loading UX should continue to work with current wait-state stages.

## Synthetic Staging Trial Inputs

Use only synthetic inputs.

Run at least 5, preferably 10 if cost/time is acceptable.

Base 5:

```text
1. 他最近回訊息變慢，但還是會看我的限動。我不知道他是真的忙，還是已經沒那麼喜歡我了。

2. 我們前幾週每天聊天，但最近他變得很不主動。我問他週末要不要見面，他說再看看，之後就沒下文。

3. 他常常已讀不回，可是隔天又會突然丟一句很親密的話，讓我不知道要不要繼續投入。

4. 我傳了一段比較認真的訊息，他只回「哈哈真的」，但晚上還是有看我的限動。

5. 他說最近工作很忙，但我看到他還是會跟朋友出去。我不知道要不要再主動問一次。
```

Optional variations:

```text
6. 他之前會主動問我吃飯了沒，最近只剩下按讚和看限動，我不知道是不是我太敏感。

7. 我們約過一次會，之後他回訊息變得很短，但偶爾又會丟曖昧貼圖。

8. 他說想慢慢來，但每次我退一點他又會靠近，讓我不知道該怎麼拿捏。

9. 他已讀我一整天，晚上卻回我限動，這算有興趣還是只是順手？

10. 我想問他是不是還想繼續聊，但怕一問就讓氣氛變尷尬。
```

## Staging Trial QA

For each staging analyze result, record:

```text
sample id
success/failure
result route loaded
primary model used
final model used
retry count
fallback used yes/no
total latency
provider latency
schema validation result
quality rating: pass / borderline / fail
notes
```

Do not paste full output.

## Quality Review

Evaluate:

```text
Traditional Chinese fluency
warm / premium / gentle tone
not clinical therapy
not PUA
no deterministic rejection/diagnosis
observed signals usefulness
score calibration
paid preview concreteness
share text emotional resonance
JSON/schema stability
```

Fail if any output includes forbidden/unsafe phrasing such as:

```text
他一定不喜歡你
你就是備胎
焦慮依附
心理疾病
你應該分手
PUA
操控
100% 準
```

## Acceptance Criteria

Recommend the guarded Haiku strategy for production consideration only if:

```text
staging final success rate >= 95% or 10/10 if only 10 samples
schema validation final pass = 100% in this trial
quality pass/borderline acceptable on all outputs
median latency materially below Sonnet baseline
fallback rate is low or acceptable
estimated blended cost remains meaningfully below Sonnet baseline
no privacy/event violations
```

If the trial only runs 5 samples:

```text
5/5 final success required
0 severe quality failures required
```

If criteria fail, recommend staying on Sonnet.

## Files Likely To Update

Possible files:

```text
apps/web/src/lib/ai/provider.ts
apps/web/src/lib/ai/runtime.ts
apps/web/src/app/api/modules/[moduleSlug]/analyze/route.ts
apps/web/src/tests/product-result-validation.test.ts
apps/web/src/tests/runtime-config-errors.test.ts
apps/web/src/tests/event-metadata.test.ts
apps/web/README.md
```

Only update what is necessary.

## Vercel Staging Env

If Codex has Vercel env access and it is safe:

- set staging/preview env to use guarded strategy
- redeploy staging
- run staging trial

If not:

- implement code support
- document exact env changes needed
- do not claim staging trial ran

Do not alter production env.

## Required Output

Create:

```text
ai-collaboration/research/2026-05-20-module-01-haiku-staging-trial-v0.md
```

Required sections:

```markdown
# Module 01 Haiku Staging Trial v0

## 1. Summary

## 2. Strategy Tested

## 3. Configuration

## 4. Method

## 5. Synthetic Inputs

## 6. Staging Trial Results

## 7. Retry / Fallback Behavior

## 8. Latency Results

## 9. Cost Estimate

## 10. Schema Validation Results

## 11. Quality Review

## 12. Privacy / Event Verification

## 13. Recommendation

## 14. Proposed Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-module-01-haiku-staging-trial-v0-execution-report.md
```

Report structure:

```markdown
# Module 01 Haiku Staging Trial v0 Execution Report

## Summary

## Files Created

## Files Updated

## Runtime Strategy Changes

## Staging Env / Deployment Status

## Trial Results Summary

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
- strategy tested
- staging trial status
- reliability result
- latency/cost result
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

If runtime code changes, validate after changes.

If staging env changes and deployment succeeds, run staging smoke/trial.

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
major runtime rewrite
```

Do not modify:

```text
product prompt/schema content
DB schema
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
git commit -m "feat: add guarded haiku staging strategy"
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

- strategy implemented/tested
- whether staging env/model was changed
- trial sample count
- final success rate
- retry count
- fallback count
- latency summary
- cost estimate
- quality summary
- recommendation
- whether production model changed
- report path
- validation results
- commit hash
- staging push status
- exact next step

Then stop.
