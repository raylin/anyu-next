# Handoff: Two-tier Phase 3 LINE Bind Trigger + Delivery v0

Date: 2026-05-25

Project: anyu-next / 暗語 ANYU

## Objective

Wire the two-tier deferred paid-result generation service into LINE fulfillment, so users who bind through LIFF or submit a short code through LINE can receive or access the completed paid result.

This task should connect the existing pieces:

```text
free-only analyze
unlock intent / fulfillment token
paid-generation request service
analysis_paid_results lifecycle
unlocked route completed/processing/failed states
LIFF bind
LINE short-code webhook
```

The key requirement is to avoid making LINE webhook wait on a long provider call if that is unsafe. The implementation should be robust and honest about pending/completed states.

Do not implement real payment.

Do not implement email delivery.

Do not start ads.

Do not change paid result schema/prompt unless a tiny compatibility fix is necessary.

## Background

Two-tier Phase 2A Free-only Analyze Compatibility v0 completed.

```text
- initial analyze now generates free-only result
- staging fresh analyze improved to ~20.7s
- result/unlock/LIFF routes tolerate missing paid content
```

Two-tier Phase 2B Deferred Paid Generation Service v0 completed.

```text
- paid-generation request route exists
- analysis_paid_results stores paid content
- unlocked route renders completed / processing / failed / missing / legacy states
- repeat paid-generation request reuses completed row
```

Paid Generation Provider Reliability Follow-up v0 completed.

```text
- provider output diagnostics added
- root cause identified as parse/truncated JSON
- paid output budget raised from 2400 to 3600
- staging provider path completed without fallback
- fallback remains fail-safe
```

Current gap:

```text
LINE bind / short-code fulfillment does not yet trigger or deliver deferred paid generation.
```

Important design concern:

```text
LINE webhook should not block for 60s waiting on provider generation.
```

## Scope

Do:

1. Review current LIFF bind route.
2. Review current LINE webhook short-code flow.
3. Review paid-generation request service.
4. Decide safest Phase 3 trigger behavior.
5. Implement LIFF bind trigger for paid generation if safe.
6. Implement short-code webhook trigger behavior without long webhook blocking.
7. Ensure unlocked route can show processing/completed after LINE binding.
8. Ensure LINE delivery behavior is safe and honest.
9. Preserve provider/fallback source metadata.
10. Add tests.
11. Run staging smoke with test OA / LIFF if feasible.
12. Create review bundle, execution report, summary log.
13. Commit and push to `origin/staging`.

Do not:

- implement real payment
- implement email delivery
- start ads
- implement Module 02
- change free analyze behavior
- change paid schema/prompt unless necessary
- change LINE production settings
- deploy production by default
- make LINE webhook wait for provider if route/runtime risk is high
- dump raw input, provider output, paid_result_json, codes, tokens, LINE user IDs, or secrets

## Core Decision Required

Before implementing, Codex must decide and document:

```text
Can the LINE webhook safely trigger paid generation synchronously?
```

Consider:

```text
- LINE webhook timeout expectations
- provider paid generation latency
- Vercel route maxDuration
- existing paid generation request latency
- risk of duplicate webhook delivery
- user experience if generation takes 30–70s
```

Expected recommendation:

```text
LIFF/web path may synchronously request/generate paid result because web UI can show waiting.
LINE webhook path should not block on provider; it should respond quickly with pending message and use a safe follow-up mechanism.
```

If no background mechanism exists yet, do not fake completed delivery.

## Desired Phase 3 Behavior

### LIFF bind path

Flow:

```text
free result
→ user clicks 用 LINE 領取完整分析
→ LIFF opens
→ LINE user is verified and bound
→ paid generation is requested
→ LIFF page / unlocked page shows processing
→ completed paid result renders
```

If synchronous paid generation is acceptable in LIFF/web route:

```text
LIFF bind may wait for paid generation and return completed URL when ready.
```

If not:

```text
LIFF bind returns processing status and client polls paid result status/unlocked route.
```

Preferred:

```text
LIFF/web flow can show a waiting state and poll/refresh until complete.
```

### Short-code webhook path

Flow:

```text
free result
→ user sends short code to OA
→ webhook validates signature and matches code
→ LINE user is bound
→ paid generation requested
→ webhook replies quickly:
  收到，我正在整理你的完整分析。完成後會把連結傳給你。
```

Then one of:

```text
A. if paid generation is already completed quickly, send unlocked link
B. if background delivery exists, push link after completion
C. if no background delivery exists, send pending message and unlocked link to a processing page
```

Important:

```text
Do not send a broken/empty complete-analysis link.
If link is sent before paid result is complete, the page must show honest processing state and auto/poll refresh if implemented.
```

## Minimal Acceptable MVP

If full background push delivery is too large, acceptable Phase 3 MVP:

```text
LIFF bind path:
- triggers paid generation
- user reaches unlocked page with completed paid result or processing state

Short-code webhook path:
- validates code
- binds user
- requests/marks paid generation pending
- replies with an unlocked link that shows processing state
- does not block webhook on provider generation
```

But preferred if feasible:

```text
Short-code path eventually delivers completed link automatically after paid generation completes.
```

Document final behavior clearly.

## Paid Result Status / API

If not already available, add status helper/API for paid result:

```text
GET /api/modules/[moduleSlug]/paid-result/[id]/status
```

or equivalent.

It should return safe state:

```text
processing
completed
failed
missing
```

Do not include paid_result_json.

If unlocked route can poll itself or client can poll paid generation route, choose the simplest maintainable approach.

## LINE Message Copy

