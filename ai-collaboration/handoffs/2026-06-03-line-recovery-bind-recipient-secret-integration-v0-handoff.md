# LINE Recovery Bind Recipient Secret Integration v0 Handoff

Date: 2026-06-03

## Task

Update LINE recovery bind so verified LINE identity creates both a hash-only `payment_recovery_contacts` row and an encrypted sendable recipient secret in `payment_recovery_contact_secrets`.

## Scope

- LINE recovery bind route/helper integration.
- Tests and documentation.
- Staging smoke/regression where feasible.
- No LINE message sending, Production env/DB/runtime changes, payment behavior changes, or membership.

## Constraints

- Do not expose raw LINE userId, encrypted recipient, recipient hash, or tokenized URLs.
- Do not send LINE messages.
- Do not apply Production migration.
- Preserve hash-only `payment_recovery_contacts`.
- Recipient secret write failure must be safe and non-payment-fatal.

## Work Plan

1. Inspect current bind route/helper and tests.
2. Add recipient secret write after hash-only contact creation.
3. Return safe failure if recipient secret write fails.
4. Add tests for success, missing key/failure, idempotent helper call, and no private output.
5. Run lint, targeted tests, full tests, build, and staging regression QA.
6. Document result and push to `origin/staging`.
