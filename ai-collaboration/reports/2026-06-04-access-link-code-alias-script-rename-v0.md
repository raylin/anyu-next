# Access Link Code Alias + Script Rename v0

Date: 2026-06-04  
Scope: Code/helper/script/test naming alignment only  
Result: Implemented

## Completed Work

- Added access-link-facing helper aliases while preserving recovery-named compatibility exports.
- Added access-link wrapper modules that re-export the existing implementations.
- Introduced `pal_` for newly generated paid result access-link tokens.
- Preserved `prl_` token validation/resolution compatibility.
- Kept `/r/[token]` route behavior unchanged.
- Kept `rlb_` LINE bind-state prefix unchanged.
- Added package script aliases:
  - `qa:access-link:smoke`
  - `qa:line-access-link:smoke`
- Preserved existing package scripts:
  - `qa:recovery-link:smoke`
  - `qa:line-recovery:smoke`
- Added/updated tests for helper aliases, wrapper modules, `pal_` generation, `prl_` compatibility, and script aliases.

No DB tables, DB columns, migrations, production flags, env values, payment behavior, Email sending, or LINE sending were changed.

## Inventory Result

Active recovery-named implementation remains in these categories:

- DB/schema: `payment_recovery_contacts`, `paid_result_recovery_links`, `payment_recovery_contact_secrets`.
- Historical migrations: `0009`-`0012`.
- Compatibility modules: existing recovery-named DB, notification, token, LINE bind, and QA files.
- Routes/pages: recovery-named LINE/API/operator paths.
- Tests: recovery-named test files, now with access-link compatibility assertions.

Access-link aliases were added where low-risk:

- DB helper exports.
- notification/template/send helper exports.
- token helper exports.
- package script names.
- wrapper modules.

DB/schema names are intentionally deferred to the forward DB rename task.

## Helper Aliases Added

DB/link aliases:

- `createPaidResultAccessLink`
- `resolvePaidResultAccessLink`
- `getPaidResultAccessLinkByRawToken`
- `getRecentPaidResultAccessLinkForContact`
- `findActivePaidResultAccessLinkForContact` already existed and remains primary.
- `createSupportPaidResultAccessLink`
- `markPaidResultAccessLinkUsed`
- `markPaidResultAccessLinkSent`
- `markPaidResultAccessLinkFailed`
- `revokePaidResultAccessLink`
- `isPaidResultAccessLinkActive`
- `isPaidResultAccessLinkExpired`

Token aliases:

- `generatePaidResultAccessLinkToken`
- `isPaidResultAccessLinkToken`
- `hasPaidResultAccessLinkTokenPrefix`
- `getPaidResultAccessLinkTokenSecret`
- `hashPaidResultAccessLinkToken`
- `getDefaultPaidResultAccessLinkExpiresAt`

Email aliases:

- `buildPaidResultAccessLinkUrl`
- `buildPaidResultAccessLinkEmail`
- `sendEmailAccessLink`
- `createAndSendEmailAccessLink`
- `sendAccessLinksForCompletedPaidResult`

LINE aliases:

- `buildPaidResultAccessLinkLineMessage`
- `sendLineAccessLink`
- `createAndSendLineAccessLink`

Wrapper modules:

- `apps/web/src/lib/db/paid-result-access-links.ts`
- `apps/web/src/lib/notifications/email-access-link.ts`
- `apps/web/src/lib/notifications/line-access-link.ts`
- `apps/web/src/lib/payments/access-link-token.ts`

Recovery-named exports remain available for compatibility.

## Token Prefix Decision

Implemented:

- New generated paid result access-link tokens use `pal_`.
- Legacy `prl_` tokens remain valid and resolvable.
- `hashPaidResultRecoveryToken` now uses purpose-separated hashing:
  - `pal_` → `paid_result_access_link:v1`
  - `prl_` → `paid_result_recovery_link:v1`
- Existing DB `purpose` value remains `paid_result_recovery` until the DB rename migration.
- `/r/[token]` remains the stable public route.

Deferred:

- `rlb_` LINE bind-state prefix is unchanged.
- Env names remain recovery-named until a separate runtime/env alignment task.

## Script Alias Behavior

New preferred scripts:

- `cd apps/web && corepack pnpm run qa:access-link:smoke`
- `cd apps/web && corepack pnpm run qa:line-access-link:smoke`

Compatibility scripts retained:

- `cd apps/web && corepack pnpm run qa:recovery-link:smoke`
- `cd apps/web && corepack pnpm run qa:line-recovery:smoke`

Both access-link and recovery script names call the same underlying safe smoke scripts.

## Files Renamed Or Not

No existing files were renamed.

Reason:

- Avoid unnecessary import churn before the DB forward rename.
- Preserve test and route compatibility.
- Wrapper modules give future code access-link import paths immediately.

## Compatibility Status

Preserved:

- old helper exports
- old package scripts
- `prl_` token resolution
- `/r/` route
- `rlb_` bind-state prefix
- recovery-named DB schema
- recovery-named routes

Changed:

- new generated access-link tokens now use `pal_`
- new access-link helper/module/script aliases are available

## Validation

Validation run:

- `cd apps/web && corepack pnpm lint` passed.
- `cd apps/web && corepack pnpm exec vitest run src/tests/paid-result-recovery-links.test.ts src/tests/email-recovery-link.test.ts src/tests/line-recovery-link.test.ts src/tests/recovery-link-smoke-qa.test.ts` passed, 4 files / 54 tests.
- `cd apps/web && corepack pnpm test` passed, 79 files / 548 tests.
- `cd apps/web && corepack pnpm build` passed.
- `cd apps/web && corepack pnpm run qa:access-link:smoke` passed via existing Preview runtime operator path.
- `cd apps/web && corepack pnpm run qa:recovery-link:smoke` passed via legacy alias.
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card` passed.
- `git diff --check` passed.
- current-diff secret/private scan passed.

Smoke note:

- Preview(staging) still served pre-task commit `c91671109e5a` during smoke commands, so smoke validates deployed runtime compatibility and command behavior before this commit is pushed. Local tests/build validate the new code changes.

## Tech Debt Review

- New technical debt introduced: temporary dual naming exists by design while compatibility aliases are active.
- Existing technical debt observed: DB/schema/env/route names still use recovery terminology.
- Opportunistic cleanup completed: new access-link wrapper modules and package script aliases reduce future import churn.
- Deferred cleanup candidates:
  - DB forward rename migration.
  - route aliases for access-link paths.
  - env-name alignment after production access-link gate.
  - removal of deprecated recovery aliases after production smoke and migration stabilization.

## Recommended Next Task

Access Link DB Forward Rename Migration Plan / Implementation v0.

Recommended scope:

- add forward migration `0013_access_link_technical_rename.sql`
- rename DB tables/column/indexes/constraints/purpose values
- update Drizzle schema to access-link names
- keep deprecated helper aliases
- apply to Preview(staging) in a separate smoke/apply task before Production
