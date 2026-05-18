# Handoff

## Date

2026-05-18

## Task

Set up the `anyu-next` production repo foundation with a new `apps/web` Next.js workspace app, canonical design-system docs, stronger root ignore rules, a legacy/reference note for the existing prototype, and a repo structure report for ChatGPT review.

## Context

The repository was originally structured around local-first research and the `experiments/ambiguous_temperature_v0/` prototype. This handoff establishes the first production-oriented app foundation without porting product runtime behavior, auth, payment, or the full MVP. The prototype remains as a validation reference.

## Relevant Files

- `AGENTS.md`
- `.gitignore`
- `README.md`
- `ai-collaboration/research/design/2026-05-18-anyu-design-system-v1.md`
- `experiments/ambiguous_temperature_v0/static/tokens.css`
- `experiments/ambiguous_temperature_v0/README.md`
- `ai-collaboration/summaries/summary_log.md`

## Constraints

- Local-first
- Markdown-first
- No schema changes without approval
- No auth, payment, portal, or full runtime implementation
- Do not modify prompts, schemas, Dcard calibration scripts, or existing prototype behavior
- Preserve `experiments/ambiguous_temperature_v0/` as legacy/reference

## Planned Work

1. Save this handoff.
2. Create the workspace and `apps/web` foundation with Next.js, TypeScript strict mode, App Router, Vitest, and Drizzle/Neon skeleton files.
3. Promote the ANYU design system into `docs/design-system/` and sync the app token copy.
4. Strengthen `.gitignore` and update the legacy prototype README status note.
5. Generate the repo structure report, execution report, and summary log update.
6. Run relevant validation, then create a git commit containing the completed handoff changes.
7. End the final CLI response with a paste-back completion summary that includes the commit hash.

## Uncertainties

- Next.js scaffolding and `pnpm install` may require network escalation due to sandbox restrictions.
- If generated lint defaults differ from current Next.js stable output, that deviation will be documented in the execution report.
