# Handoff: Paid Result Prompt Safety / Value Refinement v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Refine Module 01 paid result v1 so it is safer, more consistent, and closer to monetization-ready before LINE fulfillment production activation.

This task should fix the issues found during `Paid Result Staging Value Review v0`:

```text
- one generated guardrail used a forbidden prompt phrase
- primary reviewed paid result was slightly below the rough 1,800+ Chinese character target
- forbidden paid-result substrings are currently prompt-only, not runtime-enforced
```

This is a narrow prompt/schema/runtime validation refinement task.

Do not implement landing/share title hierarchy polish in this task.

Do not activate LINE fulfillment in production.

Do not implement real payment, email delivery, ads, Module 02, or a second LLM call after unlock.

## Background

Paid Result Prompt/Schema Upgrade v0 completed.

Commit:

```text
b5de7f5
```

Paid Result Staging Value Review v0 completed.

Commits:

```text
bcc22d6
71026c0
```

What is now working:

```text
- optional context chips exist
- paidResult v1 exists
- prompt version product_result_prompt_v0.3
- schema version product_result_schema_v1
- cache v2 includes context dimensions
- schema v1 split into its own file
- version-aware schema resolver added
- paid preview copy updated
- unlocked route renders richer paid result
- same text/context cache works
- different context produces a different result
```

Remaining issues:

```text
- paid result v1 is materially better than free output, but not final monetization-ready
- one generated guardrail used a forbidden prompt phrase
- primary reviewed paid result was slightly under 1,800+ Chinese characters
- forbidden substrings are currently prompt-only, not runtime enforced
```

Important queued follow-up after paid result optimization:

```text
Landing / Share Title Hierarchy Polish v0
- Primary title: 曖昧溫度計
- Subtitle: 他是真的忙，還是其實在冷掉？
```

Do not implement that here.

## Scope

Do:

1. Review the paid-result staging value review report.
2. Refine prompt wording to avoid forbidden / overclaiming / clinical / manipulative phrasing.
3. Add or improve runtime semantic validation for paidResult v1.
4. Enforce minimum structural quality for paidResult v1.
5. Improve prompt/schema guidance for minimum paid content depth.
6. Ensure replyStrategies contain enough copyable messages.
7. Ensure next48HourPlan and summaryCard are concrete.
8. Add tests.
9. Run staging synthetic-safe review after fixes if feasible.
10. Create review bundle, execution report, summary log.
11. Commit and push to `origin/staging`.

Do not:

- change landing/share title hierarchy
- activate LINE fulfillment in production
- deploy production
- implement real payment
- implement email delivery
- start ads
- implement Module 02
- add second provider call after unlock
- switch model/provider
- do broad UI redesign
- change LINE webhook/LIFF behavior unless a test must be updated for safety metadata only

## Source Reports To Read

Read:

```text
ai-collaboration/research/2026-05-21-paid-result-staging-value-review-v0.md
ai-collaboration/reports/2026-05-21-paid-result-staging-value-review-v0-execution-report.md
ai-collaboration/research/2026-05-21-paid-result-prompt-schema-upgrade-v0-review-bundle.md
ai-collaboration/research/2026-05-21-paid-result-value-context-input-plan-v0.md
```

If paths differ, locate latest relevant artifacts.

## Prompt Safety Refinement

Refine prompt instructions so paid result avoids:

```text
relationship diagnosis as fact
therapy/legal/safety advice
telling user to stay/leave
overclaiming mind-reading
manipulative tactics
shaming/blame
clinical-sounding guardrail language
forbidden guardrail phrasing found in staging review
```

Preferred style:

```text
possible states
watch for
low-pressure reply
avoid overreading
honest and non-coercive wording
warm but concrete
```

Do not make the result vague or overly cautious.

## Runtime Semantic Validation

Add lightweight post-parse paidResult validator if not already present.

Validator should check:

```text
- no forbidden phrases/substrings in paidResult text
- possibleStates length >= 3
- signalDeepDive length >= 3
- replyStrategies length >= 3
- total copyableMessages count >= 6
- next48HourPlan fields non-empty and sufficiently specific
- summaryCard fields non-empty
- avoidDoing list non-empty
- softInsight non-empty
```

Forbidden phrase matching should be conservative and maintainable.

Do not include user private content in validation errors/events.

### Failure behavior

Preferred v0 behavior:

```text
If paidResult fails semantic validation, treat provider output as invalid and return a safe analysis failure.
```

Do not implement automatic retry unless already simple and low-risk.

Document retry as future option if needed.

## Content Depth Target

