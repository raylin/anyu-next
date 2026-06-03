# Access Link Resend Helper v0 Handoff

Date: 2026-06-03

## Task

Implement service/helper-level access-link resend policy support for Module 01 paid result access links.

## Scope

- Add active access-link lookup semantics for automatic send dedupe.
- Treat sent and used links as active until expiry or revocation.
- Add deterministic ordering for recent link lookup.
- Add a server-only support/operator resend helper that can create a fresh support-channel access link after verification.
- Update tests and documentation.

## Constraints

- Do not add public resend UI or public resend route.
- Do not send Email or LINE from a new public path.
- Do not expose raw `prl_` tokens, token hashes, `pa_`, `pcs_`, raw Email, or raw LINE identifiers in logs/reports.
- Do not modify production env/runtime/DB.
- Do not change payment provider behavior.
- Do not implement Module 02.

## Validation Plan

- `cd apps/web && corepack pnpm lint`
- Targeted access-link resend/recovery tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm run qa:recovery-link:smoke`
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`

## Expected Output

- Server-side helper/service changes.
- Test coverage for active link semantics, dedupe, ordering, and support resend helper.
- Execution report and summary log update.
- Commit and push to `origin/staging` if validation passes.
