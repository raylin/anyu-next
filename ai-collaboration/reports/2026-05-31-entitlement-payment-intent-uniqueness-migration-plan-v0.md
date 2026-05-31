# Entitlement / Payment Intent Uniqueness Migration Plan v0

Date: 2026-05-31

## Summary

Current paid delivery idempotency is service-level and works for sequential duplicate callbacks, but `entitlements.payment_intent_id` is only indexed, not unique. A duplicate NotifyURL or retry race could theoretically create two entitlements for the same payment intent if two workers both observe no existing entitlement before insert.

Recommendation: add a DB-level partial unique index on `entitlements(payment_intent_id)` where `payment_intent_id IS NOT NULL`, then update the entitlement creation path to treat uniqueness conflicts as “reuse existing entitlement”. Do this in a separate migration implementation task after staging data preflight. Do not rewrite historical rows.

## Schema Findings

### `payment_intents`

Defined in `apps/web/drizzle/0007_payment_entitlements.sql` and `apps/web/src/lib/db/schema.ts`.

Important fields:

- `id` primary key
- `provider`
- `provider_environment`
- `merchant_order_no`
- `module_slug`
- `analysis_request_id`
- `analysis_result_id`
- `unlock_intent_id`
- `amount_minor`
- `currency`
- `status`
- provider status/trade/payment metadata
- checkout/notify/return/paid/refund timestamps

Current indexes/constraints:

- `payment_intents_merchant_order_no_idx`: unique on `merchant_order_no`
- `payment_intents_provider_trade_idx`: non-unique on `(provider, provider_trade_no)`
- `payment_intents_result_idx`: non-unique on `analysis_result_id`
- `payment_intents_status_created_idx`: non-unique on `(status, created_at)`
- `payment_intents_module_created_idx`: non-unique on `(module_slug, created_at)`

### `entitlements`

Defined in `apps/web/drizzle/0007_payment_entitlements.sql` and `apps/web/src/lib/db/schema.ts`.

Important fields:

- `id` primary key
- `entitlement_type`
- `source`
- `status`
- `module_slug`
- `analysis_request_id`
- `analysis_result_id`
- `payment_intent_id`
- `unlock_intent_id`
- `generation_job_id`
- `paid_access_token_hash`
- paid access token metadata
- `remaining_uses`
- expiration/activation/consumption/revocation/refund timestamps

Current indexes/constraints:

- `entitlements_paid_access_token_hash_idx`: unique partial index where `paid_access_token_hash IS NOT NULL`
- `entitlements_payment_intent_idx`: non-unique on `payment_intent_id`
- `entitlements_result_idx`: non-unique on `analysis_result_id`
- `entitlements_module_status_idx`: non-unique on `(module_slug, status)`
- `entitlements_expires_at_idx`: non-unique on `expires_at`

Current gap:

- No DB-level uniqueness on `payment_intent_id`.

### `generation_jobs`

Defined in `apps/web/drizzle/0006_generation_jobs.sql` and `apps/web/src/lib/db/schema.ts`.

Important fields:

- `id` primary key
- `job_type`
- `status`
- `module_slug`
- `input_ref_type`
- `input_ref_id`
- `output_ref_type`
- `output_ref_id`
- `trigger_source`
- `dedupe_key`
- `entitlement_ref_id`
- retry/lock/model metadata

Current indexes/constraints:

- `generation_jobs_dedupe_key_idx`: unique on `dedupe_key`
- status/type/input/output/module/trigger indexes

Current protection:

- `createOrReusePaidAnalysisJob()` uses a deterministic dedupe key based on job type, module slug, analysis result ID, prompt version, and schema version.
- Duplicate generation jobs for the same paid analysis artifact are already DB-protected by unique dedupe key.

## Runtime Idempotency Findings

### Duplicate NewebPay NotifyURL

`processNewebPayNotify()`:

- Verifies provider callback.
- Loads payment intent by `merchantOrderNo`.
- Checks amount/currency/provider success.
- If payment intent is already `paid`, treats callback as `duplicate_notify`.
- Calls paid delivery artifact creation in both first-paid and duplicate-notify paths.
- Triggers queue processing with DB-reference-only payload after delivery artifact creation.

Sequential duplicate behavior is idempotent because delivery artifact creation first checks `getEntitlementByPaymentIntentId()`.

Remaining race:

- Two concurrent callbacks can both observe no entitlement, then both try to insert.
- Without a unique `payment_intent_id` constraint, both could succeed.

