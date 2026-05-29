# Staging Deployment Freshness + Build Marker Recovery v0 Execution Report

## Summary
Local source and build output include the operator fake-paid route and paid-access resolver/status behavior, but `staging.anyu.tw` is currently serving an older or mismatched route bundle.

I added a minimal safe `routeBundleVersion` field to the existing health/build marker payload so future staging checks can verify that the payment-foundation route bundle is actually deployed, even if Vercel git env values are missing.

No payment runtime, production flags, NewebPay behavior, checkout UI, queue trigger, LINE delivery, prompt/result behavior, or legal/provider-review copy changed.

## Files Updated
- `apps/web/src/lib/runtime/build-marker.ts`
- `apps/web/src/tests/health-route.test.ts`
- `ai-collaboration/handoffs/2026-05-29-staging-deployment-freshness-build-marker-recovery-v0-handoff.md`
- `ai-collaboration/reports/2026-05-29-staging-deployment-freshness-build-marker-recovery-v0-execution-report.md`
- `ai-collaboration/summaries/summary_log.md`

## Health / Build Marker Findings
Current source already had safe build marker support:

- `app`
- `environment`
- `gitCommit`
- `gitBranch`
- `buildTime`
- `deploymentProvider`
- `versionSource`

Those fields are sanitized. Invalid or secret-like env values are normalized to `unknown` and tests assert that sensitive env keys are not exposed.

Staging observation before this task:

- `https://staging.anyu.tw/api/health` returned HTTP 200 with only `ok` and `service`.
- It did not include `app`, `environment`, `gitCommit`, `gitBranch`, `buildTime`, `deploymentProvider`, or `versionSource`.

Conclusion:

- This is not merely missing Vercel git env metadata.
- Current source returns marker fields even when env is missing.
- Staging is serving an older/mismatched route bundle that predates the health marker implementation, or a different deployment/project root.

## Build Marker Recovery Change
Added:

```json
{
  "routeBundleVersion": "payment-foundation-2026-05-29"
}
```

Expected `/api/health` marker fields after this commit is deployed:

```json
{
  "ok": true,
  "service": "anyu-next-web",
  "app": "anyu-web",
  "environment": "preview",
  "gitCommit": "<short-sha-or-unknown>",
  "gitBranch": "staging",
  "buildTime": "<iso-timestamp-or-unknown>",
  "deploymentProvider": "vercel",
  "versionSource": "env",
  "routeBundleVersion": "payment-foundation-2026-05-29"
}
```

Safe fallback behavior remains:

- Missing commit/branch/build env values return `unknown`.
- The static `routeBundleVersion` still confirms the route bundle contains the payment-foundation routes from this source line.

## Route Bundle Presence
Local source contains:

- `apps/web/src/app/api/operator/fake-paid-success/route.ts`
- `apps/web/src/app/api/modules/[moduleSlug]/paid-result/status/route.ts`
- `apps/web/src/lib/payments/paid-access-token.ts`
- `apps/web/src/lib/payments/paid-access-resolver.ts`

Local `next build` output includes:

- `/api/health`
- `/api/operator/fake-paid-success`
- `/api/modules/[moduleSlug]/paid-result/status`
- `/m/[moduleSlug]/unlock/[unlockToken]`

Targeted tests passed:

- `health-route.test.ts`
- `operator-fake-paid-success-route.test.ts`
- `paid-generation-route.test.ts`

## Expected Route Behavior
When the route bundle is current:

| Condition | Expected Response |
|---|---|
| `/api/operator/fake-paid-success` route missing | Generic Next HTML `404` |
| Route exists, `ENABLE_OPERATOR_FAKE_PAID_SUCCESS` disabled | JSON `404`, `error: "not_found"` |
| Route exists, flag enabled, secret missing/invalid | JSON `401`, `error: "unauthorized"` |
| Route exists, flag enabled, valid secret, dummy missing result | JSON app-level failure such as `result_not_found` |
| Invalid synthetic `pa_` on paid-result status route | HTTP 200 with `errorCategory: "invalid_paid_access"` |

Current staging behavior observed before this commit:

- `/api/operator/fake-paid-success` returns generic Next HTML `404`.
- Invalid synthetic `pa_` status returns safe expired response but legacy `invalid_unlock` category.

