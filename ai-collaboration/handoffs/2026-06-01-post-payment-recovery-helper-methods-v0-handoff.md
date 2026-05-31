# Post-Payment Recovery Helper Methods v0 Handoff

Date: 2026-06-01

## Task

Add server-only helper methods to summarize and manage post-payment recovery status for paid-ready and completed-result pages.

## Scope

- Recovery helper/service layer and tests only.
- No user-facing UI.
- No Email sending, LINE push, membership, env changes, production DB migration, real payments, payment provider behavior changes, or Module 02 work.

## Guardrails

- Do not expose raw Email, LINE identifiers, encrypted values, hashes, raw `pa_`, or raw `pcs_`.
- Keep transactional recovery consent separate from marketing opt-in.
- Keep production payment runtime disabled.
- Do not fail payment delivery if recovery binding cannot complete.

## Validation

- `cd apps/web && corepack pnpm lint`
- targeted recovery helper tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