### Duplicate Operator Fake-Paid

`createOperatorFakePaidSuccess()`:

- Builds deterministic fake merchant order number from module/result/idempotency key.
- Reuses existing payment intent by merchant order number.
- Checks existing entitlement if payment intent exists.
- Marks payment paid if needed.
- Calls paid delivery artifact creation.
- Queue trigger uses `operator_fake_paid`.

Sequential duplicate behavior is idempotent.

Remaining race:

- Same entitlement creation race exists if concurrent fake-paid requests use the same payment intent and both observe no entitlement before insert.

### Entitlement Creation / Reuse

`createPaidDeliveryArtifactsForPaymentIntent()`:

- Calls `getEntitlementByPaymentIntentId(paymentIntent.id)` first.
- If none exists, calls `createPaymentSingleEntitlement()`.
- Then creates/reuses generation job.

`createPaymentSingleEntitlement()`:

- Inserts a new entitlement.
- Generates and stores a hash-at-rest paid access token.
- Does not use `onConflictDoNothing()` because no payment-intent unique constraint currently exists.

### Generation Job Creation / Reuse

`createOrReusePaidAnalysisJob()`:

- Inserts deterministic paid-analysis job.
- Uses `onConflictDoNothing({ target: generationJobs.dedupeKey })`.
- Fetches existing job by dedupe key if insert does not create.

Generation job duplicate handling is already DB-backed.

## Existing Data Risk / Preflight SQL

Do not run these against production without explicit approval. Run on staging first.

### Duplicate entitlements by payment intent

```sql
SELECT
  payment_intent_id,
  COUNT(*) AS entitlement_count,
  COUNT(*) FILTER (WHERE status = 'active') AS active_count,
  MIN(created_at) AS first_created_at,
  MAX(created_at) AS last_created_at
FROM entitlements
WHERE payment_intent_id IS NOT NULL
GROUP BY payment_intent_id
HAVING COUNT(*) > 1
ORDER BY entitlement_count DESC, last_created_at DESC;
```

Expected before migration: zero rows.

### Null payment-intent entitlements

```sql
SELECT
  source,
  status,
  COUNT(*) AS count
FROM entitlements
WHERE payment_intent_id IS NULL
GROUP BY source, status
ORDER BY count DESC;
```

These rows should remain allowed. A partial unique index must exclude nulls.

### Sandbox/operator/prod row shape

```sql
SELECT
  e.source,
  e.status,
  p.provider,
  p.provider_environment,
  COUNT(*) AS count
FROM entitlements e
LEFT JOIN payment_intents p ON p.id = e.payment_intent_id
GROUP BY e.source, e.status, p.provider, p.provider_environment
ORDER BY count DESC;
```

Use this only for aggregate shape; do not export row-level customer/payment data.

### Payment intents without entitlements

```sql
SELECT
  p.provider,
  p.provider_environment,
  p.status,
  COUNT(*) AS count
FROM payment_intents p
LEFT JOIN entitlements e ON e.payment_intent_id = p.id
WHERE e.id IS NULL
GROUP BY p.provider, p.provider_environment, p.status
ORDER BY count DESC;
```

This helps verify expected pending/failed checkout rows and paid rows without artifacts.

## Recommended Constraint Strategy

Add:

```sql
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS entitlements_payment_intent_unique_idx
ON entitlements (payment_intent_id)
WHERE payment_intent_id IS NOT NULL;
```

Why partial unique:

- Allows future/free/non-payment entitlements with `payment_intent_id IS NULL`.
- Enforces one entitlement per payment intent for real provider and operator fake-paid flows.
- Covers active, refunded, revoked, and expired entitlement states, preserving audit history that a payment intent should map to a single entitlement lifecycle.
- Avoids accidental second active entitlement after refund/revoke. Refund/revoke should mutate status, not create a second entitlement for the same payment.

Do not include status in the unique index.

Reason:

- Including status would allow one `active`, one `refunded`, one `revoked`, etc. for the same payment intent, which weakens the safety invariant.

Do not exclude `operator_test`.

Reason:

- Operator fake-paid should exercise the same idempotency and race-safety invariants as real provider flows.

PostgreSQL support:

- Neon Postgres supports partial unique indexes and `CREATE INDEX CONCURRENTLY`.

## Related Artifact Uniqueness

### Paid access token hash

Already protected:

