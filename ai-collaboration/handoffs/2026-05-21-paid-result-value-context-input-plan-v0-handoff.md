# Handoff: Paid Result Value + Context Input Plan v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Plan the upgrade for Module 01 paid/unlocked result value before continuing LINE fulfillment production activation or ads/growth work.

This task should define what a paid/unlocked result must contain to feel worth NT$49, and how optional user context inputs should improve not just output length but output quality.

This is a product / prompt / schema planning task only.

Do not implement code.

Do not change prompt/schema code.

Do not change DB schema.

Do not change UI.

Do not change model strategy.

Do not change LINE fulfillment implementation.

Do not deploy production.

## Background

Current production/staging state:

```text
Module 01 production low-key launch: GO
UI polish: sealed
Result cache: live verified
Scheduled retention cleanup: live
Analyze request state / poll endpoint: live verified
LINE fulfillment MVP: implemented
LINE fulfillment staging short-code smoke: passed
LINE fulfillment hardening route-level staging smoke: passed
Production fulfillment activation: pending
```

User concern:

```text
The current full/unlocked analysis feels much shorter and less useful than expected.
If users eventually pay NT$49, they may feel disappointed or leave negative feedback if the paid result is not materially richer, more practical, and more personalized than the free result.
```

ChatGPT recommendation:

```text
Before production fulfillment activation / ads, upgrade the paid result value.
The paid result should feel like an actionable relationship response package, not just a longer free result.
```

Key product direction:

```text
Paid value should come from:
- more specific interpretation
- directly usable next messages
- situation-specific strategy
- 24/48-hour action plan
- context-aware reply tone
- a summary card users can keep/share
```

Also discussed:

```text
Adding optional quick context inputs can improve quality significantly.
They should become prompt variables / behavioral priors, not just raw text appended to the prompt.
```

## Scope

Do:

1. Audit current free vs unlocked/paid result value.
2. Define quantitative target difference between free and paid result.
3. Define paid result content contract.
4. Define optional user context inputs.
5. Define how user context maps to prompt variables / behavioral priors.
6. Define how context should affect paid reply strategies.
7. Define schema changes needed later.
8. Define prompt strategy changes needed later.
9. Define cache-key implications.
10. Define UI implications.
11. Define cost/latency impact.
12. Define validation criteria for “worth NT$49”.
13. Create planning report, execution report, summary log.
14. Commit and push to `origin/staging`.

Do not:

- implement prompt/schema
- implement UI chips
- change analyze route
- change cache code
- change LINE fulfillment
- change database
- change model/provider
- change production
- run provider calls
- start ads

## Required Planning Report

Create:

```text
ai-collaboration/research/2026-05-21-paid-result-value-context-input-plan-v0.md
```

Required sections:

```markdown
# Paid Result Value + Context Input Plan v0

Date: 2026-05-21

## 1. Summary

## 2. Current Concern

## 3. Current Free vs Unlocked Result Assessment

## 4. Quantitative Paid Result Target

## 5. Proposed Paid Result Content Contract

## 6. Optional Context Inputs

## 7. Context-to-Prompt Mapping

## 8. Lightweight Behavioral / Psychological Priors

## 9. Paid Result Schema Proposal

## 10. Cache Key Implications

## 11. UI Implications

## 12. Cost / Latency Impact

## 13. Validation Criteria for NT$49 Value

## 14. Risks / Safety / Legal Notes

## 15. Implementation Sequence Recommendation

## 16. What Not To Build Yet

## 17. Open Questions

## 18. Recommended Next Step
```

## Current Result Assessment

Assess current unlocked result roughly as:

```text
Current unlocked result appears closer to a free-result extension than a paid-quality deliverable.
It likely needs more structured, directly usable, personalized content before NT$49.
```

If inspecting current code/schema gives actual structure, document it.

Do not run real provider calls.

## Quantitative Paid Result Target

Define expected upgrade target.

Recommended baseline:

