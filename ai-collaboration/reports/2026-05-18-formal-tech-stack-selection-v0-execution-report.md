# Formal Tech Stack Selection v0 Execution Report

## Summary

Created the formal C-stage tech stack selection document. The task is documentation-only and locks the production foundation direction to a Next.js full-stack app with TypeScript strict mode, Vercel deployment, Neon PostgreSQL, Drizzle ORM, and Vitest, while keeping Python research tooling and the current prototype as non-production references.

## Files Created

- `ai-collaboration/handoffs/2026-05-18-formal-tech-stack-selection-v0-handoff.md`
- `ai-collaboration/research/2026-05-18-formal-tech-stack-selection-v0.md`
- `ai-collaboration/reports/2026-05-18-formal-tech-stack-selection-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Stack Decision

Selected:

- `Next.js` full-stack
- `React`
- `TypeScript` strict mode
- `Next.js App Router`
- `Vercel`
- `Neon PostgreSQL` in `ap-southeast-1`
- `Drizzle ORM`
- `Vitest`

## Version Policy

- latest stable versions at initialization
- exact versions pinned through lockfile
- no beta / RC / canary dependencies in the public MVP critical path
- `Auth.js / NextAuth` explicitly excluded from v0 unless future account work begins

## Auth Decision

- no required auth in v0
- anonymous-session model for first public launch
- contact capture only after fake paid unlock click

## Design System Placement Decision

- canonical future design-system home: `docs/design-system/`
- app copy target: `apps/web/src/styles/tokens.css`
- current research and prototype copies remain in place until migration

## Repo Organization Decision

- production web app target: `apps/web/`
- design docs target: `docs/design-system/`
- experiments remain under `experiments/`
- research workflows and collaboration history remain under current repo paths

## Migration Plan

Defined milestone sequence:

1. `Repo Foundation Setup v0`
2. `Module 01 UI Port`
3. `Runtime Integration`
4. `Fake-door Public Launch Readiness`

## Validation Results

- `test -f ai-collaboration/research/2026-05-18-formal-tech-stack-selection-v0.md` passed
- `test -f ai-collaboration/reports/2026-05-18-formal-tech-stack-selection-v0-execution-report.md` passed
- `python3 -m compileall oradar` passed

## Known Technical Debt

- None introduced by this documentation task

## Deviations From Handoff

- None

## Git Commit

- Planned commit message: `docs: select formal C-stage tech stack`

## Remaining Uncertainties

- package manager choice for the upcoming app foundation
- whether existing semi-finished repo assets should be migrated into `apps/web` or treated as reference only
- how much DB persistence and share-card generation should be included before first public launch

## Recommended Next Step

- `Repo Foundation Setup v0`
