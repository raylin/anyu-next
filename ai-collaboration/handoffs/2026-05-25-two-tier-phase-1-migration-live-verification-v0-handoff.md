# Handoff: Two-tier Phase 1 Migration Live Verification v0

Date: 2026-05-25

Project: anyu-next / 暗語 ANYU

## Objective

Apply and verify the additive Two-tier Phase 1 schema/service seams in live environments.

This task should apply `0005_two_tier_phase_1.sql` to staging first, verify the new schema and shadow paid-result seam, then apply to production only if staging passes and the migration is confirmed additive/safe.

This is a migration + live verification task.

Do not switch analyze to free-only.

Do not trigger deferred paid generation.

Do not change LINE fulfillment behavior.

Do not implement payment, ads, email delivery, or production growth work.

## Background

Two-tier Phase 1 Schema + Service Seams v0 completed.

Commit:

```text
c3cdf9a
```

What changed:

```text
- Added additive migration 0005_two_tier_phase_1.sql.
- Added analysis_paid_results table.
- Added nullable analysis_requests.user_context_json.
- Added paid-result repository helpers.
- Added free/paid result adapter helpers.
- Fresh analyze still generates/stores full current ProductResult.
- Fresh analyze now attempts a best-effort completed shadow paid-result row.
- Result/unlock/LINE behavior is unchanged.
```

Important:

```text
Current runtime code now references new Phase 1 schema.
Live DB must have 0005 before deploying this code broadly.
```

Recommended next step:

```text
Run Two-tier Phase 1 Migration Live Verification v0 on staging before deploying this code to any live runtime traffic.
```

## Scope

Do:

1. Confirm current staging deployment status and candidate commit.
2. Apply `apps/web/drizzle/0005_two_tier_phase_1.sql` to staging/preview DB.
3. Verify staging schema:
   - `analysis_paid_results` exists.
   - `analysis_requests.user_context_json` exists.
   - indexes/constraints exist as intended.
4. Run staging synthetic analyze with context chips.
5. Verify staging analyze still returns current full result shape.
6. Verify `analysis_requests.user_context_json` stores allowlisted context only.
7. Verify shadow `analysis_paid_results` row is created for fresh analyze if implemented.
8. Verify result page loads.
9. Verify unlock intent still works.
10. Verify unlocked route still works.
11. Verify LINE fulfillment route-level behavior is not regressed.
12. Verify event/privacy metadata remains safe.
13. If staging passes, optionally apply 0005 to production DB.
14. If production migration is applied, run a narrow synthetic production smoke.
15. Create review bundle, execution report, summary log.
16. Commit and push to `origin/staging`.

Do not:

- switch analyze to free-only
- remove paid_result from ProductResult
- implement deferred paid generation
- enqueue provider jobs
- change LINE bind/webhook behavior
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

Apply staging first.

Expected changes:

```text
analysis_paid_results table
analysis_requests.user_context_json column
related indexes/constraints
```

Rules:

```text
- Verify before/after schema without dumping private rows.
- Do not print DATABASE_URL.
- Do not expose raw result JSON.
- Do not expose paid_result_json.
- Do not expose user input.
```

## Staging Verification

Use staging:

```text
https://staging.anyu.tw/m/ambiguous-temperature
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
analyze succeeds
full current ProductResult response still works
result page loads
paid result v2 still present in current normalized_result_json
analysis_requests.user_context_json persisted with allowlisted context
analysis_paid_results shadow row exists with completed status if shadow write is active
unlock intent succeeds
unlocked route loads
LINE fulfillment route-level checks still pass
```

Do not paste tokenized URLs, codes, LINE IDs, raw input, raw provider output, or raw result JSON into reports.

## Production Gate

Production is live.

Only apply production 0005 if staging passes and migration is confirmed additive.

If production is applied, run narrow production smoke with synthetic input/context.

Production smoke should verify:

```text
production analyze succeeds
result page loads
user_context_json exists/persisted
analysis_paid_results shadow row exists if active
unlock intent still works
unlocked route still works
privacy/event metadata safe
```

Do not run real production OA short-code smoke unless explicitly necessary. This migration should not require LINE OA human smoke.

If production migration is not applied, document:

```text
production 0005 pending
production app deployment should not move to c3cdf9a+ until DB is migrated
```

## Shadow Paid Result Verification

If Phase 1 implemented shadow write:

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
unknown fields not persisted
no raw arbitrary context text
event metadata does not contain context values
```

Allowed report:

```text
context persisted: yes
field count: 4
unknown context rejected/ignored: yes
```

Do not paste raw context values into event metadata examples if not needed.

## LINE / Unlock Regression Checks

Verify route-level only:

```text
unlock intent still returns fulfillment code/token
unlocked route loads
LIFF page route loads
bind route still rejects invalid token/idToken as expected
webhook invalid signature still rejects
```

Do not send production LINE OA messages.

Staging test OA message smoke is optional and not required for this migration.

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

`analysis_paid_results` introduces a new retained content table.

This task should document:

```text
analysis_paid_results retention cleanup is not wired yet
scheduled retention cleanup must include analysis_paid_results before broader traffic / ads
```

Do not implement retention cleanup unless tiny and explicitly safe; likely defer.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-25-two-tier-phase-1-migration-live-verification-v0-review-bundle.md
```

Required sections:

```markdown
# Two-tier Phase 1 Migration Live Verification v0 Review Bundle

Date: 2026-05-25

## 1. Summary

## 2. Migration Status

## 3. Staging Schema Verification

## 4. Staging Analyze Verification

## 5. user_context_json Verification

## 6. analysis_paid_results Shadow Verification

## 7. Result / Unlock / LINE Regression Checks

## 8. Production Migration / Smoke Status

## 9. Event / Privacy Verification

## 10. Retention Implications

## 11. Known Limitations

## 12. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-25-two-tier-phase-1-migration-live-verification-v0-execution-report.md
```

Report structure:

```markdown
# Two-tier Phase 1 Migration Live Verification v0 Execution Report

## Summary

## Files Created

## Files Updated

## Staging Migration Status

## Staging Smoke Results

## Shadow Paid Result Status

## User Context Persistence Status

## Production Migration Status

## Production Smoke Results

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
- staging migration status
- staging smoke status
- production migration status
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
git commit -m "ops: verify two-tier phase one migration"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- staging migration status
- staging analyze result
- user_context_json result
- analysis_paid_results shadow result
- unlock/LINE regression result
- production migration/smoke status
- privacy/event result
- validation results
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
