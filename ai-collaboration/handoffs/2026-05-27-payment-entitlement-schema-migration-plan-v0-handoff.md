# Handoff: Payment / Entitlement Schema Migration Plan v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Create an exact DB migration and repository implementation plan for future payment launch, based on the approved Payment / Entitlement Schema Plan v0.

This is a planning-only task.

Do not create migration files, change app code, implement NewebPay, implement checkout, enable payment, change LINE behavior, or change production behavior.

## Approved Boundaries

- `payment_intents` = payment / order truth.
- `entitlements` = product access truth.
- `paid_access_token` = web paid result access proof.
- `unlock_intents` = LINE / short-code fulfillment infrastructure.
- `generation_jobs` = paid analysis work lifecycle.
- `analysis_paid_results` = completed paid result storage / delivery truth.

## Required Outputs

Create:

- `ai-collaboration/research/2026-05-27-payment-entitlement-schema-migration-plan-v0.md`
- `ai-collaboration/reports/2026-05-27-payment-entitlement-schema-migration-plan-v0-execution-report.md`

Update:

- `ai-collaboration/summaries/summary_log.md`

## Required Decisions To Document

- Exact future `payment_intents` schema.
- Exact future `entitlements` schema.
- Paid access token hashing and expiry strategy.
- Token resolver strategy for `pa_` tokens and legacy unlock tokens.
- MerchantOrderNo generation strategy.
- NewebPay provider references.
- Repository helper shapes.
- Indexes, constraints, and foreign-key approach.
- Retention, refund, duplicate payment, and re-delivery handling.
- Future implementation tests and migration rollout.

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
git commit -m "docs: plan payment entitlement migration"
git push origin HEAD:staging
```
