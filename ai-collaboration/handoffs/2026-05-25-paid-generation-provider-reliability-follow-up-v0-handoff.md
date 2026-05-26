# Handoff: Paid Generation Provider Reliability Follow-up v0

Date: 2026-05-25

Project: anyu-next / 暗語 ANYU

## Objective

Diagnose and stabilize the provider-generated paid result path after Two-tier Phase 2B.

Phase 2B successfully proved the deferred paid generation service path, but staging smoke completed through a controlled template fallback because provider paid generation failed validation/transport before a usable provider-generated paid result was persisted.

This task should make the provider path reliable enough to proceed to Phase 3 LINE Bind Trigger + Delivery.

Fallback should remain as a safe failure path, but it should not be the primary success path.

This is a targeted reliability / prompt-runtime debugging task.

Do not wire LINE bind/webhook to trigger paid generation in this task.

Do not deploy production unless explicitly approved after staging success.

Do not implement payment/email/ads.

## Background

Two-tier Phase 2B Deferred Paid Generation Service v0 completed.

Commit:

```text
51f38af
```

What works:

```text
- initial analyze remains free-only
- deferred paid-generation request route exists
- paid rows are stored in analysis_paid_results
- unlocked route renders completed / processing / failed / missing / legacy states
- repeat paid-generation request reuses completed row
- staging smoke passed end-to-end at service level
```

Issue:

```text
Provider paid generation was unreliable in staging.
The smoke completed because a schema-validated template fallback was added for provider/runtime/output-validation failures.
```

Concern:

```text
Fallback is useful as a fail-safe, but it is less personalized than provider-generated paid content.
It should not be the primary paid-result source, especially before monetization or broader LINE/growth traffic.
```

Recommended next step:

```text
Paid Generation Provider Reliability Follow-up v0
```

## Scope

Do:

1. Inspect current paid-generation service and fallback path.
2. Diagnose why provider paid generation failed in staging.
3. Identify whether failures are caused by:
   - provider timeout
   - transport/API error
   - output truncation
   - JSON parse failure
   - schema validation failure
   - semantic validation failure
   - prompt/schema mismatch
   - env/deployment issue
4. Improve prompt/runtime/validation/config with smallest safe fix.
5. Keep paidResult schema v2 unless a small additive change is strictly necessary.
6. Preserve fallback as safe backup, but ensure provider path succeeds for synthetic cases.
7. Add source/status metadata internally to distinguish provider vs fallback paid result.
8. Add tests.
9. Run staging smoke with at least one provider-generated paid result.
10. Create review bundle, execution report, summary log.
11. Commit and push to `origin/staging`.

Do not:

- make fallback the intended primary output
- wire LINE bind/webhook to trigger paid generation
- deploy production by default
- implement payment
- implement email delivery
- start ads
- switch model/provider unless required and documented
- add second product flow beyond paid generation reliability
- dump raw provider output or paid_result_json into repo artifacts

## Diagnosis Requirements

Inspect safely:

```text
apps/web/src/lib/modules/paid-generation-service.ts
apps/web/src/lib/ai/paid-result-generation.ts
apps/web/src/lib/ai/paid-result-semantic-validation.ts
apps/web/src/app/api/modules/[moduleSlug]/paid-result/request/route.ts
apps/web/src/lib/ai/assets/product_result_prompt_v0.md
apps/web/src/lib/ai/assets/product_result_schema_v2.json
apps/web/src/lib/ai/runtime.ts
apps/web/src/tests/*
ai-collaboration/reports/2026-05-25-two-tier-phase-2b-deferred-paid-generation-service-v0-execution-report.md
```

Adjust paths based on repo.

Do not print:

```text
raw input
provider raw output
full paid_result_json
secrets
tokens
LINE user IDs
```

If raw provider output inspection is necessary locally, keep it local only and summarize sanitized failure categories.

## Provider Success Criteria

Provider-generated paid result should pass for at least one synthetic staging case, preferably two if cost/time allows.

Synthetic case A:

```text
他最近回訊息變慢，但還是會看我的限動，也偶爾傳一些生活小事。我不知道他是真的忙，還是其實已經沒那麼想靠近了。
```

Context A:

```text
relationshipStage: 曖昧中
userGoal: 我該怎麼回
primaryPain: 回覆變慢
replyTone: 有界線但不冷
```

Synthetic case B if useful:

```text
我們見過幾次面，聊天還算自然，但每次我提到下次要不要約，他都說再看看。我不知道該主動一點，還是先退一步。
```

Context B:

```text
relationshipStage: 見過幾次
userGoal: 我要不要主動
primaryPain: 有互動但不約
replyTone: 輕鬆像聊天
```

