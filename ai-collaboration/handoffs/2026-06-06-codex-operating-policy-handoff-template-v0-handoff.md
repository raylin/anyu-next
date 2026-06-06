# Codex Operating Policy + Handoff Template v0 Handoff

Date: 2026-06-06

## Task

Create shared Codex operating policy docs and a reusable handoff template so future tasks can reference common rules instead of duplicating them.

## Scope

- Replace/update root `AGENTS.md` with concise ANYU operating rules.
- Add detailed process docs under `ai-collaboration/process/`.
- Add a reusable handoff template.
- Update dashboard and summary log references.
- Create execution report.

## Constraints

- Documentation/process only.
- Do not modify runtime UI.
- Do not modify payment behavior.
- Do not modify Vercel env or local env files.
- Do not run production payment.
- Do not send Email or LINE.
- Do not apply DB migrations.
- Do not implement Module 02.
- Do not commit secrets/private data.

## Validation Intent

- docs presence check
- dashboard HTML sanity
- secret/private scan
- `git diff --check`

## Timing

- taskStartedAt: `2026-06-06T15:02:29Z`
- taskCompletedAt: `2026-06-06T15:07:32Z`
- totalWallClockDuration: `5m03s`
- humanWaitDuration: `0m`
- netCodexWorkDuration: `5m03s`
