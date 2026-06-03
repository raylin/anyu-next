# Access Link Clean Schema Rename / Reset v0 Handoff

Date: 2026-06-04

## Task

Cleanly align DB/schema/code naming from recovery terminology to access-link terminology, allowing destructive reset of access-link/recovery test data where safe, while keeping production runtime disabled/fail-closed.

## Context

- Owner clarified there are no real users and current staging/production access-link/recovery rows are owner/operator/test data only.
- Old `/r/` links, `prl_` tokens, recovery-named rows, and historical test artifacts do not need to remain usable.
- Previous compatibility-first migration `0013_access_link_technical_rename.sql` was added but not applied.
- Clean technical alignment is preferred over long-term compatibility views.
- Production payment runtime remains disabled/fail-closed.

## Plan

1. Re-evaluate and replace `0013_access_link_technical_rename.sql` if safe.
2. Audit active recovery-named schema/helper/script/test references.
3. Update active schema/runtime/scripts/tests to access-link table names directly.
4. Decide and implement clean token/script/env compatibility policy within task constraints.
5. Run validation: lint, targeted tests, full tests, build, drizzle check, access-link/no-card/LINE smoke if feasible.
6. If DB apply is performed, verify staging/production DB targets before SQL, run aggregate preflight row counts only, and keep production runtime disabled.
7. Create report, update summary log/dashboard, commit, and push to `origin/staging`.

## Safety Boundaries

- Do not enable production runtime or checkout.
- Do not run real payments.
- Do not send production Email or LINE messages.
- Do not print private row values, tokens, hashes, connection strings, or secrets.
- Do not commit secrets/private values.
- Keep `/r/[token]` stable.

## Initial Decision

Prefer replacing the unapplied `0013` migration with a clean rename/reset migration instead of adding compatibility views.
