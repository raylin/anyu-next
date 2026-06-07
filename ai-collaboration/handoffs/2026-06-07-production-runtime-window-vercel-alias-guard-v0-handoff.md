# Production Runtime Window + Vercel Alias Guard v0 Handoff

Date: 2026-06-07

## Task

Create structured production runtime-window tooling and Vercel alias guard evidence so the next controlled production smoke does not rely on manual flag toggling, ambiguous deploy targets, or stale/mixed deployment validation.

## Shared Policy

Follow:

- `AGENTS.md`
- `ai-collaboration/process/codex-operating-policy.md`
- `ai-collaboration/process/qa-validation-policy.md`
- `ai-collaboration/process/env-mirror-policy.md`
- `ai-collaboration/process/admin-ops-boundary.md`
- `ai-collaboration/process/production-gate-policy.md`
- `ai-collaboration/process/handoff-template.md`

## Scope

- production runtime-window status/plan helper
- Vercel alias guard status
- production preflight integration
- process documentation updates
- tests

## Do Not

- run production payment
- send Email
- send LINE
- enable ads
- enable non-card payment methods
- modify provider credentials
- rotate env secrets
- mutate DB data
- apply migrations
- implement theme UI
- implement Module 02
- use ad hoc heredoc scripts
- commit env files or secrets
- expose env values or value-derived metadata

## Reporting

Report model/effort, timing fields, runtime-window helper result, alias guard status, production-preflight result, skipped gates and why, production untouched confirmation, and next mainline task.

