# Paid Result Recovery Identity Staging Apply v0

## Date

2026-05-31

## Completed Work

- Verified the database target before running migration SQL.
- Ran schema-only staging preflight checks for `payment_recovery_contacts`.
- Applied `apps/web/drizzle/0009_payment_recovery_contacts.sql` to the staging Neon preview branch only.
- Verified the created table, expected columns, expected indexes, primary key, foreign keys, and empty starting row count.
- Ran local recovery contact service tests after staging apply.
- Confirmed production payment routes remain fail-closed.
- Confirmed the production database does not have `payment_recovery_contacts`.

## Staging Target Verification

| Item | Result |
| --- | --- |
| Project | `anyu-next` |
| Neon project ID | `shy-silence-43729807` |
| Target branch | `preview` |
| Target branch ID | `br-fragrant-union-aoh4udf1` |
| Target database | `neondb` |
| Connection source category | Neon MCP branch-specific SQL against non-default preview branch |
| Staging DB target confirmed | true |
| Production DB targeted for migration | false |

The production Neon branch is separate from the target branch and was not used for migration SQL.

## Preflight

| Check | Result |
| --- | --- |
| `payment_recovery_contacts` table existed before apply | false |
| Existing `payment_recovery_contacts` indexes before apply | none |
| Existing row count before apply | not applicable; table absent |
| Migration journal table found | none |

The first combined preflight query attempted to include a conditional row count and PostgreSQL still planned the missing table reference. It failed without changing data. The preflight was rerun in table-existence-safe pieces.

## Apply Method

Manual staging-only Neon SQL was used.

Reason:

- The checked-in migration is plain `CREATE TABLE` / `CREATE INDEX` SQL without `CREATE INDEX CONCURRENTLY`.
- The staging target was explicitly verified as the non-default `preview` branch.
- No migration journal exists in the current staging database, matching prior manual migration history.

Applied migration:

- `apps/web/drizzle/0009_payment_recovery_contacts.sql`

No production SQL was applied.

## Schema Verification

| Check | Result |
| --- | --- |
| Table exists after apply | true |
| Row count after apply | 0 |
| Expected columns present | true |
| Primary key present | true |
| Foreign keys present | true |
| Expected non-unique indexes present | true |
| Expected unique active-contact indexes present | true |
| Unique partial indexes present | true |
| DB CHECK constraints for enum-like fields | none |

Expected indexes verified:

- `payment_recovery_contacts_pkey`
- `payment_recovery_contacts_result_idx`
- `payment_recovery_contacts_payment_intent_idx`
- `payment_recovery_contacts_entitlement_idx`
- `payment_recovery_contacts_contact_lookup_idx`
- `payment_recovery_contacts_result_contact_active_idx`
- `payment_recovery_contacts_payment_contact_active_idx`

Foreign keys verified:

- `analysis_result_id` references `analysis_results(id)`
- `payment_intent_id` references `payment_intents(id)`
- `entitlement_id` references `entitlements(id)`

`contact_type`, `source`, and `status` are currently enforced by server helper constants and tests rather than DB CHECK constraints. This matches the migration that was reviewed and committed in the schema task.

## Service-Level Sanity

No staging test recovery contact row was inserted. This task avoided creating customer-like rows and did not require a live insert to verify the schema.

Local recovery contact regression tests passed:

- `cd apps/web && corepack pnpm test -- src/tests/payment-recovery-contacts.test.ts`
- Result: 63 files passed, 404 tests passed.

## Production Safety

| Check | Result |
| --- | --- |
| Production health environment | `production` |
| Production branch | `main` |
| Production route bundle | `payment-foundation-2026-05-29` |
| Production checkout route | JSON `not_found` |
| Production fake-paid route | JSON `not_found` |
| Production `payment_recovery_contacts` table exists | false |
| Production payment runtime changed | false |
| Production DB migration applied | false |

## Architecture Decisions

- Used Neon MCP branch-specific SQL instead of local `DATABASE_URL`, because prior QA documented that local `.env.local` DB targets can differ from Preview(staging).
- Did not insert a staging test row; schema verification plus local service tests were sufficient and cleaner for this apply task.
- Kept enum-like values service-enforced for now; a DB CHECK constraint hardening task can be planned separately if desired.

## Blockers

- None for staging apply.

## Uncertainties

- Production migration remains gated and was not applied.
- A future decision is still needed on whether to add DB CHECK constraints for `contact_type`, `source`, and `status`.
- Encryption key rotation policy remains undefined.

## Suggested Next Steps

1. Run `Checkout-Start Recovery Soft Gate UX Plan / Implementation v0`.
2. Plan `Payment Recovery Contacts Production Gate v0` only after production launch/migration approval.
3. Consider a small DB CHECK constraint hardening plan if enum enforcement should move from service-only to DB-level.

## Tech Debt Review

### New Technical Debt Introduced

- None.

### Existing Technical Debt Observed

- Production DB still lacks the recovery table by design.
- Recovery UI and recovery-link sending remain unimplemented.
- Enum-like fields are not DB CHECK constrained.

### Opportunistic Cleanup Completed

- Updated dashboard recovery status after staging apply.

### Deferred Cleanup Candidates

- Add DB CHECK constraints for recovery contact type/source/status if desired.
- Create a production migration gate report before production launch.
- Implement checkout-start recovery soft gate UX.

### Recommended Follow-up

- `Checkout-Start Recovery Soft Gate UX Plan / Implementation v0`.

## Git Commit

- Commit hash: `pending`
- Commit message: `db: apply recovery identity schema on staging`

## Staging Push

- Push status: `pending`
- Push command: `git push origin HEAD:staging`