Conclusion:

- `staging.anyu.tw` is not serving the expected current route bundle.

## Deployment / Alias Freshness
Vercel CLI access was not authenticated in this session, so I could not inspect deployment aliases or project settings directly.

Owner/operator checks required in Vercel UI:

1. Confirm `staging.anyu.tw` is assigned to the intended Vercel project for `apps/web`.
2. Confirm the project root/build settings point to `apps/web`.
3. Confirm the deployment assigned to `staging.anyu.tw` was built from `origin/staging`.
4. Confirm the deployment commit is this task commit or later.
5. Confirm Vercel git metadata is available if possible:
   - `VERCEL=1`
   - `VERCEL_ENV=preview`
   - `VERCEL_GIT_COMMIT_SHA`
   - `VERCEL_GIT_COMMIT_REF`
6. Confirm `ANYU_BUILD_TIME` is configured if the project wants an explicit build timestamp.
7. Confirm `ENABLE_OPERATOR_FAKE_PAID_SUCCESS=true` is configured for Preview/Staging only.
8. Confirm `OPERATOR_TEST_SECRET` is configured for Preview/Staging only.
9. Confirm Production remains disabled for fake-paid and payment runtime.

## Staging Preflight Checklist Before Authorized Fake-paid QA
All must pass before rerunning authorized fake-paid QA:

1. `GET https://staging.anyu.tw/api/health` returns:
   - `app: "anyu-web"`
   - `gitBranch: "staging"` or known expected branch
   - expected `gitCommit` or explicit accepted deployment commit
   - `routeBundleVersion: "payment-foundation-2026-05-29"`
2. `POST /api/operator/fake-paid-success` without secret returns route-controlled JSON response, not generic HTML Next 404.
3. If fake-paid flag is disabled: route-controlled JSON `404`, `error: "not_found"`.
4. If fake-paid flag is enabled: missing/invalid secret returns JSON `401`, `error: "unauthorized"`.
5. Invalid synthetic `pa_` status returns `errorCategory: "invalid_paid_access"`.
6. Normal Module 01 analyze/result still works.
7. Legacy unlock still works.
8. Production fake-paid and payment runtime remain disabled.

## Validation Results
| Command | Result |
|---|---|
| `python3 -m compileall oradar` | PASS |
| `python3 -m compileall tools/topic-ingestion` | PASS |
| `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` | PASS: 25 tests |
| `cd apps/web && corepack pnpm vitest run src/tests/health-route.test.ts src/tests/operator-fake-paid-success-route.test.ts src/tests/paid-generation-route.test.ts` | PASS: 21 tests |
| `cd apps/web && corepack pnpm lint` | PASS |
| `cd apps/web && corepack pnpm test` | PASS: 43 files, 285 tests |
| `cd apps/web && corepack pnpm build` | PASS; route output includes `/api/operator/fake-paid-success` |

## Safety
- No secrets were printed or committed.
- No raw `pa_` token or tokenized URL was printed or committed.
- No private runtime config, provider credential, raw input, provider output, or `paid_result_json` was recorded.

## Tech Debt Review
### New Technical Debt Introduced
None significant. `routeBundleVersion` is a static marker that should be updated when route-bundle readiness semantics materially change.

### Existing Technical Debt Observed
- Staging deployment/alias freshness cannot be verified from this session without authenticated Vercel access.
- Health marker visibility depends on the correct route bundle actually being deployed.
- Fake-paid QA still depends on manually coordinated Vercel env and secure local secrets.

### Opportunistic Cleanup Completed
- Added a static, safe route bundle marker to the existing build marker payload.
- Extended health route tests to cover the new marker.

### Deferred Cleanup Candidates
- Add an authenticated operator readiness endpoint that returns safe booleans for fake-paid flag, operator secret presence, processor availability, and route bundle version.
- Add a formal staging deployment freshness checklist to the production/staging runbook once the alias issue is resolved.

## Recommended Next Step
Deploy this commit to staging and verify `/api/health` includes `routeBundleVersion: "payment-foundation-2026-05-29"`. Then rerun Authorized Staging Fake Paid Delivery QA with `OPERATOR_TEST_SECRET` and processor secret available securely.
