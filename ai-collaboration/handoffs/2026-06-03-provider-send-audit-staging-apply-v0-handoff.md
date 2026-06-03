# Provider Send Audit Staging Apply v0 Handoff

Date: 2026-06-03

## Task

Apply and verify the provider send audit migration on Preview(staging) only, then run staging-safe regression smoke.

## Scope

- Verify the DB target is Preview(staging) before applying SQL.
- Preflight `paid_result_recovery_links` and audit-column status.
- Apply `apps/web/drizzle/0012_paid_result_recovery_link_send_audit.sql` to Preview(staging) only.
- Verify audit columns exist and existing rows remain readable.
- Run staging-safe regression QA.
- Document results.

## Constraints

- Do not apply production DB migration.
- Do not modify production env/runtime.
- Do not send production Email or LINE messages.
- Do not print connection strings, credentials, raw tokens, token hashes, raw Email, raw LINE IDs, or provider payloads.
- Do not implement public resend UI or Module 02.

## Validation Plan

- `cd apps/web && corepack pnpm run qa:recovery-link:smoke`
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`
- Docs presence check
- Dashboard HTML sanity if dashboard changed
- Secret/private scan
- `git diff --check`

## Expected Output

- Execution report under `ai-collaboration/reports/`.
- Summary log update.
- Dashboard update if provider audit status changes.
- Commit and push to `origin/staging` if validation passes.
