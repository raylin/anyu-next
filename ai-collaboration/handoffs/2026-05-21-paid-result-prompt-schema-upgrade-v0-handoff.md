# Handoff: Paid Result Prompt/Schema Upgrade v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Upgrade Module 01 paid/unlocked result value so the unlocked experience feels materially richer, more practical, and closer to a future NT$49 deliverable.

This task should implement the planned paid result schema/prompt upgrade and optional context chips together, because context directly affects paid output quality and cache behavior.

Primary goals:

```text
- paid result becomes a practical response package, not just a longer essay
- optional user context improves output specificity
- paid result includes copyable messages, possible states, signal deep dives, 24/48-hour plan, and summary card
- cache key includes context dimensions
- unlocked route displays richer persisted paid result
```

This is a product prompt/schema + UI integration task.

Do not activate LINE fulfillment in production.

Do not implement real payment.

Do not implement email delivery.

Do not implement ads.

Do not implement the landing/share title hierarchy polish in this task.

## Background

Paid Result Value + Context Input Plan v0 completed.

Key decisions:

```text
Current paid result is too thin for NT$49 perception.
Target paid result should be a practical response package.
Target length: roughly 1,800–2,800 Chinese characters.
Target structure: 7–9 sections.
Target content: 6–9 copyable messages, 3 possible states, 3 signal deep dives, 24/48-hour plan, summary card.
Optional context chips should map to structured prompt variables, not raw appended text.
```

Important follow-up already scheduled separately:

```text
Landing / Share Title Hierarchy Polish v0
- Primary title: 曖昧溫度計
- Subtitle: 他是真的忙，還是其實在冷掉？
```

Do not implement the title hierarchy change in this task.

LINE fulfillment status:

```text
MVP implemented.
Staging short-code smoke passed.
Hardening route-level staging smoke passed.
Production fulfillment activation remains blocked until paid result value is upgraded and reviewed.
```

## Scope

Do:

1. Review current Module 01 prompt/schema/result types.
2. Add optional userContext input fields.
3. Add UI context chips in the landing/input flow.
4. Map context chips into structured analyze payload.
5. Update prompt to use context variables as behavioral/communication priors.
6. Upgrade paidResult schema.
7. Bump prompt/schema/cache version as needed.
8. Include context dimensions in result cache key.
9. Persist richer paidResult payload.
10. Update unlocked result route to render richer paidResult.
11. Update paid preview to reflect richer locked value without over-disclosing.
12. Update tests.
13. Run local Playwright.
14. Create review bundle, execution report, summary log.
15. Commit and push to `origin/staging`.

Do not:

- activate production LINE fulfillment
- deploy production
- apply production migrations unless this task explicitly requires and is approved later
- implement real payment
- implement email delivery
- change LINE webhook/LIFF behavior
- start ads
- implement title hierarchy polish
- implement Module 02
- add second provider call after unlock
- change model strategy unless absolutely necessary and documented
- add account/profile system

## User Context Chips

Add optional quick context fields.

Primary textarea remains the only required input.

Context section copy suggestion:

```text
讓暗語更懂你的情境（可選）
```

### 1. User goal

Options:

```text
他是不是還有興趣
我要不要主動
我該怎麼回
我是不是想太多
這段要不要退一步
```

Internal field:

```ts
userGoal?: string
```

### 2. Relationship stage

Options:

```text
剛認識
曖昧中
見過幾次
曾經很熱，最近變淡
朋友以上但沒說破
已經交往但有距離
```

Internal field:

```ts
relationshipStage?: string
```

### 3. Primary pain / blocker

Options:

```text
回覆變慢
有互動但不約
會曖昧但不明說
忽冷忽熱
講到未來就閃
我不敢問太清楚
```

Internal field:

```ts
primaryPain?: string
```

### 4. Desired reply tone

Options:

```text
溫柔試探
輕鬆像聊天
直接一點
有界線但不冷
給對方台階
```

Internal field:

```ts
replyTone?: string
```

## Context Handling Rules

Context is optional.

If omitted:

