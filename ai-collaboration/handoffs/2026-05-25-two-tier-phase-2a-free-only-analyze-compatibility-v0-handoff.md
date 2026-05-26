# Handoff: Two-tier Phase 2A Free-only Analyze Compatibility v0

Date: 2026-05-25

Project: anyu-next / 暗語 ANYU

## Objective

Implement the first behavior switch toward two-tier generation: make Module 01 analyze generate and return the free result first, while keeping all downstream result/unlock/LINE surfaces compatible when paid result is missing or pending.

This task should reduce first-result latency by removing paidResult generation from the initial analyze path.

This is Phase 2A compatibility implementation.

Do not implement deferred paid generation yet.

Do not trigger paid generation on LINE bind yet.

Do not change payment/email/ads.

Do not change production launch posture beyond explicit staging/production smoke if approved.

## Background

Two-tier Phase 1 Schema + Service Seams v0 completed.

Production Phase 1 status:

```text
analysis_paid_results exists in production
analysis_requests.user_context_json exists in production
fresh analyze currently still generates full ProductResult
shadow paid-result row is created
result/unlock/LINE behavior remains unchanged
```

Current problem:

```text
Fresh analyze is still synchronous and slow because it generates free + paid result together.
Recent production smoke showed fresh analyze around 60–70 seconds after paidResult v2 upgrades.
```

Strategic direction:

```text
Move to free-first analyze.
Generate paid result only after unlock / LINE bind / future payment success.
```

Phase 2A goal:

```text
analyze returns free result without paidResult
result page still works
paid preview still works
unlock flow does not crash when paid result missing
unlocked route handles pending/missing paid result safely
LINE fulfillment does not assume paid result exists
```

Later phases:

```text
Phase 2B/3: deferred paid generation service / worker
Phase 3: trigger paid generation on LINE bind / short-code match
Future: payment success triggers paid generation
```

## Scope

Do:

1. Review current ProductResult / free/paid adapter seams.
2. Define a free-only analyze result shape that remains compatible with UI.
3. Update analyze route to generate free-only result for Module 01.
4. Preserve current prompt/schema safety for free result.
5. Ensure paid teaser/preview can render without paidResult.
6. Ensure result page handles missing/pending paid result.
7. Ensure unlock-intent API handles missing paid result safely.
8. Ensure unlocked route handles missing/pending paid result safely.
9. Ensure LINE fulfillment does not send a broken unlocked link if paid result is missing.
10. Ensure cache behavior works for free result.
11. Keep analysis_paid_results shadow write disabled/not applicable for free-only results, or write pending marker if designed.
12. Add/update tests.
13. Run staging synthetic latency/value review.
14. Create review bundle, execution report, summary log.
15. Commit and push to `origin/staging`.

Do not:

- implement paid generation worker
- generate paid result after unlock/LINE bind
- make LINE webhook wait for provider
- implement payment provider
- implement real payment
- implement email delivery
- change LIFF/webhook security
- change Module 02
- start ads
- switch model/provider unless required and documented
- remove existing paid result support for legacy/full results

## Design Principle

The free result must remain useful.

The paid result may be missing/pending after Phase 2A.

The user-visible result should communicate:

```text
free result is ready
complete analysis is available through LINE / unlock flow
```

But if paid result has not been generated yet, no surface should falsely imply it is immediately available unless the next phase supports generation/delivery.

## Free Result Boundary

Free analyze should produce:

```text
temperature score
core interpretation / summary
signal cards
soft next step
paid teaser metadata if needed
share summary if existing flow needs it
```

Free analyze should not produce:

```text
paidResult v2
3 possible states
3 signal deep dives
6 copyable messages
48-hour plan
summary card
```

## Prompt / Schema Strategy

Prefer adding a dedicated free-result prompt/schema or version if already planned.

Possible versions:

```text
product_result_prompt_free_v0.1
product_result_schema_free_v1
```

or use current product schema with paidResult optional/pending adapter if lower risk.

Important:

```text
Do not keep asking the model to produce paidResult during initial analyze.
```

If a compatibility adapter creates an empty/pending paidResult placeholder, it must not look like real paid content.

## Data / DB Behavior

For free-only analyze:

```text
analysis_results.normalized_result_json stores free result compatible payload
analysis_paid_results may be absent or created with status = pending/not_requested
analysis_requests.user_context_json still persists context
```

Recommended:

```text
Do not create analysis_paid_results row until paid generation is requested.
```

Alternative:

```text
Create pending row for future paid generation tracking.
```

Codex should choose based on current schema and future Phase 3 design.

If creating pending rows, ensure retention_expires_at is set and cleanup handles them.

## Cache Behavior

Free cache should not require paid result.

Ensure:

```text
same text + same context → free cache hit
same text + different context → distinct free result
cache hit response does not require paidResult
old full-result cache entries still render safely
new free-only cache entries render safely
```

