# ANYU Operating Policy Consolidation v1 Handoff

Date: 2026-06-07

## Task

Consolidate ANYU operating policy into a smaller set of top-level principles, reduce duplicate process wording, clarify rule precedence, and update report/dashboard/summary artifacts.

## Context

- Recent work accumulated repeated env, QA, production, Admin/Ops, runtime config, and report-format rules.
- Owner feedback: fewer higher-priority principles are needed so Codex does not get confused by overlapping task-level rules.
- This is process/docs cleanup only.

## Shared Policy

Follow `AGENTS.md` and `ai-collaboration/process/*.md`.

This task-specific handoff only repeats directly relevant hard constraints.

## Scope

- Update `AGENTS.md` with six concise top-level principles.
- Refactor process docs to reference the principles and reduce duplication without removing concrete hard rules.
- Update handoff template guidance.
- Update summary/dashboard and create the canonical report.

## Do Not

- Modify runtime/product code.
- Modify payment, runtime config, Vercel env, DB schema, or provider behavior.
- Run production payment, real Email, or real LINE.
- Rewrite historical reports broadly.
- Commit secrets/private data.

## Validation

Run docs-only checks:

- docs presence check
- dashboard HTML sanity
- secret/private scan
- `git diff --check`

## Reporting

Use `ai-collaboration/process/report-template.md` and canonical completion summary.
