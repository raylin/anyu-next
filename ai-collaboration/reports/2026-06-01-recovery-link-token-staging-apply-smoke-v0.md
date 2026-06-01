# Recovery Link Token Staging Apply / Smoke v0

Date: 2026-06-01
Task: Recovery Link Token Staging Apply / Smoke v0
Commit: pending at report creation; final commit recorded in Codex completion summary

## Completed Work

- Verified the staging DB target as Neon project `anyu-next`, branch `preview`.
- Confirmed production branch was not targeted for migration.
- Ran staging preflight for `paid_result_recovery_links`.
- Applied `apps/web/drizzle/0010_paid_result_recovery_links.sql` to the staging/preview branch only.
- Verified table, expected columns, expected indexes, unique `token_hash` index, and zero starting rows.
- Configured branch-scoped Preview(`staging`) `PAYMENT_RECOVERY_LINK_TOKEN_SECRET` as a sensitive env var.
- Redeployed Preview(`staging`) so runtime picked up the new env.
- Ran `qa:result-checkout:no-card`; it passed end-to-end.
- Ran `/r/[recoveryToken]` invalid-token safety check; it failed safely with support copy.
- Confirmed production runtime remains disabled/fail-closed.
- Confirmed production DB does not have `paid_result_recovery_links`.

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
- Production DB migration applied: false

No connection strings or credentials were printed.

## Migration Preflight

Before apply:

| Check | Result |
| --- | --- |
| `paid_result_recovery_links` table exists | false |
| existing index names | none |
| existing column names | none |
| Drizzle journal table found | false |

The first conditional preflight query safely failed because Postgres parsed a reference to the missing table even inside a conditional expression. A catalog-only preflight was then used and passed.

## Migration Apply Method

Method:

- Manual Neon SQL transaction against staging branch `br-fragrant-union-aoh4udf1`.
- SQL source: checked-in migration file `apps/web/drizzle/0010_paid_result_recovery_links.sql`.
- Statements used ordinary `CREATE TABLE` and `CREATE INDEX`; no `CREATE INDEX CONCURRENTLY` was involved.

Applied objects:

- `paid_result_recovery_links` table
- `paid_result_recovery_links_token_hash_idx`
- `paid_result_recovery_links_entitlement_idx`
- `paid_result_recovery_links_contact_idx`
- `paid_result_recovery_links_result_module_idx`
- `paid_result_recovery_links_active_lookup_idx`

## Schema Verification

After apply:

| Check | Result |
| --- | --- |
| table exists | true |
| row count | 0 |
| expected columns | present |
| expected indexes | present |
| `token_hash` unique index | true |
| status/expiry/revocation fields | present |
| production DB touched | false |

Verified columns:

- `id`
- `module_slug`
- `analysis_result_id`
- `payment_intent_id`
- `entitlement_id`
- `recovery_contact_id`
- `token_hash`
- `purpose`
- `channel`
- `status`
- `expires_at`
- `used_at`
- `revoked_at`
- `sent_at`
- `created_at`
- `updated_at`

## Preview(staging) Env Alignment

Configured env:

- `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`

Result:

| Check | Result |
| --- | --- |
| Preview(`staging`) branch-scoped env present | true |
| target | `preview` |
| git branch | `staging` |
| type | `sensitive` |
| Production env modified | false |
| General Preview env modified | false |
| value printed | false |

Operational note:

- An initial staging-only secret was created as unreadable sensitive env.
- For the attempted smoke setup, it was replaced once with a new strong staging-only value held temporarily outside the repo. The link table still had zero rows at the time, so this did not invalidate existing recovery links.
- Temporary local files used during the attempt were removed.

## Redeploy Result

Preview(`staging`) redeploy completed successfully.

Staging health after redeploy:

| Field | Result |
| --- | --- |
| environment | `preview` |
| gitBranch | `staging` |
| gitCommit | `a3d64a14683f` |
| routeBundleVersion | `payment-foundation-2026-05-29` |
| deployment provider | `vercel` |
| staging alias | `https://staging.anyu.tw` |

