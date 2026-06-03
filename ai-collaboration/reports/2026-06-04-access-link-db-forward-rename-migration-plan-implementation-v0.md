# Access Link DB Forward Rename Migration Plan / Implementation v0

Date: 2026-06-04

## Completed Work

- Saved the required handoff before implementation.
- Inventoried active recovery-named schema/helper/script references.
- Added forward migration `apps/web/drizzle/0013_access_link_technical_rename.sql`.
- Added active Drizzle schema aliases:
  - `paymentAccessLinkContacts`
  - `paidResultAccessLinks`
  - `paymentAccessLinkContactSecrets`
- Updated core DB helper modules to depend on access-link schema aliases while keeping recovery-named exports as compatibility aliases.
- Preserved `/r/` route behavior, `prl_` compatibility, `pal_` generation, and `rlb_` LINE bind-state prefix.
- Added tests for the forward migration seam and schema aliases.

## Migration Strategy

The migration is forward-only and does not rewrite historical migrations `0009`-`0012`.

Target table renames:

- `payment_recovery_contacts` -> `payment_access_link_contacts`
- `paid_result_recovery_links` -> `paid_result_access_links`
- `payment_recovery_contact_secrets` -> `payment_access_link_contact_secrets`

The migration uses `ALTER TABLE ... RENAME` rather than copy/drop, preserving existing rows and FKs. It also renames key indexes and constraint names where safe.

Compatibility views are created under the old recovery-named table names so currently deployed code and raw SQL QA/support scripts can continue to read/write while the next task switches runtime schema definitions to the new table names.

## Compatibility Kept

- Historical migrations remain unchanged.
- Recovery-named helper exports remain available.
- `qa:recovery-link:smoke` remains available.
- `qa:access-link:smoke` remains the preferred access-link command.
- `/r/[token]` remains stable.
- `pal_` and legacy `prl_` tokens remain accepted by the resolver.
- LINE bind state keeps the existing `rlb_` prefix.

## Purpose Value Compatibility

Paid result links now write `paid_result_access_link` and read both:

- `paid_result_access_link`
- `paid_result_recovery`

LINE recipient secrets still write `recovery_link_delivery` because the currently applied DB check constraint allows that value. The helper can read both `recovery_link_delivery` and `access_link_delivery`; a later runtime/schema switch can decide whether to widen or migrate the check constraint.

## DB Apply Status

The migration was added only. It was not applied to staging or production in this task.

Recommended apply path:

1. Run preflight row/table checks on Preview(staging).
2. Apply `0013_access_link_technical_rename.sql` to Preview(staging).
3. Verify renamed tables and compatibility views.
4. Run `qa:access-link:smoke`, `qa:recovery-link:smoke`, and `qa:result-checkout:no-card`.
5. Only after staging passes, plan a separate production apply while runtime remains disabled/fail-closed.

## Architecture Decisions

- Use compatibility views to avoid requiring DB migration and code schema switch in the same deployment.
- Keep raw SQL QA/support scripts on recovery-named view-compatible table names for this phase.
- Avoid column renames in this migration to reduce view/write compatibility risk.
- Avoid broad file/module renames in this task; access-link wrapper modules already exist from the prior task.

## Validation

- Passed:
  - `cd apps/web && corepack pnpm lint`
  - `corepack pnpm exec vitest run src/tests/paid-result-recovery-links.test.ts src/tests/payment-recovery-contacts.test.ts src/tests/payment-recovery-contact-secrets.test.ts`
  - `corepack pnpm exec vitest run src/tests/paid-result-recovery-links.test.ts src/tests/payment-recovery-contacts.test.ts src/tests/payment-recovery-contact-secrets.test.ts src/tests/email-recovery-link.test.ts src/tests/line-recovery-link.test.ts src/tests/recovery-link-smoke-qa.test.ts src/tests/support-paid-result-lookup.test.ts`
  - `cd apps/web && corepack pnpm test`
  - `cd apps/web && corepack pnpm build`
  - `cd apps/web && corepack pnpm exec drizzle-kit check`
  - `cd apps/web && corepack pnpm run qa:access-link:smoke`
  - docs presence check
  - dashboard HTML sanity check
  - `git diff --check`

- Staging QA caveat:
  - `cd apps/web && corepack pnpm run qa:recovery-link:smoke` was retried twice and failed after staging health with generic `fetch failed`.
  - `cd apps/web && corepack pnpm run qa:result-checkout:no-card` also failed later in the staging polling path with generic `fetch failed`.
  - The preferred `qa:access-link:smoke` passed the same runtime operator access-link path, including resolver, invalid-link safety, revoked cleanup, and production fail-closed checks.
  - No code change was made for the transient staging fetch failures.

## Blockers

- None for code/migration addition.

## Uncertainties

- Whether to migrate recipient-secret `purpose` values from `recovery_link_delivery` to `access_link_delivery` should be decided with the staging DB apply/runtime-schema switch task.

## Tech Debt Review

- New technical debt introduced: compatibility views add a transition layer that must be removed or documented after runtime code switches to access-link table names.
- Existing technical debt observed: raw SQL QA/support scripts still use recovery-named table identifiers, intentionally compatible through views for now.
- Opportunistic cleanup completed: core helper modules now prefer access-link schema aliases.
- Deferred cleanup candidates: switch Drizzle `pgTable` names to access-link tables after staging migration apply; optionally widen/migrate LINE recipient-secret purpose checks.

## Suggested Next Steps

1. Access Link DB Rename Staging Apply / Smoke v0.
2. Access Link Runtime Schema Switch v0, if staging rename and compatibility views verify cleanly.
3. Production Access-Link DB Rename Apply v0 after staging passes and production runtime remains disabled.