```text
Current unlocked result:
- approximately 500–900 Chinese characters
- 2–3 main sections
- 0–1 copyable reply sets
- limited branching/action plan

Target paid result:
- approximately 1,800–2,800 Chinese characters
- 7–9 structured sections
- at least 3 reply strategies
- 6–9 copyable messages total
- 3 possible other-person states
- 3 signal deep dives
- 24/48-hour action plan
- summary card
```

Clarify these are planning estimates and should be adjusted after implementation.

## Paid Result Content Contract

Recommend paid result should include at least:

```text
1. Full interpretation summary
2. Three possible other-person states
3. Three signal deep dives
4. Three reply strategies
5. Follow-up if they reply A/B/C
6. Next 24/48-hour action plan
7. What to avoid doing
8. Soft insight
9. Summary card
```

Paid result should feel like:

```text
A practical response package.
```

Not:

```text
A longer soothing essay.
```

## Optional Context Inputs

Recommend optional quick inputs, not a long form.

Primary textarea remains required.

Add optional chips / quick context:

### 1. User goal

```text
他是不是還有興趣
我要不要主動
我該怎麼回
我是不是想太多
這段要不要退一步
```

### 2. Relationship stage

```text
剛認識
曖昧中
見過幾次
曾經很熱，最近變淡
朋友以上但沒說破
已經交往但有距離
```

### 3. Primary pain / blocker

```text
回覆變慢
有互動但不約
會曖昧但不明說
忽冷忽熱
講到未來就閃
我不敢問太清楚
```

### 4. Desired reply tone

```text
溫柔試探
輕鬆像聊天
直接一點
有界線但不冷
給對方台階
```

Design principle:

```text
Optional context should improve paid result specificity but not block analysis if skipped.
```

## Context-to-Prompt Mapping

Do not just append chips as text.

Plan mapping to structured variables:

```json
{
  "relationshipStage": "...",
  "userGoal": "...",
  "primaryPain": "...",
  "replyTone": "..."
}
```

Then convert into prompt instructions, for example:

```text
使用者目前在曖昧中，主要想知道下一句怎麼回。
讓他卡住的是對方回覆變慢。
付費回覆策略請偏向「有界線但不冷」。
避免過度鼓勵追問，也不要直接建議冷處理。
```

## Lightweight Behavioral / Psychological Priors

Use internal mapping only; do not make UI sound clinical.

Examples:

### User goal → intervention type

```text
他是不是還有興趣 → signal interpretation
我該怎麼回 → communication strategy
我是不是想太多 → reassurance + observation plan
這段要不要退一步 → boundary + pacing plan
我要不要主動 → low-pressure action plan
```

### Relationship stage → signal weighting

```text
剛認識 → slow reply has lower diagnostic weight
曖昧中 → continuity and initiative matter more
曾經很熱最近變淡 → change over time matters more than single behavior
已交往但有距離 → safety, commitment, and expectation mismatch matter more
```

### Primary pain → paid output template

```text
回覆變慢 → 48-hour observation + low-pressure temperature check
有互動但不約 → specific invite test + fallback
會曖昧但不明說 → low-pressure relationship definition line
忽冷忽熱 → stability reading + self-protection strategy
講到未來就閃 → commitment pressure framing
```

Keep language warm and mysterious, not textbook.

## Paid Result Schema Proposal

Recommend future schema like:

```ts
paidResult: {
  fullSummary: string;
  possibleStates: Array<{
    label: string;
    likelihood: "低" | "中" | "高";
    explanation: string;
    watchFor: string;
  }>;
  signalDeepDive: Array<{
    signal: string;
    meaning: string;
    overreadWarning: string;
  }>;
  replyStrategies: Array<{
    label: string;
    tone: string;
    copyableMessages: string[];
    whenToUse: string;
    possibleReaction: string;
    followUpIfTheyReply: string;
  }>;
  next48HourPlan: {
    doNow: string;
    waitFor: string;
    avoid: string;
  };
  avoidDoing: string[];
  softInsight: string;
  summaryCard: {
    oneLine: string;
    temperature: string;
    suggestedMove: string;
  };
}
```

