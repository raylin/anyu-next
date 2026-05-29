# Handoff: Payment / Entitlement Schema Staging Migration Verification v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Apply and verify the additive `0007_payment_entitlements.sql` migration on staging, then run safe repository-level smoke tests to confirm the future payment/entitlement foundations work without changing current runtime behavior.

This is a staging migration verification task.

Do not apply production migration.

Do not enable payment.

Do not implement checkout.

Do not implement NewebPay.

Do not change LINE behavior.

Do not change existing unlock route behavior.

Do not change production behavior.

## Background

Payment / Entitlement Schema Implementation v0 completed.

Commit:

```text
87ac2f4
```

Added:

```text
- apps/web/drizzle/0007_payment_entitlements.sql
- payment_intents schema
- entitlements schema
- payment intent repository helpers
- entitlement repository helpers
- pa_ paid access token helper using HMAC-SHA256
- dedicated PAID_ACCESS_TOKEN_HASH_SECRET requirement
- MerchantOrderNo helper
- tests
```

Important implementation decisions:

```text
- payment remains disabled
- no checkout/NewebPay/payment routes were added
- LINE behavior unchanged
- unlock route behavior unchanged
- raw paid access token is returned only on create/rotation; DB stores hash only
- amount_minor + currency used
- text statuses + app constants used
```

Next gate:

```text
Verify 0007_payment_entitlements.sql on staging DB and run synthetic repo smoke.
```

## Scope

Do:

1. Confirm staging deployment/code freshness includes commit `87ac2f4` or newer.
2. Apply `0007_payment_entitlements.sql` to staging DB only.
3. Verify `payment_intents` table exists.
4. Verify `entitlements` table exists.
5. Verify expected columns, defaults, indexes, and unique constraints.
6. Verify repository helpers against staging using synthetic data.
7. Verify paid access token hashing/lookup/rotation using staging-safe secret handling.
8. Verify synthetic rows are cleaned up.
9. Confirm normal runtime routes do not write payment_intents or entitlements.
10. Run staging route/API regression checks.
11. Record sanitized pass/fail only.
12. Create review bundle, execution report, summary log.
13. Commit and push docs to `origin/staging`.

Do not:

- apply migration to production
- deploy production
- enable payment
- add checkout
- add NewebPay env/secrets/routes
- change existing runtime behavior
- change LINE/LIFF/short-code behavior
- change unlock route token resolver
- create real payment rows from user flow
- store or print raw paid access tokens in reports
- print PAID_ACCESS_TOKEN_HASH_SECRET
- record raw input, paid_result_json, provider output, tokens, LINE IDs, or secrets

## Staging Migration Requirements

Apply only:

```text
apps/web/drizzle/0007_payment_entitlements.sql
```

to staging / preview DB.

Do not apply to production.

Verify migration order:

```text
0001 initial
0002 analyze_request_state
0003 line_fulfillment
0004 line_webhook_hardening
0005 two_tier_phase_1
0006 generation_jobs
0007 payment_entitlements
```

If staging DB already has 0007, verify idempotently and document.

## Schema Verification

### payment_intents

Verify table exists and includes expected columns:

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

Verify table exists and includes expected columns:

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

Record only structural facts.

Do not dump user rows.

## Staging-safe Secret Handling

Paid access token hash requires:

```text
PAID_ACCESS_TOKEN_HASH_SECRET
```

For staging repo smoke:

```text
- Use staging env secret if already configured.
- If not configured, use a temporary shell-only test secret for local/repo smoke.
- Do not print the secret.
- Do not commit the secret.
- Do not write secret into docs.
```

If staging runtime verification requires the secret and it is missing, record as blocked and do not create runtime rows.

## Synthetic Repository Smoke

Use synthetic IDs and synthetic rows only.

Preferred smoke sequence:

