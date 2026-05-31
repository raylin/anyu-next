# Paid Result Recovery Identity Staging Apply v0 Handoff

Date: 2026-05-31

## Task

Apply and verify the `payment_recovery_contacts` migration on the staging database only.

## Scope

- Staging DB target verification.
- Staging schema preflight.
- Apply `apps/web/drizzle/0009_payment_recovery_contacts.sql` to staging only if target is confidently verified and safe.
- Verify table, columns, constraints, and indexes.
- Document production untouched status.

## Guardrails

- Do not apply production DB migration.
- Do not enable production payment runtime.
- Do not modify production env.
- Do not run real payments.
- Do not implement recovery UI, LINE push, Email sending, or membership.
- Do not print DB credentials, real Email, LINE identifiers, `pa_`, or `pcs_` tokens.

## Planned Validation

- Docs presence check.
- Secret/private scan on changed docs.
- `git diff --check`.
- If app code changes unexpectedly, run app lint/test/build.

