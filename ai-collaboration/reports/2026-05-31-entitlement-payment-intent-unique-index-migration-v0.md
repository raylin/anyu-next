# Entitlement Payment Intent Unique Index Migration v0

Date: 2026-05-31

## Summary

Added the migration artifact and runtime conflict handling needed to enforce one entitlement lifecycle per non-null `payment_intent_id`.

Important: the migration was **not applied** to staging or production in this task because this Codex session does not have a verified staging-only DB target and the SQL uses `CREATE INDEX CONCURRENTLY`, which must not be assumed safe inside every migration transaction runner. Production was not touched.

## Completed Work

- Added migration SQL:
  - `apps/web/drizzle/0008_entitlements_payment_intent_unique.sql`
- Updated Drizzle schema:
  - `entitlements_payment_intent_unique_idx`
  - unique partial index on `payment_intent_id`
  - `WHERE payment_intent_id IS NOT NULL`
- Updated paid delivery artifact conflict handling:
  - if entitlement insert hits unique conflict on `entitlements_payment_intent_unique_idx`, re-read existing entitlement by `paymentIntentId`
  - reuse existing entitlement idempotently
  - do not expose a newly generated raw paid access token from the losing insert path
  - do not create duplicate generation jobs
- Added tests for:
  - migration SQL shape
  - partial unique index excluding null `payment_intent_id`
  - no `status` in the unique index
  - unique-conflict re-read/reuse behavior
  - unresolved unique conflict returning `entitlement_unavailable`
  - existing NotifyURL/fake-paid/generation job idempotency paths
- Updated dashboard tech-debt status.

## Migration / Index Added

```sql
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "entitlements_payment_intent_unique_idx"
ON "entitlements" USING btree ("payment_intent_id")
WHERE "payment_intent_id" IS NOT NULL;

DROP INDEX CONCURRENTLY IF EXISTS "entitlements_payment_intent_idx";
```

This enforces:

- one entitlement lifecycle per non-null payment intent
- uniqueness across all entitlement statuses, including `active`, `revoked`, and `refunded`
- no restriction on future/non-payment entitlements where `payment_intent_id IS NULL`

## Runtime Conflict Handling

Updated `createPaidDeliveryArtifactsForPaymentIntent()`:

1. Existing sequential behavior remains: check `getEntitlementByPaymentIntentId()` first.
2. If no entitlement exists, attempt `createPaymentSingleEntitlement()`.
3. If insert fails with Postgres unique violation `23505` on `entitlements_payment_intent_unique_idx`, re-read by payment intent.
4. If re-read succeeds, continue with existing entitlement and generation job reuse.
5. If re-read fails, return safe `entitlement_unavailable`.

Safety behavior:

- No duplicate entitlement is created.
- No duplicate generation job is created because generation jobs still use `dedupe_key`.
- No raw token from the failed insert path is returned, even for operator-controlled paths.

## Staging Preflight Result

Not run.

Reason:

- No verified staging-only DB target was available in this task without risking accidental production access.
- Production querying was explicitly out of scope without approval.

Prepared staging preflight SQL remains in:

- `ai-collaboration/reports/2026-05-31-entitlement-payment-intent-uniqueness-migration-plan-v0.md`

Minimum preflight before applying:

```sql
SELECT payment_intent_id, COUNT(*) AS entitlement_count
FROM entitlements
WHERE payment_intent_id IS NOT NULL
GROUP BY payment_intent_id
HAVING COUNT(*) > 1;
```

Expected result: zero rows. If any rows appear, stop and inspect before applying the unique index.

## Staging Migration Status

Not applied.

Owner/operator should apply this to Preview/staging DB only after preflight passes and after confirming whether the migration runner supports `CREATE INDEX CONCURRENTLY`.

If the runner wraps migrations in a transaction, apply the SQL manually through an approved Neon SQL operation instead of `drizzle-kit migrate`.

## Production Migration Status

Not applied.

Production gate:

1. Keep `ENABLE_PAYMENT_RUNTIME=false`.
2. Run aggregate duplicate preflight SQL.
3. Confirm zero duplicate non-null `payment_intent_id` groups.
4. Apply unique index with owner approval.
5. Verify production checkout/fake-paid routes remain fail-closed.
6. Do not enable payment runtime as part of this migration.

## Migration Tooling Check

- `cd apps/web && corepack pnpm exec drizzle-kit check`: passed.
- `cd apps/web && corepack pnpm exec drizzle-kit generate --name entitlement_payment_intent_unique_check --dry-run`: failed because this installed Drizzle CLI does not support `--dry-run`.

## Validation

- `cd apps/web && corepack pnpm test -- src/tests/payment-entitlement-foundation.test.ts src/tests/paid-delivery-artifacts.test.ts src/tests/newebpay-notify-service.test.ts src/tests/operator-fake-paid-success.test.ts src/tests/generation-jobs.test.ts`: passed, 59 files / 378 tests
- `cd apps/web && corepack pnpm exec drizzle-kit check`: passed
- `cd apps/web && corepack pnpm lint`: passed
- `cd apps/web && corepack pnpm test`: passed, 59 files / 378 tests
- `cd apps/web && corepack pnpm build`: passed

## Blockers

- Staging DB application remains pending because no verified staging-only DB target was used in this task.
- `CREATE INDEX CONCURRENTLY` requires confirming migration runner transaction behavior or using manual SQL.

## Tech Debt Review

- New technical debt introduced: migration file exists before staging application; this is intentional but should be closed by an owner-approved staging DB apply task.
- Existing technical debt observed: the Drizzle journal metadata appears older than the current manual SQL migration set; avoid assuming `drizzle-kit migrate` will apply every manual file without verification.
- Opportunistic cleanup completed: service-level unique conflict handling added before production launch.
- Deferred cleanup candidates:
  - Provider trade-number uniqueness after production callback semantics are proven.
  - Optional helper for safe staging DB preflight if DB target selection remains manual/friction-heavy.

## Suggested Next Steps

1. Run `Entitlement Unique Index Staging Apply v0`:
   - verify staging DB target
   - run duplicate preflight SQL
   - apply migration SQL if clean
   - verify index exists
   - run fake-paid duplicate/idempotency QA
2. Keep production payment runtime disabled.
3. Apply production only through a separate production migration gate after staging passes.