```text
use stable empty/default values
do not block analyze
do not reduce result quality dramatically
```

Do not store raw private content beyond existing analysis request behavior.

Do not place context values into event metadata if not necessary.

If event metadata needs context status, use safe booleans/counts only, for example:

```text
contextProvided: true
contextFieldsCount: 3
```

## Context-to-Prompt Mapping

Do not append chips as raw text only.

Map into structured prompt instructions.

Example:

```text
使用者目前在「曖昧中」。
使用者主要想知道「我該怎麼回」。
讓使用者卡住的是「回覆變慢」。
付費回覆策略請偏向「有界線但不冷」。
避免過度鼓勵追問，也不要直接建議冷處理。
```

## Lightweight Behavioral / Psychological Priors

Use internally, but do not make UI clinical.

### User goal → intervention type

```text
他是不是還有興趣 → signal interpretation
我要不要主動 → low-pressure action plan
我該怎麼回 → communication strategy
我是不是想太多 → reassurance + observation plan
這段要不要退一步 → boundary + pacing plan
```

### Relationship stage → signal weighting

```text
剛認識 → slow reply has lower diagnostic weight
曖昧中 → continuity and initiative matter more
見過幾次 → concrete next-meet behavior matters more
曾經很熱，最近變淡 → change over time matters more than single behavior
朋友以上但沒說破 → ambiguity and risk of over-defining matter more
已經交往但有距離 → expectation mismatch and emotional safety matter more
```

### Primary pain → paid output focus

```text
回覆變慢 → 48-hour observation + low-pressure temperature check
有互動但不約 → specific invite test + fallback
會曖昧但不明說 → low-pressure relationship definition line
忽冷忽熱 → interaction stability reading + self-protection strategy
講到未來就閃 → commitment pressure framing
我不敢問太清楚 → gentle clarity script + self-soothing plan
```

### Reply tone → copyable message style

```text
溫柔試探 → soft, warm, low-pressure
輕鬆像聊天 → casual, short, playful
直接一點 → clear but not ultimatum-like
有界線但不冷 → respectful boundary, warm close
給對方台階 → leaves room for explanation, no blame
```

## Paid Result Schema Target

Implement a richer paidResult.

Recommended schema:

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

If current result schema uses different names, adapt while preserving intent.

Target output:

```text
3 possible states
3 signal deep dives
3 reply strategies
2–3 copyable messages per strategy
24/48-hour plan
summary card
```

## Free Result Boundary

Free result should remain useful but not contain the full actionable package.

Free result should keep:

```text
temperature / score
main signal cards
core insight
soft next-step tease
```

Paid result should add:

```text
deep interpretation
copyable replies
branching follow-up
action plan
summary card
```

Do not make free result feel gutted.

## Paid Preview / Locked UI

Update preview to better communicate value.

Preview should indicate locked sections such as:

```text
3 種下一句回法
對方可能的 3 種狀態
48 小時觀察策略
可收藏摘要卡
```

Do not reveal all paid content.

Keep no-real-payment / internal-test semantics.

## Unlocked Route

Update:

```text
/m/ambiguous-temperature/unlock/[unlockToken]
```

to render the richer paidResult.

Requirements:

```text
uses persisted paidResult only
does not call provider
renders useful complete analysis
handles old result schema gracefully if existing old results lack new paidResult fields
invalid/expired token still safe
```

Backward compatibility is important because old cached/results may exist.

## Analyze API / Payload

Update analyze payload to include:

```ts
userContext?: {
  relationshipStage?: string;
  userGoal?: string;
  primaryPain?: string;
  replyTone?: string;
}
```

Validate values against allowed options.

Reject or ignore unknown values safely.

Do not accept arbitrary long context text fields in v0.

## Cache Key Implications

Because context changes output, update cache key to include:

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

Use stable empty/default values when context omitted.

Bump cache key/version if needed.

Important:

```text
same text + different context should not return the same cached result
same text + same context should cache-hit
```

Add tests for this.

## Prompt / Schema Versioning

Bump prompt and/or schema version.

Document:

```text
old results may have thinner paidResult
new results use richer paidResult
```

