# LINE Recovery Bind State Helpers v0 Handoff

Date: 2026-06-01
Owner task: LINE Recovery Bind State Helpers v0
Scope: server-side helper/state design implementation + tests only

## Objective

Add recovery-specific LINE bind state helper(s) and tests so a future LIFF recovery route can bind a verified LINE identity to `payment_recovery_contacts` without carrying raw paid access/session tokens, unlock tokens, short codes, source text, report content, or raw LINE identifiers.

## Constraints

- Do not enable production payment runtime.
- Do not change production flags.
- Do not modify production env.
- Do not apply production DB migration.
- Do not run real payments.
- Do not send LINE push or Email.
- Do not implement membership/login.
- Do not implement full LIFF route/UI.
- Do not expose raw `pa_`, `pcs_`, unlock tokens, short codes, tokenized URLs, raw LINE user IDs, provider payloads, source text, report content, or private customer data.
- Do not change payment provider behavior.
- Do not implement Module 02.

## Planned Work

1. Inspect existing LINE/LIFF state, signing/token, and recovery contact helpers.
2. Add a server-only helper for signed short-lived LINE recovery bind state if it fits project conventions.
3. Add helper behavior for verified LINE identity -> hash-only recovery contact mapping, reusing existing recovery contact service where appropriate.
4. Add targeted tests for token exclusion, expiry, tamper failure, safe round-trip, hash behavior, bind mapping, and Email helper regression.
5. Create report, update summary log, and update dashboard if status changes.
6. Run required validation: lint, targeted tests, full tests, build.

## Validation Plan

- `cd apps/web && corepack pnpm lint`
- targeted LINE/recovery tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`

## Notes

This task should create route-ready primitives only. Full route/UI/staging LINE QA remains a separate task.
