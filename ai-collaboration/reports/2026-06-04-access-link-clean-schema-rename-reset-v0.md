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

Applied.

Preview(staging):

- target verified as Neon Preview(staging) branch before apply
- destructive reset/rename migration applied after owner confirmation
- final table names verified:
  - `payment_access_link_contacts`
  - `paid_result_access_links`
  - `payment_access_link_contact_secrets`
- old recovery-named tables/views verified absent:
  - `payment_recovery_contacts`
  - `paid_result_recovery_links`
  - `payment_recovery_contact_secrets`
- final row state after smoke:
  - access-link contacts: 0
  - access links: 1 operator-smoke row
  - access-link contact secrets: 0

Production:

- target verified as Neon Production branch before apply
- preflight row counts were all zero
- destructive reset/rename migration applied after owner confirmation
- final table names verified:
  - `payment_access_link_contacts`
  - `paid_result_access_links`
  - `payment_access_link_contact_secrets`
- old recovery-named tables/views verified absent
- final row counts remain zero across the three access-link tables
- production runtime stayed disabled; no payment, Email, or LINE message was sent

The migration file was corrected during staging apply to:

- only drop old recovery names when they are views/materialized views, not tables
- truncate whichever recovery/access-link tables exist with `CASCADE` so FK order cannot block the reset

## Validation

Passed before DB apply:

- `cd apps/web && corepack pnpm exec vitest run src/tests/paid-result-recovery-links.test.ts src/tests/payment-recovery-contacts.test.ts src/tests/payment-recovery-contact-secrets.test.ts src/tests/recovery-link-smoke-qa.test.ts src/tests/support-paid-result-lookup.test.ts src/tests/email-recovery-link.test.ts src/tests/line-recovery-link.test.ts src/tests/paid-result-recovery-link-page.test.tsx`
- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm exec drizzle-kit check`

Passed after Preview(staging) apply:

- `cd apps/web && corepack pnpm run qa:access-link:smoke`
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`

Safely blocked after reset:

- `cd apps/web && corepack pnpm run qa:line-access-link:smoke`
  - blocked with `recipient_secret_missing`
  - expected after destructive reset because the prior owner/test LINE recipient secret was deleted
  - no LINE message was sent

Production safety verified after Production apply:

- production health reports `environment=production`
- production fake-paid operator POST returns `not_found`
- production checkout path returns 404
- public `/`, `/refund`, and `/legal` return 200
- no production payment runtime was enabled

## Blockers

- None for clean schema reset.
- LINE real-message smoke requires a fresh owner-assisted LINE bind to recreate an encrypted recipient secret after the intentional reset.

## Uncertainties

- Env-name alignment is deferred. Existing production/staging configured env names still use recovery terminology.
- `rlb_` LINE bind state prefix remains intentionally unchanged for now.

## Tech Debt Review

- New technical debt introduced: recovery-named file/module names remain as compatibility wrappers.
- Existing technical debt observed: env names still use recovery terminology.
- Opportunistic cleanup completed: active DB schema and SQL helpers now use access-link table names.
- Deferred cleanup candidates: env-name migration, file/module rename, `rlb_` access-link bind prefix decision.

## Suggested Next Steps

- Run a fresh owner-assisted LINE bind if another LINE real-message access-link smoke is required after reset.
- Proceed to Production Access-Link / Provider Env Gate v0 while production runtime remains disabled.
- Later, plan env-name and file/module cleanup once the production controlled smoke path is stable.
