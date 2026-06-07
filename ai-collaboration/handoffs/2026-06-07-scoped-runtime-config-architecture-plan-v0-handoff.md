# Scoped Runtime Config Architecture Plan v0 Handoff

## Task

Create the architecture plan for a lightweight scoped runtime config system that replaces frequent Vercel env runtime toggling with Admin API + `pnpm ops` managed DB-backed runtime values.

## Shared Policy References

Follow:

- `AGENTS.md`
- `ai-collaboration/process/codex-operating-policy.md`
- `ai-collaboration/process/qa-validation-policy.md`
- `ai-collaboration/process/env-mirror-policy.md`
- `ai-collaboration/process/admin-ops-boundary.md`
- `ai-collaboration/process/production-gate-policy.md`
- `ai-collaboration/process/handoff-template.md`
- `ai-collaboration/process/report-template.md`

## Scope

- Planning/documentation only.
- Define registry, DB schema, resolver semantics, Admin API, CLI grammar/help, tests, docs, migration path, risks, and next implementation task.

## Do Not

- Do not create DB migrations.
- Do not modify runtime/Admin API/CLI implementation.
- Do not modify Vercel env.
- Do not enable production runtime.
- Do not run production payment.
- Do not send Email or LINE.
- Do not mutate DB.
- Do not implement theme UI or Module 02.
- Do not commit secrets/private data.

## Validation Selection

Run:

- docs presence check
- dashboard HTML sanity
- secret/private scan
- `git diff --check`

Skip:

- app tests/build/gates because no code/runtime/deployed behavior changes are planned.

## Reporting

Use `ai-collaboration/process/report-template.md` and the canonical Codex Completion Summary schema.
