# Payment / Entitlement Schema Implementation v0 Execution Report

## Summary

Implemented additive payment/entitlement schema and helper foundations for future payment launch. Added `payment_intents`, `entitlements`, payment intent repository seams, entitlement repository seams, paid access token helpers, MerchantOrderNo helper, and tests. No checkout, NewebPay integration, payment routes, dual token resolver runtime, LINE behavior, paid generation behavior, or production behavior was changed.

## Files Created

- `apps/web/drizzle/0007_payment_entitlements.sql`
- `apps/web/src/lib/db/payment-intents.ts`
- `apps/web/src/lib/db/entitlements.ts`
- `apps/web/src/lib/payments/merchant-order.ts`
- `apps/web/src/lib/payments/paid-access-token.ts`
- `apps/web/src/tests/payment-entitlement-foundation.test.ts`
- `ai-collaboration/handoffs/2026-05-27-payment-entitlement-schema-implementation-v0-handoff.md`
- `ai-collaboration/research/2026-05-27-payment-entitlement-schema-implementation-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-27-payment-entitlement-schema-implementation-v0-execution-report.md`

## Files Updated

- `apps/web/src/lib/db/schema.ts`
- `ai-collaboration/summaries/summary_log.md`

## Schema Changes

Added future additive migration `0007_payment_entitlements.sql` with:

- `payment_intents`
- `entitlements`
- indexes for merchant order, provider trade ref, result lookup, status/time lookup, module/time lookup, paid access token hash, payment intent lookup, entitlement result lookup, entitlement module/status lookup, and entitlement expiry lookup

No existing table was modified by the migration.

## Repository Helpers

Added payment intent helpers for creation, lookup, and lifecycle transitions.

Added entitlement helpers for creation, lookup by paid access token, refund/revoke/expire transitions, and access-token rotation.

## Token / MerchantOrder Helpers

Paid access tokens:

- `pa_` prefix
- 32 random bytes base64url encoded
- HMAC-SHA256 hash
- dedicated `PAID_ACCESS_TOKEN_HASH_SECRET`
- raw token returned only on create/rotation

MerchantOrderNo:

- `ANYU{yymmddHHmmss}{6 random uppercase base36 chars}`
- no user data
- validation helper added

## Runtime Behavior Preservation

No current runtime route imports these helpers. Payment remains disabled. Existing unlock, LINE, paid generation, queue/processor, prompt/schema/cache, and production behavior are unchanged.

## Validation Results

- `python3 -m compileall oradar`: passed.
- `python3 -m compileall tools/topic-ingestion`: passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`: passed, 25 tests.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed, 40 files / 270 tests.
- `cd apps/web && corepack pnpm build`: passed.
- `cd apps/web && corepack pnpm test:e2e:local`: blocked by known Chromium/MachPort sandbox permission issue. The e2e build and server startup completed, but Chromium failed before app assertions with `bootstrap_check_in org.chromium.Chromium.MachPortRendezvousServer... Permission denied (1100)`.

## Tech Debt Review

### New Technical Debt Introduced

- The new `generation_jobs.entitlement_ref_id` column still has no FK to `entitlements`; this preserves the existing table but should be revisited if strong linkage is required later.

### Existing Technical Debt Observed

- Existing unlock route still resolves only legacy `unlock_intents` tokens.
- Retention cleanup is not yet aware of payment/entitlement tables because the migration has not been applied or wired into runtime.
- Refund/re-delivery UI and operator SOP remain future work.

### Opportunistic Cleanup Completed

- Added explicit constants/tests for future payment and entitlement status values.
- Kept payment token hashing isolated from cache and fulfillment token hashing.

### Deferred Cleanup Candidates

- Add dual token resolver.
- Add payment/entitlement retention-expired UI states.
- Add optional provider-events audit table only if NewebPay integration needs it.
- Add FK from `generation_jobs.entitlement_ref_id` to `entitlements.id` only after reviewing circular migration/order implications.

### Recommended Follow-up

Run staging migration verification for `0007_payment_entitlements.sql` before any runtime integration.

## Deviations From Handoff

None.

## Git Commit

Pending until final commit step.

## Staging Push

Pending until final push step.

## Remaining Uncertainties

- Final NewebPay MerchantOrderNo constraints must be confirmed during provider integration.
- Exact retention duration for paid access must remain aligned with public copy before checkout launch.
- Whether to add a separate `paid_access_tokens` table later depends on support/revocation needs.

## Recommended Next Step

Run `Payment / Entitlement Schema Staging Migration Verification v0`.
