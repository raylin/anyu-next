# LINE Recovery Recipient Secret Staging Apply v0 Handoff

Date: 2026-06-03

## Task

Apply and verify `payment_recovery_contact_secrets` on Preview(staging), configure Preview(staging)-only `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY` if missing, and keep Production untouched.

## Scope

- Preview(staging) DB migration apply and verification.
- Preview(staging)-only env alignment.
- Regression QA.
- Documentation.

## Constraints

- Do not apply Production DB migration.
- Do not modify Production env.
- Do not print connection strings, secrets, secret lengths, prefixes, suffixes, hashes, or checksums.
- Do not store or print raw LINE userId.
- Do not send LINE messages or Email.
- Do not change runtime/payment behavior.

## Work Plan

1. Verify DB target is Preview(staging) before SQL.
2. Preflight table/index/constraint state.
3. Apply `apps/web/drizzle/0011_payment_recovery_contact_secrets.sql` to Preview(staging) only.
4. Verify schema after apply.
5. Check branch-scoped Preview(staging) env presence for `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`; add only if missing.
6. Redeploy staging only if env changed.
7. Run `qa:result-checkout:no-card` and `qa:recovery-link:smoke`.
8. Document results, update summary/dashboard, commit, and push.