If old cached results are within TTL, make sure cache version prevents old thin paid result from being reused for new schema.

## Cost / Latency

Do not switch model yet.

Expect:

```text
optional context cost: small
paidResult expansion: output tokens increase
total per-analysis cost likely +30% to +100%
latency may increase modestly
cache reduces repeat cost
```

If tests or local smoke show payload size too large, adjust target length but keep value structure.

## Safety / Legal

Avoid:

```text
relationship diagnosis
therapy/legal/safety advice
telling user to stay/leave
overclaiming mind-reading
manipulative tactics
```

Paid reply strategies should be:

```text
honest
low-pressure
non-coercive
respectful
not designed to manipulate
```

Include subtle safety handling if user mentions coercion/threat/fear.

## Tests

Add/update tests for:

```text
userContext validation
analyze payload accepts allowed context options
unknown context values rejected/ignored safely
cache key differs when context differs
cache hit works when context same
prompt/schema version changed
paidResult schema validates richer structure
paid result includes 3 possible states
paid result includes 3 signal deep dives
reply strategies include multiple copyable messages
next48HourPlan present
summaryCard present
old paid result fallback renders safely
unlocked route renders richer paid result
paid preview communicates value
event metadata does not include raw context values if not needed
local Playwright landing chips / analyze flow
```

## Staging Review

If implementation reaches staging automatically, run a staging synthetic analyze if safe.

At minimum, create a review bundle describing how to manually review:

```text
1. Run one analyze with context chips selected.
2. Unlock via staging flow.
3. Open unlocked page.
4. Check if paid result feels materially richer than free result.
5. Verify at least 3 reply strategies and 6 copyable messages.
6. Verify summary card and 24/48-hour plan.
```

Do not activate production fulfillment.

## Documentation Updates

Update as needed:

```text
apps/web/README.md
docs/operations/production-deployment-runbook.md
ai-collaboration/research/line/line-fulfillment-env-matrix.md only if fulfillment dependency changes
```

Also create review bundle.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-21-paid-result-prompt-schema-upgrade-v0-review-bundle.md
```

Required sections:

```markdown
# Paid Result Prompt/Schema Upgrade v0 Review Bundle

Date: 2026-05-21

## 1. Summary

## 2. Context Inputs Implemented

## 3. Context-to-Prompt Mapping

## 4. Paid Result Schema Changes

## 5. Prompt / Schema Versioning

## 6. Cache Key Changes

## 7. UI / Preview / Unlocked Route Changes

## 8. Safety / Legal Guardrails

## 9. Tests Added

## 10. Cost / Latency Notes

## 11. Staging Review Instructions

## 12. Known Limitations

## 13. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-paid-result-prompt-schema-upgrade-v0-execution-report.md
```

Report structure:

```markdown
# Paid Result Prompt/Schema Upgrade v0 Execution Report

## Summary

## Files Created

## Files Updated

## Context Inputs

## Prompt / Schema Changes

## Cache Changes

## UI / Unlocked Route Changes

## Tests Added

## Validation Results

## Staging Review Status

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
- context/prompt/schema summary
- validation result
- staging review status
- commit hash
- staging push status

## Validation

Run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
cd apps/web && corepack pnpm test:e2e:local
```

Do not skip Playwright because UI/input flow changes.

If schema/migration changes are introduced, document migration need and do not run production migration.

## Constraints

Do not implement:

```text
LINE production activation
production migration
real payment
email delivery
rich menu
broadcast
portal/account system
new second-call LLM generation
ads launch
model switch
queue/worker
SSE/websocket/token streaming
landing/share title hierarchy polish
Module 02
```

Do not modify:

```text
legal semantics
LINE production behavior
production ops behavior beyond docs
design system direction beyond local UI chips
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
LINE_LOGIN_CHANNEL_SECRET
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
git commit -m "feat: upgrade paid result value"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- context inputs implemented
- paidResult schema summary
- prompt/schema versioning
- cache key behavior
- UI/unlocked route changes
- tests added
- validation results
- staging review status
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
