# Entitlement Unique Index Staging Apply v0

## Date

2026-05-31

## Completed Work

- Verified the database target before running SQL.
- Ran aggregate-only staging preflight checks for duplicate entitlement `payment_intent_id` groups, null/non-null counts, status counts, and current index state.
- Applied the partial unique index to the staging Neon preview branch only:
  - `entitlements_payment_intent_unique_idx`
  - table: `entitlements`
  - column: `payment_intent_id`
  - predicate: `payment_intent_id IS NOT NULL`
- Dropped the previous non-unique `entitlements_payment_intent_idx` on staging after the unique index was created.
- Verified the new index is unique and partial.
- Ran local idempotency regression tests covering entitlement conflict handling, NotifyURL, fake-paid, and generation job behavior.
- Confirmed production payment routes remain fail-closed and production database migration was not applied.
- Updated the project dashboard to mark staging uniqueness as applied and production as gated.

## Staging Target Verification

| Item | Result |
| --- | --- |
| Project | `anyu-next` |
| Neon project ID | `shy-silence-43729807` |
| Target branch | `preview` |
| Target branch ID | `br-fragrant-union-aoh4udf1` |
| Target database | `neondb` |
| Target role/source category | Neon MCP branch-specific SQL against non-default preview branch |
| Staging DB target confirmed | true |
| Production DB targeted | false |

The production Neon branch is separate from the target branch and was not used.

## Staging Duplicate Preflight

| Check | Result |
| --- | ---: |
| Duplicate non-null `payment_intent_id` groups | 0 |
| Duplicate rows inside duplicate groups | 0 |
| Non-null `payment_intent_id` entitlements | 14 |
| Null `payment_intent_id` entitlements | 0 |
| Entitlement status counts | `active: 14` |
| Unique index existed before apply | 0 |
| Legacy non-unique index existed before apply | 1 |

No row IDs, payment IDs, token hashes, user input, provider payloads, or private billing values were printed or recorded.

## Apply Method

Manual staging-only Neon SQL was used instead of a migration runner.

Reason:

- PostgreSQL `CREATE INDEX CONCURRENTLY` cannot run inside a transaction.
- The project migration history includes manual SQL files, and the runner transaction behavior for this migration was not verified.
- Running the two index statements directly against the verified staging preview branch is the safest staging-first apply path for this specific operation.

Applied statements:

```sql
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "entitlements_payment_intent_unique_idx"
ON "entitlements" USING btree ("payment_intent_id")
WHERE "payment_intent_id" IS NOT NULL;
```

```sql
DROP INDEX CONCURRENTLY IF EXISTS "entitlements_payment_intent_idx";
```

## Index Verification

| Check | Result |
| --- | --- |
| `entitlements_payment_intent_unique_idx` exists | true |
| Index is unique | true |
| Predicate is partial | `(payment_intent_id IS NOT NULL)` |
| Definition includes non-null predicate | true |
| Legacy non-unique index present after apply | false |
| Duplicate non-null groups after apply | 0 |

## Safe Staging QA

Live fake-paid/NotifyURL QA was not run because this task explicitly constrained row changes beyond migration metadata/index creation. Instead, the race/idempotency behavior was verified through the local payment regression suite:

- `payment-entitlement-foundation.test.ts`
- `paid-delivery-artifacts.test.ts`
- `newebpay-notify-service.test.ts`
- `operator-fake-paid-success.test.ts`
- `generation-jobs.test.ts`

Result:

- 59 test files passed.
- 378 tests passed.
- The tests cover unique-conflict reuse, duplicate fake-paid idempotency, duplicate NotifyURL behavior, generation job idempotency, and migration SQL shape.

## Production Safety

| Check | Result |
| --- | --- |
| Production health environment | `production` |
| Production route bundle | `payment-foundation-2026-05-29` |
| Production checkout route | JSON `not_found` |
| Production fake-paid route | JSON `not_found` |
| Production DB migration applied | false |
| Production payment runtime changed | false |

## Architecture Decisions

- Used manual Neon SQL for staging because concurrent index operations should not depend on an unverified transaction-wrapping runner.
- Did not run live fake-paid QA because it would create staging payment/entitlement rows; local idempotency tests were safer for this task’s row-change constraint.
- Production remains a separate manual migration gate.

## Blockers

- None for staging index application.

## Uncertainties

- The exact production migration method still needs approval: manual Neon SQL is recommended unless the migration runner is confirmed to execute `CREATE INDEX CONCURRENTLY` outside a transaction.
- A live staging duplicate-delivery QA can be run later if the owner approves creating test payment/entitlement rows.

## Suggested Next Steps

1. Run `Entitlement Unique Index Production Gate v0` after production launch readiness approval.
2. Before production apply, run the same aggregate-only duplicate preflight on the production branch.
3. Apply the concurrent unique index manually or with a verified non-transactional migration path.

## Known Technical Debt

- Drizzle migration metadata appears partially manual/stale from prior migrations; concurrent index operations should remain explicitly gated.

## Tech Debt Review

### New Technical Debt Introduced

- None.

### Existing Technical Debt Observed

- Production still needs the same uniqueness gate.
- Migration runner behavior for concurrent indexes remains unverified.

### Opportunistic Cleanup Completed

- Updated dashboard status from pending staging/prod gates to staging applied, production gated.

### Deferred Cleanup Candidates

- Add a permanent DB migration apply runbook for concurrent indexes.
- Add an approved live staging idempotency smoke that intentionally creates test rows.

### Recommended Follow-up

- `Entitlement Unique Index Production Gate v0` when production migration approval is appropriate.

## Git Commit

- Commit hash: `pending`
- Commit message: `db: apply entitlement uniqueness on staging`

## Staging Push

- Push status: `pending`
- Push command: `git push origin HEAD:staging`
