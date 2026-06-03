# LINE Recovery Bind Recipient Secret Staging Smoke v0 Handoff

Date: 2026-06-03

## Task

Run owner-assisted Preview(staging) LINE bind smoke after `debf545` and verify that LINE bind creates both:

- hash-only `payment_recovery_contacts` row
- encrypted `payment_recovery_contact_secrets` row

## Scope

Staging smoke and documentation only. Minimal fix only if a narrow staging/LIFF issue is found.

## Constraints

- Do not enable production payment runtime.
- Do not modify Production env.
- Do not apply Production DB migration.
- Do not send LINE messages.
- Do not send Email.
- Do not expose raw LINE userId, encrypted recipient, recipient hash, contact hash, `pa_`, `pcs_`, or `prl_`.
- Do not reuse legacy unlock/fulfillment semantics for recovery.
- Do not commit secrets or private customer data.

## Planned Checks

1. Confirm Preview(staging) freshness at `debf545` or newer.
2. Verify required env-name presence and staging schema readiness without printing values.
3. Run `qa:result-checkout:no-card`.
4. Run `qa:recovery-link:smoke`.
5. Coordinate owner-assisted LINE mobile bind smoke.
6. Verify sanitized DB state for both contact and recipient-secret rows.
7. Confirm production remains untouched/fail-closed.
8. Document results, update summary/dashboard, validate docs, commit, and push to `origin/staging`.

## Expected Result

LINE bind succeeds in LINE mobile context, stores hash-only contact plus encrypted recipient secret, and remains non-delivery: no LINE message is sent.
