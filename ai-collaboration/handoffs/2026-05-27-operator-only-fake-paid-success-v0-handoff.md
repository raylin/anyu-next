# Handoff: Operator-only Fake Paid Success v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Implement an operator-only fake paid success flow for staging QA of the internal paid delivery chain before NewebPay checkout/provider runtime is implemented.

## Scope

Implemented:

- Operator-only endpoint: `POST /api/operator/fake-paid-success`.
- Requires both `ENABLE_OPERATOR_FAKE_PAID_SUCCESS=true` and valid `x-operator-test-secret`.
- Creates or reuses deterministic fake payment intent.
- Marks fake payment intent paid.
- Creates entitlement with `source = operator_test`.
- Generates raw `pa_` token only when a new entitlement is created.
- Stores only the token hash through existing entitlement helper.
- Creates/reuses paid generation job with `triggerSource = operator`.
- Links job to entitlement through `entitlementRefId`.
- Does not trigger queue or processor automatically.
- Returns safe operator metadata for staging QA.

Not implemented:

- NewebPay checkout.
- NewebPay notify/return endpoints.
- Payment provider verification.
- Real payment runtime.
- Public checkout UI.
- Queue trigger integration.
- LINE delivery.
- Refund admin tooling.
- Production flag enablement.
- Prompt/result content changes.
- Public legal/provider-review copy changes.

## Operator Gate

The endpoint requires:

```text
ENABLE_OPERATOR_FAKE_PAID_SUCCESS=true
OPERATOR_TEST_SECRET configured
x-operator-test-secret: <secret>
```

If the feature flag is off, the endpoint returns 404.

If the secret is missing or invalid, the endpoint returns 401.

## Request Shape

```json
{
  "moduleSlug": "ambiguous-temperature",
  "resultId": "<analysis result id>",
  "idempotencyKey": "<optional operator idempotency key>"
}
```

## Response Shape

Success response includes:

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

`paidAccessToken` and `unlockPath` are returned only when a new entitlement/token is created.

Repeated idempotent calls return IDs/statuses but not the raw `pa_` token.

## Manual Staging QA Steps

1. Enable staging-only env:
   - `ENABLE_OPERATOR_FAKE_PAID_SUCCESS=true`
   - `OPERATOR_TEST_SECRET` configured.
2. Create a normal staging analysis result.
3. Call `POST /api/operator/fake-paid-success` with the result id and operator secret header.
4. Copy the returned `unlockPath` only in the private operator environment.
5. Open the `pa_` unlock URL.
6. Confirm the page renders pending if the paid result is not ready.
7. Poll `POST /api/modules/ambiguous-temperature/paid-result/status` with the `pa_` token.
8. Run the existing signed processor/manual recovery path if needed.
9. Confirm the `pa_` unlock URL renders completed paid content after processing.

Do not paste `pa_` tokens, tokenized URLs, raw input, paid result JSON, provider output, secrets, or LINE IDs into reports.

## Recommended Next Step

Run staging QA for fake paid delivery chain, then decide between a manual paid delivery smoke checklist and NewebPay Checkout Creation Phase 1.
