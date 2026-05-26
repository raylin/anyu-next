# Handoff: Two-tier Phase 1 Production Migration + Smoke v0

Date: 2026-05-25

Project: anyu-next / 暗語 ANYU

## Objective

Apply and verify the additive Two-tier Phase 1 schema/service seams in production after staging verification and provider-error follow-up have passed.

This task should apply `0005_two_tier_phase_1.sql` to the production DB, refresh production app code to `fe01379` or newer, and run a narrow production synthetic smoke verifying:

```text
- production analyze still works
- analysis_requests.user_context_json persists allowlisted context
- analysis_paid_results shadow row is created
- result / unlock / unlocked route still work
- LINE route-level behavior is not regressed
- event/privacy metadata remains safe
```

This is a production migration + smoke task.

Do not switch analyze to free-only.

Do not trigger deferred paid generation.

Do not change LINE fulfillment behavior.

Do not implement payment, ads, email delivery, or growth work.

## Background

Two-tier Phase 1 Schema + Service Seams v0 completed.

Commit:

```text
c3cdf9a
```

It added:

```text
- 0005_two_tier_phase_1.sql
- analysis_paid_results table
- analysis_requests.user_context_json
- paid-result repository helpers
- free/paid adapter helpers
- best-effort shadow paid-result row creation on fresh analyze
```

Two-tier Phase 1 Migration Live Verification v0 applied 0005 to staging but fresh analyze initially failed with provider_error.

Staging Analyze Provider Error Follow-up v0 then fixed the issue.

Commit:

```text
fe01379
```

Current verified staging status after follow-up:

```text
- fresh staging analyze returned HTTP 200
- user_context_json persisted 4 allowlisted fields
- analysis_paid_results completed shadow row was created
- result / unlock / unlocked route returned 200
- shadow write remains best-effort and cannot break analyze
- local validation passed
```

Production status:

```text
- production 0005 remains pending
- production app should not move to fe01379+ without production DB 0005
```

Recommended next step:

```text
Apply production 0005, deploy fe01379 or newer, and run one sanitized production fresh analyze smoke.
```

## Scope

Do:

1. Confirm production DB current schema status.
2. Apply `apps/web/drizzle/0005_two_tier_phase_1.sql` to production DB if not already applied.
3. Verify production schema:
   - `analysis_paid_results` exists.
   - `analysis_requests.user_context_json` exists.
   - expected indexes/constraints exist.
4. Deploy/promote `fe01379` or newer to production.
5. Verify production deployment freshness.
6. Run one synthetic production fresh analyze with context.
7. Verify production analyze returns HTTP 200.
8. Verify `analysis_requests.user_context_json` persisted allowlisted context.
9. Verify `analysis_paid_results` completed shadow row was created.
10. Verify result page loads.
11. Verify unlock intent works.
12. Verify unlocked route works.
13. Verify LINE fulfillment route-level behavior remains healthy.
14. Verify event/privacy metadata remains safe.
15. Update docs/runbook/setup notes if needed.
16. Create review bundle, execution report, summary log.
17. Commit and push to `origin/staging`.

Do not:

- switch analyze to free-only
- remove paid_result from current ProductResult
- implement deferred paid generation
- enqueue paid generation
- change LINE bind/webhook behavior
- run real production OA short-code smoke unless needed
- change payment/email/ads behavior
- alter prompt/schema/model/provider
- run broad production tests
- dump raw DB rows
- print secrets

## Migration

Migration file:

```text
apps/web/drizzle/0005_two_tier_phase_1.sql
```

Production DB target:

```text
Neon production branch currently used by anyu-next production
```

Rules:

```text
- Verify schema before applying.
- Apply only if missing.
- Migration should be additive.
- Do not print DATABASE_URL.
- Do not dump rows.
- Do not expose raw result JSON.
- Do not expose paid_result_json.
- Do not expose user input.
```

Expected production DB objects:

```text
analysis_paid_results
analysis_requests.user_context_json
related indexes/constraints
```

## Production Deployment

Deploy/promote current approved code to production after production 0005 is applied.

Candidate must include:

```text
fe01379 or newer
```

Record:

```text
deployment URL
deployment ID if available
candidate commit
alias status for https://anyu.tw
```

Do not treat this as ads/broader launch approval.

## Production Smoke

Use production:

