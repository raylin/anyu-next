# Entitlement Payment Intent Unique Index Migration v0 Handoff

## Date

2026-05-31

## Task

Implement staging-first DB-level uniqueness for `entitlements.payment_intent_id` with runtime conflict handling and tests.

## Context

The planning task recommended:

- One entitlement lifecycle per non-null `payment_intent_id`.
- Partial unique index on `entitlements(payment_intent_id)` where `payment_intent_id IS NOT NULL`.
- No historical row rewrite.
- Conflict handling that re-fetches the existing entitlement after a unique conflict.

Production payment runtime remains disabled.

## Constraints

- Do not enable payment runtime.
- Do not change production flags, Vercel env, or deploy production.
- Do not run real payments.
- Do not rewrite or delete historical DB rows.
- Do not query production unless explicitly approved.
- Do not commit secrets, raw tokens, provider payloads, raw user input, private billing, or proof documents.
- If staging migration cannot be applied safely from this environment, create the migration and document manual apply steps instead of pretending it was applied.

## Planned Work

1. Inspect migration framework and current schema.
2. Add migration for partial unique index.
3. Update Drizzle schema definition.
4. Add runtime conflict handling in entitlement creation/delivery path.
5. Add/update tests for uniqueness conflict and idempotency.
6. Determine whether staging preflight/migration can be run safely.
7. Run validation, report, commit, and push.

## Git Note

Local `origin/staging` is stale due the known `.git` metadata permission issue. Remote push must be verified with `git ls-remote`.
