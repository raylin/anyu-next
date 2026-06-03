# Provider Send Audit Staging Apply v0

Date: 2026-06-03

## Completed Work

- Verified the Neon DB target before applying SQL.
- Ran preflight checks for `paid_result_recovery_links` and audit-column status.
- Applied `apps/web/drizzle/0012_paid_result_recovery_link_send_audit.sql` to Preview(staging) only.
- Verified the five provider send audit columns exist and existing rows remain readable.
- Ran staging-safe regression smoke:
  - `qa:recovery-link:smoke`
  - `qa:result-checkout:no-card`
- Confirmed production DB/env/runtime were not modified.

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
| `paid_result_recovery_links` table exists | true |
| Existing row count | 29 |
| Audit columns already existed | false |
| Drizzle journal table found | false |
| Existing indexes checked | name-only |
| Existing constraints checked | name-only |

Existing indexes were unchanged:

- `paid_result_recovery_links_active_lookup_idx`
- `paid_result_recovery_links_contact_idx`
- `paid_result_recovery_links_entitlement_idx`
- `paid_result_recovery_links_pkey`
- `paid_result_recovery_links_result_module_idx`
- `paid_result_recovery_links_token_hash_idx`

No token hashes, raw tokens, recipient values, provider payloads, or row-level private values were printed.

## Migration Apply Method

Method:

- Manual Neon SQL transaction against staging branch `br-fragrant-union-aoh4udf1`.
- SQL source: checked-in migration file `apps/web/drizzle/0012_paid_result_recovery_link_send_audit.sql`.

Applied columns:

- `provider_message_id`
- `last_send_attempt_at`
- `send_attempt_count`
- `last_failure_category`
- `last_provider_status`

No Production SQL was applied.

## Schema Verification

After apply:

| Check | Result |
| --- | --- |
| Expected audit columns present | true |
| Existing rows readable | true |
| Row count after regression smoke | 30 |
| `send_attempt_count` readable for all rows | true |
| `send_attempt_count` default on existing rows | 0 |
| Nullable audit fields safe | true |
| Production recovery-link table exists | false |
| Production audit columns present | false |

Verified column defaults/nullability:

- `provider_message_id`: nullable, default null
- `last_send_attempt_at`: nullable, default null
- `send_attempt_count`: not null, default 0
- `last_failure_category`: nullable, default null
- `last_provider_status`: nullable, default null

Post-smoke aggregate sanity:

- rows with send attempt timestamp: 0
- rows with provider message id: 0
- total send attempt count: 0
- rows with failure category: 0
- rows with provider status: 0

This is expected because the regression smokes did not send Email or LINE.

## Regression QA

Command:

```bash
cd apps/web && corepack pnpm run qa:recovery-link:smoke
```

Result: pass.

Sanitized outcome:

- staging health passed at commit `dc854f7e3493`
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

- staging health passed at commit `dc854f7e3493`
- result checkout CTA passed
- checkout-start passed
- operator fake-paid passed
- paid status completed
- paid access render passed
- production fail-closed checks passed
- no provider payment submitted

## Optional Provider Audit Sanity

No real Email or LINE message was sent in this task.

The optional sanity check was limited to aggregate DB reads confirming the new audit fields are readable and remain empty after no-send regression smokes.

## Production Safety

| Check | Result |
| --- | --- |
| Production payment runtime changed | false |
| Production env modified | false |
| Production DB migration applied | false |
| Production `paid_result_recovery_links` table exists | false |
| Production checkout/fake-paid/operator endpoints fail closed | true |
| Production Email sent | false |
| Production LINE message sent | false |

## Architecture Decisions

- Used the same manual Neon preview-branch SQL apply method as prior staging-only recovery migrations.
- Did not run any real provider send just to populate audit fields.
- Left provider send audit smoke with real Email/LINE for a future controlled provider-specific task if needed.

## Blockers

- None for Preview(staging) provider send audit DB readiness.

## Uncertainties

- Production DB/env remain gated until explicit production launch decision.
- Full support resend tooling still needs verification SOP and operator UX/API design.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: inline audit fields do not provide full historical attempt timelines.
- Opportunistic cleanup completed: none; ops-only task.
- Deferred cleanup candidates: add a separate send-attempt table later if public resend or provider webhook timelines require it.

## Recommended Next Task

`Support Ops Helper v0`
