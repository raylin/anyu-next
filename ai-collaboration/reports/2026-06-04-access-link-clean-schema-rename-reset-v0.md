# Access Link Clean Schema Rename / Reset v0

Date: 2026-06-04

## Completed Work

- Saved the required handoff before implementation.
- Replaced the compatibility-first `0013_access_link_technical_rename.sql` with a clean reset/rename migration.
- Updated active Drizzle schema table names to:
  - `payment_access_link_contacts`
  - `paid_result_access_links`
  - `payment_access_link_contact_secrets`
- Kept deprecated recovery-named exports as code-level aliases only, not DB compatibility views.
- Updated runtime helpers, support lookup SQL, local access-link smoke SQL, token helpers, tests, and preflight script naming to prefer access-link terminology.
- Removed active `prl_` token acceptance. New/valid access-link tokens use `pal_`.
- Removed old package script aliases:
  - `qa:recovery-link:smoke`
  - `qa:line-recovery:smoke`
- Kept `/r/[token]` stable.
- Left `rlb_` LINE bind state unchanged for now.

## Owner Premise

- There are no real users.
- Current production/staging recovery/access-link rows are owner/operator/test data only.
- Old `/r/` links, `prl_` tokens, recovery-named rows, and historical test artifacts do not need to remain usable.
- Clean technical alignment is preferred over compatibility.

## Migration Strategy

The clean `0013` migration:

- drops any old recovery-named compatibility views if present
- truncates existing recovery/access-link test rows
- renames recovery-named tables to access-link names
- renames important indexes and constraints
- updates the LINE recipient-secret purpose check to allow only `access_link_delivery`
- does not create long-term recovery-named compatibility views

Final intended DB table names:

- `payment_access_link_contacts`
- `paid_result_access_links`
- `payment_access_link_contact_secrets`

## Compatibility Decisions

- `/r/[token]`: kept stable.
- `pal_`: primary and only accepted access-link token prefix.
- `prl_`: no longer accepted by `/r/`; still redacted as sensitive-looking output if encountered.
- `rlb_`: kept temporarily for LINE bind state because changing it is broader than DB/access-link reset.
- Recovery script aliases: removed from package scripts.
- Recovery helper exports: retained as deprecated code-level aliases only to avoid unnecessary broad module churn.
- Recovery env names: deferred. Current configured env names remain to avoid breaking staging/production secret alignment.

## Row Count Preflight

Aggregate-only preflight was run before destructive DB apply:

- Preview(staging):
  - `payment_recovery_contacts`: 5
  - `paid_result_recovery_links`: 36
  - `payment_recovery_contact_secrets`: 1
  - classification: owner/operator/test rows only
- Production:
  - `payment_recovery_contacts`: 0
  - `paid_result_recovery_links`: 0
  - `payment_recovery_contact_secrets`: 0

No private row values were printed.

## DB Apply Status

Pending at initial code push. This report will be updated after staging/production DB apply and smoke verification.

## Validation

Passed before DB apply:

- `cd apps/web && corepack pnpm exec vitest run src/tests/paid-result-recovery-links.test.ts src/tests/payment-recovery-contacts.test.ts src/tests/payment-recovery-contact-secrets.test.ts src/tests/recovery-link-smoke-qa.test.ts src/tests/support-paid-result-lookup.test.ts src/tests/email-recovery-link.test.ts src/tests/line-recovery-link.test.ts src/tests/paid-result-recovery-link-page.test.tsx`
- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm exec drizzle-kit check`

## Blockers

- None for code/migration preparation.

## Uncertainties

- Staging deployment and DB migration must be coordinated because there are intentionally no compatibility views.

## Tech Debt Review

- New technical debt introduced: recovery-named file/module names remain as compatibility wrappers.
- Existing technical debt observed: env names still use recovery terminology.
- Opportunistic cleanup completed: active DB schema and SQL helpers now use access-link table names.
- Deferred cleanup candidates: env-name migration, file/module rename, `rlb_` access-link bind prefix decision.

## Suggested Next Steps

- Apply clean DB rename/reset to Preview(staging), verify, then apply to Production while runtime remains disabled.
- After clean DB apply passes, run Production Access-Link / Provider Env Gate v0 or controlled production smoke planning.
