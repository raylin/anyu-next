# Handoff: Two-tier Phase 3 Staging Manual Smoke v0

Date: 2026-05-25

Project: anyu-next / 暗語 ANYU

## Objective

Run and record the real staging manual smoke for Two-tier Phase 3 LINE Bind Trigger + Delivery.

This task should verify the actual user-facing staging flow with the test LINE OA and staging LIFF after Phase 3 implementation:

```text
free-only analyze
→ unlock intent
→ LIFF bind or LINE short-code
→ deferred paid generation
→ unlocked route shows completed paid content
```

This is a staging manual smoke + documentation task.

Do not deploy production.

Do not apply production migrations.

Do not change code unless there is a tiny staging-blocking bug.

Do not start ads/payment/email.

## Background

Two-tier Phase 3 LINE Bind Trigger + Delivery v0 completed.

Commit:

```text
ee3564c
```

What changed:

```text
- LIFF bind triggers deferred paid generation after verified LINE identity binding.
- Short-code webhook replies quickly with pending link copy.
- Webhook schedules paid generation after response using Next after.
- Provider/fallback metadata preserved.
- Automated staging verification confirmed provider-paid generation completed and unlocked paid content rendered.
```

Important technical note:

```text
Webhook uses Next after, not durable queue.
This is acceptable for low-volume staging/beta smoke, but not yet a broad traffic / ads-ready durable delivery mechanism.
```

Manual staging smoke is still pending.

## Scope

Do:

1. Verify staging deployment freshness for `ee3564c` or newer.
2. Run manual staging LIFF bind smoke if possible.
3. Run manual staging test OA short-code smoke if possible.
4. Verify deferred paid generation completes.
5. Verify unlocked route shows completed paid content.
6. Verify provider/fallback source if available safely.
7. Verify no raw code/token/LINE user ID/tokenized URL is recorded.
8. Update staging setup docs and Phase 3 review/report artifacts.
9. Create execution report / summary log entry.
10. Commit and push to `origin/staging`.

Do not:

- deploy production
- touch production LINE OA
- run real production short-code smoke
- change payment/email/ads behavior
- change prompt/schema
- change paid generation service unless tiny staging blocker
- write raw short code, tokenized URL, LINE user ID, raw input, provider output, or paid_result_json into repo artifacts

## Manual Smoke Requirements

Use staging only:

```text
https://staging.anyu.tw/m/ambiguous-temperature
```

Use synthetic input only:

```text
他最近回訊息變慢，但還是會看我的限動，也偶爾傳一些生活小事。我不知道他是真的忙，還是其實已經沒那麼想靠近了。
```

Use context:

```text
relationshipStage: 曖昧中
userGoal: 我該怎麼回
primaryPain: 回覆變慢
replyTone: 有界線但不冷
```

Do not use real private content.

## Smoke A: LIFF Bind Path

Manual/operator steps:

```text
1. Open staging result flow on mobile.
2. Run free-only analyze with synthetic input/context.
3. Click 用 LINE 領取完整分析.
4. Open staging LIFF flow.
5. Complete LINE bind if prompted.
6. Confirm paid generation starts or completes.
7. Open/land on unlocked result.
8. Confirm unlocked page shows completed paid content.
```

Record only sanitized result:

```text
LIFF bind smoke: pass/fail
paid generation completed: yes/no
provider source: provider/fallback/unknown if safely available
unlocked paid content visible: yes/no
processing/failure state seen: yes/no
notes: sanitized only
```

Do not record LINE user ID, tokenized URL, fulfillment code, or raw LINE messages.

## Smoke B: Short-code Test OA Path

Manual/operator steps:

```text
1. Run staging free-only analyze with synthetic input/context.
2. Create unlock intent.
3. Confirm short code is displayed.
4. Open the staging/test LINE OA.
5. Send the short code to the test OA.
6. Confirm bot replies quickly with pending link copy.
7. Open the link.
8. Confirm page shows processing or completed state honestly.
9. Wait/refresh/reopen if necessary.
10. Confirm paid content completes and renders.
```

Expected:

```text
bot replies with pending or completed link
provider paid generation should eventually complete
unlocked route should show completed paid content
no broken or empty paid result
```

Record only sanitized result:

```text
short-code smoke: pass/fail
bot reply received: yes/no
reply type: pending/completed/error
link opened: yes/no
paid content completed: yes/no
processing stuck: yes/no
provider source: provider/fallback/unknown if safely available
notes: sanitized only
```

Do not record actual code, tokenized link, LINE user ID, or raw message text.

## Event / Privacy Check

Verify reports/logs/docs do not contain:

```text
raw input
fulfillment code
unlock token
tokenized URL
LINE user ID
LINE display name
LINE message text
paid_result_json
full provider output
email
DATABASE_URL
ANTHROPIC_API_KEY
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
ANALYSIS_CACHE_HASH_SECRET
RETENTION_CLEANUP_SECRET
```

Allowed:

```text
pass/fail
provider/fallback source as aggregate
status names
elapsed timing if aggregate
route names
deployment freshness
```

## Next-after Risk Decision

After manual smoke, document recommendation:

```text
A. Accept Next after as low-volume beta MVP and proceed to production smoke.
B. Add durable background delivery / polling before production.
```

Guidance:

```text
If LIFF and short-code staging smoke both pass and paid content completes reliably, A is acceptable for low-key beta.
If short-code gets stuck processing or paid generation is unreliable, choose B.
```

## Required Review Bundle Update

Update existing Phase 3 review bundle if present:

```text
ai-collaboration/research/2026-05-25-two-tier-phase-3-line-bind-trigger-delivery-v0-review-bundle.md
```

If a new review bundle is preferred, create:

```text
ai-collaboration/research/2026-05-25-two-tier-phase-3-staging-manual-smoke-v0-review-bundle.md
```

Required sections:

```markdown
# Two-tier Phase 3 Staging Manual Smoke v0 Review Bundle

Date: 2026-05-25

## 1. Summary

## 2. Staging Deployment Freshness

## 3. LIFF Bind Manual Smoke

## 4. Short-code Test OA Manual Smoke

## 5. Paid Generation Completion

## 6. Provider / Fallback Source

## 7. Event / Privacy Check

## 8. Next-after Risk Decision

## 9. Known Limitations

## 10. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-25-two-tier-phase-3-staging-manual-smoke-v0-execution-report.md
```

Report structure:

```markdown
# Two-tier Phase 3 Staging Manual Smoke v0 Execution Report

## Summary

## Files Created

## Files Updated

## Manual Smoke Results

## LIFF Result

## Short-code Result

## Paid Generation Result

## Event / Privacy Status

## Next-after Risk Assessment

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
- LIFF smoke status
- short-code smoke status
- paid generation result
- Next-after decision
- validation result
- commit hash
- staging push status

## Validation

If no code changes:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

If code changes are made, also run:

```bash
cd apps/web && corepack pnpm test:e2e:local
```

Do not skip validation.

## Constraints

Do not implement:

```text
production deployment
production migration
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
free analyze behavior
paid result schema
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
git commit -m "docs: record phase three staging smoke"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- LIFF bind manual smoke status
- short-code test OA smoke status
- paid generation completion
- provider/fallback source if known
- Next-after risk decision
- validation results
- review/report path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