Refine prompt/schema guidance to target:

```text
1,800–2,800 Chinese characters
7–9 structured sections
3 possible states
3 signal deep dives
3 reply strategies
6–9 copyable messages
next 24/48-hour plan
summary card
```

Do not enforce exact character count too rigidly at runtime.

Runtime may check softer proxy metrics:

```text
minimum number of sections/items
minimum total copyable messages
minimum text length threshold if easy and not brittle
```

If adding text length validation, choose a pragmatic threshold lower than 1,800 to avoid false failures, e.g.:

```text
paidResult aggregate text length >= 1,200 Chinese characters
```

Document rationale.

## Reply Strategies

Ensure each reply strategy includes:

```text
label
tone
2–3 copyableMessages
whenToUse
possibleReaction
followUpIfTheyReply
```

Messages should be:

```text
copyable into LINE
natural Traditional Chinese
not manipulative
not overly long
aligned with selected replyTone if context provided
```

## Context Influence

Do not expand context chip scope in this task.

Ensure current context variables still influence:

```text
reply tone
48-hour plan
signal interpretation
possible states
```

Do not expose raw context values in event metadata.

## Cache / Versioning

If prompt validation or output shape changes materially, bump prompt version if needed.

Recommended:

```text
product_result_prompt_v0.4
```

Only bump schema version if schema shape changes. If only semantic validation/prompt guidance changes, schema can remain v1.

Cache behavior:

```text
new prompt version should avoid reusing older weaker paid results
same input/context under new prompt version should cache thereafter
```

Add/update tests if version changes.

## UI / Unlocked Route

Allowed small changes:

```text
minor section heading copy
minor ordering to make value clearer
copyable message labels
```

Not allowed:

```text
landing/share title hierarchy change
full design redesign
new component architecture
```

If no UI changes are needed, leave UI untouched.

## Staging Synthetic Review

After fixes, run one synthetic-safe staging analyze if feasible.

Recommended input:

```text
他最近回訊息變慢，但還是會看我的限動，也偶爾傳一些生活小事。我不知道他是真的忙，還是其實已經沒那麼想靠近了。
```

Recommended context:

```text
relationshipStage: 曖昧中
userGoal: 我該怎麼回
primaryPain: 回覆變慢
replyTone: 有界線但不冷
```

Verify:

```text
paid result passes semantic validation
no forbidden phrase appears
3 states / 3 signal deep dives / 3 reply strategies
6+ copyable messages
48-hour plan and summary card concrete
free vs unlocked value gap remains clear
```

Do not use real private content.

## Tests

Add/update tests for:

```text
paidResult semantic validator rejects forbidden phrases
paidResult semantic validator rejects insufficient replyStrategies
paidResult semantic validator rejects insufficient copyable messages
paidResult semantic validator rejects missing next48HourPlan
paidResult semantic validator rejects missing summaryCard
valid paidResult v1 passes
prompt version/cache version behavior if changed
event metadata excludes validation text/raw paid content
legacy paid result adaptation still works
unlocked route still renders valid paidResult v1
```

## Documentation Updates

Update if needed:

```text
apps/web/README.md
docs/operations/production-deployment-runbook.md
```

Main required docs are review bundle and execution report.

Do not write raw generated result content into repo artifacts except short sanitized summaries. Avoid copying full provider output.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-21-paid-result-prompt-safety-value-refinement-v0-review-bundle.md
```

Required sections:

```markdown
# Paid Result Prompt Safety / Value Refinement v0 Review Bundle

Date: 2026-05-21

## 1. Summary

## 2. Issues From Staging Value Review

## 3. Prompt Safety Refinements

## 4. Semantic Validation

## 5. Content Depth / Value Improvements

## 6. Reply Strategy Improvements

## 7. Prompt / Schema / Cache Versioning

## 8. Tests Added

## 9. Staging Synthetic Review

## 10. Remaining Limitations

## 11. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-paid-result-prompt-safety-value-refinement-v0-execution-report.md
```

Report structure:

```markdown
# Paid Result Prompt Safety / Value Refinement v0 Execution Report

## Summary

## Files Created

## Files Updated

## Prompt Refinements

## Semantic Validation

## Value Improvements

## Tests Added

## Staging Review Status

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
- safety/value refinement summary
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

Do not skip Playwright.

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
production ops behavior
design system direction beyond tiny unlocked value display affordance if needed
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
full raw provider output
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "fix: refine paid result safety value"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- prompt refinements
- semantic validation summary
- value/content depth improvements
- prompt/schema/cache versioning
- tests added
- staging review status
- validation results
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
