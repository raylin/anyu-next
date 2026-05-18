# Module 01 Migration Plan v0 Execution Report

## Summary

Created a planning document for migrating Module 01 — `曖昧溫度計` — from the legacy prototype into `apps/web`. The plan identifies what should be reused, rewritten, deferred, or explicitly excluded from migration, and maps the current prototype flow into a staged Next.js implementation path.

## Files Inspected

- `experiments/ambiguous_temperature_v0/app.py`
- `experiments/ambiguous_temperature_v0/product_runtime.py`
- `experiments/ambiguous_temperature_v0/event_log.py`
- `experiments/ambiguous_temperature_v0/contact_capture.py`
- `experiments/ambiguous_temperature_v0/templates/index.html`
- `experiments/ambiguous_temperature_v0/static/app.js`
- `experiments/ambiguous_temperature_v0/static/styles.css`
- `experiments/ambiguous_temperature_v0/static/tokens.css`
- `experiments/ambiguous_temperature_v0/README.md`
- `oradar/product_runtime.py`
- `oradar/providers.py`
- `prompts/product_result_prompt_v0.md`
- `schemas/product_result_schema_v0.json`
- `apps/web/src/app/`
- `apps/web/src/components/`
- `apps/web/src/content/modules/`
- `apps/web/src/lib/`
- `apps/web/src/styles/`
- `apps/web/src/tests/`

## Files Created

- `ai-collaboration/handoffs/2026-05-18-module-01-migration-plan-v0-handoff.md`
- `ai-collaboration/research/2026-05-18-module-01-migration-plan-v0.md`
- `ai-collaboration/reports/2026-05-18-module-01-migration-plan-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Migration Decisions Captured

- Keep the generic module routing shape already present in `apps/web`.
- Treat the prototype as a product reference and learning source, not a codebase to copy.
- Reuse prompt/schema/design/config concepts.
- Rewrite the UI/runtime/data flow inside the Next.js foundation.
- Defer payment, auth, portal work, OG/share image generation, and advanced automation.

## Reuse / Rewrite / Defer Summary

- Reuse:
  - ANYU tokens and visual hierarchy
  - module config fields
  - prompt and result schema
  - provider abstraction concepts
  - fake-door/contact/event funnel concepts
- Rewrite:
  - UI pages
  - route handlers
  - storage model
  - event model
  - privacy handling
  - runtime wrappers
- Defer:
  - payment
  - auth
  - portal
  - PNG/OG generation
  - advanced PII
  - Dcard automation

## Target Flow Captured

- Captured the intended v0 flow from landing page through analyze, result view, paid unlock click, contact capture, and confirmation.
- Captured the generic route plan:
  - `/m/ambiguous-temperature`
  - `/m/ambiguous-temperature/result/[resultId]`
  - `/api/modules/ambiguous-temperature/analyze`
  - `/api/events`
  - `/api/unlock-intent`
  - `/api/contact`
  - `/api/health`

## Target Architecture Captured

- Proposed target component split between shared ANYU primitives and module-specific components.
- Proposed analyze request/response contract.
- Proposed minimal production table set and event model.
- Captured privacy, retention, share-card, and fake-door contact-capture recommendations.
- Captured staged implementation milestones from UI port through launch readiness.

## Validation Results

- `test -f ai-collaboration/research/2026-05-18-module-01-migration-plan-v0.md`: passed
- `test -f ai-collaboration/reports/2026-05-18-module-01-migration-plan-v0-execution-report.md`: passed
- `python3 -m compileall oradar`: passed
- `corepack pnpm lint`: passed
- `corepack pnpm test`: passed
- `corepack pnpm build`: passed

## Known Technical Debt

- The plan recommends a richer DB/event/privacy model than the current `apps/web` scaffolds provide; implementing that model will require a separate execution handoff.
- The current schema title still references the older Opportunity Radar context, but schema edits are out of scope for this task.
- Current `apps/web` event types and DB schema are placeholders and will need deliberate implementation design.

## Deviations From Handoff

- None.

## Git Commit

- Pending final commit at report-write time.

## Remaining Uncertainties

- Whether result pages should be DB-backed from the first real launch or temporarily allow ephemeral results remains open.
- Whether to store full provider JSON or normalized product result only remains open.
- Whether `raw_input_redacted` should be stored at all in v0 remains open.

## Recommended Next Step

`Module 01 UI Port v0`
