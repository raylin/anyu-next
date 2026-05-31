# Paid Result Recovery Identity Schema v0 Handoff

Date: 2026-05-31
Task: Paid Result Recovery Identity Schema v0

## Goal

Add foundational paid result recovery identity schema, migration, crypto/service helpers, and tests without implementing checkout-start UI, LINE push, Email sending, membership, or payment behavior changes.

## Scope

DB schema/migration + server-side helper layer + tests + documentation. Migration file only; do not apply staging or production DB migration in this task.

## Safety Constraints

- Do not enable production payment runtime or modify env.
- Do not implement LINE push, Email sending, membership/login, checkout-start recovery UI, or Module 02.
- Do not expose or store raw `pa_` / `pcs_` tokens.
- Do not log or commit secrets, raw email/LINE customer values, provider payloads, raw input, or private data.
- Email encryption must fail closed if the configured key is missing/invalid.
