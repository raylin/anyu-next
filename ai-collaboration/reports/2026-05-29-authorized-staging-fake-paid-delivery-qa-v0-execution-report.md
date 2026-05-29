# Authorized Staging Fake Paid Delivery QA v0 Execution Report

## Summary
Authorized staging fake paid delivery QA could not proceed. The staging domain is not serving the expected operator fake-paid route bundle.

Observed staging behavior:
- `https://staging.anyu.tw/api/health` returns `ok: true`, but no build marker fields.
- `POST /api/operator/fake-paid-success` returns a generic Next.js HTML `404`, not the implemented JSON route response.
- Missing and invalid operator-secret checks therefore do not reach the fake-paid route.
- Invalid synthetic `pa_` status polling returned the legacy invalid-unlock category, indicating the staging runtime may also be missing the expected paid-access resolver behavior.

No authorized fake paid success call was made. No payment intent, entitlement, raw `pa_` token, token hash, generation job, processor run, valid `pa_` polling, or valid `pa_` unlock route was created/exercised by this run.

## Scope
- QA and documentation only.
- No code, schema, prompt, payment runtime, LINE behavior, production flag, legal copy, public checkout behavior, NewebPay checkout, NewebPay notify, NewebPay return, queue trigger, or LINE delivery behavior was changed.

## Safety
- Local shell did not have `OPERATOR_TEST_SECRET`, `INTERNAL_JOB_SECRET`, or `CRON_SECRET`.
- No operator secret, processor secret, raw `pa_` token, tokenized URL, provider credential, raw user input, provider output, `paid_result_json`, LINE ID, reply token, or private value was printed or committed.
- Only sanitized status/boolean results were recorded.

## Gate / Deployment Preflight
| Check | Result |
|---|---|
| Local repo head | `859b801` |
| `origin/staging` head | `859b801` |
| Staging health endpoint | PASS: HTTP 200, `ok: true` |
| Staging health build marker | BLOCKED: commit/build marker fields absent |
| Missing operator secret | BLOCKED: generic HTML `404` |
| Invalid operator secret | BLOCKED: generic HTML `404` |
| Valid operator secret reaches fake-paid path | Not executed; local secret unavailable and route not present |
| Production fake-paid public exposure | PASS: production missing-secret request not publicly usable |

Expected route behavior from current code:
- If `ENABLE_OPERATOR_FAKE_PAID_SUCCESS` is disabled, the route returns JSON `404` with `error: "not_found"`.
- If the flag is enabled and the secret is missing/invalid, the route returns JSON `401` with `error: "unauthorized"`.
- Current staging returns a generic app 404, which suggests the deployed route bundle behind `staging.anyu.tw` does not include `/api/operator/fake-paid-success`.

## Source Result / Legacy Regression
| Step | Result |
|---|---|
| Normal Module 01 analyze | PASS: HTTP 200, completed |
| Result page load | PASS: HTTP 200 |
| Legacy unlock intent creation | PASS: HTTP 200 |
| Legacy unlock page load | PASS: HTTP 200 |

The synthetic input, result identifier, unlock token, fulfillment code, LIFF URL, and tokenized route were not recorded.

## Invalid `pa_` Regression
| Check | Result |
|---|---|
| Invalid synthetic `pa_` paid-result status | PARTIAL: HTTP 200 safe expired response |
| Invalid synthetic `pa_` error category | BLOCKED: returned legacy `invalid_unlock` instead of expected paid-access category |
| Invalid synthetic `pa_` unlock page | PASS: HTTP 200 safe error page |

Interpretation: invalid access remains safe, but the returned category suggests staging is not serving the expected paid-access resolver-aware status route.

## Authorized Fake Paid Success
Not executed.

Blockers:
- Staging fake-paid endpoint is not present at the expected route.
- Local `OPERATOR_TEST_SECRET` was not available.

Expected checks when unblocked:
- Valid operator request creates or reuses fake paid payment intent.
- Operator-test entitlement is created/reused.
- Raw `pa_` token is returned only on first entitlement creation.
- Paid generation job is created/reused idempotently.

## Idempotency Verification
Not executed because the first authorized fake paid success call could not be reached.

## `pa_` Unlock Route Verification
Valid `pa_` unlock route verification was not executed because no authorized fake paid success token was created.

## Paid-result Status Polling
Valid `pa_` status polling was not executed because no authorized fake paid success token was created.

## Processor / Manual Processing
Not executed.

Blockers:
- No generation job was created.
- Local `INTERNAL_JOB_SECRET` / `CRON_SECRET` were not available.

## Production / Payment Runtime
| Check | Result |
|---|---|
| Production fake-paid missing-secret request | PASS: not publicly usable |
| Production payment runtime | No production runtime behavior was changed by this task |
| NewebPay checkout/notify/return | No behavior was changed or enabled |

## Validation / Smoke Results
No code changed, so full compile/lint/test/build validation was not required. Relevant smoke/preflight checks were run instead:

| Check | Result |
|---|---|
| Staging health | PASS, but build marker absent |
| Staging fake-paid route presence | BLOCKED: generic 404 |
| Staging normal analyze/result | PASS |
| Staging legacy unlock | PASS |
| Staging invalid `pa_` safe response | PARTIAL: safe expired response, legacy category |
| Production fake-paid public exposure | PASS |

## Blockers
- Staging domain appears not to be serving the expected `origin/staging` route bundle for operator fake-paid and paid-access status behavior.
- Local secure environment does not expose `OPERATOR_TEST_SECRET`.
- Local secure environment does not expose processor/cron secret for manual processor execution.

## Manual Action Required
1. Confirm the deployment currently assigned to `staging.anyu.tw` is built from `origin/staging` at or after `859b801`.
2. Confirm `apps/web` is the deployed Vercel project root for `staging.anyu.tw`.
3. Confirm build marker env is present so `/api/health` reports commit/branch again.
4. Confirm `/api/operator/fake-paid-success` exists on staging before rerunning authorized QA.
5. Confirm `ENABLE_OPERATOR_FAKE_PAID_SUCCESS=true` is present in the same Vercel environment used by `staging.anyu.tw`.
6. Make `OPERATOR_TEST_SECRET` available to the QA shell through a secure local environment variable, not chat.
7. Make `INTERNAL_JOB_SECRET` available to the QA shell if processor completion should be verified.

## Tech Debt Review
### New Technical Debt Introduced
None. Documentation only.

### Existing Technical Debt Observed
- Staging deploy/alias freshness is hard to verify when build marker env is absent.
- Fake-paid QA depends on Vercel env and alias coordination outside the repository.
- There is no safe aggregate preflight endpoint for operator QA readiness.

### Opportunistic Cleanup Completed
None.

### Deferred Cleanup Candidates
- Restore build marker visibility for staging health.
- Add an operator-gated readiness preflight endpoint that exposes only safe booleans and route/flag status.

## Recommended Next Step
Fix staging deployment/alias freshness so `staging.anyu.tw` serves the latest `origin/staging` app route bundle, then rerun Authorized Staging Fake Paid Delivery QA v0 with `OPERATOR_TEST_SECRET` and processor secret available securely.

After successful QA, proceed to NewebPay Checkout Creation Phase 1: checkout creation + pending `payment_intent` creation + ReturnURL pending UX only, without NotifyURL paid transition.
