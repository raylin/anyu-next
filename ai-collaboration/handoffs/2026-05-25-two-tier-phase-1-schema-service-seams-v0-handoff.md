# Handoff: Two-tier Phase 1 Schema + Service Seams v0

Date: 2026-05-25

Project: anyu-next / 暗語 ANYU

## Objective

Implement the additive Phase 1 foundation for the two-tier free/paid result architecture.

This task should add schema and service seams needed for future free-first analyze and deferred paid generation, while preserving the current user-visible behavior.

Current behavior must remain:

```text
analyze still generates current ProductResult shape
result pages still work
unlock/LINE fulfillment still work
paid result still exists for current flow
```

This task is an implementation task, but it must be additive and non-behavior-switching.

Do not switch analyze to free-only in this task.

Do not trigger deferred paid generation in this task.

Do not change LINE fulfillment behavior in this task.

Do not activate ads/payment.

## Background

Two-tier Free Analyze + Deferred Paid Generation v0 Implementation Plan completed.

Key findings:

```text
Current app stores one full ProductResult in analysis_results.normalized_result_json.
Current ProductResult requires paid_result.
Result/unlock/LINE flows assume paid content already exists.
```

Recommended architecture:

```text
- add separate analysis_paid_results table
- add analysis_requests.user_context_json
- create free/paid schema split adapters
- create service seams for future paid generation
- preserve current runtime behavior before switching analyze to free-only
```

Reason:

```text
Phase 1 should create additive structure and compatibility layers before runtime behavior changes.
```

Next later phases:

```text
Phase 2: Free-only Analyze v0
Phase 3: Deferred Paid Generation on LINE Bind v0
```

## Scope

Do:

1. Add DB migration for `analysis_paid_results`.
2. Add DB migration for `analysis_requests.user_context_json`.
3. Update DB schema/types.
4. Add paid result repository/service helpers.
5. Add free/paid result adapter helpers.
6. Preserve current analyze behavior.
7. Preserve current result/unlock/LINE behavior.
8. Ensure current full ProductResult can be adapted to new service seam.
9. Add tests.
10. Update docs/runbook if needed.
11. Create review bundle, execution report, summary log.
12. Commit and push to `origin/staging`.

Do not:

- switch analyze to free-only
- remove paid_result from current ProductResult
- defer paid generation yet
- enqueue paid generation
- change LINE bind/webhook behavior
- change unlocked route behavior except through compatible helper usage if needed
- change prompt/schema semantics
- change model/provider
- change production behavior
- start ads/payment/email delivery

## Data Model

### Add `analysis_paid_results`

Recommended table:

```text
analysis_paid_results
- id uuid primary key
- analysis_result_id uuid not null references analysis_results(id)
- module_slug text not null
- paid_result_json jsonb
- status text not null default 'completed' or 'pending' depending usage
- requested_by_unlock_intent_id uuid nullable references unlock_intents(id)
- requested_reason text nullable
- prompt_version text nullable
- schema_version text nullable
- model text nullable
- started_at timestamptz nullable
- completed_at timestamptz nullable
- failed_at timestamptz nullable
- error_code text nullable
- retry_count integer not null default 0
- retention_expires_at timestamptz nullable
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()
```

For Phase 1, since current analyze still generates paid result synchronously, choose one of:

```text
A. Populate analysis_paid_results during analyze as a shadow copy of current paid_result.
B. Only add table/service seam and keep shadow population for Phase 2.
```

Preferred if low-risk:

```text
Populate shadow analysis_paid_results for new analyzes while preserving normalized_result_json.
```

This helps verify future table without changing current UI.

If shadow write is too risky, defer and document.

Status values:

```text
pending
processing
completed
failed
expired
```

For shadow writes in current behavior:

```text
completed
```

### Add `analysis_requests.user_context_json`

Purpose:

```text
persist structured context chips so deferred paid generation can later use the original context
```

Rules:

```text
- store allowlisted context fields only
- no raw arbitrary text context
- nullable for legacy requests
```

## Migration

Add new Drizzle SQL migration:

```text
apps/web/drizzle/0005_two_tier_phase_1.sql
```

or next available migration number based on repo state.

Migration must be additive only.

Do not apply production migration in this task unless explicitly included in a later live verification task.

Document migration requirement.

## Service / Repository Seams

Add helpers such as:

```text
apps/web/src/lib/db/paid-results.ts
apps/web/src/lib/modules/result-adapters.ts
```

Adjust actual paths to repo style.

Needed capabilities:

