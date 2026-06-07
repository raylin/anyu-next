# ANYU Ops CLI Auth Config v0 Handoff

Date: 2026-06-07

## Task

Add dedicated ANYU ops credentials under `~/.anyu/credentials.json` so `pnpm ops` authentication is stable without reading app service env mirrors.

## Context

- Production Admin/Ops preflight exists but blocks when `ADMIN_API_TOKEN` is absent from process env.
- Process-env-only auth is too easy to forget.
- Owner approved `~/.anyu/credentials.json` as a dedicated operator credential store.

## Shared Policy

Follow `AGENTS.md` and `ai-collaboration/process/*.md`.

This task-specific handoff only repeats high-risk rules that are directly relevant.

## Scope

- Add Admin CLI token resolver with precedence: process env, credentials file, missing.
- Add `pnpm ops auth status/set-token/logout`.
- Update lookup/config commands to use the resolver.
- Update production Admin/Ops preflight as needed through `pnpm ops`.
- Update docs/tests/report/dashboard/summary.

## Do Not

- Do not open production runtime.
- Do not run payment.
- Do not send Email or LINE.
- Do not read app env mirrors during normal `pnpm ops`.
- Do not add a permanent import-token command.
- Do not add `--token`.
- Do not print token values or token-derived metadata.
- Do not commit credentials or secrets.

## Validation Selection

Run:

- admin-cli tests and typecheck
- app lint/test/build if app scripts/tests are touched
- docs presence, dashboard sanity, secret scan, `git diff --check`
- `qa:production:admin-ops-preflight` only if credentials are available; otherwise run/report expected missing category or skip with reason

## Reporting Requirements

Report credentials path/schema, token resolution behavior, auth commands, migration-helper decision, tests run, preflight status, safety, blockers, and next task.
