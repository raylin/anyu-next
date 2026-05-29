# Debug Authorized Fake-Paid 500 on Staging v0 Execution Report

## Summary
The authorized fake-paid staging 500 is caused by missing paid access token hash configuration during first-time entitlement creation.

The fake-paid endpoint successfully passes the operator gate, creates/reaches the business path, then attempts to create an `operator_test` entitlement. Entitlement creation generates a raw `pa_` token and stores only its HMAC hash. If `PAID_ACCESS_TOKEN_HASH_SECRET` is missing, `hashPaidAccessToken` throws `paid_access_token_hash_secret_missing`. Before this fix, that exception escaped and produced an uncategorized HTTP 500, so the runner saw no payment intent, entitlement, generation job, or token metadata.

## Root Cause
Missing staging env:

```text
PAID_ACCESS_TOKEN_HASH_SECRET
```

This is required for hash-at-rest paid access tokens.

## Fix Applied
Implemented a minimal safe server-side guard and categorization:

- Pre-check `PAID_ACCESS_TOKEN_HASH_SECRET` before creating new fake payment rows when no entitlement exists.
- Return safe `503` category `paid_access_token_config_missing` instead of uncategorized 500.
- Categorize payment intent creation failure as `payment_intent_create_failed`.
- Categorize payment intent paid transition failure as `payment_intent_transition_failed`.
- Categorize token-hash failure during entitlement creation as `paid_access_token_create_failed`.
- Categorize other entitlement failures as `entitlement_create_failed`.
- Categorize generation job creation/reuse failure as `generation_job_create_failed`.
- Updated the secret-safe runner to stop cleanly on categorized fake-paid failure instead of throwing `paid_access_token_missing`.

This avoids creating new partial fake-paid rows when the paid access token hash secret is missing.

## Files Changed
- `apps/web/src/lib/payments/operator-fake-paid-success.ts`
- `apps/web/scripts/authorized-fake-paid-qa.mjs`
- `apps/web/src/tests/operator-fake-paid-success.test.ts`
- `apps/web/src/tests/operator-fake-paid-success-route.test.ts`
- `ai-collaboration/handoffs/2026-05-29-debug-authorized-fake-paid-500-staging-v0-handoff.md`
- `ai-collaboration/reports/2026-05-29-debug-authorized-fake-paid-500-staging-v0-execution-report.md`
- `ai-collaboration/summaries/summary_log.md`

## Before / After
Before, sanitized runner output showed:

```json
{"step":"fake_paid_authorized_first","outcome":"fail","httpStatus":500,"ok":false,"paymentIntentIdPresent":false,"entitlementIdPresent":false,"generationJobIdPresent":false,"paidAccessTokenPresent":false,"unlockPathPresent":false}
{"step":"runner_error","outcome":"fail","error":"paid_access_token_missing"}
```

After this fix, if staging is still missing `PAID_ACCESS_TOKEN_HASH_SECRET`, expected sanitized output is:

```json
{"step":"fake_paid_authorized_first","outcome":"fail","httpStatus":503,"ok":false,"error":"paid_access_token_config_missing","paymentIntentIdPresent":false,"entitlementIdPresent":false,"generationJobIdPresent":false,"paidAccessTokenPresent":false,"unlockPathPresent":false}
{"step":"final_summary","outcome":"blocked","reason":"paid_access_token_config_missing","fullQaPassed":false}
```

After staging config is fixed and this commit is deployed, expected first-pass output should include:

```json
{"step":"fake_paid_authorized_first","outcome":"pass","paymentIntentIdPresent":true,"entitlementIdPresent":true,"generationJobIdPresent":true,"paidAccessTokenPresent":true,"unlockPathShape":"/m/ambiguous-temperature/unlock/[REDACTED]"}
```

## Security / Privacy
- No raw `pa_` tokens were committed.
- No tokenized URLs were committed.
- No operator or processor secrets were committed.
- No provider credentials, raw input, provider output, `paid_result_json`, LINE IDs, or private values were recorded.
- The runner remains secret-safe and token-redacting.

## Validation Results
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed, 43 test files / 288 tests.
- `cd apps/web && corepack pnpm build`: passed and confirmed `/api/operator/fake-paid-success` is present in the route bundle.
- `cd apps/web && corepack pnpm qa:fake-paid` without secrets: safely blocked with `operator_secret_missing` after sanitized route/gate checks; no authorized fake-paid business path was attempted.
- Targeted regression: `cd apps/web && corepack pnpm vitest run src/tests/operator-fake-paid-success.test.ts src/tests/operator-fake-paid-success-route.test.ts`: passed, 2 files / 9 tests.

## Staging Follow-up
To make authorized fake-paid success actually pass, staging must have:

- `PAID_ACCESS_TOKEN_HASH_SECRET`
- `OPERATOR_TEST_SECRET`
- `INTERNAL_JOB_SECRET` if processor completion is included

Then deploy this fix and rerun:

```bash
cd apps/web
corepack pnpm qa:fake-paid
```

Do not print or commit any secret values.

## Tech Debt Review
### New Technical Debt Introduced
None significant. The fake-paid route now has explicit error categories but still depends on staging env coordination.

### Existing Technical Debt Observed
- Staging paid access token config readiness is not visible in `/api/health`.
- Fake-paid QA still depends on operator-managed env secrets.

### Opportunistic Cleanup Completed
- Runner now reports categorized fake-paid failure cleanly instead of throwing a secondary `paid_access_token_missing` error.

### Deferred Cleanup Candidates
- Add an operator-gated readiness endpoint that returns safe booleans for fake-paid flag, operator secret presence, processor secret presence, and paid access token hash secret presence.

## Recommended Next Step
Configure `PAID_ACCESS_TOKEN_HASH_SECRET` on staging, deploy this fix, then rerun the secret-safe fake-paid QA runner with `OPERATOR_TEST_SECRET` and `INTERNAL_JOB_SECRET` available securely.
