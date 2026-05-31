# Entitlement Unique Index Staging Apply v0 Handoff

## Date

2026-05-31

## Task

Apply and verify the entitlement `payment_intent_id` unique index on the staging database only, then run safe idempotency QA.

## Context

- `e107962` added code and migration support for a partial unique index on `entitlements(payment_intent_id)` where non-null.
- Migration file: `apps/web/drizzle/0008_entitlements_payment_intent_unique.sql`.
- Runtime paid-delivery artifact creation catches the unique conflict, re-reads the existing entitlement, and continues idempotently.
- The migration has not been applied to staging or production.
- Production payment runtime remains disabled.

## Relevant Files

- `apps/web/drizzle/0008_entitlements_payment_intent_unique.sql`
- `apps/web/src/lib/db/schema.ts`
- `apps/web/src/lib/payments/paid-delivery-artifacts.ts`
- `apps/web/src/tests/paid-delivery-artifacts.test.ts`
- `apps/web/src/tests/payment-entitlement-foundation.test.ts`
- `ai-collaboration/reports/`
- `ai-collaboration/summaries/summary_log.md`
- `ai-collaboration/dashboard/anyu-project-dashboard.html`

## Constraints

- Do not apply production migration.
- Do not enable payment runtime or change production flags.
- Do not print database credentials, connection strings, full row IDs, provider payloads, tokens, or private values.
- Do not rewrite or delete historical rows.
- Stop before applying the index if staging DB target cannot be confidently verified or if duplicate non-null `payment_intent_id` groups exist.

## Planned Work

1. Save this handoff.
2. Verify the database target is staging without printing credentials.
3. Run sanitized staging duplicate/index preflight SQL.
4. Apply the partial unique index to staging only if preflight is clean and the apply method is safe.
5. Verify index uniqueness and partial predicate.
6. Run safe idempotency QA or document why live QA is not available.
7. Confirm production remains untouched.
8. Generate an execution report, update the summary log and dashboard if needed.
9. Run validation, commit, and push to `origin/staging` unless blocked.

## Uncertainties

- Whether the verified staging database connection is available from local env/Neon tooling.
- Whether migration application should use a runner or manual SQL; `CREATE INDEX CONCURRENTLY` cannot run inside a transaction.