### Pending reply

```text
收到，我正在整理你的完整分析。
大約需要 30–60 秒，完成後你可以從這個連結查看：
{url}
```

If no auto-delivery after completion:

```text
頁面會在完成後顯示結果；如果還在整理中，稍後再打開也可以。
```

### Completed reply

```text
收到，這是你的完整分析連結：
{url}
```

### Failure reply

```text
這次完整分析暫時沒有整理成功。請稍後回到結果頁再試一次。
```

Do not send raw analysis content through LINE.

Send links only.

## Data / State Updates

Use existing:

```text
analysis_paid_results
unlock_intents
line_user_id
fulfillment_status
```

Need to decide whether to add fields.

Avoid migration unless necessary.

If migration is necessary, it must be additive and staging-first.

Possible status behavior:

```text
unlockIntent.fulfillment_status = bound / pending_paid_generation / delivered / failed
analysis_paid_results.status = processing / completed / failed
```

If existing fields are sufficient, do not add migration.

## Idempotency

Must be safe for duplicate events/clicks.

For repeated LIFF bind:

```text
return existing processing/completed paid result if present
do not create duplicate paid rows
```

For repeated short-code message:

```text
do not trigger duplicate provider calls
do not send multiple conflicting messages
respect existing line_webhook_events dedupe
```

## Provider / Fallback

Paid generation should prefer provider path.

Fallback remains fail-safe.

Track source safely:

```text
source = provider | fallback
fallbackReason
```

Do not expose source to user by default.

If fallback is used during smoke, document it. Phase 3 can still pass only if fallback is explicitly acceptable; otherwise mark as partial.

Preferred success:

```text
provider path completed
fallback not used
```

## Event / Privacy Metadata

Allowed:

```text
unlockIntentId
resultId
paidResultId
status
source provider/fallback
errorCategory
retryCount
elapsedMs
channel: liff | line_shortcode
```

Forbidden:

```text
raw input
redacted input text
LINE user ID
LINE display name
LINE message text
fulfillment code
unlock token
tokenized URL
paid_result_json
full result JSON
provider raw output
email
DATABASE_URL
ANTHROPIC_API_KEY
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
ANALYSIS_CACHE_HASH_SECRET
RETENTION_CLEANUP_SECRET
```

## Tests

Add/update tests for:

```text
LIFF bind requests paid generation when missing
LIFF bind reuses completed paid result
LIFF bind returns processing/completed status safely
short-code webhook binds user and requests paid generation without blocking excessively
short-code webhook duplicate event does not duplicate paid generation
short-code webhook reply is pending/completed as designed
unlocked route shows processing then completed state
paid generation request remains idempotent
provider source/fallback metadata safe
no LINE user IDs/codes/tokens in event metadata
legacy full paid result still renders
free-only result without paid still renders pending safely
```

If webhook cannot be integration-tested with real LINE in unit tests, use signed synthetic payloads/mocks.

## Staging Smoke

Run staging smoke after deploy if feasible.

### LIFF/web path smoke

```text
1. free-only analyze synthetic input
2. unlock intent
3. LIFF bind or route-level bind simulation with valid/verified identity if possible
4. paid generation triggered
5. unlocked route reaches completed paid content
6. repeat bind/request reuses completed result
```

If real LIFF token cannot be acquired in shell, document manual step.

### Short-code path smoke

If test OA is available:

```text
1. free-only analyze
2. unlock intent
3. send short code to test OA
4. verify bot replies with pending or completed link
5. open link
6. verify processing or completed state is honest
```

If manual LINE app step required, document it and optionally have operator perform it.

Do not use real private input.

Synthetic input:

```text
他最近回訊息變慢，但還是會看我的限動，也偶爾傳一些生活小事。我不知道他是真的忙，還是其實已經沒那麼想靠近了。
```

Context:

```text
relationshipStage: 曖昧中
userGoal: 我該怎麼回
primaryPain: 回覆變慢
replyTone: 有界線但不冷
```

## Production Gate

Default:

```text
staging only
```

Do not deploy production unless explicitly approved after staging pass.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-25-two-tier-phase-3-line-bind-trigger-delivery-v0-review-bundle.md
```

Required sections:

```markdown
# Two-tier Phase 3 LINE Bind Trigger + Delivery v0 Review Bundle

Date: 2026-05-25

## 1. Summary

## 2. Trigger Design Decision

## 3. LIFF Bind Flow

## 4. Short-code Webhook Flow

## 5. Paid Generation Status / Delivery

## 6. Unlocked Route Behavior

## 7. Idempotency / Duplicate Handling

## 8. Provider / Fallback Behavior

## 9. Event / Privacy Metadata

## 10. Tests Added

## 11. Staging Smoke

## 12. Known Limitations

## 13. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-25-two-tier-phase-3-line-bind-trigger-delivery-v0-execution-report.md
```

Report structure:

```markdown
# Two-tier Phase 3 LINE Bind Trigger + Delivery v0 Execution Report

## Summary

## Files Created

## Files Updated

## Trigger Design

## LIFF Flow Changes

## Webhook Flow Changes

## Paid Generation / Delivery Behavior

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
- LIFF trigger behavior
- short-code behavior
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

Run Playwright because unlock/LINE-related user flow changes.

## Constraints

Do not implement:

```text
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
free analyze behavior unless required for compatibility
paid result schema unless required for compatibility
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
git commit -m "feat: trigger paid generation from line bind"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- trigger design decision
- LIFF path behavior
- short-code path behavior
- paid generation/delivery behavior
- provider/fallback status
- staging smoke result
- validation results
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
