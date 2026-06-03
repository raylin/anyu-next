# Support Ops Helper v0 Handoff

Date: 2026-06-03

## Task

Add a secret-safe local/operator support diagnostics helper for Module 01 paid result support cases.

## Scope

- Add local CLI command for read-only paid result lookup.
- Support safe lookup by result/payment/order/reference/contact/link identifiers where feasible.
- Summarize payment, entitlement, generation, paid result, recovery contact, access-link, and provider audit state.
- Return sanitized JSON/summary only.
- Add tests and documentation.

## Constraints

- No public admin UI or route.
- No Email/LINE sending.
- No production mutation.
- No production env changes or DB migration.
- Do not expose raw `pa_`, `pcs_`, `prl_`, token hashes, raw Email, raw LINE ID, encrypted recipient, raw user input, or provider payloads.
- Do not change payment provider behavior.
- Do not implement membership/login or Module 02.

## Validation Plan

- `cd apps/web && corepack pnpm lint`
- Targeted support ops/helper tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- Support helper dry run with missing/fake env if appropriate
- `cd apps/web && corepack pnpm run qa:recovery-link:smoke`
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`

## Expected Output

- Local `ops:paid-result:lookup` command.
- Server/local helper tests.
- Execution report, summary log update, dashboard update if support readiness changes.
- Commit and push to `origin/staging` if validation passes.
