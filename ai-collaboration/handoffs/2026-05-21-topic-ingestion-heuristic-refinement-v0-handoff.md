# Handoff: Topic Ingestion Heuristic Refinement v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Refine `tools/topic-ingestion/` heuristics based on the first local-only private batch dry run.

This task should improve real-world usefulness of the deterministic topic ingestion pipeline by reducing uncategorized output, improving ranking separation, and enforcing the intended source-weighting behavior:

```text
Dcard = primary product signal
PTT = secondary controversy / counter-signal
Mobile01 = reference-only signal
```

This is a deterministic tooling refinement task.

Do not add LLM/provider enrichment.

Do not implement sourcing/crawling.

Do not commit raw private batch inputs or generated private outputs.

Do not change app runtime, model, prompt/schema, DB schema, legal semantics, LINE flow, auth, payment, portal, production ops behavior, or product logic.

## Background

Topic Ingestion Private Batch Dry Run v0 completed.

Private batch dry-run results:

```text
Input records: 75
Source mix: 30 Dcard / 15 PTT / 30 Mobile01
Topic candidates: 11
Question seeds: 22
Module seeds: 11
Action spread: 1 build / 7 watch / 3 defer
Raw input / generated private outputs: not committed
.local/: gitignored
```

Observed issues:

```text
1. Uncategorized bucket remains too large.
2. Score saturation is too aggressive and reduces ranking separation.
3. Mobile01 remains somewhat influential at scale despite lower weighting.
4. Risk flags appear frequently and should affect action/ranking more clearly.
```

Current source weights:

```text
Dcard: 1.00
PTT: 0.70
Mobile01: 0.35
manual: 0.80
unknown: 0.50
```

This task should refine heuristics only.

## Scope

Do:

1. Review the private batch dry-run sanitized report.
2. Improve topic bucket coverage for real batch patterns.
3. Reduce uncategorized output using deterministic synthetic-fixture-backed rules.
4. Adjust scoring to reduce saturation and improve rank separation.
5. Strengthen Mobile01 reference-only behavior.
6. Make risk flags affect recommended action more clearly.
7. Add/update synthetic tests.
8. Update README/docs if behavior changes.
9. Create review bundle, execution report, summary log.
10. Commit and push to `origin/staging`.

Do not:

- use or commit the private raw batch
- commit generated private JSONL/Markdown outputs
- call provider/LLM
- fetch data
- implement crawlers
- change apps/web runtime
- change production behavior
- add machine-learning ranking
- overbuild a moderation system

## Source Inputs

Read:

```text
ai-collaboration/research/2026-05-21-topic-ingestion-private-batch-dry-run-v0.md
ai-collaboration/reports/2026-05-21-topic-ingestion-private-batch-dry-run-v0-execution-report.md
ai-collaboration/research/2026-05-21-topic-ingestion-real-input-calibration-v0-review-bundle.md
```

If paths differ, locate the latest relevant reports.

## Refinement Priority

### P0: Reduce uncategorized

Add deterministic bucket coverage for themes observed in the private batch.

Suggested new or improved buckets:

```text
dating_app_platform_comparison
dating_app_profile_strategy
real_world_meeting_chance
relationship_market_self_positioning
commitment_pressure
family_marriage_value_conflict
partner_boundary_and_miscommunication
appearance_vs_personality_debate
money_and_status_positioning
dating_app_scam_or_fake_account_anxiety
```

These should supplement existing buckets:

```text
dating_app_fatigue
dating_market_appearance_anxiety
offline_matchmaking_skepticism
profile_self_presentation
conversation_skill_gap
reply_time_control
relationship_boundary_conflict
marriage_labor_value_conflict
fortune_telling_as_relationship_tool
ai_dating_scam_fear
```

Do not overfit to exact private text. Use synthetic keywords and robust pattern groups.

### P1: Reduce score saturation

Current issue:

```text
Many candidates cluster near the score cap, making rank less useful.
```

Refine score formula so ranking has more gradient.

Guidance:

```text
base score should be moderate
source weight should influence but not dominate
engagement should use dampened/log-like scaling
evidence diversity should help
risk flags should penalize unsafe build recommendations
Mobile01-only candidates should be capped lower
```

Suggested scoring concepts:

```text
score = base
      + source_mix_score
      + dampened_engagement_score
      + evidence_diversity_score
      + topic_fit_score
      - risk_penalty
```

Keep final score bounded 0..1.

Avoid hard-capping too many records at the same value.

### P2: Strengthen Mobile01 reference-only behavior

Implement behavior:

```text
Mobile01-only topic should not easily become build.
```

Rules:

```text
If all supporting sources are Mobile01:
  recommendedAction should usually be watch or defer.
  score should have a reference-only cap unless topicFit is extremely strong.

If Mobile01 is reinforced by Dcard/PTT:
  allow normal ranking.
```