```text
https://anyu.tw/m/ambiguous-temperature
```

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

Expected:

```text
fresh analyze succeeds
result page loads
current ProductResult behavior remains unchanged
paid result v2 still exists in current normalized_result_json
analysis_requests.user_context_json persisted with allowlisted context
analysis_paid_results completed shadow row exists if shadow write is active
unlock intent succeeds
unlocked route loads
LINE route-level checks still pass
```

Do not paste tokenized URLs, codes, LINE IDs, raw input, raw provider output, `paid_result_json`, or raw result JSON into reports.

## Shadow Paid Result Verification

Verify aggregate/safe facts only:

```text
shadow row created: yes/no
status: completed
linked analysis_result_id exists
module_id/theme_slug present
prompt/schema/model version present if implemented
retention_expires_at present if intended
```

Do not dump `paid_result_json`.

If shadow write fails but analyze still succeeds due to best-effort catch:

```text
document failure category
recommend fix before Phase 2
```

## User Context Persistence

Verify:

```text
allowlisted fields persisted
unknown fields not persisted or not present
no raw arbitrary context text
event metadata does not contain context values
```

Allowed report:

```text
context persisted: yes
field count: 4
```

Do not paste context values into event metadata examples unless necessary.

## LINE / Unlock Regression Checks

Verify route-level only:

```text
unlock intent returns fulfillment code/token
unlocked route loads
LIFF page route loads
bind route rejects invalid token/idToken as expected
webhook invalid signature still rejects
```

Do not send production LINE OA messages unless explicitly necessary.

Real production OA short-code smoke is not required for this migration.

## Event / Privacy Verification

Verify no event metadata/log/report contains:

```text
raw input
redacted input text
context values if not needed
full result JSON
paid_result_json
provider raw output
email
LINE user ID
fulfillment code
unlock token
tokenized URL
DATABASE_URL
ANTHROPIC_API_KEY
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
LINE_LOGIN_CHANNEL_SECRET
ANALYSIS_CACHE_HASH_SECRET
RETENTION_CLEANUP_SECRET
```

Allowed:

```text
resultId
requestId
moduleSlug
contextProvided
contextFieldsCount
shadowPaidResultCreated true/false if used
safe status/error category
timing aggregate
```

## Retention Note

`analysis_paid_results` is a retained content table.

This task should document:

```text
analysis_paid_results retention cleanup is not wired yet
scheduled retention cleanup must include analysis_paid_results before broader traffic / ads
```

Do not implement retention cleanup in this task unless explicitly tiny and safe; likely defer.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-25-two-tier-phase-1-production-migration-smoke-v0-review-bundle.md
```

Required sections:

```markdown
# Two-tier Phase 1 Production Migration + Smoke v0 Review Bundle

Date: 2026-05-25

## 1. Summary

## 2. Production Migration Status

## 3. Production Deployment Status

## 4. Production Schema Verification

## 5. Production Analyze Verification

## 6. user_context_json Verification

## 7. analysis_paid_results Shadow Verification

## 8. Result / Unlock / LINE Regression Checks

## 9. Event / Privacy Verification

## 10. Retention Implications

## 11. Known Limitations

## 12. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-25-two-tier-phase-1-production-migration-smoke-v0-execution-report.md
```

Report structure:

```markdown
# Two-tier Phase 1 Production Migration + Smoke v0 Execution Report

## Summary

## Files Created

## Files Updated

## Production Migration Status

## Production Deployment Status

## Production Smoke Results

## Shadow Paid Result Status

## User Context Persistence Status

## Event / Privacy Status

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
- production migration status
- production smoke status
- shadow paid result status
- privacy status
- validation result
- commit hash
- staging push status

## Validation

Always run local validation:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
cd apps/web && corepack pnpm test:e2e:local
```

Run Playwright because this touches analyze/result/unlock compatibility even if UI should not change.

## Constraints

Do not implement:

```text
free-only analyze behavior switch
deferred paid generation
paid generation worker
LINE bind trigger changes
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
product prompt/schema semantics
provider/model defaults
legal semantics
LINE production behavior
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
git commit -m "ops: verify two-tier phase one production"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- production migration status
- production deployment status
- production analyze result
- user_context_json result
- analysis_paid_results shadow result
- unlock/LINE regression result
- privacy/event result
- validation results
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
