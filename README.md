# anyu-next

## What This Repo Is

`anyu-next` is the C-stage production foundation for `暗語 ANYU`, an AI-native relationship insight product system.

`暗語 ANYU` is the future mother brand and portal container.

`曖昧溫度計` is the first standalone theme module.

This repository currently contains both:

1. the production web app foundation
2. research, calibration, and prototype assets retained for validation and iteration

## Product Direction

- Standalone theme pages first
- Future portal later
- Weekly / biweekly theme launch cycle
- Production app foundation under `apps/web/`

## Current First MVP

First MVP:

`曖昧溫度計 + 下一句怎麼回`

Free:

- relationship temperature
- insight layer
- share card

Paid hypothesis:

- `解鎖下一句怎麼回 — NT$49`
- fake-door / contact capture first

## Repo Map

| Path | Purpose |
| --- | --- |
| `apps/web/` | production Next.js app foundation |
| `docs/design-system/` | canonical ANYU design system |
| `experiments/ambiguous_temperature_v0/` | legacy local prototype |
| `oradar/` | Python research/runtime package |
| `scripts/` | research, evaluation, calibration scripts |
| `prompts/` | prompt assets |
| `schemas/` | schema assets |
| `outputs/` | synthetic/generated local research outputs |
| `ai-collaboration/` | handoffs, reports, research notes, summary log |

## Production App

`apps/web/` is the production app foundation.

Current stack:

- Next.js `16.2.6`
- React
- TypeScript strict
- App Router
- `pnpm`
- Vitest
- Drizzle / Neon skeleton
- Vercel target

Current scope limits:

- No required auth in v0
- No real payment in v0
- Current routes are skeletons, not full product runtime

## Design System

Design system references:

- `docs/design-system/anyu-design-system-v1.1.md`
- `docs/design-system/ux-flow-v1.1.md`
- `docs/design-system/tokens-v1.1.css`
- `apps/web/src/styles/tokens.css`

`docs/design-system/` is canonical, and v1.1 is now the engineering source of truth.

`apps/web/src/styles/tokens.css` is the synced app import copy.

High-fidelity reference files are preserved under `docs/design-system/reference/v1.1/` and are reference-only, not production imports.

## Research / Calibration Tooling

The Python tooling is intentionally retained for:

- research extraction
- synthetic evaluation
- external Dcard JSON calibration
- offline reports
- prompt evaluation

`oradar/` and `scripts/` are research/evaluation tooling, not the production web app path.

## Legacy Prototype

`experiments/ambiguous_temperature_v0/` is retained as a validation reference.

It is not the production frontend foundation.

The production app now lives under `apps/web/`.

## AI Collaboration Workflow

- Every task starts with a handoff.
- Every task creates an execution report.
- Every task appends `ai-collaboration/summaries/summary_log.md`.
- Every completed handoff should be git committed.
- Every completed handoff should also be pushed to `origin/staging` when validation and safety checks pass.
- Final Codex responses should include the paste-back completion summary.

## Git Commit And Staging Push Rule

Every completed handoff should end with:

1. Run required validation.
2. Confirm `git status --short`.
3. Ensure no secrets, `.env`, raw user data, or unrelated changes are staged.
4. Commit task changes with a clear message.
5. Push the completed commit to the `staging` branch:

   ```bash
   git push origin HEAD:staging
   ```

6. Include both commit hash and push status in the final Codex Completion Summary.

If push is skipped or fails, report the reason clearly and do not claim staging was updated.

## Tech Debt And Cleanup Policy

Codex should not leave obvious technical debt just to reduce implementation effort.

For each handoff:

1. Fix small, obvious, low-risk technical debt when it is inside the task scope.
2. Do not broaden product behavior or architecture without explicit approval.
3. Document new technical debt introduced by the task.
4. Document existing technical debt observed during the task.
5. Document opportunistic cleanup completed.
6. Document deferred cleanup candidates.
7. Recommend follow-up cleanup only when it materially improves maintainability, extensibility, quality, or launch safety.

Small cleanup is encouraged.
Over-design is not.
Silent large refactors are not allowed.

## Local Development

Root-level checks:

```bash
corepack pnpm --version
python3 -m compileall oradar
```

Web app commands:

```bash
cd apps/web
corepack pnpm install
corepack pnpm lint
corepack pnpm test
corepack pnpm build
corepack pnpm dev
```

## Environment Variables

Web app example variables live in:

- `apps/web/.env.example`

Do not commit secrets or local `.env` files.

## Validation Commands

```bash
test -f README.md
test -f apps/web/README.md
test -f docs/design-system/README.md
test -f experiments/ambiguous_temperature_v0/README.md
python3 -m compileall oradar
cd apps/web && corepack pnpm lint
cd apps/web && corepack pnpm test
cd apps/web && corepack pnpm build
```

## What Not To Do

- Do not productionize the Python prototype.
- Do not require auth for v0.
- Do not commit `.env` files.
- Do not store raw relationship text in analytics.
- Do not build Dcard crawler infrastructure into the product path.
- Do not bypass platform access controls.
- Do not move or delete legacy artifacts without explicit handoff.

## Current Status

Repo foundation and Module 01 staging iteration are in progress.

The current UI baseline is being re-aligned to the ANYU Design System v1.1 source of truth.

## Next Milestone

Recommended next milestone:

`Module 01 Staging Real-Device Contrast Check v0`
