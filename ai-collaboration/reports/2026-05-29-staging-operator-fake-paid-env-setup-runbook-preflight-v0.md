# Staging Operator Fake-Paid Env Setup Runbook + Preflight v0

## Summary
This runbook defines the staging-only environment setup and preflight checks required before rerunning authorized fake paid delivery QA.

The current blocker is environmental: staging returns the feature-disabled `404` response for `POST /api/operator/fake-paid-success`, which means `ENABLE_OPERATOR_FAKE_PAID_SUCCESS=true` is not active on the current staging deployment.

This document does not include secrets and does not change runtime behavior.

## Manual Action Required
The project owner or an operator with authenticated Vercel access must configure staging/preview environment variables outside the repository:

1. Set `ENABLE_OPERATOR_FAKE_PAID_SUCCESS=true` for Preview/Staging only.
2. Set `OPERATOR_TEST_SECRET` for Preview/Staging only.
3. Set `INTERNAL_JOB_SECRET` for Preview/Staging only if the full smoke should run the manual processor endpoint.
4. Set `CRON_SECRET` for Preview/Staging only if the cron-authorized path is intentionally tested.
5. Do not set or enable these fake-paid QA flags for Production unless a separate explicit production QA decision exists.
6. Confirm `ENABLE_PAYMENT_RUNTIME` remains disabled.
7. Confirm no NewebPay checkout, notify, or return runtime flags are enabled.
8. Redeploy or refresh staging after env changes so the deployment receives the updated env.

## Required Environment Variables
| Variable | Required For | Scope | Purpose |
|---|---|---|---|
| `ENABLE_OPERATOR_FAKE_PAID_SUCCESS=true` | Fake-paid endpoint access | Preview/Staging only | Enables `POST /api/operator/fake-paid-success` to reach operator-secret validation instead of returning feature-disabled `404`. |
| `OPERATOR_TEST_SECRET` | Authorized fake-paid QA | Preview/Staging only | Shared secret expected in `x-operator-test-secret`; required to create fake paid payment intent, entitlement, and generation job. |
| `INTERNAL_JOB_SECRET` | Manual processor path | Preview/Staging only, if processor included | Authorizes `POST /api/internal/jobs/process` to process the created paid generation job. |
| `CRON_SECRET` | Cron wrapper path | Preview/Staging only, optional | Authorizes `GET /api/cron/paid-generation` if the cron-wrapper path is intentionally tested. |

Do not enable payment runtime for this QA. Fake-paid QA is separate from real provider/payment behavior.

## Vercel Environment Scope Checklist
Before rerunning QA, verify:

- `ENABLE_OPERATOR_FAKE_PAID_SUCCESS` exists for Preview/Staging.
- `OPERATOR_TEST_SECRET` exists for Preview/Staging.
- `INTERNAL_JOB_SECRET` exists for Preview/Staging if the processor endpoint will be run.
- `CRON_SECRET` exists for Preview/Staging only if the cron wrapper will be tested.
- These fake-paid QA settings are not configured for Production unless separately approved.
- `ENABLE_PAYMENT_RUNTIME` remains false or absent.
- NewebPay runtime flags remain false or absent.
- A fresh staging deployment was created after env changes.
- `https://staging.anyu.tw/api/health` points to the intended latest staging commit.

## Secret Handling Rules
- Never print `OPERATOR_TEST_SECRET`, `INTERNAL_JOB_SECRET`, or `CRON_SECRET`.
- Never commit secrets.
- Never paste secrets into reports, screenshots, shell history examples, or chat.
- Never commit raw `pa_` tokens.
- Never commit tokenized URLs.
- Use shell environment variables locally instead of inline command literals.
- Store temporary command outputs outside the repo or ensure they contain only sanitized booleans/statuses.
- Redact request/response examples before committing docs.

## Safe Preflight Checks After Env Setup
Run these checks after staging env is configured and staging is redeployed.

### 1. Staging Health
Expected:
- `ok: true`
- `gitBranch: staging`
- `gitCommit` is the intended candidate

Example:

```bash
curl -fsS https://staging.anyu.tw/api/health
```

### 2. Missing Operator Secret Rejection
Expected after flag is enabled:
- HTTP `401`
- safe `unauthorized` error
- not HTTP `404`

Request shape:

```bash
curl -sS -o /tmp/fake-paid-missing-secret.json -w "%{http_code}" \
  -X POST "https://staging.anyu.tw/api/operator/fake-paid-success" \
  -H "content-type: application/json" \
  --data '{"moduleSlug":"ambiguous-temperature","resultId":"00000000-0000-0000-0000-000000000000"}'
```

### 3. Invalid Operator Secret Rejection
Expected after flag is enabled:
- HTTP `401`
- safe `unauthorized` error
- not HTTP `404`

Request shape:

```bash
curl -sS -o /tmp/fake-paid-invalid-secret.json -w "%{http_code}" \
  -X POST "https://staging.anyu.tw/api/operator/fake-paid-success" \
  -H "content-type: application/json" \
  -H "x-operator-test-secret: ${INVALID_OPERATOR_TEST_SECRET}" \
  --data '{"moduleSlug":"ambiguous-temperature","resultId":"00000000-0000-0000-0000-000000000000"}'
```

### 4. Valid Operator Secret Reaches Fake-paid Path
Use an environment variable, not an inline secret.

