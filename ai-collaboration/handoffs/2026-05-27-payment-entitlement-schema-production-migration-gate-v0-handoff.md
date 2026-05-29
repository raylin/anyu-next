# Handoff: Payment / Entitlement Schema Production Migration Gate v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Apply and verify the additive `0007_payment_entitlements.sql` migration on production so production schema is ready for future NewebPay payment and entitlement work.

This is a production DB migration gate.

It must not change runtime payment behavior.

Do not enable payment.

Do not add checkout.

Do not implement NewebPay.

Do not change LINE behavior.

Do not change existing unlock route behavior.

## Background

Payment / Entitlement Schema Implementation v0 completed.

Commit:

```text
87ac2f4
```

Added:

```text
- 0007_payment_entitlements.sql
- payment_intents schema
- entitlements schema
- payment intent repository helpers
- entitlement repository helpers
- pa_ paid access token helper using HMAC-SHA256
- MerchantOrderNo helper
```

Payment / Entitlement Schema Staging Migration Verification v0 passed.

Commit:

```text
831ed7b
```

Staging verification confirmed:

```text
- 0007_payment_entitlements.sql applied to staging Neon only.
- payment_intents: 28/28 expected columns verified.
- entitlements: 23/23 expected columns verified.
- indexes / unique constraints / FKs verified.
- synthetic SQL smoke passed.
- token-hash rotation passed.
- refund state passed.
- synthetic rows cleaned up.
- final payment_intents row count: 0.
- final entitlements row count: 0.
- normal runtime writes: 0.
- staging route/API regression passed.
```

Current production status:

```text
- production 0007_payment_entitlements.sql is not applied yet.
- payment runtime is disabled.
- checkout is not implemented.
- NewebPay integration is not implemented.
- existing production behavior should remain unchanged.
```

Goal:

```text
Make production schema ready while keeping runtime behavior unchanged.
```

## Scope

Do:

1. Confirm approved migration file.
2. Confirm production health before migration.
3. Apply `0007_payment_entitlements.sql` to production DB only.
4. Verify `payment_intents` table exists.
5. Verify `entitlements` table exists.
6. Verify expected columns/defaults/indexes/unique constraints/FKs.
7. Run production route/API regression.
8. Confirm normal production runtime does not write to payment_intents or entitlements.
9. Record sanitized migration result.
10. Create review bundle, execution report, summary log.
11. Commit and push docs to `origin/staging`.

Do not:

- enable payment
- create checkout
- add NewebPay routes
- add payment return/notify routes
- add token resolver route behavior
- change existing unlock route behavior
- change LINE/LIFF/short-code behavior
- change paid generation behavior
- add queue provider integration
- store real payment data
- run real payment
- expose DB URLs/secrets/tokens/raw paid access tokens
- deploy production code unless required for docs-only report; migration is DB-only

## Production Migration Requirements

Apply only:

```text
apps/web/drizzle/0007_payment_entitlements.sql
```

to production DB.

Do not reapply earlier migrations unless checking migration history.

Verify production has required migrations through:

```text
0001 initial
0002 analyze_request_state
0003 line_fulfillment
0004 line_webhook_hardening
0005 two_tier_phase_1
0006 generation_jobs
0007 payment_entitlements
```

If production already has 0007, do not apply again; verify existing schema and document.

## Schema Verification

### payment_intents

Verify production table exists and includes expected columns:

```text
id
provider
provider_environment
merchant_order_no
module_slug
analysis_request_id
analysis_result_id
unlock_intent_id
amount_minor
currency
status
provider_status
provider_trade_no
provider_payment_type
provider_response_code
provider_message_category
checkout_started_at
notify_received_at
return_received_at
paid_at
failed_at
cancelled_at
expired_at
refund_requested_at
refunded_at
expires_at
created_at
updated_at
```

Verify expected indexes/constraints:

```text
unique merchant_order_no
provider + provider_trade_no
analysis_result_id
status + created_at
module_slug + created_at
```

### entitlements

Verify production table exists and includes expected columns:

```text
id
entitlement_type
source
status
module_slug
analysis_request_id
analysis_result_id
payment_intent_id
unlock_intent_id
generation_job_id
line_user_ref
paid_access_token_hash
paid_access_token_expires_at
paid_access_token_last_used_at
paid_access_token_last_rotated_at
remaining_uses
expires_at
activated_at
consumed_at
revoked_at
refunded_at
created_at
updated_at
```

Verify expected indexes/constraints:

```text
unique paid_access_token_hash where not null
payment_intent_id
analysis_result_id
module_slug + status
expires_at
```

Record only structural pass/fail.

Do not dump rows.

## Production Route/API Regression

Run safe production smoke after migration.

Minimum checks:

```text
1. GET https://anyu.tw/api/health and record safe build marker.
2. Landing route loads.
3. Synthetic analyze succeeds.
4. Result route loads.
5. Unlock intent succeeds.
6. Paid generation request works under current non-payment behavior.
7. Paid status route returns expected external status.
8. Unlocked route renders.
9. LIFF bridge route returns 200.
10. Invalid LIFF bind rejects.
11. Invalid LINE webhook signature rejects.
12. Empty-events webhook returns 200 if applicable.
```

Do not run real LINE client unless owner requests.

