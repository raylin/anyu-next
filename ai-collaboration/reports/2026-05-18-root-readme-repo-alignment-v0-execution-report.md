# Root README / Repo Alignment v0 Execution Report

## Summary

Rewrote the root README so the repository is now clearly positioned as `anyu-next`, the C-stage production foundation for `暗語 ANYU`. Updated the production app, design system, and legacy prototype README files so repo navigation is consistent with the current structure: `apps/web/` as the production app foundation, `docs/design-system/` as canonical design docs, and the Python prototype/tooling retained for research and validation.

## Files Updated

- `README.md`
- `apps/web/README.md`
- `docs/design-system/README.md`
- `experiments/ambiguous_temperature_v0/README.md`
- `ai-collaboration/summaries/summary_log.md`
- `ai-collaboration/handoffs/2026-05-18-root-readme-repo-alignment-v0-handoff.md`
- `ai-collaboration/reports/2026-05-18-root-readme-repo-alignment-v0-execution-report.md`

## Repo Positioning Changes

- Replaced the old `Opportunity Radar` framing in the root README with `anyu-next`.
- Documented the dual nature of the repo:
  - production web app foundation
  - research / calibration / prototype assets
- Clarified the current product direction:
  - standalone theme pages first
  - future portal later
  - `曖昧溫度計` as Module 01
- Added a repo map covering production app, design docs, research tooling, outputs, and collaboration artifacts.

## Production App Documentation

- Updated `apps/web/README.md` to state that it is the production Next.js app foundation for `暗語 ANYU`.
- Documented that current routes are skeletons only.
- Added the expected `pnpm` commands for install, dev, lint, test, and build.
- Clarified the token source relationship between `apps/web/src/styles/tokens.css` and `docs/design-system/tokens.css`.

## Design System Documentation

- Confirmed `docs/design-system/README.md` states that canonical design docs live there.
- Clarified that `apps/web/src/styles/tokens.css` is a synced app copy.
- Added a note that a future `packages/design-system` may be considered later, but not yet.

## Legacy Prototype Documentation

- Checked and preserved the legacy status note at the top of `experiments/ambiguous_temperature_v0/README.md`.
- Tightened wording so it clearly says the prototype is not the production frontend foundation.
- Kept the production app pointer to `apps/web/`.

## AI Collaboration Workflow Documentation

- Added workflow guidance to the root README covering:
  - handoff-first execution
  - execution reports
  - summary log updates
  - commit requirement for completed handoffs
  - final paste-back completion summaries

## Validation Results

- `test -f README.md`: passed
- `test -f apps/web/README.md`: passed
- `test -f docs/design-system/README.md`: passed
- `test -f experiments/ambiguous_temperature_v0/README.md`: passed
- `python3 -m compileall oradar`: passed
- `corepack pnpm lint`: passed
- `corepack pnpm test`: passed
- `corepack pnpm build`: passed

## Known Technical Debt

- `apps/web/.gitignore` likely overlaps with the stronger root `.gitignore`; this was left unchanged and should be reviewed in a future cleanup handoff.
- `packages/` remains empty but intentionally workspace-ready.
- The repo still contains both product and research layers at the root, so future documentation or taxonomy cleanup may still be useful after migration planning.

## Deviations From Handoff

- None.

## Git Commit

- Pending final commit at report-write time.

## Remaining Uncertainties

- Whether the root README should later expand into a more detailed contributor/developer guide after Module 01 migration planning is still open.
- Whether a shared `packages/design-system` should eventually replace manual token sync is still an architecture decision for a future task.

## Recommended Next Step

`Module 01 Migration Plan v0`
