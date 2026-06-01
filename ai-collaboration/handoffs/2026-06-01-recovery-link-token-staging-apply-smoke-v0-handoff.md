# Recovery Link Token Staging Apply / Smoke v0 Handoff

Date: 2026-06-01
Owner task: Recovery Link Token Staging Apply / Smoke v0
Scope: Preview(staging) DB/env apply and sanitized smoke only. No production migration, production env changes, Email sending, LINE messages, membership, real production payments, or provider behavior changes.

## Objective

Apply and verify `apps/web/drizzle/0010_paid_result_recovery_links.sql` on the staging/preview DB only, configure stable branch-scoped Preview(staging) `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`, redeploy staging, and run a sanitized recovery-link smoke without printing raw `prl_`, `pa_`, `pcs_`, hashes, secrets, or private data.

## Constraints

- Do not enable production payment runtime.
- Do not change production flags or production env.
- Do not apply production DB migration.
- Do not run real production payments.
- Do not send Email or LINE messages.
- Do not implement membership/login.
- Do not expose raw `pa_`, `pcs_`, or `prl_` tokens.
- Do not print token hashes, env values, connection strings, secret lengths, prefixes, suffixes, or checksums.
- Do not change payment provider behavior.
- Do not implement Module 02.
- Do not commit secrets or private customer data.

## Planned Work

1. Verify staging DB target without printing credentials.
2. Preflight `paid_result_recovery_links` table/index/journal status on staging.
3. Apply migration SQL to staging only if target is confidently verified and table is absent.
4. Verify table, expected columns, indexes, and row count.
5. Configure `PAYMENT_RECOVERY_LINK_TOKEN_SECRET` for branch-scoped Preview(staging) only if missing.
6. Redeploy Preview(staging) at commit `a3d64a1` or newer.
7. Run sanitized recovery-link smoke with fake/operator-safe data only.
8. Confirm production remains untouched.
9. Create report, update summary log/dashboard, run docs validation, commit docs-only changes unless a fix is required.

## Validation Plan

If no code changes:

- docs presence check
- secret/private scan
- `git diff --check`
- dashboard HTML sanity if dashboard changed

If code changes unexpectedly:

- `cd apps/web && corepack pnpm lint`
- targeted recovery link / paid access tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`

## Notes

Raw smoke tokens may be used transiently in shell memory or HTTP calls, but must not be printed, committed, or copied into reports. If staging target cannot be confidently verified, stop before migration/env changes.
