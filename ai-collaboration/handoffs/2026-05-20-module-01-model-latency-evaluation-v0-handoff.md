# Handoff: Module 01 Model Latency Evaluation v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Evaluate Module 01 analyze latency on staging and compare whether a faster model option can reduce perceived wait time without hurting schema stability, Traditional Chinese tone, or paid-result quality.

The user has confirmed the v1.1 UI is broadly OK after real-phone review, but analyze waiting time still feels slightly long.

This task should measure and compare model/runtime options.

Do not switch the production/staging default model permanently in this task unless explicitly approved after results.

Do not change product prompt/schema unless a measurement blocker is found and documented.

## Background

Current status:

- ANYU Design System v1.1 is adopted and live on staging.
- `https://staging.anyu.tw` is accessible and serving the refreshed v1.1 design.
- Landing, result, paid preview, share, unlock, and contact UX are broadly acceptable.
- Remaining user concern: analyze wait feels a bit long.
- Current known model from previous QA: `claude-sonnet-4-20250514`.
- Existing runtime is environment-variable driven, with `ANTHROPIC_MODEL` configured in env.

The goal is to make a data-informed decision before production launch:

```text
Keep current model
or
try a faster model for Module 01
or
add UX/runtime mitigations without changing model
```

## Scope

Do:

1. Measure current staging analyze latency.
2. Add a safe local/staging model-evaluation harness if needed.
3. Compare current model with at least one faster candidate model if available/configured.
4. Evaluate schema validation success.
5. Evaluate output quality manually/heuristically against Module 01 product standards.
6. Document cost/speed/quality tradeoffs.
7. Recommend whether to keep current model, switch staging model for further QA, or defer.
8. Commit report and any safe tooling changes.
9. Push to `origin/staging`.

Do not:

- permanently change staging/production model default without explicit approval
- modify product prompt/schema content
- change DB schema
- change provider architecture broadly
- add auth/payment/portal/share PNG
- use real private user content
- commit secrets or raw provider outputs with sensitive content

## Candidate Models

Use the currently configured model as baseline:

```text
Baseline:
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

Evaluate a faster candidate only if available in the current provider/account and safe to configure.

Examples of faster class:

```text
Haiku-family / fast Anthropic model
```

Do not assume an unavailable model name.

If the exact faster model is not known, document the available model list or ask for explicit env/config value.

If testing a candidate requires changing `.env.local`, do not commit `.env.local`.

## Synthetic Evaluation Inputs

Use only synthetic inputs.

Use at least 5 cases:

```text
1. 他最近回訊息變慢，但還是會看我的限動。我不知道他是真的忙，還是已經沒那麼喜歡我了。

2. 我們前幾週每天聊天，但最近他變得很不主動。我問他週末要不要見面，他說再看看，之後就沒下文。

3. 他常常已讀不回，可是隔天又會突然丟一句很親密的話，讓我不知道要不要繼續投入。

4. 我傳了一段比較認真的訊息，他只回「哈哈真的」，但晚上還是有看我的限動。

5. 他說最近工作很忙，但我看到他還是會跟朋友出去。我不知道要不要再主動問一次。
```

Do not include real user/private content.

## Measurement Requirements

For each model/config tested, record:

```text
model
sample id
request start timestamp
request end timestamp
latency_ms
success / failure
provider error category if failed
JSON parse success
AJV/schema validation success
result score
score bucket
state label
persona
paid preview count
contact with forbidden language? yes/no
notes
```

Do not store raw input or full raw provider output in public reports.

Generated outputs may be stored only if synthetic and privacy-safe. Prefer summary over full JSON unless needed.

## Quality Review Criteria

Evaluate outputs for:

```text
1. Traditional Chinese fluency
2. warm / premium / gentle tone
3. not SaaS-like
4. not clinical therapy
5. not PUA
6. no deterministic rejection/diagnosis
7. useful observed signals
8. score feels calibrated
9. paid-preview reply strategies are concrete
10. share text is emotionally resonant
11. JSON/schema stability
```

Create a simple rating:

```text
quality_rating:
- pass
- borderline
- fail
```

And note why.

## Runtime / Tooling

Preferred approach:

- Use existing runtime helpers if they can be called safely.
- If needed, create a script under:

```text
apps/web/scripts/evaluate-model-latency.ts
```

or a repo-level script if consistent with current structure.

The script should:

- read model candidate from CLI arg or env override
- call the same analyze/runtime path as production where practical
- avoid writing to production DB unless explicitly intended
- avoid committing secrets
- write a sanitized report under `outputs/` only if that path is already safely ignored or explicitly intended
- produce a summarized markdown report for `ai-collaboration/research`

If using the live API route against staging instead of direct runtime, ensure it uses synthetic input and does not leak secrets.

## DB / Event Safety

If testing through the real staging analyze API, it may create rows in staging DB.

That is acceptable only with synthetic inputs.

Document:

```text
test rows created: yes/no
branch/environment: staging
cleanup needed: yes/no
```

Do not paste raw DB rows.

## Possible Outcomes

### Outcome A: Current model is acceptable

If baseline median latency is acceptable after UX polish, recommend keeping current model.

### Outcome B: Faster model is clearly better and quality passes

If faster model materially improves latency and passes schema/tone/quality checks, recommend a separate handoff:

```text
Module 01 Staging Model Switch Trial v0
```

That task would change staging env/model only, then rerun QA.

### Outcome C: Faster model is lower quality

Recommend keeping current model and improve waiting UX / streaming / queue feedback later.

### Outcome D: Provider/runtime bottleneck is not model

If latency is mostly deployment, DB, cold start, or network, document bottleneck and recommend runtime optimization instead.

## Optional Investigation

If easy, inspect whether latency is caused by:

```text
Vercel cold start
provider call duration
JSON validation/parsing
DB insert/read
client navigation/render
```

Do not overbuild tracing.

Simple timestamp logging in evaluation script is enough.

## Required Output

Create:

```text
ai-collaboration/research/2026-05-20-module-01-model-latency-evaluation-v0.md
```

Required sections:

```markdown
# Module 01 Model Latency Evaluation v0

## 1. Summary

## 2. Baseline Model

## 3. Candidate Model(s)

## 4. Method

## 5. Synthetic Inputs

## 6. Latency Results

## 7. Schema Validation Results

## 8. Quality Review

## 9. Runtime Bottleneck Notes

## 10. Cost / Risk Notes

## 11. Recommendation

## 12. Follow-up Task
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-module-01-model-latency-evaluation-v0-execution-report.md
```

Report structure:

```markdown
# Module 01 Model Latency Evaluation v0 Execution Report

## Summary

## Files Created

## Files Updated

## Models Evaluated

## Measurement Method

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
- baseline model
- candidate model(s)
- summary latency result
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

If scripts are added, ensure they compile/typecheck.

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
major runtime rewrite
```

Do not modify:

```text
product prompt/schema content
DB schema
provider architecture
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
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "chore: evaluate module 01 model latency"
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

- baseline model tested
- candidate model(s) tested
- measurement method
- latency summary
- schema validation result
- quality summary
- recommendation
- whether any model/env was changed
- report path
- validation results
- commit hash
- staging push status
- exact next step

Then stop.
