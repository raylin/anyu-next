# Staging Route Bundle Freshness Preflight v0 Execution Report

## Summary
Staging route bundle freshness is verified. `staging.anyu.tw` is now serving commit `0877011` with the expected payment-foundation route bundle marker.

Authorized fake-paid QA has not been run in this task. This preflight only confirms staging route freshness and safe route behavior before rerunning the authorized fake-paid delivery QA with secrets available securely.

## Health Route Marker
| Field | Result |
|---|---|
| HTTP status | 200 |
| `ok` | true |
| `service` | `anyu-next-web` |
| `app` | `anyu-web` |
| `environment` | `preview` |
| `gitCommit` | `0877011925ba` |
| `gitBranch` | `staging` |
| `buildTime` | `unknown` |
| `deploymentProvider` | `vercel` |
| `versionSource` | `env` |
| `routeBundleVersion` | `payment-foundation-2026-05-29` |

Result: PASS. Staging is serving the expected route bundle marker.

## Fake-paid Route Presence
Sanitized request:

- `POST https://staging.anyu.tw/api/operator/fake-paid-success`
- harmless dummy module/result payload
- no real `OPERATOR_TEST_SECRET`

| Case | HTTP Status | Content Type | Route-controlled JSON | Error | Generic HTML 404 |
|---|---:|---|---|---|---|
| missing secret | 401 | `application/json` | yes | `unauthorized` | no |
| invalid secret | 401 | `application/json` | yes | `unauthorized` | no |

Result: PASS. The fake-paid endpoint exists on staging and reaches route-controlled secret validation.

## Paid Access Resolver Presence
| Check | Result |
|---|---|
| Invalid synthetic `pa_` paid-result status | PASS: HTTP 200, safe expired response |
| Error category | PASS: `invalid_paid_access` |
| Invalid synthetic `pa_` unlock page | PASS: HTTP 200 safe error page |

Result: PASS. Staging no longer returns the legacy `invalid_unlock` category for a synthetic `pa_` token.

## Regression Checks
| Check | Result |
|---|---|
| Normal Module 01 analyze | PASS: HTTP 200, completed |
| Result page load | PASS: HTTP 200 |
| Legacy unlock intent creation | PASS: HTTP 200 |
| Legacy unlock page load | PASS: HTTP 200 |
| Production fake-paid public exposure | PASS: missing-secret request is not publicly usable |

Only sanitized booleans/statuses were recorded. The synthetic input, result identifier, unlock token, fulfillment code, LIFF URL, and tokenized route were not recorded.

## Payment Runtime / NewebPay
No payment runtime behavior was enabled or changed in this task. No NewebPay checkout, notify, return, public checkout UI, queue trigger, or LINE delivery behavior was implemented.

## Validation
No code changed, so full compile/lint/test/build validation was not required. The required staging preflight smoke checks were run and passed.

## Pass / Fail Summary
| Required Check | Result |
|---|---|
| `/api/health` exposes `routeBundleVersion` | PASS |
| Marker matches expected payment-foundation route bundle | PASS |
| Fake-paid route returns route-controlled JSON response | PASS |
| Fake-paid route is not generic HTML Next 404 | PASS |
| Invalid synthetic `pa_` matches paid-access behavior | PASS |
| Normal analyze/result works | PASS |
| Legacy unlock works | PASS |
| Production/payment runtime remain disabled | PASS based on public exposure check and no runtime changes |

## Recommended Next Step
Rerun Authorized Staging Fake Paid Delivery QA with:

- `OPERATOR_TEST_SECRET` available securely as a local environment variable.
- `INTERNAL_JOB_SECRET` available securely if the processor/manual path should be completed in the same QA run.

Do not paste or commit either secret, raw `pa_` tokens, tokenized URLs, raw input, provider output, or private values.