Recommend future user context schema:

```ts
userContext: {
  relationshipStage?: string;
  userGoal?: string;
  primaryPain?: string;
  replyTone?: string;
}
```

Do not implement.

## Cache Key Implications

Because context changes output, future cache key must include:

```text
normalized input hash
relationshipStage
userGoal
primaryPain
replyTone
promptVersion
schemaVersion
modelStrategy
```

If context omitted, use stable empty/default values.

## Cost / Latency Impact

Estimate:

```text
Optional quick context inputs: +5% token cost or less.
Paid result expansion: output tokens likely 2x–3x.
Total per-analysis cost likely +30% to +100%, depending model/output length.
Latency likely increases modestly due to longer generation.
Result cache reduces repeat cost.
```

Recommend one-call architecture:

```text
Generate free + paid payload in one provider call.
Do not add second provider call after unlock in v0.
```

## Validation Criteria for NT$49 Value

Set pre-launch gate:

```text
Paid result must include:
- at least 3 reply strategies
- at least 6 copyable messages
- at least 3 possible states
- at least 3 signal deep dives
- a 24/48-hour action plan
- a summary card
- approximately 1,800+ Chinese characters
- no filler-heavy soothing text
```

Also require:

```text
At least 3 human-reviewed synthetic cases should feel worth unlocking.
Staging fulfillment unlocked page should show materially richer content than free result.
```

## Risks / Safety / Legal Notes

Avoid:

```text
relationship diagnosis
therapy/legal/safety advice
telling user to stay/leave
overclaiming mind-reading
manipulative reply tactics
```

Include safety style:

```text
If coercion, threats, or fear are present, prioritize trusted/professional support.
```

Keep it subtle; do not make product clinical.

## Implementation Sequence Recommendation

Recommend:

```text
1. Paid Result Prompt/Schema Upgrade v0
2. Paid Result UI/Unlocked Page Upgrade v0
3. Staging Content Value Review v0
4. Return to LINE fulfillment production activation
```

Decide whether context chips are included in first implementation or split:

Option A:

```text
Prompt/schema + context chips together
```

Option B:

```text
Prompt/schema first, context chips second
```

Recommend if feasible:

```text
Do prompt/schema + context chips together because context affects output quality and cache key.
```

## What Not To Build Yet

Do not build:

```text
personal insight graph
long-term profile memory
account system
real payment
portal
multi-module personalization
provider-assisted second call after payment
attachment/image analysis
complex psychometric scoring
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-paid-result-value-context-input-plan-v0-execution-report.md
```

Report structure:

```markdown
# Paid Result Value + Context Input Plan v0 Execution Report

## Summary

## Files Created

## Files Updated

## Planning Decisions

## Paid Result Target

## Context Input Recommendation

## Cost / Cache Implications

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
- paid result upgrade plan path
- recommended next step
- validation result
- commit hash
- staging push status

## Validation

Run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

This is docs/planning only, but validation should still pass.

No need to run Playwright unless app code changes, which should not happen.

## Constraints

Do not implement:

```text
prompt/schema changes
UI chips
cache key changes
DB schema changes
LINE fulfillment changes
production activation
real payment
email delivery
new LLM generation path
ads launch
model switch
queue/worker
SSE/websocket/token streaming
```

Do not modify:

```text
active production app code
product prompt/schema semantics
provider/model defaults
legal semantics
LINE funnel behavior
production ops behavior
design system direction
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
real contact values
raw private user content
font files
screenshots / test artifacts / videos / traces
raw sourced JSONL
private batch generated outputs
codes/tokens/tokenized URLs/LINE user IDs
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "docs: plan paid result value upgrade"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- plan path
- quantitative paid/free difference
- context input recommendation
- schema recommendation
- cost/cache implications
- validation results
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
