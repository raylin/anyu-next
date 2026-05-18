# Handoff

## Date

2026-05-18

## Task

Rewrite and align the root-level repository documentation so `anyu-next` is clearly framed as the C-stage production foundation for `暗語 ANYU`, while preserving the repo's research, calibration, and legacy prototype context.

## Context

`Repo Foundation Setup v0` created the new production app under `apps/web/`, promoted the design system into `docs/design-system/`, and preserved the Python prototype and research tooling. The main remaining mismatch is documentation: the root README still describes the repo as `Opportunity Radar`.

## Relevant Files

- `README.md`
- `apps/web/README.md`
- `docs/design-system/README.md`
- `experiments/ambiguous_temperature_v0/README.md`
- `ai-collaboration/summaries/summary_log.md`
- `ai-collaboration/research/2026-05-18-repo-foundation-structure-report.md`

## Constraints

- Documentation only
- No folder moves
- No file deletions
- No app behavior changes
- No prompt, schema, token, or prototype behavior changes

## Planned Work

1. Save this handoff.
2. Rewrite the root README around `anyu-next` and the current repo map.
3. Update supporting README files for the production app, design system, and legacy prototype positioning.
4. Generate the required execution report.
5. Append `ai-collaboration/summaries/summary_log.md`.
6. Run the required validation commands.
7. Create a git commit containing the completed handoff changes.
8. End the final CLI response with a paste-back completion summary that includes the commit hash.

## Uncertainties

- The top-level repo contains both production and research/runtime layers; this task will align navigation and positioning, but it will not resolve future architecture decisions such as whether shared design packages should exist later.
