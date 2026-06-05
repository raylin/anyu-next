# Module 01 QA Coverage & Release Validation Plan v0 Handoff

## Date

2026-06-05

## Task

Plan a reusable Module 01 QA Coverage & Release Validation Suite that consolidates existing smoke tests, integration checks, Admin API checks, and manual acceptance checkpoints.

## Scope

Planning, inventory, coverage design, documentation, summary, and dashboard update only. No suite implementation in this task.

## Constraints

- Do not enable production runtime or checkout.
- Do not run production payment.
- Do not send Email or LINE messages.
- Do not modify production env.
- Do not apply DB migrations.
- Do not implement Module 02.
- Do not implement Admin CLI.
- Do not implement new Admin API beyond the existing lookup API.
- Do not commit secrets or private data.

## Planned Work

1. Inventory existing QA commands, smoke scripts, and relevant tests.
2. Define validation layers from local tests through production controlled smoke.
3. Map Module 01 journeys to existing coverage and gaps.
4. Recommend a small target command suite.
5. Define release coverage report schema.
6. Fold Admin API staging smoke into staging release validation.
7. Define manual acceptance fields and production gating policy.
8. Document deprecation/cleanup recommendations for one-off smokes and legacy direct DB lookup.
9. Create execution report, update summary/dashboard, validate docs, commit, and push.

## Validation

- docs presence check
- dashboard HTML sanity
- secret/private scan
- `git diff --check`