Success means:

```text
paid generation request returns completed
analysis_paid_results row status = completed
paid result source is provider, not fallback
unlocked route renders paid content
semantic validation passes
6 copyable messages present
summary card present
48-hour plan present
no forbidden phrase match
```

## Fallback Policy

Fallback remains allowed only as fail-safe.

Add or verify an internal marker:

```text
paid_result_source = provider | fallback
```

or equivalent safe metadata.

If schema/table does not have a field, use existing safe metadata/status/error_code if appropriate.

Do not expose provider/fallback distinction to user unless product copy already supports it.

Reports may say aggregate:

```text
provider path succeeded: yes/no
fallback used: yes/no
```

Do not include raw content.

## Likely Fix Areas

Possible fixes include:

### Prompt refinement

```text
make paid prompt more JSON-strict
reduce ambiguous prose instructions
emphasize exact item counts
reduce conflict between richness and concise output
```

### Output budget / timeout

```text
ensure output budget supports v2 without truncation
keep route maxDuration safe
avoid excessive verbosity
```

### Semantic validation

```text
keep hard safety checks
avoid style-preference false positives
separate hard fail vs soft warning if needed
```

### Schema alignment

```text
ensure prompt field names exactly match schema v2
ensure possibleReaction/followUpIfTheyReply are always generated
ensure copyableMessages count is exact enough
```

### Retry/fallback order

```text
provider attempt
same-model retry on output_validation if appropriate
fallback only after provider/retry fails
```

## Tests

Add/update tests for:

```text
provider success path stores source/status as provider
fallback path stores source/status as fallback
fallback only used after provider/runtime/output-validation failure
paid generation route can return completed provider result
semantic validation does not reject valid provider-style result
semantic validation still rejects unsafe/manipulative/shaming phrases
schema v2 exact fields validated
unlocked route renders provider-generated result
events/metadata do not include raw paid content or provider output
```

If provider calls cannot be unit-tested, use mocked provider responses.

## Staging Smoke

Run staging smoke after deployment if feasible.

Flow:

```text
1. free-only analyze synthetic input
2. unlock intent
3. paid-generation request
4. verify provider path completed
5. open unlocked route
6. repeat request reuses completed row
7. verify privacy metadata
```

If staging provider path still fails but fallback works:

```text
do not call the task fully successful
document root cause / blocker
recommend next fix
```

## Event / Privacy

Ensure metadata does not contain:

```text
raw input
full provider output
paid_result_json
email
LINE user ID
fulfillment code
unlock token
tokenized URL
DATABASE_URL
ANTHROPIC_API_KEY
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
```

Allowed:

```text
resultId
paidResultId
status
source: provider/fallback
errorCategory
retryCount
elapsedMs
```

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-25-paid-generation-provider-reliability-follow-up-v0-review-bundle.md
```

Required sections:

```markdown
# Paid Generation Provider Reliability Follow-up v0 Review Bundle

Date: 2026-05-25

## 1. Summary

## 2. Phase 2B Issue Recap

## 3. Root Cause Analysis

## 4. Fixes Applied

## 5. Provider vs Fallback Behavior

## 6. Prompt / Schema / Validation Changes

## 7. Tests Added

## 8. Staging Provider Smoke

## 9. Event / Privacy Verification

## 10. Known Limitations

## 11. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-25-paid-generation-provider-reliability-follow-up-v0-execution-report.md
```

Report structure:

```markdown
# Paid Generation Provider Reliability Follow-up v0 Execution Report

## Summary

## Files Created

## Files Updated

## Root Cause

## Fixes Applied

## Provider Path Result

## Fallback Path Result

## Tests Added

## Staging Smoke

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
- provider path status
- fallback status
- staging smoke status
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
cd apps/web && corepack pnpm test:e2e:local
```

Run Playwright because unlocked route/paid generation behavior is involved.

## Production Gate

Default:

```text
staging only
```

Do not deploy production unless explicitly approved after provider path passes staging.

## Constraints

Do not implement:

```text
LINE bind trigger generation
LINE webhook paid generation
payment provider integration
ads launch
real payment
email delivery
rich menu
broadcast
portal/account system
model switch
SSE/websocket/token streaming
Module 02
```

Do not modify:

```text
legal semantics
LINE production behavior
design system direction
free analyze behavior beyond compatibility if needed
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
ANTHROPIC_API_KEY
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
paid_result_json dumps
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "fix: stabilize deferred paid generation"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- root cause
- fix applied
- provider path status
- fallback path status
- staging smoke result
- tests added
- validation results
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
