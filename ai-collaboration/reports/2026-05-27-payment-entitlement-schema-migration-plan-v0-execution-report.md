# Payment / Entitlement Schema Migration Plan v0 Execution Report

## Summary

Created an exact future migration and repository implementation plan for payment launch. The plan specifies the proposed `0007_payment_entitlements.sql` shape for `payment_intents` and `entitlements`, paid access token hashing, token resolver behavior, MerchantOrderNo shape, NewebPay reference fields, indexes, constraints, retention interactions, refund/re-delivery states, repository helper seams, future tests, and rollout phases. No migration, DB schema, app code, payment behavior, LINE behavior, or production behavior was changed.

## Files Created

- `ai-collaboration/handoffs/2026-05-27-payment-entitlement-schema-migration-plan-v0-handoff.md`
- `ai-collaboration/research/2026-05-27-payment-entitlement-schema-migration-plan-v0.md`
- `ai-collaboration/reports/2026-05-27-payment-entitlement-schema-migration-plan-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Planning Decisions

- Plan next migration as `0007_payment_entitlements.sql`, but do not create it in this task.
- Use text statuses plus app constants initially, matching existing repo conventions.
- Use `amount_minor integer` plus `currency`, with `NT$49` stored as `49` for TWD.
- Keep `/m/{moduleSlug}/unlock/{token}` as the external route and add a future dual resolver.

## Schema Recommendation

- `payment_intents`: provider/order/payment truth with unique `merchant_order_no`, provider refs, status timestamps, request/result references, and optional `unlock_intent_id`.
- `entitlements`: product access truth with `entitlement_type`, `source`, `status`, request/result/payment refs, optional `unlock_intent_id`, optional `generation_job_id`, and hashed paid access token fields.

## Token Strategy

Generate `pa_`-prefixed high-entropy tokens, store only `paid_access_token_hash`, hash with a dedicated `PAID_ACCESS_TOKEN_HASH_SECRET`, and align token expiry with paid-result retention for v0.

## Migration Rollout

Recommended rollout: planning, schema implementation with no runtime writes, staging schema verification, production migration gate, fake/sandbox access flow, NewebPay integration, and queue trigger integration.

## Validation Results

- `python3 -m compileall oradar`: passed.
- `python3 -m compileall tools/topic-ingestion`: passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`: passed, 25 tests.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed, 39 files / 261 tests.
- `cd apps/web && corepack pnpm build`: passed.
- Playwright was not run; this was a docs/planning-only task with no code or UI changes.

## Tech Debt Review

### New Technical Debt Introduced

None; this was docs/planning only.

### Existing Technical Debt Observed

- No payment/entitlement tables exist.
- Current paid access is tied to fulfillment token semantics.
- Current retention cleanup will need future awareness of payment/entitlement metadata once tables exist.
- Refund/re-delivery lifecycle is not represented in current schema.

### Opportunistic Cleanup Completed

None; no code or schema files were changed.

### Deferred Cleanup Candidates

- Add schema decision log before migration implementation.
- Implement payment/entitlement repository helpers.
- Implement dual token resolver.
- Add retention-expired paid access UI state.
- Later evaluate a separate `paid_access_tokens` table if support/revocation complexity grows.

### Recommended Follow-up

After human approval, implement `0007_payment_entitlements.sql`, Drizzle schema updates, constants, repository helpers, and tests with no runtime writes.

## Deviations From Handoff

None.

## Git Commit

Pending until final commit step.

## Staging Push

Pending until final push step.

## Remaining Uncertainties

- Final NewebPay MerchantOrderNo constraints must be confirmed during provider implementation.
- Exact retention expiry duration for paid access should be confirmed against public copy before checkout launch.
- Whether support audit requires `paid_access_token_last_rotated_at` in the first migration remains undecided.

## Recommended Next Step

Run `Payment / Entitlement Schema Implementation v0` after approval, including a schema decision log and no runtime payment enablement.