Document this clearly.

### P3: Risk flags influence action

Risk flags should not just appear in notes.

Guidance:

```text
high_toxicity
gender_polarized
body_shaming
adult_service_reference
appearance_discrimination
```

should push toward:

```text
watch
defer
or brand-safe reframing
```

Low-risk, actionable, brand-safe reframed topics should be more likely to be build.

Do not discard high-risk topics automatically; they can be useful watch signals.

## Brand-safe Reframing

Keep or improve deterministic reframing.

Examples:

```text
外貌焦慮 / 顏值市場 → 第一印象入場券 / 照片、自介、聊天節奏
交友軟體失望 → 交友軟體疲勞指數
逼婚 / 承諾壓力 → 關係承諾壓力計
AI 代聊 / 詐騙 → 這段互動是真人熱度，還是平台噪音？
```

Ensure generated module seeds are not misogynistic, misandrist, body-shaming, or adult-service-forward.

## Tests

Use synthetic fixtures only.

Add/update tests for:

```text
new buckets classify synthetic records
uncategorized reduced for representative synthetic examples
source weighting ranks Dcard above otherwise-similar PTT/Mobile01
Mobile01-only candidate does not become build by default
risk flags push recommendedAction away from build
score remains bounded 0..1
score distribution has separation for sample set
brand-safe reframing avoids toxic raw phrasing
review pack includes source mix and risk flags
```

Do not use private raw text.

## Optional Local Private Re-run

If the private batch still exists in `.local/topic-ingestion/private-batch/input.jsonl`, Codex may rerun the pipeline locally after changes.

Rules:

```text
- Do not commit private input.
- Do not commit generated private outputs.
- Report only aggregate/sanitized deltas:
  - uncategorized before/after if known
  - action spread before/after
  - top bucket counts
  - risk flag counts
  - score range/median if available
```

If the local private batch is unavailable, skip and document that synthetic tests were used.

## Files Likely To Update

Likely files:

```text
tools/topic-ingestion/README.md
tools/topic-ingestion/topic_ingestion/extractors.py
tools/topic-ingestion/topic_ingestion/transformers.py
tools/topic-ingestion/topic_ingestion/review.py
tools/topic-ingestion/topic_ingestion/risk.py
tools/topic-ingestion/topic_ingestion/schema.py
tools/topic-ingestion/tests/test_extractors.py
tools/topic-ingestion/tests/test_transformers.py
tools/topic-ingestion/tests/test_review.py
```

Only update files actually needed.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-21-topic-ingestion-heuristic-refinement-v0-review-bundle.md
```

Required sections:

```markdown
# Topic Ingestion Heuristic Refinement v0 Review Bundle

Date: 2026-05-21

## 1. Summary

## 2. Dry-run Findings Used

## 3. Bucket Coverage Changes

## 4. Scoring / Ranking Changes

## 5. Mobile01 Reference-only Behavior

## 6. Risk Flag Action Changes

## 7. Brand-safe Reframing Changes

## 8. Tests Added

## 9. Optional Private Batch Re-run Result

## 10. What Remains Out Of Scope

## 11. Validation Results

## 12. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-topic-ingestion-heuristic-refinement-v0-execution-report.md
```

Report structure:

```markdown
# Topic Ingestion Heuristic Refinement v0 Execution Report

## Summary

## Files Created

## Files Updated

## Bucket Changes

## Scoring Changes

## Source Weighting / Mobile01 Changes

## Risk / Reframe Changes

## Tests Added

## Validation Results

## Known Technical Debt

## Tech Debt Review

### New Technical Debt Introduced

### Existing Technical Debt Observed

### Opportunistic Cleanup Completed

### Deferred Cleanup Candidates

### Recommended Follow-up

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
- heuristic refinement summary
- validation result
- commit hash
- staging push status

## Validation

Run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
```

Always run app validation too:

```bash
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

No need to run Playwright unless app code changes, which should not happen.

## Constraints

Do not implement:

```text
Dcard crawler
Cloudflare workaround
browser automation
external sourcing integration
provider-assisted enrichment
runtime app changes
DB schema changes
model switch
async polling
streaming
ads launch
real payment
LINE API
LIFF
auth
portal
UI changes
```

Do not modify:

```text
active production app code
product prompt/schema
DB schema
provider/model
legal semantics
design system assets
LINE funnel behavior
production ops behavior
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
real contact values
raw private user content
font files
screenshots / test artifacts / videos / traces
raw sourced JSONL
private batch generated outputs
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "tools: refine topic ingestion heuristics"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files/test artifacts/raw JSONL are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- bucket changes
- scoring/ranking changes
- Mobile01 behavior changes
- risk/reframe changes
- private re-run aggregate result if done
- tests added
- validation results
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
