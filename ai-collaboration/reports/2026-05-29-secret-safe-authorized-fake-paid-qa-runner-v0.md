# Secret-Safe Authorized Fake-Paid QA Runner v0

## Summary
Added a local-only authorized fake-paid QA runner for staging. The runner reads secrets only from environment variables and emits sanitized JSON lines that are safe to paste into a QA report.

This task does not run the authorized flow because the current shell does not have the required secrets. It adds the runner and runbook so the owner/operator can inject secrets locally without exposing them in chat, command output, or committed docs.

## Runner
Path:

```bash
apps/web/scripts/authorized-fake-paid-qa.mjs
```

Package script:

```bash
cd apps/web
corepack pnpm qa:fake-paid
```

## Secret Handling
The runner reads:

- `OPERATOR_TEST_SECRET`
- `INTERNAL_JOB_SECRET`

The runner never prints:

- secret values
- secret lengths
- secret prefixes or suffixes
- secret hashes or derived values

The runner prints only presence:

```json
{"step":"secret_preflight","outcome":"pass","OPERATOR_TEST_SECRET":"present","INTERNAL_JOB_SECRET":"present"}
```

If `OPERATOR_TEST_SECRET` is missing, the runner stops after safe preflight checks and reports `operator_secret_missing`.

If `INTERNAL_JOB_SECRET` is missing, the runner can complete fake-paid and idempotency checks but stops before processor completion and reports a partial result.

## Token Redaction Guarantees
The runner keeps the raw `pa_` token in memory only for:

- paid-result status polling
- `pa_` unlock page checks

It never prints or writes:

- raw `pa_` token
- tokenized unlock URL
- tokenized route path

It prints only redacted route shape:

```json
{"unlockPathShape":"/m/ambiguous-temperature/unlock/[REDACTED]"}
```

The runner also avoids printing:

- raw user input
- result id values
- payment intent id values
- entitlement id values
- generation job id values
- provider output
- `paid_result_json`
- LINE IDs
- private values

For ids, it emits presence booleans and statuses, for example:

```json
{
  "paymentIntentIdPresent": true,
  "paymentIntentStatus": "paid",
  "entitlementIdPresent": true,
  "entitlementStatus": "active",
  "generationJobIdPresent": true,
  "generationJobStatus": "queued"
}
```

## How To Run
From a local shell, set secrets without echoing them:

```bash
cd apps/web
read -rsp "OPERATOR_TEST_SECRET: " OPERATOR_TEST_SECRET
export OPERATOR_TEST_SECRET
read -rsp "INTERNAL_JOB_SECRET: " INTERNAL_JOB_SECRET
export INTERNAL_JOB_SECRET
corepack pnpm qa:fake-paid
```

If processor completion should be skipped, omit `INTERNAL_JOB_SECRET`. The runner will report a partial QA result, not a pass.

## What The Runner Checks
The runner performs:

1. Secret presence preflight.
2. Staging `/api/health` marker check.
3. Fake-paid missing/invalid secret route-gate checks.
4. Invalid synthetic `pa_` paid-access regression.
5. Normal Module 01 source analyze and result page check.
6. Legacy unlock intent and unlock page regression.
7. Authorized fake-paid success using `OPERATOR_TEST_SECRET`.
8. Idempotent repeat fake-paid request.
9. Paid-result status polling using in-memory `pa_` token.
10. `pa_` unlock page check.
11. Manual processor call using `INTERNAL_JOB_SECRET`, when present.
12. Paid-result status polling until completed.
13. Completed `pa_` unlock page rendering check.

## Safe Output
The output is newline-delimited JSON objects. Safe examples:

```json
{"step":"staging_health_marker","outcome":"pass","routeBundleVersion":"payment-foundation-2026-05-29"}
{"step":"fake_paid_authorized_first","outcome":"pass","paymentIntentIdPresent":true,"paidAccessTokenPresent":true,"unlockPathShape":"/m/ambiguous-temperature/unlock/[REDACTED]"}
{"step":"fake_paid_idempotency","outcome":"pass","idsReused":true,"secondPaidAccessTokenReturned":false}
{"step":"final_summary","outcome":"pass","fullQaPassed":true}
```

Before pasting output into a report, confirm it contains no raw `pa_` token and no `/unlock/<token>` path.

## Validation
Because a script changed, validation included:

- `cd apps/web && corepack pnpm lint`: PASS
- `cd apps/web && corepack pnpm qa:fake-paid` without secrets: PASS for safe blocked behavior; exits with code `2` after sanitized preflight and `operator_secret_missing`

Full app tests/build are not required because no app runtime code changed. They can be run if a later task modifies app code.

## Important Constraints
This runner does not:

- enable payment runtime
- change production flags
- implement NewebPay checkout
- implement NewebPay notify/return
- add public checkout UI
- add queue trigger integration
- add LINE delivery
- change Module 01 prompt/result behavior
- change public legal/provider-review copy

## Recommended Next Step
Owner/operator exports `OPERATOR_TEST_SECRET` and `INTERNAL_JOB_SECRET` locally, runs:

```bash
cd apps/web && corepack pnpm qa:fake-paid
```

Then record the sanitized output in a new Authorized Staging Fake Paid Delivery QA result report.
