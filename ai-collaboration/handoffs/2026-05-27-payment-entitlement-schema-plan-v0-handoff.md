# Handoff: Payment / Entitlement Schema Plan v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Create a data-model and rollout plan for future payment launch, focusing on `payment_intents`, `entitlements`, and a neutral paid-access token model.

This is a planning-only task.

Do not implement DB migration, payment provider integration, checkout, queue provider integration, app code, production behavior, LINE behavior, prompt/schema changes, legal semantics, or ads.

## Background

Payment Launch Flow + Queue Trigger Architecture v0 established:

- `payment_intents` should be payment/order truth.
- `entitlements` should be product access truth.
- `generation_jobs` should be durable work lifecycle.
- `analysis_paid_results` should remain completed paid-result delivery truth.
- `unlock_intents` should remain LINE/short-code/link fulfillment infrastructure.
- LINE should be optional delivery/retention, not required paid-access proof.

## Required Outputs

Create:

- `ai-collaboration/research/2026-05-27-payment-entitlement-schema-plan-v0.md`
- `ai-collaboration/reports/2026-05-27-payment-entitlement-schema-plan-v0-execution-report.md`

Update:

- `ai-collaboration/summaries/summary_log.md`

## Questions To Answer

- What should `payment_intents` store?
- What should `entitlements` store?
- Should v0 use a neutral paid-access token?
- How should token access relate to the existing unlocked route?
- How should payment/entitlement relate to `unlock_intents`, `generation_jobs`, and `analysis_paid_results`?
- What NewebPay references are safe/needed?
- What statuses are needed for payment, entitlement, refund, failure, and re-delivery?
- What privacy/security rules constrain the schema?
- What implementation/migration phases should follow?

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

No Playwright is required unless code changes.

## Commit

Commit with:

```bash
git commit -m "docs: plan payment entitlement schema"
git push origin HEAD:staging
```