If current cache key already includes prompt/schema versions:

```text
bump free prompt/schema version to avoid mixing old full ProductResult cache with new free-only results
```

## Result Page Behavior

Result page must handle both:

```text
legacy/full result with paidResult present
new free-only result with paidResult missing/pending
```

Expected:

```text
free sections render
paid preview renders locked value proposition
unlock CTA works
share/persona preview works if applicable
no runtime crash
```

Paid preview should not reveal paid content.

## Unlock Intent Behavior

When user clicks unlock on free-only result:

```text
create unlockIntent
provide LINE/LIFF/short-code fulfillment path
mark paid generation status as not_requested/pending if tracked
```

But do not generate paid result yet in Phase 2A.

If unlocked route is opened before paid result exists:

```text
show pending / not ready state
explain complete analysis is being prepared or will be generated in next step
do not show broken page
```

Because Phase 2A does not yet implement deferred generation, the copy should be honest.

Recommended pending copy:

```text
完整分析還在準備中。
這一步會在下一階段接上自動整理與 LINE 通知。
```

If this copy feels too implementation-leaky, use internal-test wording:

```text
完整分析目前仍在封測流程中，請稍後再試，或回到結果頁重新領取。
```

Codex should choose product-safe copy.

## LINE Fulfillment Compatibility

Do not change LINE bind/webhook behavior substantially.

Ensure:

```text
if paid result is missing, LINE does not send a link to an empty/broken unlocked page
or unlocked page gracefully displays pending state
```

For Phase 2A, it is acceptable that LINE fulfillment delivers a link whose page says paid result pending, as long as not misleading. But preferred is to avoid claiming complete analysis is ready if it is not.

Document exact behavior.

## Semantic Validation

Paid result semantic validation should not run on free-only analyze if no paidResult is generated.

Free result validation should remain sufficient.

Avoid classifying missing paidResult as provider_error for free-only analyze.

Add tests for this.

## Backward Compatibility

Must support:

```text
old full ProductResult with paidResult
new free-only result without paidResult
legacy unlocked tokens for old full results
current demo result fixtures
current Playwright smoke
```

## Staging Review

Run staging synthetic analyze after deployment if feasible.

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

Verify:

```text
fresh analyze succeeds
fresh analyze latency materially improves vs 60–70s baseline if provider path is hit
free result renders
paid preview renders
unlock intent works
unlocked route pending/compatible behavior works
no paidResult semantic validation false-fail
cache hit works
privacy metadata safe
```

Do not use real private input.

## Tests

Add/update tests for:

```text
free-only analyze response succeeds without paidResult
paid semantic validation not required for free-only result
result page renders free-only result
paid preview renders when paidResult missing
unlock intent works for free-only result
unlocked route handles missing/pending paid result
legacy full result still renders
legacy unlocked route still renders paidResult
cache hit works for free-only result
same input/different context remains distinct
analysis_requests.user_context_json still persists
analysis_paid_results absent or pending behavior is tested
LINE route-level compatibility if paid result missing
```

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-25-two-tier-phase-2a-free-only-analyze-compatibility-v0-review-bundle.md
```

Required sections:

```markdown
# Two-tier Phase 2A Free-only Analyze Compatibility v0 Review Bundle

Date: 2026-05-25

## 1. Summary

## 2. Behavior Switch

## 3. Free Result Schema / Prompt

## 4. Paid Result Missing/Pending Compatibility

## 5. Cache Behavior

## 6. Result Page Compatibility

## 7. Unlock / LINE Compatibility

## 8. Backward Compatibility

## 9. Tests Added

## 10. Staging Review

## 11. Latency Findings

## 12. Known Limitations

## 13. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-25-two-tier-phase-2a-free-only-analyze-compatibility-v0-execution-report.md
```

Report structure:

```markdown
# Two-tier Phase 2A Free-only Analyze Compatibility v0 Execution Report

## Summary

## Files Created

## Files Updated

## Behavior Changes

## Prompt / Schema Changes

## Result / Unlock / LINE Compatibility

## Cache Changes

## Tests Added

## Staging Review Status

## Latency Results

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
- free-only behavior summary
- latency result
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

Run Playwright because analyze/result/unlock user-visible behavior changes.

## Production Gate

This task may deploy to staging for review.

Production deployment should be explicit and only after staging passes.

If production is included, it must run narrow production smoke.

Default recommendation:

```text
staging first, then ask before production
```

## Constraints

Do not implement:

```text
deferred paid generation
paid generation worker
LINE bind trigger generation
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
LINE production behavior beyond compatibility safety
legal semantics
design system direction
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
git commit -m "feat: return free result first"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- free-only analyze behavior
- prompt/schema changes
- result/unlock/LINE compatibility
- cache behavior
- latency result
- staging review status
- validation results
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
