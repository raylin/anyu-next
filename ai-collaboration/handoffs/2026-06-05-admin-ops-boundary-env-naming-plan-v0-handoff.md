# Admin Ops Boundary + Env Naming Plan v0 Handoff

## Date

2026-06-05

## Task

Create a documentation-only plan for the Admin Ops boundary and env naming model before implementation.

## Context

Module 01 staging user journeys are user-verified for desktop Email-only mandatory save and mobile LINE-first access-link delivery. Production remains frozen/fail-closed. Recent support lookup work proved that `apps/web/.env.local` points to the Neon `dev/local` branch, while Host Preview(staging) uses a separate clean access-link DB. Owner wants to abandon direct local DB support lookup as the main ops path and define Admin API as the operational boundary.

## Scope

Planning and documentation only.

## Required Output

- Report: `ai-collaboration/reports/2026-06-05-admin-ops-boundary-env-naming-plan-v0.md`
- Summary log update: `ai-collaboration/summaries/summary_log.md`
- Dashboard update: `ai-collaboration/dashboard/anyu-project-dashboard.html`

## Constraints

- Do not implement Admin API.
- Do not implement CLI.
- Do not rename env files.
- Do not modify Vercel env.
- Do not modify local env files.
- Do not enable production runtime or checkout.
- Do not run payments.
- Do not send Email or LINE messages.
- Do not apply DB migrations.
- Do not implement Module 02.
- Do not commit secrets/private values.

## Planned Work

1. Document the local/server/host env model.
2. Define Admin API as the single ops boundary.
3. Define read-only Admin API v0 paid result lookup scope.
4. Define `tools/admin-cli` package boundary and `pnpm ops lookup-result` usage.
5. Declare direct DB support lookup deprecated as target architecture.
6. Plan env mirror file rename without implementing it.
7. Recommend implementation task sequence.
8. Update report, summary, dashboard, validate docs, commit, and push.

## Validation

- Docs presence check.
- Dashboard HTML sanity if changed.
- Secret/private scan.
- `git diff --check`.

## Git Commit And Staging Push Rule

Commit completed documentation changes and push to `origin/staging` if validation passes.
