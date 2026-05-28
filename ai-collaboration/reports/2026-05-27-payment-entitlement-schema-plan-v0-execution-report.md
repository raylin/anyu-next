# Payment / Entitlement Schema Plan v0 Execution Report

## Summary

Created a planning-only schema/data-model recommendation for future payment launch. The plan defines future `payment_intents`, `entitlements`, and a neutral hashed paid-access token approach while preserving current `unlock_intents`, `generation_jobs`, and `analysis_paid_results` responsibilities. No schema, app code, payment behavior, LINE behavior, production behavior, prompt/schema behavior, or provider integration was changed.

## Files Created

- `ai-collaboration/handoffs/2026-05-27-payment-entitlement-schema-plan-v0-handoff.md`
- `ai-collaboration/research/2026-05-27-payment-entitlement-schema-plan-v0.md`
- `ai-collaboration/reports/2026-05-27-payment-entitlement-schema-plan-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Planning Decisions

- Keep payment/order truth separate from fulfillment state.
- Keep product access truth separate from payment provider state.
- Keep current LINE/short-code fulfillment infrastructure compatible.
- Keep the current unlocked route as the v0 user-facing paid-result surface, but plan a dual token resolver.

## Payment Model Recommendation

Add a future `payment_intents` table for provider/order lifecycle with unique `merchant_order_no`, provider environment, provider trade reference, module/result/request references, amount/currency, status timestamps, provider status/category fields, and refund timestamps. Store only reconciliation-safe provider references, not card data or raw unredacted provider payloads.

## Entitlement Model Recommendation

Add a future `entitlements` table for access grants. V0 should use `single_paid_analysis`, `payment_single`, `active`, one `analysis_result_id`, optional `payment_intent_id`, optional `unlock_intent_id`, optional hashed LINE reference, and a hashed paid-access token.

## Access Token Recommendation

Use a neutral hashed `paid_access_token` on `entitlements` for v0. The existing `/m/{moduleSlug}/unlock/{token}` route can remain externally, but internally it should resolve entitlement paid-access tokens first and legacy `unlock_intents` tokens second.

## Migration Strategy

Use additive phases: schema migration plan, schema implementation behind no runtime switch, fake/sandbox payment flow, queue provider POC, NewebPay integration, and controlled production payment smoke. A schema decision log is required before migration.

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

- No payment/order truth table exists.
- No entitlement/access truth table exists.
- Current paid-result access is tied to fulfillment token semantics.
- Current paid request route expects `unlockIntentId`.
- Refund/re-delivery state is not represented in schema.

### Opportunistic Cleanup Completed

None; no code changes were made.

### Deferred Cleanup Candidates

- Add a decision log before implementing payment/entitlement schema.
- Implement a dual token resolver for the existing unlocked route.
- Add repository helpers for payment and entitlement lifecycle.
- Later consider a separate `paid_access_tokens` table if multi-link or revocation complexity grows.

### Recommended Follow-up

Ask for human approval on the schema-level decisions, then create a migration plan with exact SQL/Drizzle schema and indexes.

## Deviations From Handoff

None.

## Git Commit

Pending until final commit step.

## Staging Push

Pending until final push step.

## Remaining Uncertainties

- Whether NT$49 paid results should be accessible indefinitely or retention-limited.
- Whether v0 should implement the paid-access token directly on `entitlements` or move immediately to a separate `paid_access_tokens` table.
- Exact NewebPay provider response fields should be confirmed against final integration docs during implementation.

## Recommended Next Step

Run `Payment / Entitlement Schema Migration Plan v0` after human approval of the model boundaries and token strategy.
