# Env Mirror Strategy v2 Implementation Plan v0 Handoff

Date: 2026-06-06

## Task

Create a concrete implementation plan for Env Mirror Strategy v2 using owner-selected clean reset strategy B.

## Scope

Planning, read-only inventory, documentation, dashboard, and summary updates.

## Constraints

- Do not modify `apps/web/.env.staging` or `apps/web/.env.production`.
- Do not modify Vercel env values.
- Do not generate or rotate secrets.
- Do not clear DB data or apply migrations.
- Do not enable production runtime or checkout.
- Do not run payment, Email, or LINE.
- Do not print env values or secret-derived metadata.
- Do not commit env files or private data.

## Planned Work

1. Confirm clean reset assumptions.
2. Inspect schema/table names and aggregate counts only for staging and production.
3. Define reset table scope and dependency order.
4. Define owner-fill keys, Codex-fill plain config/flags, Codex-generated keys after reset, and prune/deprecate keys.
5. Define apply sequence, safety/rollback notes, and validation gates.
6. Create report and update summary/dashboard.

## Expected Output

- `ai-collaboration/reports/2026-06-06-env-mirror-strategy-v2-implementation-plan-v0.md`
- summary log update
- dashboard update
- no env/DB/runtime/Vercel changes