Expected:
- No feature-disabled `404`.
- With a dummy `resultId`, expected response is a safe app-level failure such as `404 result_not_found`.
- With a real staging result id, expected response is success and redacted QA metadata.

Request shape:

```bash
curl -sS -o /tmp/fake-paid-valid-secret.json -w "%{http_code}" \
  -X POST "https://staging.anyu.tw/api/operator/fake-paid-success" \
  -H "content-type: application/json" \
  -H "x-operator-test-secret: ${OPERATOR_TEST_SECRET}" \
  --data '{"moduleSlug":"ambiguous-temperature","resultId":"00000000-0000-0000-0000-000000000000"}'
```

Pass criterion:
- The endpoint no longer returns feature-disabled `404` when a valid secret is supplied.
- Do not commit `/tmp/fake-paid-valid-secret.json` if it contains any private access value.

### 5. Processor Endpoint Still Requires Auth
Expected:
- HTTP `401` without authorization.

```bash
curl -sS -o /tmp/processor-missing-auth.json -w "%{http_code}" \
  -X POST "https://staging.anyu.tw/api/internal/jobs/process" \
  -H "content-type: application/json" \
  --data '{"jobType":"paid_analysis","limit":1,"dryRun":true}'
```

### 6. Production Remains Disabled
If production visibility is available, verify:

- Production fake-paid endpoint is not publicly usable.
- Production payment runtime remains disabled.
- NewebPay checkout/notify/return behavior remains disabled.

Minimum safe check:

```bash
curl -sS -o /tmp/prod-fake-paid-missing-secret.json -w "%{http_code}" \
  -X POST "https://anyu.tw/api/operator/fake-paid-success" \
  -H "content-type: application/json" \
  --data '{"moduleSlug":"ambiguous-temperature","resultId":"00000000-0000-0000-0000-000000000000"}'
```

Expected:
- Not publicly usable.
- Do not enable production fake-paid QA as part of staging setup.

## Authorized QA Rerun Trigger
Rerun Staging Fake Paid Delivery QA with authorized operator gate only when all conditions are true:

- Staging fake-paid endpoint no longer returns feature-disabled `404` with a valid operator secret.
- Missing operator secret returns `401`.
- Invalid operator secret returns `401`.
- A staging Module 01 `resultId` is available.
- The QA shell has `OPERATOR_TEST_SECRET` securely available as an environment variable.
- The QA shell has `INTERNAL_JOB_SECRET` securely available if processor completion is part of the run.
- Production fake-paid and payment runtime remain disabled.

## Redacted Response Recording Rules
Allowed in reports:

- HTTP status.
- `ok` boolean.
- payment intent id presence, not necessarily full id.
- entitlement id presence, not necessarily full id.
- generation job id presence, not necessarily full id.
- payment intent status.
- entitlement status.
- generation job status.
- access state.
- booleans such as `paidAccessTokenReturned`, `unlockPathPresent`, `generationJobCreated`.

Forbidden in reports:

- Raw `pa_` token.
- Tokenized unlock path or full URL.
- Operator secret.
- Internal processor or cron secret.
- Provider credentials.
- Raw user input.
- Provider output.
- `paid_result_json`.
- LINE IDs or reply tokens.

## Optional Improvement Evaluation
A safe preflight improvement would reduce repeated blocked QA attempts.

Recommended follow-up, not implemented here:

- Add an operator-gated or staging-only preflight endpoint that returns aggregate booleans such as `fakePaidFlagEnabled`, `operatorSecretConfigured`, and `processorConfigured`.
- The endpoint must not expose secret values.
- It should remain disabled in production unless explicitly approved.
- It should not create payment intents, entitlements, generation jobs, or tokens.

This is useful but not required before the next QA rerun. The current route behavior is enough to distinguish flag-disabled `404` from secret-validation `401`.

## Exact Next QA Task
After manual staging env setup, run:

`Staging Fake Paid Delivery QA Rerun with Authorized Operator Gate v0`

Required secure local environment for that task:

```bash
read -rsp "OPERATOR_TEST_SECRET: " OPERATOR_TEST_SECRET
export OPERATOR_TEST_SECRET
read -rsp "INTERNAL_JOB_SECRET, if processor path is included: " INTERNAL_JOB_SECRET
export INTERNAL_JOB_SECRET
```

Do not paste real values into chat, reports, shell snippets, or commits.

## Validation
No code changed. Full compile/lint/test/build validation is not required for this runbook-only task.

Lightweight documentation validation performed:

- File created under `ai-collaboration/reports/`.
- Handoff created under `ai-collaboration/handoffs/`.
- Summary log updated.
- Secret/token pattern scan run before commit.

## Tech Debt Review
### New Technical Debt Introduced
None. Documentation only.

### Existing Technical Debt Observed
- Staging fake-paid QA requires manual Vercel env coordination.
- No safe aggregate preflight endpoint exists for operator QA readiness.
- Processor execution remains manual/operator-secret gated until a future queue trigger is implemented.

### Opportunistic Cleanup Completed
None.

### Deferred Cleanup Candidates
- Add a safe staging-only/operator-gated preflight endpoint if repeated env-blocked QA continues.
- Add this runbook to a broader payment QA operations index once payment launch work expands.

## Recommended Next Step
Complete the manual staging env setup, redeploy staging, then rerun authorized fake paid delivery QA.