```text
1. Create synthetic payment_intent.
2. Verify MerchantOrderNo uniqueness/format.
3. Mark checkout_started.
4. Mark paid with sanitized provider refs.
5. Create payment_single entitlement linked to payment_intent.
6. Verify raw pa_ token returned once.
7. Verify DB stores only hash, not raw token.
8. Lookup entitlement by raw token.
9. Rotate paid access token.
10. Verify old token no longer resolves or behaves according to implementation.
11. Mark entitlement refunded/revoked/expired in separate synthetic cases if practical.
12. Mark payment refund_pending/refunded.
13. Cleanup all synthetic rows.
```

If using transactions, rollback after verification.

If cleanup is manual, verify final synthetic row count is 0.

Do not use real customer/user data.

Do not record raw pa_ token in report.

Do not record token hash in report unless necessary; prefer pass/fail.

## Runtime Regression Checks

Because runtime should be unchanged, run safe staging checks:

```text
1. GET /api/health.
2. Landing route loads.
3. Synthetic analyze succeeds.
4. Result route loads.
5. Unlock intent succeeds.
6. Paid generation request works under current behavior.
7. Paid status route returns expected external status.
8. Unlocked route renders.
9. LIFF bridge route returns 200.
10. Invalid LIFF bind rejects.
11. Invalid LINE webhook signature rejects.
12. Empty-events webhook returns 200 if applicable.
```

Do not run real LINE client unless explicitly requested.

Do not record tokenized URLs, short codes, LINE IDs, raw input, paid JSON, provider output, or secrets.

## Confirm No Runtime Writes

After normal staging route/API checks, verify:

```text
payment_intents row count unchanged
entitlements row count unchanged
```

excluding synthetic smoke rows if any.

Expected:

```text
No normal runtime writes to payment_intents or entitlements in this phase.
```

If rows appear unexpectedly, classify as P0 unless explained by controlled synthetic repo smoke.

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
synthetic smoke pass/fail
```

## Issue Severity

Classify findings:

```text
P0:
  migration breaks staging runtime
  sensitive token/secret appears in report
  runtime unexpectedly writes payment_intents/entitlements
  token helper stores raw token

P1:
  missing required unique/index/constraint
  repository helper fails against staging schema
  token lookup/rotation fails
  route/API regression

P2:
  naming mismatch
  non-blocking index/doc mismatch
```

P0 blocks production migration consideration.

P1 should be fixed before production migration.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-27-payment-entitlement-schema-staging-migration-verification-v0-review-bundle.md
```

Required sections:

```markdown
# Payment / Entitlement Schema Staging Migration Verification v0 Review Bundle

Date: 2026-05-27

## 1. Summary

## 2. Staging Freshness

## 3. Migration Application

## 4. payment_intents Schema Verification

## 5. entitlements Schema Verification

## 6. Synthetic Repository Smoke

## 7. Token Safety Verification

## 8. Runtime Regression Checks

## 9. Runtime Write Verification

## 10. Privacy / Data Safety

## 11. Issues Found

## 12. Production Migration Recommendation

## 13. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-27-payment-entitlement-schema-staging-migration-verification-v0-execution-report.md
```

Report structure:

```markdown
# Payment / Entitlement Schema Staging Migration Verification v0 Execution Report

## Summary

## Files Created

## Files Updated

## Migration Status

## Schema Verification

## Synthetic Repo Smoke

## Token Safety Result

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
staging migration status
synthetic repo smoke status
runtime regression status
production migration recommendation
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

## Production Gate

Do not apply production migration.

If staging verification passes, recommended next step should be:

```text
Payment / Entitlement Schema Production Migration Gate v0
```

or defer production migration until payment integration is imminent.

Given runtime does not use the tables yet, production migration can be deferred unless owner wants schema readiness.

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
git commit -m "ops: verify payment entitlement staging migration"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
staging migration status
payment_intents verification
entitlements verification
synthetic repo smoke status
token safety result
runtime regression status
runtime write verification
production migration recommendation
validation results
review bundle path
commit hash
staging push status
Tech Debt / Cleanup Notes
recommended next step
```

Then stop.