Do not record tokenized URLs, short codes, LINE IDs, raw input, paid JSON, provider output, paid access tokens, or secrets.

## Runtime Write Verification

After normal production route/API checks, verify:

```text
payment_intents row count remains 0
entitlements row count remains 0
```

or unchanged if there were preexisting rows.

Expected:

```text
No normal production runtime writes to payment_intents or entitlements in this phase.
```

If any row appears unexpectedly, classify as P0 unless explained by controlled synthetic repo smoke. This task should not create synthetic production payment rows unless absolutely necessary.

## Privacy / Data Safety

Reports must not include:

```text
DATABASE_URL
PAID_ACCESS_TOKEN_HASH_SECRET
raw paid access token
paid access token hash
raw input
redacted input text
full result JSON
paid_result_json
provider output
LINE user ID
LINE display name
ID token
LINE message text
fulfillment code
short code
unlock token
tokenized URL
email
ANTHROPIC_API_KEY
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
OPERATOR_TEST_SECRET
CRON_SECRET
INTERNAL_JOB_SECRET
QSTASH_TOKEN
NewebPay secrets
Merchant IDs
HashKey
HashIV
```

Allowed:

```text
table exists
column/index/constraint pass/fail
aggregate row counts
safe build marker
external route statuses
sanitized pass/fail
```

## Issue Severity

Classify findings:

```text
P0:
  production migration fails partially
  production runtime breaks
  runtime unexpectedly writes payment_intents/entitlements
  sensitive token/secret appears in report

P1:
  missing required index/constraint
  route/API regression
  schema mismatch versus staging

P2:
  naming/doc mismatch
  non-blocking verification gap
```

P0 requires stop/rollback recommendation.

P1 should be fixed before payment runtime integration.

## Rollback / Recovery

If migration fails:

```text
- stop
- do not continue smoke if DB state is uncertain
- document safe failure category
- recommend DB rollback only with owner approval
```

If runtime breaks:

```text
- migration is additive, so rollback may not be necessary
- confirm no runtime code path writes payment rows
- revert deployment only if code deployment caused regression
```

## Production Recommendation After Pass

If migration and smoke pass:

```text
production schema ready
payment runtime still disabled
checkout still absent
NewebPay integration still pending
runtime behavior unchanged
```

Recommended next step after pass:

```text
Wait for NewebPay approval, then run NewebPay Integration Architecture / Payment Runtime Plan.
```

or, if continuing foundation work:

```text
Paid Access Token Resolver Plan v0
```

But do not implement payment runtime until payment provider path is approved.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-27-payment-entitlement-schema-production-migration-gate-v0-review-bundle.md
```

Required sections:

```markdown
# Payment / Entitlement Schema Production Migration Gate v0 Review Bundle

Date: 2026-05-27

## 1. Summary

## 2. Pre-migration Production State

## 3. Migration Application

## 4. payment_intents Schema Verification

## 5. entitlements Schema Verification

## 6. Production Route/API Regression

## 7. Runtime Write Verification

## 8. Privacy / Data Safety

## 9. Issues Found

## 10. Production Recommendation

## 11. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-27-payment-entitlement-schema-production-migration-gate-v0-execution-report.md
```

Report structure:

```markdown
# Payment / Entitlement Schema Production Migration Gate v0 Execution Report

## Summary

## Files Created

## Files Updated

## Production Migration Status

## Schema Verification

## Runtime Regression Result

## Runtime Write Verification

## Validation Results

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

```text
date
task completed
production migration status
runtime regression status
runtime write verification
validation result
commit hash
staging push status
```

## Validation

Run full validation:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint
cd apps/web && corepack pnpm test
cd apps/web && corepack pnpm build
```

If code changes are made, also run:

```bash
cd apps/web && corepack pnpm test:e2e:local
```

If Playwright is blocked by known Chromium/MachPort issue, record honestly.

## Constraints

Do not implement:

```text
payment runtime
NewebPay API
checkout
payment return/notify routes
token resolver route
queue provider integration
request route enqueue-only
LINE enqueue-only
admin dashboard
membership
follow-up sessions
new module
ads
```

Do not modify:

```text
production behavior
LINE behavior
LIFF behavior
payment behavior
prompt/schema semantics
legal semantics
event names
existing unlock route behavior
```

Do not commit:

```text
.env
.env.local
merchant IDs
payment API keys
HashKey
HashIV
provider keys
DATABASE_URL
ANTHROPIC_API_KEY
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
OPERATOR_TEST_SECRET
CRON_SECRET
INTERNAL_JOB_SECRET
PAID_ACCESS_TOKEN_HASH_SECRET
QSTASH_TOKEN
QSTASH_CURRENT_SIGNING_KEY
QSTASH_NEXT_SIGNING_KEY
business registration documents
bank documents
identity documents
owner personal email
owner personal phone
private address
raw production exports
raw private user content
tokens/tokenized URLs/LINE IDs
paid_result_json dumps
raw provider output
dedupe keys
job IDs
raw paid access tokens in reports
paid access token hashes in reports
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "ops: apply payment entitlement production migration"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
production migration status
payment_intents verification
entitlements verification
runtime regression status
runtime write verification
production recommendation
validation results
review bundle path
commit hash
staging push status
Tech Debt / Cleanup Notes
recommended next step
```

Then stop.
