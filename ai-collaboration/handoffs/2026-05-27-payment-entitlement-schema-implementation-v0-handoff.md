# Handoff: Payment / Entitlement Schema Implementation v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Implement additive payment/entitlement DB schema and repository/helper seams for future NewebPay payment launch.

## Scope

Implemented:

- `payment_intents` and `entitlements` migration/schema foundations.
- Payment and entitlement status/type/source constants.
- MerchantOrderNo helper.
- Paid access token generation/hash helper.
- Payment intent repository helper seams.
- Entitlement repository helper seams.
- Unit tests for constants, token safety, merchant order shape, and repository transitions.

Not implemented:

- payment runtime
- NewebPay API
- checkout
- payment return/notify routes
- queue provider integration
- dual token resolver in the unlocked route
- LINE/LIFF/short-code behavior changes
- production behavior changes

## Validation

Run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint
cd apps/web && corepack pnpm test
cd apps/web && corepack pnpm build
cd apps/web && corepack pnpm test:e2e:local
```

If Playwright is blocked by the known Chromium/MachPort issue, record honestly.
