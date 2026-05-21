# Execution Report: Repo Architecture + MVP Leftover Audit v0

Date: 2026-05-21
Task: Repo Architecture + MVP Leftover Audit v0
Commit: pending at report-write time

## Completed Work

- copied the provided handoff into `ai-collaboration/handoffs/2026-05-21-repo-architecture-mvp-leftover-audit-v0-handoff.md`
- audited the tracked repository structure across app, docs, research, outputs, prototype, and workflow artifacts
- classified active production paths, historical evidence, prototype leftovers, archive candidates, and review-only risk areas
- created the audit report at `ai-collaboration/research/2026-05-21-repo-architecture-mvp-leftover-audit-v0.md`
- appended the canonical summary log

## Architecture Decisions

- kept this pass reporting-only with no code or runtime behavior changes
- used conservative classification; ambiguous cleanup items were marked `NEEDS_HUMAN_REVIEW` instead of delete-ready
- treated the current live product path as `apps/web` plus canonical docs and ops records, with research/prototype assets preserved as history/reference

## Blockers

- none for the audit itself

## Uncertainties

- whether committed raw sample text under `outputs/` remains acceptable to keep in git
- whether `oradar/`, `scripts/`, and `experiments/ambiguous_temperature_v0/` are still intended active research tooling or should later move into a clearer archive/reference boundary
- whether deprecated root markers should remain for continuity or be removed after a cleanup pass

## Suggested Next Steps

- run `Repo Cleanup Pass v0`
- start with indexing and archive-boundary decisions rather than deletion
- keep active app/runtime, current design-system v1.1 docs, legal docs, and launch ops docs untouched
