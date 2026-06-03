# LINE Recovery Recipient Secret Design v0 Handoff

Date: 2026-06-03

## Task

Design a secure recipient storage model that enables LINE Messaging API push for recovery links without compromising the hash-only `payment_recovery_contacts` design.

## Scope

- Planning/documentation only.
- No schema, migration, runtime, env, LINE push, Email sending, payment, or membership changes.

## Constraints

- Do not store raw LINE userId in `payment_recovery_contacts`.
- Do not expose raw LINE userId, LINE hashes, or raw `pa_`, `pcs_`, or `prl_` tokens.
- Do not send LINE messages.
- Do not modify env or apply DB migrations.
- Production payment runtime remains disabled.

## Work Plan

1. Write a design report covering current architecture, recipient identity requirement, design options, recommended model, proposed schema shape, encryption strategy, bind/send flow changes, revocation, tests, staging/production gates, and membership relationship.
2. Update `summary_log.md`.
3. Update dashboard roadmap status if needed.
4. Run documentation validation and safety checks.
5. Commit and push to `origin/staging`.
