# Production Admin/Ops Token Preflight + Smoke Resume Guard v0 Handoff

Date: 2026-06-07

## Task

Add a required read-only production Admin/Ops auth preflight before controlled production smoke can open runtime, create a result, or ask the owner for manual Email/LINE/payment action.

## Context

- Controlled Production Payment Smoke v3 reached owner-visible Email and LINE save success.
- The smoke stopped before provider form/payment because production `pnpm ops` lookup failed with `admin_token_missing`.
- This was a workflow/preflight failure, not an Email/LINE product failure.

## Shared Policy

Follow `AGENTS.md` and `ai-collaboration/process/*.md`.

This task-specific handoff only repeats high-risk rules that are directly relevant.

## Scope

- Add `qa:production:admin-ops-preflight`.
- Keep `pnpm ops` pure: process-env `ADMIN_API_TOKEN` only.
- Update smoke runbook/process docs.
- Add tests and report.

## Do Not

- Do not open production runtime.
- Do not run payment.
- Do not send Email or LINE.
- Do not load `.env.production` into `pnpm ops`.
- Do not use direct DB as fallback for missing Admin token.
- Do not expose token values or token-derived metadata.

## Validation Selection

Run:

- targeted production Admin/Ops preflight tests
- lint, full tests, build
- admin CLI tests/typecheck
- actual `qa:production:admin-ops-preflight` missing-token case if token is absent
- read-only runtime-window status and production-preflight

Skip:

- production smoke/payment/runtime open because this task is guard-only.

## Reporting Requirements

Report model/effort, timing, production token policy, preflight command/result, smoke runbook update, tests/gates run, skipped gates, production untouched confirmation, and next task.
