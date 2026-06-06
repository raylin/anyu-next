# Env Mirror Strategy v2 Apply / Clean Reset v0 Handoff

Date: 2026-06-06

## Task

Apply owner-approved Strategy B clean reset for staging and production env mirrors/runtime test data.

## Scope

- Clear approved runtime/test data in staging and production.
- Regenerate app-owned internal/stateful secrets after reset.
- Reorganize ignored env mirrors with active keys and true owner-fill blanks only.
- Sync generated/config values to Vercel Preview(staging) and Production.
- Redeploy fail-closed where needed.
- Rerun Module 01 validation gates.

## Constraints

- Do not enable production payment runtime or checkout.
- Do not run production payment.
- Do not send production Email or LINE.
- Do not drop schema or rewrite migrations.
- Do not print env values, connection strings, token values, or value-derived metadata.
- Do not commit `.env.staging`, `.env.production`, or secrets.
- Preserve Theme Architecture archive; no theme UI implementation.

## Planned Sequence

1. Verify production freeze/fail-closed.
2. Snapshot aggregate row counts only.
3. Clear approved staging and production runtime/test tables.
4. Generate app-owned secrets in local mirrors first.
5. Fill plain config/flags by policy.
6. Sync generated/config keys to Vercel without values.
7. Redeploy Preview(staging) and Production fail-closed.
8. Run Module 01 gates.
9. Document report, summary, dashboard, commit, and push.
