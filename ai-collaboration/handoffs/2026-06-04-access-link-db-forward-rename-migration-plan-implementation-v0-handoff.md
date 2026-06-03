# Access Link DB Forward Rename Migration Plan / Implementation v0 Handoff

Date: 2026-06-04  
Task owner: Codex  
Scope: Forward DB/schema rename migration + code alignment; no DB apply

## Context

Access Link Code Alias + Script Rename v0 added access-link helper aliases and wrapper modules, introduced `pal_` for new paid result access-link tokens, and preserved legacy `prl_` compatibility.

Production and Preview(staging) DBs currently have recovery-named schema from migrations `0009`-`0012`:

- `payment_recovery_contacts`
- `paid_result_recovery_links`
- `payment_recovery_contact_secrets`

Production runtime remains disabled/fail-closed.

## Goal

Create a forward migration and update active schema/code references toward access-link terminology:

- `payment_access_link_contacts`
- `paid_result_access_links`
- `payment_access_link_contact_secrets`

Preserve recovery compatibility aliases and do not apply the migration in this task.

## Constraints

- Do not enable production runtime or checkout.
- Do not modify production env.
- Do not run real payments.
- Do not send Email or LINE messages.
- Do not rewrite historical migrations `0009`-`0012`.
- Do not remove `prl_` compatibility.
- Do not change `/r/`.
- Do not change `rlb_`.
- Do not apply staging or production DB migration in this task.

## Planned Work

1. Inventory active table/schema/helper/script references.
2. Add `0013_access_link_technical_rename.sql` forward migration.
3. Update Drizzle schema active objects to access-link names with recovery aliases.
4. Update helper code to prefer access-link schema objects where practical.
5. Preserve compatibility modules, old exports, old QA commands, and resolver behavior.
6. Update tests for schema names, migration, aliases, and token compatibility.
7. Run lint, targeted tests, full tests, build, drizzle check, access-link/recovery smoke, and no-card QA.
8. Create report, update summary log/dashboard, commit, and push.

## Expected Output

- Forward migration file added but not applied.
- Active code/schema references aligned toward access-link naming.
- Recovery aliases retained.
- Validation completed.
- Recommended next task: Access Link DB Rename Staging Apply / Smoke v0.
