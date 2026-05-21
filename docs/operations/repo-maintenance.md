# Repo Maintenance Guide v0

Date: 2026-05-21

## Purpose

This document defines the current active vs historical boundaries for conservative repo cleanup.

## Active Product Path

Treat these as active and do not move or delete without a scoped handoff:

- `apps/web/`
- `docs/legal/`
- `docs/operations/production-deployment-runbook.md`
- `docs/design-system/` current v1.1 canonical docs and brand assets
- `ai-collaboration/templates/`
- `ai-collaboration/decisions/`
- `ai-collaboration/summaries/summary_log.md`

## Historical / Reference Path

These remain valuable, but are not the active production runtime:

- `experiments/ambiguous_temperature_v0/`
- `oradar/`
- `scripts/`
- `docs/design-system/reference/`
- historical `ai-collaboration/handoffs/`, `reports/`, and most `research/`

## Raw Output Policy

Committed raw text fixtures are not part of the active production path.

Current policy:

- keep structured or generated historical evidence only when it remains useful
- keep raw sample or evaluation text local-only unless a future handoff explicitly approves committed fixtures
- use `.gitkeep` or metadata-only files when a folder boundary should remain visible

## Cleanup Priority

When running future cleanup:

1. index and label history first
2. preserve app/runtime and canonical docs
3. review privacy-sensitive raw assets before deleting broader historical evidence
4. archive or extract legacy tooling only after human review
