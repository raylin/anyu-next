# LINE Recovery Recipient Secret Schema v0 Handoff

Date: 2026-06-03

## Task

Add foundational schema and server-side helpers for encrypted LINE recipient secret storage so future LINE recovery link sending can resolve a sendable recipient without weakening hash-only `payment_recovery_contacts`.

## Scope

- DB schema/migration file.
- Server-only crypto/helper layer.
- Tests and documentation.
- No LINE messages, UI, production env, production migration, payment behavior, or membership changes.

## Constraints

- Do not store raw LINE userId in `payment_recovery_contacts`.
- Do not expose raw LINE userId, recipient hashes, secrets, or raw `pa_`, `pcs_`, `prl_`.
- Use separate `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`.
- Add migration only; do not apply staging/production DB in this task.

## Work Plan

1. Inspect schema/migration conventions and existing recovery crypto helpers.
2. Add `payment_recovery_contact_secrets` schema and migration.
3. Add LINE recipient encryption/hash helper and DB service helpers.
4. Add tests for encryption, fail-closed key behavior, revoke/failed/lookup behavior, and raw value safety.
5. Run lint, targeted tests, full tests, build, drizzle check, and feasible QA scripts.
6. Update report, summary log, and dashboard.
7. Commit and push to `origin/staging`.