Latest inspected Preview deployment:

- target: `preview`
- status: Ready
- alias includes `https://staging.anyu.tw`

## No-Card QA Result

Command:

```bash
cd apps/web && corepack pnpm run qa:result-checkout:no-card
```

Result: pass.

Sanitized outcomes:

- target preflight: pass
- secret preflight: pass
- staging health: pass
- source analyze: pass
- result page checkout CTA: pass
- checkout-start page: pass
- recovery soft gate signals: pass
- operator fake-paid success: pass
- queue trigger: `vercel_queue`
- paid status: completed
- paid access render: pass
- production disabled check: pass

No provider payment was submitted.

## Recovery-Link Smoke Result

Valid-link smoke:

- Status: blocked / not completed.
- Reason: there is currently no safe operator route or script that can create a matching `paid_result_recovery_links` row on staging using the runtime secret without exposing either staging DB credentials, raw `prl_` tokens, token hashes, or adding new runtime code.
- A local attempt to use pulled Preview env was blocked because pulled sensitive env values were not usable for local DB/runtime hashing.
- No valid recovery link row was left behind.

Invalid-token safety smoke:

| Check | Result |
| --- | --- |
| HTTP status | 200 |
| safe failure copy shown | true |
| support email shown | true |
| raw token printed | false |

Post-smoke staging recovery link row count:

- `0`

## Production Safety

| Check | Result |
| --- | --- |
| Production payment runtime changed | false |
| Production env modified | false |
| Production DB migration applied | false |
| Production `paid_result_recovery_links` table exists | false |
| Production checkout route | JSON `not_found` |
| Production fake-paid route | JSON `not_found` |
| Production health environment | `production` |
| Production branch | `main` |
| Production route bundle | `payment-foundation-2026-05-29` |

## Validation

Runtime/ops validation:

- staging DB preflight: passed after catalog-only retry
- staging migration apply: passed
- staging schema verification: passed
- Preview(`staging`) env alignment: passed
- Preview(`staging`) redeploy: passed
- no-card QA: passed
- invalid recovery-link safety check: passed
- production safety checks: passed

Docs validation:

- pending at report creation; final results recorded in Codex completion summary

No app code changed in this task.

## Architecture Decisions

- Used direct Neon SQL transaction because the project has historically applied staging-only migrations manually against the Neon preview branch, and this migration did not require concurrent index creation.
- Kept `PAYMENT_RECOVERY_LINK_TOKEN_SECRET` branch-scoped to Preview(`staging`) only.
- Did not add a temporary runtime route just to complete the smoke, because the task scope was staging apply/smoke and not new operator tooling.

## Tech Debt Review

New technical debt introduced:

- Valid recovery-link smoke remains unproven until there is a safe operator-side link creation path.

Existing technical debt observed:

- Vercel pulled sensitive env values are not usable locally for this kind of smoke.
- There is no operator-safe recovery-link creation helper/route yet.
- Email/LINE sending remains deferred.

Opportunistic cleanup completed:

- Removed temporary local env/secret files used during staging setup.

Deferred cleanup candidates:

- Add a safe operator-only recovery-link smoke helper that creates an `operator_test` link without printing raw `prl_`, hashes, or IDs.
- Add Email sending only after recovery-link valid smoke is proven.
- Add LINE recovery CTA/smoke after link resolver is proven.

## Blockers / Uncertainties

- Valid `/r/[recoveryToken]` smoke is blocked by missing safe operator creation path.
- Future task must decide whether to add a script, an operator-only endpoint, or a server-side test harness for link creation.
- Production recovery link env and DB remain intentionally gated.

## Recommended Next Step

Recovery Link Operator Smoke Helper v0.

Suggested scope:

- Add a staging/operator-only helper that creates an `operator_test` recovery link for an existing paid entitlement/result.
- Output sanitized JSON only.
- Do not print raw `prl_`, hash, raw IDs, `pa_`, or `pcs_`.
- Use it to complete valid `/r/[recoveryToken]` staging smoke.
- Do not send Email or LINE.
