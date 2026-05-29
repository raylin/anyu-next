# Operator-only Fake Paid Success v0 Execution Report

## Summary

Implemented an operator-only fake paid success path for staging QA.

The endpoint is disabled by default and requires both an explicit feature flag and the existing operator test secret header. It creates or reuses a fake paid payment intent, creates an operator-test entitlement when missing, returns the raw `pa_` token only on first entitlement creation, creates/reuses a paid generation job, and leaves actual processing to the existing signed/manual processor path.

No NewebPay checkout, notify, return, provider verification, real payment runtime, public checkout UI, queue trigger, LINE delivery, refund tooling, prompt/result content change, legal copy change, or production flag change was implemented.

## Files Created

- `apps/web/src/app/api/operator/fake-paid-success/route.ts`
- `apps/web/src/lib/payments/operator-fake-paid-success.ts`
- `apps/web/src/tests/operator-fake-paid-success.test.ts`
- `apps/web/src/tests/operator-fake-paid-success-route.test.ts`
- `ai-collaboration/handoffs/2026-05-27-operator-only-fake-paid-success-v0-handoff.md`
- `ai-collaboration/reports/2026-05-27-operator-only-fake-paid-success-v0-execution-report.md`

## Files Updated

- `apps/web/src/lib/db/entitlements.ts`
- `apps/web/src/lib/db/generation-jobs.ts`
- `apps/web/src/lib/db/payment-intents.ts`
- `apps/web/src/lib/runtime/feature-flags.ts`
- `apps/web/src/tests/feature-flags.test.ts`
- `apps/web/src/tests/payment-entitlement-foundation.test.ts`
- `ai-collaboration/summaries/summary_log.md`

## Operator Gate Used

Endpoint:

```text
POST /api/operator/fake-paid-success
```

Required gate:

```text
ENABLE_OPERATOR_FAKE_PAID_SUCCESS=true
x-operator-test-secret: <OPERATOR_TEST_SECRET>
```

The route returns 404 when the flag is off and 401 when the operator secret is missing or invalid.

## Request / Response Shape

Request:

```json
{
  "moduleSlug": "ambiguous-temperature",
  "resultId": "<analysis result id>",
  "idempotencyKey": "<optional>"
}
```

Response:

```text
ok
mode
moduleSlug
resultId
paymentIntentId
paymentIntentStatus
paymentIntentCreated
entitlementId
entitlementStatus
entitlementCreated
generationJobId
generationJobStatus
generationJobCreated
accessState
paidAccessToken
paidAccessTokenReturned
unlockPath
```

`paidAccessToken` and `unlockPath` are returned only when a new entitlement is created. Repeated calls do not return the raw token again.

## Idempotency Behavior

- Fake payment intent uses deterministic operator fake MerchantOrderNo based on module/result/idempotency key.
- Existing fake payment intent is reused.
- Existing entitlement for payment intent is reused.
- Existing generation job is reused through `createOrReusePaidAnalysisJob`.
- Missing generation job can be recovered through this operator-only path.
- Raw `pa_` token is only available on first entitlement creation.

## Resolver / Status Verification

Implemented path is compatible with:

- Existing `pa_` resolver.
- Existing unlock route `pa_` branch.
- Existing paid-result status route `pa_` polling branch.

The route itself does not execute provider generation or processor work.

## Tests Added / Updated

Added:

- Service creates fake paid payment intent, operator entitlement, `pa_` token, and generation job.
- Service is idempotent and does not return raw token again on repeated calls.
- Operator path can recover missing generation job.
- Route is disabled when feature flag is off.
- Route rejects missing/invalid operator secret.
- Route returns safe operator metadata on success.

Updated:

- Feature flag tests cover `ENABLE_OPERATOR_FAKE_PAID_SUCCESS`.
- Payment provider constants include `operator_fake`.

## Validation Results

Passed:

- `python3 -m compileall oradar`
- `python3 -m compileall tools/topic-ingestion`
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`
- `cd apps/web && corepack pnpm vitest run src/tests/operator-fake-paid-success.test.ts src/tests/operator-fake-paid-success-route.test.ts src/tests/payment-entitlement-foundation.test.ts src/tests/feature-flags.test.ts src/tests/paid-access-resolver.test.ts src/tests/paid-generation-route.test.ts`
- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`

Playwright was not required because this task added an operator API path and service tests, not visual UI changes.

## Tech Debt Review

### New Technical Debt Introduced

The fake success endpoint intentionally exposes a raw `pa_` token in the authorized operator response only on first entitlement creation. This is necessary for staging QA and must remain flag/secret gated.

### Existing Technical Debt Observed

- `entitlements.payment_intent_id` uniqueness remains service-level only.
- Paid access lookup rate limiting is still not implemented.
- Production processor remains disabled, so production paid-job processing is still unavailable by design.

### Opportunistic Cleanup Completed

- Added `entitlementRefId` support to paid generation job creation so operator fake paid jobs can link to entitlements.
- Added optional entitlement source support so fake success entitlements are marked `operator_test`.

### Deferred Cleanup Candidates

- Add DB-level partial unique index for `entitlements.payment_intent_id`.
- Add paid access token lookup rate limiting.
- Add a staging-only smoke checklist for fake paid delivery.

### Recommended Follow-up

Run staging QA for fake paid delivery chain. Then decide whether to formalize a manual paid delivery smoke checklist or proceed to NewebPay Checkout Creation Phase 1.

## Deviations From Handoff

None.

## Git Commit

Recorded in final Codex completion summary.

## Staging Push

Recorded in final Codex completion summary.

## Remaining Uncertainties

- Whether to keep operator fake success endpoint long-term or remove it after NewebPay staging smoke.
- Exact NewebPay provider payload/hash fields remain pending provider approval.

## Recommended Next Step

Run staging QA for:

```text
fake/operator payment success → payment_intent paid → entitlement + pa_ token → generation_jobs → processor → paid result route
```