```sql
CREATE UNIQUE INDEX entitlements_paid_access_token_hash_idx
ON entitlements (paid_access_token_hash)
WHERE paid_access_token_hash IS NOT NULL;
```

No change recommended now.

### Payment intent provider order

Already protected:

```sql
CREATE UNIQUE INDEX payment_intents_merchant_order_no_idx
ON payment_intents (merchant_order_no);
```

No change recommended now.

Potential later improvement:

- Consider unique partial index on `(provider, provider_trade_no)` where `provider_trade_no IS NOT NULL` after production evidence.
- Not recommended before launch because provider trade number semantics across retries/refunds should be confirmed with real production callbacks first.

### Generation jobs

Already protected:

```sql
CREATE UNIQUE INDEX generation_jobs_dedupe_key_idx
ON generation_jobs (dedupe_key);
```

No change recommended now.

Potential later improvement:

- Consider unique index on `entitlement_ref_id` where not null only if every entitlement should have at most one generation job across all prompt/schema versions.
- Not recommended now because current dedupe key intentionally includes prompt/schema versions, allowing future regeneration/versioning semantics.

## Migration Plan

Proposed migration file:

```text
apps/web/drizzle/0008_entitlements_payment_intent_unique.sql
```

Migration SQL:

```sql
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "entitlements_payment_intent_unique_idx"
ON "entitlements" USING btree ("payment_intent_id")
WHERE "payment_intent_id" IS NOT NULL;
```

Important Drizzle note:

- `CREATE INDEX CONCURRENTLY` cannot run inside a transaction.
- Confirm current migration runner behavior before using `CONCURRENTLY`.
- If Drizzle wraps migrations in a transaction, use a manually approved Neon SQL migration step or non-concurrent index creation during a maintenance window.

Runtime follow-up recommended with migration:

- Update `createPaymentSingleEntitlement()` or `createPaidDeliveryArtifactsForPaymentIntent()` to handle unique conflict by re-fetching the existing entitlement by `paymentIntentId`.
- Add tests for conflict handling.

## Rollback Plan

If index creation causes issues:

```sql
DROP INDEX CONCURRENTLY IF EXISTS "entitlements_payment_intent_unique_idx";
```

Rollback does not delete data and does not change runtime code by itself.

## Staging Verification Gate

1. Run duplicate preflight SQL on staging.
2. If duplicates exist, stop and inspect before migration.
3. Apply migration to staging only.
4. Run fake-paid duplicate/idempotency QA.
5. Run queue-mode fake-paid QA.
6. If sandbox credentials remain available, run a lightweight sandbox checkout/notify smoke only if needed; no real payment.
7. Confirm duplicate NotifyURL service tests pass locally.

## Production Migration Gate

Only after staging passes:

1. Keep `ENABLE_PAYMENT_RUNTIME=false`.
2. Run aggregate duplicate preflight SQL on production.
3. If duplicates exist, stop and create a data decision log.
4. Apply unique index with owner approval.
5. Confirm production checkout/fake-paid routes remain fail-closed.
6. Do not enable payment runtime as part of the migration task.

## Tests To Add In Implementation

- Duplicate NotifyURL does not create duplicate entitlement.
- Concurrent/unique-conflict delivery creation re-fetches the existing entitlement and continues.
- Duplicate fake-paid still reuses artifacts.
- Refunded/revoked entitlement remains the only entitlement for a payment intent.
- Generation job duplicate handling remains idempotent through `dedupe_key`.
- DB schema/index test or migration snapshot confirms partial unique index.

## Recommended Implementation Task

Task title:

```text
Entitlement Payment Intent Unique Index Migration v0
```

Scope:

- Add migration only after staging preflight SQL passes.
- Add unique conflict handling in entitlement delivery path.
- Add tests.
- Do not enable production runtime.
- Do not rewrite historical rows.

## Blockers

None for planning.

## Uncertainties

- Existing staging/production duplicate counts were not queried in this planning task.
- Drizzle migration transaction behavior should be confirmed before choosing `CREATE UNIQUE INDEX CONCURRENTLY` inside a migration file.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: DB-level one-entitlement-per-payment-intent invariant is not yet enforced.
- Opportunistic cleanup completed: migration strategy and data preflight SQL documented.
- Deferred cleanup candidates: provider trade number uniqueness after production callback semantics are proven.

## Suggested Next Step

Run `Entitlement Payment Intent Unique Index Migration v0` on staging first, with preflight SQL and runtime conflict handling tests.
