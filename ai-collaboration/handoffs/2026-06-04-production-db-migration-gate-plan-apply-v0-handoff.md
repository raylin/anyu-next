# Production DB Migration Gate Plan / Apply v0 Handoff

Date: 2026-06-04  
Task owner: Codex  
Scope: Production DB migration gate only

## Context

Production Payment Config Dry-Run v0 passed. NewebPay production provider env names are configured in Vercel Production, but production checkout/runtime remain disabled:

- `ENABLE_NEWEBPAY_CHECKOUT=false`
- `ENABLE_PAYMENT_RUNTIME=false`

Production public pages are live and production checkout/operator routes are fail-closed.

Production DB has base payment tables but still needs the production migration gate for Module 01 paid result access-link delivery.

## Goal

Plan, preflight, apply, and verify the required production DB migrations while keeping production payment runtime disabled and without running payments or sending messages.

## Required Migration Gates

Confirm exact file names before applying:

- `0008_entitlements_payment_intent_unique.sql`
- `0009_payment_recovery_contacts.sql`
- `0010_paid_result_recovery_links.sql`
- `0011_payment_recovery_contact_secrets.sql`
- `0012_paid_result_recovery_link_send_audit.sql`

## Safety Rules

- Do not enable production checkout/runtime.
- Do not run production payments.
- Do not send production Email or LINE messages.
- Do not print DB credentials, env values, provider payloads, tokens, hashes, or private data.
- Apply only the required missing migrations.
- Stop if the production DB target cannot be confidently verified.
- Stop if duplicate entitlement payment-intent rows exist before adding the unique index.

## Execution Plan

1. Verify Production Neon target and confirm staging is not targeted.
2. Run read-only preflight checks:
   - entitlement duplicate non-null `payment_intent_id` groups
   - required table existence
   - audit column existence
   - aggregate row counts only
3. Apply missing migrations to Production DB only.
4. Keep `CREATE INDEX CONCURRENTLY` outside transactions.
5. Verify post-apply schema, indexes, constraints, audit columns, and aggregate readability.
6. Confirm production routes remain fail-closed and public pages remain live.
7. Inventory Production env names presence-only.
8. Create report, update summary log, update dashboard, commit, and push to `origin/staging`.

## Expected Output

- Execution report under `ai-collaboration/reports/`.
- Summary log entry.
- Dashboard status update.
- Commit and staging push if validation passes.

## Recommended Next Task

Production Access-Link / Provider Env Gate v0, then Controlled Production Payment Smoke v0 with credit-card one-time payment only.
