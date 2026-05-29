# Handoff: Paid Access Token Resolver Implementation v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Implement the minimal read-path resolver for `pa_` paid access tokens without enabling payment runtime or implementing NewebPay checkout/notify/return behavior.

## Scope

Implemented:

- Detect `pa_` tokens by prefix.
- Route `pa_` tokens to a paid entitlement resolver.
- Preserve legacy unlock-intent resolver behavior for non-`pa_` tokens.
- Prevent malformed/missing `pa_` tokens from falling back to legacy unlock lookup.
- Resolve `pa_` token hash at rest through `entitlements`.
- Return normalized resolver states for paid access.
- Extend paid-result status route to support `pa_` tokens safely.
- Reuse unlocked route rendering for completed paid access.
- Add tests for resolver behavior and legacy fallback preservation.

Not implemented:

- NewebPay checkout.
- NewebPay notify/return endpoints.
- Payment provider verification.
- Payment intent paid transition.
- Operator-only fake paid success.
- Queue trigger.
- LINE delivery.
- Refund admin tooling.
- Production flag enablement.
- Prompt/result behavior changes.
- Public copy/legal changes.

## Resolver States

Implemented resolver states:

- `ready`
- `pending`
- `processing`
- `failed`
- `revoked`
- `refunded`
- `not_found`
- `expired`
- `missing_generation_job`
- `recovery_required`

## Validation

Run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint
cd apps/web && corepack pnpm test
cd apps/web && corepack pnpm build
```

Targeted tests:

```bash
cd apps/web && corepack pnpm vitest run src/tests/paid-access-resolver.test.ts src/tests/paid-generation-route.test.ts src/tests/event-metadata.test.ts
```

## Recommended Next Step

Run `Operator-only Fake Paid Success v0` for staging QA of:

```text
payment_intent → entitlement + pa_ token → generation_jobs → processor → paid result route
```
