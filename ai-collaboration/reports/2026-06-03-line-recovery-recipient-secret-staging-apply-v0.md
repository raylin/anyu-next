# LINE Recovery Recipient Secret Staging Apply v0

Date: 2026-06-03

## Completed Work

- Verified the staging DB target before running SQL.
- Ran staging preflight for `payment_recovery_contact_secrets`.
- Applied `apps/web/drizzle/0011_payment_recovery_contact_secrets.sql` to Preview(staging) Neon branch only.
- Verified table, expected columns, indexes, constraints, FK, and empty row count.
- Configured branch-scoped Preview(staging) `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY` as an encrypted/sensitive Vercel env var.
- Redeployed Preview(staging) and pointed `staging.anyu.tw` to the fresh deployment.
- Ran recovery-link and no-card checkout regressions.
- Confirmed Production DB/env/runtime remained untouched/fail-closed.

## Staging DB Target Verification

| Check | Result |
| --- | --- |
| Neon project | `anyu-next` |
| Project ID | `shy-silence-43729807` |
| Staging branch | `preview` |
| Staging branch ID | `br-fragrant-union-aoh4udf1` |
| Database | `neondb` |
| Staging target confirmed | true |
| Connection source category | Neon preview branch metadata / MCP SQL against branch ID |
| Production DB targeted | false |

Production branch for comparison:

- Branch name: `production`
- Branch ID: `br-square-star-aosaqd0q`

No connection strings or credentials were printed.

## Migration Preflight

Before apply:

| Check | Result |
| --- | --- |
| `payment_recovery_contact_secrets` table exists | false |
| Drizzle journal table found | false |
| Existing row count | not applicable; table absent |
| Existing indexes/constraints | none |

## Migration Apply Method

Method:

- Manual Neon SQL transaction against staging branch `br-fragrant-union-aoh4udf1`.
- SQL source: checked-in migration file `apps/web/drizzle/0011_payment_recovery_contact_secrets.sql`.

Applied objects:

- `payment_recovery_contact_secrets` table
- `payment_recovery_contact_secrets_contact_idx`
- `payment_recovery_contact_secrets_recipient_lookup_idx`
- `payment_recovery_contact_secrets_active_contact_idx`
- channel, purpose, and status check constraints
- FK to `payment_recovery_contacts`

No Production SQL was applied.

## Schema Verification

After apply:

| Check | Result |
| --- | --- |
| Table exists | true |
| Row count | 0 |
| Expected columns present | true |
| Primary key present | true |
| FK present | true |
| Check constraints present | true |
| Expected indexes present | true |
| Production DB table exists | false |

Verified columns:

- `id`
- `recovery_contact_id`
- `channel`
- `purpose`
- `recipient_hash`
- `encrypted_recipient`
- `key_version`
- `status`
- `failure_category`
- `last_used_at`
- `revoked_at`
- `created_at`
- `updated_at`

No encrypted recipient values, recipient hashes, raw LINE identifiers, or row data were printed.

## Preview(staging) Env Alignment

Configured env:

- `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`

Result:

| Check | Result |
| --- | --- |
| Preview(staging) branch-scoped env present before task | false |
| Generated new staging-only value | true |
| Preview(staging) branch-scoped env present after task | true |
| Production env modified | false |
| General Preview env modified | false |
| Value printed | false |
| Length/prefix/suffix/hash/checksum printed | false |

The value was generated as a strong 32-byte base64url-compatible secret and passed directly to Vercel CLI without writing it to tracked files.

## Redeploy Result

Preview(staging) redeploy completed successfully.

| Check | Result |
| --- | --- |
| Fresh Preview deployment created | true |
| Staging alias updated | true |
| Staging health environment | `preview` |
| Staging branch | `staging` |
| Staging commit | `35fdec93998a` |
| Route bundle version | `payment-foundation-2026-05-29` |

Deployment URL was used only for aliasing. No secrets were printed.

## Service-Level Sanity

No staging test recipient secret row was inserted.

Reason:

- Bind route integration is intentionally deferred.
- This task should not store raw LINE userId from a real account.
- Schema verification plus prior local helper tests are sufficient for staging apply.

## Regression QA

Command:

```bash
cd apps/web && corepack pnpm run qa:recovery-link:smoke
```

Result: pass.

Sanitized outcome:

- staging health passed at commit `35fdec93998a`
- runtime operator recovery-link smoke passed
- invalid-link safety passed
- cleanup by revocation passed
- production fail-closed checks passed
- no Email or LINE sent
- no raw `prl_`, token hash, raw `pa_`, or raw `pcs_` printed

Command:

```bash
cd apps/web && corepack pnpm run qa:result-checkout:no-card
```

Result: pass.

Sanitized outcome:

- result CTA passed
- checkout-start passed
- operator fake-paid passed
- queue completed
- paid access render passed
- production fail-closed checks passed
- no provider payment submitted

## Production Safety

| Check | Result |
| --- | --- |
| Production payment runtime changed | false |
| Production env modified | false |
| Production DB migration applied | false |
| Production `payment_recovery_contact_secrets` table exists | false |
| Production checkout/fake-paid/operator endpoints fail closed | true |
| LINE messages sent | false |
| Email sent | false |

Production Vercel env metadata did not list `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`.

## Architecture Decisions

- Used the same manual Neon preview-branch SQL apply method as prior staging-only recovery migrations.
- Added the new recipient key only to branch-scoped Preview(staging).
- Redeployed staging because runtime needs the new env before bind integration can safely use recipient secret helpers.
- Did not insert any test recipient secret rows before bind integration.

## Blockers

- None for staging apply.

## Uncertainties

- Bind route integration is still required before any real LINE recipient secret can be stored.
- Real LINE push remains blocked until bind integration stores encrypted recipient secrets.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: production DB/env remain intentionally gated; bind integration remains pending.
- Opportunistic cleanup completed: none; ops-only task.
- Deferred cleanup candidates: add a sanitized staging helper to verify recipient secret creation after bind integration.

## Recommended Next Task

`LINE Recovery Bind Recipient Secret Integration v0`