```text
createPaidResultRecord
getPaidResultForAnalysisResult
markPaidResultProcessing
markPaidResultCompleted
markPaidResultFailed
adaptCurrentProductResultToFreeAndPaid
getPaidResultFromCurrentProductResult
```

Keep helpers small.

Do not overbuild a full job system.

## Adapter Requirements

Current ProductResult includes paid_result.

Future needs freeResult and paidResult separated.

Add adapter utilities:

```text
extractFreeResult(productResult)
extractPaidResult(productResult)
combineFreeAndPaidForLegacyDisplay(freeResult, paidResult)
adaptLegacyProductResult(productResult)
```

Names may differ.

Requirements:

```text
- existing result pages still render
- old stored results still render
- new shadow paid result records do not break old UI
- unlocked route can still read current persisted ProductResult
```

## Analyze Route Behavior

Preserve current behavior.

If adding shadow writes:

```text
after successful analysis_result insert
extract paid_result from ProductResult
insert completed analysis_paid_results row
store user_context_json on analysis_requests
```

Do not:

```text
remove paid_result from normalized_result_json
call provider twice
change response shape
change prompt/schema version
change cache key
```

If cache hit returns existing result, decide whether to backfill shadow paid result if missing. Keep low-risk:

```text
do not backfill on cache hit unless trivial and safe
document as future cleanup
```

## User Context Persistence

Current context chips are validated and used in prompt/cache.

Add storage:

```text
analysis_requests.user_context_json
```

Store only:

```text
relationshipStage
userGoal
primaryPain
replyTone
```

Do not store unknown keys/values.

Do not add context values to event metadata.

## Retention

Add retention_expires_at for `analysis_paid_results`.

Recommended:

```text
same retention horizon as analysis_results
```

Do not implement cleanup changes unless trivial and safe.

At minimum document:

```text
scheduled retention cleanup must later include analysis_paid_results before broader traffic
```

## Tests

Add/update tests for:

```text
migration/schema includes analysis_paid_results
migration/schema includes analysis_requests.user_context_json
user context is persisted with allowlisted fields only
unknown context not persisted
current analyze response shape unchanged
current paid_result still exists in normalized_result_json
shadow paid result row is created if implemented
legacy result adapter handles old ProductResult
paid result repository create/get/mark helpers work
result/unlock display remains compatible
event metadata does not include raw context values
```

If shadow write is not implemented, tests should cover service helpers and document deferred runtime wiring.

## Docs

Update if needed:

```text
apps/web/README.md
docs/operations/production-deployment-runbook.md
ai-collaboration/research/2026-05-25-two-tier-free-analyze-deferred-paid-generation-v0-implementation-plan.md
```

Document:

```text
Phase 1 is additive
no runtime behavior switch
migration required
analysis_paid_results is future paid-generation seam
user_context_json enables deferred paid generation
```

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-25-two-tier-phase-1-schema-service-seams-v0-review-bundle.md
```

Required sections:

```markdown
# Two-tier Phase 1 Schema + Service Seams v0 Review Bundle

Date: 2026-05-25

## 1. Summary

## 2. Schema Changes

## 3. analysis_paid_results Design

## 4. user_context_json Design

## 5. Service / Repository Helpers

## 6. Free/Paid Adapter Helpers

## 7. Analyze Behavior Compatibility

## 8. Shadow Write Behavior

## 9. Retention Implications

## 10. Tests Added

## 11. Migration / Rollout Notes

## 12. Known Limitations

## 13. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-25-two-tier-phase-1-schema-service-seams-v0-execution-report.md
```

Report structure:

```markdown
# Two-tier Phase 1 Schema + Service Seams v0 Execution Report

## Summary

## Files Created

## Files Updated

## Schema / Migration Changes

## Service / Adapter Changes

## Runtime Behavior

## Tests Added

## Validation Results

## Migration / Production Notes

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
- schema/service seam summary
- runtime behavior unchanged confirmation
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

Run Playwright because this touches core result/analyze compatibility, even if UI should not change.

If migration/schema changes are added, run relevant local schema checks/tests.

## Constraints

Do not implement:

```text
free-only analyze behavior switch
deferred paid generation
paid generation worker
LINE bind trigger changes
payment provider integration
production migration
production deploy
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
git commit -m "feat: add two-tier result seams"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- schema/migration summary
- user_context_json summary
- analysis_paid_results summary
- service/adapter helpers
- whether shadow write was implemented
- confirmation runtime behavior unchanged
- tests added
- validation results
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
